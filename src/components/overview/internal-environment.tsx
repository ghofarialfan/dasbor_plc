import { Cloud, CloudRain } from 'lucide-react';
import { useDemo } from '@/context/demo-context';
import { sites } from '@/data/demo';
import { weatherForSite } from '@/lib/overview-weather';
import { internalPower, internalPowerDefinitions, overviewProvenance } from '@/lib/overview-fleet';
import { GaugeTargetControl } from '@/components/gauge-target-control';
import { GaugeDial } from './gauge-dial';

export function InternalEnvironment() {
  const { device } = useDemo();
  const weather = weatherForSite(device.siteId);
  const siteName = sites.find(site => site.id === device.siteId)?.name ?? device.siteId;
  const WeatherIcon = weather?.condition === 'Hujan ringan' ? CloudRain : Cloud;
  return <div className="internal-environment">
    <section className="industrial-panel"><div className="industrial-heading"><h2>DAYA MESIN INTERNAL</h2><span>{device.id} · kW</span></div><div className="internal-power-grid">{internalPowerDefinitions.map(item => <div key={item.id} className="internal-gauge"><h3>{item.name}</h3><GaugeDial label={`Daya ${item.name}`} value={internalPower(device, item.normal)} unit="kW" max={item.max} color="#34d399" /></div>)}</div><p className="panel-disclosure">{overviewProvenance}</p></section>
    <section className="industrial-panel room-panel"><div className="industrial-heading"><h2>SUHU RUANGAN &amp; CUACA</h2><span>{device.id}</span></div><div className="room-weather-grid"><div className="room-reading"><div><span className="text-[10px] text-muted">TT-303 · SUHU AKTUAL</span><p>{device.telemetry.roomTemperature ?? '—'} <small>°C</small></p></div><GaugeDial label="Suhu ruangan" value={device.telemetry.roomTemperature} unit="°C" max={60} color="#38bdf8" /></div><aside className="site-weather" aria-label="Cuaca luar ilustratif"><h3>Cuaca luar · {siteName}</h3>{weather ? <><div className="weather-summary"><WeatherIcon aria-hidden="true" /><strong>{weather.temperature} °C</strong></div><p>{weather.condition} · kelembapan {weather.humidity}%</p></> : <p>Cuaca tidak tersedia</p>}<small>Cuaca ilustratif · bukan data aktual</small></aside></div><GaugeTargetControl device={device} parameter="roomTemperature" measured={device.telemetry.roomTemperature} /></section>
  </div>;
}
