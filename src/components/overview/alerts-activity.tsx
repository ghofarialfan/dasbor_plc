import { useState } from 'react';
import { TriangleAlert, Unplug, ArrowUpRight, CircleCheck, Clock3 } from 'lucide-react';
import { useDemo } from '@/context/demo-context';
import { Panel, PanelHeading, EmptyState } from '@/components/shared';
import { cn, dateTime } from '@/lib/utils';

export function SiteNotifications() {
  const { siteId } = useDemo();
  return <NotificationTabs key={siteId} />;
}

function NotificationTabs() {
  const { filteredAlarms, filteredActivities } = useDemo();
  const [tab, setTab] = useState(0);
  const hasWarning = filteredAlarms.some(alarm => alarm.severity === 'warning');
  const tabs = [
    { label: 'Alarm aktif', count: filteredAlarms.length, icon: TriangleAlert },
    { label: 'Aktivitas', count: filteredActivities.length, icon: Clock3 },
  ];
  return <Panel className="min-w-0">
    <PanelHeading title="Notifikasi site" eyebrow="Site terpilih · seluruh unit" action={<span role="status" className={cn('shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold', hasWarning ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600')}>{filteredAlarms.length} alarm aktif</span>} />
    <div role="tablist" aria-label="Jenis notifikasi site" className="mx-5 mb-3 flex gap-1 border-b border-border pb-2">
      {tabs.map(({ label, count, icon: Icon }, index) => <button key={label} type="button" id={`notification-tab-${index}`} role="tab" aria-selected={tab === index} aria-controls={`notification-panel-${index}`} tabIndex={tab === index ? 0 : -1} onClick={() => setTab(index)} onKeyDown={event => {
        if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
          event.preventDefault();
          const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - index;
          setTab(next);
          document.getElementById(`notification-tab-${next}`)?.focus();
        }
      }} className={cn('flex min-w-0 items-center gap-1.5 rounded-lg px-2 py-2 text-[11px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500', tab === index ? 'bg-blue-50 text-blue-700' : 'text-muted hover:bg-slate-50')}><Icon size={13} className="shrink-0" />{label}<span className={cn('rounded px-1.5 py-0.5 text-[10px]', index === 0 && hasWarning ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600')}>{count}</span></button>)}
    </div>
    {tabs.map(({ label }, index) => <div key={label} role="tabpanel" id={`notification-panel-${index}`} aria-labelledby={`notification-tab-${index}`} hidden={tab !== index} tabIndex={0} className="max-h-64 overflow-y-auto rounded-b-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500">{tab === index && (index === 0 ? <ActiveAlerts /> : <RecentActivity />)}</div>)}
  </Panel>;
}

function ActiveAlerts() {
  const { filteredAlarms, selectDevice } = useDemo();
  return <>
    {filteredAlarms.length ? <div className="space-y-3 px-5 pb-5">{filteredAlarms.map(a => <button key={a.id} onClick={() => selectDevice(a.deviceId)} className={cn('w-full rounded-xl border p-3.5 text-left transition-colors', a.severity === 'warning' ? 'border-amber-100 bg-amber-50/60 hover:bg-amber-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100')}>
      <div className="flex items-center justify-between gap-2"><span className="flex items-center gap-2 text-[11px] font-semibold">{a.severity === 'warning' ? <TriangleAlert size={15} className="text-amber-600" /> : <Unplug size={15} className="text-slate-500" />}{a.deviceId}<span className="text-[9px] font-medium uppercase text-muted">{a.severity === 'warning' ? 'Peringatan' : 'Offline'}</span></span><ArrowUpRight size={14} className="text-muted" /></div><p className="mt-2 text-xs font-semibold">{a.title}</p><p className="mt-1 text-[11px] leading-relaxed text-muted">{a.description}</p><p className="mt-2 text-[10px] text-muted">{dateTime(a.timestamp)}</p>
    </button>)}<p className="text-[10px] leading-relaxed text-muted">Klik alarm untuk melihat device terkait.</p></div> : <EmptyState title="Tidak ada alarm aktif" description="Tidak ada alarm pada site terpilih." />}
  </>;
}
function RecentActivity() {
  const { filteredActivities, selectDevice } = useDemo();
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(filteredActivities.length / 20));
  const recentActivities = [...filteredActivities].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
  return <>
    {filteredActivities.length ? <div className="divide-y divide-slate-100 px-5 pb-2">{recentActivities.slice((page - 1) * 20, page * 20).map(a => <button key={a.id} onClick={() => selectDevice(a.deviceId)} className="flex w-full items-center gap-3 py-3.5 text-left hover:bg-slate-50"><span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', a.kind === 'warning' ? 'bg-amber-50 text-amber-600' : a.kind === 'offline' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-600')}>{a.kind === 'warning' ? <TriangleAlert size={14} /> : a.kind === 'offline' ? <Unplug size={14} /> : <CircleCheck size={14} />}</span><div className="min-w-0 flex-1"><p className="text-xs font-medium">{a.title} <span className="ml-1 text-[10px] text-muted">{a.deviceId}</span></p><p className="mt-1 text-[10px] text-muted">{a.description}</p><time dateTime={a.timestamp} className="mt-1 block text-[10px] tabular-nums text-muted">{dateTime(a.timestamp)}</time></div><ArrowUpRight size={13} className="shrink-0 text-slate-400" /></button>)}</div> : <EmptyState title="Belum ada aktivitas" description="Tidak ada aktivitas pada site ini." />}
    <div className="flex justify-between px-5 pb-4 text-xs"><button disabled={page <= 1} onClick={() => setPage(page - 1)}>Sebelumnya</button><span>{page} / {pageCount}</span><button disabled={page >= pageCount} onClick={() => setPage(page + 1)}>Berikutnya</button></div>
  </>;
}
