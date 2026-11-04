import { useDemo } from '@/context/demo-context';
import { equipment, flowLinks, mainSequence, certaintyLabels } from '@/data/demo';
import type { FlowLink, PathKind, EquipmentViewProps } from '@/types';
import { DialogTrigger } from '@/components/ui/dialog';
import { CertaintyBadge } from '@/components/shared';

const pathStyles: Record<PathKind, { label: string; dash?: string }> = {
  electrical: { label: 'Listrik' }, mechanical: { label: 'Mekanis', dash: '9 5' },
  belt: { label: 'Belt', dash: '9 3 2 3' }, signal: { label: 'Sinyal', dash: '2 4' },
};
function LineSample({ kind }: { kind: PathKind }) {
  return <svg width="36" height="12" aria-hidden="true" className="shrink-0"><line x1="1" y1="6" x2="35" y2="6" stroke="#466389" strokeWidth="2" strokeDasharray={pathStyles[kind].dash} /></svg>;
}
function Connector({ link }: { link: FlowLink }) {
  return <div className="flex w-20 shrink-0 flex-col items-center justify-center gap-1 text-center text-[11px] text-muted" title={link.notes}><LineSample kind={link.kind} /><span>{pathStyles[link.kind].label}</span>{link.certainty !== 'documented' && <strong className="text-amber-700">{certaintyLabels[link.certainty]}</strong>}</div>;
}
export function SystemDiagram({ selectedId, onSelect }: EquipmentViewProps) {
  const { device } = useDemo();
  const available = equipment.filter(e => e.deviceId === device.id);
  const node = (id: string) => {
    const e = available.find(entry => entry.id === id)!;
    return <DialogTrigger asChild key={id}><button onClick={() => onSelect(id)} className={` ${selectedId === id ? 'ring-2 ring-blue-500' : ''} flex min-h-28 w-40 shrink-0 flex-col items-start justify-center gap-2 rounded-xl border border-border bg-white p-3 text-left shadow-sm transition hover:border-blue-300 hover:bg-blue-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`} aria-label={`Detail ${device.id} ${e.name}, item ${e.item}`}><span className="text-[11px] text-muted">Item / tag {e.item}</span><span className="text-xs font-semibold">{e.name}</span><CertaintyBadge certainty={e.certainty} /></button></DialogTrigger>;
  };
  const row = (ids: string[]) => <div className="flex w-max items-stretch py-2">{ids.map((id, index) => <div key={id} className="flex">{index > 0 && <Connector link={flowLinks.find(l => l.from === ids[index - 1] && l.to === id)!} />}{node(id)}</div>)}</div>;
  const summary = (title: string, ids: string[]) => <div className="rounded-xl border border-border bg-slate-50/60 p-3"><h4 className="mb-2 text-xs font-semibold">{title}</h4><div className="flex flex-wrap gap-2">{ids.map(node)}</div></div>;
  return <>
    <div className="space-y-3 pb-4">
      <p className="text-xs leading-relaxed text-muted">Ringkasan draf konseptual · klik peralatan untuk detail. Urutan item bukan detail kopling atau arah transfer mekanis. Geser diagram bila diperlukan.</p>
      <div className="max-w-full overflow-x-auto rounded-xl bg-slate-50 p-3" role="region" aria-label="Urutan sistem konseptual" tabIndex={0}>{row(mainSequence)}</div>
      <div className="max-w-full overflow-x-auto rounded-xl border border-blue-100 bg-blue-50/30 p-3" role="region" aria-label="Cabang listrik dari item 7" tabIndex={0}><p className="mb-1 text-xs font-medium">Cabang listrik dari item 7 · PM-01 mengukur di output 17</p>{row(['alternator', 'breaker', 'output'])}</div>
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-muted" aria-label="Legenda jalur">{(Object.keys(pathStyles) as PathKind[]).map(kind => <span className="flex items-center gap-1" key={kind}><LineSample kind={kind} />{pathStyles[kind].label}</span>)}<span>△ Asumsi hubungan</span><span>? TBD hubungan</span></div>
      <p className="text-[11px] leading-relaxed text-muted">Pola garis hanya membedakan jenis jalur; kepastian ditulis terpisah. Belt/sinyal hanya legenda, tanpa tambahan sambungan yang belum jelas.</p>
      <div className="grid gap-3 2xl:grid-cols-2">{summary('Pengukuran deret poros · ST-401', ['shaft-train'])}{summary('Oli · TK-19 / TK-20 / P-201 / PT-201', ['oil19', 'oil20', 'pump'])}{summary('Ventilasi · M-301 / DMP-301 / TT-303', ['ventilation'])}{summary('PMG 10/11 & AVR-01 · fungsi asumsi', ['pmg', 'avr'])}</div>
    </div>
  </>;
}
