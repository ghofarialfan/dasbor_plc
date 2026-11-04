import { devices, parameters, alarms } from '@/data/demo';
import type { GaugeWidgetConfig, SupportTicket } from '@/types';
export const ticketCategories = ['Pemeliharaan', 'Dokumentasi', 'Keselamatan', 'Umum'];
export function isWidgetArray(v: unknown): v is GaugeWidgetConfig[] {
  return Array.isArray(v) && v.length <= 50 && new Set(v.map(w => w?.id)).size === v.length && v.every(w =>
    w && typeof w.id === 'string' && devices.some(d => d.id === w.deviceId) &&
    Object.hasOwn(parameters, w.parameter) && typeof w.title === 'string' && w.title.length <= 120);
}
export function isTicketArray(v: unknown): v is SupportTicket[] {
  return Array.isArray(v) && v.length <= 200 && v.every(t => t && typeof t.id === 'string' &&
    typeof t.title === 'string' && t.title.trim().length > 0 && t.title.length <= 120 &&
    typeof t.description === 'string' && t.description.trim().length > 0 && t.description.length <= 2000 &&
    devices.some(d => d.id === t.unit) && ticketCategories.includes(t.category) &&
    ['open', 'resolved'].includes(t.status) && typeof t.createdAt === 'string' && Number.isFinite(Date.parse(t.createdAt)) &&
    (t.relatedAlarm === undefined || alarms.some(a => a.id === t.relatedAlarm && a.deviceId === t.unit)));
}
