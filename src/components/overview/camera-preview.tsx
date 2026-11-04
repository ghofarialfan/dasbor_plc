import { Camera, Expand, VideoOff } from 'lucide-react';
import { useDemo } from '@/context/demo-context';
import { Panel, PanelHeading } from '@/components/shared';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
function CameraScene() { return <div className="camera-scene relative flex min-h-[190px] flex-col items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 p-5"><div className="absolute inset-x-8 bottom-7 h-10 skew-x-[-25deg] border border-slate-200 bg-slate-200/50" /><div className="absolute left-6 top-5 text-[9px] uppercase tracking-widest text-slate-400">Illustration / Camera placeholder</div><div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white bg-white/80 text-slate-400"><VideoOff size={26} strokeWidth={1.4} /></div><p className="relative mt-3 text-xs font-medium text-slate-600">Preview kamera — bukan live stream</p><p className="relative mt-1 text-[10px] text-slate-400">Tidak ada koneksi kamera</p></div>; }
export function CameraPreview() {
  const { device } = useDemo();
  return <Panel className="min-w-0"><PanelHeading title="Camera preview" eyebrow={`${device.id} · ruang genset`} action={<Dialog><DialogTrigger asChild><Button size="icon" variant="ghost" aria-label="Perbesar placeholder kamera"><Expand size={16} /></Button></DialogTrigger><DialogContent className="max-w-3xl"><DialogTitle className="text-lg font-semibold">Camera preview · {device.id}</DialogTitle><DialogDescription className="mb-5 mt-2 text-xs text-muted">Placeholder visual, bukan live stream. Tidak mengambil stream publik.</DialogDescription><CameraScene /></DialogContent></Dialog>} /><div className="px-5"><CameraScene /></div><div className="flex items-center gap-2 px-5 py-4 text-[10px] text-muted"><Camera size={13} />CAM-DEMO · {device.location}</div></Panel>;
}
