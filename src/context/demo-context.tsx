import { createContext, useContext, useState, type ReactNode } from 'react';
import { alarms, activities, devicesForSite, deviceForSite, sites } from '@/data/demo';
import { loadJSON, saveJSON } from '@/lib/storage';

function storedSite() {
  const current = loadJSON<string>('site', 'all', (v): v is string => typeof v === 'string' && sites.some(s => s.id === v));
  if (current !== 'all') return current;
  try { const legacy = localStorage.getItem('genset-demo-site'); if (legacy && sites.some(s => s.id === legacy)) { saveJSON('site', legacy); return legacy; } } catch { /* ignore */ }
  return 'all';
}
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
    setStorageError(!saveJSON('site', id));
  };
  const selectDevice = (id: string) => { if (ids.has(id)) setSelectedId(id); };
  return { siteId, setSite, device, selectDevice, filteredDevices, filteredAlarms: alarms.filter(a => ids.has(a.deviceId)), filteredActivities: activities.filter(a => ids.has(a.deviceId)), storageError };
}
type DemoState = ReturnType<typeof useDemoState>;
const DemoContext = createContext<DemoState | null>(null);
export function DemoProvider({ children }: { children: ReactNode }) { const state = useDemoState(); return <DemoContext.Provider value={state}>{children}</DemoContext.Provider>; }
export function useDemo() { const ctx = useContext(DemoContext); if (!ctx) throw new Error('Provider tidak tersedia'); return ctx; }
