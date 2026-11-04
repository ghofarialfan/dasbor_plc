import { useMemo, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useDemo } from '@/context/demo-context';
import { trends, parameters } from '@/data/demo';
import { number, time } from '@/lib/utils';
import { Panel, PanelHeading, EmptyState } from '@/components/shared';

type TrendParam = 'rpm' | 'voltage' | 'frequency' | 'motorTemperature';
const PARAMS: TrendParam[] = ['rpm', 'voltage', 'frequency', 'motorTemperature'];
const COLORS = ['#2563eb', '#d97706', '#16a34a', '#9333ea'];

function bucketConfig(range: string) {
  if (range === '1H') return { count: 13, bucket: 1 };
  if (range === '6H') return { count: 73, bucket: 1 };
  if (range === '24H') return { count: 24, bucket: 12 };
  return { count: 7, bucket: 288 };
}

function seriesData(deviceId: string, param: TrendParam, range: string) {
  const { count, bucket } = bucketConfig(range);
  const window = trends[deviceId].slice(-count * bucket);
  const out: { time: string; value: number | null }[] = [];
  for (let b = 0; b < count; b++) {
    const slice = window.slice(b * bucket, (b + 1) * bucket);
    const vals = slice.map(s => s[param]).filter((v): v is number => v !== null);
    out.push({ time: slice[0]?.timestamp ?? '', value: vals.length ? Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)) : null });
  }
  return out;
}

function shortDate(value: string) { return new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', day: '2-digit', month: 'short' }).format(new Date(value)); }

export function ChartWidgetPage() {
  const { filteredDevices } = useDemo();
  const [deviceId, setDeviceId] = useState(filteredDevices[0]?.id ?? 'GEN-001');
  const [selected, setSelected] = useState<TrendParam[]>(['voltage']);
  const [range, setRange] = useState('6H');
  const device = filteredDevices.find(d => d.id === deviceId) ?? filteredDevices[0];

  const toggle = (p: TrendParam) => setSelected(prev => prev.includes(p) ? prev.filter(x => x !== p) : prev.length >= 2 ? [prev[1], p] : [...prev, p]);

  const data = useMemo(() => {
    if (!device) return [];
    const merged: Record<string, Record<string, number | null>> = {};
    selected.forEach(p => seriesData(device.id, p, range).forEach(row => { merged[row.time] = merged[row.time] ?? { time: row.time }; merged[row.time][p] = row.value; }));
    return Object.values(merged);
  }, [device, selected, range]);

  const label = range === '7D' ? shortDate : time;

  return <div className="space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">Power monitoring workspace</p><h1 className="text-[26px] font-semibold tracking-tight sm:text-[28px]">Chart Widget</h1><p className="mt-1 text-xs leading-relaxed text-muted">Grafik multi-seri dari data deterministik</p></div>
    </div>
    <Panel className="min-w-0"><PanelHeading title="Grafik parameter" eyebrow={device ? `${device.id} · ${range}` : 'Device'} />
      <div className="flex flex-wrap gap-2 px-5 pb-3">
        <select aria-label="Pilih device" value={deviceId} onChange={e => setDeviceId(e.target.value)} className="rounded-lg border border-border bg-white px-2 py-1.5 text-xs">{filteredDevices.map(d => <option key={d.id} value={d.id}>{d.id}</option>)}</select>
        {PARAMS.map(p => <button key={p} type="button" onClick={() => toggle(p)} aria-pressed={selected.includes(p)} className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-medium ${selected.includes(p) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-border text-muted hover:bg-slate-50'}`}>{parameters[p].label}</button>)}
        <div role="group" aria-label="Rentang waktu" className="flex gap-1">{['1H', '6H', '24H', '7D'].map(r => <button key={r} onClick={() => setRange(r)} aria-pressed={range === r} className={`rounded-md px-2 py-1.5 text-[10px] font-medium ${range === r ? 'bg-blue-50 text-blue-700' : 'text-muted hover:bg-slate-50'}`}>{r}</button>)}</div>
      </div>
      <div className="px-5 pb-3 text-[10px] text-muted">{range === '24H' ? 'Agregasi per jam.' : range === '7D' ? 'Agregasi per hari.' : 'Interval 5 menit.'}</div>
      <div className="h-[300px] min-w-0 px-2 pb-4">
        {!device || !device.online ? <EmptyState title="Belum ada data terkini" description="Unit offline tidak menampilkan riwayat." /> : selected.length === 0 ? <EmptyState title="Pilih parameter" description="Pilih minimal satu tag untuk menggambar grafik." /> : <ResponsiveContainer width="100%" height="100%"><LineChart data={data} margin={{ top: 10, left: 4, right: 6, bottom: 8 }}><CartesianGrid strokeDasharray="3 4" vertical={false} stroke="#e9edf3" /><XAxis dataKey="time" tickFormatter={label} minTickGap={32} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis yAxisId="left" width={52} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => number(Number(v))} />{selected.length > 1 && <YAxis yAxisId="right" orientation="right" width={52} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => number(Number(v))} />}<Tooltip formatter={(v, name) => [typeof v === 'number' ? `${number(v)} ${parameters[name as TrendParam].unit}` : '—', parameters[name as TrendParam].label]} contentStyle={{ borderRadius: 12, borderColor: '#e5eaf1', fontSize: 11 }} /><Legend />{selected.map((p, i) => <Line key={p} type="monotone" dataKey={p} name={p} yAxisId={i === 0 ? 'left' : 'right'} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={false} connectNulls={false} isAnimationActive={false} />)}</LineChart></ResponsiveContainer>}
      </div>
      <p className="border-t border-slate-100 px-5 py-3 text-[10px] text-muted">Seri dengan satuan berbeda memakai sumbu terpisah. Nilai null tidak diganti nol.</p>
    </Panel>
  </div>;
}
