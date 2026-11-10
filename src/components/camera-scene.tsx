import { useState } from 'react';
import { VideoOff } from 'lucide-react';

export const cameras = [
  { id: 'CAM-01', name: 'Bay depan' },
  { id: 'CAM-02', name: 'Ruang alternator' },
  { id: 'CAM-03', name: 'Pintu kontainer' },
  { id: 'CAM-04', name: 'Area panel' },
];
export function cameraAvailable(online: boolean, cameraId: string) {
  return online && cameras.some(camera => camera.id === cameraId) && cameraId !== 'CAM-04';
}
export function CameraScene({ name, available }: { name: string; available: boolean }) {
  const [failed, setFailed] = useState(false);
  if (available && !failed) return <figure className="relative overflow-hidden rounded-xl bg-slate-900"><img src={`${import.meta.env.BASE_URL}media/camera-scene.svg`} alt={`Ilustrasi lokal ${name}; bukan rekaman perangkat`} className="w-full" onError={() => setFailed(true)} /><figcaption className="p-3 text-xs text-slate-300 dark:text-muted">{name} · Gambar lokal statis, tidak ada aliran CCTV</figcaption></figure>;
  return <div className="relative flex min-h-[190px] flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-900 p-5"><VideoOff size={26} className="text-slate-600 dark:text-muted" /><p className="mt-3 text-xs font-medium text-slate-300 dark:text-muted">{failed ? 'Media lokal gagal dimuat' : 'Kamera belum terhubung'}</p><p className="mt-1 text-[10px] text-slate-500 dark:text-muted">{name} · Tidak ada aliran video</p></div>;
}
