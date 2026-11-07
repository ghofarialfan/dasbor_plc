import { filterDevices } from '@/data/queries';
import { Link, useSearchParams } from 'react-router-dom';
import { MachineGallery } from '@/components/machines/machine-gallery';

const deviceTabs = [
  { value: 'summary', label: 'Ringkasan' },
  { value: 'machines', label: 'Mesin & instrumen' },
];

export function DevicePage() {
  const { device, filteredDevices, selectDevice, siteId } = useDemo();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'machines' ? 'machines' : 'summary';
  const changeTab = (value: string) => {
    setParams(previous => {
      const next = new URLSearchParams(previous);
      next.set('tab', value);
      next.delete('machine');
      return next;
    });
  };
  return <div className="space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">Inventaris peralatan</p><h1 className="text-[26px] font-semibold tracking-tight sm:text-[28px]">Device</h1><p className="mt-1 text-xs text-muted">Identitas unit, mesin, dan instrumen terkait.</p></div>
      <label className="flex items-center gap-2 text-xs font-medium">Unit terpilih<select value={device.id} onChange={event => selectDevice(event.target.value)} className="rounded-lg border border-border bg-white px-3 py-2">{filteredDevices.map(unit => <option key={unit.id} value={unit.id}>{unit.id} · {unit.name}</option>)}</select></label>
    </div>
    <div role="tablist" aria-label="Informasi device" className="flex gap-2 border-b border-border pb-3">
      {deviceTabs.map(({ value, label }, index) => <button key={value} id={`device-tab-${value}`} type="button" role="tab" aria-selected={tab === value} aria-controls={`device-panel-${value}`} tabIndex={tab === value ? 0 : -1} onClick={() => changeTab(value)} onKeyDown={event => {
        if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
          event.preventDefault();
          const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - index;
          changeTab(deviceTabs[next].value);
          document.getElementById(`device-tab-${deviceTabs[next].value}`)?.focus();
        }
      }} className={cn('rounded-lg px-3 py-2 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500', tab === value ? 'bg-blue-50 text-blue-700' : 'text-muted hover:bg-slate-50')}>{label}</button>)}
    </div>
    <div role="tabpanel" id="device-panel-summary" aria-labelledby="device-tab-summary" hidden={tab !== 'summary'}>{tab === 'summary' && <DeviceSummary key={siteId} />}</div>
    <div role="tabpanel" id="device-panel-machines" aria-labelledby="device-tab-machines" hidden={tab !== 'machines'}>{tab === 'machines' && <MachineGallery key={`${device.id}-${params.get('machine') ?? ''}`} deviceId={device.id} initialMachineId={params.get('machine')} />}</div>
  </div>;
}
import { useMemo, useState } from 'react';
import { LayoutGrid, List, Search, MapPin, Radio } from 'lucide-react';
import { useDemo } from '@/context/demo-context';
import { equipment, instruments, instrumentsForEquipment, certaintyLabels, sites, parameters, parameterQuality, alarms } from '@/data/demo';
import type { Device, Equipment } from '@/types';
import { dateTime } from '@/lib/utils';
import { deviceStatus, deviceStatusDefinitions } from '@/lib/device-status';
import { Panel, PanelHeading, StatusBadge, CertaintyBadge, EmptyState } from '@/components/shared';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { InstrumentReadings } from '@/components/machines/instrument-readings';

type StatusFilter = 'all' | 'running' | 'standby' | 'unknown' | 'offline';

function sourceLabel(e: Equipment) {
  return (e.identitySources ?? ['pid-draft']).map(s => s === 'project-colleague' ? 'Keterangan rekan proyek' : 'PDF P&ID Genset PLTS (draf)').join(' + ');
}

