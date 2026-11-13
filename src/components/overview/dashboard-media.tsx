import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';

export const referenceMedia = [
  { file: 'genset-camera-01.png', title: 'Kamera genset 1' },
  { file: 'genset-thermal.jpg', title: 'Thermal' },
  { file: 'genset-camera-02.png', title: 'Kamera genset 2' },
];

function MediaImage({ file, title, enlarged = false, compact = false }: { file: string; title: string; enlarged?: boolean; compact?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <p role="status" className="p-2 text-xs text-amber-800 dark:text-warning">Gambar gagal dimuat: {title}</p>;
  return <img src={`${import.meta.env.BASE_URL}media/${file}`} alt={`${title} · gambar referensi statis`} onError={() => setFailed(true)} className={enlarged ? 'mx-auto max-h-[65vh] max-w-full object-contain' : compact ? 'h-[110px] w-full object-contain' : 'h-[220px] w-full object-contain sm:h-[260px]'} />;
}

export function ReferenceMediaGallery({ columns = 3, compact = false }: { columns?: 1 | 2 | 3 | 4; compact?: boolean }) {
  return <section aria-label="Gambar referensi kamera" className={compact ? 'rounded-xl border border-border bg-white dark:bg-surface p-2' : 'min-w-0'}>
    <p className="mb-1 text-[9px] text-muted">Gambar referensi statis · bukan live · tidak terhubung ke unit</p>
    <div className={`grid grid-cols-1 gap-2 ${columns === 1 ? '' : columns === 2 ? 'sm:grid-cols-2' : columns === 4 ? 'sm:grid-cols-2 xl:grid-cols-4' : 'sm:grid-cols-3'}`}>
      {referenceMedia.map(item => <Dialog key={item.file}>
        <DialogTrigger asChild><button type="button" className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-slate-100 dark:bg-surface-hover text-center transition-colors hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label={`Perbesar ${item.title}`}>
          <MediaImage {...item} compact={compact} /><span className="block w-full border-t border-border bg-white dark:bg-surface px-1 py-1.5 text-[10px] font-semibold">{item.title} ↗</span>
        </button></DialogTrigger>
        <DialogContent className="max-w-4xl">
          <DialogTitle className="font-semibold">{item.title}</DialogTitle>
          <DialogDescription className="my-3 text-xs text-muted">Gambar referensi statis, bukan live CCTV dan bukan kondisi aktual genset terpilih. Angka pada gambar bukan telemetry aplikasi.</DialogDescription>
          <MediaImage {...item} enlarged />
          <p className="mt-3 text-[10px] text-muted">{item.file === 'genset-thermal.jpg' ? 'Citra termal referensi motor listrik · Zaereth · CC0. Resolusi asli 240×206.' : 'Gambar referensi berwatermark stok foto; lisensi penggunaan produksi perlu dipastikan.'}</p>
        </DialogContent>
      </Dialog>)}
    </div>
  </section>;
}

export function DashboardMedia() {
  return <ReferenceMediaGallery columns={1} compact />;
}
