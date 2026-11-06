import { useState } from 'react';
import { useDemo } from '@/context/demo-context';
import { equipment, ventilationFanStatus, ventilationFanStatusLabels, ventilationFanRotates } from '@/data/demo';
import { machines, machineAssetUrl, instrumentsForMachine } from '@/data/machine-catalog';
import type { EquipmentViewProps } from '@/types';
import { DialogTrigger } from '@/components/ui/dialog';
import { MachineDetailPanel } from '@/components/machines/machine-detail-panel';
import { equipmentLayout, overviewBounds, overviewConnections, overviewEquipmentIdByItem, overviewViewBox, type Point } from './equipment-layout';

function endpoint(item: number, anchor: 'left' | 'right' | 'top' | 'bottom'): Point {
  const node = equipmentLayout.find(position => position.item === item);
  if (!node) throw new Error(`Missing layout item ${item}`);
  return node.anchors[anchor];
}
function connectionEndpoint(value: { item: number; anchor: 'left' | 'right' | 'top' | 'bottom' } | { corridor: string }): Point {
  if ('corridor' in value) throw new Error('Expected an equipment anchor, received a route corridor');
  return endpoint(value.item, value.anchor);
}

function connectionPath(connection: (typeof overviewConnections)[number]): string {
  const corridor = overviewBounds.routes;
  if (connection.id.startsWith('shaft-')) {
    const start = connectionEndpoint(connection.from);
    const end = connectionEndpoint(connection.to);
    const middle = (start.x + end.x) / 2;
    return `M ${start.x} ${start.y} H ${middle} V ${end.y} H ${end.x}`;
  }
  if (connection.id.startsWith('belt-')) {
    const end = connectionEndpoint(connection.to);
    const commonY = (endpoint(10, 'left').y + endpoint(11, 'left').y) / 2;
    return `M ${corridor.beltStartX} ${commonY} H ${corridor.beltJunctionX} V ${end.y} H ${end.x}`;
  }
  if (connection.id === 'cable-1-12') {
    const start = connectionEndpoint(connection.from);
    const end = connectionEndpoint(connection.to);
    return `M ${start.x} ${start.y} H ${corridor.leftCableX} V ${end.y} H ${end.x}`;
  }
  if (connection.id === 'cable-output-17') {
    const start = connectionEndpoint(connection.to);
    return `M ${corridor.outputJoinX} ${start.y} H ${start.x}`;
  }
  if (connection.id.includes('-branch')) {
    const start = connectionEndpoint(connection.from);
    const branchX = corridor.outputJoinX - 38;
    return `M ${start.x} ${start.y} H ${branchX} V ${endpoint(17, 'left').y} H ${corridor.outputJoinX}`;
  }
  const start = connectionEndpoint(connection.from);
  const end = connectionEndpoint(connection.to);
  const middle = (start.x + end.x) / 2;
  return `M ${start.x} ${start.y} H ${middle} V ${end.y} H ${end.x}`;
}
export function MachineIllustration({ selectedId, onSelect }: EquipmentViewProps) {
  const { device, filteredAlarms } = useDemo();
  const [fanPaused, setFanPaused] = useState(false);
  const fanStatus = ventilationFanStatus(device);
  const fanColor = fanStatus === 'running' ? '#335879' : '#94a3b8';
  const available = equipment.filter(e => e.deviceId === device.id);
  const warning = filteredAlarms.some(a => a.deviceId === device.id && a.parameter === 'motorTemperature');

  return <div className="space-y-3 pb-4">
    <p className="text-xs font-semibold text-muted">Ilustrasi skematik</p>
    <p className="text-xs leading-relaxed text-muted">Tata letak konseptual; posisi presentasi, bukan ukuran atau posisi fisik terverifikasi. Ilustrasi aset generik, bukan geometri OEM.</p>
    <div className="grid min-w-0 items-start gap-3 xl:grid-cols-[minmax(0,1fr)_144px]">
      <div className="min-w-0 overflow-x-auto overscroll-x-contain rounded-xl border border-border bg-slate-50 touch-pan-x touch-pan-y" role="region" aria-label="Denah konseptual equipment interaktif, dapat digeser" tabIndex={0}>
        <svg viewBox={`0 0 ${overviewViewBox.width} ${overviewViewBox.height}`} preserveAspectRatio="xMidYMid meet" className="block h-auto w-full min-w-[1100px]" aria-label="Tata letak konseptual equipment">
          <rect {...overviewBounds.container} rx="14" fill="#fff" stroke="#94a3b8" strokeWidth="2" />
          <rect {...overviewBounds.roof} rx="10" fill="#eef6fb" stroke="#bfceda" strokeWidth="2" />
          <text x="178" y="79" fontSize="12" fontWeight="600" fill="#475569">AREA ATAP</text>
          <rect {...overviewBounds.equipment} rx="10" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
          <text x="286" y="78" fontSize="12" fontWeight="600" fill="#475569">AREA EQUIPMENT</text>
          <g aria-label="Koneksi konseptual" fill="none" strokeLinecap="round" strokeLinejoin="round" pointerEvents="none">
            {overviewConnections.map(connection => <path key={connection.id} d={connectionPath(connection)} stroke={connection.style === 'cable' ? '#dc2626' : '#111827'} strokeWidth={connection.style === 'shaft' ? 4 : 3} strokeDasharray={connection.style === 'belt' ? '8 6' : undefined} />)}
          </g>
          {equipmentLayout.map(position => {
            const machine = machines.find(entry => entry.id === position.machineId);
            if (!machine) return null;
            const { x, y, width, height, labelWidth, label } = position;
            const assetUrl = machineAssetUrl(machine);
            const item = machine.item;
            const equipmentId = overviewEquipmentIdByItem[item];
            const triggerId = equipmentId ?? `catalog-item-${item}`;
            const active = selectedId === triggerId;
            const content = <>
              {active && <rect x={x - (labelWidth - width) / 2 - 5} y={y - 8} width={Math.max(labelWidth, width) + 10} height={height + 48} rx="8" fill="#eff6ff" fillOpacity="0.55" stroke="#2563eb" strokeWidth="2.5" pointerEvents="none" />}
              {assetUrl && <image href={assetUrl} x={x} y={y} width={width} height={height} preserveAspectRatio="xMidYMid meet" aria-hidden="true" />}
              <circle cx={x + 10} cy={y + 10} r="10" fill="#233d60" />
              <text x={x + 10} y={y + 14} textAnchor="middle" fontSize="11" fontWeight="700" fill="white">{item}</text>
              <text x={x + width / 2} y={y + height + 19} textAnchor="middle" fontSize="14" fontWeight="600" fill="#233d60">{label}</text>
              {item === 2 && warning && <text x={x + width / 2} y={y + height + 34} textAnchor="middle" fontSize="11" fill="#92400e">TT-02 peringatan</text>}
            </>;
            const activate = (event: React.MouseEvent<SVGGElement>) => { event.currentTarget.focus(); onSelect(triggerId); };
            const keyboard = (event: React.KeyboardEvent<SVGGElement>) => {
              if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.currentTarget.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
            };
            return <DialogTrigger asChild key={machine.id}><g role="button" tabIndex={0} aria-label={`${machine.name}, item ${item}. Buka detail`} data-catalog-item={item} onClick={activate} onKeyDown={keyboard} className="machine-part cursor-pointer outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600">{content}</g></DialogTrigger>;
          })}
          <g aria-label="Legenda koneksi konseptual">
            <rect {...overviewBounds.legend} rx="9" fill="#fff" stroke="#cbd5e1" />
            <path d="M 44 578 H 78" stroke="#111827" strokeWidth="4" />
            <text x="86" y="582" fontSize="12" fill="#475569">Poros/kopling · hitam solid</text>
            <path d="M 330 578 H 364" stroke="#111827" strokeWidth="3" strokeDasharray="8 6" />
            <text x="372" y="582" fontSize="12" fill="#475569">Belt · hitam putus-putus</text>
            <path d="M 656 578 H 690" stroke="#dc2626" strokeWidth="3" />
            <text x="698" y="582" fontSize="12" fill="#475569">Jalur kabel pada draf · merah solid</text>
            <text x="44" y="598" fontSize="10" fill="#64748b">Geometri konseptual, bukan konfirmasi koneksi fisik/OEM, arah daya, atau commissioning.</text>
          </g>
        </svg>
      </div>
      <aside className="rounded-xl border border-dashed border-border bg-slate-50 p-3" aria-label="M-301, kipas ilustratif; posisi tidak dikonfirmasi">
        <p className="text-xs font-semibold text-muted">M-301 · ilustratif</p>
        <svg viewBox="0 0 200 145" className="mx-auto block h-auto w-full max-w-[200px]" aria-label={`Kipas M-301, ${ventilationFanStatusLabels[fanStatus]}`}>
          <DialogTrigger asChild><g role="button" tabIndex={0} aria-label={`Kipas M-301, ${ventilationFanStatusLabels[fanStatus]}. Buka detail`} data-catalog-item="ventilation" onClick={event => { event.currentTarget.focus(); onSelect('ventilation'); }} onKeyDown={event => {
            if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.currentTarget.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
          }} className="machine-part cursor-pointer outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600">
            <circle cx="100" cy="70" r="42" fill="#dbe5ef" stroke="#466389" strokeWidth="3" />
            <g className="ventilation-fan-blades" style={{ transformOrigin: '100px 70px', animationPlayState: ventilationFanRotates(fanStatus, fanPaused) ? 'running' : 'paused' }} pointerEvents="none" aria-hidden="true">
              {[0, 90, 180, 270].map(angle => <path key={angle} d="M100 70 C85 59 85 42 99 41 C113 40 116 54 100 70 Z" transform={`rotate(${angle} 100 70)`} fill={fanColor} />)}
            </g><circle cx="100" cy="70" r="6" fill="#64748b" pointerEvents="none" />
            <text x="100" y="130" textAnchor="middle" fontSize="11" fontWeight="600" fill="#233d60">{ventilationFanStatusLabels[fanStatus]}</text>
          </g></DialogTrigger>
        </svg>
        <button type="button" aria-pressed={fanPaused} onClick={() => setFanPaused(value => !value)} className="w-full rounded-lg border border-border bg-white px-3 py-2 text-xs hover:bg-blue-50">{fanPaused ? 'Lanjutkan animasi' : 'Jeda animasi'}</button>
        <p className="mt-2 text-[10px] leading-relaxed text-muted">Status tampilan; tidak menunjukkan posisi client atau RPM.</p>
      </aside>
    </div>
    <p className="rounded-lg border border-border bg-white px-3 py-2 text-xs text-muted">Item 18 · Belum teridentifikasi. Tidak ditampilkan pada denah karena posisi dan aset belum tersedia.</p>
    <div className="flex flex-wrap gap-2">
      {selectedId.startsWith('catalog-item-') && (() => {
        const machine = machines.find(entry => entry.item === Number(selectedId.slice('catalog-item-'.length)));
        return machine ? <MachineDetailPanel machine={machine} instruments={instrumentsForMachine(machine.id)} layout="dialog" /> : null;
      })()}
    </div>
    <div className="rounded-xl border border-blue-100 bg-blue-50/30 p-3"><p className="mb-2 text-xs font-semibold">Relasi fungsional konseptual: Alternator 7 → CB-01 → output 17 · PM-01 pengukuran, bukan konversi</p><p className="mb-2 text-xs text-muted">Relasi fungsi ini terpisah dari rute merah yang digambarkan pada denah; posisi CB-01 belum dikonfirmasi.</p><div className="flex flex-wrap gap-2">{['alternator', 'breaker', 'output'].map(id => { const e = available.find(entry => entry.id === id)!; return <DialogTrigger asChild key={id}><button onClick={event => { event.currentTarget.focus(); onSelect(id); }} className={`rounded-lg border bg-white px-3 py-2 text-xs hover:bg-blue-50 ${selectedId === id ? 'border-blue-500' : 'border-border'}`}>{e.name} · {e.item}</button></DialogTrigger>; })}</div></div>
    <div className="flex flex-wrap gap-2">{['pv', 'cabinet', 'bldc', 'shaft-train', 'oil19', 'oil20', 'pump', 'ventilation', 'pmg', 'avr'].map(id => { const e = available.find(entry => entry.id === id)!; return <DialogTrigger asChild key={id}><button onClick={event => { event.currentTarget.focus(); onSelect(id); }} className={`rounded-lg border px-3 py-2 text-xs hover:bg-blue-50 ${selectedId === id ? 'border-blue-500 bg-blue-50' : 'border-border'}`}>{e.name} · {e.item}</button></DialogTrigger>; })}</div>
    <p className="text-[11px] leading-relaxed text-muted">Mapping motor 2/3/6, gearbox 4/5/8/9, dan alternator 7 dipertahankan. Tidak ada klaim ukuran, kopling, arah daya, atau lokasi P-201. Status runtime bukan pembacaan aktual.</p>
  </div>;
}
