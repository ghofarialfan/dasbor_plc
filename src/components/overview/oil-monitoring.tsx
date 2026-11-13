import { useState } from 'react';
import { useDemo } from '@/context/demo-context';
import { equipment, readingsForInstrument } from '@/data/demo';
import { oilLevel, validLocalTargets, localTargetKey } from '@/lib/overview-fleet';
import { usePersistedState } from '@/lib/use-persisted-state';
import { EquipmentWidget } from '@/components/equipment-widget';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { GaugeDial } from './gauge-dial';
import type { Device } from '@/types';

function OilTarget({ device, tank }: { device: Device; tank: 'oil19' | 'oil20' }) {
  const [targets, setTargets, error] = usePersistedState<Record<string, number>>('overview-oil-targets', {}, validLocalTargets);
  const key = localTargetKey(device.id, tank);
  const current = targets[key];
  const [input, setInput] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [message, setMessage] = useState('');
  const value = Number(input);
  const valid = input.trim() !== '' && Number.isFinite(value) && value >= 0 && value <= 100;
  return <div className="mt-4 border-t border-border pt-3 text-xs"><p>Target level lokal: {current === undefined ? 'Belum diatur' : `${current}%`}</p><p className="my-2 text-muted">Target tidak mengubah level atau LSL dan tidak mengaktifkan pompa/valve. Rentang 0–100% hanya untuk prototype.</p><label className="block">Target level (%)<input type="number" min={0} max={100} step="any" disabled={!device.online || confirm} value={input} onChange={event => { setInput(event.target.value); setMessage(''); }} className="my-2 w-full rounded border border-border bg-surface p-2" /></label>{input && !valid && <p role="alert">Masukkan angka antara 0 dan 100.</p>}{confirm && <p className="my-2">Konfirmasi {device.id} · {tank === 'oil19' ? 'TK-19' : 'TK-20'}: {current ?? 'Belum diatur'} → {value}%?</p>}<div className="flex gap-2"><button disabled={!device.online || !valid || current === value} className="rounded border border-border px-3 py-2 disabled:opacity-40" onClick={() => { if (!device.online || !valid) return; if (!confirm) { setConfirm(true); return; } setTargets(previous => ({ ...previous, [key]: value })); setConfirm(false); setMessage('Target lokal diterapkan. Pembacaan sensor tidak berubah.'); }}>{confirm ? 'Terapkan lokal' : 'Tinjau perubahan'}</button>{confirm && <button onClick={() => setConfirm(false)}>Batal</button>}</div>{!device.online && <p className="mt-2 text-warning">Offline: pengaturan dinonaktifkan.</p>}{error && <p role="alert">Penyimpanan gagal; target hanya tersedia selama sesi ini.</p>}<p role="status" className="mt-2">{message}</p></div>;
}

export function OilMonitoring() {
  const { device } = useDemo();
  const pressure = readingsForInstrument(device, 'PT-201').find(reading => reading.channel === 'pressure');
  const temperature = readingsForInstrument(device, 'TT-201').find(reading => reading.channel === 'temperature');
  return <section className="industrial-panel oil-monitoring"><div className="industrial-heading"><h2>SISTEM OLI</h2><span>{device.id}</span></div>{(['oil19', 'oil20'] as const).map(tank => {
    const item = equipment.find(entry => entry.deviceId === device.id && entry.id === tank)!;
    const level = oilLevel(device, tank);
    const lsl = readingsForInstrument(device, tank === 'oil19' ? 'LSL-19' : 'LSL-20')[0];
    return <article key={`${device.id}:${tank}`} className="oil-tank"><div className="flex items-center justify-between"><h3 className="text-xs font-semibold">{item.name}</h3><span className="text-[9px] text-muted">Level oli</span></div><div className="oil-support"><div><GaugeDial label="Tekanan sirkuit PT-201" value={typeof pressure?.value === 'number' ? pressure.value : null} unit="bar" max={10} color="#fbbf24" /><p>PT-201 · bersama</p></div><div><GaugeDial label="Suhu sirkuit TT-201" value={typeof temperature?.value === 'number' ? temperature.value : null} unit="°C" max={100} color="#fbbf24" /><p>TT-201 · bersama</p></div></div>
      <Dialog><DialogTrigger asChild><button className="oil-level" aria-label={`Detail dan pengaturan oli ${item.name} · ${device.id}`}><span className="oil-fill" style={{ height: `${level ?? 0}%` }} /><strong>{level === null ? '—' : `${level}%`}</strong><small>Detail / Atur</small></button></DialogTrigger><DialogContent><DialogTitle className="font-semibold">Oli {item.name} · {device.id}</DialogTitle><DialogDescription className="mt-2 text-xs text-muted">Level ilustratif independen dari LSL. Tekanan dan suhu berasal dari sirkuit bersama, bukan sensor terpisah per tangki.</DialogDescription><p className="my-3 text-sm">Level: {level === null ? 'Tidak tersedia' : `${level}%`}</p><OilTarget device={device} tank={tank} /><div className="mt-4"><EquipmentWidget equipment={item} device={device} /></div></DialogContent></Dialog>
      <p className="mt-2 text-center text-[9px] text-muted">LSL-{tank === 'oil19' ? '19' : '20'}: {typeof lsl?.value !== 'boolean' ? '—' : lsl.value ? 'Level rendah aktif' : 'Level rendah tidak aktif'}</p>
    </article>;
  })}<p className="panel-disclosure">Level % ilustratif · bukan konversi LSL. Klik tangki untuk pengaturan lokal.</p></section>;
}
