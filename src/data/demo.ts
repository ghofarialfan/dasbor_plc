import type { Activity, Alarm, Device, Parameter, Telemetry, TrendSample, EquipmentDefinition, Equipment, InstrumentDefinition, Instrument, FlowLink, InstrumentReading, DataQuality, VentilationFanStatus, VentilationFanMockStatus, NewsItem, SupportTicket } from '@/types';

export const certaintyLabels = { documented: 'Tercantum di draf', clarified: 'Keterangan rekan proyek', assumed: 'Asumsi', tbd: 'TBD' };
export const qualityLabels: Record<DataQuality, string> = { simulated: 'Nilai terbaru', 'not-simulated': 'Belum ada data', offline: 'Offline', 'no-current-data': 'Belum ada data terkini' };

export const DEMO_NOW = '2026-11-04T07:00:00.000Z';
export const sites = [
  { id: 'site-a', name: 'Site A · Gedung Utama' }, { id: 'site-b', name: 'Site B · Area Utilitas' },
];
export const ago = (minutes: number) => new Date(Date.parse(DEMO_NOW) - minutes * 60000).toISOString();
const empty: Telemetry = { rpm: null, voltage: null, frequency: null, motorTemperature: null, roomTemperature: null, bldcTemperature: null };
const nominal: Telemetry = { rpm: 500, voltage: 380, frequency: 50, motorTemperature: 31, roomTemperature: 27, bldcTemperature: 33 };
export const devices: Device[] = [
  { id: 'GEN-001', name: 'Main Generator', siteId: 'site-a', location: 'Power house · Bay 01', status: 'running', online: true, lastSeen: DEMO_NOW, telemetry: { ...nominal } },
  { id: 'GEN-002', name: 'Utility Generator', siteId: 'site-b', location: 'Utility room · Bay 02', status: 'running', online: true, lastSeen: DEMO_NOW, telemetry: { ...nominal, motorTemperature: 36 } },
  { id: 'GEN-003', name: 'Backup Generator', siteId: 'site-a', location: 'Power house · Bay 03', status: 'standby', online: true, lastSeen: DEMO_NOW, telemetry: { ...nominal, rpm: 0, voltage: 0, frequency: 0, motorTemperature: 27 } },
  { id: 'GEN-004', name: 'Reserve Generator', siteId: 'site-b', location: 'Utility room · Bay 04', status: 'unknown', online: false, lastSeen: ago(125), telemetry: { ...empty } },
];
// Independent visual mock, not inferred from genset status, RPM, or TT-303.
export const ventilationFanMocks: Record<string, VentilationFanMockStatus> = {
  'GEN-001': 'running', 'GEN-002': 'running', 'GEN-003': 'stopped', 'GEN-004': 'unknown',
};
export const ventilationFanStatusLabels: Record<VentilationFanStatus, string> = {
  running: 'Berjalan (running)', stopped: 'Berhenti (stopped)', offline: 'Offline',
  unknown: 'Tidak diketahui (unknown)', 'not-simulated': 'Belum ada data',
};
export function ventilationFanStatus(device: Pick<Device, 'id' | 'online'>, mocks: Readonly<Record<string, VentilationFanMockStatus>> = ventilationFanMocks): VentilationFanStatus {
  return device.online ? mocks[device.id] ?? 'not-simulated' : 'offline';
}
export function ventilationFanRotates(status: VentilationFanStatus, paused = false) {
  return status === 'running' && !paused;
}
export function devicesForSite(siteId: string) { return devices.filter(d => siteId === 'all' || d.siteId === siteId); }
export function deviceForSite(siteId: string, selectedId: string) {
  const available = devicesForSite(siteId);
  return available.find(d => d.id === selectedId) ?? available[0];
}
export const equipmentDefinitions: EquipmentDefinition[] = [
  { id: 'pv', item: '1', name: 'PLTS', function: 'Sumber listrik panel surya.', certainty: 'documented', notes: 'Kapasitas dan lokasi array belum dikonfirmasi.' },
  { id: 'cabinet', item: '13', name: 'Kabinet / VFD-12', function: 'Kabinet driver BLDC.', certainty: 'assumed', notes: 'Isi kabinet dan rating perlu konfirmasi.' },
  { id: 'bldc', item: '12', name: 'BLDC', function: 'Penggerak motor item 2.', certainty: 'documented', notes: 'TT-12 berbeda dari suhu motor TT-02.' },
  { id: 'motor', item: '2', name: 'Motor AC 2', function: 'Motor AC penggerak awal deret motor 3 sampai alternator 7.', certainty: 'documented', identitySources: ['pid-draft', 'project-colleague'], notes: 'Jenis motor AC dikonfirmasi pengguna. Rating, jumlah fasa dan detail kopling belum dikonfirmasi.' },
  { id: 'motor3', item: '3', name: 'Motor 3', function: 'Motor dalam deret penggerak konseptual.', certainty: 'clarified', identitySources: ['project-colleague'], draftIdentity: 'Fungsi item 3 belum dipastikan.', notes: 'Rating dan detail kopling belum dikonfirmasi.' },
  { id: 'gearbox4', item: '4', name: 'Gearbox 4', function: 'Gearbox dalam deret konseptual 4/5.', certainty: 'clarified', identitySources: ['project-colleague'], draftIdentity: 'Fungsi item belum dipastikan.', notes: 'Rasio dan konfigurasi sambungan belum dikonfirmasi.' },
  { id: 'gearbox5', item: '5', name: 'Gearbox 5', function: 'Gearbox dalam deret konseptual 4/5.', certainty: 'clarified', identitySources: ['project-colleague'], draftIdentity: 'Fungsi item belum dipastikan.', notes: 'Rasio dan konfigurasi sambungan belum dikonfirmasi.' },
  { id: 'motor6', item: '6', name: 'Motor 6', function: 'Motor sebelum alternator dalam deret konseptual.', certainty: 'clarified', identitySources: ['project-colleague'], draftIdentity: 'Fungsi item belum dipastikan.', notes: 'Instrumen belum dipetakan. Rating dan kopling belum dikonfirmasi.' },
  { id: 'alternator', item: '7', name: 'Alternator', function: 'Pembangkit output listrik pada rangkaian konseptual.', certainty: 'clarified', identitySources: ['project-colleague'], draftIdentity: 'Alternator (asumsi).', notes: 'Jumlah kutub, rating dan detail kopling belum dikonfirmasi.' },
  { id: 'gearbox8', item: '8', name: 'Gearbox 8', function: 'Gearbox; fungsi rinci dalam sistem belum dipastikan.', certainty: 'clarified', identitySources: ['project-colleague'], draftIdentity: 'Fungsi item belum dipastikan.', notes: 'Posisi konseptual setelah item 7; arah transfer, rasio dan sambungan TBD.' },
  { id: 'gearbox9', item: '9', name: 'Gearbox 9', function: 'Gearbox; fungsi rinci dalam sistem belum dipastikan.', certainty: 'clarified', identitySources: ['project-colleague'], draftIdentity: 'Fungsi item belum dipastikan.', notes: 'Posisi konseptual setelah item 7; arah transfer, rasio dan sambungan TBD.' },
  { id: 'shaft-train', item: 'Deret poros', name: 'Pengukuran deret poros', function: 'Cakupan ST-401 pada deret poros, bukan item individual.', certainty: 'documented', notes: 'Titik pemasangan belum dipastikan; RPM tidak digunakan menghitung Hz.' },
  { id: 'gearbox45', item: '4, 5', name: 'Pengukuran gearbox 4/5', function: 'Cakupan getaran deret poros 4 dan 5.', certainty: 'documented', notes: 'VT-401 tidak dipecah menjadi channel per gearbox; titik pemasangan belum jelas.' },
  { id: 'breaker', item: 'CB-01', name: 'Breaker output', function: 'Pemutus output alternator.', certainty: 'documented', notes: 'Hanya informasi; tidak ada command close/open.' },
  { id: 'output', item: '17', name: 'Output', function: 'Titik keluaran; diukur PM-01.', certainty: 'documented', notes: 'PM-01 adalah pengukuran, bukan konversi daya.' },
  { id: 'oil19', item: '19', name: 'TK-19', function: 'Tangki oli pelumas; menyuplai langsung gearbox 4 dan 5.', certainty: 'documented', notes: 'Pasangan suplai langsung dikonfirmasi pengguna; rute pipa fisik dan jalur return belum dikonfirmasi. LSL-19 adalah status digital low-level, bukan persen.' },
  { id: 'oil20', item: '20', name: 'TK-20', function: 'Tangki oli pelumas; menyuplai langsung gearbox 8 dan 9.', certainty: 'documented', notes: 'Pasangan suplai langsung dikonfirmasi pengguna; rute pipa fisik dan jalur return belum dikonfirmasi. LSL-20 adalah status digital low-level, bukan persen.' },
  { id: 'pump', item: 'P-201', name: 'Pompa oli', function: 'Sirkulasi / pre-lube sesuai draf.', certainty: 'documented', notes: 'Lokasi fisik belum dikonfirmasi (PDF menyebut item 4/5/8/9; rekan proyek menyebut item tersebut gearbox). Tidak dipasangkan ke item mana pun.' },
  { id: 'ventilation', item: 'M-301 / DMP-301', name: 'Ventilasi ruang', function: 'Kipas dan damper ventilasi.', certainty: 'documented', notes: 'Air cooler tidak menjamin suhu di bawah udara luar.' },
  { id: 'pmg', item: '10, 11', name: 'PMG 10/11', function: 'Eksitasi dan daya bantu diasumsikan.', certainty: 'assumed', notes: 'Penggerak belt tercantum; titik sambung dan rating tidak ditetapkan di UI.' },
  { id: 'avr', item: 'AVR-01', name: 'AVR', function: 'Pengaturan tegangan / eksitasi.', certainty: 'assumed', notes: 'Fungsi PMG dan hubungan eksitasi perlu konfirmasi; tidak dibuat sambungan baru.' },
  { id: 'prt', item: 'PRT-01', name: 'Relay proteksi', function: 'Relay proteksi: 27, 59, 81, 50, 51.', certainty: 'documented', notes: 'Trip ke CB-01; belum ada data.' },
  { id: 'estop', item: 'ES-01', name: 'Emergency stop', function: 'Penghentian darurat.', certainty: 'documented', notes: 'Hardwired, di luar logika PLC.' },
  { id: 'siren', item: 'SIR-01', name: 'Sirine dan beacon', function: 'Alarm bertingkat.', certainty: 'documented', notes: 'Kontrol jarak jauh belum diaktifkan.' },
  { id: 'gps', item: 'GPS-01', name: 'Modul GPS', function: 'Geofence unit.', certainty: 'documented', notes: 'Shutdown bertahap; belum ada data.' },
  { id: 'dongle', item: 'DNG-01', name: 'Dongle security key', function: 'Kunci keamanan unit.', certainty: 'documented', notes: 'Sertifikat unik per unit.' },
  { id: 'spd', item: 'SPD-01', name: 'Proteksi petir', function: 'Proteksi petir DC.', certainty: 'documented', notes: 'Status kerusakan via DI; belum ada data.' },
  { id: 'hv201', item: 'HV-201', name: 'Valve oli', function: 'Valve sirkulasi oli.', certainty: 'documented', notes: 'Tidak ada spesifikasi valve.' },
  { id: 's201', item: 'S-201', name: 'Strainer oli', function: 'Strainer oli.', certainty: 'documented', notes: 'Tidak ada spesifikasi.' },
  { id: 'cv201', item: 'CV-201', name: 'Check valve', function: 'Check valve oli.', certainty: 'documented', notes: 'Tidak ada spesifikasi valve.' },
  { id: 'f201', item: 'F-201', name: 'Filter oli', function: 'Filter oli.', certainty: 'documented', notes: 'PDT-201 mengukur beda tekanan filter.' },
  { id: 'manifold15', item: '15', name: 'Manifold oli', function: 'Distribusi oli ke titik lube.', certainty: 'tbd', notes: 'Fungsi manifold 15 belum dipastikan.' },
  { id: 'lv301', item: 'LV-301', name: 'Louver masuk', function: 'Louver udara masuk.', certainty: 'documented', notes: 'Posisi louver belum ada data.' },
  { id: 'f301', item: 'F-301', name: 'Filter udara', function: 'Filter udara masuk.', certainty: 'documented', notes: 'PDT-301 mengukur beda tekanan filter.' },
  { id: 'lv302', item: 'LV-302', name: 'Louver keluar', function: 'Louver udara keluar.', certainty: 'documented', notes: 'Posisi louver belum ada data.' },
];
export const mainSequence = ['pv', 'cabinet', 'bldc', 'motor', 'motor3', 'gearbox4', 'gearbox5', 'motor6', 'alternator', 'gearbox8', 'gearbox9'];
export const flowLinks: FlowLink[] = [
  { id: 'pv-driver', from: 'pv', to: 'cabinet', kind: 'electrical', certainty: 'documented', notes: 'Pasokan PLTS ke driver pada draf.' },
  { id: 'driver-bldc', from: 'cabinet', to: 'bldc', kind: 'electrical', certainty: 'documented', notes: 'Driver BLDC.' },
  { id: 'bldc-motor', from: 'bldc', to: 'motor', kind: 'mechanical', certainty: 'documented', notes: 'BLDC menggerakkan motor 2; detail kopling tidak ditampilkan.' },
  { id: 'motor-motor3', from: 'motor', to: 'motor3', kind: 'mechanical', certainty: 'tbd', notes: 'Urutan konseptual dari keterangan rekan proyek; detail kopling dan rasio belum dipastikan.' },
  { id: 'motor3-gearbox4', from: 'motor3', to: 'gearbox4', kind: 'mechanical', certainty: 'tbd', notes: 'Urutan konseptual dari keterangan rekan proyek; detail kopling dan rasio belum dipastikan.' },
  { id: 'gearbox4-gearbox5', from: 'gearbox4', to: 'gearbox5', kind: 'mechanical', certainty: 'tbd', notes: 'Urutan konseptual dari keterangan rekan proyek; detail kopling dan rasio belum dipastikan.' },
  { id: 'gearbox5-motor6', from: 'gearbox5', to: 'motor6', kind: 'mechanical', certainty: 'tbd', notes: 'Urutan konseptual dari keterangan rekan proyek; detail kopling dan rasio belum dipastikan.' },
  { id: 'motor6-alternator', from: 'motor6', to: 'alternator', kind: 'mechanical', certainty: 'tbd', notes: 'Urutan konseptual dari keterangan rekan proyek; detail kopling dan rasio belum dipastikan.' },
  { id: 'alternator-gearbox8', from: 'alternator', to: 'gearbox8', kind: 'mechanical', certainty: 'tbd', notes: 'Posisi konseptual saja; tanpa arah transfer atau detail sambungan.' },
  { id: 'gearbox8-gearbox9', from: 'gearbox8', to: 'gearbox9', kind: 'mechanical', certainty: 'tbd', notes: 'Posisi konseptual saja; tanpa arah transfer atau detail sambungan.' },
  { id: 'alternator-breaker', from: 'alternator', to: 'breaker', kind: 'electrical', certainty: 'clarified', notes: 'Identitas alternator dari keterangan rekan proyek; detail listrik/rating belum dikonfirmasi.' },
  { id: 'breaker-output', from: 'breaker', to: 'output', kind: 'electrical', certainty: 'documented', notes: 'Keluaran melalui breaker; PM-01 mengukur di output 17.' },
];
export const MOTOR_DEMO_THRESHOLD = 35;
export const alarms: Alarm[] = devices.flatMap((d): Alarm[] => {
  if (!d.online) return [{ id: `alarm-${d.id}`, deviceId: d.id, severity: 'offline', title: 'Tidak ada data terkini', description: 'Perangkat offline. Nilai sensor tidak tersedia.', timestamp: d.lastSeen }];
  if (d.telemetry.motorTemperature !== null && d.telemetry.motorTemperature > MOTOR_DEMO_THRESHOLD) return [{ id: `alarm-${d.id}`, deviceId: d.id, severity: 'warning', title: 'Suhu motor meningkat', description: `TT-02 · ${d.telemetry.motorTemperature} °C melewati ambang peringatan ${MOTOR_DEMO_THRESHOLD} °C.`, timestamp: ago(8), parameter: 'motorTemperature', threshold: MOTOR_DEMO_THRESHOLD }];
  return [];
});
export const activities: Activity[] = [
  { id: 'a1', deviceId: 'GEN-002', title: 'Warning suhu motor', description: 'TT-02 · Ambang peringatan terlewati.', timestamp: ago(8), kind: 'warning' },
  { id: 'a2', deviceId: 'GEN-001', title: 'Generator beroperasi', description: 'Unit beroperasi.', timestamp: ago(18), kind: 'success' },
  { id: 'a3', deviceId: 'GEN-003', title: 'Mode standby', description: 'Unit dalam kondisi standby.', timestamp: ago(42), kind: 'success' },
  { id: 'a4', deviceId: 'GEN-004', title: 'Data tidak tersedia', description: 'Tidak ada data terkini dari unit.', timestamp: ago(125), kind: 'offline' },
];
export const newsItems: NewsItem[] = [
  { id: 'n1', category: 'operasional', title: 'Pembaruan jadwal inspeksi', body: 'Inspeksi rutin unit GEN-001 dijadwalkan ulang. Pantau daftar tiket untuk tindak lanjut.', timestamp: ago(60 * 6) },
  { id: 'n2', category: 'pemeliharaan', title: 'Pengecekan filter udara', body: 'Filter udara pada sistem ventilasi direkomendasikan untuk dicek pada siklus berikutnya.', timestamp: ago(60 * 26) },
  { id: 'n3', category: 'keselamatan', title: 'Prosedur emergency stop', body: 'ES-01 berfungsi sebagai penghentian darurat hardwired, di luar logika PLC.', timestamp: ago(60 * 50) },
  { id: 'n4', category: 'umum', title: 'Pembaruan antarmuka', body: 'Tampilan subsistem dan tabel data tersedia pada ruang kerja.', timestamp: ago(60 * 74) },
  { id: 'n5', category: 'operasional', title: 'Catatan ambang peringatan', body: 'Ambang peringatan suhu motor tersedia pada detail instrumen TT-02.', timestamp: ago(60 * 100) },
];
export const seedTickets: SupportTicket[] = [
  { id: 't1', title: 'Periksa suhu motor GEN-002', unit: 'GEN-002', category: 'Pemeliharaan', description: 'Suhu motor melewati ambang peringatan pada tabel parameter.', status: 'open', createdAt: ago(60 * 5) },
  { id: 't2', title: 'Konfirmasi lokasi P-201', unit: 'GEN-001', category: 'Dokumentasi', description: 'Lokasi fisik pompa oli P-201 belum dikonfirmasi pada P&ID.', status: 'open', createdAt: ago(60 * 30) },
];
// Archive events are activity records, not falsely presented as active alarms.
for (const d of devices) {
  if (!activities.some(a => a.deviceId === d.id)) activities.push({ id: `current-${d.id}`, deviceId: d.id,
    title: !d.online ? 'Komunikasi terputus' : d.status === 'running' ? 'Unit beroperasi' : d.status === 'standby' ? 'Unit standby' : 'Status belum diketahui',
    description: 'Ringkasan kondisi terakhir; nilai historis tetap terpisah.', timestamp: d.lastSeen,
    kind: !d.online ? 'offline' : 'success' });
  for (let day = 1; day <= 90; day++) {
    const warning = day % 9 === 0;
    activities.push({ id: `archive-${d.id}-${day}`, deviceId: d.id,
      title: warning ? 'Pemeriksaan suhu terjadwal' : 'Pencatatan kondisi unit',
      description: `${d.id} · Catatan arsip hari ${day}; bukan status operasi terkini.`,
      timestamp: ago(day * 1440), kind: warning ? 'warning' : 'success' });
  }
}
for (let i = 5; i < 100; i++) {
  const category = (['operasional', 'pemeliharaan', 'keselamatan', 'umum'] as const)[i % 4];
  newsItems.push({ id: `n${i + 1}`, category, title: `Catatan ${category} · periode ${i + 1}`,
    body: `Arsip pembahasan ${category}. Periksa data unit, riwayat dan dokumen sebelum menindaklanjuti. Tidak ada perubahan konfigurasi perangkat dari pengumuman ini.`, timestamp: ago(i * 720) });
}
for (let i = 2; i < 120; i++) {
  const d = devices[i % devices.length];
  const alarm = alarms.find(a => a.deviceId === d.id);
  seedTickets.push({ id: `t${i + 1}`, title: `Tinjauan ${d.id} · ${i + 1}`, unit: d.id,
    category: ['Pemeliharaan', 'Dokumentasi', 'Keselamatan', 'Umum'][i % 4],
    description: 'Periksa rekaman parameter dan kelengkapan dokumentasi. Tindakan ini tidak mengirim perintah ke perangkat.',
    relatedAlarm: alarm?.id, status: i % 3 === 0 ? 'resolved' : 'open', createdAt: ago(i * 180) });
}
export const seedWidgets = devices.slice(0, 8).map((d, i) => ({ id: `seed-widget-${i}`, deviceId: d.id,
  parameter: (['rpm', 'voltage', 'frequency', 'motorTemperature', 'roomTemperature', 'bldcTemperature'] as Parameter[])[i % 6], title: `${d.id} · Parameter pilihan` }));
