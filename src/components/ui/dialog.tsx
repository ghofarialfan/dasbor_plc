import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;
export const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { drawer?: boolean; side?: 'right' }>(({ children, className, drawer, side, ...props }, ref) => <DialogPrimitive.Portal>
  <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-navy/45 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
  <DialogPrimitive.Content ref={ref} className={cn('fixed z-50 bg-white shadow-xl outline-none', drawer ? 'inset-y-0 left-0 w-72 max-w-[85vw] bg-navy text-white' : side === 'right' ? 'inset-y-0 right-0 max-h-dvh w-[min(420px,100vw)] overflow-y-auto rounded-l-2xl p-6' : 'left-1/2 top-1/2 max-h-[88dvh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl p-6', className)} {...props}>
    {children}<DialogPrimitive.Close aria-label="Tutup dialog" className="absolute right-4 top-4 rounded-md p-1 opacity-70 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><X size={20} /></DialogPrimitive.Close>
  </DialogPrimitive.Content>
</DialogPrimitive.Portal>);
DialogContent.displayName = 'DialogContent';
