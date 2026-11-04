import { filterDevices } from '@/data/queries';
import { useMemo, useState } from 'react';
import { LayoutGrid, List, Search, MapPin, Radio } from 'lucide-react';
import { useDemo } from '@/context/demo-context';
import { equipment, instruments, instrumentsForEquipment, certaintyLabels, qualityLabels, readingsForInstrument, sites } from '@/data/demo';
import type { Device, Equipment } from '@/types';
import { dateTime } from '@/lib/utils';
import { Panel, PanelHeading, StatusBadge, CertaintyBadge, EmptyState } from '@/components/shared';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type StatusFilter = 'all' | 'running' | 'standby' | 'unknown' | 'offline';

function sourceLabel(e: Equipment) {
  return (e.identitySources ?? ['pid-draft']).map(s => s === 'project-colleague' ? 'Keterangan rekan proyek' : 'PDF P&ID Genset PLTS (draf)').join(' + ');
}

function DeviceDetail({ device }: { device: Device }) {
  const unitEquipment = equipment.filter(e => e.deviceId === device.id);
  const unitInstruments = instruments.filter(i => i.deviceId === device.id);
  const site = sites.find(s => s.id === device.siteId);
  return <div className="space-y-5 text-xs leading-relaxed">
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="pr-6 text-lg font-semibold">{device.name}</h2>
        <p className="mt-1 text-xs text-muted">{device.id} · {site?.name}</p>
      </div>
      <StatusBadge device={device} />
    </div>
    <dl className="space-y-2 rounded-xl border border-border p-3">
      <div className="flex items-center justify-between gap-2"><dt className="text-muted">Lokasi</dt><dd className="flex items-center gap-1.5"><MapPin size={13} className="text-slate-400" />{device.location}</dd></div>
      <div className="flex items-center justify-between gap-2"><dt className="text-muted">Status operasi</dt><dd>{device.online ? (device.status === 'running' ? 'Running' : device.status === 'standby' ? 'Standby' : 'Unknown') : 'Offline'}</dd></div>
      <div className="flex items-center justify-between gap-2"><dt className="text-muted">Koneksi</dt><dd className="flex items-center gap-1.5"><Radio size={13} className={device.online ? 'text-emerald-500' : 'text-slate-400'} />{device.online ? 'Terhubung' : 'Offline'}</dd></div>
      <div className="flex items-center justify-between gap-2"><dt className="text-muted">Pembaruan terakhir</dt><dd className="tabular-nums">{device.online ? dateTime(device.lastSeen) : '—'}</dd></div>
      {!device.online && <div className="flex items-center justify-between gap-2"><dt className="text-muted">Last seen</dt><dd className="tabular-nums">{dateTime(device.lastSeen)}</dd></div>}
      {!device.online && <p className="rounded-md bg-slate-50 px-2 py-1.5 text-[10px] text-slate-500">Belum ada data terkini.</p>}
    </dl>
    <section className="space-y-2">
      <h3 className="text-sm font-semibold">Status desain · Equipment</h3>
      <div className="space-y-2">
        {unitEquipment.map(e => <div key={e.instanceId} className="space-y-1.5 rounded-xl border border-border p-3">
          <div className="flex items-center justify-between gap-2"><span className="font-medium">{e.item} · {e.name}</span><CertaintyBadge certainty={e.certainty} /></div>
          <p>{e.function}</p>
          <p className="text-muted">Sumber: {sourceLabel(e)}</p>
          {instrumentsForEquipment(device.id, e.id).length > 0 && <p className="text-muted">Instrumen: {instrumentsForEquipment(device.id, e.id).map(i => i.tag).join(', ')}</p>}
        </div>)}
      </div>
    </section>
    <section className="space-y-2">
      <h3 className="text-sm font-semibold">Status desain · Instrumen</h3>
      <div className="space-y-2">
        {unitInstruments.map(i => <div key={i.instanceId} className="space-y-1.5 rounded-xl border border-border p-3">
          <div className="flex items-center justify-between gap-2"><span className="font-medium">{i.tag} · {i.name}</span><CertaintyBadge certainty={i.certainty} /></div>
          <p>{i.function}</p>
          <p className="text-muted">Sumber: PDF draf · {i.signal} · {certaintyLabels[i.certainty]}</p>
          {readingsForInstrument(device, i.tag).map((r, index) => <p key={index}>{r.parameter ? `${r.parameter} (${r.tag})` : 'Nilai'}: <strong>{r.value === null ? '—' : typeof r.value === 'boolean' ? (r.value ? 'Aktif' : 'Tidak aktif') : String(r.value)}{r.value !== null && r.unit ? ` ${r.unit}` : ''}</strong> · {qualityLabels[r.quality]}</p>)}
        </div>)}
      </div>
    </section>
  </div>;
}

