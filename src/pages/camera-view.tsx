import { cameras as CAMERAS, CameraScene, cameraAvailable } from '@/components/camera-scene';
import { LayoutGrid, Expand } from 'lucide-react';
import { useDemo } from '@/context/demo-context';
import { Panel, PanelHeading } from '@/components/shared';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function CameraViewPage() {
  const { device, filteredDevices, selectDevice, cameraLayout: cols, setCameraLayout: setCols, cameraStorageError } = useDemo();
  return <div className="space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">Power monitoring workspace</p><h1 className="text-[26px] font-semibold tracking-tight sm:text-[28px]">Camera View</h1><p className="mt-1 text-xs leading-relaxed text-muted">Kamera {device.id} · media lokal dan kondisi kamera tidak tersedia</p></div>
      <div className="flex gap-1.5" role="group" aria-label="Tata letak kamera">{[1, 2, 4].map(n => <button key={n} type="button" onClick={() => { setCols(n); }} aria-pressed={cols === n} className={cn('rounded-lg border p-2', cols === n ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-border text-muted hover:bg-slate-50')}><LayoutGrid size={16} /><span className="sr-only">{n} kolom</span></button>)}</div>
    </div>
    <label className="block text-xs font-semibold">Unit terpilih<select value={device.id} onChange={event => selectDevice(event.target.value)} className="ml-3 max-w-full rounded-lg border border-border bg-white p-2">{filteredDevices.map(unit => <option key={unit.id} value={unit.id}>{unit.id} · {unit.name}</option>)}</select></label>
    {cameraStorageError && <p role="alert" className="text-xs text-amber-700">Tata letak tidak dapat disimpan; hanya berlaku selama sesi ini.</p>}
    <Panel className="min-w-0"><PanelHeading title="Grid kamera" eyebrow={`${device.id} · ${CAMERAS.length} kamera`} />
      <div className={cn('grid gap-3 px-5 pb-5', cols === 1 ? 'grid-cols-1' : cols === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4')}>
        {CAMERAS.map(c => <Dialog key={c.id}><div className="relative"><CameraScene key={`${device.id}:${c.id}`} name={`${c.id} · ${c.name}`} available={cameraAvailable(device.online, c.id)} /><DialogTrigger asChild><Button size="icon" variant="ghost" aria-label={`Perbesar ${c.id}`} className="absolute right-2 top-2 h-8 w-8 bg-white/10 text-slate-300 hover:bg-white/20"><Expand size={15} /></Button></DialogTrigger></div><DialogContent className="max-w-3xl"><DialogTitle className="text-lg font-semibold">{c.id} · {c.name}</DialogTitle><DialogDescription className="mb-5 mt-2 text-xs text-muted">Media lokal statis untuk pengujian tampilan; bukan aliran CCTV.</DialogDescription><CameraScene key={`${device.id}:${c.id}`} name={c.name} available={cameraAvailable(device.online, c.id)} /></DialogContent></Dialog>)}
      </div>
      <p className="border-t border-slate-100 px-5 py-3 text-[10px] text-muted">CAM-01–03 memakai ilustrasi lokal saat unit online; CAM-04 dan unit offline menguji kondisi tanpa media. Tidak ada koneksi CCTV.</p>
    </Panel>
  </div>;
}
