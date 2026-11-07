import { Link } from 'react-router-dom';
import { instruments, readingsForInstrument, parameters, qualityLabels } from '@/data/demo';
import type { Device } from '@/types';
import { dateTime, number } from '@/lib/utils';

// Exact registry tags only; shared/grouped tags retain their original scope.
export function InstrumentReadings({ device, tag }: { device?: Device; tag: string }) {
  const mapped = device && instruments.some(i => i.deviceId === device.id && i.tag === tag);
  const readings = mapped ? readingsForInstrument(device, tag) : [];
  return <div className="my-3 space-y-2">
    {readings.length === 0 ? <p className="rounded-lg bg-slate-50 p-3 text-xs text-muted">{device ? 'Belum dipetakan ke pembacaan unit.' : 'Pilih unit di Device untuk melihat pembacaan.'}</p> : readings.map((r, index) => <div key={r.channel ?? r.parameter ?? index} className="rounded-lg bg-slate-50 p-3 text-xs">
      <p className="text-muted">{r.parameter ? parameters[r.parameter].label : r.label ?? tag}</p>
      <p className={`mt-1 text-lg font-semibold ${r.quality === 'simulated' && r.value !== null ? 'text-blue-600' : 'text-slate-400'}`}>{r.value === null ? '—' : typeof r.value === 'boolean' ? r.value ? 'Aktif' : 'Tidak aktif' : number(r.value)} {r.value !== null ? r.unit : ''}</p>
      <p className="mt-1 text-muted">{qualityLabels[r.quality]} · {dateTime(r.timestamp ?? device!.lastSeen)}</p>
      {r.assumption && <p className="mt-1 text-muted">{r.assumption}</p>}
      <Link to={`/chart-widget?${new URLSearchParams({ unit: device!.id, ...(r.parameter ? { parameter: r.parameter } : { channel: `${tag}/${r.channel}` }) })}`} className="mt-2 inline-block rounded font-semibold text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500">Lihat histori</Link>
    </div>)}
  </div>;
}
