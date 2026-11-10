import type { Device } from '@/types';

export const deviceStatusDefinitions = {
  running: { animated: true, label: 'Running', className: 'bg-emerald-50 text-emerald-700 dark:bg-success-soft dark:text-success', description: 'Unit beroperasi; bukan konfirmasi semua komponen normal.' },
  standby: { label: 'Standby', className: 'bg-amber-50 text-amber-700 dark:bg-warning-soft dark:text-warning', description: 'Unit terhubung dalam kondisi siaga, bukan sedang beroperasi.' },
  unknown: { label: 'Tidak diketahui', className: 'bg-slate-100 text-slate-600 dark:bg-surface-hover dark:text-muted', description: 'Status operasi unit belum diketahui.' },
  offline: { label: 'Offline', className: 'bg-slate-100 text-slate-600 dark:bg-surface-hover dark:text-muted', description: 'Koneksi terputus; status operasi terakhir tidak terkonfirmasi.' },
} as const;

export function deviceStatusKey(device: Pick<Device, 'online' | 'status'>): keyof typeof deviceStatusDefinitions {
  return device.online ? device.status : 'offline';
}

export function deviceStatus(device: Pick<Device, 'online' | 'status'>) {
  return deviceStatusDefinitions[deviceStatusKey(device)];
}

export function shouldAnimateDeviceStatus(device: Pick<Device, 'online' | 'status'>, animated = true): boolean {
  const status = deviceStatus(device);
  return animated && 'animated' in status && status.animated;
}
