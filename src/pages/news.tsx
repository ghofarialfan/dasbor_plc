import { useState } from 'react';
import { Newspaper } from 'lucide-react';
import { newsItems } from '@/data/demo';
import type { NewsCategory } from '@/types';
import { dateTime } from '@/lib/utils';
import { Panel, PanelHeading, EmptyState } from '@/components/shared';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const CATEGORIES: (NewsCategory | 'all')[] = ['all', 'operasional', 'pemeliharaan', 'keselamatan', 'umum'];

export function NewsPage() {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('all');
  const list = newsItems.filter(n => category === 'all' || n.category === category);
  return <div className="space-y-5">
    <div><p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">Power monitoring workspace</p><h1 className="text-[26px] font-semibold tracking-tight sm:text-[28px]">News</h1><p className="mt-1 text-xs leading-relaxed text-muted">Pengumuman dan catatan operasional</p></div>
    <Panel className="min-w-0"><PanelHeading title="Pengumuman" eyebrow={`${list.length} item`} action={<div className="flex flex-wrap gap-1">{CATEGORIES.map(c => <button key={c} onClick={() => setCategory(c)} aria-pressed={category === c} className={cn('rounded-md px-2 py-1.5 text-[10px] font-medium', category === c ? 'bg-blue-50 text-blue-700' : 'text-muted hover:bg-slate-50')}>{c === 'all' ? 'Semua' : c}</button>)}</div>} />
      {list.length === 0 ? <EmptyState title="Tidak ada pengumuman" description="Tidak ada item untuk kategori ini." /> : <div className="divide-y divide-slate-100 px-5 pb-5">{list.map(n => <Dialog key={n.id}><DialogTrigger asChild><button className="flex w-full items-start gap-3 py-3.5 text-left hover:bg-slate-50"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-brand"><Newspaper size={16} /></span><span className="min-w-0 flex-1"><span className="block text-xs font-semibold">{n.title}</span><span className="mt-1 block text-[11px] text-muted">{n.body}</span></span><time dateTime={n.timestamp} className="shrink-0 text-[10px] tabular-nums text-muted">{dateTime(n.timestamp)}</time></button></DialogTrigger><DialogContent><DialogTitle className="text-lg font-semibold">{n.title}</DialogTitle><DialogDescription className="mt-2 text-xs text-muted">{n.category} · {dateTime(n.timestamp)}</DialogDescription><p className="mt-4 text-sm leading-relaxed">{n.body}</p></DialogContent></Dialog>)}</div>}
    </Panel>
  </div>;
}
