import { Camera, Expand, VideoOff } from 'lucide-react';
import { useDemo } from '@/context/demo-context';
import { Panel, PanelHeading } from '@/components/shared';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
function CameraScene() { return <div className="camera-scene relative flex min-h-[190px] flex-col items-center justify-center overflow-hidden rounded-xl border border-slate-800 bg-slate-900 p-5"><div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 text-slate-500"><VideoOff size={26} strokeWidth={1.4} /></div><p className="relative mt-3 text-xs font-medium text-slate-300">Kamera belum terhubung</p><p className="relative mt-1 text-[10px] text-slate-500">Tidak ada aliran video</p></div>; }
export function CameraPreview() {
  const { device } = useDemo();
  return <Panel className="min-w-0"><PanelHeading title="Camera preview" eyebrow={`${device.id} · ruang genset`} action={<Dialog><DialogTrigger asChild><Button size="icon" variant="ghost" aria-label="Perbesar tampilan kamera"><Expand size={16} /></Button></DialogTrigger><DialogContent className="max-w-3xl"><DialogTitle className="text-lg font-semibold">Camera preview · {device.id}</DialogTitle><DialogDescription className="mb-5 mt-2 text-xs text-muted">Kamera belum terhubung.</DialogDescription><CameraScene /></DialogContent></Dialog>} /><div className="px-5"><CameraScene /></div><div className="flex items-center gap-2 px-5 py-4 text-[10px] text-muted"><Camera size={13} />CAM-01 · {device.location}</div></Panel>;
}
