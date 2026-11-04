import { timezoneLabel } from '@/lib/preferences';
import { useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useDemo } from '@/context/demo-context';
import { parameters, trends } from '@/data/demo';
import { number, time } from '@/lib/utils';
import { EmptyState, Panel, PanelHeading } from '@/components/shared';

export function TrendChart() {
  const { device } = useDemo();
  const [channel, setChannel] = useState<'voltage' | 'rpm' | 'frequency' | 'motorTemperature'>('voltage');
  const [range, setRange] = useState('1');
  const config = parameters[channel];
  const samples = trends[device.id].slice(-(Number(range) * 12 + 1));
  const value = device.telemetry[channel];
  const padding = channel === 'frequency' ? 0.5 : channel === 'rpm' ? 25 : channel === 'voltage' ? 10 : 3;
  return <Panel className="min-w-0">
    <PanelHeading title="Tren parameter" eyebrow={`${device.id} · riwayat pembaruan`} action={<div className="flex gap-1" role="group" aria-label="Rentang waktu grafik">{['1', '3', '6'].map(r => <button key={r} onClick={() => setRange(r)} aria-pressed={range === r} className={`rounded-md px-2.5 py-1.5 text-[10px] font-medium ${range === r ? 'bg-blue-50 text-blue-700' : 'text-muted hover:bg-slate-50'}`}>{r} jam</button>)}</div>} />
    <div className="flex flex-wrap items-center justify-between gap-2 px-5 pb-3"><label className="text-xs text-muted">Parameter <select aria-label="Parameter grafik" value={channel} onChange={e => setChannel(e.target.value as typeof channel)} className="ml-1 max-w-[180px] rounded-md border border-border bg-white p-1.5 text-xs text-foreground">{(['voltage', 'rpm', 'frequency', 'motorTemperature'] as const).map(p => <option key={p} value={p}>{parameters[p].label}</option>)}</select></label><span className="text-[10px] font-medium text-muted">Satuan: {config.unit} · {timezoneLabel()}</span></div>
    <div className="h-[226px] min-w-0 pr-4" aria-label={`Grafik ${config.label} ${device.id}, ${range} jam terakhir hingga pembaruan terakhir`}>
      {!device.online ? <EmptyState title="Offline / Belum ada data terkini" description="Tidak ada riwayat yang disajikan untuk GEN-004. Grafik tidak mengganti data hilang dengan nol." /> : <ResponsiveContainer width="100%" height="100%"><AreaChart data={samples} margin={{ top: 10, left: 4, right: 6, bottom: 8 }}><defs><linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity={0.18} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01} /></linearGradient></defs><CartesianGrid strokeDasharray="3 4" vertical={false} stroke="#e9edf3" /><XAxis dataKey="timestamp" tickFormatter={time} minTickGap={42} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis width={48} domain={value === 0 ? [0, padding * 2] : [(value ?? 0) - padding, (value ?? 0) + padding]} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => number(Number(v))} /><Tooltip labelFormatter={label => `${time(String(label))} ${timezoneLabel()}`} formatter={v => [`${number(Number(v))} ${config.unit}`, config.label]} contentStyle={{ borderRadius: 12, borderColor: '#e5eaf1', fontSize: 11 }} /><Area type="monotone" dataKey={channel} name={config.label} stroke="#3b82f6" strokeWidth={2.3} fill="url(#trend-fill)" isAnimationActive={false} connectNulls={false} /></AreaChart></ResponsiveContainer>}
    </div><div className="flex items-center justify-between gap-2 border-t border-slate-100 px-5 py-3 text-[10px] text-muted"><span className="flex items-center gap-2"><span className="h-0.5 w-4 bg-blue-500" />{config.label} ({config.unit})</span><span>Interval 5 menit</span></div>
  </Panel>;
}