export const parameters: Record<Parameter, { label: string; tag: string; unit: string; max: number }> = {
  rpm: { label: 'RPM poros · ST-401', tag: 'ST-401', unit: 'rpm', max: 1000 },
  voltage: { label: 'Tegangan · PM-01', tag: 'PM-01', unit: 'V', max: 500 },
  frequency: { label: 'Frekuensi · PM-01', tag: 'PM-01', unit: 'Hz', max: 60 },
  motorTemperature: { label: 'Suhu motor · TT-02', tag: 'TT-02', unit: '°C', max: 60 },
  roomTemperature: { label: 'Suhu ruang · TT-303', tag: 'TT-303', unit: '°C', max: 50 },
  bldcTemperature: { label: 'Suhu BLDC · TT-12', tag: 'TT-12', unit: '°C', max: 60 },
};
export const instrumentDefinitions: InstrumentDefinition[] = [
  { tag: 'ST-401', name: 'RPM poros', equipmentId: 'shaft-train', function: 'Pengukuran kecepatan deret poros (proximity).', certainty: 'documented', signal: 'DI / counter cepat', valueType: 'analog', parameters: ['rpm'], unit: 'rpm', notes: 'Tidak dipakai menghitung frekuensi; jumlah kutub belum dikonfirmasi.' },
  { tag: 'PM-01', name: 'Power meter output', equipmentId: 'output', function: 'Mengukur V, I, daya dan frekuensi output 17.', certainty: 'documented', signal: 'Modbus', valueType: 'analog', parameters: ['voltage', 'frequency'], notes: 'Hanya V dan Hz yang ditampilkan. Bukan konverter daya; tidak ada klaim daya aktual.' },
  { tag: 'TT-02', name: 'Suhu motor AC 2', equipmentId: 'motor', function: 'Pengukuran suhu motor AC item 2.', certainty: 'documented', signal: 'AI', valueType: 'analog', parameters: ['motorTemperature'], unit: '°C', notes: 'Ambang peringatan 35 °C.' },
  { tag: 'TT-03', name: 'Suhu motor 3', equipmentId: 'motor3', function: 'Pengukuran suhu item 3 sesuai draf; identitas motor dari rekan proyek.', certainty: 'documented', signal: 'AI', valueType: 'analog', parameters: [], unit: '°C', notes: 'Belum ada data; tidak menyalin TT-02. Draf belum memastikan fungsi item.' },
  { tag: 'VT-401', name: 'Getaran deret poros 4/5', equipmentId: 'gearbox45', function: 'Getaran deret poros 4 dan 5 sesuai draf.', certainty: 'documented', signal: 'AI', valueType: 'analog', parameters: [], notes: 'Titik pemasangan dan satuan belum dipetakan; tidak membuat channel terpisah.' },
  { tag: 'VT-07', name: 'Getaran alternator', equipmentId: 'alternator', function: 'Getaran alternator sesuai draf.', certainty: 'documented', signal: 'AI', valueType: 'analog', parameters: [], notes: 'Titik pemasangan, channel dan satuan belum dikonfirmasi; belum ada data.' },
  { tag: 'TT-12', name: 'Suhu BLDC', equipmentId: 'bldc', function: 'Pengukuran suhu BLDC item 12.', certainty: 'documented', signal: 'AI', valueType: 'analog', parameters: ['bldcTemperature'], unit: '°C', notes: 'Channel independen; sebagian unit memiliki data, sebagian belum tersedia. Tidak disalin dari TT-02.' },
  { tag: 'TT-303', name: 'Suhu ruang', equipmentId: 'ventilation', function: 'Pengukuran suhu ruang unit.', certainty: 'documented', signal: 'AI', valueType: 'analog', parameters: ['roomTemperature'], unit: '°C', notes: 'Suhu ruang unit; bukan suhu BLDC.' },
  { tag: 'TT-07', name: 'Suhu belitan dan bearing alternator', equipmentId: 'alternator', function: 'Suhu belitan dan bearing alternator sesuai draf.', certainty: 'documented', signal: 'AI', valueType: 'analog', parameters: [], unit: '°C', notes: 'Pemetaan channel belum jelas; tidak dibuat channel belitan/bearing terpisah.' },
  { tag: 'LSL-19', name: 'Low-level TK-19', equipmentId: 'oil19', function: 'Status digital level oli rendah.', certainty: 'documented', signal: 'DI', valueType: 'digital', parameters: [], notes: 'boolean/null; true = low-level aktif. Bukan persen isi tangki.' },
  { tag: 'LSL-20', name: 'Low-level TK-20', equipmentId: 'oil20', function: 'Status digital level oli rendah.', certainty: 'documented', signal: 'DI', valueType: 'digital', parameters: [], notes: 'boolean/null; true = low-level aktif. Bukan persen isi tangki.' },
  { tag: 'PT-201', name: 'Tekanan oli', equipmentId: 'pump', function: 'Pengukuran tekanan oli.', certainty: 'documented', signal: 'AI', valueType: 'analog', parameters: [], notes: 'Satuan dan rentang belum ditetapkan.' },
  { tag: 'AT-301', name: 'RH / titik embun (TBD)', equipmentId: 'ventilation', function: 'Pemantauan kondensasi; RH atau titik embun belum dipilih.', certainty: 'tbd', signal: 'AI', valueType: 'unresolved', parameters: [], notes: 'Satuan belum final; tidak ditampilkan sebagai %RH atau °C.' },
  { tag: 'VFD-12', name: 'Driver BLDC', equipmentId: 'cabinet', function: 'Driver BLDC item 12 di kabinet 13.', certainty: 'documented', signal: 'AO, DO, DI', valueType: 'unresolved', parameters: [], notes: 'Tidak ada command perangkat.' },
  { tag: 'CB-01', name: 'Breaker output', equipmentId: 'breaker', function: 'Status dan trip breaker output.', certainty: 'documented', signal: 'DO, DI', valueType: 'digital', parameters: [], notes: 'Tidak ada command open/close.' },
  { tag: 'AVR-01', name: 'Pengatur eksitasi', equipmentId: 'avr', function: 'Pengaturan tegangan dan eksitasi.', certainty: 'assumed', signal: 'AO, Modbus, DI', valueType: 'unresolved', parameters: [], notes: 'Fungsi terkait PMG masih asumsi.' },
  { tag: 'M-301', name: 'Kipas ventilasi', equipmentId: 'ventilation', function: 'Ventilasi paksa ruang unit.', certainty: 'documented', signal: 'AO, DI', valueType: 'unresolved', parameters: [], notes: 'Status M-301 terpisah untuk tampilan; bukan pembacaan instrumen atau RPM terukur. Kontrol jarak jauh belum diaktifkan.' },
  { tag: 'DMP-301', name: 'Damper ventilasi', equipmentId: 'ventilation', function: 'Pengaturan damper ventilasi.', certainty: 'documented', signal: 'AO', valueType: 'analog', parameters: [], notes: 'Posisi damper belum ada data.' },
  { tag: 'PV-01', name: 'Tegangan, arus dan daya PV', equipmentId: 'pv', function: 'Daya masuk PV; alarm gangguan string.', certainty: 'documented', signal: 'Modbus', valueType: 'unresolved', parameters: [], notes: 'Belum ada data.' },
  { tag: 'PRT-01', name: 'Relay proteksi', equipmentId: 'prt', function: 'Relay proteksi: 27, 59, 81, 50, 51.', certainty: 'documented', signal: 'DI, Modbus', valueType: 'unresolved', parameters: [], notes: 'Trip ke CB-01; belum ada data.' },
  { tag: 'TT-10', name: 'Suhu belitan PMG', equipmentId: 'pmg', function: 'Suhu belitan PMG 10 dan 11.', certainty: 'documented', signal: 'AI', valueType: 'analog', parameters: [], unit: '°C', notes: 'Belum ada data.' },
  { tag: 'ST-10', name: 'Kecepatan PMG', equipmentId: 'pmg', function: 'Kecepatan PMG, pantau slip belt.', certainty: 'documented', signal: 'DI', valueType: 'unresolved', parameters: [], notes: 'Alarm slip; belum ada data.' },
  { tag: 'PDT-201', name: 'Beda tekanan filter oli', equipmentId: 'f201', function: 'Beda tekanan filter oli.', certainty: 'documented', signal: 'AI', valueType: 'analog', parameters: [], notes: 'Alarm filter kotor; belum ada data.' },
  { tag: 'TT-201', name: 'Suhu oli', equipmentId: 'oil19', function: 'Suhu oli pelumas.', certainty: 'documented', signal: 'AI', valueType: 'analog', parameters: [], unit: '°C', notes: 'Belum ada data.' },
  { tag: 'TT-301', name: 'Suhu udara luar', equipmentId: 'lv301', function: 'Suhu udara luar; referensi derating.', certainty: 'documented', signal: 'AI', valueType: 'analog', parameters: [], unit: '°C', notes: 'Belum ada data.' },
  { tag: 'TT-304', name: 'Suhu udara keluar', equipmentId: 'lv302', function: 'Suhu udara keluar.', certainty: 'documented', signal: 'AI', valueType: 'analog', parameters: [], unit: '°C', notes: 'Belum ada data.' },
  { tag: 'PDT-301', name: 'Beda tekanan filter udara', equipmentId: 'f301', function: 'Beda tekanan filter udara.', certainty: 'documented', signal: 'AI', valueType: 'analog', parameters: [], notes: 'Alarm filter kotor; belum ada data.' },
  { tag: 'ES-01', name: 'Emergency stop', equipmentId: 'estop', function: 'Penghentian darurat.', certainty: 'documented', signal: 'DI', valueType: 'digital', parameters: [], notes: 'Hardwired, di luar logika PLC.' },
  { tag: 'SIR-01', name: 'Sirine dan beacon', equipmentId: 'siren', function: 'Alarm bertingkat.', certainty: 'documented', signal: 'DO', valueType: 'digital', parameters: [], notes: 'Kontrol jarak jauh belum diaktifkan.' },
  { tag: 'GPS-01', name: 'Modul GPS geofence', equipmentId: 'gps', function: 'Geofence unit.', certainty: 'documented', signal: 'Serial', valueType: 'unresolved', parameters: [], notes: 'Shutdown bertahap; belum ada data.' },
  { tag: 'DNG-01', name: 'Dongle security key', equipmentId: 'dongle', function: 'Kunci keamanan unit.', certainty: 'documented', signal: 'USB/serial', valueType: 'unresolved', parameters: [], notes: 'Sertifikat unik per unit.' },
  { tag: 'SPD-01', name: 'Proteksi petir DC', equipmentId: 'spd', function: 'Proteksi petir DC.', certainty: 'documented', signal: 'DI', valueType: 'digital', parameters: [], notes: 'Status kerusakan; belum ada data.' },
];
// Simulation bindings do not change the draft identity, signal type or verified specifications.
export interface DemoChannel { id: string; label: string; unit?: string; max?: number; normal: number | boolean; standby?: number | boolean; warning?: number | boolean }
const numeric = (id: string, label: string, unit: string, max: number, normal: number, standby = normal): DemoChannel => ({ id, label, unit, max, normal, standby });
const digital = (id: string, label: string, normal: boolean, standby = normal): DemoChannel => ({ id, label, normal, standby });
export const demoChannels: Record<string, DemoChannel[]> = {
  'PM-01': [numeric('current', 'Arus output', 'A', 100, 24, 0), numeric('power', 'Daya output', 'kW', 100, 13.5, 0)],
  'TT-03': [numeric('temperature', 'Suhu motor 3', '°C', 100, 32, 27)],
  'VT-401': [numeric('vibration', 'Getaran bersama 4/5', 'mm/s', 20, 1.8, 0)],
  'VT-07': [numeric('vibration', 'Getaran alternator', 'mm/s', 20, 2.1, 0)],
  'TT-07': [numeric('temperature', 'Suhu gabungan (belitan/bearing belum dipisah)', '°C', 120, 42, 28)],
  'LSL-19': [digital('low', 'Level rendah aktif', false)],
  'LSL-20': [digital('low', 'Level rendah aktif', false)],
  'PT-201': [numeric('pressure', 'Tekanan oli', 'bar', 10, 3.2, 0)],
  'AT-301': [numeric('humidity', 'RH asumsi demo; jenis aktual TBD', '%RH', 100, 58)],
  'VFD-12': [digital('running', 'Driver berjalan', true, false)],
  'CB-01': [digital('closed', 'Breaker tertutup', true, false), digital('trip', 'Trip aktif', false)],
  'AVR-01': [numeric('excitation', 'Tegangan eksitasi', 'V', 100, 48, 0)],
  'M-301': [digital('running', 'Kipas berjalan', true, false)],
  'DMP-301': [numeric('position', 'Posisi damper', '%', 100, 70, 20)],
  'PV-01': [numeric('voltage', 'Tegangan PV', 'V', 800, 540), numeric('current', 'Arus PV', 'A', 100, 30), numeric('power', 'Daya PV', 'kW', 100, 16.2)],
  'PRT-01': [digital('trip', 'Trip proteksi aktif', false)],
  'TT-10': [numeric('temperature', 'Suhu PMG kelompok 10/11', '°C', 120, 36, 27)],
  'ST-10': [numeric('speed', 'Kecepatan PMG kelompok 10/11', 'rpm', 3000, 1500, 0)],
  'PDT-201': [numeric('pressure', 'Beda tekanan filter oli', 'bar', 2, 0.25, 0)],
  'TT-201': [numeric('temperature', 'Suhu oli', '°C', 100, 38, 27)],
  'TT-301': [numeric('temperature', 'Suhu udara luar', '°C', 60, 29)],
  'TT-304': [numeric('temperature', 'Suhu udara keluar', '°C', 80, 34, 28)],
  'PDT-301': [numeric('pressure', 'Beda tekanan filter udara', 'Pa', 1000, 120, 0)],
  'ES-01': [digital('pressed', 'Emergency stop ditekan', false)],
  'SIR-01': [{ ...digital('active', 'Sirine aktif', false), warning: true }],
  'GPS-01': [digital('inside', 'Di dalam geofence', true)],
  'DNG-01': [digital('present', 'Kunci terdeteksi', true)],
  'SPD-01': [digital('fault', 'Gangguan SPD aktif', false)],
};
// Equipment without a draft instrument gets an explicitly synthetic condition, not a PLC tag.
for (const e of equipmentDefinitions) {
  const mapped = instrumentDefinitions.some(i => i.equipmentId === e.id || (['gearbox4', 'gearbox5'].includes(e.id) && i.equipmentId === 'gearbox45'));
  if (mapped) continue;
  const tag = `DEMO:${e.id}`;
  instrumentDefinitions.push({ tag, name: `Kondisi demo ${e.name}`, equipmentId: e.id, function: 'Indikator kondisi simulasi; bukan feedback perangkat aktual.', certainty: 'assumed', signal: 'Simulasi lokal', valueType: 'digital', parameters: [], notes: 'Tag DEMO sintetis; bukan alamat PLC atau sensor terverifikasi.' });
  demoChannels[tag] = [digital('normal', 'Kondisi normal', true)];
}
export const equipment: Equipment[] = devices.flatMap(d => equipmentDefinitions.map(e => ({ ...e, deviceId: d.id, instanceId: `${d.id}:${e.id}` })));
export const instruments: Instrument[] = devices.flatMap(d => instrumentDefinitions.map(i => ({ ...i, deviceId: d.id, instanceId: `${d.id}:${i.tag}` })));
export function instrumentsForEquipment(deviceId: string, equipmentId: string) {
  return instruments.filter(i => i.deviceId === deviceId && (i.equipmentId === equipmentId || (['gearbox4', 'gearbox5'].includes(equipmentId) && i.equipmentId === 'gearbox45')));
}
export function archivedQuality(value: number | null): DataQuality {
  return value === null ? 'no-current-data' : 'simulated';
}
export function parameterQuality(device: Device, parameter: Parameter): DataQuality {
  if (!device.online) return 'offline';
  if (device.telemetry[parameter] !== null) return 'simulated';
  return parameter === 'bldcTemperature' ? 'not-simulated' : 'no-current-data';
}
export function readingsForInstrument(device: Device, tag: string): InstrumentReading[] {
  const instrument = instruments.find(i => i.deviceId === device.id && i.tag === tag);
  if (!instrument) return [];
  const measured: InstrumentReading[] = instrument.parameters.map(parameter => ({ deviceId: device.id, tag, parameter, value: device.online ? device.telemetry[parameter] : null, unit: parameters[parameter].unit, quality: parameterQuality(device, parameter), timestamp: DEMO_NOW }));
  return [...measured, ...(demoChannels[tag] ?? []).map(channel => demoChannelReading(device, tag, channel, DEMO_NOW))];
}
export function demoChannelReading(device: Device, tag: string, channel: DemoChannel, timestamp: string): InstrumentReading {
  const age = Math.round((Date.parse(DEMO_NOW) - Date.parse(timestamp)) / 300000);
  const missing = !device.online || (age > 0 && age % 997 < 5);
  let value = device.status === 'standby' ? channel.standby ?? channel.normal : device.id === 'GEN-002' ? channel.warning ?? channel.normal : channel.normal;
  if (typeof value === 'number' && age > 0 && value !== 0) value = Number((value * (1 + Math.sin(age * 0.07 + tag.length) * 0.025)).toFixed(2));
  return { deviceId: device.id, tag, channel: channel.id, label: channel.label, value: missing ? null : value, unit: channel.unit, max: channel.max, quality: missing ? (age === 0 && !device.online ? 'offline' : 'no-current-data') : 'simulated', timestamp, assumption: 'Asumsi simulasi: satuan, rentang dan binding bukan spesifikasi atau feedback aktual.' };
}
export function capabilityArchive(deviceId: string, hours = 2160) {
  const device = devices.find(d => d.id === deviceId);
  if (!device || !Number.isFinite(hours) || hours < 0) return [];
  return archiveWindow(deviceId, hours).flatMap(sample => instrumentDefinitions.flatMap(instrument => [
    ...instrument.parameters.map(parameter => ({ deviceId, tag: instrument.tag, parameter, label: parameters[parameter].label, value: sample[parameter], unit: parameters[parameter].unit, quality: archivedQuality(sample[parameter]), timestamp: sample.timestamp } as InstrumentReading)),
    ...(demoChannels[instrument.tag] ?? []).map(channel => demoChannelReading(device, instrument.tag, channel, sample.timestamp)),
  ]));
}
// Deterministic archive generated only for requested windows. No archive in localStorage.
export const ARCHIVE_DAYS = 90;
export const TREND_TOTAL = ARCHIVE_DAYS * 24 * 12 + 1;
export const demoSeed = 20261104;
export function archiveWindow(deviceId: string, hours = ARCHIVE_DAYS * 24): TrendSample[] {
  const deviceIndex = devices.findIndex(d => d.id === deviceId);
  if (deviceIndex < 0 || !Number.isFinite(hours) || hours < 0) return [];
  const d = devices[deviceIndex];
  const count = Math.min(TREND_TOTAL, Math.floor(hours * 12) + 1);
  return Array.from({ length: count }, (_, offset) => {
    const i = TREND_TOTAL - count + offset;
    const age = TREND_TOTAL - 1 - i;
    const timestamp = ago(age * 5);
    const missing = d.id === 'GEN-004' || (age > 0 && i % 997 < 5);
    const standby = deviceIndex < 2 && i % 2016 >= 1800 && age > 72;
    const spike = deviceIndex < 2 && i % 719 === 100 ? 12 : 0;
    const values = Object.fromEntries((Object.keys(empty) as Parameter[]).map((key, channel) => {
      if (missing) return [key, null];
      const base = d.telemetry[key];
      // Offline units 7/14 have an independent historical operating baseline.
      const archivedBase = base ?? (!d.online ? [510, 380, 50, 32, 27, 34][channel] : null);
      if (archivedBase === null) return [key, null];
      if (age === 0) return [key, base];
      if (archivedBase === 0 || (standby && channel < 3)) return [key, 0];
      const wave = Math.sin(i * (0.031 + channel * 0.017) + deviceIndex + demoSeed % 17) + Math.sin(i * 0.53 + channel) * 0.2;
      const scale = [7, 3, 0.12, 0.8, 1.2, 1.5][channel];
      return [key, Number((archivedBase + wave * scale + (channel >= 3 ? spike : 0)).toFixed(2))];
    })) as unknown as Telemetry;
    return { timestamp, ...values };
  });
}
// Compatibility for existing consumers; each access generates one unit, never the whole fleet.
export const trends: Record<string, TrendSample[]> = Object.defineProperties({}, Object.fromEntries(devices.map(d => [d.id, {
  enumerable: true, get: () => archiveWindow(d.id),
}])));
