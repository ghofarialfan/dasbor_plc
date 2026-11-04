import { isWidgetArray } from '@/lib/validation';
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useDemo } from '@/context/demo-context';
import { devices, parameters, parameterQuality } from '@/data/demo';
import type { Parameter, GaugeWidgetConfig } from '@/types';
import { loadJSON, saveJSON } from '@/lib/storage';
import { Panel, PanelHeading, EmptyState } from '@/components/shared';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { GaugeCard } from '@/components/overview/gauge';

const NUMERIC_PARAMS: Parameter[] = ['rpm', 'voltage', 'frequency', 'motorTemperature', 'roomTemperature', 'bldcTemperature'];


export function GaugeWidgetPage() {
  const { filteredDevices } = useDemo();
  const [widgets, setWidgets] = useState<GaugeWidgetConfig[]>(() => loadJSON<GaugeWidgetConfig[]>('gauge-widgets', [], isWidgetArray));
  const [storageError, setStorageError] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedDeviceId, setDeviceId] = useState('GEN-001');
  const deviceId = filteredDevices.some(d => d.id === selectedDeviceId) ? selectedDeviceId : filteredDevices[0].id;
  const [parameter, setParameter] = useState<Parameter>('rpm');
  const [title, setTitle] = useState('');

  const commit = (next: GaugeWidgetConfig[]) => { setWidgets(next); setStorageError(!saveJSON('gauge-widgets', next)); };
  const add = () => { commit([...widgets, { id: `w-${Date.now()}`, deviceId, parameter, title: title.trim() || parameters[parameter].label }]); setOpen(false); setTitle(''); };
  const remove = (id: string) => commit(widgets.filter(w => w.id !== id));
  const visible = widgets.filter(w => filteredDevices.some(d => d.id === w.deviceId));

  return <div className="space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">Power monitoring workspace</p><h1 className="text-[26px] font-semibold tracking-tight sm:text-[28px]">Gauge Widget</h1><p className="mt-1 text-xs leading-relaxed text-muted">Gauge per tag instrumen · parameter per unit</p></div>
      <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button onClick={() => setOpen(true)}><Plus size={16} />Tambah widget</Button></DialogTrigger><DialogContent><DialogTitle className="text-lg font-semibold">Tambah gauge widget</DialogTitle><DialogDescription className="mt-2 text-xs text-muted">Pilih unit, tag numerik, dan judul. Hanya tag numerik yang dapat dipilih.</DialogDescription>
        <div className="mt-4 space-y-3 text-xs">
          <label className="block"><span className="mb-1 block text-muted">Unit</span><select value={deviceId} onChange={e => setDeviceId(e.target.value)} className="w-full rounded-lg border border-border bg-white px-2 py-2">{filteredDevices.map(d => <option key={d.id} value={d.id}>{d.id} · {d.name}</option>)}</select></label>
          <label className="block"><span className="mb-1 block text-muted">Tag</span><select value={parameter} onChange={e => setParameter(e.target.value as Parameter)} className="w-full rounded-lg border border-border bg-white px-2 py-2">{NUMERIC_PARAMS.map(p => <option key={p} value={p}>{parameters[p].label}</option>)}</select></label>
          <label className="block"><span className="mb-1 block text-muted">Judul (opsional)</span><input value={title} onChange={e => setTitle(e.target.value)} placeholder={parameters[parameter].label} className="w-full rounded-lg border border-border bg-white px-2 py-2 outline-none focus:ring-2 focus:ring-blue-500" /></label>
          <div className="flex justify-end gap-2 pt-2"><Button variant="outline" onClick={() => setOpen(false)}>Batal</Button><Button onClick={add}>Tambah</Button></div>
        </div>
      </DialogContent></Dialog>
    </div>
    {storageError && <p role="alert" className="text-xs text-amber-700">Pengaturan tidak dapat disimpan; perubahan hanya tersedia selama sesi ini.</p>}
    <Panel className="min-w-0"><PanelHeading title="Gauge" eyebrow={`${visible.length} widget`} />
      {visible.length === 0 ? <EmptyState title="Belum ada widget" description="Tambahkan gauge widget untuk menampilkan parameter per unit." /> : <div className="grid grid-cols-1 gap-3 px-5 pb-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map(w => { const d = devices.find(x => x.id === w.deviceId); return <div key={w.id} className="relative"><GaugeCard parameter={w.parameter} value={d?.telemetry[w.parameter] ?? null} quality={d ? parameterQuality(d, w.parameter) : 'offline'} /><div className="absolute right-3 top-3 flex gap-1"><button type="button" aria-label={`Hapus ${w.title}`} onClick={() => remove(w.id)} className="rounded-md border border-border bg-white p-1.5 text-muted hover:bg-slate-50"><Trash2 size={14} /></button></div><p className="mt-1 text-center text-[10px] text-muted">{w.deviceId} · {w.title}</p></div>; })}
      </div>}
    </Panel>
  </div>;
}
