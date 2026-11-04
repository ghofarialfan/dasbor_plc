import { useState } from 'react';
import { LayoutGrid, VideoOff, Expand } from 'lucide-react';
import { useDemo } from '@/context/demo-context';
import { Panel, PanelHeading } from '@/components/shared';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const CAMERAS = [
  { id: 'CAM-01', name: 'Bay depan' },
  { id: 'CAM-02', name: 'Ruang alternator' },
  { id: 'CAM-03', name: 'Pintu kontainer' },
  { id: 'CAM-04', name: 'Area panel' },
];

function CameraScene({ name }: { name: string }) {
  return <div className="relative flex min-h-[160px] flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-900 p-5"><div className="absolute left-4 top-3 text-[9px] uppercase tracking-widest text-slate-500">{name}</div><VideoOff size={26} strokeWidth={1.4} className="text-slate-600" /><p className="mt-3 text-xs font-medium text-slate-300">Kamera belum terhubung</p><p className="mt-1 text-[10px] text-slate-500">Tidak ada aliran video</p></div>;
}

export function CameraViewPage() {
  const { device } = useDemo();
  const [cols, setCols] = useState(2);
  return <div className="space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">Power monitoring workspace</p><h1 className="text-[26px] font-semibold tracking-tight sm:text-[28px]">Camera View</h1><p className="mt-1 text-xs leading-relaxed text-muted">Kamera {device.id} · semua kamera belum terhubung</p></div>
      <div className="flex gap-1.5" role="group" aria-label="Tata letak kamera">{[1, 2, 4].map(n => <button key={n} type="button" onClick={() => setCols(n)} aria-pressed={cols === n} className={cn('rounded-lg border p-2', cols === n ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-border text-muted hover:bg-slate-50')}><LayoutGrid size={16} /><span className="sr-only">{n} kolom</span></button>)}</div>
    </div>
    <Panel className="min-w-0"><PanelHeading title="Grid kamera" eyebrow={`${device.id} · ${CAMERAS.length} kamera`} />
      <div className={cn('grid gap-3 px-5 pb-5', cols === 1 ? 'grid-cols-1' : cols === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4')}>
        {CAMERAS.map(c => <Dialog key={c.id}><div className="relative"><CameraScene name={`${c.id} · ${c.name}`} /><DialogTrigger asChild><Button size="icon" variant="ghost" aria-label={`Perbesar ${c.id}`} className="absolute right-2 top-2 h-8 w-8 bg-white/10 text-slate-300 hover:bg-white/20"><Expand size={15} /></Button></DialogTrigger></div><DialogContent className="max-w-3xl"><DialogTitle className="text-lg font-semibold">{c.id} · {c.name}</DialogTitle><DialogDescription className="mb-5 mt-2 text-xs text-muted">Kamera belum terhubung.</DialogDescription><CameraScene name={c.name} /></DialogContent></Dialog>)}
      </div>
      <p className="border-t border-slate-100 px-5 py-3 text-[10px] text-muted">Tidak ada stream publik. Status kamera tidak menampilkan Online, Recording, atau LIVE.</p>
    </Panel>
  </div>;
}
