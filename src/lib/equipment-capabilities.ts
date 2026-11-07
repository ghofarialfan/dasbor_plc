import { instrumentsForEquipment, readingsForInstrument } from '@/data/demo';
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
export function capabilityVisual(reading: InstrumentReading) {
  const available = reading.quality === 'simulated' && reading.value !== null;
  const fraction = available && typeof reading.value === 'number' && Number.isFinite(reading.value) && typeof reading.max === 'number' && reading.max > 0
    ? Math.max(0, Math.min(1, reading.value / reading.max)) : 0;
  return { available, fraction, color: available ? '#2563eb' : '#94a3b8' };
}

export function capabilityStatus(reading: InstrumentReading): string {
  if (reading.quality === 'offline') return 'Unit offline';
  if (reading.quality !== 'simulated' || reading.value === null) return 'Belum ada data';
  if (typeof reading.value === 'boolean') return reading.value ? 'Aktif' : 'Tidak aktif';
  return String(reading.value);
}
