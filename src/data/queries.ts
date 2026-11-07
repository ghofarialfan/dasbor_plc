import { devicesForSite, archiveWindow, parameters, archivedQuality, ARCHIVE_DAYS } from './demo';
import type { Device, DataQuality } from '@/types';
export const trendParameters = ['rpm', 'voltage', 'frequency', 'motorTemperature', 'roomTemperature', 'bldcTemperature'] as const;
export type TrendParameter = typeof trendParameters[number];
export interface TelemetryRow { time: string; unit: string; tag: string; parameter: TrendParameter; value: number | null; unitLabel: string; quality: DataQuality }
export function filterDevices(site: string, query = '', status = 'all') {
  const q = query.trim().toLowerCase();
  return devicesForSite(site).filter(d => (!q || [d.id, d.name, d.location].some(s => s.toLowerCase().includes(q))) &&
    (status === 'all' || (status === 'offline' ? !d.online : d.online && d.status === status)));
}
export function telemetryRows(list: Device[], hours: number): TelemetryRow[] {
  return list.flatMap(d => archiveWindow(d.id, hours).flatMap(s => trendParameters.map(p => ({
    time: s.timestamp, unit: d.id, tag: parameters[p].tag, parameter: p, value: s[p],
    unitLabel: parameters[p].unit, quality: archivedQuality(s[p]),
  }))));
}
// Scan one unit window at a time. Only one page is materialized as row objects.
export function telemetryPage(list: Device[], hours: number, parameter: TrendParameter | 'all', page: number, pageSize = 50) {
  const channels = parameter === 'all' ? trendParameters : [parameter];
  const count = Math.min(ARCHIVE_DAYS * 24 * 12 + 1, Math.floor(Math.max(0, hours) * 12) + 1);
  const total = list.length * channels.length * count;
  const safePage = Math.min(Math.max(1, page), Math.max(1, Math.ceil(total / pageSize)));
  const start = (safePage - 1) * pageSize;
  const rows: TelemetryRow[] = [];
  const cache = new Map<string, ReturnType<typeof archiveWindow>>();
  for (let index = start; index < Math.min(total, start + pageSize); index++) {
    const d = list[Math.floor(index / (count * channels.length))];
    if (!cache.has(d.id)) cache.set(d.id, archiveWindow(d.id, hours));
    const local = index % (count * channels.length);
    const s = cache.get(d.id)![Math.floor(local / channels.length)];
    const p = channels[local % channels.length];
    rows.push({ time: s.timestamp, unit: d.id, tag: parameters[p].tag, parameter: p, value: s[p], unitLabel: parameters[p].unit, quality: archivedQuality(s[p]) });
  }
  return { rows, total, page: safePage };
}
export function chartSeries(device: Device, parameter: TrendParameter, hours: number) {
  const samples = archiveWindow(device.id, hours);
  const bucket = hours >= 168 ? 288 : hours >= 24 ? 12 : 1;
  if (bucket === 1) return samples.map(s => ({ time: s.timestamp, value: s[parameter] }));
  // Non-overlapping right-closed buckets; first boundary is excluded.
  const window = samples.slice(1);
  return Array.from({ length: hours * 12 / bucket }, (_, i) => {
    const group = window.slice(i * bucket, (i + 1) * bucket);
    const values = group.map(s => s[parameter]).filter((v): v is number => v !== null);
    return { time: group.at(-1)!.timestamp, value: values.length ? Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)) : null };
  });
}
