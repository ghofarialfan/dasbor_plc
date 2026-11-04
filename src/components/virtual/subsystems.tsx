import { useState } from 'react';
import { useDemo } from '@/context/demo-context';
import { equipmentDefinitions, ventilationFanStatus, ventilationFanRotates, ventilationFanStatusLabels } from '@/data/demo';
import type { EquipmentViewProps, VentilationFanStatus } from '@/types';
import { DialogTrigger } from '@/components/ui/dialog';

function bladePath(cx: number, cy: number) {
  return `M${cx} ${cy} C${cx - 22} ${cy - 17} ${cx - 22} ${cy - 42} ${cx - 2} ${cy - 43} C${cx + 17} ${cy - 44} ${cx + 23} ${cy - 24} ${cx} ${cy} Z`;
}

export function FanBlades({ cx, cy, status, paused }: { cx: number; cy: number; status: VentilationFanStatus; paused: boolean }) {
  const color = status === 'running' ? '#335879' : '#94a3b8';
  return <g className="ventilation-fan-blades" style={{ transformOrigin: `${cx}px ${cy}px`, animationPlayState: ventilationFanRotates(status, paused) ? 'running' : 'paused' }} pointerEvents="none" aria-hidden="true">
    {[0, 90, 180, 270].map(angle => <path key={angle} d={bladePath(cx, cy)} transform={`rotate(${angle} ${cx} ${cy})`} fill={color} />)}
  </g>;
}

function Node({ id, x, y, label, sub, selectedId, onSelect }: { id: string; x: number; y: number; label: string; sub: string; selectedId: string; onSelect: (id: string) => void }) {
  const active = selectedId === id;
  const def = equipmentDefinitions.find(e => e.id === id);
  const hint = def && (def.certainty === 'clarified' || def.certainty === 'assumed') ? ' · ' + (def.certainty === 'assumed' ? 'Asumsi' : 'Klarifikasi') : '';
  return <DialogTrigger asChild><g role="button" tabIndex={0} aria-label={`${label}, ${sub}. Buka detail`} onClick={ev => { ev.currentTarget.focus(); onSelect(id); }} onKeyDown={ev => {
    if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); ev.currentTarget.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
  }} transform={`translate(${x} ${y})`} className="machine-part cursor-pointer">
    <title>{label} · {sub}</title>
    <rect width="150" height="58" rx="10" fill={active ? '#eff6ff' : '#ffffff'} stroke={active ? '#2563eb' : '#cbd5e1'} strokeWidth="2" />
    <text x="75" y="24" textAnchor="middle" fontSize="12" fill="#233d60" fontWeight="600">{label}</text>
    <text x="75" y="42" textAnchor="middle" fontSize="10" fill="#64748b">{sub}{hint}</text>
  </g></DialogTrigger>;
}

