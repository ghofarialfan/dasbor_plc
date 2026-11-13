// Presentation-only outdoor weather. Never derived from TT-303 or PLC status.
export interface DemoWeather {
  readonly temperature: number;
  readonly humidity: number;
  readonly condition: 'Berawan' | 'Hujan ringan';
}
const siteWeather: Readonly<Record<string, DemoWeather>> = {
  'site-a': { temperature: 30, humidity: 72, condition: 'Berawan' },
  'site-b': { temperature: 28, humidity: 84, condition: 'Hujan ringan' },
};

export function weatherForSite(siteId: string): DemoWeather | null {
  return Object.hasOwn(siteWeather, siteId) ? siteWeather[siteId] : null;
}
