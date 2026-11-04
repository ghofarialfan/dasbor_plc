import { timezoneLabel } from '@/lib/preferences';
import { TriangleAlert, Unplug, ArrowUpRight, CircleCheck, Clock3 } from 'lucide-react';
import { useDemo } from '@/context/demo-context';
import { Panel, PanelHeading, EmptyState } from '@/components/shared';
import { cn, dateTime, time } from '@/lib/utils';

export function ActiveAlerts() {
  const { filteredAlarms, selectDevice } = useDemo();
  return <Panel className="min-w-0"><PanelHeading title="Active alerts" eyebrow="Ringkasan" action={<span className="rounded-md bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700">{filteredAlarms.length} aktif</span>} />
    {filteredAlarms.length ? <div className="space-y-3 px-5 pb-5">{filteredAlarms.map(a => <button key={a.id} onClick={() => selectDevice(a.deviceId)} className={cn('w-full rounded-xl border p-3.5 text-left transition-colors', a.severity === 'warning' ? 'border-amber-100 bg-amber-50/60 hover:bg-amber-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100')}>
      <div className="flex items-center justify-between gap-2"><span className="flex items-center gap-2 text-[11px] font-semibold">{a.severity === 'warning' ? <TriangleAlert size={15} className="text-amber-600" /> : <Unplug size={15} className="text-slate-500" />}{a.deviceId}<span className="text-[9px] font-medium uppercase text-muted">{a.severity === 'warning' ? 'Peringatan' : 'Offline'}</span></span><ArrowUpRight size={14} className="text-muted" /></div><p className="mt-2 text-xs font-semibold">{a.title}</p><p className="mt-1 text-[11px] leading-relaxed text-muted">{a.description}</p><p className="mt-2 text-[10px] text-muted">{dateTime(a.timestamp)}</p>
    </button>)}<p className="text-[10px] leading-relaxed text-muted">Klik alarm untuk melihat device terkait.</p></div> : <EmptyState title="Tidak ada alarm aktif" description="Tidak ada alarm pada site terpilih." />}
  </Panel>;
}
export function RecentActivity() {
  const { filteredActivities, selectDevice } = useDemo();
  return <Panel><PanelHeading title="Recent activity" eyebrow="Aktivitas site terpilih" action={<Clock3 size={16} className="text-slate-400" />} />
    {filteredActivities.length ? <div className="divide-y divide-slate-100 px-5">{filteredActivities.map(a => <button key={a.id} onClick={() => selectDevice(a.deviceId)} className="flex w-full items-center gap-3 py-3.5 text-left hover:bg-slate-50"><span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', a.kind === 'warning' ? 'bg-amber-50 text-amber-600' : a.kind === 'offline' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-600')}>{a.kind === 'warning' ? <TriangleAlert size={14} /> : a.kind === 'offline' ? <Unplug size={14} /> : <CircleCheck size={14} />}</span><div className="min-w-0 flex-1"><p className="text-xs font-medium">{a.title} <span className="ml-1 text-[10px] text-muted">{a.deviceId}</span></p><p className="mt-1 text-[10px] text-muted">{a.description}</p></div><time dateTime={a.timestamp} className="shrink-0 text-[10px] tabular-nums text-muted">{time(a.timestamp)} {timezoneLabel()}</time><ArrowUpRight size={13} className="hidden text-slate-400 sm:block" /></button>)}</div> : <EmptyState title="Belum ada aktivitas" description="Tidak ada aktivitas pada site ini." />}
  </Panel>;
}