export function DriverOutput({ selectedId, onSelect }: EquipmentViewProps) {
  const row1: [string, string, string][] = [['pv', 'PV-01', 'Panel surya'], ['cabinet', 'VFD-12', 'Kabinet 13'], ['bldc', 'BLDC 12', 'Penggerak'], ['motor', 'Motor 2', 'Item 2'], ['motor3', 'Motor 3', 'Item 3'], ['gearbox4', 'Gearbox 4', 'Item 4'], ['gearbox5', 'Gearbox 5', 'Item 5'], ['motor6', 'Motor 6', 'Item 6'], ['alternator', 'Alternator 7', 'Item 7'], ['gearbox8', 'Gearbox 8', 'Item 8'], ['gearbox9', 'Gearbox 9', 'Item 9']];
  return <svg viewBox="0 0 1200 360" className="block w-full min-w-[1000px]" aria-label="Subsistem penggerak dan output">
    {row1.map(([id, label, sub], i) => <Node key={id} id={id} x={20 + i * 104} y={40} label={label} sub={sub} selectedId={selectedId} onSelect={onSelect} />)}
    {row1.slice(0, -1).map((_, i) => <line key={i} x1={20 + i * 104 + 150} y1={69} x2={20 + (i + 1) * 104} y2={69} stroke="#466389" strokeWidth="2" strokeDasharray="9 5" />)}
    <text x="20" y="140" fontSize="11" fill="#64748b">Deret penggerak 2 → 3 → 4/5 → 6 → 7; gearbox 8/9 posisi konseptual setelah 7.</text>
    <Node id="pmg" x={300} y={180} label="PMG 10/11" sub="Belt · asumsi" selectedId={selectedId} onSelect={onSelect} />
    <Node id="avr" x={500} y={180} label="AVR-01" sub="Eksitasi · asumsi" selectedId={selectedId} onSelect={onSelect} />
    <Node id="prt" x={700} y={180} label="PRT-01" sub="Relay proteksi" selectedId={selectedId} onSelect={onSelect} />
    <Node id="breaker" x={900} y={180} label="CB-01" sub="Breaker" selectedId={selectedId} onSelect={onSelect} />
    <Node id="output" x={20} y={180} label="Output 17" sub="PM-01 · pengukuran" selectedId={selectedId} onSelect={onSelect} />
    <line x1="170" y1="209" x2="300" y2="209" stroke="#466389" strokeWidth="2" />
    <line x1="450" y1="209" x2="500" y2="209" stroke="#466389" strokeWidth="2" strokeDasharray="2 4" />
    <line x1="650" y1="209" x2="700" y2="209" stroke="#466389" strokeWidth="2" strokeDasharray="2 4" />
    <line x1="850" y1="209" x2="900" y2="209" stroke="#466389" strokeWidth="2" />
    <text x="20" y="290" fontSize="11" fill="#64748b">Cabang listrik: Alternator 7 → CB-01 → output 17. PM-01 hanya pengukuran, bukan konversi daya.</text>
  </svg>;
}

export function OilLube({ selectedId, onSelect }: EquipmentViewProps) {
  const nodes: [string, string, string][] = [['oil19', 'TK-19', 'Item 19'], ['oil20', 'TK-20', 'Item 20'], ['hv201', 'HV-201', 'Valve'], ['s201', 'S-201', 'Strainer'], ['pump', 'P-201', 'Pompa · PT-201'], ['cv201', 'CV-201', 'Check valve'], ['f201', 'F-201', 'Filter · PDT-201'], ['manifold15', 'Manifold 15', 'Distribusi lube']];
  return <svg viewBox="0 0 1200 340" className="block w-full min-w-[1000px]" aria-label="Subsistem oli pelumas">
    {nodes.map(([id, label, sub], i) => <Node key={id} id={id} x={20 + i * 140} y={40} label={label} sub={sub} selectedId={selectedId} onSelect={onSelect} />)}
    {nodes.slice(0, -1).map((_, i) => <line key={i} x1={20 + i * 140 + 150} y1={69} x2={20 + (i + 1) * 140} y2={69} stroke="#466389" strokeWidth="2" />)}
    <path d="M1140 69 C1140 140 1180 150 1180 210" fill="none" stroke="#466389" strokeWidth="2" />
    <text x="1185" y="215" fontSize="11" fill="#64748b">Titik lube poros & PMG</text>
    <path d="M1180 210 C1180 270 40 280 40 240" fill="none" stroke="#466389" strokeWidth="2" strokeDasharray="5 4" />
    <text x="40" y="300" fontSize="11" fill="#64748b">Kembali ke tangki</text>
    <text x="20" y="120" fontSize="11" fill="#64748b">LSL-19/20 status digital low-level (bukan persen). TT-201 suhu oli. PT-201 tekanan oli. PDT-201 beda tekanan filter.</text>
    <text x="20" y="140" fontSize="11" fill="#64748b">P-201: lokasi fisik belum dikonfirmasi; tidak dipasangkan ke item 4/5/8/9.</text>
  </svg>;
}

