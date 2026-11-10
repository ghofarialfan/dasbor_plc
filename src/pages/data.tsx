import { CapabilityHistory } from '@/components/capability-history';
import { telemetryPage, telemetryRows, trendParameters, type TrendParameter } from '@/data/queries';
import { useEffect, useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { useDemo } from '@/context/demo-context';
import { parameters, qualityLabels } from '@/data/demo';
import { dateTime } from '@/lib/utils';
import { Panel, PanelHeading, EmptyState } from '@/components/shared';
import { toCsv, downloadCsv } from '@/lib/csv';

type TrendParam = TrendParameter;
const TREND_PARAMS = trendParameters;
const RANGE_LABELS: Record<string, string> = { '1': '1 jam', '3': '3 jam', '6': '6 jam', '24': '24 jam', '168': '7 hari', '2160': '90 hari' };
const PAGE_SIZE = 50;

export function DataPage() {
  const { filteredDevices, siteId, device, selectDevice } = useDemo();
  const [allUnits, setAllUnits] = useState(true);
  const unit = allUnits ? 'all' : device.id;
  const [param, setParam] = useState<'all' | TrendParam>('all');
  useEffect(() => { setPage(1); }, [siteId, unit]);
  const [range, setRange] = useState('6');
  const [page, setPage] = useState(1);

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const units = useMemo(() => filteredDevices.filter(d => unit === 'all' || d.id === unit), [filteredDevices, unit]);
  const result = useMemo(() => telemetryPage(units, Number(range), param, page, PAGE_SIZE), [units, range, param, page]);
  const pageCount = Math.max(1, Math.ceil(result.total / PAGE_SIZE));
  const safePage = result.page;
  const pageRows = result.rows.map(r => ({ ...r, quality: qualityLabels[r.quality] }));

  const exportCsv = async () => {
    setExportError('');
    if (result.total > 250000) { setExportError('Ekspor dibatasi 250.000 baris per berkas. Pilih satu unit, satu parameter, atau rentang lebih pendek.'); return; }
    setExporting(true);
    try {
      const chunks = [toCsv([['waktu', 'unit', 'tag', 'parameter', 'nilai', 'satuan', 'kualitas']])];
      for (const d of units) {
        await new Promise(resolve => setTimeout(resolve, 0));
        const rows = telemetryRows([d], Number(range)).filter(r => param === 'all' || r.parameter === param);
        chunks.push(toCsv(rows.map(r => [r.time, r.unit, r.tag, r.parameter, r.value, r.unitLabel, qualityLabels[r.quality]])));
      }
      downloadCsv('genset-telemetry-prototype.csv', chunks.join('\n'));
    } catch { setExportError('Ekspor gagal. Kurangi rentang atau jumlah unit lalu coba kembali.'); }
    finally { setExporting(false); }
  };

  return <div className="space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand dark:text-accent">Power monitoring workspace</p><h1 className="text-[26px] font-semibold tracking-tight sm:text-[28px]">Data</h1><p className="mt-1 text-xs leading-relaxed text-muted">Riwayat telemetry dari sumber yang sama dengan gauge dan chart</p></div>
      <button type="button" onClick={exportCsv} disabled={exporting} className="inline-flex items-center gap-2 rounded-lg bg-brand px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"><Download size={15} />{exporting ? 'Menyiapkan CSV…' : 'Ekspor CSV'}</button>
    </div>
    {exportError && <p role="alert" className="text-xs text-amber-700 dark:text-warning">{exportError}</p>}
    <Panel className="min-w-0"><PanelHeading title="Tabel telemetry" eyebrow={`${result.total} baris`} />
      <div className="flex flex-wrap gap-2 px-5 pb-4">
        <select aria-label="Filter unit" value={unit} onChange={e => { setAllUnits(e.target.value === 'all'); if (e.target.value !== 'all') selectDevice(e.target.value); setPage(1); }} className="rounded-lg border border-border bg-white dark:bg-surface px-2 py-1.5 text-xs"><option value="all">Semua unit</option>{filteredDevices.map(d => <option key={d.id} value={d.id}>{d.id}</option>)}</select>
        <select aria-label="Filter parameter" value={param} onChange={e => { setParam(e.target.value as 'all' | TrendParam); setPage(1); }} className="rounded-lg border border-border bg-white dark:bg-surface px-2 py-1.5 text-xs"><option value="all">Semua parameter</option>{TREND_PARAMS.map(p => <option key={p} value={p}>{parameters[p].label}</option>)}</select>
        <div role="group" aria-label="Rentang waktu" className="flex gap-1">{['1', '3', '6', '24', '168', '2160'].map(r => <button key={r} onClick={() => { setRange(r); setPage(1); }} aria-pressed={range === r} className={`rounded-md px-2 py-1.5 text-[10px] font-medium ${range === r ? 'bg-blue-50 dark:bg-accent-soft text-blue-700 dark:text-accent' : 'text-muted hover:bg-slate-50 dark:hover:bg-surface-soft'}`}>{RANGE_LABELS[r]}</button>)}</div>
      </div>
      {result.total === 0 ? <EmptyState title="Tidak ada data" description="Tidak ada baris yang cocok dengan filter ini." /> : <div className="max-w-full overflow-x-auto px-5 pb-3"><table className="w-full min-w-[680px] text-left text-xs"><thead><tr className="border-b border-slate-200 dark:border-border text-[10px] uppercase tracking-wide text-muted"><th className="py-2 pr-3">Waktu</th><th className="py-2 pr-3">Unit</th><th className="py-2 pr-3">Tag</th><th className="py-2 pr-3">Parameter</th><th className="py-2 pr-3 text-right">Nilai</th><th className="py-2 pr-3">Satuan</th><th className="py-2">Kualitas</th></tr></thead><tbody>{pageRows.map((r, i) => <tr key={`${r.unit}-${r.time}-${r.parameter}-${i}`} className="border-b border-slate-100 dark:border-border"><td className="py-2 pr-3 tabular-nums text-muted">{dateTime(r.time)}</td><td className="py-2 pr-3 font-medium">{r.unit}</td><td className="py-2 pr-3">{r.tag}</td><td className="py-2 pr-3">{parameters[r.parameter].label}</td><td className="py-2 pr-3 text-right tabular-nums">{r.value === null ? '—' : String(r.value)}</td><td className="py-2 pr-3">{r.unitLabel}</td><td className="py-2">{r.quality}</td></tr>)}</tbody></table></div>}
      <div className="flex items-center justify-between gap-2 border-t border-slate-100 dark:border-border px-5 py-3 text-[10px] text-muted"><span>Halaman {safePage} dari {pageCount}</span><div className="flex gap-1"><button type="button" disabled={safePage <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="rounded-md border border-border px-2 py-1 disabled:opacity-40">Sebelumnya</button><button type="button" disabled={safePage >= pageCount} onClick={() => setPage(p => Math.min(pageCount, p + 1))} className="rounded-md border border-border px-2 py-1 disabled:opacity-40">Berikutnya</button></div></div>
    </Panel>
    <CapabilityHistory />
  </div>;
}
