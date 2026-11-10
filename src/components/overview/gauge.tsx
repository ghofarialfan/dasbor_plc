import { Gauge as GaugeIcon, Zap, Waves, Thermometer } from 'lucide-react';
import type { DataQuality, Device } from '@/types';
import { GaugeTargetControl } from '@/components/gauge-target-control';
import { parameters, MOTOR_DEMO_THRESHOLD, qualityLabels } from '@/data/demo';
import { GaugeDial } from '@/components/overview/gauge-dial';
import { Panel, InfoHint } from '@/components/shared';
import { ChannelIndicator } from '@/components/overview/channel-indicator';
import { channelIndicatorKind } from '@/lib/channel-indicator';
import { number } from '@/lib/utils';

const icons = { rpm: GaugeIcon, voltage: Zap, frequency: Waves, motorTemperature: Thermometer, roomTemperature: Thermometer, bldcTemperature: Thermometer };
export function GaugeCard({ parameter, value, quality, device }: { parameter: keyof typeof icons; value: number | null; quality: DataQuality; device?: Device }) {
  const config = parameters[parameter];
  const Icon = icons[parameter];
  value = quality === 'simulated' ? value : null;
  const warning = parameter === 'motorTemperature' && value !== null && value > MOTOR_DEMO_THRESHOLD;
  const color = value === null ? '#94a3b8' : warning ? '#d97706' : '#2563eb';
  return <Panel className="min-w-0 px-4 pb-3 pt-4">
    <div className="flex items-center justify-between gap-1"><div className="flex items-center gap-2 text-[11px] font-medium text-muted"><Icon size={15} /><h3>{config.label}</h3></div><InfoHint label={parameter === 'motorTemperature' ? `Ambang peringatan: ${MOTOR_DEMO_THRESHOLD} °C.` : 'Rentang tampilan parameter.'} /></div>
    {['temperature', 'speed'].includes(channelIndicatorKind(config.unit, false)) ? <GaugeDial label={config.label} value={value} unit={config.unit} max={config.max} color={color} warning={warning} /> : <div className="regular-channel-reading flex min-h-[112px] flex-col items-center justify-center gap-3"><p className="text-2xl font-semibold text-blue-600 dark:text-accent">{number(value)} {value !== null && <span className="text-xs">{config.unit}</span>}</p><ChannelIndicator unit={config.unit} value={value} max={config.max} digital={false} active={null} status={qualityLabels[quality]} warning={warning} /></div>}
    <p className={`mt-1 text-center text-[10px] ${warning ? 'font-semibold text-amber-700 dark:text-warning' : 'text-muted'}`}>{value === null ? qualityLabels[quality] : warning ? '⚠ Di atas ambang peringatan' : 'Nilai terbaru'}</p>
    {device && <GaugeTargetControl device={device} parameter={parameter} measured={value} />}
  </Panel>;
}
