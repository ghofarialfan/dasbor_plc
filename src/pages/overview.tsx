import { deviceStatusKey, deviceStatusDefinitions } from '@/lib/device-status';
import { Boxes, CircleCheck, CirclePause, Unplug, Clock3, Info } from 'lucide-react';
import { useDemo } from '@/context/demo-context';
import { DEMO_NOW, sites, parameterQuality } from '@/data/demo';
import { dateTime } from '@/lib/utils';
import { Panel, PanelHeading, StatusBadge, WarningBadge } from '@/components/shared';
import { GaugeCard } from '@/components/overview/gauge';
import { controlCopy } from '@/lib/demo-controls';
import { SystemOverview } from '@/components/overview/system-overview';
import { TrendChart } from '@/components/overview/trend-chart';
import { SiteNotifications } from '@/components/overview/alerts-activity';
import { CameraPreview } from '@/components/overview/camera-preview';

function MainParameters() {
  const { device } = useDemo();
  return <div><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="text-sm font-semibold">Parameter utama <span className="ml-1 text-xs font-normal text-muted">/ {device.id}</span></h2><p className="text-[10px] text-muted">Rentang display bukan batas proteksi mesin</p></div><div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">{(['rpm', 'voltage', 'frequency', 'motorTemperature', 'roomTemperature', 'bldcTemperature'] as const).map(p => <GaugeCard key={p} device={device} parameter={p} value={device.telemetry[p]} quality={parameterQuality(device, p)} />)}</div><p className="mt-3 text-[10px] text-muted">{controlCopy.disclaimer}</p></div>;
}

function OverviewBottom() {
  return <>
    <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.9fr)_minmax(280px,1fr)]"><TrendChart /><CameraPreview /></div>
    <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-[10px] leading-relaxed text-blue-800"><Info size={15} className="mt-0.5 shrink-0" /><p>Unit ditampilkan sesuai site terpilih. Pilih unit untuk melihat diagram, pengukuran parameter, dan riwayat pembaruan. RPM dan frekuensi ditampilkan sebagai parameter terpisah.</p></div>
  </>;
}

export function Overview() {
  const { siteId, device, filteredDevices, selectDevice, filteredAlarms } = useDemo();
  const warning = filteredAlarms.some(a => a.deviceId === device.id && a.severity === 'warning');
  const kpis = [
    { label: 'Total unit', value: filteredDevices.length, icon: Boxes, style: 'bg-blue-50 text-blue-600', note: 'Dalam cakupan site' },
    { label: deviceStatusDefinitions.running.label, value: filteredDevices.filter(d => deviceStatusKey(d) === 'running').length, icon: CircleCheck, style: 'bg-emerald-50 text-emerald-600', note: 'Beroperasi' },
    { label: deviceStatusDefinitions.standby.label, value: filteredDevices.filter(d => deviceStatusKey(d) === 'standby').length, icon: CirclePause, style: 'bg-amber-50 text-amber-600', note: 'Unit cadangan' },
    { label: deviceStatusDefinitions.unknown.label, value: filteredDevices.filter(d => deviceStatusKey(d) === 'unknown').length, icon: Info, style: 'bg-slate-100 text-slate-500', note: 'Terhubung, status belum diketahui' },
    { label: deviceStatusDefinitions.offline.label, value: filteredDevices.filter(d => deviceStatusKey(d) === 'offline').length, icon: Unplug, style: 'bg-slate-100 text-slate-500', note: 'Tidak ada data terkini' },
  ];
  return <div className="space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">Power monitoring workspace</p><h1 className="text-[26px] font-semibold tracking-tight sm:text-[28px]">Overview</h1><p className="mt-1 text-xs leading-relaxed text-muted">Ringkasan kondisi genset · {siteId === 'all' ? 'Semua Site' : sites.find(s => s.id === siteId)?.name}</p></div><div className="rounded-lg border border-border bg-white px-3 py-2"><p className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-wide text-muted"><Clock3 size={12} />Pembaruan terakhir</p><p className="mt-1 text-[11px] font-medium tabular-nums">{dateTime(DEMO_NOW)}</p></div></div>
    <Panel className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
      <label htmlFor="overview-generator" className="flex flex-wrap items-center gap-3 text-xs font-semibold">Pilih generator
        <select id="overview-generator" value={device.id} onChange={e => selectDevice(e.target.value)} className="max-w-full rounded-lg border border-border bg-white px-3 py-2 text-xs font-medium text-foreground">
          {filteredDevices.map(d => <option key={d.id} value={d.id}>{d.id} · {d.name}</option>)}
        </select>
      </label>
      <div className="flex flex-wrap items-center gap-2"><span className="text-[11px] text-muted">{device.location}</span><StatusBadge device={device} animated />{warning && <WarningBadge />}</div>
    </Panel>
    <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,3fr)_minmax(300px,1fr)]">
      <div className="min-w-0 xl:col-start-2 xl:row-start-1"><SiteNotifications /></div>
      <div className="min-w-0 xl:col-start-1 xl:row-start-1"><MainParameters /></div>
    </div>
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5 lg:gap-5">{kpis.map(k => <Panel key={k.label} className="p-4 sm:p-5"><div className="flex items-center justify-between gap-2"><p className="text-xs font-medium text-muted">{k.label}</p><span className={`flex h-8 w-8 items-center justify-center rounded-lg ${k.style}`}><k.icon size={17} /></span></div><p className="mt-2 text-[30px] font-semibold leading-none tracking-tight tabular-nums">{k.value}<span className="ml-2 text-[11px] font-normal tracking-normal text-muted">unit</span></p><p className="mt-3 text-[10px] text-muted">{k.note}</p></Panel>)}</div>
    <div className="min-w-0 space-y-5">
      <Panel className="min-w-0"><PanelHeading title="Generator overview" eyebrow="Equipment visualization" />
        <div className="flex flex-wrap items-center justify-between gap-2 px-5"><div><h3 className="text-sm font-semibold">{device.name}</h3><p className="mt-1 text-[10px] text-muted">{device.id} · {device.location}</p></div><div className="flex gap-1.5"><StatusBadge device={device} />{warning && <WarningBadge />}</div></div>
        <div className="px-3 pt-3 sm:px-5"><SystemOverview /></div>

      </Panel>
    </div>
    <OverviewBottom />
  </div>;
}
