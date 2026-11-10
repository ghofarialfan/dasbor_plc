import { useDemo } from '@/context/demo-context';
import type { EquipmentViewProps } from '@/types';
import { shaftConnections, draftCableConnections, pmgConnections, oilConnections, orderedItems } from './subsystem-model';
import { Section, ScrollDiagram, DetailCard, ItemCard, EquipmentCards, Connection, PathLegend, InstrumentReferences } from './subsystem-parts';
export function DriverOutput(views: EquipmentViewProps) {
  const rows = [
    { title: 'Deret mekanis', connections: shaftConnections },
    { title: 'Kabel draf · PLTS dan perangkat kabinet', connections: draftCableConnections },
  ];
  return <div className="space-y-4">
    <p className="text-xs leading-relaxed text-muted">Hubungan komponen mengikuti registry skematik. Garis bukan konfirmasi arah putaran, transfer daya, atau koneksi fisik/OEM. Geser deret bila diperlukan.</p>
    {rows.map(row => <Section key={row.title} title={row.title}><ScrollDiagram label={row.title}><div className="flex w-max items-stretch">{orderedItems(row.connections).map((item, index) => <div key={item} className="flex">{index > 0 && <Connection connection={row.connections[index - 1]} />}<ItemCard item={item} {...views} /></div>)}</div></ScrollDiagram></Section>)}
    <Section title="PMG dan keluaran · cabang kabel draf">
      <ScrollDiagram label="Belt PMG dan cabang kabel menuju output 17"><div className="w-max space-y-3">{pmgConnections.filter(connection => connection.style === 'belt').map(belt => {
        if (!('item' in belt.to)) return null;
        const item = belt.to.item;
        const branch = pmgConnections.find(connection => connection.style === 'cable' && 'item' in connection.from && connection.from.item === item);
        const output = pmgConnections.find(connection => connection.id === 'cable-output-17');
        return <div key={belt.id} className="flex items-stretch"><span className="flex w-36 shrink-0 items-center rounded-xl border border-dashed border-slate-300 dark:border-border p-3 text-xs text-muted">Sumber belt belum dikonfirmasi</span><Connection connection={belt} /><ItemCard item={item} {...views} />{branch && <Connection connection={branch} />}<span className="flex w-24 shrink-0 items-center justify-center text-center text-[11px] text-muted">Simpul kabel bersama</span>{output && <Connection connection={output} />}<ItemCard item={17} {...views} /></div>;
      })}</div></ScrollDiagram>
      <p className="text-[11px] leading-relaxed text-muted">Kedua baris bergabung pada simpul kabel dan Output 17 yang sama; pengulangan output hanya referensi. Sumber dan rute belt belum dikonfirmasi, bukan koneksi dari gearbox 9.</p>
    </Section>
    <PathLegend styles={['shaft', 'belt', 'cable']} />
    <Section title="Referensi fungsional tambahan">
      <p className="text-xs leading-relaxed text-muted">Alternator 7 → CB-01 → Output 17 adalah relasi fungsional konseptual, terpisah dari kabel merah. Posisi CB-01 belum dikonfirmasi. AVR dan relay tidak menambahkan rute fisik baru; PM-01 mengukur, bukan konversi daya.</p>
      <EquipmentCards {...views} ids={['alternator', 'breaker', 'output', 'avr', 'prt', 'shaft-train']} />
      <InstrumentReferences ids={['motor', 'motor3', 'motor6', 'alternator', 'gearbox45', 'pmg', 'bldc', 'cabinet', 'output', 'prt', 'shaft-train']} />
    </Section>
  </div>;
}

export function OilLube(views: EquipmentViewProps) {
  const tanks = [...new Set(oilConnections.map(connection => connection.from.item))];
  return <div className="space-y-4">
    <p className="text-xs leading-relaxed text-muted">Pemetaan suplai langsung dikonfirmasi pengguna. Rute pipa fisik dan jalur return belum dikonfirmasi; garis bukan indikator aliran aktual.</p>
    <div className="grid min-w-0 gap-4 xl:grid-cols-2">{tanks.map(tank => <Section key={tank} title={`Suplai TK-${tank}`}><ScrollDiagram label={`TK-${tank} dan pasangan gearbox`}><div className="w-max space-y-3">{oilConnections.filter(connection => connection.from.item === tank).map(connection => <div key={connection.id} className="flex items-stretch"><ItemCard item={tank} {...views} /><Connection connection={connection} /><ItemCard item={connection.to.item} {...views} /></div>)}</div></ScrollDiagram><p className="text-[11px] text-muted">Kartu tangki berulang merujuk ke tangki yang sama.</p></Section>)}</div>
    <PathLegend styles={['lubrication']} />
    <Section title="Perangkat pendukung dari draf · belum dirangkai sebagai jalur fisik">
      <EquipmentCards {...views} ids={['hv201', 's201', 'pump', 'cv201', 'f201', 'manifold15']} />
      <p className="text-xs leading-relaxed text-muted">Lokasi fisik P-201 dan fungsi rinci manifold 15 belum dikonfirmasi. Tidak ada tambahan sambungan ke PMG atau poros, maupun jalur return pada diagram ini.</p>
      <InstrumentReferences ids={['oil19', 'oil20', 'pump', 'f201']} />
      <p className="text-[11px] leading-relaxed text-muted">LSL-19/20 adalah status digital low-level, bukan persentase isi tangki. Satuan tekanan PT-201 belum ditetapkan.</p>
    </Section>
  </div>;
}

