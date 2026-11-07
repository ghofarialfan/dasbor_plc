import { useState } from 'react';
import { useDemo } from '@/context/demo-context';
import { parameters, sites } from '@/data/demo';
import { controlCopy } from '@/lib/demo-controls';
import { isTarget, targetDefinitions } from '@/lib/gauge-targets';
import { number } from '@/lib/utils';
import type { Device, Parameter } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';

export function GaugeTargetControl({ device, parameter, measured }: { device: Device; parameter: Parameter; measured: number | null }) {
  const { siteId, device: selectedDevice } = useDemo();
  return <TargetEditor key={`${siteId}:${selectedDevice.id}:${device.id}:${parameter}`} device={device} parameter={parameter} measured={measured} />;
}
function TargetEditor({ device, parameter, measured }: { device: Device; parameter: Parameter; measured: number | null }) {
  const { controls, updateTarget, controlStorageError } = useDemo();
  const current = controls.settings[device.id]?.[parameter] ?? null;
  const config = parameters[parameter];
  const limits = targetDefinitions[parameter];
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [input, setInput] = useState('');
  const [message, setMessage] = useState('');
  const value = Number(input);
  const valid = input.trim() !== '' && isTarget(parameter, value);
  const changed = value !== current;
  const changeOpen = (next: boolean) => {
    setOpen(next); setConfirming(false); setInput(current === null ? '' : String(current)); setMessage('');
  };
  const apply = () => {
    if (!valid || !changed || !device.online) return;
    if (updateTarget(device.id, parameter, value)) { setOpen(false); setConfirming(false); setMessage(controlCopy.success); }
    else { setConfirming(false); setMessage('Perubahan ditolak. Periksa unit dan nilai pengaturan.'); }
  };
  return <div className="mt-3 space-y-2 border-t border-border pt-3 text-[10px]">
    <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-medium text-blue-800">{controlCopy.targetLabel}: {current === null ? 'Belum diatur' : `${number(current)} ${config.unit}`}</p>
      <Dialog open={open} onOpenChange={changeOpen}><DialogTrigger asChild><Button size="sm" variant="outline" disabled={!device.online} aria-label={`Atur target ${config.label} · ${device.id}`}>Atur target</Button></DialogTrigger>
        <DialogContent><DialogTitle className="text-lg font-semibold">{confirming ? 'Konfirmasi perubahan' : `Atur ${config.label}`}</DialogTitle><DialogDescription className="mt-2 text-xs text-muted">{controlCopy.confirmation}</DialogDescription>
          <p className="my-4 text-xs font-semibold">{sites.find(s => s.id === device.siteId)?.name} · {device.id} · {config.label}</p>
          <p className="mb-3 text-xs">Nilai monitoring: {measured === null ? 'Belum ada data' : `${number(measured)} ${config.unit}`}</p>
          {confirming ? <div className="space-y-3 text-sm"><p>Target lama: {current === null ? 'Belum diatur' : `${number(current)} ${config.unit}`}</p><p>Target baru: {number(value)} {config.unit}</p></div> : <label className="block text-xs">{controlCopy.targetLabel} ({config.unit})<input autoFocus type="number" step={limits.step} min={limits.min} max={limits.max} value={input} onChange={e => setInput(e.target.value)} className="mt-1 w-full rounded-lg border border-border p-2" /></label>}
          <p className="mt-3 text-xs text-muted">Rentang skenario UI {limits.min}–{limits.max} {config.unit}; kelipatan {limits.step}. Bukan batas aman atau rating alat.</p>
          <p className="mt-2 text-xs text-muted">Aktuator/tag writable belum dipetakan. Nilai sensor tidak diedit. Target suhu tidak menjamin suhu motor turun.</p>
          {!valid && input !== '' && <p role="alert" className="mt-2 text-xs text-red-700">Masukkan angka valid dalam rentang dan kelipatan yang ditentukan.</p>}
          <div className="mt-5 flex flex-wrap justify-end gap-2"><Button variant="outline" onClick={() => confirming ? setConfirming(false) : changeOpen(false)}>{confirming ? 'Kembali' : 'Batal'}</Button><Button disabled={!valid || !changed || !device.online} onClick={() => confirming ? apply() : setConfirming(true)}>{confirming ? controlCopy.apply : 'Tinjau perubahan'}</Button></div>
        </DialogContent>
      </Dialog>
    </div>
    <p className="text-muted">{controlCopy.confirmation}</p>
    {!device.online && <p className="text-amber-800">Offline: pengaturan dinonaktifkan.</p>}
    {controlStorageError && <p role="alert" className="text-amber-800">Pengaturan tidak dapat disimpan; hanya tersedia selama sesi ini.</p>}
    {message && <p role="status">{message}</p>}
  </div>;
}