function DeviceDetail({ device }: { device: Device }) {
  const { selectDevice, device: activeDevice } = useDemo();
  const [section, setSection] = useState('Ringkasan');
  const unitEquipment = equipment.filter(e => e.deviceId === device.id);
  const unitInstruments = instruments.filter(i => i.deviceId === device.id);
  const site = sites.find(s => s.id === device.siteId);
  return <div className="space-y-5 text-xs leading-relaxed">
    <div className="sticky -top-6 z-10 -mx-6 flex items-start justify-between gap-3 border-b border-border bg-white px-6 pb-4 pt-6 pr-14">
      <div>
        <h2 className="pr-6 text-lg font-semibold">{device.name}</h2>
        <p className="mt-1 text-xs text-muted">{device.id} · {site?.name}</p>
      </div>
      <StatusBadge device={device} animated />
    </div>
    <div className="flex flex-wrap items-center gap-2"><Button size="sm" variant="outline" disabled={activeDevice.id === device.id} onClick={() => selectDevice(device.id)}>{activeDevice.id === device.id ? 'Unit aktif' : 'Gunakan unit ini'}</Button><Link to="/gauge-widget" onClick={() => selectDevice(device.id)} className="rounded-lg px-3 py-2 font-semibold text-blue-700">Buka pengaturan</Link></div>
    <div role="group" aria-label="Bagian detail unit" className="flex gap-2">{['Ringkasan', 'Perangkat', 'Instrumen'].map(label => <button key={label} type="button" aria-pressed={section === label} onClick={() => setSection(label)} className={cn('rounded-lg px-3 py-2 font-semibold focus-visible:ring-2 focus-visible:ring-blue-500', section === label ? 'bg-blue-50 text-blue-700' : 'text-muted hover:bg-slate-50')}>{label}</button>)}</div>
    {section === 'Ringkasan' && <>
    <dl className="space-y-2 rounded-xl border border-border p-3">
      <div className="flex items-center justify-between gap-2"><dt className="text-muted">Lokasi</dt><dd className="flex items-center gap-1.5"><MapPin size={13} className="text-slate-400" />{device.location}</dd></div>
      <div className="flex items-center justify-between gap-2"><dt className="text-muted">Status operasi</dt><dd>{deviceStatus(device).label}</dd></div>
      <div className="flex items-center justify-between gap-2"><dt className="text-muted">Koneksi</dt><dd className="flex items-center gap-1.5"><Radio size={13} className={device.online ? 'text-emerald-500' : 'text-slate-400'} />{device.online ? 'Terhubung' : 'Offline'}</dd></div>
      <div className="flex items-center justify-between gap-2"><dt className="text-muted">Pembaruan terakhir</dt><dd className="tabular-nums">{device.online ? dateTime(device.lastSeen) : '—'}</dd></div>
      {!device.online && <div className="flex items-center justify-between gap-2"><dt className="text-muted">Last seen</dt><dd className="tabular-nums">{dateTime(device.lastSeen)}</dd></div>}
      {!device.online && <p className="rounded-md bg-slate-50 px-2 py-1.5 text-[10px] text-slate-500">Belum ada data terkini.</p>}
    </dl>
    <UnitReadings device={device} />
    </>}
    {section === 'Perangkat' && <section className="space-y-2">
      <h3 className="text-sm font-semibold">Status desain · Equipment</h3>
      <div className="space-y-2">
        {unitEquipment.map(e => <div key={e.instanceId} className="space-y-1.5 rounded-xl border border-border p-3">
          <div className="flex items-center justify-between gap-2"><span className="font-medium">{e.item} · {e.name}</span><CertaintyBadge certainty={e.certainty} /></div>
          <p>{e.function}</p>
          <details className="text-muted"><summary className="cursor-pointer">Sumber dan catatan</summary><p className="mt-2">{sourceLabel(e)} · {e.notes}</p></details>
          {instrumentsForEquipment(device.id, e.id).length > 0 && <p className="text-muted">Instrumen: {instrumentsForEquipment(device.id, e.id).map(i => i.tag).join(', ')}</p>}
        </div>)}
      </div>
    </section>}
    {section === 'Instrumen' && <section className="space-y-2">
      <h3 className="text-sm font-semibold">Status desain · Instrumen</h3>
      <div className="space-y-2">
        {unitInstruments.map(i => <div key={i.instanceId} className="space-y-1.5 rounded-xl border border-border p-3">
          <div className="flex items-center justify-between gap-2"><span className="font-medium">{i.tag} · {i.name}</span><CertaintyBadge certainty={i.certainty} /></div>
          <p>{i.function}</p>
          <p className="text-muted">Sumber: {i.tag.startsWith('DEMO:') ? 'Asumsi kondisi lokal; bukan tag PLC' : 'PDF draf'} · {i.signal} · {certaintyLabels[i.certainty]}</p>
          <InstrumentReadings device={device} tag={i.tag} />
        </div>)}
      </div>
    </section>}
  </div>;
}

