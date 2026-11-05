import { useRef, useState } from 'react';
import { EmptyState, Panel, PanelHeading } from '@/components/shared';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { MachineCard } from '@/components/machines/machine-card';
import { MachineDetailPanel, MachineInstrumentList } from '@/components/machines/machine-detail-panel';
import { instruments, instrumentsForMachine, machines } from '@/data/machine-catalog';
import type { MachineAsset } from '@/types/machine-assets';

const unassignedInstruments = instruments.filter(instrument => instrument.relatedMachineIds.length === 0);

export function MachineGallery() {
  const [selectedMachine, setSelectedMachine] = useState<MachineAsset | null>(null);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  return <div className="space-y-5">
    <p role="note" className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs font-medium text-blue-800">Inventaris konseptual — Belum ada data</p>
    <Dialog open={open} onOpenChange={setOpen}>
      <Panel>
        <PanelHeading title="Inventaris mesin" eyebrow={`${machines.length} item`} />
        {machines.length ? <div className="grid grid-cols-1 items-stretch gap-4 px-5 pb-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {machines.map(machine => <DialogTrigger key={machine.id} asChild><MachineCard machine={machine} onClick={event => {
            triggerRef.current = event.currentTarget;
            setSelectedMachine(machine);
          }} /></DialogTrigger>)}
        </div> : <EmptyState title="Belum ada mesin" description="Inventaris mesin belum tersedia." />}
      </Panel>
      {selectedMachine && <MachineDetailPanel machine={selectedMachine} instruments={instrumentsForMachine(selectedMachine.id)} onCloseAutoFocus={event => {
        event.preventDefault();
        triggerRef.current?.focus();
      }} />}
    </Dialog>
    <Panel>
      <PanelHeading title="Instrumen tanpa relasi mesin" eyebrow={`${unassignedInstruments.length} tag dalam registri`} />
      <p className="px-5 pb-4 text-xs leading-relaxed text-muted">Tag tetap tercatat meskipun relasi mesinnya belum ditentukan. Cakupan dan kepastian pemetaan ditampilkan terpisah.</p>
      {unassignedInstruments.length ? <div className="px-5 pb-5"><MachineInstrumentList instruments={unassignedInstruments} /></div> : <EmptyState title="Tidak ada tag tanpa relasi mesin" description="Seluruh tag registri memiliki relasi mesin yang tercatat." />}
    </Panel>
  </div>;
}
