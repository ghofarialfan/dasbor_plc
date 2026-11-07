import { ConceptRotor, rotatingConceptItems } from '@/components/conceptual-motion';
import { connectionPath } from './equipment-connections';
import { useDemo } from '@/context/demo-context';
import { equipment } from '@/data/demo';
import { machines, machineAssetUrl } from '@/data/machine-catalog';
import type { EquipmentViewProps } from '@/types';
import { DialogTrigger } from '@/components/ui/dialog';
import { equipmentLayout, overviewBounds, overviewConnections, getOverviewDetailId, overviewViewBox } from './equipment-layout';

export function MachineIllustration({ selectedId, onSelect, showSupportingPanels = true }: EquipmentViewProps & { showSupportingPanels?: boolean }) {
  const { device, filteredAlarms } = useDemo();
  const available = equipment.filter(e => e.deviceId === device.id);
  const warning = filteredAlarms.some(a => a.deviceId === device.id && a.parameter === 'motorTemperature');

  return <div className="space-y-3 pb-4">
    <p className="text-xs font-semibold text-muted">Ilustrasi skematik</p>
    <p className="text-xs leading-relaxed text-muted">Tata letak konseptual; posisi presentasi, bukan ukuran atau posisi fisik terverifikasi. Ilustrasi aset generik, bukan geometri OEM.</p>
    <div className="min-w-0">
      <div className="min-w-0 overflow-x-auto overscroll-x-contain rounded-xl border border-border bg-slate-50 touch-pan-x touch-pan-y" role="region" aria-label="Denah konseptual equipment interaktif, dapat digeser" tabIndex={0}>
        <svg viewBox={`0 0 ${overviewViewBox.width} ${overviewViewBox.height}`} preserveAspectRatio="xMidYMid meet" className="mx-auto block h-auto w-full min-w-[960px] max-w-[1440px]" aria-label="Tata letak konseptual equipment">
          <rect {...overviewBounds.container} rx="14" fill="#fff" stroke="#94a3b8" strokeWidth="2" />
          <rect {...overviewBounds.roof} rx="10" fill="#eef6fb" stroke="#bfceda" strokeWidth="2" />
          <text x="178" y={overviewBounds.roof.y + 31} fontSize="12" fontWeight="600" fill="#475569">AREA ATAP</text>
          <rect {...overviewBounds.equipment} rx="10" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
          <text x={overviewBounds.equipment.x + 24} y={overviewBounds.equipment.y + 28} fontSize="12" fontWeight="600" fill="#475569">AREA EQUIPMENT</text>
          <rect {...overviewBounds.outputArea} rx="10" fill="#fff" stroke="#cbd5e1" strokeWidth="1.5" />
          <text x="1084" y={overviewBounds.outputArea.y + 22} textAnchor="middle" fontSize="12" fontWeight="600" fill="#475569">OUTPUT</text>
          <g aria-label="Koneksi konseptual" fill="none" strokeLinecap="round" strokeLinejoin="round" pointerEvents="none">
            {overviewConnections.map(connection => <path key={connection.id} d={connectionPath(connection)} stroke={connection.style === 'lubrication' ? '#0f766e' : connection.style === 'cable' ? '#dc2626' : '#111827'} strokeWidth={connection.style === 'shaft' ? 3 : 2} strokeDasharray={connection.style === 'belt' ? '7 5' : undefined} />)}
          </g>
          {equipmentLayout.map(position => {
            const machine = machines.find(entry => entry.id === position.machineId);
            if (!machine) return null;
            const { x, y, width, height, labelWidth, label } = position;
            const assetUrl = machineAssetUrl(machine);
            const item = machine.item;
            const triggerId = getOverviewDetailId(item);
            const active = selectedId === triggerId;
            const content = <>
              <rect x={x - (Math.max(labelWidth, width) - width) / 2 - 5} y={y - 8} width={Math.max(labelWidth, width) + 10} height={height + 32} rx="8" fill={active ? '#eff6ff' : 'transparent'} fillOpacity="0.55" stroke={active ? '#2563eb' : 'none'} strokeWidth="1.5" />
              {assetUrl && <image href={assetUrl} x={x} y={y} width={width} height={height} preserveAspectRatio="xMidYMid meet" aria-hidden="true" />}
              {rotatingConceptItems.includes(item) && <ConceptRotor x={x + width - 24} y={y + height - 24} />}
              <circle cx={x + 10} cy={y + 10} r="10" fill="#233d60" />
              <text x={x + 10} y={y + 14} textAnchor="middle" fontSize="11" fontWeight="700" fill="white">{item}</text>
              <text x={x + width / 2} y={y + height + 19} textAnchor="middle" fontSize="14" fontWeight="600" fill="#233d60" stroke="#f8fafc" strokeWidth="5" paintOrder="stroke" strokeLinejoin="round">{label}</text>
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
            <g transform={`translate(0 ${overviewBounds.legend.y - 552})`}>
            <path d="M 44 578 H 78" stroke="#111827" strokeWidth="3" />
            <text x="86" y="582" fontSize="12" fill="#475569">Poros/kopling · hitam solid</text>
            <path d="M 330 578 H 364" stroke="#111827" strokeWidth="2" strokeDasharray="7 5" />
            <text x="372" y="582" fontSize="12" fill="#475569">Belt · hitam putus-putus</text>
            <path d="M 656 578 H 690" stroke="#dc2626" strokeWidth="2" />
            <text x="698" y="582" fontSize="12" fill="#475569">Kabel draf · merah</text>
            <path d="M 870 578 H 904" stroke="#0f766e" strokeWidth="2" />
            <text x="912" y="582" fontSize="12" fill="#475569">Suplai oli · hijau kebiruan</text>
            <text x="44" y="598" fontSize="10" fill="#64748b">Geometri konseptual, bukan konfirmasi koneksi fisik/OEM, arah daya, atau commissioning.</text>
            </g>
          </g>
        </svg>
      </div>
    </div>
    {showSupportingPanels && <>
    <p className="rounded-lg border border-teal-100 bg-teal-50/50 px-3 py-2 text-xs leading-relaxed text-teal-900">Suplai oli langsung: TK-19 → Gearbox 4 &amp; 5; TK-20 → Gearbox 8 &amp; 9. Pemetaan dikonfirmasi pengguna; rute pipa fisik dan jalur return belum dikonfirmasi. Garis bukan indikator aliran aktual.</p>
    <p className="rounded-lg border border-border bg-white px-3 py-2 text-xs text-muted">Item 18 · Belum teridentifikasi. Tidak ditampilkan pada denah karena posisi dan aset belum tersedia.</p>
    <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
    <div className="rounded-xl border border-blue-100 bg-blue-50/30 p-3"><h4 className="text-[10px] font-semibold uppercase tracking-wide text-blue-800">Relasi fungsional konseptual</h4><p className="mt-2 text-sm font-semibold">Alternator 7 → CB-01 → Output 17</p><p className="mb-3 mt-2 text-[11px] leading-relaxed text-muted">PM-01 pengukuran, bukan konversi. Relasi fungsi ini terpisah dari rute merah pada denah; posisi CB-01 belum dikonfirmasi.</p><div className="flex flex-wrap gap-2">{['alternator', 'breaker', 'output'].map(id => { const e = available.find(entry => entry.id === id)!; return <DialogTrigger asChild key={id}><button onClick={event => { event.currentTarget.focus(); onSelect(id); }} className={`rounded-lg border bg-white px-3 py-2 text-xs hover:bg-blue-50 ${selectedId === id ? 'border-blue-500' : 'border-border'}`}>{e.name} · {e.item}</button></DialogTrigger>; })}</div></div>
    <div className="grid gap-4 rounded-xl border border-border p-4 sm:grid-cols-2">
      {[
        { title: 'Kelistrikan', items: [['pv', 'PLTS'], ['cabinet', 'Kabinet / VFD'], ['bldc', 'BLDC'], ['pmg', 'PMG · 10/11'], ['avr', 'AVR']] },
        { title: 'Pelumasan', items: [['oil19', 'TK-19'], ['oil20', 'TK-20'], ['pump', 'Pompa oli']] },
        { title: 'Pendukung', items: [['shaft-train', 'Pengukuran poros'], ['ventilation', 'Ventilasi ruang']] },
      ].map(group => <section key={group.title} className={group.title === 'Kelistrikan' ? 'sm:col-span-2' : ''}>
        <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted">{group.title}</h4>
        <div className="flex flex-wrap gap-2">{group.items.map(([id, label]) => {
          const e = available.find(entry => entry.id === id)!;
          return <DialogTrigger asChild key={id}><button type="button" aria-label={`${label} · ${e.name} · ${e.item}. Buka detail`} onClick={event => { event.currentTarget.focus(); onSelect(id); }} className={`min-h-9 rounded-lg border px-3 py-2 text-left text-xs transition-colors hover:bg-blue-50 ${selectedId === id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-border bg-white'}`}>{label}</button></DialogTrigger>;
        })}</div>
      </section>)}
    </div>
    </div>
    </>}
  </div>;
}
