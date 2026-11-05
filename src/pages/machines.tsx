import { MachineGallery } from '@/components/machines/machine-gallery';

export function MachinesPage() {
  return <div className="space-y-5">
    <div>
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">Inventaris peralatan</p>
      <h1 className="text-[26px] font-semibold tracking-tight sm:text-[28px]">Galeri Mesin</h1>
      <p className="mt-1 text-xs leading-relaxed text-muted">Referensi identitas, geometri, fungsi, dan relasi instrumen. Registri ini terpisah dari pilihan site dan device.</p>
    </div>
    <MachineGallery />
  </div>;
}
