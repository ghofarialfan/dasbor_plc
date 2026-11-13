import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useDemo } from '@/context/demo-context';
import { fleetColors, fleetHistory, fleetTotal, illustrativePowerFactor, outputValue } from '@/lib/overview-fleet';
import { GaugeDial } from './gauge-dial';

const display = (value: number | null) => value === null ? '—' : value.toLocaleString('id-ID', { maximumFractionDigits: 2 });
export function FleetOutput() {
  const { filteredDevices, device, selectDevice } = useDemo();
  const history = useMemo(() => fleetHistory(filteredDevices), [filteredDevices.map(unit => unit.id).join(',')]);
  const total = fleetTotal(filteredDevices);
  return <div className="fleet-top">
    <section className="industrial-panel" aria-label="Output masing-masing genset">
      <div className="industrial-heading"><h2>OUTPUT GENSET</h2><span>Snapshot · kW / Hz · PF ilustratif</span></div>
      <div className="fleet-output-grid" style={{ gridTemplateColumns: `repeat(${filteredDevices.length + 1}, minmax(100px, 1fr))` }}>
        {filteredDevices.map((unit, index) => <article key={unit.id} className={`output-unit ${device.id === unit.id ? 'output-selected' : ''}`}>
          <button onClick={() => selectDevice(unit.id)} className="w-full text-xs font-semibold" style={{ color: fleetColors[index % fleetColors.length] }} aria-label={`Pilih detail ${unit.id}`} aria-pressed={device.id === unit.id}>{unit.id}</button>
          <p className="mt-1 text-[9px] text-muted">{!unit.online ? 'Offline' : unit.status === 'standby' ? 'Standby' : unit.status === 'running' ? 'Running' : 'Status tidak diketahui'}</p>
          <div className="output-bars"><ResponsiveContainer width="100%" height="100%"><BarChart data={history}><Bar dataKey={`${unit.id}-power`} fill={fleetColors[index % fleetColors.length]} isAnimationActive={false} /><Tooltip /></BarChart></ResponsiveContainer></div>
          <strong className="text-lg tabular-nums" style={{ color: fleetColors[index % fleetColors.length] }}>{display(outputValue(unit, 'power'))} <small className="text-[10px]">kW</small></strong>
          <p className="mt-1 text-[9px] text-muted">{display(unit.telemetry.voltage)} V · {display(outputValue(unit, 'current'))} A · <span aria-label={`Faktor daya ilustratif ${unit.id}`}>PF {display(illustrativePowerFactor(unit))}</span></p>
          <GaugeDial label={`Frekuensi ${unit.id}`} value={unit.telemetry.frequency} unit="Hz" max={60} color={fleetColors[index % fleetColors.length]} />
        </article>)}
        <article className="output-unit"><h3 className="text-xs font-semibold">TOTAL</h3><p className="mt-1 text-[9px] text-muted">Daya tersedia</p><div className="output-total"><strong>{display(total.value)}</strong><span>kW</span></div><p className="text-[9px] text-muted">{total.available}/{filteredDevices.length} unit tersedia</p><p className="mt-2 text-[9px] text-muted">{total.complete ? 'Cakupan lengkap' : 'Total parsial · data offline tidak dianggap nol'}</p><p className="mt-3 text-[9px] text-muted">V, A, Hz, dan PF tidak dijumlahkan.</p></article>
      </div>
    </section>
    <section className="industrial-panel fleet-comparison" aria-label="Grafik perbandingan antar-genset">
      <div className="industrial-heading"><h2>PERBANDINGAN ANTAR-GENSET</h2><span>1 jam · WIB</span></div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 px-2 text-[9px]">{filteredDevices.map((unit, index) => <span key={unit.id} style={{ color: fleetColors[index % fleetColors.length] }}>● {unit.id}</span>)}</div>
      <div className="comparison-grid">{([{ channel: 'power', label: 'Daya output', unit: 'kW' }, { channel: 'voltage', label: 'Tegangan output', unit: 'V' }, { channel: 'current', label: 'Arus output', unit: 'A' }, { channel: 'pf', label: 'Faktor daya · PF ilustratif', unit: '' }] as const).map(config => <div key={config.channel} className="comparison-section"><h3>{config.label}{config.unit && <span> ({config.unit})</span>}</h3><div className="comparison-chart"><ResponsiveContainer width="100%" height="100%"><LineChart data={history} margin={{ top: 4, right: 12, left: -23, bottom: 0 }}><CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" /><XAxis dataKey="time" tick={{ fontSize: 9, fill: 'currentColor' }} minTickGap={36} /><YAxis domain={config.channel === 'pf' ? [0, 1] : undefined} tick={{ fontSize: 9, fill: 'currentColor' }} /><Tooltip contentStyle={{ background: 'rgb(var(--color-surface))', borderColor: 'rgb(var(--color-border))', fontSize: 11 }} />{filteredDevices.map((unit, index) => <Line key={unit.id} name={config.unit ? `${unit.id} (${config.unit})` : `${unit.id} (PF ilustratif)`} dataKey={`${unit.id}-${config.channel}`} stroke={fleetColors[index % fleetColors.length]} strokeWidth={1.7} dot={false} connectNulls={false} isAnimationActive={false} />)}</LineChart></ResponsiveContainer></div></div>)}</div>
      <p className="px-2 pb-1 text-[9px] text-muted">Garis = genset · celah = data tidak tersedia, bukan nol.</p>
    </section>
  </div>;
}
