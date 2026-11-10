import { channelIndicatorKind, indicatorFraction } from '@/lib/channel-indicator';

export function ChannelIndicator({ unit, value, max, digital, active, status, warning }: {
  unit: string; value: number | null; max?: number; digital: boolean; active: boolean | null; status: string; warning: boolean;
}) {
  const kind = channelIndicatorKind(unit, digital);
  const limit = kind === 'percentage' ? 100 : max;
  const fraction = indicatorFraction(value, limit);
  const color = warning ? '#d97706' : '#2563eb';
  const title = digital ? status : `Rentang tampilan 0–${limit ?? '—'} ${unit}; bukan batas aman mesin`;
  return <div className="overview-indicator" data-warning={warning} data-indicator={kind} data-available={digital ? active !== null : fraction !== null} title={title}>
    {digital ? <div className="flex h-full items-center gap-1" aria-hidden="true">
      <span data-lamp-state={active === null ? 'unavailable' : active ? 'active' : 'inactive'} className="inline-block h-2 w-2 shrink-0 rounded-full border" style={{ background: active === null ? '#cbd5e1' : active ? color : '#fff', borderColor: active === null ? '#cbd5e1' : active ? color : '#64748b' }} />
    </div> : <svg viewBox="0 0 100 16" preserveAspectRatio="none" className="h-full w-full" role="img" aria-label={`${kind === 'temperature' ? 'Gauge suhu' : kind === 'speed' ? 'Gauge RPM' : kind === 'bullet' ? 'Bullet bar' : kind === 'percentage' ? 'Progress persentase' : 'Bar pengukuran'}: ${fraction === null ? '—' : `${value} ${unit}`}. ${title}`}>
      {kind === 'speed' || kind === 'temperature' ? <>
        <path d="M 5 14 A 45 12 0 0 1 95 14" fill="none" stroke="#dbe3ee" strokeWidth="3" />
        {fraction !== null && <>
          <path d="M 5 14 A 45 12 0 0 1 95 14" fill="none" stroke={color} strokeWidth="3" pathLength="100" strokeDasharray={`${fraction * 100} 100`} />
          <line x1="50" y1="14" x2={50 - 39 * Math.cos(Math.PI * fraction)} y2={14 - 10 * Math.sin(Math.PI * fraction)} stroke={color} strokeWidth="1.5" />
        </>}
        <circle cx="50" cy="14" r="1.5" fill={fraction === null ? '#94a3b8' : color} />
      </> : <>
        <rect x="1" y="5" width="98" height="6" rx={kind === 'percentage' ? 3 : 1} fill="#e2e8f0" />
        {fraction !== null && <rect x="1" y="5" width={98 * fraction} height="6" rx="1" fill={color} opacity={kind === 'bullet' ? 0.3 : 1} />}
        {[1, 25, 50, 75, 99].map(x => <line key={x} x1={x} x2={x} y1="11" y2="14" stroke="#94a3b8" strokeWidth="0.7" />)}
        {kind === 'bullet' && fraction !== null && <line x1={1 + fraction * 98} x2={1 + fraction * 98} y1="2" y2="12" stroke={color} strokeWidth="2" />}
      </>}
      {fraction === null && <text x="50" y="11" textAnchor="middle" fontSize="10" fill="#64748b">—</text>}
    </svg>}
  </div>;
}
