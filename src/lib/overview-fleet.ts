import { archiveWindow, DEMO_NOW, demoChannelReading, demoChannels, readingsForInstrument } from '@/data/demo';
import type { Device } from '@/types';

export const fleetColors = ['#38bdf8', '#fbbf24', '#34d399', '#a78bfa'];
export function outputValue(device: Device, channel: 'current' | 'power'): number | null {
  const reading = readingsForInstrument(device, 'PM-01').find(r => r.channel === channel);
  return reading?.quality === 'simulated' && typeof reading.value === 'number' ? reading.value : null;
}
export function fleetTotal(devices: Device[]) {
  const values = devices.map(device => outputValue(device, 'power'));
  const available = values.filter((value): value is number => value !== null);
  return { value: available.length ? available.reduce((sum, value) => sum + value, 0) : null, complete: available.length === values.length, available: available.length };
}
export function fleetHistory(devices: Device[]) {
  const archives = devices.map(device => archiveWindow(device.id, 1));
  return archives[0]?.map((sample, index) => {
    const row: Record<string, number | string | null> = { timestamp: sample.timestamp, time: new Date(sample.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }) };
    devices.forEach((device, unit) => {
      row[`${device.id}-voltage`] = archives[unit][index]?.voltage ?? null;
      for (const channel of demoChannels['PM-01']) {
        const reading = demoChannelReading(device, 'PM-01', channel, sample.timestamp);
        row[`${device.id}-${channel.id}`] = typeof reading.value === 'number' ? reading.value : null;
      }
    });
    return row;
  }) ?? [];
}

// Presentation-only fixtures, independent of PM-01 output and the LSL switches.
// Values/ranges are not equipment ratings, PLC tags, or a power balance.
export const internalPowerDefinitions = [
  { id: 'bldc', name: 'BLDC', normal: 2.4, max: 5 },
  { id: 'motor', name: 'Motor AC 2', normal: 4.2, max: 10 },
  { id: 'motor3', name: 'Motor 3', normal: 3.6, max: 10 },
  { id: 'motor6', name: 'Motor 6', normal: 3.1, max: 10 },
  { id: 'pump', name: 'Pompa oli', normal: 0.75, max: 2 },
  { id: 'ventilation', name: 'Ventilasi', normal: 0.45, max: 2 },
];
export function internalPower(device: Device, normal: number) {
  return !device.online ? null : device.status === 'standby' ? 0 : device.status === 'running' ? normal : null;
}
export function oilLevel(device: Device, tank: 'oil19' | 'oil20') {
  return !device.online ? null : tank === 'oil19' ? 80 : 65;
}
export const overviewSnapshot = DEMO_NOW;
export function validLocalTargets(value: unknown): value is Record<string, number> {
  return !!value && typeof value === 'object' && !Array.isArray(value) && Object.entries(value).every(([key, target]) => /^GEN-\d{3}:oil(?:19|20)$/.test(key) && typeof target === 'number' && Number.isFinite(target) && target >= 0 && target <= 100);
}

export const overviewProvenance = 'Data ilustratif lokal · daya internal dan level oli adalah asumsi, bukan sensor terverifikasi. Rentang gauge bukan rating atau batas aman.';
export const localTargetKey = (deviceId: string, tank: string) => `${deviceId}:${tank}`;
