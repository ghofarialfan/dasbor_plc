import { referenceMedia, ReferenceMediaGallery } from '@/components/overview/dashboard-media';
import { LayoutGrid } from 'lucide-react';
import { useDemo } from '@/context/demo-context';
import { Panel, PanelHeading } from '@/components/shared';
import { cn } from '@/lib/utils';

export function CameraViewPage() {
  const { device, filteredDevices, selectDevice, cameraLayout: cols, setCameraLayout: setCols, cameraStorageError } = useDemo();
  return <div className="space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand dark:text-accent">Power monitoring workspace</p><h1 className="text-[26px] font-semibold tracking-tight sm:text-[28px]">Camera View</h1><p className="mt-1 text-xs leading-relaxed text-muted">Dua gambar kamera genset dan satu citra thermal referensi; bukan kondisi aktual unit terpilih</p></div>
      <div className="flex gap-1.5" role="group" aria-label="Tata letak kamera">{[1, 2, 4].map(n => <button key={n} type="button" onClick={() => { setCols(n); }} aria-pressed={cols === n} className={cn('rounded-lg border p-2', cols === n ? 'border-blue-500 bg-blue-50 dark:bg-accent-soft text-blue-700 dark:text-accent' : 'border-border text-muted hover:bg-slate-50 dark:hover:bg-surface-soft')}><LayoutGrid size={16} /><span className="sr-only">{n} kolom</span></button>)}</div>
    </div>
    <label className="block text-xs font-semibold">Unit terpilih<select value={device.id} onChange={event => selectDevice(event.target.value)} className="ml-3 max-w-full rounded-lg border border-border bg-white dark:bg-surface p-2">{filteredDevices.map(unit => <option key={unit.id} value={unit.id}>{unit.id} · {unit.name}</option>)}</select></label>
    {cameraStorageError && <p role="alert" className="text-xs text-amber-700 dark:text-warning">Tata letak tidak dapat disimpan; hanya berlaku selama sesi ini.</p>}
    <Panel className="min-w-0"><PanelHeading title="Referensi kamera & thermal" eyebrow={`${referenceMedia.length} media lokal`} />
      <div className="px-5 pb-5"><ReferenceMediaGallery columns={cols === 1 ? 1 : cols === 2 ? 2 : 4} /></div>
      <p className="border-t border-slate-100 dark:border-border px-5 py-3 text-[10px] text-muted">Gambar referensi tetap tersedia saat unit offline. Tidak ada koneksi CCTV; angka pada citra thermal bukan telemetry aplikasi.</p>
    </Panel>
  </div>;
}
