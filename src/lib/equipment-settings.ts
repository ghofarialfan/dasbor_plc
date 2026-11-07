import { equipmentDefinitions, devices } from '@/data/demo';
import type { Parameter } from '@/types';

export interface ScenarioDefinition { label: string; options: readonly string[] }
const condition: ScenarioDefinition = { label: 'Kondisi skenario', options: ['Normal', 'Perlu pemeriksaan', 'Dalam pemeliharaan'] };
const definitions: Record<string, ScenarioDefinition> = {
  breaker: { label: 'Posisi skenario breaker', options: ['Terbuka', 'Tertutup', 'Trip'] },
  estop: { label: 'Indikator skenario emergency stop', options: ['Tidak ditekan', 'Ditekan'] },
  prt: { label: 'Indikator skenario proteksi', options: ['Normal', 'Trip'] },
  spd: { label: 'Indikator skenario SPD', options: ['Normal', 'Gangguan'] },
  oil19: { label: 'Indikator skenario low-level', options: ['Tidak aktif', 'Aktif'] },
  oil20: { label: 'Indikator skenario low-level', options: ['Tidak aktif', 'Aktif'] },
  pump: { label: 'Status skenario pompa', options: ['Berhenti', 'Berjalan'] },
  ventilation: { label: 'Status skenario ventilasi', options: ['Berhenti', 'Berjalan'] },
  siren: { label: 'Status skenario sirine', options: ['Tidak aktif', 'Aktif'] },
  dongle: { label: 'Indikator skenario kunci', options: ['Terdeteksi', 'Tidak terdeteksi'] },
};
export const equipmentScenarios: Record<string, ScenarioDefinition> = Object.fromEntries(equipmentDefinitions.map(e => [e.id, definitions[e.id] ?? condition]));
// Only existing telemetry channels are linked; no inferred RPM per motor or gearbox.
export const equipmentParameters: Record<string, Parameter[]> = {
  motor: ['motorTemperature'], bldc: ['bldcTemperature'], 'shaft-train': ['rpm'], output: ['voltage', 'frequency'], ventilation: ['roomTemperature'],
};
export interface EquipmentChange { deviceId: string; equipmentId: string; before: string | null; after: string; timestamp: string }
export interface EquipmentStore { settings: Record<string, Record<string, string>>; history: EquipmentChange[] }
export const emptyEquipmentSettings = (): EquipmentStore => ({ settings: {}, history: [] });
const validDevice = (id: string) => devices.some(d => d.id === id);
export function isScenario(equipmentId: string, value: unknown): value is string {
  return Object.hasOwn(equipmentScenarios, equipmentId) && typeof value === 'string' && equipmentScenarios[equipmentId].options.includes(value);
}
export function isEquipmentStore(value: unknown): value is EquipmentStore {
  if (!value || typeof value !== 'object') return false;
  const v = value as EquipmentStore;
  return !!v.settings && typeof v.settings === 'object' && !Array.isArray(v.settings) && Object.entries(v.settings).every(([id, s]) => validDevice(id) && s && typeof s === 'object' && !Array.isArray(s) && Object.entries(s).every(([e, n]) => isScenario(e, n))) && Array.isArray(v.history) && v.history.length <= 100 && v.history.every(h => h && validDevice(h.deviceId) && isScenario(h.equipmentId, h.after) && (h.before === null || isScenario(h.equipmentId, h.before)) && typeof h.timestamp === 'string' && Number.isFinite(Date.parse(h.timestamp)));
}
export function applyEquipmentScenario(store: EquipmentStore, deviceId: string, online: boolean, equipmentId: string, value: string, timestamp: string): EquipmentStore | null {
  if (!validDevice(deviceId) || !online || !isScenario(equipmentId, value) || !Number.isFinite(Date.parse(timestamp))) return null;
  const before = store.settings[deviceId]?.[equipmentId] ?? null;
  if (before === value) return null;
  return { settings: { ...store.settings, [deviceId]: { ...store.settings[deviceId], [equipmentId]: value } }, history: [{ deviceId, equipmentId, before, after: value, timestamp }, ...store.history].slice(0, 100) };
}

export function seedEquipmentSettings(): EquipmentStore {
  let store = emptyEquipmentSettings();
  for (const d of devices.filter(d => d.online).slice(4, 10)) {
    for (const [id, definition] of Object.entries(equipmentScenarios)) {
      store = applyEquipmentScenario(store, d.id, true, id, definition.options[0], d.lastSeen) ?? store;
    }
  }
  return store;
}
