import { useMemo, useState } from 'react';
import { Brush, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { parameters } from '@/data/demo';
import { alignHistory, historyDisplayIndices, historyStats, type HistoryPoint } from '@/data/history';
import type { Parameter } from '@/types';
import { dateTime, number, time } from '@/lib/utils';
import { Panel, PanelHeading, EmptyState } from '@/components/shared';

export const historyColors: Record<Parameter, string> = { rpm: '#2563eb', voltage: '#d97706', frequency: '#16a34a', motorTemperature: '#9333ea', roomTemperature: '#0891b2', bldcTemperature: '#db2777' };
export function HistoryChart({ deviceId, selected, series }: { deviceId: string; selected: Parameter[]; series: Partial<Record<Parameter, HistoryPoint[]>> }) {
  const raw = useMemo(() => alignHistory(selected, series), [selected, series]);
  const indices = useMemo(() => historyDisplayIndices(raw, selected), [raw, selected]);
  const data = useMemo(() => indices.map(i => raw[i]), [indices, raw]);
  const [viewport, setViewport] = useState({ startIndex: 0, endIndex: Math.max(0, data.length - 1) });
  const hasData = selected.some(p => historyStats(series[p] ?? []).count > 0);
  const label = selected.length === 1 ? parameters[selected[0]].label : 'Perbandingan parameter';
  return <Panel className="min-w-0"><PanelHeading title={label} eyebrow={deviceId} />
    <div className="px-5 pb-3 text-xs text-muted">{selected.map(p => {
      const stats = historyStats(raw.slice(indices[viewport.startIndex] ?? 0, (indices[viewport.endIndex] ?? raw.length - 1) + 1).map(row => ({ time: row.time, value: row[p] ?? null })));
      return <p key={p} className="mb-1">{parameters[p].label} · Min {number(stats.min)} · Maks {number(stats.max)} · Rata-rata {number(stats.average)} {parameters[p].unit} · {stats.count} sampel valid</p>;
    })}</div>
    <div className="h-[320px] min-w-0 px-2 pb-4">{!hasData ? <EmptyState title="Belum ada data historis" description="Tidak ada sampel valid untuk parameter dan periode ini. Nilai monitoring saat ini tidak digunakan sebagai pengganti histori." /> : <ResponsiveContainer width="100%" height="100%"><LineChart data={data} margin={{ top: 10, left: 4, right: 6, bottom: 8 }}>
      <CartesianGrid strokeDasharray="3 4" vertical={false} stroke="#e9edf3" />
      <XAxis dataKey="time" tickFormatter={v => dateTime(String(v)).split(',')[0] + ' ' + time(String(v))} minTickGap={60} tick={{ fontSize: 10 }} />
      {selected.map((p, i) => <YAxis key={p} yAxisId={p} orientation={i === 0 ? 'left' : 'right'} width={55} label={{ value: parameters[p].unit, angle: i === 0 ? -90 : 90, position: i === 0 ? 'insideLeft' : 'insideRight' }} tick={{ fontSize: 10 }} tickFormatter={v => number(Number(v))} />)}
      <Tooltip labelFormatter={v => `${deviceId} · ${dateTime(String(v))}`} formatter={(v, name) => [typeof v === 'number' ? `${number(v)} ${parameters[name as Parameter].unit}` : '—', `${parameters[name as Parameter].label} · ${parameters[name as Parameter].tag}`]} contentStyle={{ borderRadius: 12, fontSize: 11 }} />
      <Legend formatter={name => parameters[name as Parameter].label} />
      {selected.map(p => <Line key={p} type="linear" dataKey={p} name={p} yAxisId={p} stroke={historyColors[p]} strokeWidth={2} dot={false} connectNulls={false} isAnimationActive={false} />)}
      <Brush dataKey="time" height={24} tickFormatter={v => time(String(v))} startIndex={viewport.startIndex} endIndex={viewport.endIndex} onChange={v => { if (v.startIndex !== undefined && v.endIndex !== undefined) setViewport({ startIndex: v.startIndex, endIndex: v.endIndex }); }} />
    </LineChart></ResponsiveContainer>}</div>
    <p className="border-t border-slate-100 px-5 py-3 text-[10px] text-muted">Geser pembatas di bawah grafik untuk zoom; statistik mengikuti area terpilih. Data kosong tetap menjadi celah. Tidak mencakup target atau skenario manual.</p>
  </Panel>;
}
