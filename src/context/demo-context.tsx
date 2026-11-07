import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { alarms, activities, devicesForSite, deviceForSite, sites } from '@/data/demo';
import { preferences } from '@/lib/preferences';
import { applyTarget, seedTargets, isTargetStore } from '@/lib/gauge-targets';
import type { Parameter } from '@/types';
import { applyEquipmentScenario, seedEquipmentSettings, isEquipmentStore } from '@/lib/equipment-settings';
import { loadJSON, saveJSON } from '@/lib/storage';
import { usePersistedState } from '@/lib/use-persisted-state';
import { devices, seedTickets, seedWidgets } from '@/data/demo';
import { isTicketArray, isWidgetArray } from '@/lib/validation';

const isSite = (v: unknown): v is string => v === 'all' || sites.some(s => s.id === v);
const isUnit = (v: unknown): v is string => devices.some(d => d.id === v);
import { migrateDatasetScope } from '@/lib/dataset-migration';

migrateDatasetScope();
import { applyChannelTarget, emptyChannelTargets, isChannelStore, type ChannelValue } from '@/lib/channel-targets';
const initialChannels = emptyChannelTargets();
const initialTargets = seedTargets();
const initialEquipment = seedEquipmentSettings();
storedSite(); // Migrate the legacy key once; reset fallback remains the default scope.
const isCameraLayout = (v: unknown): v is number => v === 1 || v === 2 || v === 4;

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
  useEffect(() => {
    const update = () => setPrefs(preferences());
    window.addEventListener('preferences-changed', update);
    window.addEventListener('storage', update);
    return () => { window.removeEventListener('preferences-changed', update); window.removeEventListener('storage', update); };
  }, []);
  const [siteId, setSiteId, siteStorageError] = usePersistedState('site', 'all', isSite);
  const [selectedId, setSelectedId, unitStorageError] = usePersistedState('selected-unit', 'GEN-001', isUnit);
  const [tickets, setTickets, ticketStorageError] = usePersistedState('tickets', seedTickets, isTicketArray);
  const [widgets, setWidgets, widgetStorageError] = usePersistedState('gauge-widgets', seedWidgets, isWidgetArray);
  const [cameraLayout, setCameraLayout, cameraStorageError] = usePersistedState('camera-layout', 2, isCameraLayout);
  const storageError = siteStorageError || unitStorageError || ticketStorageError || widgetStorageError || cameraStorageError;
  const filteredDevices = devicesForSite(siteId);
  // Derived fallback prevents even one render from pointing to a device in another site.
  const device = deviceForSite(siteId, selectedId);
  const ids = new Set(filteredDevices.map(d => d.id));
  const setSite = (id: string) => {
    if (id !== 'all' && !sites.some(s => s.id === id)) return;
    setSiteId(id);
    setSelectedId(deviceForSite(id, device.id).id);
  };
  const selectDevice = (id: string) => { if (ids.has(id)) setSelectedId(id); };
  const [controls, setControls, controlStorageError] = usePersistedState('gauge-targets', initialTargets, isTargetStore);
  const updateTarget = (id: string, parameter: Parameter, value: number) => {
    const targetDevice = filteredDevices.find(d => d.id === id);
    if (!targetDevice || !ids.has(id)) return false;
    const updated = applyTarget(controls, id, targetDevice.online, parameter, value, new Date().toISOString());
    if (!updated) return false;
    setControls(updated);

    return true;
  };
  const [channelTargets, setChannelTargets, channelStorageError] = usePersistedState('channel-targets', initialChannels, isChannelStore);
  const updateChannelTarget = (id: string, tag: string, channel: string, value: ChannelValue) => {
    if (!filteredDevices.some(d => d.id === id && d.online)) return false;
    let applied = false;
    setChannelTargets(previous => {
      const next = applyChannelTarget(previous, id, tag, channel, value, new Date().toISOString());
      applied = next !== null;
      return next ?? previous;
    });
    return applied;
  };
  const [equipmentSettings, setEquipmentSettings, equipmentStorageError] = usePersistedState('equipment-scenarios', initialEquipment, isEquipmentStore);
  const updateEquipmentScenario = (id: string, equipmentId: string, value: string) => {
    const targetDevice = filteredDevices.find(d => d.id === id);
    if (!targetDevice || !ids.has(id)) return false;
    const updated = applyEquipmentScenario(equipmentSettings, id, targetDevice.online, equipmentId, value, new Date().toISOString());
    if (!updated) return false;
    setEquipmentSettings(updated);

    return true;
  };
  return { channelTargets, updateChannelTarget, channelStorageError, tickets, setTickets, ticketStorageError, widgets, setWidgets, widgetStorageError, cameraLayout, setCameraLayout, cameraStorageError, equipmentSettings, updateEquipmentScenario, equipmentStorageError, controls, updateTarget, controlStorageError, preferences: prefs, siteId, setSite, device, selectDevice, filteredDevices, filteredAlarms: alarms.filter(a => ids.has(a.deviceId)), filteredActivities: activities.filter(a => ids.has(a.deviceId)), storageError };
}
type DemoState = ReturnType<typeof useDemoState>;
const DemoContext = createContext<DemoState | null>(null);
export function DemoProvider({ children }: { children: ReactNode }) { const state = useDemoState(); return <DemoContext.Provider value={state}>{children}</DemoContext.Provider>; }
export function useDemo() { const ctx = useContext(DemoContext); if (!ctx) throw new Error('Provider tidak tersedia'); return ctx; }