export function Ventilation(views: EquipmentViewProps) {
  return <div className="space-y-4">
    <p className="rounded-lg border border-border bg-slate-50 dark:bg-surface-soft px-3 py-2 text-xs font-medium text-muted">Skematik sistem · bukan kondisi aktual perangkat</p>
    <p className="text-xs leading-relaxed text-muted">Urutan fungsional dari draf, bukan bukti aliran udara aktual. Ilustrasi statis tidak menunjukkan perangkat berjalan maupun berhenti. Geser diagram bila diperlukan.</p>
    <Section title="Ventilasi ruang unit">
      <ScrollDiagram label="Diagram fungsional ventilasi, dapat digeser">
        <div className="flex w-max items-stretch">
          <DetailCard {...views} id="lv301" label="Louver masuk" sub="LV-301 · TT-301" />
          <span aria-hidden="true" className="w-8 shrink-0 self-center border-t border-dashed border-slate-400" />
          <DetailCard {...views} id="f301" label="Filter udara" sub="F-301 · PDT-301" />
          <span aria-hidden="true" className="w-8 shrink-0 self-center border-t border-dashed border-slate-400" />
          <div className="space-y-2">
            <DetailCard {...views} id="ventilation" label="Kipas ventilasi" sub="M-301" />
            <p className="max-w-36 rounded-md bg-slate-100 dark:bg-surface-hover px-2 py-1 text-[11px] text-muted">Status belum tersedia</p>
          </div>
          <span aria-hidden="true" className="w-8 shrink-0 self-center border-t border-dashed border-slate-400" />
          <div className="space-y-2">
            <DetailCard {...views} id="ventilation" label="Damper" sub="DMP-301" />
            <p className="max-w-36 rounded-md bg-slate-100 dark:bg-surface-hover px-2 py-1 text-[11px] text-muted">Posisi belum tersedia</p>
          </div>
          <span aria-hidden="true" className="w-8 shrink-0 self-center border-t border-dashed border-slate-400" />
          <DetailCard {...views} id="ventilation" label="Ruang unit" sub="TT-303 · AT-301" />
          <span aria-hidden="true" className="w-8 shrink-0 self-center border-t border-dashed border-slate-400" />
          <DetailCard {...views} id="lv302" label="Louver keluar" sub="LV-302 · TT-304" />
        </div>
      </ScrollDiagram>
      <p className="text-[11px] leading-relaxed text-muted">Garis putus-putus menunjukkan urutan fungsional, bukan rute fisik terverifikasi. Kipas, damper, dan ruang unit membuka detail kelompok ventilasi yang sama; belum ada pemetaan status perangkat aktual.</p>
    </Section>
    <p className="text-xs leading-relaxed text-muted">Status generator atau koneksi unit tidak membuktikan kipas berjalan. Kondisi ventilasi belum dapat ditentukan tanpa feedback perangkat dan aturan evaluasi yang terverifikasi. AT-301: RH atau titik embun belum ditetapkan.</p>
    <InstrumentReferences ids={['lv301', 'f301', 'ventilation', 'lv302']} />
  </div>;
}

export function Security(views: EquipmentViewProps) {
  const { device } = useDemo();
  const groups = [
    { title: 'Penghentian darurat', ids: ['estop'] },
    { title: 'Peringatan', ids: ['siren'] },
    { title: 'Lokasi & akses', ids: ['gps', 'dongle'] },
    { title: 'Proteksi listrik', ids: ['spd', 'prt', 'breaker'] },
  ];
  return <div className="space-y-4">
    <p className="text-xs leading-relaxed text-muted">Perangkat dikelompokkan menurut fungsi, bukan urutan aliran atau rangkaian keselamatan terverifikasi. Tidak adanya alarm bukan konfirmasi kondisi aman.</p>
    <div className="grid gap-4 sm:grid-cols-2">{groups.map(group => <Section key={group.title} title={group.title}><EquipmentCards {...views} ids={group.ids} /><p className="text-xs text-muted">Status perangkat: {device.online ? 'Belum ada data' : 'Offline · Belum ada data terkini'}.</p></Section>)}</div>
    <p className="rounded-xl border border-border bg-slate-50 dark:bg-surface-soft p-3 text-xs leading-relaxed text-muted">ES-01 hardwired, di luar logika PLC. Mode baca saja: tidak ada reset, bypass, atau kontrol jarak jauh. PRT-01/CB-01 adalah referensi proteksi, bukan tambahan koneksi pada denah.</p>
    <InstrumentReferences ids={groups.flatMap(group => group.ids)} />
  </div>;
}
