import { preferences, timezoneLabel } from './preferences';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function time(value: string) { return new Intl.DateTimeFormat('id-ID', { timeZone: preferences().timezone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(value)).replace('.', ':'); }
export function dateTime(value: string) { return `${new Intl.DateTimeFormat('id-ID', { timeZone: preferences().timezone, day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))}, ${time(value)} ${timezoneLabel()}`; }
export function number(value: number | null) { return value === null ? '—' : new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 }).format(value); }
