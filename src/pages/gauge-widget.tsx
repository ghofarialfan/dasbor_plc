import { useState } from 'react';
import { formatChannelValue } from '@/lib/channel-targets';
import { Plus, Trash2 } from 'lucide-react';
import { useDemo } from '@/context/demo-context';
import { devices, parameters, parameterQuality, instrumentsForEquipment } from '@/data/demo';
import type { Parameter, GaugeWidgetConfig } from '@/types';
import { Panel, PanelHeading, EmptyState, StatusBadge } from '@/components/shared';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { GaugeCard } from '@/components/overview/gauge';
import { equipment } from '@/data/demo';
import { controlCopy } from '@/lib/demo-controls';
import { dateTime } from '@/lib/utils';
import { EquipmentWidget } from '@/components/equipment-widget';
import { dashboardTagGroups } from '@/lib/equipment-dashboard';
import { TrendChart } from '@/components/overview/trend-chart';
import { CameraPreview } from '@/components/overview/camera-preview';

const settingsTabs = [
  { value: 'equipment', label: 'Perangkat & kemampuan' },
  { value: 'widgets', label: 'Gauge kustom' },
  { value: 'history', label: 'Riwayat' },
] as const;

const NUMERIC_PARAMS: Parameter[] = ['rpm', 'voltage', 'frequency', 'motorTemperature', 'roomTemperature', 'bldcTemperature'];


