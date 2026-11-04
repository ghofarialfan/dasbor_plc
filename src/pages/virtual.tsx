import { useRef, useState } from 'react';
import { useDemo } from '@/context/demo-context';
import { Panel, PanelHeading } from '@/components/shared';
import { Dialog } from '@/components/ui/dialog';
import { EquipmentDetails } from '@/components/overview/equipment-details';
import { DriverOutput, OilLube, Ventilation, Security } from '@/components/virtual/subsystems';

const subsystems = [
  { id: 'driver', label: 'Penggerak & Output', Component: DriverOutput },
  { id: 'oil', label: 'Oli Pelumas', Component: OilLube },
  { id: 'vent', label: 'Ventilasi', Component: Ventilation },
  { id: 'security', label: 'Keamanan', Component: Security },
];

export function VirtualPage() {
  const { device, filteredDevices, selectDevice } = useDemo();
  const [tab, setTab] = useState(0);
  const [selectedId, setSelectedId] = useState('');
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLElement | SVGElement | null>(null);
  const onSelect = (id: string) => { trigger.current = document.activeElement as HTMLElement | SVGElement; setSelectedId(id); setOpen(true); };
  const Active = subsystems[tab].Component;
  return <Dialog open={open} onOpenChange={value => { setOpen(value); if (!value) requestAnimationFrame(() => trigger.current?.focus()); }}>
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">Power monitoring workspace</p><h1 className="text-[26px] font-semibold tracking-tight sm:text-[28px]">Virtual</h1><p className="mt-1 text-xs leading-relaxed text-muted">Subsistem per unit · ilustrasi skematik</p></div>
        <label className="text-xs text-muted"><span className="sr-only">Pilih device</span><select aria-label="Pilih device" value={device.id} onChange={e => selectDevice(e.target.value)} className="max-w-[150px] rounded-lg border border-border bg-white px-2 py-2 text-xs font-medium text-foreground">{filteredDevices.map(d => <option key={d.id} value={d.id}>{d.id}</option>)}</select></label>
      </div>
      <div role="tablist" aria-label="Subsistem" className="flex flex-wrap gap-2 border-b border-border pb-3">{subsystems.map((s, i) => <button key={s.id} id={`virtual-tab-${i}`} role="tab" aria-selected={tab === i} aria-controls="virtual-panel" tabIndex={tab === i ? 0 : -1} onClick={() => setTab(i)} className={`rounded-lg px-3 py-2 text-xs font-semibold ${tab === i ? 'bg-blue-50 text-blue-700' : 'text-muted hover:bg-slate-50'}`}>{s.label}</button>)}</div>
      <Panel className="min-w-0"><PanelHeading title={subsystems[tab].label} eyebrow={`${device.id} · ilustrasi skematik`} /><div id="virtual-panel" role="tabpanel" aria-labelledby={`virtual-tab-${tab}`} className="max-w-full overflow-x-auto px-5 pb-5"><Active selectedId={selectedId} onSelect={onSelect} /></div><p className="border-t border-slate-100 px-5 py-3 text-[10px] text-muted">Klik komponen untuk membuka detail. Parameter tanpa nilai menampilkan "Belum ada data".</p></Panel>
    </div>
    {selectedId && <EquipmentDetails selectedId={selectedId} restoreFocus={() => trigger.current?.focus()} />}
  </Dialog>;
}
