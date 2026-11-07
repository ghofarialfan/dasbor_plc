import { ConceptRotor, rotatingConceptEquipment } from '@/components/conceptual-motion';
import type { ReactNode } from 'react';
import { useDemo } from '@/context/demo-context';
import { equipment, instruments } from '@/data/demo';
import { getOverviewDetailId, type OverviewConnection } from '@/components/overview/equipment-layout';
import { DialogTrigger } from '@/components/ui/dialog';
import type { EquipmentViewProps } from '@/types';
import { subsystemItem } from './subsystem-model';

export const connectionStyles = {
  shaft: { label: 'Poros/kopling', color: '#111827', dash: undefined },
  belt: { label: 'Belt', color: '#111827', dash: '7 5' },
  cable: { label: 'Kabel draf', color: '#dc2626', dash: undefined },
  lubrication: { label: 'Suplai oli', color: '#0f766e', dash: undefined },
};

export function LineSample({ style }: { style: OverviewConnection['style'] }) {
  const appearance = connectionStyles[style];
  return <svg width="36" height="12" aria-hidden="true" className="shrink-0"><path d="M 1 6 H 35" stroke={appearance.color} strokeWidth="2" strokeDasharray={appearance.dash} /></svg>;
}

export function PathLegend({ styles }: { styles: OverviewConnection['style'][] }) {
  return <div className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-muted" aria-label="Legenda jalur">{styles.map(style => <span key={style} className="flex items-center gap-2"><LineSample style={style} />{connectionStyles[style].label}</span>)}</div>;
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return <section className="min-w-0 space-y-3 rounded-xl border border-border bg-slate-50/50 p-4"><h3 className="text-sm font-semibold">{title}</h3>{children}</section>;
}

export function ScrollDiagram({ label, children }: { label: string; children: ReactNode }) {
  return <div role="region" aria-label={label} tabIndex={0} className="max-w-full overflow-x-auto overscroll-x-contain py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">{children}</div>;
}

export function ItemCard({ item, ...views }: EquipmentViewProps & { item: number }) {
  const entry = subsystemItem(item);
  return <DetailCard {...views} id={getOverviewDetailId(item)} label={entry.label} sub={`Item ${item}`} />;
}

export function DetailCard({ id, label, sub, selectedId, onSelect }: EquipmentViewProps & { id: string; label: string; sub: string }) {
  return <DialogTrigger asChild><button type="button" onClick={event => { event.currentTarget.focus(); onSelect(id); }} aria-label={`${label}, ${sub}. Buka detail`} className={`flex min-h-[88px] w-36 shrink-0 flex-col justify-center gap-2 rounded-xl border bg-white p-3 text-left text-xs transition hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${selectedId === id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-border'}`}><span className="text-[10px] text-muted">{sub}</span><span className="font-semibold">{label}</span>{rotatingConceptEquipment.includes(id) && label !== 'Damper' && label !== 'Ruang unit' && <ConceptRotor />}</button></DialogTrigger>;
}

export function EquipmentCards({ ids, ...views }: EquipmentViewProps & { ids: string[] }) {
  const { device } = useDemo();
  return <div className="flex flex-wrap gap-3">{ids.map(id => {
    const entry = equipment.find(candidate => candidate.deviceId === device.id && candidate.id === id);
    return entry ? <DetailCard key={id} {...views} id={id} label={entry.name} sub={entry.item} /> : null;
  })}</div>;
}

export function Connection({ connection }: { connection: OverviewConnection }) {
  return <span data-connection-id={connection.id} role="img" aria-label={`${connectionStyles[connection.style].label}: ${connection.provenance}. ${connection.certainty}`} title={`${connection.provenance} · ${connection.certainty}`} className="flex w-12 shrink-0 items-center justify-center"><LineSample style={connection.style} /></span>;
}

export function InstrumentReferences({ ids }: { ids: string[] }) {
  const { device } = useDemo();
  const entries = instruments.filter(instrument => instrument.deviceId === device.id && ids.includes(instrument.equipmentId));
  return <div className="space-y-2 border-t border-border pt-3"><h4 className="text-xs font-semibold">Instrumen terkait</h4><p className="text-[11px] leading-relaxed text-muted">Tag dan fungsi referensi; pembacaan serta kualitas data tersedia melalui detail komponen bila dipetakan.</p><ul className="grid gap-2 text-xs sm:grid-cols-2">{entries.map(instrument => <li key={instrument.instanceId} className="rounded-lg border border-border bg-white px-3 py-2"><span className="font-semibold">{instrument.tag}</span><span className="text-muted"> · {instrument.name}</span></li>)}</ul>{!entries.length && <p className="text-xs text-muted">Belum ada instrumen dipetakan.</p>}</div>;
}
