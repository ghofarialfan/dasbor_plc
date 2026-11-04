import { loadJSON } from './storage';
export const timezones = ['Asia/Jakarta', 'Asia/Makassar', 'Asia/Jayapura'] as const;
export interface Preferences { timezone: string; notifications: boolean }
export const defaultPreferences: Preferences = { timezone: 'Asia/Jakarta', notifications: true };
export function isPreferences(v: unknown): v is Preferences {
  if (!v || typeof v !== 'object') return false;
  const p = v as Preferences;
  return timezones.some(t => t === p.timezone) && typeof p.notifications === 'boolean';
}
export function preferences() { return loadJSON('profile', defaultPreferences, isPreferences); }
export function timezoneLabel() { return ({ 'Asia/Jakarta': 'WIB', 'Asia/Makassar': 'WITA', 'Asia/Jayapura': 'WIT' } as Record<string, string>)[preferences().timezone]; }
export function notifyPreferences() { window.dispatchEvent(new Event('preferences-changed')); }
