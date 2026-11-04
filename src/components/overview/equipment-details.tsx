import { useDemo } from '@/context/demo-context';
import { equipment, instrumentsForEquipment, certaintyLabels, qualityLabels, readingsForInstrument, parameters } from '@/data/demo';
import { number } from '@/lib/utils';
import { DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CertaintyBadge } from '@/components/shared';

export function EquipmentDetails({ selectedId, restoreFocus }: { selectedId: string; restoreFocus: () => void }) {
  const { device } = useDemo();
  const selected = equipment.find(e => e.deviceId === device.id && e.id === selectedId)!;
  const associated = instrumentsForEquipment(device.id, selectedId);
  return <DialogContent onCloseAutoFocus={event => { event.preventDefault(); restoreFocus(); }}>
    <DialogTitle className="pr-6 text-lg font-semibold">{selected.name}</DialogTitle>
    <DialogDescription className="mt-2 text-xs text-muted">{device.id} · item / tag {selected.item} · konseptual, bukan approval engineering</DialogDescription>
    <div className="mt-4 space-y-4 text-xs leading-relaxed">
      <CertaintyBadge certainty={selected.certainty} />
      <p>Sumber identitas: {(selected.identitySources ?? ['pid-draft']).map(s => s === 'project-colleague' ? 'Keterangan rekan proyek' : 'PDF P&ID Genset PLTS (draf)').join(' + ')}</p>
      {selected.draftIdentity && <p className="text-muted">Catatan draf PDF (tidak diubah): {selected.draftIdentity}</p>}
      <p>{selected.function}</p><p className="text-muted">Belum pasti / batasan: {selected.notes}</p>
      {!associated.length && <p>Instrumen belum dipetakan · Nilai: —</p>}
      {associated.map(i => <section key={i.instanceId} className="space-y-2 rounded-xl border border-border p-3">
        <h4 className="font-semibold">{i.tag} · {i.name}</h4><p>{i.function}</p>
        <p className="text-muted">Sumber instrumen: PDF draf · {i.signal} · {certaintyLabels[i.certainty]}</p>
        {readingsForInstrument(device, i.tag).map((r, index) => <p key={index}>{r.parameter ? parameters[r.parameter].label : 'Status / nilai'}: <strong>{r.value === null ? '—' : typeof r.value === 'boolean' ? (r.value ? 'Aktif' : 'Tidak aktif') : number(r.value)}{r.value !== null && r.unit ? ` ${r.unit}` : ''}</strong> · {qualityLabels[r.quality]}</p>)}
        <p className="text-muted">{i.notes}</p>
      </section>)}
      <p className="text-muted">Nilai adalah mock per device, bukan spesifikasi OEM. Klarifikasi identitas tidak menetapkan rasio, kopling, kutub/rating alternator, atau fungsi PMG.</p>
    </div>
  </DialogContent>;
}
