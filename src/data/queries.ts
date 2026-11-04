import { devicesForSite, trends, parameters, parameterQuality } from './demo';
import type { Device, DataQuality } from '@/types';
export const trendParameters = ['rpm', 'voltage', 'frequency', 'motorTemperature'] as const;
export type TrendParameter = typeof trendParameters[number];
export interface TelemetryRow { time: string; unit: string; tag: string; parameter: TrendParameter; value: number | null; unitLabel: string; quality: DataQuality }
export function filterDevices(site: string, query = '', status = 'all') {
  const q = query.trim().toLowerCase();
  return devicesForSite(site).filter(d => (!q || [d.id, d.name, d.location].some(s => s.toLowerCase().includes(q))) &&
    (status === 'all' || (status === 'offline' ? !d.online : d.online && d.status === status)));
}
export function telemetryRows(list: Device[], hours: number): TelemetryRow[] {
  return list.flatMap(d => trends[d.id].slice(-(hours * 12 + 1)).flatMap(s => trendParameters.map(p => ({
    time: s.timestamp, unit: d.id, tag: parameters[p].tag, parameter: p, value: d.online ? s[p] : null,
    unitLabel: parameters[p].unit, quality: parameterQuality(d, p),
  }))));
}
export function chartSeries(device: Device, parameter: TrendParameter, hours: number) {
  const samples = trends[device.id].slice(-(hours * 12 + 1));
  const bucket = hours >= 168 ? 288 : hours >= 24 ? 12 : 1;
  if (bucket === 1) return samples.map(s => ({ time: s.timestamp, value: device.online ? s[parameter] : null }));
  // Non-overlapping right-closed buckets; first boundary is excluded.
  const window = samples.slice(1);
  return Array.from({ length: hours * 12 / bucket }, (_, i) => {
    const group = window.slice(i * bucket, (i + 1) * bucket);
    const values = group.map(s => s[parameter]).filter((v): v is number => v !== null);
    return { time: group.at(-1)!.timestamp, value: device.online && values.length ? Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)) : null };
  });
}
