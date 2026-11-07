import { number } from '@/lib/utils';

export function GaugeDial({ label, value, unit, max, color = '#2563eb', warning = false }: {
  label: string; value: number | null; unit: string; max: number; color?: string; warning?: boolean;
}) {
  const fraction = value === null ? 0 : Math.max(0, Math.min(1, value / max));
  return <svg viewBox="0 0 220 145" className="mx-auto mt-2 w-full max-w-[240px]" role="img" aria-label={`${label}: ${number(value)} ${value === null ? '' : unit}`}>
    <path d="M 27 112 A 83 83 0 0 1 193 112" fill="none" stroke="#edf1f7" strokeWidth="12" strokeLinecap="round" />
    {value !== null && <path d="M 27 112 A 83 83 0 0 1 193 112" fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" pathLength="100" strokeDasharray={`${fraction * 100} 100`} />}
    {[0, .25, .5, .75, 1].map(p => { const a = Math.PI * (1 - p); return <line key={p} x1={110 + 68 * Math.cos(a)} y1={112 - 68 * Math.sin(a)} x2={110 + 64 * Math.cos(a)} y2={112 - 64 * Math.sin(a)} stroke="#cbd5e1" strokeWidth="1.5" />; })}
    <text x="110" y="101" textAnchor="middle" fill={warning ? '#b45309' : '#18283e'} fontSize="32" fontWeight="650" className="tabular-nums">{number(value)}</text>
    <text x="110" y="120" textAnchor="middle" fill="#64748b" fontSize="11">{unit}</text>
    <text x="25" y="139" textAnchor="middle" fill="#94a3b8" fontSize="9">0</text><text x="195" y="139" textAnchor="middle" fill="#94a3b8" fontSize="9">{max}</text>
  </svg>;
}
