import { devices } from '@/data/demo';
import type { Parameter } from '@/types';

// Explicit UI scenario limits; these are not equipment ratings or PLC write limits.
export const targetDefinitions: Record<Parameter, { min: number; max: number; step: number }> = {
  rpm: { min: 0, max: 1000, step: 1 },
  voltage: { min: 0, max: 500, step: 1 },
  frequency: { min: 0, max: 60, step: 0.1 },
  motorTemperature: { min: 0, max: 60, step: 0.1 },
  roomTemperature: { min: 0, max: 50, step: 0.1 },
  bldcTemperature: { min: 0, max: 60, step: 0.1 },
};
export interface TargetChange { deviceId: string; parameter: Parameter; before: number | null; after: number; timestamp: string }
export interface TargetStore { settings: Record<string, Partial<Record<Parameter, number>>>; history: TargetChange[] }
export const emptyTargets = (): TargetStore => ({ settings: {}, history: [] });
const validDevice = (id: string) => devices.some(d => d.id === id);
export function isTarget(parameter: string, value: unknown): value is number {
  if (!Object.hasOwn(targetDefinitions, parameter) || typeof value !== 'number' || !Number.isFinite(value)) return false;
  const { min, max, step } = targetDefinitions[parameter as Parameter];
  return value >= min && value <= max && Math.abs(value / step - Math.round(value / step)) < 1e-8;
}
export function isTargetStore(value: unknown): value is TargetStore {
  if (!value || typeof value !== 'object') return false;
  const v = value as TargetStore;
  return !!v.settings && typeof v.settings === 'object' && !Array.isArray(v.settings) && Object.entries(v.settings).every(([id, s]) => validDevice(id) && s && typeof s === 'object' && !Array.isArray(s) && Object.entries(s).every(([p, n]) => isTarget(p, n))) && Array.isArray(v.history) && v.history.length <= 100 && v.history.every(h => h && validDevice(h.deviceId) && isTarget(h.parameter, h.after) && (h.before === null || isTarget(h.parameter, h.before)) && typeof h.timestamp === 'string' && Number.isFinite(Date.parse(h.timestamp)));
}
export function applyTarget(store: TargetStore, deviceId: string, online: boolean, parameter: Parameter, value: number, timestamp: string): TargetStore | null {
  if (!validDevice(deviceId) || !online || !isTarget(parameter, value) || !Number.isFinite(Date.parse(timestamp))) return null;
  const before = store.settings[deviceId]?.[parameter] ?? null;
  if (before === value) return null;
  return { settings: { ...store.settings, [deviceId]: { ...store.settings[deviceId], [parameter]: value } }, history: [{ deviceId, parameter, before, after: value, timestamp }, ...store.history].slice(0, 100) };
}

export function seedTargets(): TargetStore {
  let store = emptyTargets();
  for (const d of devices.filter(d => d.online).slice(4, 10)) {
    store = applyTarget(store, d.id, true, 'rpm', 520, d.lastSeen) ?? store;
  }
  return store;
}
