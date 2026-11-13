import { Link } from 'react-router-dom';
import { useDemo } from '@/context/demo-context';
import { DEMO_NOW } from '@/data/demo';
import { dateTime } from '@/lib/utils';
import { overviewEquipmentGroups } from '@/lib/overview-dashboard';
import { FleetOutput } from '@/components/overview/fleet-output';
import { FleetMachines } from '@/components/overview/fleet-machines';
import { InternalEnvironment } from '@/components/overview/internal-environment';
import { OilMonitoring } from '@/components/overview/oil-monitoring';
import { StatusBadge, WarningBadge } from '@/components/shared';

import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { DashboardMedia } from '@/components/overview/dashboard-media';

export function Overview() {
  const { device, filteredDevices, selectDevice, filteredAlarms, filteredActivities } = useDemo();
  const groups = overviewEquipmentGroups(device);
  const alarms = filteredAlarms.filter(alarm => alarm.deviceId === device.id);
  const activities = filteredActivities.filter(activity => activity.deviceId === device.id);
  const warning = alarms.some(alarm => alarm.severity === 'warning');
  return <div className="overview-dashboard">
    <header className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-white dark:bg-surface px-3 py-2">
      <div className="flex flex-wrap items-center gap-3"><h1 className="text-lg font-semibold">Overview</h1>
        <label className="text-[10px] font-medium">Generator <select id="overview-generator" value={device.id} onChange={event => selectDevice(event.target.value)} className="ml-1 max-w-full rounded border border-border bg-white dark:bg-surface p-1.5 text-xs">{filteredDevices.map(unit => <option key={unit.id} value={unit.id}>{unit.id} · {unit.name}</option>)}</select></label>
        <StatusBadge device={device} animated />{warning && <WarningBadge />}
      </div>
      <div className="text-[10px] text-muted"><p>{device.location} · {groups.reduce((sum, group) => sum + group.count, 0)} pembacaan</p><p>Snapshot: {dateTime(DEMO_NOW)} · Last seen: {dateTime(device.lastSeen)}</p></div>
    </header>
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-white dark:bg-surface px-3 py-1.5 text-[10px]">
      <Dialog><DialogTrigger asChild><button className={`rounded px-2 py-1 font-semibold ${alarms.length ? 'bg-amber-50 dark:bg-warning-soft text-amber-800 dark:text-warning' : 'bg-slate-50 dark:bg-surface-soft text-slate-600 dark:text-muted'}`}>{alarms.length} alarm unit aktif · Aktivitas / detail</button></DialogTrigger><DialogContent><DialogTitle className="font-semibold">Alarm &amp; aktivitas · {device.id}</DialogTitle><DialogDescription className="mt-2 text-xs text-muted">Hanya genset aktif. Notifikasi seluruh site tersedia di lonceng aplikasi.</DialogDescription><h2 className="mb-2 mt-4 text-sm font-semibold">Alarm aktif</h2>{alarms.length ? alarms.map(alarm => <div key={alarm.id} className="mb-2 rounded border border-amber-200 dark:border-warning/40 bg-amber-50 dark:bg-warning-soft p-3 text-xs"><p className="font-semibold">{alarm.title}</p><p>{alarm.description}</p><p className="mt-1 text-muted">{dateTime(alarm.timestamp)}</p></div>) : <p className="text-xs text-muted">Tidak ada alarm aktif.</p>}<h2 className="mb-2 mt-4 text-sm font-semibold">Aktivitas terbaru</h2>{[...activities].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)).slice(0, 20).map(activity => <div key={activity.id} className="border-b border-border py-2 text-xs"><p>{activity.title}</p><p className="text-muted">{dateTime(activity.timestamp)}</p></div>)}</DialogContent></Dialog>
      <span className="text-muted">Pembacaan lokal · rentang tampilan bukan batas proteksi · target tidak mengubah telemetry</span>
      <div className="flex gap-3 font-semibold text-blue-700 dark:text-accent"><Link to="/gauge-widget">Pengaturan perangkat</Link><Link to="/virtual">Visualisasi sistem</Link></div>
    </div>
    <FleetOutput />
    <div className="fleet-bottom">
      <FleetMachines />
      <InternalEnvironment />
      <OilMonitoring />
      <aside className="industrial-panel overview-camera-column"><div className="industrial-heading"><h2>CCTV & THERMAL</h2><span>Media referensi</span></div><DashboardMedia /></aside>
    </div>
    <p className="text-[9px] text-muted">Output dan ikon mencakup genset dalam filter site. Daya internal, suhu ruangan, dan oli mengikuti unit detail: {device.id}. Pengaturan hanya lokal, bukan kontrol PLC.</p>
  </div>;
}
