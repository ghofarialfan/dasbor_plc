import { useDemo } from '@/context/demo-context';
import { useRef, useState } from 'react';
import { EmptyState, Panel, PanelHeading } from '@/components/shared';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { MachineCard } from '@/components/machines/machine-card';
import { MachineDetailPanel, MachineInstrumentList } from '@/components/machines/machine-detail-panel';
import { instruments, instrumentsForMachine, machines } from '@/data/machine-catalog';
import type { MachineAsset } from '@/types/machine-assets';

const unassignedInstruments = instruments.filter(instrument => instrument.relatedMachineIds.length === 0);

export function MachineGallery({ deviceId, initialMachineId }: { deviceId: string; initialMachineId: string | null }) {
  const { device } = useDemo();
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState('all');
  const search = query.trim().toLowerCase();
  const visibleMachines = machines.filter(machine => (kind === 'all' || machine.template === kind) && [machine.name, machine.id, String(machine.item), ...instrumentsForMachine(machine.id).map(i => `${i.tag} ${i.name}`)].join(' ').toLowerCase().includes(search));
  const initialMachine = machines.find(machine => machine.id === initialMachineId) ?? null;
  const [selectedMachine, setSelectedMachine] = useState<MachineAsset | null>(initialMachine);
  const [open, setOpen] = useState(Boolean(initialMachine));
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  return <div className="space-y-5">
    <p role="note" className="rounded-xl border border-blue-200 dark:border-accent/40 bg-blue-50 dark:bg-accent-soft px-4 py-3 text-xs font-medium text-blue-800 dark:text-accent">{deviceId} · Inventaris konseptual. Registri referensi bersama, bukan inventaris aktual terverifikasi per unit. Gambar merupakan ilustrasi generik, bukan foto perangkat.</p>
    <Dialog open={open} onOpenChange={setOpen}>
      <Panel>
        <div className="flex flex-wrap gap-2 p-5"><input aria-label="Cari mesin atau tag" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari mesin, item, atau tag" className="min-w-0 flex-1 rounded-lg border border-border p-2 text-xs" /><select aria-label="Jenis mesin" value={kind} onChange={e => setKind(e.target.value)} className="rounded-lg border border-border p-2 text-xs"><option value="all">Semua jenis</option>{Array.from(new Set(machines.map(m => m.template).filter(Boolean))).map(value => <option key={value} value={value!}>{value}</option>)}</select><button type="button" onClick={() => { setQuery(''); setKind('all'); }} className="rounded-lg border border-border px-3 py-2 text-xs">Reset filter</button></div>
        <PanelHeading title="Inventaris mesin" eyebrow={`${visibleMachines.length} dari ${machines.length} item`} />
        {visibleMachines.length ? <div className="grid grid-cols-1 items-stretch gap-4 px-5 pb-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {visibleMachines.map(machine => <DialogTrigger key={machine.id} asChild><MachineCard machine={machine} onClick={event => {
            triggerRef.current = event.currentTarget;
            setSelectedMachine(machine);
          }} /></DialogTrigger>)}
        </div> : <EmptyState title="Mesin tidak ditemukan" description="Ubah pencarian atau reset filter." />}
      </Panel>
      {selectedMachine && <MachineDetailPanel device={device} machine={selectedMachine} instruments={instrumentsForMachine(selectedMachine.id)} onCloseAutoFocus={event => {
        event.preventDefault();
        triggerRef.current?.focus();
      }} />}
    </Dialog>
    <Panel>
      <PanelHeading title="Instrumen tanpa relasi mesin" eyebrow={`${unassignedInstruments.length} tag dalam registri`} />
      <p className="px-5 pb-4 text-xs leading-relaxed text-muted">Tag tetap tercatat meskipun relasi mesinnya belum ditentukan. Cakupan dan kepastian pemetaan ditampilkan terpisah.</p>
      {unassignedInstruments.length ? <div className="px-5 pb-5"><MachineInstrumentList device={device} instruments={unassignedInstruments} /></div> : <EmptyState title="Tidak ada tag tanpa relasi mesin" description="Seluruh tag registri memiliki relasi mesin yang tercatat." />}
    </Panel>
  </div>;
}
