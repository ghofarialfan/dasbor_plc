import { Gauge } from 'lucide-react';
import { ChannelTargetControl } from '@/components/channel-target-control';
import { GaugeTargetControl } from '@/components/gauge-target-control';
import { GaugeDial } from '@/components/overview/gauge-dial';
import { ChannelIndicator } from '@/components/overview/channel-indicator';
import { useDemo } from '@/context/demo-context';
import { equipment, parameters, MOTOR_DEMO_THRESHOLD, qualityLabels } from '@/data/demo';
import { ChannelReading } from '@/components/channel-reading';
import { channelIndicatorKind } from '@/lib/channel-indicator';
import { equipmentCapabilities, capabilityStatus, capabilityVisual, digitalAttention, isDigitalReading } from '@/lib/equipment-capabilities';
import type { Device, Equipment, Instrument, InstrumentReading } from '@/types';
import { Panel } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';

export function EquipmentWidget({ equipment: item, device, visibleTags, compact = false }: { equipment: Equipment; device: Device; visibleTags?: string[]; compact?: boolean }) {
  const { siteId } = useDemo();
  const capabilities = equipmentCapabilities(device, item.id);
  return <>
    {capabilities.filter(({ instrument }) => !visibleTags || visibleTags.includes(instrument.tag)).flatMap(({ instrument, readings }) => readings.map((reading, index) =>
      <ChannelCard key={`${siteId}:${device.id}:${instrument.tag}:${reading.channel ?? reading.parameter ?? index}`} device={device} item={item} instrument={instrument} reading={reading} compact={compact} />))}
    {capabilities.length === 0 && <Panel className="p-4 text-xs"><h3 className="font-semibold">{item.name}</h3><p className="mt-2">Kondisi / kemampuan perangkat</p><p className="mt-2 text-muted">{device.online ? 'Belum ada data' : 'Unit offline'}</p><p className="mt-2 text-muted">Belum ada instrumen terpetakan; tidak tersedia pengukuran numerik.</p></Panel>}
  </>;
}

function ChannelCard({ device, item, instrument, reading, compact }: { device: Device; item: Equipment; instrument: Instrument; reading: InstrumentReading; compact: boolean }) {
  const visual = capabilityVisual(reading);
  const config = reading.parameter ? parameters[reading.parameter] : null;
  const label = compact && instrument.tag === 'TT-07' ? 'Suhu belitan / bearing' : compact && instrument.tag === 'AT-301' ? 'RH (asumsi; jenis TBD)' : compact && instrument.tag.includes(':') ? `Kondisi ${item.name}` : config?.label ?? reading.label ?? instrument.name;
  const max = config?.max ?? reading.max;
  const unit = config?.unit ?? reading.unit ?? '';
  const value = visual.available && typeof reading.value === 'number' ? reading.value : null;
  const digital = isDigitalReading(reading, instrument.valueType);
  const kind = channelIndicatorKind(unit, digital);
  const warning = (reading.parameter === 'motorTemperature' && value !== null && value > MOTOR_DEMO_THRESHOLD) || digitalAttention(reading);
  const related = equipment.filter(e => e.deviceId === device.id && equipmentCapabilities(device, e.id).some(c => c.instrument.tag === instrument.tag));
  const names = related.map(e => e.name).join(' / ') || item.name;
  return <Panel className={compact ? 'overview-channel flex min-w-0 flex-col rounded-lg bg-slate-50/40 dark:bg-surface-soft/40 p-2 text-xs shadow-none' : 'flex min-w-0 flex-col rounded-xl bg-slate-50/40 dark:bg-surface-soft/40 p-3 text-xs shadow-none'}>
    {compact ? <>
      <p className="text-[10px] font-semibold leading-tight" title={label}>{label}</p>
      <p className="mt-0.5 text-[9px] text-muted" title={`${names} · ${qualityLabels[reading.quality]}`}>{instrument.tag}</p>
      <div className="overview-reading-row flex min-w-0 items-center gap-1">
      <p title={warning ? (reading.parameter === 'motorTemperature' ? 'Peringatan suhu motor >35 °C' : 'Sinyal perhatian aktif (simulasi)') : capabilityStatus(reading)} data-digital={digital} className={`my-1 ${digital ? 'text-[11px] leading-tight' : 'text-base'} font-semibold tabular-nums ${warning ? 'text-amber-700 dark:text-warning' : !visual.available ? 'text-slate-500 dark:text-muted' : 'text-blue-700 dark:text-accent'}`}>
        {value !== null ? value : typeof reading.value === 'boolean' && visual.available ? capabilityStatus(reading) : '—'} <span className="text-[10px] font-normal">{value !== null ? unit : ''}</span>
      </p>
      <ChannelIndicator unit={unit} value={value} max={max} digital={digital} active={visual.available && typeof reading.value === 'boolean' ? reading.value : null} status={capabilityStatus(reading)} warning={warning} />
      </div>
    </> : <>
    <div className="flex items-start gap-1.5 text-[11px] font-semibold"><Gauge size={13} className="mt-0.5 shrink-0 text-blue-600 dark:text-accent" /><h3>{label}</h3></div>
    <p className="mt-1 truncate text-[10px] text-muted" title={`${instrument.tag} · ${names}`}>{instrument.tag} · {names}</p>
    {(kind === 'temperature' || kind === 'speed') && max !== undefined ? <div className="mx-auto w-full max-w-[170px]"><GaugeDial label={`${instrument.tag} · ${label}`} value={value} unit={unit} max={max} color={warning ? '#d97706' : visual.color} warning={warning} /></div> : <div className="regular-channel-reading flex min-h-[88px] items-center justify-center"><ChannelReading reading={reading} valueType={instrument.valueType} /></div>}
    <p className={`mt-1 text-center text-[10px] ${warning ? 'font-semibold text-amber-700 dark:text-warning' : 'text-muted'}`}>{!visual.available ? qualityLabels[reading.quality] : warning ? (reading.parameter === 'motorTemperature' ? '⚠ Di atas ambang peringatan' : '⚠ Sinyal perhatian aktif (simulasi)') : 'Nilai terbaru'}</p>
    </>}
    <div className={compact ? 'mt-auto pt-1' : 'mt-auto pt-2'}>
      <Dialog><DialogTrigger asChild><Button size="sm" variant="outline" className={compact ? 'h-6 w-full px-1 text-[9px]' : 'w-full'} aria-label={`Detail dan pengaturan ${instrument.tag} · ${label} · ${device.id}`}>Detail / Atur</Button></DialogTrigger><DialogContent className="max-h-[85dvh] overflow-y-auto">
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
        {reading.parameter ? <GaugeTargetControl device={device} parameter={reading.parameter} measured={value} /> : <ChannelTargetControl device={device} reading={reading} />}
        <p className="mt-3 text-xs text-muted">Target / status manual hanya lokal. Tidak mengubah pembacaan sensor, alarm, proteksi, atau mengirim perintah PLC.</p>
      </DialogContent></Dialog>
    </div>
  </Panel>;
}
