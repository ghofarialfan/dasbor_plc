import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { alarms, activities, devicesForSite, deviceForSite, sites } from '@/data/demo';
import { preferences } from '@/lib/preferences';
import { loadJSON, saveJSON } from '@/lib/storage';

function storedSite() {
  try {
    if (localStorage.getItem('genset-demo:v1:site') === null) {
      const legacy = localStorage.getItem('genset-demo-site');
      if (legacy && sites.some(s => s.id === legacy)) saveJSON('site', legacy);
      localStorage.removeItem('genset-demo-site');
    }
  } catch { /* Storage unavailable: validated fallback below. */ }
  return loadJSON<string>('site', 'all', (v): v is string => v === 'all' || sites.some(s => s.id === v));
}
function useDemoState() {
  const [prefs, setPrefs] = useState(preferences);
  useEffect(() => { const update = () => setPrefs(preferences()); window.addEventListener('preferences-changed', update); return () => window.removeEventListener('preferences-changed', update); }, []);
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
  return { preferences: prefs, siteId, setSite, device, selectDevice, filteredDevices, filteredAlarms: alarms.filter(a => ids.has(a.deviceId)), filteredActivities: activities.filter(a => ids.has(a.deviceId)), storageError };
}
type DemoState = ReturnType<typeof useDemoState>;
const DemoContext = createContext<DemoState | null>(null);
export function DemoProvider({ children }: { children: ReactNode }) { const state = useDemoState(); return <DemoContext.Provider value={state}>{children}</DemoContext.Provider>; }
export function useDemo() { const ctx = useContext(DemoContext); if (!ctx) throw new Error('Provider tidak tersedia'); return ctx; }
