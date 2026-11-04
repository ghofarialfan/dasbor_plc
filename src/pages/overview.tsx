import { Boxes, CircleCheck, CirclePause, Unplug, Clock3, Info } from 'lucide-react';
import { useDemo } from '@/context/demo-context';
import { DEMO_NOW, sites, parameterQuality } from '@/data/demo';
import { dateTime } from '@/lib/utils';
import { Panel, PanelHeading, StatusBadge, WarningBadge } from '@/components/shared';
import { GaugeCard } from '@/components/overview/gauge';
import { SystemOverview } from '@/components/overview/system-overview';
import { TrendChart } from '@/components/overview/trend-chart';
import { ActiveAlerts, RecentActivity } from '@/components/overview/alerts-activity';
import { CameraPreview } from '@/components/overview/camera-preview';

function OverviewBottom() {
  const { device } = useDemo();
  return <>
    <div><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="text-sm font-semibold">Parameter utama <span className="ml-1 text-xs font-normal text-muted">/ {device.id}</span></h2><p className="text-[10px] text-muted">Rentang display bukan batas proteksi mesin</p></div><div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">{(['rpm', 'voltage', 'frequency', 'motorTemperature', 'roomTemperature', 'bldcTemperature'] as const).map(p => <GaugeCard key={p} parameter={p} value={device.telemetry[p]} quality={parameterQuality(device, p)} />)}</div></div>
    <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.9fr)_minmax(280px,1fr)]"><TrendChart /><CameraPreview /></div>
    <RecentActivity />
    <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-[10px] leading-relaxed text-blue-800"><Info size={15} className="mt-0.5 shrink-0" /><p>Empat GEN adalah fleet simulasi, bukan empat unit nyata yang dibuktikan PDF. Seluruh angka adalah ilustrasi UI, bukan spesifikasi engineering yang telah divalidasi. RPM dan frekuensi tidak menyatakan hubungan mekanis. Threshold warning adalah ambang ilustrasi demo, bukan batas proteksi PLC. Tidak ada koneksi perangkat atau kamera.</p></div>
  </>;
}

export function Overview() {
  const { siteId, device, filteredDevices, selectDevice, filteredAlarms } = useDemo();
  const warning = filteredAlarms.some(a => a.deviceId === device.id && a.severity === 'warning');
  const kpis = [
    { label: 'Total unit', value: filteredDevices.length, icon: Boxes, style: 'bg-blue-50 text-blue-600', note: 'Dalam cakupan site' },
    { label: 'Running', value: filteredDevices.filter(d => d.online && d.status === 'running').length, icon: CircleCheck, style: 'bg-emerald-50 text-emerald-600', note: 'Beroperasi · simulasi' },
    { label: 'Standby', value: filteredDevices.filter(d => d.online && d.status === 'standby').length, icon: CirclePause, style: 'bg-amber-50 text-amber-600', note: 'Unit cadangan' },
    { label: 'Offline', value: filteredDevices.filter(d => !d.online).length, icon: Unplug, style: 'bg-slate-100 text-slate-500', note: 'Tidak ada data terkini' },
  ];
  return <div className="space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">Power monitoring workspace</p><h1 className="text-[26px] font-semibold tracking-tight sm:text-[28px]">Overview</h1><p className="mt-1 text-xs leading-relaxed text-muted">Ringkasan kondisi genset · {siteId === 'all' ? 'Semua Site' : sites.find(s => s.id === siteId)?.name}</p></div><div className="rounded-lg border border-border bg-white px-3 py-2"><p className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-wide text-muted"><Clock3 size={12} />Waktu referensi simulasi</p><p className="mt-1 text-[11px] font-medium tabular-nums">{dateTime(DEMO_NOW)}</p></div></div>
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">{kpis.map(k => <Panel key={k.label} className="p-4 sm:p-5"><div className="flex items-center justify-between gap-2"><p className="text-xs font-medium text-muted">{k.label}</p><span className={`flex h-8 w-8 items-center justify-center rounded-lg ${k.style}`}><k.icon size={17} /></span></div><p className="mt-2 text-[30px] font-semibold leading-none tracking-tight tabular-nums">{k.value}<span className="ml-2 text-[11px] font-normal tracking-normal text-muted">unit</span></p><p className="mt-3 text-[10px] text-muted">{k.note}</p></Panel>)}</div>
    <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.9fr)_minmax(280px,1fr)]">
      <Panel className="min-w-0"><PanelHeading title="Generator overview" eyebrow="Equipment visualization" action={<label className="text-[10px] text-muted"><span className="sr-only">Pilih device</span><select aria-label="Pilih device" value={device.id} onChange={e => selectDevice(e.target.value)} className="max-w-[130px] rounded-lg border border-border bg-white px-2 py-2 text-xs font-medium text-foreground">{filteredDevices.map(d => <option key={d.id} value={d.id}>{d.id}</option>)}</select></label>} />
        <div className="flex flex-wrap items-center justify-between gap-2 px-5"><div><h3 className="text-sm font-semibold">{device.name}</h3><p className="mt-1 text-[10px] text-muted">{device.id} · {device.location}</p></div><div className="flex gap-1.5"><StatusBadge device={device} />{warning && <WarningBadge />}</div></div>
        <div className="px-3 pt-3 sm:px-5"><SystemOverview /></div>
        <p className="border-t border-slate-100 px-5 py-3 text-xs leading-relaxed text-muted">AT-301: RH / titik embun belum ditetapkan, satuan belum final. LSL-19/20: status digital low-level, bukan persen. {device.online ? 'Belum disimulasikan' : 'Offline'}</p>
        <p className="border-t border-slate-100 px-5 py-3 text-[10px] text-muted">{device.online ? `Snapshot simulasi: ${dateTime(DEMO_NOW)} · bukan data live` : `Offline / No current data · operasi unknown · Last seen: ${dateTime(device.lastSeen)}`}</p>
      </Panel>
      <ActiveAlerts />
    </div>
    <OverviewBottom />
  </div>;
}
