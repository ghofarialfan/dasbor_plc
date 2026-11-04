import { useState } from 'react';
import { useDemo } from '@/context/demo-context';
import { equipment } from '@/data/demo';
import type { EquipmentViewProps } from '@/types';
import { DialogTrigger } from '@/components/ui/dialog';

const ids = ['motor', 'motor3', 'gearbox4', 'gearbox5', 'motor6', 'alternator', 'gearbox8', 'gearbox9'];
export function MachineIllustration({ selectedId, onSelect }: EquipmentViewProps) {
  const { device, filteredAlarms } = useDemo();
  const [hovered, setHovered] = useState('');
  const available = equipment.filter(e => e.deviceId === device.id);
  const warning = filteredAlarms.some(a => a.deviceId === device.id && a.parameter === 'motorTemperature');
  return <div className="space-y-3 pb-4">
    <p className="text-xs font-semibold text-muted">Ilustrasi konseptual — bukan gambar OEM</p>
    <p className="text-xs leading-relaxed text-muted">Identitas item 3–9: Keterangan rekan proyek. Deret 2 → 3 → 4/5 → 6 → 7 konseptual, bukan detail kopling. Geser dan pilih komponen untuk detail.</p>
    <div className="max-w-full overflow-x-auto rounded-xl border border-border bg-slate-50" role="region" aria-label="Ilustrasi mesin interaktif, dapat digeser" tabIndex={0}>
      <svg viewBox="0 0 1310 350" className="block w-full min-w-[1000px]" aria-label="Motor, gearbox dan alternator konseptual">
        <path d="M20 238 H1260 L1290 218 V244 L1260 267 H20 Z" fill="#94a3b8" />
        <path d="M20 238 H1260 L1290 218 H50 Z" fill="#cbd5e1" />
        <text x="40" y="310" fontSize="14" fill="#64748b">SKID KONSEPTUAL · ukuran dan posisi tidak berskala</text>
        {[170, 320, 470, 620, 770].map(x => <path key={x} d={`M${x} 182 h20`} stroke="#64748b" strokeWidth="7" strokeDasharray="5 4" />)}
        <text x="970" y="65" fontSize="14" fill="#64748b">8/9: posisi konseptual saja</text>
        <text x="970" y="87" fontSize="13" fill="#64748b">Sambungan & arah daya TBD</text>
        {ids.map((id, index) => {
          const e = available.find(entry => entry.id === id)!;
          const active = hovered === id || selectedId === id;
          const gearbox = id.startsWith('gearbox');
          return <DialogTrigger asChild key={id}><g role="button" tabIndex={0} aria-label={`${e.name}, item ${e.item}. Buka detail`} onClick={event => { event.currentTarget.focus(); onSelect(id); }} onKeyDown={event => {
            if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.currentTarget.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
          }} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered('')} onFocus={() => setHovered(id)} onBlur={() => setHovered('')} transform={`translate(${40 + index * 150 + (index > 5 ? 30 : 0)} 130)`} className="machine-part cursor-pointer">
            <title>{e.name} · item {e.item}</title>
            <rect x="-8" y="-32" width="144" height="133" rx="10" fill={active ? '#eff6ff' : 'transparent'} stroke={active ? '#2563eb' : 'transparent'} strokeWidth="3" />
            <rect x="12" y="76" width="94" height="15" rx="3" fill="#64748b" />
            <path d="M0 13 L20 0 H121 V68 L102 82 H0 Z" fill={gearbox ? '#d6deea' : id === 'alternator' ? '#6d8faf' : '#8fa9c3'} stroke="#466389" strokeWidth="2" />
            <path d="M0 13 H102 L121 0 M102 13 V82" fill="none" stroke="#466389" strokeWidth="2" />
            {gearbox ? <><circle cx="35" cy="47" r="23" fill="#edf2f7" stroke="#466389" strokeWidth="3" /><circle cx="35" cy="47" r="9" fill="#94a3b8" /><circle cx="78" cy="34" r="12" fill="#edf2f7" stroke="#466389" /></> : <>
              <ellipse cx="14" cy="48" rx="18" ry="32" fill="#dbe5ef" stroke="#466389" strokeWidth="2" />
              {[35, 45, 55, 65, 75, 85].map(line => <path key={line} d={`M${line} 22 v48`} stroke="#466389" strokeWidth="2" />)}
              <rect x="62" y={id === 'alternator' ? -17 : -7} width={id === 'alternator' ? 40 : 29} height={id === 'alternator' ? 30 : 20} rx="3" fill="#335879" />
              <rect x="-14" y="43" width="24" height="10" fill="#64748b" />
            </>}
            <circle cx="9" cy="-17" r="14" fill="#233d60" /><text x="9" y="-12" textAnchor="middle" fontSize="13" fill="white">{e.item}</text>
            <text x="60" y="117" textAnchor="middle" fontSize="14" fill="#233d60" fontWeight="600">{e.name}</text>
            {id === 'motor' && warning && <text x="0" y="140" fontSize="13" fill="#92400e">⚠ TT-02 warning demo</text>}
            {active && <g pointerEvents="none"><rect x="-8" y="-69" width="144" height="28" rx="6" fill="#233d60" /><text x="64" y="-50" textAnchor="middle" fontSize="12" fill="white">{e.name} · item {e.item}</text></g>}
          </g></DialogTrigger>;
        })}
      </svg>
    </div>
    <div className="rounded-xl border border-blue-100 bg-blue-50/30 p-3"><p className="mb-2 text-xs font-semibold">Cabang listrik: Alternator 7 → CB-01 → output 17 · PM-01 pengukuran, bukan konversi</p><div className="flex flex-wrap gap-2">{['alternator', 'breaker', 'output'].map(id => { const e = available.find(entry => entry.id === id)!; return <DialogTrigger asChild key={id}><button onClick={() => onSelect(id)} className={`rounded-lg border bg-white px-3 py-2 text-xs hover:bg-blue-50 ${selectedId === id ? 'border-blue-500' : 'border-border'}`}>{e.name} · {e.item}</button></DialogTrigger>; })}</div></div>
    <div className="flex flex-wrap gap-2">{['pv', 'cabinet', 'bldc', 'shaft-train', 'oil19', 'oil20', 'pump', 'ventilation', 'pmg', 'avr'].map(id => { const e = available.find(entry => entry.id === id)!; return <DialogTrigger asChild key={id}><button onClick={() => onSelect(id)} className={`rounded-lg border px-3 py-2 text-xs hover:bg-blue-50 ${selectedId === id ? 'border-blue-500 bg-blue-50' : 'border-border'}`}>{e.name} · {e.item}</button></DialogTrigger>; })}</div>
    <p className="text-[11px] leading-relaxed text-muted">Garis poros putus-putus menunjukkan deret, bukan kopling terverifikasi. Gearbox 8/9 tanpa sambungan atau arah daya. PMG/AVR tetap asumsi. Motor 6: Instrumen belum dipetakan. Tidak ada animasi putaran.</p>
  </div>;
}