function DeviceSummary() {
  const { siteId, device: activeDevice } = useDemo();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [layout, setLayout] = useState<'card' | 'list'>('card');
  const q = query.trim().toLowerCase();
  const list = useMemo(() => filterDevices(siteId, q, status), [siteId, q, status]);
  return <div className="space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">Power monitoring workspace</p><h2 className="text-lg font-semibold">Ringkasan unit</h2><p className="mt-1 text-xs leading-relaxed text-muted">Daftar mengikuti site terpilih · pencarian dan status hanya memfilter daftar ini</p></div>
      <div className="flex gap-1.5" role="group" aria-label="Tampilan daftar">
        <button type="button" aria-label="Tampilan kartu" onClick={() => setLayout('card')} aria-pressed={layout === 'card'} className={cn('rounded-lg border p-2', layout === 'card' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-border text-muted hover:bg-slate-50')}><LayoutGrid size={16} /></button>
        <button type="button" aria-label="Tampilan daftar" onClick={() => setLayout('list')} aria-pressed={layout === 'list'} className={cn('rounded-lg border p-2', layout === 'list' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-border text-muted hover:bg-slate-50')}><List size={16} /></button>
      </div>
    </div>
    <Panel className="min-w-0"><PanelHeading title="Daftar unit" eyebrow="Device" action={<span className="rounded-md bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700">{list.length} unit</span>} />
      <div className="flex flex-wrap gap-2 px-5 pb-4">
        <label className="relative flex-1 min-w-[180px]"><span className="sr-only">Cari unit</span><Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari nama, ID, atau lokasi" className="w-full rounded-lg border border-border bg-white py-2 pl-8 pr-3 text-xs outline-none focus:ring-2 focus:ring-blue-500" /></label>
        <label className="sr-only" htmlFor="status-filter">Filter status</label>
        <select id="status-filter" value={status} onChange={e => setStatus(e.target.value as StatusFilter)} className="rounded-lg border border-border bg-white px-2 py-2 text-xs font-medium text-foreground">{[['all', 'Semua status'], ...Object.entries(deviceStatusDefinitions).map(([value, status]) => [value, status.label])].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        <Button size="sm" variant="outline" onClick={() => { setQuery(''); setStatus('all'); }}>Reset filter</Button>
      </div>
      {list.length === 0 ? <EmptyState title="Tidak ada unit" description="Tidak ada unit yang cocok dengan pencarian atau filter." /> : layout === 'card' ? <div className="grid grid-cols-1 gap-3 px-5 pb-5 sm:grid-cols-2 xl:grid-cols-4">{list.map(d => <Dialog key={d.id}><DialogTrigger asChild><button type="button" className={cn('rounded-xl border bg-white p-4 text-left transition hover:border-blue-300 hover:bg-blue-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500', activeDevice.id === d.id ? 'border-blue-500 ring-1 ring-blue-100' : 'border-border')}><div className="flex items-center justify-between gap-2"><span className="text-sm font-semibold">{d.name}</span><StatusBadge device={d} /></div><p className="mt-2 text-[11px] text-muted">{d.id} · {d.location}</p>{activeDevice.id === d.id && <p className="mt-2 text-[10px] font-semibold text-blue-700">Unit aktif</p>}<UnitReadings device={d} compact /><p className="mt-3 text-[10px] text-muted">{d.online ? 'Pembaruan data' : 'Terakhir terlihat'}: {dateTime(d.lastSeen)}</p></button></DialogTrigger><DialogContent side="right" className="w-full sm:w-[min(640px,100vw)]"><DialogTitle className="sr-only">Detail {d.id}</DialogTitle><DialogDescription className="sr-only">Detail unit {d.id}</DialogDescription><DeviceDetail key={siteId} device={d} /></DialogContent></Dialog>)}</div> : <div className="divide-y divide-slate-100 px-5 pb-5">{list.map(d => <Dialog key={d.id}><DialogTrigger asChild><button type="button" className="flex w-full flex-wrap items-center gap-3 py-3 text-left hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{d.name}</span><span className="block text-[11px] text-muted">{d.id} · {d.location}</span></span><span className="text-[10px] tabular-nums text-muted">{dateTime(d.lastSeen)}</span>{activeDevice.id === d.id && <span className="text-xs font-semibold text-blue-700">Unit aktif</span>}<StatusBadge device={d} /></button></DialogTrigger><DialogContent side="right" className="w-full sm:w-[min(640px,100vw)]"><DialogTitle className="sr-only">Detail {d.id}</DialogTitle><DialogDescription className="sr-only">Detail unit {d.id}</DialogDescription><DeviceDetail key={siteId} device={d} /></DialogContent></Dialog>)}</div>}
    </Panel>
  </div>;
}

function UnitReadings({ device, compact = false }: { device: Device; compact?: boolean }) {
  const warning = alarms.some(a => a.deviceId === device.id && a.severity === 'warning');
  return <div className="mt-3 space-y-2">
    <p className={cn('text-xs font-medium', !device.online ? 'text-slate-500' : warning ? 'text-amber-700' : 'text-blue-700')}>{!device.online ? 'Koneksi offline' : warning ? 'Peringatan aktif' : 'Terhubung'} · Pembacaan simulasi</p>
    <dl className={cn('grid gap-2', compact ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3')}>{(['rpm', 'voltage', 'motorTemperature'] as const).map(parameter => <div key={parameter} className="rounded-lg bg-slate-50 p-2"><dt className="text-[10px] text-muted">{parameters[parameter].label}</dt><dd className="mt-1 text-xs font-semibold">{parameterQuality(device, parameter) === 'simulated' ? device.telemetry[parameter] ?? '—' : '—'} {device.online ? parameters[parameter].unit : ''}</dd></div>)}</dl>
  </div>;
}
