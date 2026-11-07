import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { CapabilityHistory } from '@/components/capability-history';
import { useMemo, useState } from 'react';
import { useDemo } from '@/context/demo-context';
import { parameters } from '@/data/demo';
import { historyParameters, historyDataset, type HistoryRange } from '@/data/history';
import { HistoryChart } from '@/components/history-chart';
import { Panel, EmptyState } from '@/components/shared';
import type { Parameter } from '@/types';

export function ChartWidgetPage() {
  const { filteredDevices, device, selectDevice } = useDemo();
  const [params, setParams] = useSearchParams();
  const requestedUnit = params.get('unit');
  useEffect(() => { if (requestedUnit && requestedUnit !== device.id && filteredDevices.some(d => d.id === requestedUnit)) selectDevice(requestedUnit); }, [requestedUnit, device.id, filteredDevices, selectDevice]);
  const [selected, setSelected] = useState<Parameter[]>(() => {
    const parameter = params.get('parameter') as Parameter;
    return historyParameters.includes(parameter) ? [parameter] : [...historyParameters];
  });
  const [range, setRange] = useState<HistoryRange>('6H');
  const [compare, setCompare] = useState(false);
  const series = useMemo(() => historyDataset(device.id, range), [device.id, range]);
  const toggle = (p: Parameter) => setSelected(prev => prev.includes(p) ? prev.filter(x => x !== p) : compare && prev.length >= 2 ? [prev[1], p] : [...prev, p]);
  return <div className="space-y-5">
    <div><p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">Power monitoring workspace</p><h1 className="text-[26px] font-semibold tracking-tight sm:text-[28px]">Tren &amp; Riwayat</h1><p className="mt-1 text-xs text-muted">Histori parameter per unit · grafik terpisah atau perbandingan dua seri</p></div>
    <Panel className="space-y-3 p-5 text-xs">
      <div className="flex flex-wrap items-center gap-3">
        <label>Unit<select value={device.id} onChange={e => { selectDevice(e.target.value); setParams(previous => { const next = new URLSearchParams(previous); next.delete('unit'); return next; }); }} className="ml-2 rounded-lg border border-border p-2">{filteredDevices.map(d => <option key={d.id} value={d.id}>{d.id} · {d.name}</option>)}</select></label>
        <label>Tampilan<select value={compare ? 'compare' : 'grid'} onChange={e => { const next = e.target.value === 'compare'; setCompare(next); if (next) setSelected(prev => prev.slice(0, 2)); }} className="ml-2 rounded-lg border border-border p-2"><option value="grid">Grafik per parameter</option><option value="compare">Bandingkan dua parameter</option></select></label>
      </div>
      <div role="group" aria-label="Rentang waktu" className="flex flex-wrap gap-2">{(['1H', '6H', '24H', '7D', 'ALL'] as HistoryRange[]).map(r => <button key={r} type="button" onClick={() => setRange(r)} aria-pressed={range === r} className={`rounded-lg border px-3 py-2 ${range === r ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-border'}`}>{r === 'ALL' ? 'Semua tersedia' : r}</button>)}</div>
      <div role="group" aria-label="Parameter historis" className="flex flex-wrap gap-2">{!compare && <button type="button" onClick={() => setSelected([...historyParameters])} className="rounded-lg border border-border px-3 py-2">Semua parameter</button>}{historyParameters.map(p => <button key={p} type="button" onClick={() => toggle(p)} aria-pressed={selected.includes(p)} className={`rounded-lg border px-3 py-2 ${selected.includes(p) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-border'}`}>{parameters[p].label}</button>)}</div>
      <p className="text-muted">Arsip 90 hari, interval 5 menit. Periode dihitung dari timestamp terakhir arsip. Tampilan periode panjang mempertahankan ekstrem dan celah; statistik memakai sampel mentah. GEN-001–GEN-003 memiliki enam channel utama; GEN-004 menguji arsip kosong.</p>
      {!device.online && <p role="status" className="text-amber-700">Unit sedang offline. Sampel historis yang tersimpan tetap dapat ditampilkan; tidak ada pembacaan terkini.</p>}
    </Panel>
    {selected.length === 0 ? <EmptyState title="Pilih parameter" description="Pilih minimal satu parameter untuk menampilkan histori." /> : compare ? <HistoryChart key={`${device.id}:${range}:${selected.join(',')}`} deviceId={device.id} selected={selected} series={series} /> : <div className="grid gap-5 xl:grid-cols-2">{selected.map(p => <HistoryChart key={`${device.id}:${range}:${p}`} deviceId={device.id} selected={[p]} series={series} />)}</div>}
    <CapabilityHistory chart />
  </div>;
}