export function GaugeWidgetPage() {
  const { filteredDevices, device, selectDevice, controls, channelTargets, equipmentSettings, widgets, setWidgets, widgetStorageError: storageError } = useDemo();
  const [tab, setTab] = useState<(typeof settingsTabs)[number]['value']>('equipment');
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const deviceId = device.id;
  const [parameter, setParameter] = useState<Parameter>('rpm');
  const [title, setTitle] = useState('');

  const commit = (next: GaugeWidgetConfig[]) => setWidgets(next);
  const add = () => { if (widgets.length >= 50) return; commit([...widgets, { id: `w-${Date.now()}`, deviceId, parameter, title: title.trim() || parameters[parameter].label }]); setOpen(false); setTitle(''); };
  const remove = (id: string) => commit(widgets.filter(w => w.id !== id));
  const visible = widgets.filter(w => filteredDevices.some(d => d.id === w.deviceId));

  const unitEquipment = equipment.filter(e => e.deviceId === device.id);
  const query = search.trim().toLocaleLowerCase();
  const matchingEquipment = unitEquipment.filter(e => [e.id, e.item, e.name, ...instrumentsForEquipment(device.id, e.id).map(i => `${i.tag} ${i.name}`)].join(' ').toLocaleLowerCase().includes(query));
  const seenTags = new Set<string>();
  const equipmentCards = matchingEquipment.map(item => {
    const visibleTags = instrumentsForEquipment(device.id, item.id).filter(instrument => {
      if (seenTags.has(instrument.tag)) return false;
      seenTags.add(instrument.tag);
      return true;
    }).map(instrument => instrument.tag);
    return { item, visibleTags };
  });

  return <div className="space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand dark:text-accent">Power monitoring workspace</p><h1 className="text-[26px] font-semibold tracking-tight sm:text-[28px]">Pengaturan Perangkat</h1><p className="mt-1 text-xs leading-relaxed text-muted">Pengaturan lokal per unit · monitoring tetap baca saja</p></div>
      <div className="flex flex-wrap items-center gap-3"><StatusBadge device={device} /><label className="text-xs font-medium">Unit aktif<select value={device.id} onChange={e => { selectDevice(e.target.value); setSearch(''); setOpen(false); }} className="ml-2 max-w-full rounded-lg border border-border bg-white dark:bg-surface p-2">{filteredDevices.map(d => <option key={d.id} value={d.id}>{d.id} · {d.name}</option>)}</select></label></div>
    </div>
    <p className="rounded-lg border border-blue-100 dark:border-accent/40 bg-blue-50 dark:bg-accent-soft px-4 py-3 text-xs leading-relaxed text-blue-800 dark:text-accent">{controlCopy.disclaimer}</p>
    <div role="tablist" aria-label="Bagian pengaturan perangkat" className="flex gap-2 overflow-x-auto border-b border-border pb-3">
      {settingsTabs.map(({ value, label }, index) => <button key={value} type="button" role="tab" id={`settings-tab-${value}`} aria-selected={tab === value} aria-controls={`settings-panel-${value}`} tabIndex={tab === value ? 0 : -1} onClick={() => { setTab(value); setOpen(false); }} onKeyDown={event => {
        if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
          event.preventDefault();
          const next = event.key === 'Home' ? 0 : event.key === 'End' ? settingsTabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + settingsTabs.length) % settingsTabs.length;
          setTab(settingsTabs[next].value);
          setOpen(false);
          document.getElementById(`settings-tab-${settingsTabs[next].value}`)?.focus();
        }
      }} className={`shrink-0 rounded-lg px-4 py-2 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${tab === value ? 'bg-blue-50 dark:bg-accent-soft text-blue-700 dark:text-accent' : 'text-muted hover:bg-slate-50 dark:hover:bg-surface-soft'}`}>{label}</button>)}
    </div>
    <div role="tabpanel" id="settings-panel-equipment" aria-labelledby="settings-tab-equipment" hidden={tab !== 'equipment'}>
    {tab === 'equipment' && <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-sm font-semibold">Perangkat &amp; kemampuan</h2><p className="mt-1 text-xs text-muted">{matchingEquipment.length} dari {unitEquipment.length} perangkat · {device.id}</p></div><label className="w-full text-xs sm:w-72"><span className="sr-only">Cari perangkat atau tag</span><input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama, ID, atau tag instrumen" className="w-full rounded-lg border border-border bg-white dark:bg-surface px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" /></label></div>
      <div className="flex flex-wrap justify-between gap-2 text-[11px] text-muted"><p>Instrumen bersama ditampilkan sekali · Digital bukan persentase · Buka Detail / Atur untuk target lokal.</p><p>{device.online ? 'Snapshot' : 'Terakhir terlihat'}: {dateTime(device.lastSeen)}</p></div>
      {matchingEquipment.length === 0 ? <EmptyState title="Perangkat tidak ditemukan" description="Coba nama perangkat, ID, atau tag instrumen lain." /> : <div className="grid items-start gap-4 xl:grid-cols-12">
        <div className="min-w-0 space-y-4 xl:col-span-8">
          {dashboardTagGroups(equipmentCards.flatMap(card => card.visibleTags)).map(group => <Panel key={group.id} className="min-w-0 overflow-hidden">
            <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3"><div><h2 className="text-sm font-semibold">{group.title}</h2><p className="mt-1 text-[10px] text-muted">{group.description}</p></div><span className="shrink-0 rounded-md bg-blue-50 dark:bg-accent-soft px-2 py-1 text-[10px] font-medium text-blue-700 dark:text-accent">{group.tags.length} tag</span></div>
            <div className={`grid gap-2 p-3 sm:grid-cols-2 ${group.id === 'status' ? 'lg:grid-cols-4' : 'lg:grid-cols-3 2xl:grid-cols-4'}`}>
              {equipmentCards.filter(card => card.visibleTags.some(tag => group.tags.includes(tag))).map(({ item, visibleTags }) => <EquipmentWidget key={`${device.id}:${item.instanceId}`} equipment={item} device={device} visibleTags={visibleTags.filter(tag => group.tags.includes(tag))} />)}
            </div>
          </Panel>)}
          {equipmentCards.some(card => card.visibleTags.length === 0 && instrumentsForEquipment(device.id, card.item.id).length === 0) && <Panel className="p-4"><h2 className="mb-3 text-sm font-semibold">Perangkat tanpa pemetaan</h2><div className="grid gap-2 sm:grid-cols-2">{equipmentCards.filter(card => instrumentsForEquipment(device.id, card.item.id).length === 0).map(({ item, visibleTags }) => <EquipmentWidget key={item.instanceId} equipment={item} device={device} visibleTags={visibleTags} />)}</div></Panel>}
        </div>
        <aside className="min-w-0 space-y-4 xl:col-span-4" aria-label="Tren dan media unit aktif">
          <TrendChart key={device.id} />
          <CameraPreview key={`camera:${device.id}`} />
          <Panel className="p-4 text-xs leading-relaxed text-muted"><h2 className="mb-2 font-semibold text-foreground">Panduan pembacaan</h2><p>Angka gauge adalah pembacaan, bukan target manual. Rentang tampilan bukan batas aman mesin.</p><p className="mt-2">Sakelar level rendah hanya menunjukkan aktif / tidak aktif. Getaran 4/5 dan pembacaan PMG 10/11 tetap berlingkup bersama.</p><p className="mt-2">Pencarian menyaring panel perangkat. Tren dan media tetap mengikuti unit aktif.</p></Panel>
        </aside>
      </div>}
    </section>}
    </div>
    <div role="tabpanel" id="settings-panel-history" aria-labelledby="settings-tab-history" hidden={tab !== 'history'}>
    {tab === 'history' && <div className="grid items-start gap-4 lg:grid-cols-2">
    <Panel className="p-5"><h2 className="mb-3 text-sm font-semibold">Riwayat target / status channel · {device.id}</h2><p className="mb-3 text-xs text-muted">Maksimum 100 perubahan lokal; bukan histori sensor atau audit operasional.</p>{channelTargets.history.filter(h => h.deviceId === device.id).length === 0 ? <p className="text-xs text-muted">Belum ada perubahan channel tambahan.</p> : <ol className="max-h-80 space-y-3 overflow-y-auto">{channelTargets.history.filter(h => h.deviceId === device.id).map((h, i) => <li key={`${h.timestamp}:${i}`} className="rounded-lg border border-border p-3 text-xs"><p className="font-medium">{h.tag} · {h.channel}: {formatChannelValue(h.before)} → {formatChannelValue(h.after)}</p><p className="mt-1 text-muted">{dateTime(h.timestamp)} · {controlCopy.success}</p></li>)}</ol>}</Panel>
    <Panel className="p-5"><h2 className="mb-3 text-sm font-semibold">Riwayat skenario perangkat · {device.id}</h2><p className="mb-3 text-xs text-muted">Maksimum 100 perubahan skenario; bukan audit operasional.</p>{equipmentSettings.history.filter(h => h.deviceId === device.id).length === 0 ? <p className="text-xs text-muted">Belum ada perubahan skenario perangkat.</p> : <ol className="max-h-80 space-y-3 overflow-y-auto">{equipmentSettings.history.filter(h => h.deviceId === device.id).map((h, i) => <li key={`${h.timestamp}:${i}`} className="rounded-lg border border-border p-3 text-xs"><p className="font-medium">{equipment.find(e => e.id === h.equipmentId)?.name}: {h.before ?? 'Belum diatur'} → {h.after}</p><p className="mt-1 text-muted">{dateTime(h.timestamp)} · {controlCopy.success}</p></li>)}</ol>}</Panel>
    <Panel className="p-5"><h2 className="mb-3 text-sm font-semibold">Riwayat perubahan · {device.id}</h2><p className="mb-3 text-xs text-muted">Maksimum 100 perubahan terbaru di browser ini; bukan audit operasional.</p>{controls.history.filter(h => h.deviceId === device.id).length === 0 ? <p className="text-xs text-muted">Belum ada perubahan pengaturan.</p> : <ol className="max-h-80 space-y-3 overflow-y-auto">{controls.history.filter(h => h.deviceId === device.id).map((h, i) => <li key={`${h.timestamp}:${i}`} className="rounded-lg border border-border p-3 text-xs"><p className="font-medium">{parameters[h.parameter].label}: {h.before === null ? 'Belum diatur' : h.before} → {h.after} {parameters[h.parameter].unit}</p><p className="mt-1 text-muted">{dateTime(h.timestamp)} · {controlCopy.success}</p></li>)}</ol>}</Panel>
    </div>}
    </div>
    <div role="tabpanel" id="settings-panel-widgets" aria-labelledby="settings-tab-widgets" hidden={tab !== 'widgets'}>
    {tab === 'widgets' && <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
      <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button disabled={widgets.length >= 50} onClick={() => setOpen(true)}><Plus size={16} />Tambah widget</Button></DialogTrigger><DialogContent><DialogTitle className="text-lg font-semibold">Tambah gauge widget</DialogTitle><DialogDescription className="mt-2 text-xs text-muted">Pilih unit, tag numerik, dan judul. Hanya tag numerik yang dapat dipilih.</DialogDescription>
        <div className="mt-4 space-y-3 text-xs">
          <label className="block"><span className="mb-1 block text-muted">Unit</span><select value={deviceId} onChange={e => selectDevice(e.target.value)} className="w-full rounded-lg border border-border bg-white dark:bg-surface px-2 py-2">{filteredDevices.map(d => <option key={d.id} value={d.id}>{d.id} · {d.name}</option>)}</select></label>
          <label className="block"><span className="mb-1 block text-muted">Tag</span><select value={parameter} onChange={e => setParameter(e.target.value as Parameter)} className="w-full rounded-lg border border-border bg-white dark:bg-surface px-2 py-2">{NUMERIC_PARAMS.map(p => <option key={p} value={p}>{parameters[p].label}</option>)}</select></label>
          <label className="block"><span className="mb-1 block text-muted">Judul (opsional)</span><input maxLength={120} value={title} onChange={e => setTitle(e.target.value)} placeholder={parameters[parameter].label} className="w-full rounded-lg border border-border bg-white dark:bg-surface px-2 py-2 outline-none focus:ring-2 focus:ring-blue-500" /></label>
          <div className="flex justify-end gap-2 pt-2"><Button variant="outline" onClick={() => setOpen(false)}>Batal</Button><Button disabled={widgets.length >= 50} onClick={add}>Tambah</Button></div>
        </div>
      </DialogContent></Dialog>
      </div>
    <p className="text-xs text-muted">{widgets.length} / 50 widget kustom tersimpan. Batas berlaku untuk seluruh site; widget bawaan perangkat tidak dihitung.</p>
    {storageError && <p role="alert" className="text-xs text-amber-700 dark:text-warning">Pengaturan tidak dapat disimpan; perubahan hanya tersedia selama sesi ini.</p>}
    <Panel className="min-w-0"><PanelHeading title="Gauge kustom" eyebrow={`${visible.length} widget`} />
      {visible.length === 0 ? <EmptyState title="Belum ada widget" description="Tambahkan gauge widget untuk menampilkan parameter per unit." /> : <div className="grid grid-cols-1 gap-3 px-5 pb-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map(w => { const d = devices.find(x => x.id === w.deviceId); return <div key={w.id} className="relative"><GaugeCard device={d} parameter={w.parameter} value={d?.telemetry[w.parameter] ?? null} quality={d ? parameterQuality(d, w.parameter) : 'offline'} /><div className="mt-2 flex justify-end gap-1"><button type="button" aria-label={`Hapus ${w.title}`} onClick={() => remove(w.id)} className="rounded-md border border-border bg-white dark:bg-surface p-1.5 text-muted hover:bg-slate-50 dark:hover:bg-surface-soft"><Trash2 size={14} /></button></div><p className="mt-1 text-center text-[10px] text-muted">{w.deviceId} · {w.title}</p></div>; })}
      </div>}
    </Panel>
    </div>}
    </div>
  </div>;
}
