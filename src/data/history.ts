import { archiveWindow, ARCHIVE_DAYS } from './demo';
import type { Parameter } from '@/types';

export const historyParameters: Parameter[] = ['rpm', 'voltage', 'frequency', 'motorTemperature', 'roomTemperature', 'bldcTemperature'];
export type HistoryRange = '1H' | '6H' | '24H' | '7D' | 'ALL';
export interface HistoryPoint { time: string; value: number | null }
export function historyDataset(deviceId: string, range: HistoryRange): Record<Parameter, HistoryPoint[]> {
  const hours = { '1H': 1, '6H': 6, '24H': 24, '7D': 168, ALL: ARCHIVE_DAYS * 24 }[range];
  const samples = archiveWindow(deviceId, hours);
  return Object.fromEntries(historyParameters.map(p => [p, samples.map(s => ({
    time: s.timestamp, value: typeof s[p] === 'number' && Number.isFinite(s[p]) ? s[p] : null,
  }))])) as Record<Parameter, HistoryPoint[]>;
}
export function historySeries(deviceId: string, parameter: Parameter, range: HistoryRange): HistoryPoint[] {
  return historyDataset(deviceId, range)[parameter];
}
export function historyStats(points: HistoryPoint[]) {
  let count = 0, sum = 0, min = Infinity, max = -Infinity;
  for (const { value } of points) if (typeof value === 'number' && Number.isFinite(value)) {
    count++; sum += value; min = Math.min(min, value); max = Math.max(max, value);
  }
  return { count, min: count ? min : null, max: count ? max : null, average: count ? sum / count : null };
}

// Timestamp union prevents silently aligning unrelated samples by array index.
export function alignHistory(selected: Parameter[], series: Partial<Record<Parameter, HistoryPoint[]>>) {
  const rows = new Map<string, { time: string } & Partial<Record<Parameter, number | null>>>();
  for (const p of selected) for (const point of series[p] ?? []) {
    if (!Number.isFinite(Date.parse(point.time))) continue;
    const row = rows.get(point.time) ?? { time: point.time };
    row[p] = point.value; rows.set(point.time, row);
  }
  return [...rows.values()].sort((a, b) => Date.parse(a.time) - Date.parse(b.time));
}

// Keep bucket extrema and null boundaries. Statistics always use raw samples.
export function historyDisplayIndices(rows: ({ time: string } & Partial<Record<Parameter, number | null>>)[], selected: Parameter[], budget = 800) {
  if (rows.length <= budget) return rows.map((_, i) => i);
  const kept = new Set<number>([0, rows.length - 1]);
  const size = Math.ceil(rows.length / Math.max(1, Math.floor(budget / (selected.length * 2 + 2))));
  for (let start = 0; start < rows.length; start += size) {
    for (const p of selected) {
      let min = -1, max = -1;
      for (let i = start; i < Math.min(rows.length, start + size); i++) {
        const value = rows[i][p];
        if (value == null) {
          if (i === 0 || rows[i - 1][p] != null) { kept.add(Math.max(0, i - 1)); kept.add(i); }
          if (i + 1 < rows.length && rows[i + 1][p] != null) { kept.add(i); kept.add(i + 1); }
        } else {
          if (min < 0 || value < rows[min][p]!) min = i;
          if (max < 0 || value > rows[max][p]!) max = i;
        }
      }
      if (min >= 0) kept.add(min);
      if (max >= 0) kept.add(max);
    }
  }
  return [...kept].sort((a, b) => a - b);
}
