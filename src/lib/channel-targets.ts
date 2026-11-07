import { demoChannels, devices, instruments } from '@/data/demo';

export type ChannelValue = number | boolean;
export interface ChannelChange { deviceId: string; tag: string; channel: string; before: ChannelValue | null; after: ChannelValue; timestamp: string }
export interface ChannelStore { settings: Record<string, Record<string, ChannelValue>>; history: ChannelChange[] }
export const emptyChannelTargets = (): ChannelStore => ({ settings: {}, history: [] });
export const channelKey = (tag: string, channel: string) => `${tag}/${channel}`;
export function channelDefinition(deviceId: string, tag: string, channel: string) {
  if (!instruments.some(i => i.deviceId === deviceId && i.tag === tag)) return undefined;
  return demoChannels[tag]?.find(c => c.id === channel);
}
export function isChannelValue(deviceId: string, tag: string, channel: string, value: unknown): value is ChannelValue {
  const definition = channelDefinition(deviceId, tag, channel);
  if (!definition) return false;
  if (typeof definition.normal === 'boolean') return typeof value === 'boolean';
  return typeof value === 'number' && Number.isFinite(value) && definition.max !== undefined && value >= 0 && value <= definition.max && Math.abs(value * 100 - Math.round(value * 100)) < 1e-8;
}
export function isChannelStore(value: unknown): value is ChannelStore {
  if (!value || typeof value !== 'object') return false;
  const v = value as ChannelStore;
  return !!v.settings && typeof v.settings === 'object' && !Array.isArray(v.settings) && Object.entries(v.settings).every(([id, settings]) => devices.some(d => d.id === id) && settings && typeof settings === 'object' && !Array.isArray(settings) && Object.entries(settings).every(([key, target]) => {
    const [tag, channel, extra] = key.split('/');
    return extra === undefined && isChannelValue(id, tag, channel, target);
  })) && Array.isArray(v.history) && v.history.length <= 100 && v.history.every(h => h && isChannelValue(h.deviceId, h.tag, h.channel, h.after) && (h.before === null || isChannelValue(h.deviceId, h.tag, h.channel, h.before)) && typeof h.timestamp === 'string' && Number.isFinite(Date.parse(h.timestamp)));
}
export function applyChannelTarget(store: ChannelStore, deviceId: string, tag: string, channel: string, value: ChannelValue, timestamp: string): ChannelStore | null {
  if (!devices.some(d => d.id === deviceId && d.online) || !isChannelValue(deviceId, tag, channel, value) || !Number.isFinite(Date.parse(timestamp))) return null;
  const key = channelKey(tag, channel);
  const before = store.settings[deviceId]?.[key] ?? null;
  if (before === value) return null;
  return { settings: { ...store.settings, [deviceId]: { ...store.settings[deviceId], [key]: value } }, history: [{ deviceId, tag, channel, before, after: value, timestamp }, ...store.history].slice(0, 100) };
}
export const formatChannelValue = (value: ChannelValue | null | undefined) => value == null ? 'Belum diatur' : typeof value === 'boolean' ? value ? 'Aktif / true' : 'Tidak aktif / false' : String(value);
