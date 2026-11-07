import { Gauge } from 'lucide-react';
import { ChannelTargetControl } from '@/components/channel-target-control';
import { GaugeTargetControl } from '@/components/gauge-target-control';
import { GaugeDial } from '@/components/overview/gauge-dial';
import { useDemo } from '@/context/demo-context';
import { equipment, parameters, MOTOR_DEMO_THRESHOLD, qualityLabels } from '@/data/demo';
import { equipmentCapabilities, capabilityStatus, capabilityVisual } from '@/lib/equipment-capabilities';
import type { Device, Equipment, Instrument, InstrumentReading } from '@/types';
import { Panel } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';

export function EquipmentWidget({ equipment: item, device, visibleTags }: { equipment: Equipment; device: Device; visibleTags?: string[] }) {
  const { siteId } = useDemo();
  const capabilities = equipmentCapabilities(device, item.id);
  return <>
    {capabilities.filter(({ instrument }) => !visibleTags || visibleTags.includes(instrument.tag)).flatMap(({ instrument, readings }) => readings.map((reading, index) =>
      <ChannelCard key={`${siteId}:${device.id}:${instrument.tag}:${reading.channel ?? reading.parameter ?? index}`} device={device} item={item} instrument={instrument} reading={reading} />))}
    {capabilities.length === 0 && <Panel className="p-4 text-xs"><h3 className="font-semibold">{item.name}</h3><p className="mt-2">Kondisi / kemampuan perangkat</p><p className="mt-2 text-muted">{device.online ? 'Belum ada data' : 'Unit offline'}</p><p className="mt-2 text-muted">Belum ada instrumen terpetakan; tidak tersedia pengukuran numerik.</p></Panel>}
  </>;
}

function ChannelCard({ device, item, instrument, reading }: { device: Device; item: Equipment; instrument: Instrument; reading: InstrumentReading }) {
  const visual = capabilityVisual(reading);
  const config = reading.parameter ? parameters[reading.parameter] : null;
  const label = config?.label ?? reading.label ?? instrument.name;
  const max = config?.max ?? reading.max;
  const unit = config?.unit ?? reading.unit ?? '';
  const value = visual.available && typeof reading.value === 'number' ? reading.value : null;
  const warning = reading.parameter === 'motorTemperature' && value !== null && value > MOTOR_DEMO_THRESHOLD;
  const related = equipment.filter(e => e.deviceId === device.id && equipmentCapabilities(device, e.id).some(c => c.instrument.tag === instrument.tag));
  const names = related.map(e => e.name).join(' / ') || item.name;
  return <Panel className="flex min-w-0 flex-col px-4 pb-3 pt-4 text-xs">
    <div className="flex items-start gap-2 text-[11px] font-medium text-muted"><Gauge size={15} className="mt-0.5 shrink-0" /><h3>{label} · {instrument.tag}</h3></div>
    <p className="mt-2 min-h-8 text-[11px] text-muted">{names}</p>
    {max !== undefined ? <GaugeDial label={`${instrument.tag} · ${label}`} value={value} unit={unit} max={max} color={warning ? '#d97706' : visual.color} warning={warning} /> : <div className="flex min-h-[174px] flex-col items-center justify-center gap-3" role="img" aria-label={`${instrument.tag} · ${label}: ${capabilityStatus(reading)}`}><span aria-hidden="true" className={`h-8 w-8 rounded-full ${visual.available ? 'bg-blue-500' : 'bg-slate-300'}`} /><p className="text-lg font-semibold">{capabilityStatus(reading)}</p></div>}
    <p className={`mt-1 text-center text-[10px] ${warning ? 'font-semibold text-amber-700' : 'text-muted'}`}>{!visual.available ? qualityLabels[reading.quality] : warning ? '⚠ Di atas ambang peringatan' : 'Nilai terbaru'}</p>
    <div className="mt-auto pt-2">
      {reading.parameter ? <GaugeTargetControl device={device} parameter={reading.parameter} measured={value} /> : <ChannelTargetControl device={device} reading={reading} />}
      <Dialog><DialogTrigger asChild><Button size="sm" variant="outline" className="mt-3 w-full" aria-label={`Detail ${instrument.tag} · ${label} · ${device.id}`}>Detail</Button></DialogTrigger><DialogContent>
        <DialogTitle className="pr-6 font-semibold">Detail instrumen · {instrument.tag}</DialogTitle>
        <DialogDescription className="mt-2 text-xs text-muted">{device.id} · {names} · {label}</DialogDescription>
        <dl className="mt-4 space-y-3 text-xs">
          <div><dt className="font-semibold">Sinyal / jenis</dt><dd>{instrument.signal} · {instrument.valueType === 'analog' ? 'Pengukuran numerik' : instrument.valueType === 'digital' ? 'Indikator digital' : 'Jenis pengukuran belum final'}</dd></div>
          <div><dt className="font-semibold">Channel / satuan</dt><dd>{reading.channel ?? reading.parameter ?? '—'} · {unit || 'Tanpa satuan'}</dd></div>
          <div><dt className="font-semibold">Pembacaan / kualitas data</dt><dd>{capabilityStatus(reading)} {value !== null ? unit : ''} · {qualityLabels[reading.quality]}</dd></div>
          <div><dt className="font-semibold">Fungsi</dt><dd>{instrument.function}</dd></div>
          <div><dt className="font-semibold">Catatan instrumen</dt><dd>{instrument.notes}</dd></div>
          <div><dt className="font-semibold">Catatan perangkat</dt><dd>{related.map(e => `${e.name}: ${e.notes}`).join(' ') || item.notes}</dd></div>
          <div><dt className="font-semibold">Rentang / asumsi</dt><dd>{max !== undefined ? `0–${max} ${unit}. Rentang tampilan, bukan batas aman mesin. ` : 'Indikator digital, bukan persentase. '}{reading.assumption}</dd></div>
        </dl>
        <p className="mt-4 text-xs text-muted">Status komponen aktual: {device.online ? 'Belum ada data terverifikasi' : 'Unit offline'}</p>
        <p className="mt-3 text-xs text-muted">Target / status manual hanya lokal. Tidak mengubah pembacaan sensor, alarm, proteksi, atau mengirim perintah PLC.</p>
      </DialogContent></Dialog>
    </div>
  </Panel>;
}
