import type { ComponentPropsWithoutRef } from 'react';
import { CircleHelp } from 'lucide-react';
import { EmptyState, Panel, PanelHeading } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { machineAssetUrl } from '@/data/machine-catalog';
import type { Certainty } from '@/types';
import type { MachineAsset, MachineInstrument, RelationScope } from '@/types/machine-assets';

const certaintyLabels: Record<Certainty, string> = {
  documented: 'Terdokumentasi',
  clarified: 'Diklarifikasi',
  assumed: 'Asumsi',
  tbd: 'Belum ditentukan',
};
const scopeLabels: Record<RelationScope, string> = {
  component: 'Komponen',
  area: 'Area',
  system: 'Sistem',
  unresolved: 'Belum ditentukan',
};

function SourcesAndNotes({ sources, notes }: { sources: string[]; notes: string[] }) {
  return <div className="space-y-3 text-xs leading-relaxed">
    <div><h4 className="mb-1 font-semibold text-foreground">Sumber</h4>{sources.length ? <ul className="list-disc space-y-1 pl-4 text-muted">{sources.map((source, index) => <li key={index} className="break-words">{source}</li>)}</ul> : <p className="text-muted">Belum ada sumber tercatat.</p>}</div>
    {notes.length > 0 && <div><h4 className="mb-1 font-semibold text-foreground">Catatan</h4><ul className="list-disc space-y-1 pl-4 text-muted">{notes.map((note, index) => <li key={index}>{note}</li>)}</ul></div>}
  </div>;
}

export function MachineInstrumentList({ instruments }: { instruments: MachineInstrument[] }) {
  return <ul className="space-y-3">{instruments.map(instrument => <li key={instrument.tag} className="min-w-0 rounded-xl border border-border p-4">
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div><h3 className="text-sm font-semibold">{instrument.tag}</h3><p className="mt-1 text-xs text-muted">{instrument.name}</p></div>
      <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600"><CircleHelp aria-hidden="true" size={12} />Unknown</span>
    </div>
    <p className="mt-3 text-xs leading-relaxed text-muted">{instrument.function}</p>
    <dl className="my-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
      <div><dt className="text-muted">Cakupan relasi</dt><dd className="mt-1 font-medium">{scopeLabels[instrument.relationScope]}</dd></div>
      <div><dt className="text-muted">Status pemetaan</dt><dd className="mt-1 font-medium">{instrument.mappingStatus === 'documented' ? 'Terdokumentasi' : 'Belum ditentukan'}</dd></div>
      <div><dt className="text-muted">Kepastian definisi</dt><dd className="mt-1 font-medium">{certaintyLabels[instrument.certainty]}</dd></div>
      <div><dt className="text-muted">Jenis nilai</dt><dd className="mt-1 font-medium">{instrument.valueType === 'analog' ? 'Analog' : instrument.valueType === 'digital' ? 'Digital' : 'Belum ditentukan'}</dd></div>
      <div className="col-span-2"><dt className="text-muted">Sinyal</dt><dd className="mt-1 break-words font-medium">{instrument.signal || '—'}</dd></div>
      {instrument.valueType === 'analog' && instrument.unit && <div><dt className="text-muted">Satuan referensi</dt><dd className="mt-1 font-medium">{instrument.unit}</dd></div>}
    </dl>
    <div className="mb-3 rounded-lg bg-slate-50 px-3 py-2"><p className="text-lg font-semibold" aria-label="Pembacaan terkini">—</p><p className="text-xs text-muted">Belum ada data terkini.</p></div>
    <SourcesAndNotes sources={instrument.sources} notes={instrument.notes} />
  </li>)}</ul>;
}

interface MachineDetailPanelProps {
  machine: MachineAsset;
  instruments: MachineInstrument[];
  onCloseAutoFocus?: ComponentPropsWithoutRef<typeof DialogContent>['onCloseAutoFocus'];
  layout?: 'drawer' | 'dialog';
}

export function MachineDetailPanel({ machine, instruments, onCloseAutoFocus, layout = 'drawer' }: MachineDetailPanelProps) {
  const assetUrl = machineAssetUrl(machine);
  return <DialogContent side={layout === 'drawer' ? 'right' : undefined} onCloseAutoFocus={onCloseAutoFocus}>
    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Item {machine.item}</p>
    <DialogTitle className="pr-7 text-xl font-semibold">{machine.name}</DialogTitle>
    <DialogDescription className="mt-2 text-xs leading-relaxed text-muted">{machine.function}</DialogDescription>
    <div className="mt-5 space-y-5">
      {assetUrl ? <div className="rounded-xl bg-slate-50 p-4"><img src={assetUrl} alt={`Ilustrasi referensi ${machine.name}`} className="h-48 w-full object-contain" /></div> : <EmptyState title="Ilustrasi belum tersedia" description="Geometri mesin belum ditentukan." />}
      <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600"><CircleHelp aria-hidden="true" size={14} />Unknown</span>
        <div className="text-right"><p className="text-lg font-semibold">—</p><p className="text-xs text-muted">Belum ada data terkini.</p></div>
      </div>
      <Panel><PanelHeading title="Kepastian inventaris" /><dl className="grid grid-cols-2 gap-4 px-5 pb-5 text-xs">
        <div><dt className="text-muted">Identitas</dt><dd className="mt-1 font-medium">{certaintyLabels[machine.identityCertainty]}</dd></div>
        <div><dt className="text-muted">Geometri</dt><dd className="mt-1 font-medium">{machine.geometryCertainty === 'generic-reference' ? 'Referensi generik' : 'Belum ditentukan'}</dd></div>
        <div><dt className="text-muted">Fungsi</dt><dd className="mt-1 font-medium">{certaintyLabels[machine.functionCertainty]}</dd></div>
        <div><dt className="text-muted">Pemetaan</dt><dd className="mt-1 font-medium">{certaintyLabels[machine.mappingCertainty]}</dd></div>
      </dl></Panel>
      <Panel><PanelHeading title="Asal informasi" /><div className="px-5 pb-5"><SourcesAndNotes sources={machine.sources} notes={machine.notes} /></div></Panel>
      <section aria-label="Instrumen terkait"><h2 className="mb-3 text-sm font-semibold">Instrumen terkait · {instruments.length}</h2>{instruments.length ? <MachineInstrumentList instruments={instruments} /> : <EmptyState title="Belum ada instrumen terkait" description="Belum ada pemetaan instrumen ke item ini dalam registri." />}</section>
      <DialogClose asChild><Button variant="outline" className="w-full">Tutup detail</Button></DialogClose>
    </div>
  </DialogContent>;
}
