import type { ReactNode } from 'react';
import { CircleCheck, CirclePause, CircleHelp, Unplug, TriangleAlert, FlaskConical, Info } from 'lucide-react';
import type { Device, Certainty } from '@/types';
import { certaintyLabels } from '@/data/demo';
import { cn } from '@/lib/utils';
import { deviceStatus, deviceStatusKey, shouldAnimateDeviceStatus } from '@/lib/device-status';
import { Hint } from '@/components/ui/tooltip';
export function CertaintyBadge({ certainty }: { certainty: Certainty }) {
  return <span className={cn('inline-flex rounded-md px-2 py-1 text-[10px] font-medium', ['documented', 'clarified'].includes(certainty) ? 'bg-blue-50 dark:bg-accent-soft text-blue-700 dark:text-accent' : 'bg-amber-50 dark:bg-warning-soft text-amber-800 dark:text-warning')}>{certainty === 'assumed' ? '△ ' : certainty === 'tbd' ? '? ' : ''}{certaintyLabels[certainty]}</span>;
}
export function DemoBadge() { return <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-blue-200 dark:border-accent/40 bg-blue-50 dark:bg-accent-soft px-2 py-1 text-[10px] font-semibold text-blue-700 dark:text-accent sm:text-[11px]"><FlaskConical size={13} />Prototype</span>; }
export function StatusBadge({ device, animated = true }: { device: Device; animated?: boolean }) {
  const status = deviceStatus(device);
  const key = deviceStatusKey(device);
  const Icon = key === 'running' ? CircleCheck : key === 'standby' ? CirclePause : key === 'offline' ? Unplug : CircleHelp;
  return <span aria-label={`${device.id}: ${status.label}. Data demo. ${status.description}`} title={`Data demo · ${status.description}`} className={cn('inline-flex flex-wrap items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold', status.className)}>{shouldAnimateDeviceStatus(device, animated) ? <span aria-hidden="true" className="relative inline-flex h-3 w-3 shrink-0 items-center justify-center"><span className="unit-running-ring absolute h-2 w-2 rounded-full border border-current" /><span className="relative h-1.5 w-1.5 rounded-full bg-current" /></span> : <Icon size={12} aria-hidden="true" />}{status.label}<span className="text-[9px] font-normal">· Data demo</span></span>;
}
export function WarningBadge() { return <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 dark:bg-warning-soft px-2 py-1 text-[11px] font-semibold text-amber-700 dark:text-warning"><TriangleAlert size={12} />Peringatan</span>; }
export function Panel({ children, className, ...props }: React.HTMLAttributes<HTMLElement>) { return <section className={cn('rounded-2xl border border-border bg-white dark:bg-surface shadow-card', className)} {...props}>{children}</section>; }
export function PanelHeading({ title, eyebrow, action }: { title: string; eyebrow?: string; action?: ReactNode }) { return <div className="flex items-center justify-between gap-3 px-5 pb-4 pt-5"><div>{eyebrow && <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">{eyebrow}</p>}<h2 className="text-sm font-semibold text-foreground">{title}</h2></div>{action}</div>; }
export function EmptyState({ title, description }: { title: string; description: string }) { return <div className="flex flex-col items-center justify-center gap-2 px-5 py-8 text-center"><CircleCheck className="mb-1 text-slate-400 dark:text-muted" size={28} /><p className="text-sm font-medium">{title}</p><p className="max-w-sm text-xs leading-relaxed text-muted">{description}</p></div>; }
export function InfoHint({ label }: { label: string }) { return <Hint label={label}><button aria-label={label} className="rounded p-1 text-slate-400 dark:text-muted hover:text-brand dark:hover:text-accent"><Info size={14} /></button></Hint>; }
