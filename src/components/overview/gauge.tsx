import { Gauge as GaugeIcon, Zap, Waves, Thermometer } from 'lucide-react';
import type { DataQuality } from '@/types';
import { parameters, MOTOR_DEMO_THRESHOLD, qualityLabels } from '@/data/demo';
import { number } from '@/lib/utils';
import { Panel, InfoHint } from '@/components/shared';

const icons = { rpm: GaugeIcon, voltage: Zap, frequency: Waves, motorTemperature: Thermometer, roomTemperature: Thermometer, bldcTemperature: Thermometer };
export function GaugeCard({ parameter, value, quality }: { parameter: keyof typeof icons; value: number | null; quality: DataQuality }) {
  const config = parameters[parameter];
  const Icon = icons[parameter];
  value = quality === 'simulated' ? value : null;
  const warning = parameter === 'motorTemperature' && value !== null && value > MOTOR_DEMO_THRESHOLD;
  const color = value === null ? '#94a3b8' : warning ? '#d97706' : '#2563eb';
  const fraction = value === null ? 0 : Math.max(0, Math.min(1, value / config.max));
  return <Panel className="min-w-0 px-4 pb-3 pt-4">
    <div className="flex items-center justify-between gap-1"><div className="flex items-center gap-2 text-[11px] font-medium text-muted"><Icon size={15} /><h3>{config.label}</h3></div><InfoHint label={parameter === 'motorTemperature' ? `Ambang ilustrasi demo ${MOTOR_DEMO_THRESHOLD} °C. Bukan batas proteksi PLC.` : 'Rentang visual ilustrasi, bukan spesifikasi atau batas proteksi mesin.'} /></div>
    <svg viewBox="0 0 220 145" className="mx-auto mt-2 w-full max-w-[240px]" role="img" aria-label={`${config.label}: ${number(value)} ${value === null ? '' : config.unit}`}>
      <path d="M 27 112 A 83 83 0 0 1 193 112" fill="none" stroke="#edf1f7" strokeWidth="12" strokeLinecap="round" />
      {value !== null && <path d="M 27 112 A 83 83 0 0 1 193 112" fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" pathLength="100" strokeDasharray={`${fraction * 100} 100`} />}
      {[0, .25, .5, .75, 1].map(p => { const a = Math.PI * (1 - p); return <line key={p} x1={110 + 68 * Math.cos(a)} y1={112 - 68 * Math.sin(a)} x2={110 + 64 * Math.cos(a)} y2={112 - 64 * Math.sin(a)} stroke="#cbd5e1" strokeWidth="1.5" />; })}
      <text x="110" y="101" textAnchor="middle" fill={warning ? '#b45309' : '#18283e'} fontSize="32" fontWeight="650" className="tabular-nums">{number(value)}</text>
      <text x="110" y="120" textAnchor="middle" fill="#64748b" fontSize="11">{config.unit}</text>
      <text x="25" y="139" textAnchor="middle" fill="#94a3b8" fontSize="9">0</text><text x="195" y="139" textAnchor="middle" fill="#94a3b8" fontSize="9">{config.max}</text>
    </svg>
    <p className={`mt-1 text-center text-[10px] ${warning ? 'font-semibold text-amber-700' : 'text-muted'}`}>{value === null ? qualityLabels[quality] : warning ? '⚠ Di atas ambang ilustrasi demo' : 'Nilai simulasi · bukan pengukuran live'}</p>
  </Panel>;
}
