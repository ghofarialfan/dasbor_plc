import { ConceptualMotion } from '@/components/conceptual-motion';
import { useRef, useState } from 'react';
import { useDemo } from '@/context/demo-context';
import { Panel, PanelHeading, StatusBadge } from '@/components/shared';
import { MachineIllustration } from '@/components/overview/machine-illustration';
import { MachineDetailPanel } from '@/components/machines/machine-detail-panel';
import { machines, instrumentsForMachine } from '@/data/machine-catalog';
import { virtualTabIndex } from '@/components/virtual/navigation';
import { Dialog } from '@/components/ui/dialog';
import { EquipmentDetails } from '@/components/overview/equipment-details';
import { DriverOutput, OilLube, Ventilation, Security } from '@/components/virtual/subsystems';

const subsystems = [
  { id: 'complete', label: 'Sistem lengkap', Component: MachineIllustration },
  { id: 'driver', label: 'Penggerak & Output', Component: DriverOutput },
  { id: 'oil', label: 'Oli Pelumas', Component: OilLube },
  { id: 'vent', label: 'Ventilasi', Component: Ventilation },
  { id: 'security', label: 'Keamanan', Component: Security },
];

export function VirtualPage() {
  const { device } = useDemo();
  return <VirtualUnit key={device.id} />;
}

function VirtualUnit() {
  const { device, filteredDevices, selectDevice } = useDemo();
  const [tab, setTab] = useState(0);
  const [selectedId, setSelectedId] = useState('');
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLElement | SVGElement | null>(null);
  const onSelect = (id: string) => { trigger.current = document.activeElement as HTMLElement | SVGElement; setSelectedId(id); setOpen(true); };
  const catalogMachine = selectedId.startsWith('catalog-item-') ? machines.find(machine => machine.item === Number(selectedId.slice('catalog-item-'.length))) : undefined;
  const changeTab = (index: number) => { setTab(index); setSelectedId(''); setOpen(false); };
  const Active = subsystems[tab].Component;
  return <Dialog open={open} onOpenChange={value => { setOpen(value); if (!value) requestAnimationFrame(() => trigger.current?.focus()); }}>
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">Power monitoring workspace</p><h1 className="text-[26px] font-semibold tracking-tight sm:text-[28px]">Visualisasi Sistem</h1><p className="mt-1 text-xs leading-relaxed text-muted">Diagram sistem dan subsistem per unit · Ilustrasi konseptual</p></div>
        <label className="text-xs text-muted"><span className="sr-only">Pilih device</span><select aria-label="Pilih device" value={device.id} onChange={e => selectDevice(e.target.value)} className="max-w-[150px] rounded-lg border border-border bg-white px-2 py-2 text-xs font-medium text-foreground">{filteredDevices.map(d => <option key={d.id} value={d.id}>{d.id}</option>)}</select></label>
      </div>
      <div className="flex flex-wrap items-center gap-2"><span className="text-xs font-semibold">{device.id} · Status unit</span><StatusBadge device={device} animated /><span className="text-[11px] text-muted">Status unit tidak menetapkan status setiap komponen.</span></div>
      <div role="tablist" aria-label="Subsistem" className="flex flex-wrap gap-2 border-b border-border pb-3">{subsystems.map((s, i) => <button key={s.id} id={`virtual-tab-${i}`} role="tab" aria-selected={tab === i} aria-controls="virtual-panel" tabIndex={tab === i ? 0 : -1} onKeyDown={e => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) { e.preventDefault(); const next = virtualTabIndex(tab, e.key, subsystems.length); changeTab(next); document.getElementById(`virtual-tab-${next}`)?.focus(); } }} onClick={() => changeTab(i)} className={`rounded-lg px-3 py-2 text-xs font-semibold ${tab === i ? 'bg-blue-50 text-blue-700' : 'text-muted hover:bg-slate-50'}`}>{s.label}</button>)}</div>
      <Panel className="min-w-0"><PanelHeading title={subsystems[tab].label} eyebrow={`${device.id} · ilustrasi skematik`} /><div id="virtual-panel" role="tabpanel" aria-labelledby={`virtual-tab-${tab}`} className="max-w-full overflow-x-auto px-5 pb-5"><ConceptualMotion key={`${device.id}-${tab}`}><Active key={device.id} selectedId={selectedId} onSelect={onSelect} /></ConceptualMotion></div><p className="border-t border-slate-100 px-5 py-3 text-[10px] text-muted">Klik komponen untuk membuka detail. Parameter tanpa nilai menampilkan "Belum ada data".</p></Panel>
      <p className="text-xs leading-relaxed text-muted">Mode baca saja. Tata letak konseptual, bukan inventaris aktual terverifikasi per unit. Kontrol jarak jauh belum diaktifkan.</p>
    </div>
    {catalogMachine && <MachineDetailPanel machine={catalogMachine} instruments={instrumentsForMachine(catalogMachine.id)} layout="dialog" onCloseAutoFocus={event => { event.preventDefault(); trigger.current?.focus(); }} />}
    {selectedId && !selectedId.startsWith('catalog-item-') && <EquipmentDetails selectedId={selectedId} restoreFocus={() => trigger.current?.focus()} />}
  </Dialog>;
}
