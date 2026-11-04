import { createContext, useContext, useState, type ReactNode } from 'react';
import { alarms, activities, devicesForSite, deviceForSite, sites } from '@/data/demo';

function storedSite() { try { const value = localStorage.getItem('genset-demo-site'); return sites.some(s => s.id === value) ? value! : 'all'; } catch { return 'all'; } }
function useDemoState() {
  const [siteId, setSiteId] = useState(storedSite);
  const [selectedId, setSelectedId] = useState('GEN-001');
  const [storageError, setStorageError] = useState(false);
  const filteredDevices = devicesForSite(siteId);
  // Derived fallback prevents even one render from pointing to a device in another site.
  const device = deviceForSite(siteId, selectedId);
  const ids = new Set(filteredDevices.map(d => d.id));
  const setSite = (id: string) => {
    if (id !== 'all' && !sites.some(s => s.id === id)) return;
    setSiteId(id);
    try { localStorage.setItem('genset-demo-site', id); setStorageError(false); } catch { setStorageError(true); }
  };
  const selectDevice = (id: string) => { if (ids.has(id)) setSelectedId(id); };
  return { siteId, setSite, device, selectDevice, filteredDevices, filteredAlarms: alarms.filter(a => ids.has(a.deviceId)), filteredActivities: activities.filter(a => ids.has(a.deviceId)), storageError };
}
type DemoState = ReturnType<typeof useDemoState>;
const DemoContext = createContext<DemoState | null>(null);
export function DemoProvider({ children }: { children: ReactNode }) { const state = useDemoState(); return <DemoContext.Provider value={state}>{children}</DemoContext.Provider>; }
export function useDemo() { const ctx = useContext(DemoContext); if (!ctx) throw new Error('Provider tidak tersedia'); return ctx; }
