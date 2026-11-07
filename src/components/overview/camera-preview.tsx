import { Camera, Expand } from 'lucide-react';
import { useDemo } from '@/context/demo-context';
import { Panel, PanelHeading } from '@/components/shared';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CameraScene, cameras, cameraAvailable } from '@/components/camera-scene';
export function CameraPreview() {
  const { device } = useDemo();
  return <Panel className="min-w-0"><PanelHeading title="Camera preview" eyebrow={`${device.id} · ruang genset`} action={<Dialog><DialogTrigger asChild><Button size="icon" variant="ghost" aria-label="Perbesar tampilan kamera"><Expand size={16} /></Button></DialogTrigger><DialogContent className="max-w-3xl"><DialogTitle className="text-lg font-semibold">Camera preview · {device.id}</DialogTitle><DialogDescription className="mb-5 mt-2 text-xs text-muted">Media lokal statis; bukan aliran CCTV.</DialogDescription><CameraScene key={device.id} name={`${cameras[0].id} · ${cameras[0].name}`} available={cameraAvailable(device.online, cameras[0].id)} /></DialogContent></Dialog>} /><div className="px-5"><CameraScene key={device.id} name={`${cameras[0].id} · ${cameras[0].name}`} available={cameraAvailable(device.online, cameras[0].id)} /></div><div className="flex items-center gap-2 px-5 py-4 text-[10px] text-muted"><Camera size={13} />CAM-01 · {device.location}</div></Panel>;
}
