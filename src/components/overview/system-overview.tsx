import { useRef, useState } from 'react';
import { useDemo } from '@/context/demo-context';
import { Dialog } from '@/components/ui/dialog';
import { EquipmentDetails } from './equipment-details';
import { MachineIllustration } from './machine-illustration';
import { SystemDiagram } from './system-diagram';

export function SystemOverview() {
  const { device } = useDemo();
  return <OverviewViews key={device.id} />;
}
function OverviewViews() {
  const [tab, setTab] = useState(0);
  const [selectedId, setSelectedId] = useState('');
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLElement | SVGElement | null>(null);
  const onSelect = (id: string) => {
    trigger.current = document.activeElement as HTMLElement | SVGElement;
    setSelectedId(id); setOpen(true);
  };
  const views = { selectedId, onSelect };
  return <Dialog open={open} onOpenChange={value => { setOpen(value); if (!value) requestAnimationFrame(() => trigger.current?.focus()); }}>
    <div role="tablist" aria-label="Tampilan sistem" className="mb-3 flex gap-2 border-b border-border pb-3">
      {['Ilustrasi Mesin', 'Diagram Sistem'].map((label, index) => <button key={label} id={`system-tab-${index}`} role="tab" aria-selected={tab === index} aria-controls={`system-panel-${index}`} tabIndex={tab === index ? 0 : -1} onClick={() => setTab(index)} onKeyDown={e => {
        if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
          e.preventDefault(); const next = e.key === 'Home' ? 0 : e.key === 'End' ? 1 : 1 - tab;
          setTab(next); document.getElementById(`system-tab-${next}`)?.focus();
        }
      }} className={`rounded-lg px-3 py-2 text-xs font-semibold ${tab === index ? 'bg-blue-50 text-blue-700' : 'text-muted hover:bg-slate-50'}`}>{label}</button>)}
    </div>
    {[0, 1].map(index => <div key={index} role="tabpanel" id={`system-panel-${index}`} aria-labelledby={`system-tab-${index}`} hidden={tab !== index}>{index === 0 ? <MachineIllustration {...views} /> : <SystemDiagram {...views} />}</div>)}
    {selectedId && <EquipmentDetails selectedId={selectedId} restoreFocus={() => trigger.current?.focus()} />}
  </Dialog>;
}
