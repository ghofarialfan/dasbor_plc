export type ChannelIndicatorKind = 'digital' | 'temperature' | 'speed' | 'percentage' | 'bullet' | 'bar';

// Classify by engineering unit, never by a guessed protection threshold.
export function channelIndicatorKind(unit: string, digital: boolean): ChannelIndicatorKind {
  if (digital) return 'digital';
  if (unit === '°C') return 'temperature';
  if (unit.toLowerCase() === 'rpm') return 'speed';
  if (unit === '%' || unit === '%RH') return 'percentage';
  if (['bar', 'kPa', 'Pa', 'mm/s', 'mm/s RMS', 'µm'].includes(unit)) return 'bullet';
  return 'bar';
}

export function indicatorFraction(value: number | null, max: number | undefined): number | null {
  if (value === null || !Number.isFinite(value) || max === undefined || !Number.isFinite(max) || max <= 0) return null;
  return Math.max(0, Math.min(1, value / max));
}
