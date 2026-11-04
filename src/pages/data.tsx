import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { useDemo } from '@/context/demo-context';
import { trends, parameters, parameterQuality, qualityLabels } from '@/data/demo';
import { dateTime } from '@/lib/utils';
import { Panel, PanelHeading, EmptyState } from '@/components/shared';
import { toCsv, downloadCsv, isoWithZone } from '@/lib/csv';

type TrendParam = 'rpm' | 'voltage' | 'frequency' | 'motorTemperature';
const TREND_PARAMS: TrendParam[] = ['rpm', 'voltage', 'frequency', 'motorTemperature'];
const RANGE_SAMPLES: Record<string, number> = { '1': 13, '3': 37, '6': 73, '24': 289, '168': 2017 };
const RANGE_LABELS: Record<string, string> = { '1': '1 jam', '3': '3 jam', '6': '6 jam', '24': '24 jam', '168': '7 hari' };
const PAGE_SIZE = 50;

type Row = { time: string; unit: string; tag: string; parameter: TrendParam; value: number | null; unitLabel: string; quality: string };

export function DataPage() {
  const { filteredDevices } = useDemo();
  const [unit, setUnit] = useState('all');
  const [param, setParam] = useState<'all' | TrendParam>('all');
  const [range, setRange] = useState('6');
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    const out: Row[] = [];
    for (const d of filteredDevices) {
      for (const s of trends[d.id].slice(-RANGE_SAMPLES[range])) {
        for (const p of TREND_PARAMS) {
          out.push({ time: s.timestamp, unit: d.id, tag: parameters[p].tag, parameter: p, value: s[p], unitLabel: parameters[p].unit, quality: qualityLabels[parameterQuality(d, p)] });
        }
      }
    }
    return out;
  }, [filteredDevices, range]);

  const filtered = useMemo(() => rows.filter(r => (unit === 'all' || r.unit === unit) && (param === 'all' || r.parameter === param)), [rows, unit, param]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const exportCsv = () => {
    const header = ['waktu', 'unit', 'tag', 'parameter', 'nilai', 'satuan', 'kualitas'];
    const body = filtered.map(r => [isoWithZone(r.time), r.unit, r.tag, r.parameter, r.value, r.unitLabel, r.quality]);
    const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '');
    downloadCsv(`genset-telemetry-prototype-${stamp}.csv`, toCsv([header, ...body]));
  };

  return <div className="space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">Power monitoring workspace</p><h1 className="text-[26px] font-semibold tracking-tight sm:text-[28px]">Data</h1><p className="mt-1 text-xs leading-relaxed text-muted">Riwayat telemetry dari sumber yang sama dengan gauge dan chart</p></div>
      <button type="button" onClick={exportCsv} className="inline-flex items-center gap-2 rounded-lg bg-brand px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"><Download size={15} />Ekspor CSV</button>
    </div>
    <Panel className="min-w-0"><PanelHeading title="Tabel telemetry" eyebrow={`${filtered.length} baris`} />
      <div className="flex flex-wrap gap-2 px-5 pb-4">
        <select aria-label="Filter unit" value={unit} onChange={e => { setUnit(e.target.value); setPage(1); }} className="rounded-lg border border-border bg-white px-2 py-1.5 text-xs"><option value="all">Semua unit</option>{filteredDevices.map(d => <option key={d.id} value={d.id}>{d.id}</option>)}</select>
        <select aria-label="Filter parameter" value={param} onChange={e => { setParam(e.target.value as 'all' | TrendParam); setPage(1); }} className="rounded-lg border border-border bg-white px-2 py-1.5 text-xs"><option value="all">Semua parameter</option>{TREND_PARAMS.map(p => <option key={p} value={p}>{parameters[p].label}</option>)}</select>
        <div role="group" aria-label="Rentang waktu" className="flex gap-1">{['1', '3', '6', '24', '168'].map(r => <button key={r} onClick={() => { setRange(r); setPage(1); }} aria-pressed={range === r} className={`rounded-md px-2 py-1.5 text-[10px] font-medium ${range === r ? 'bg-blue-50 text-blue-700' : 'text-muted hover:bg-slate-50'}`}>{RANGE_LABELS[r]}</button>)}</div>
      </div>
      {filtered.length === 0 ? <EmptyState title="Tidak ada data" description="Tidak ada baris yang cocok dengan filter ini." /> : <div className="max-w-full overflow-x-auto px-5 pb-3"><table className="w-full min-w-[680px] text-left text-xs"><thead><tr className="border-b border-slate-200 text-[10px] uppercase tracking-wide text-muted"><th className="py-2 pr-3">Waktu</th><th className="py-2 pr-3">Unit</th><th className="py-2 pr-3">Tag</th><th className="py-2 pr-3">Parameter</th><th className="py-2 pr-3 text-right">Nilai</th><th className="py-2 pr-3">Satuan</th><th className="py-2">Kualitas</th></tr></thead><tbody>{pageRows.map((r, i) => <tr key={`${r.unit}-${r.time}-${r.parameter}-${i}`} className="border-b border-slate-100"><td className="py-2 pr-3 tabular-nums text-muted">{dateTime(r.time)}</td><td className="py-2 pr-3 font-medium">{r.unit}</td><td className="py-2 pr-3">{r.tag}</td><td className="py-2 pr-3">{parameters[r.parameter].label}</td><td className="py-2 pr-3 text-right tabular-nums">{r.value === null ? '—' : String(r.value)}</td><td className="py-2 pr-3">{r.unitLabel}</td><td className="py-2">{r.quality}</td></tr>)}</tbody></table></div>}
      <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-5 py-3 text-[10px] text-muted"><span>Halaman {safePage} dari {pageCount}</span><div className="flex gap-1"><button type="button" disabled={safePage <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="rounded-md border border-border px-2 py-1 disabled:opacity-40">Sebelumnya</button><button type="button" disabled={safePage >= pageCount} onClick={() => setPage(p => Math.min(pageCount, p + 1))} className="rounded-md border border-border px-2 py-1 disabled:opacity-40">Berikutnya</button></div></div>
    </Panel>
  </div>;
}
