import { devices, sites } from '@/data/demo';
import { PREFIX, saveJSON } from './storage';

// Remove only the retired fleet scope, before validators load retained preferences.
export function migrateDatasetScope() {
  const retired = (id: unknown) => typeof id === 'string' && /^GEN-(00[5-9]|01\d|020)$/.test(id);
  for (const key of ['tickets', 'gauge-widgets', 'gauge-targets', 'equipment-scenarios', 'site', 'selected-unit']) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (raw === null) continue;
      const value = JSON.parse(raw);
      let next = value;
      if (key === 'site' && ['site-c', 'site-d', 'site-e'].includes(value)) next = 'all';
      if (key === 'selected-unit' && retired(value)) {
        const site = JSON.parse(localStorage.getItem(PREFIX + 'site') ?? '"all"');
        next = devices.find(d => !sites.some(s => s.id === site) || d.siteId === site)?.id ?? 'GEN-001';
      }
      if (Array.isArray(value) && ['tickets', 'gauge-widgets'].includes(key)) next = value.filter(row => !retired(row?.unit ?? row?.deviceId));
      if (value && typeof value === 'object' && !Array.isArray(value) && ['gauge-targets', 'equipment-scenarios'].includes(key)) {
        next = { ...value };
        if (value.settings && typeof value.settings === 'object' && !Array.isArray(value.settings)) next.settings = Object.fromEntries(Object.entries(value.settings).filter(([id]) => !retired(id)));
        if (Array.isArray(value.history)) next.history = value.history.filter((row: { deviceId?: unknown } | null) => !retired(row?.deviceId));
      }
      if (JSON.stringify(next) !== raw) saveJSON(key, next);
    } catch { /* Malformed or unavailable storage uses existing validated fallback. */ }
  }
}
