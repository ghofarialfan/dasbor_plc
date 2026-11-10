import { Link } from 'react-router-dom';
import { machines } from '@/data/machine-catalog';
import { useDemo } from '@/context/demo-context';

import { equipment, instrumentsForEquipment, certaintyLabels, qualityLabels, readingsForInstrument, parameters } from '@/data/demo';
import { ChannelReading } from '@/components/channel-reading';
import { DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CertaintyBadge } from '@/components/shared';

export function EquipmentDetails({ selectedId, restoreFocus }: { selectedId: string; restoreFocus: () => void }) {
  const { device } = useDemo();
  const selected = equipment.find(e => e.deviceId === device.id && e.id === selectedId)!;
  const associated = instrumentsForEquipment(device.id, selectedId);
  const catalogMachine = machines.find(machine => String(machine.item) === selected.item);
  return <DialogContent onCloseAutoFocus={event => { event.preventDefault(); restoreFocus(); }}>
    <DialogTitle className="pr-6 text-lg font-semibold">{selected.name}</DialogTitle>
    <DialogDescription className="mt-2 text-xs text-muted">{device.id} · item / tag {selected.item} · ilustrasi skematik</DialogDescription>
    <div className="mt-4 space-y-4 text-xs leading-relaxed">
      <section className="space-y-2 rounded-xl border border-border p-3">
        <h4 className="font-semibold">Status desain</h4>
        <CertaintyBadge certainty={selected.certainty} />
        <p>Sumber identitas: {(selected.identitySources ?? ['pid-draft']).map(s => s === 'project-colleague' ? 'Keterangan rekan proyek' : 'PDF P&ID Genset PLTS (draf)').join(' + ')}</p>
        {selected.draftIdentity && <p className="text-muted">Catatan draf PDF (tidak diubah): {selected.draftIdentity}</p>}
        <p className="text-muted">Ambang peringatan bukan batas proteksi PLC.</p>
      </section>
      <Link className="inline-flex rounded-lg bg-blue-50 dark:bg-accent-soft px-3 py-2 font-semibold text-blue-700 dark:text-accent hover:bg-blue-100 dark:hover:bg-accent-soft" to={`/device?tab=machines${catalogMachine ? `&machine=${catalogMachine.id}` : ''}`}>Lihat di Device</Link>
      <p>{selected.function}</p>
      <p className="text-muted">Belum pasti / batasan: {selected.notes}</p>
      {selectedId === 'ventilation' && <section className="space-y-2 rounded-xl border border-border p-3"><h4 className="font-semibold">Status komponen ventilasi</h4><p>M-301 · Kipas: <strong>Status belum tersedia</strong></p><p>DMP-301 · Damper: <strong>Posisi belum tersedia</strong></p><p className="text-muted">Status unit generator tidak menetapkan status kipas atau posisi damper. Belum ada pemetaan feedback perangkat aktual.</p></section>}
      {!associated.length && <p>Instrumen belum dipetakan · Nilai: —</p>}
      {associated.map(i => <section key={i.instanceId} className="space-y-2 rounded-xl border border-border p-3">
        <h4 className="font-semibold">{i.tag} · {i.name}</h4><p>{i.function}</p>
        <section className="rounded-lg bg-slate-50 dark:bg-surface-soft p-2"><h5 className="font-semibold">Status desain</h5><p className="text-muted">Sumber instrumen: {i.tag.startsWith('DEMO:') ? 'Asumsi kondisi lokal; bukan tag PLC' : 'PDF draf'} · {i.signal} · {certaintyLabels[i.certainty]}</p></section>
        {readingsForInstrument(device, i.tag).map((r, index) => <div key={index}><p>{r.parameter ? parameters[r.parameter].label : r.label ?? 'Status / nilai'}</p><ChannelReading reading={r} valueType={i.valueType} /><p className="text-muted">{qualityLabels[r.quality]}{r.assumption && ` · ${r.assumption}`}</p></div>)}
        <p className="text-muted">{i.notes}</p>
      </section>)}
      <p className="text-muted">Klarifikasi identitas tidak menetapkan rasio, kopling, kutub/rating alternator, atau fungsi PMG.</p>
    </div>
  </DialogContent>;
}
