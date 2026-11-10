import { demoChannels, instrumentsForEquipment, readingsForInstrument } from '@/data/demo';
import type { Device, Instrument, InstrumentReading } from '@/types';

export interface EquipmentCapability {
  instrument: Instrument;
  readings: InstrumentReading[];
}

// Reuse the same per-unit instrument registry as Device; never infer channels.
export function equipmentCapabilities(device: Device, equipmentId: string): EquipmentCapability[] {
  return instrumentsForEquipment(device.id, equipmentId).map(instrument => ({
    instrument,
    readings: readingsForInstrument(device, instrument.tag),
  }));
}
export function isDigitalReading(reading: InstrumentReading, valueType?: Instrument['valueType']): boolean {
  return valueType === 'digital' || typeof reading.value === 'boolean' ||
    (demoChannels[reading.tag] ?? []).some(channel => channel.id === reading.channel && typeof channel.normal === 'boolean');
}

export function capabilityVisual(reading: InstrumentReading) {
  const available = reading.quality === 'simulated' && reading.value !== null;
  const fraction = available && typeof reading.value === 'number' && Number.isFinite(reading.value) && typeof reading.max === 'number' && reading.max > 0
    ? Math.max(0, Math.min(1, reading.value / reading.max)) : 0;
  return { available, fraction, color: available ? '#2563eb' : '#94a3b8' };
}

// Labels describe the signal, not a verified healthy/unsafe machine condition.
export function digitalStatus(tag: string, channel: string | undefined, active: boolean): string {
  const states: Record<string, [string, string]> = {
    low: ['Level rendah', 'Tidak rendah'],
    running: ['Berjalan', 'Berhenti'],
    closed: ['Tertutup', 'Terbuka'],
    trip: ['Trip aktif', 'Trip tidak aktif'],
    pressed: ['Ditekan', 'Tidak ditekan'],
    inside: ['Di dalam', 'Di luar'],
    present: ['Terdeteksi', 'Tidak terdeteksi'],
    fault: ['Gangguan aktif', 'Gangguan tidak aktif'],
    normal: ['Normal (demo)', 'Tidak normal (demo)'],
  };
  const labels = tag === 'SIR-01' ? ['Sirine aktif', 'Sirine tidak aktif'] : states[channel ?? (tag.startsWith('LSL-') ? 'low' : '')];
  return labels ? labels[active ? 0 : 1] : active ? 'Aktif' : 'Tidak aktif';
}

export function digitalAttention(reading: InstrumentReading): boolean {
  return reading.quality === 'simulated' && reading.value === true &&
    (['low', 'trip', 'pressed', 'fault'].includes(reading.channel ?? '') || reading.tag === 'SIR-01');
}

export function capabilityStatus(reading: InstrumentReading): string {
  if (reading.quality === 'offline') return 'Unit offline';
  if (reading.quality !== 'simulated' || reading.value === null) return 'Belum ada data';
  if (typeof reading.value === 'boolean') return digitalStatus(reading.tag, reading.channel, reading.value);
  return String(reading.value);
}
