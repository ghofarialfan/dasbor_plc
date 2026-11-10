import { useState } from 'react';
import { useDemo } from '@/context/demo-context';
import { channelDefinition, channelKey, formatChannelValue, isChannelValue } from '@/lib/channel-targets';
import { controlCopy } from '@/lib/demo-controls';
import type { Device, InstrumentReading } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export function ChannelTargetControl({ device, reading }: { device: Device; reading: InstrumentReading }) {
  const { channelTargets, updateChannelTarget, channelStorageError } = useDemo();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState('');
  const channel = reading.channel ?? '';
  const definition = channelDefinition(device.id, reading.tag, channel);
  if (!definition) return null;
  const digital = typeof definition.normal === 'boolean';
  const current = channelTargets.settings[device.id]?.[channelKey(reading.tag, channel)] ?? null;
  const value = digital ? input === 'true' : Number(input);
  const valid = input !== '' && isChannelValue(device.id, reading.tag, channel, value) && current !== value;
  const label = digital ? 'Atur status manual' : 'Atur target';
  const close = () => { setOpen(false); setConfirming(false); };
  const apply = () => {
    if (!valid || !device.online) return;
    if (updateChannelTarget(device.id, reading.tag, channel, value)) { close(); setMessage(controlCopy.success); }
    else { setConfirming(false); setMessage('Perubahan ditolak. Periksa unit dan nilai pengaturan.'); }
  };
  return <div className="mt-3 space-y-2 border-t border-border pt-3 text-xs">
    <p className="font-medium text-blue-800 dark:text-accent">{digital ? 'Status manual lokal' : controlCopy.targetLabel}: {formatChannelValue(current)} {digital ? '' : definition.unit}</p>
    <Button size="sm" variant="outline" disabled={!device.online} aria-label={`${label} ${reading.tag} · ${definition.label} · ${device.id}`} onClick={() => { setInput(current === null ? '' : String(current)); setConfirming(false); setMessage(''); setOpen(true); }}>{label}</Button>
    <p className="text-muted">{controlCopy.confirmation} Pembacaan sensor, alarm, dan proteksi tidak diubah.</p>
    {!device.online && <p className="text-amber-800 dark:text-warning">Offline: pengaturan dinonaktifkan.</p>}
    {channelStorageError && <p role="alert" className="text-amber-800 dark:text-warning">Penyimpanan gagal; perubahan hanya tersedia selama sesi ini.</p>}
    {message && <p role="status">{message}</p>}
    <Dialog open={open} onOpenChange={next => { if (!next) close(); }}><DialogContent>
      <DialogTitle>{confirming ? 'Konfirmasi perubahan' : label} · {definition.label}</DialogTitle>
      <DialogDescription className="mt-2 text-xs text-muted">{device.id} · {reading.tag} · {channel}. {controlCopy.disclaimer}</DialogDescription>
      <p className="my-3 text-xs">Nilai monitoring: {formatChannelValue(reading.value)} {definition.unit}</p>
      {confirming ? <p className="text-sm">{formatChannelValue(current)} → {formatChannelValue(value)} {definition.unit}</p> : <label className="block text-xs">{definition.label}{digital ? <select className="mt-2 w-full rounded-lg border border-border p-2" value={input} onChange={e => setInput(e.target.value)}><option value="" disabled>Pilih status</option><option value="true">Aktif / true</option><option value="false">Tidak aktif / false</option></select> : <input type="number" min={0} max={definition.max} step={0.01} value={input} onChange={e => setInput(e.target.value)} className="mt-2 w-full rounded-lg border border-border p-2" />}</label>}
      {!digital && <p className="mt-3 text-xs text-muted">Rentang asumsi UI 0–{definition.max} {definition.unit}, kelipatan 0.01. Bukan batas aman atau rating alat.</p>}
      {!valid && input !== '' && current !== value && <p role="alert" className="mt-2 text-xs text-red-700 dark:text-danger">Masukkan nilai valid sesuai rentang dan kelipatan.</p>}
      <p className="mt-3 text-xs text-muted">Tidak ada command, bypass, atau reset proteksi. {controlCopy.confirmation}</p>
      <div className="mt-4 flex justify-end gap-2"><Button variant="outline" onClick={() => confirming ? setConfirming(false) : close()}>{confirming ? 'Kembali' : 'Batal'}</Button><Button disabled={!valid || !device.online} onClick={() => confirming ? apply() : setConfirming(true)}>{confirming ? controlCopy.apply : 'Tinjau perubahan'}</Button></div>
    </DialogContent></Dialog>
  </div>;
}
