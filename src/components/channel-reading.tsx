import type { InstrumentReading, Instrument } from '@/types';
import { parameters, MOTOR_DEMO_THRESHOLD } from '@/data/demo';
import { number } from '@/lib/utils';
import { capabilityStatus, capabilityVisual, digitalAttention, isDigitalReading } from '@/lib/equipment-capabilities';
import { ChannelIndicator } from '@/components/overview/channel-indicator';

// Shared live-reading presentation; historical values and CSV remain independent.
export function ChannelReading({ reading, valueType }: { reading: InstrumentReading; valueType?: Instrument['valueType'] }) {
  const config = reading.parameter ? parameters[reading.parameter] : null;
  const available = capabilityVisual(reading).available;
  const value = available && typeof reading.value === 'number' ? reading.value : null;
  const digital = isDigitalReading(reading, valueType);
  const unit = config?.unit ?? reading.unit ?? '';
  const warning = (reading.parameter === 'motorTemperature' && value !== null && value > MOTOR_DEMO_THRESHOLD) || digitalAttention(reading);
  return <div className="flex min-w-0 items-center gap-2" data-channel-reading={reading.tag}>
    <p className={`my-1 min-w-0 text-lg font-semibold ${!available ? 'text-slate-400 dark:text-muted' : warning ? 'text-amber-700 dark:text-warning' : 'text-blue-600 dark:text-accent'}`} title={capabilityStatus(reading)}>
      {digital ? available ? capabilityStatus(reading) : '—' : number(value)}
      {value !== null && <span className="ml-1 text-[10px] font-normal">{unit}</span>}
    </p>
    <ChannelIndicator unit={unit} value={value} max={config?.max ?? reading.max} digital={digital} active={available && typeof reading.value === 'boolean' ? reading.value : null} status={capabilityStatus(reading)} warning={warning} />
  </div>;
}
