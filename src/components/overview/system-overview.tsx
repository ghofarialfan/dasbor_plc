import { ConceptualMotion } from '@/components/conceptual-motion';
import { machines, instrumentsForMachine } from '@/data/machine-catalog';
import { MachineDetailPanel } from '@/components/machines/machine-detail-panel';
import { useRef, useState } from 'react';
import { useDemo } from '@/context/demo-context';
import { Dialog } from '@/components/ui/dialog';
import { EquipmentDetails } from './equipment-details';
import { MachineIllustration } from './machine-illustration';

export function SystemOverview() {
  const { device } = useDemo();
  return <OverviewViews key={device.id} />;
}
function OverviewViews() {
  const [selectedId, setSelectedId] = useState('');
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLElement | SVGElement | null>(null);
  const onSelect = (id: string) => {
    trigger.current = document.activeElement as HTMLElement | SVGElement;
    setSelectedId(id); setOpen(true);
  };
  const views = { selectedId, onSelect };
  const catalogMachine = selectedId.startsWith('catalog-item-') ? machines.find(machine => machine.item === Number(selectedId.slice('catalog-item-'.length))) : undefined;
  return <Dialog open={open} onOpenChange={value => { setOpen(value); if (!value) requestAnimationFrame(() => trigger.current?.focus()); }}>
    <ConceptualMotion><MachineIllustration {...views} showSupportingPanels={false} /></ConceptualMotion>
    {catalogMachine && <MachineDetailPanel machine={catalogMachine} instruments={instrumentsForMachine(catalogMachine.id)} layout="dialog" onCloseAutoFocus={event => { event.preventDefault(); trigger.current?.focus(); }} />}
    {selectedId && !selectedId.startsWith('catalog-item-') && <EquipmentDetails selectedId={selectedId} restoreFocus={() => trigger.current?.focus()} />}
  </Dialog>;
}
