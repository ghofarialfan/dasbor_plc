import * as Primitive from '@radix-ui/react-tooltip';
import type { ReactNode } from 'react';
export const TooltipProvider = Primitive.Provider;
export function Hint({ label, children }: { label: string; children: ReactNode }) { return <Primitive.Root><Primitive.Trigger asChild>{children}</Primitive.Trigger><Primitive.Portal><Primitive.Content sideOffset={7} className="z-[60] max-w-64 rounded-lg bg-navy px-3 py-2 text-xs leading-relaxed text-white shadow-lg">{label}<Primitive.Arrow className="fill-navy" /></Primitive.Content></Primitive.Portal></Primitive.Root>; }
