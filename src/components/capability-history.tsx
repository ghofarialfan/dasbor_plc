import { useSearchParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ago, demoChannels, demoChannelReading, DEMO_NOW, qualityLabels } from '@/data/demo';
import { useDemo } from '@/context/demo-context';
import { toCsv, downloadCsv } from '@/lib/csv';
import { dateTime } from '@/lib/utils';
import { Panel } from '@/components/shared';

const channels = Object.entries(demoChannels).flatMap(([tag, definitions]) => definitions.map(channel => ({ tag, channel, id: `${tag}/${channel.id}` })));

// One selected channel at a time bounds a 90-day query to 25,921 rows.
export function CapabilityHistory({ chart = false }: { chart?: boolean }) {
  const { device } = useDemo();
  const [params] = useSearchParams();
  const [selected, setSelected] = useState(() => channels.find(c => c.id === params.get('channel'))?.id ?? channels[0].id);
  const [hours, setHours] = useState(6);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const binding = channels.find(c => c.id === selected)!;
  const rows = useMemo(() => Array.from({ length: Math.floor(hours * 12) + 1 }, (_, index) => demoChannelReading(device, binding.tag, binding.channel, ago((Math.floor(hours * 12) - index) * 5))), [device, binding, hours]);
  const pages = Math.ceil(rows.length / 50);
  const safePage = Math.min(page, pages);
  const visible = rows.slice((safePage - 1) * 50, safePage * 50);
  const exportCsv = () => {
    try {
      downloadCsv('genset-capability-demo.csv', toCsv([['waktu', 'unit', 'tag', 'channel', 'nilai', 'satuan', 'kualitas', 'asumsi'], ...rows.map(r => [r.timestamp!, r.deviceId, r.tag, r.channel!, typeof r.value === 'boolean' ? String(r.value) : r.value, r.unit ?? '', qualityLabels[r.quality], r.assumption!])]));
      setError('');
    } catch { setError('Ekspor gagal. Coba kembali atau kurangi rentang.'); }
  };
  const chartRows = rows.map(r => ({ time: r.timestamp, value: typeof r.value === 'boolean' ? Number(r.value) : r.value }));
  return <Panel className="space-y-3 p-5 text-xs">
    <h2 className="text-sm font-semibold">{chart ? 'Grafik kapabilitas tambahan' : 'Data kapabilitas tambahan'} · {device.id}</h2>
    <p className="text-muted">Simulasi eksplisit, bukan feedback aktual. Rentang/satuan tambahan adalah asumsi. Digital: 1 = aktif/true, 0 = tidak aktif/false. Timestamp terakhir {dateTime(DEMO_NOW)}. Target dan skenario manual tidak termasuk.</p>
    <div className="flex flex-wrap gap-2">
      <select aria-label="Channel kapabilitas" value={selected} onChange={e => { setSelected(e.target.value); setPage(1); }} className="max-w-full rounded border border-border p-2">{channels.map(c => <option key={c.id} value={c.id}>{c.tag} · {c.channel.label}</option>)}</select>
      <select aria-label="Rentang kapabilitas" value={hours} onChange={e => { setHours(Number(e.target.value)); setPage(1); }} className="rounded border border-border p-2">{[1, 6, 24, 168, 2160].map(h => <option key={h} value={h}>{h === 2160 ? '90 hari' : `${h} jam`}</option>)}</select>
      <button type="button" onClick={exportCsv} className="rounded border border-border px-3 py-2">Ekspor CSV kapabilitas</button>
    </div>
    {error && <p role="alert">{error}</p>}
    {chart ? <div className="h-72"><ResponsiveContainer width="100%" height="100%"><LineChart data={chartRows}><XAxis dataKey="time" hide /><YAxis /><Tooltip labelFormatter={value => dateTime(String(value))} /><Line dataKey="value" type={typeof binding.channel.normal === 'boolean' ? 'stepAfter' : 'linear'} dot={false} connectNulls={false} isAnimationActive={false} stroke="#2563eb" /></LineChart></ResponsiveContainer></div> : <>
      <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr><th>Waktu</th><th>Channel</th><th>Nilai</th><th>Kualitas</th></tr></thead><tbody>{visible.map(r => <tr key={r.timestamp} className="border-t border-border"><td className="py-2">{dateTime(r.timestamp!)}</td><td>{r.tag} · {r.label}</td><td>{r.value === null ? '—' : String(r.value)} {r.unit}</td><td>{qualityLabels[r.quality]}</td></tr>)}</tbody></table></div>
      <div className="flex items-center gap-3"><button type="button" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>Sebelumnya</button><span>{safePage}/{pages} · {rows.length} sampel</span><button type="button" disabled={safePage >= pages} onClick={() => setPage(safePage + 1)}>Berikutnya</button></div>
    </>}
  </Panel>;
}
