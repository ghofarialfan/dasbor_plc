import { forwardRef } from 'react';
import { ArrowUpRight, CircleHelp } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { machineAssetUrl } from '@/data/machine-catalog';
import type { MachineAsset } from '@/types/machine-assets';
import { cn } from '@/lib/utils';

interface MachineCardProps extends ButtonProps {
  machine: MachineAsset;
}

export const MachineCard = forwardRef<HTMLButtonElement, MachineCardProps>(({ machine, className, ...props }, ref) => {
  const assetUrl = machineAssetUrl(machine);
  return <Button
    ref={ref}
    type="button"
    variant="outline"
    className={cn('h-auto min-w-0 flex-col items-stretch gap-0 overflow-hidden whitespace-normal rounded-2xl p-0 text-left shadow-card hover:border-blue-300', className)}
    aria-label={`Lihat detail item ${machine.item}: ${machine.name}`}
    {...props}
  >
    <span className="flex h-44 items-center justify-center border-b border-border bg-slate-50 p-4">
      {assetUrl ? <img src={assetUrl} alt={`Ilustrasi referensi ${machine.name}`} loading="lazy" className="h-full w-full object-contain" /> : <span className="text-center text-xs font-normal text-muted">Ilustrasi belum tersedia</span>}
    </span>
    <span className="flex flex-1 flex-col gap-3 p-4">
      <span className="flex items-start justify-between gap-3">
        <span><span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Item {machine.item}</span><span className="block text-sm font-semibold text-foreground">{machine.name}</span></span>
        <ArrowUpRight aria-hidden="true" size={16} className="shrink-0 text-slate-400" />
      </span>
      <span className="line-clamp-3 text-xs font-normal leading-relaxed text-muted">{machine.function}</span>
      <span className="mt-auto flex items-center justify-between gap-2 pt-1">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600"><CircleHelp aria-hidden="true" size={12} />Unknown</span>
        <span className="text-xs text-muted" aria-label="Pembacaan terkini belum tersedia">—</span>
      </span>
    </span>
  </Button>;
});
MachineCard.displayName = 'MachineCard';