export function Ventilation({ selectedId, onSelect }: EquipmentViewProps) {
  const { device } = useDemo();
  const [paused, setPaused] = useState(false);
  const status = ventilationFanStatus(device);
  return <div className="space-y-2">
    <div className="flex flex-wrap items-center gap-2 text-xs"><span className="text-muted">M-301: {ventilationFanStatusLabels[status]}</span><button type="button" aria-pressed={paused} onClick={() => setPaused(v => !v)} className="rounded-lg border border-border px-3 py-2 hover:bg-blue-50">{paused ? 'Lanjutkan animasi' : 'Jeda animasi'}</button><span className="text-muted">Kecepatan animasi tidak mewakili RPM.</span></div>
    <svg viewBox="0 0 1000 320" className="block w-full min-w-[860px]" aria-label="Subsistem ventilasi">
      <Node id="lv301" x={20} y={40} label="LV-301" sub="Louver masuk · TT-301" selectedId={selectedId} onSelect={onSelect} />
      <Node id="f301" x={200} y={40} label="F-301" sub="Filter · PDT-301" selectedId={selectedId} onSelect={onSelect} />
      <DialogTrigger asChild><g role="button" tabIndex={0} aria-label="M-301 dan DMP-301. Buka detail" onClick={ev => { ev.currentTarget.focus(); onSelect('ventilation'); }} onKeyDown={ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); ev.currentTarget.dispatchEvent(new MouseEvent('click', { bubbles: true })); } }} transform="translate(380 20)" className="machine-part cursor-pointer"><rect width="190" height="96" rx="12" fill={selectedId === 'ventilation' ? '#eff6ff' : '#edf2f7'} stroke={selectedId === 'ventilation' ? '#2563eb' : '#466389'} strokeWidth="2" /><text x="95" y="22" textAnchor="middle" fontSize="12" fill="#233d60" fontWeight="600">M-301 · DMP-301</text><circle cx="95" cy="62" r="34" fill="#dbe5ef" stroke="#466389" strokeWidth="2" /><FanBlades cx={95} cy={62} status={status} paused={paused} /><circle cx="95" cy="62" r="6" fill="#64748b" /><text x="95" y="112" textAnchor="middle" fontSize="10" fill="#64748b">{ventilationFanStatusLabels[status]}</text></g></DialogTrigger>
      <text x="600" y="68" fontSize="12" fill="#233d60" fontWeight="600">Ruang unit</text>
      <text x="600" y="88" fontSize="10" fill="#64748b">TT-303 · AT-301</text>
      <Node id="lv302" x={760} y={40} label="LV-302" sub="Louver keluar · TT-304" selectedId={selectedId} onSelect={onSelect} />
      <line x1="170" y1="69" x2="200" y2="69" stroke="#466389" strokeWidth="2" />
      <line x1="350" y1="69" x2="380" y2="69" stroke="#466389" strokeWidth="2" />
      <line x1="570" y1="69" x2="600" y2="69" stroke="#466389" strokeWidth="2" />
      <line x1="660" y1="69" x2="760" y2="69" stroke="#466389" strokeWidth="2" />
      <text x="20" y="180" fontSize="11" fill="#64748b">Alur udara: LV-301 → F-301 → M-301 → DMP-301 → ruang unit → LV-302.</text>
      <text x="20" y="200" fontSize="11" fill="#64748b">AT-301: RH atau titik embun belum ditetapkan. PDT-301 beda tekanan filter udara.</text>
    </svg>
  </div>;
}

export function Security({ selectedId, onSelect }: EquipmentViewProps) {
  const nodes: [string, string, string][] = [['estop', 'ES-01', 'Hardwired'], ['siren', 'SIR-01', 'Sirine & beacon'], ['gps', 'GPS-01', 'Geofence'], ['dongle', 'DNG-01', 'Security key'], ['spd', 'SPD-01', 'Proteksi petir']];
  return <svg viewBox="0 0 1000 240" className="block w-full min-w-[860px]" aria-label="Subsistem keamanan">
    {nodes.map(([id, label, sub], i) => <Node key={id} id={id} x={20 + i * 190} y={40} label={label} sub={sub} selectedId={selectedId} onSelect={onSelect} />)}
    <text x="20" y="180" fontSize="11" fill="#64748b">ES-01 hardwired, di luar logika PLC. Tidak ada kontrol aktif; kontrol jarak jauh belum diaktifkan.</text>
  </svg>;
}

