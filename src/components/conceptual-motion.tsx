import { createContext, useContext, type ReactNode } from 'react';
import { useDemo } from '@/context/demo-context';
import { shouldAnimateDeviceStatus } from '@/lib/device-status';

const MotionContext = createContext(false);
export const rotatingConceptItems = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
export const rotatingConceptEquipment = ['motor', 'motor3', 'motor6', 'gearbox4', 'gearbox5', 'gearbox8', 'gearbox9', 'gearbox45', 'alternator', 'pmg', 'catalog-item-10', 'catalog-item-11', 'bldc', 'pump', 'ventilation'];

export function ConceptualMotion({ children }: { children: ReactNode }) {
  const { device } = useDemo();
  const enabled = shouldAnimateDeviceStatus(device);
  return <MotionContext.Provider value={enabled}><div className="space-y-3">
    <p className="text-xs leading-relaxed text-muted">Ilustrasi gerak mengikuti status unit · Data demo, bukan feedback operasi masing-masing komponen. Arah putaran, RPM, dan aliran aktual tidak direpresentasikan. Pengaturan kurangi animasi tetap dihormati.</p>
    {children}
  </div></MotionContext.Provider>;
}

export function ConceptRotor({ x = 0, y = 0, size = 24 }: { x?: number; y?: number; size?: number }) {
  const enabled = useContext(MotionContext);
  return <svg x={x} y={y} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="shrink-0 text-blue-700 dark:text-accent" pointerEvents="none">
    <circle cx="12" cy="12" r="11" fill="#eff6ff" stroke="currentColor" />
    <g className={enabled ? 'concept-rotor concept-rotor-running' : 'concept-rotor'} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 4v16M4 12h16M6.5 6.5l11 11M6.5 17.5l11-11" /><circle cx="12" cy="12" r="3" fill="#eff6ff" /></g>
  </svg>;
}