export function DevicePage() {
  const { siteId } = useDemo();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [layout, setLayout] = useState<'card' | 'list'>('card');
  const q = query.trim().toLowerCase();
  const list = useMemo(() => filterDevices(siteId, q, status), [siteId, q, status]);
  return <div className="space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">Power monitoring workspace</p><h1 className="text-[26px] font-semibold tracking-tight sm:text-[28px]">Device</h1><p className="mt-1 text-xs leading-relaxed text-muted">Unit GEN-001 sampai GEN-004</p></div>
      <div className="flex gap-1.5" role="group" aria-label="Tampilan daftar">
        <button type="button" aria-label="Tampilan kartu" onClick={() => setLayout('card')} aria-pressed={layout === 'card'} className={cn('rounded-lg border p-2', layout === 'card' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-border text-muted hover:bg-slate-50')}><LayoutGrid size={16} /></button>
        <button type="button" aria-label="Tampilan daftar" onClick={() => setLayout('list')} aria-pressed={layout === 'list'} className={cn('rounded-lg border p-2', layout === 'list' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-border text-muted hover:bg-slate-50')}><List size={16} /></button>
      </div>
    </div>
    <Panel className="min-w-0"><PanelHeading title="Daftar unit" eyebrow="Device" action={<span className="rounded-md bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700">{list.length} unit</span>} />
      <div className="flex flex-wrap gap-2 px-5 pb-4">
        <label className="relative flex-1 min-w-[180px]"><span className="sr-only">Cari unit</span><Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari nama, ID, atau lokasi" className="w-full rounded-lg border border-border bg-white py-2 pl-8 pr-3 text-xs outline-none focus:ring-2 focus:ring-blue-500" /></label>
        <label className="sr-only" htmlFor="status-filter">Filter status</label>
        <select id="status-filter" value={status} onChange={e => setStatus(e.target.value as StatusFilter)} className="rounded-lg border border-border bg-white px-2 py-2 text-xs font-medium text-foreground">{[['all', 'Semua status'], ['running', 'Running'], ['standby', 'Standby'], ['unknown', 'Unknown'], ['offline', 'Offline']].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      </div>
      {list.length === 0 ? <EmptyState title="Tidak ada unit" description="Tidak ada unit yang cocok dengan pencarian atau filter." /> : layout === 'card' ? <div className="grid grid-cols-1 gap-3 px-5 pb-5 sm:grid-cols-2 xl:grid-cols-4">{list.map(d => <Dialog key={d.id}><DialogTrigger asChild><button type="button" className="rounded-xl border border-border bg-white p-4 text-left transition hover:border-blue-300 hover:bg-blue-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><div className="flex items-center justify-between gap-2"><span className="text-sm font-semibold">{d.name}</span><StatusBadge device={d} /></div><p className="mt-2 text-[11px] text-muted">{d.id} · {d.location}</p><p className="mt-3 text-[10px] text-muted">Pembaruan terakhir: {d.online ? dateTime(d.lastSeen) : '—'}</p></button></DialogTrigger><DialogContent side="right"><DialogTitle className="sr-only">Detail {d.id}</DialogTitle><DialogDescription className="sr-only">Detail unit {d.id}</DialogDescription><DeviceDetail device={d} /></DialogContent></Dialog>)}</div> : <div className="divide-y divide-slate-100 px-5 pb-5">{list.map(d => <Dialog key={d.id}><DialogTrigger asChild><button type="button" className="flex w-full flex-wrap items-center gap-3 py-3 text-left hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{d.name}</span><span className="block text-[11px] text-muted">{d.id} · {d.location}</span></span><span className="text-[10px] tabular-nums text-muted">{d.online ? dateTime(d.lastSeen) : '—'}</span><StatusBadge device={d} /></button></DialogTrigger><DialogContent side="right"><DialogTitle className="sr-only">Detail {d.id}</DialogTitle><DialogDescription className="sr-only">Detail unit {d.id}</DialogDescription><DeviceDetail device={d} /></DialogContent></Dialog>)}</div>}
    </Panel>
  </div>;
}
