import type { ReactNode } from 'react';
import { CircleCheck, CirclePause, CircleHelp, Unplug, TriangleAlert, FlaskConical, Info } from 'lucide-react';
import type { Device, Certainty } from '@/types';
import { certaintyLabels } from '@/data/demo';
import { cn } from '@/lib/utils';
import { Hint } from '@/components/ui/tooltip';
export function CertaintyBadge({ certainty }: { certainty: Certainty }) {
  return <span className={cn('inline-flex rounded-md px-2 py-1 text-[10px] font-medium', ['documented', 'clarified'].includes(certainty) ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-800')}>{certainty === 'assumed' ? '△ ' : certainty === 'tbd' ? '? ' : ''}{certaintyLabels[certainty]}</span>;
}
export function DemoBadge() { return <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700 sm:text-[11px]"><FlaskConical size={13} />Demo Mode — Simulated Data</span>; }
export function StatusBadge({ device }: { device: Device }) {
  const [Icon, label, style] = !device.online ? [Unplug, 'Offline', 'bg-slate-100 text-slate-600'] : device.status === 'running' ? [CircleCheck, 'Running', 'bg-emerald-50 text-emerald-700'] : device.status === 'standby' ? [CirclePause, 'Standby', 'bg-blue-50 text-blue-700'] : [CircleHelp, 'Unknown', 'bg-slate-100 text-slate-600'];
  return <span className={cn('inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold', style)}><Icon size={12} />{label}</span>;
}
export function WarningBadge() { return <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700"><TriangleAlert size={12} />Warning demo</span>; }
export function Panel({ children, className, ...props }: React.HTMLAttributes<HTMLElement>) { return <section className={cn('rounded-2xl border border-border bg-white shadow-card', className)} {...props}>{children}</section>; }
export function PanelHeading({ title, eyebrow, action }: { title: string; eyebrow?: string; action?: ReactNode }) { return <div className="flex items-center justify-between gap-3 px-5 pb-4 pt-5"><div>{eyebrow && <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">{eyebrow}</p>}<h2 className="text-sm font-semibold text-foreground">{title}</h2></div>{action}</div>; }
export function EmptyState({ title, description }: { title: string; description: string }) { return <div className="flex flex-col items-center justify-center gap-2 px-5 py-8 text-center"><CircleCheck className="mb-1 text-slate-400" size={28} /><p className="text-sm font-medium">{title}</p><p className="max-w-sm text-xs leading-relaxed text-muted">{description}</p></div>; }
export function InfoHint({ label }: { label: string }) { return <Hint label={label}><button aria-label={label} className="rounded p-1 text-slate-400 hover:text-brand"><Info size={14} /></button></Hint>; }
