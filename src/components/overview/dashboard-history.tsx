import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { archiveWindow, ago, demoChannels, demoChannelReading, parameters } from '@/data/demo';
import { digitalHistoryIndices, historyDisplayIndices, historyParameters, historyStats } from '@/data/history';
import { digitalStatus } from '@/lib/equipment-capabilities';
import { historyColors } from '@/components/history-chart';
import { dateTime, number, time } from '@/lib/utils';
import type { Device, Parameter } from '@/types';

const extraChannels = Object.entries(demoChannels).flatMap(([tag, channels]) => channels.map(channel => ({ tag, channel, id: `${tag}/${channel.id}` })));

function SmallChart({ rows, unit, digital = false, color = '#2563eb', statusLabel = active => active ? 'Aktif' : 'Tidak aktif' }: { rows: { time: string; value: number | null }[]; unit: string; digital?: boolean; color?: string; statusLabel?: (active: boolean) => string }) {
  if (!rows.some(row => row.value !== null)) return <div className="flex h-full min-h-20 items-center justify-center text-xs text-muted" role="status">Belum ada sampel historis</div>;
  return <ResponsiveContainer width="100%" height="100%"><LineChart data={rows} margin={{ top: 5, right: 8, bottom: 0, left: -20 }}>
    <XAxis type="number" scale="time" domain={['dataMin', 'dataMax']} dataKey={row => Date.parse(row.time)} tickFormatter={value => time(new Date(Number(value)).toISOString())} minTickGap={65} tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
    <YAxis width={55} domain={digital ? [0, 1] : ['auto', 'auto']} ticks={digital ? [0, 1] : undefined} interval={digital ? 0 : 'preserveEnd'} tick={{ fontSize: 9 }} tickFormatter={value => digital ? Number(value) === 1 ? 'Aktif' : 'Tidak aktif' : number(Number(value))} axisLine={false} tickLine={false} />
    <Tooltip labelFormatter={value => dateTime(new Date(Number(value)).toISOString())} formatter={value => [digital ? statusLabel(Number(value) === 1) : `${number(Number(value))} ${unit}`, 'Nilai']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
    <Line dataKey="value" type={digital ? 'stepAfter' : 'linear'} stroke={color} strokeWidth={1.7} dot={false} isAnimationActive={false} connectNulls={false} />
  </LineChart></ResponsiveContainer>;
}

function ParameterHistory({ parameter, samples }: { parameter: Parameter; samples: ReturnType<typeof archiveWindow> }) {
  const config = parameters[parameter];
  const rows = useMemo(() => {
    const points: ({ time: string } & Partial<Record<Parameter, number | null>>)[] = samples.map(sample => ({ time: sample.timestamp, [parameter]: sample[parameter] }));
    return historyDisplayIndices(points, [parameter], 160).map(index => ({ time: points[index].time, value: points[index][parameter] ?? null }));
  }, [samples, parameter]);
  const stats = historyStats(samples.map(sample => ({ time: sample.timestamp, value: sample[parameter] })));
  return <section className="min-w-0 rounded-lg border border-border bg-white dark:bg-surface p-2" aria-label={`Histori ${config.label}`}>
    <h3 className="text-[10px] font-semibold">{config.label} <span className="font-normal text-muted">({config.unit})</span></h3>
    <div className="overview-primary-chart h-[92px]"><SmallChart rows={rows} unit={config.unit} color={historyColors[parameter]} /></div>
    <p className="text-[9px] text-muted">Min {stats.min === null ? '—' : number(stats.min)} · Maks {stats.max === null ? '—' : number(stats.max)} · Rerata {stats.average === null ? '—' : number(stats.average)}</p>
  </section>;
}

export function DashboardHistory({ device }: { device: Device }) {
  const [hours, setHours] = useState(6);
  const [channelId, setChannelId] = useState(extraChannels[0].id);
  const samples = useMemo(() => archiveWindow(device.id, hours), [device.id, hours]);
  const binding = extraChannels.find(channel => channel.id === channelId)!;
  const extraRows = useMemo(() => {
    const points = Array.from({ length: hours * 12 + 1 }, (_, index) => {
      const timestamp = ago((hours * 12 - index) * 5);
      const reading = demoChannelReading(device, binding.tag, binding.channel, timestamp);
      return { time: timestamp, rpm: typeof reading.value === 'boolean' ? Number(reading.value) : reading.value };
    });
    const rows = points.map(point => ({ time: point.time, value: point.rpm }));
    const indices = typeof binding.channel.normal === 'boolean' ? digitalHistoryIndices(rows) : historyDisplayIndices(points, ['rpm'], 240);
    return indices.map(index => rows[index]);
  }, [device, binding, hours]);
  return <section className="overview-history min-w-0 rounded-xl border border-border bg-slate-50/50 dark:bg-surface-soft/50 p-2.5" aria-labelledby="overview-history-title">
    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
      <h2 id="overview-history-title" className="text-xs font-semibold">Tren &amp; Riwayat · {device.id}</h2>
      <select aria-label="Periode histori Overview" value={hours} onChange={event => setHours(Number(event.target.value))} className="rounded border border-border bg-white dark:bg-surface p-1 text-[10px]">{[1, 6, 24, 168, 2160].map(value => <option key={value} value={value}>{value === 2160 ? '90 hari' : value === 168 ? '7 hari' : `${value} jam`}</option>)}</select>
    </div>
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">{historyParameters.map(parameter => <ParameterHistory key={parameter} parameter={parameter} samples={samples} />)}</div>
    <section className="mt-2 rounded-lg border border-border bg-white dark:bg-surface p-2">
      <label className="flex flex-wrap items-center justify-between gap-1 text-[10px] font-semibold">Channel tambahan
        <select aria-label="Channel histori Overview" value={channelId} onChange={event => setChannelId(event.target.value)} className="max-w-full rounded border border-border bg-white dark:bg-surface p-1 font-normal sm:max-w-[260px]">{extraChannels.map(({ id, tag, channel }) => <option key={id} value={id}>{tag} · {channel.label}</option>)}</select>
      </label>
      <p className="overview-chart-kind mt-1 text-[9px] font-medium text-blue-700 dark:text-accent" role="status">{typeof binding.channel.normal === 'boolean' ? 'Riwayat status digital · step chart 0/1' : 'Tren analog · line chart'}</p>
      <div className="overview-extra-chart h-[100px]"><SmallChart rows={extraRows} unit={binding.channel.unit ?? ''} digital={typeof binding.channel.normal === 'boolean'} statusLabel={active => digitalStatus(binding.tag, binding.channel.id, active)} /></div>
    </section>
    <div className="mt-2 flex flex-wrap justify-between gap-1 text-[9px] text-muted"><span>Simulasi 5 menit · trip singkat dapat terlewat · celah bukan nol</span><Link className="font-semibold text-blue-700 dark:text-accent underline" to={`/chart-widget?unit=${device.id}`}>Buka histori lengkap / ekspor</Link></div>
  </section>;
}
