import type { Activity, Alarm, Device, Parameter, Telemetry, TrendSample, EquipmentDefinition, Equipment, InstrumentDefinition, Instrument, FlowLink, InstrumentReading, DataQuality, VentilationFanStatus, VentilationFanMockStatus, NewsItem, SupportTicket } from '@/types';

export const certaintyLabels = { documented: 'Tercantum di draf', clarified: 'Keterangan rekan proyek', assumed: 'Asumsi', tbd: 'TBD' };
export const qualityLabels: Record<DataQuality, string> = { simulated: 'Nilai terbaru', 'not-simulated': 'Belum ada data', offline: 'Offline', 'no-current-data': 'Belum ada data terkini' };

export const DEMO_NOW = '2026-11-04T07:00:00.000Z';
export const sites = [{ id: 'site-a', name: 'Site A · Gedung Utama' }, { id: 'site-b', name: 'Site B · Area Utilitas' }];
export const ago = (minutes: number) => new Date(Date.parse(DEMO_NOW) - minutes * 60000).toISOString();
const empty: Telemetry = { rpm: null, voltage: null, frequency: null, motorTemperature: null, roomTemperature: null, bldcTemperature: null };
const nominal: Telemetry = { rpm: 500, voltage: 380, frequency: 50, motorTemperature: 31, roomTemperature: 27, bldcTemperature: null };
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
  { id: 'motor', item: '2', name: 'Motor 2', function: 'Penggerak awal deret motor 3 sampai alternator 7.', certainty: 'documented', identitySources: ['pid-draft', 'project-colleague'], notes: 'Detail kopling tidak ditentukan pada ringkasan ini.' },
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
  { id: 'oil19', item: '19', name: 'TK-19', function: 'Tangki oli pelumas.', certainty: 'documented', notes: 'LSL-19 adalah status digital low-level, bukan persen.' },
  { id: 'oil20', item: '20', name: 'TK-20', function: 'Tangki oli pelumas.', certainty: 'documented', notes: 'LSL-20 adalah status digital low-level, bukan persen.' },
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
  { tag: 'TT-02', name: 'Suhu motor 2', equipmentId: 'motor', function: 'Pengukuran suhu motor item 2.', certainty: 'documented', signal: 'AI', valueType: 'analog', parameters: ['motorTemperature'], unit: '°C', notes: 'Ambang peringatan 35 °C.' },
  { tag: 'TT-03', name: 'Suhu motor 3', equipmentId: 'motor3', function: 'Pengukuran suhu item 3 sesuai draf; identitas motor dari rekan proyek.', certainty: 'documented', signal: 'AI', valueType: 'analog', parameters: [], unit: '°C', notes: 'Belum ada data; tidak menyalin TT-02. Draf belum memastikan fungsi item.' },
  { tag: 'VT-401', name: 'Getaran deret poros 4/5', equipmentId: 'gearbox45', function: 'Getaran deret poros 4 dan 5 sesuai draf.', certainty: 'documented', signal: 'AI', valueType: 'analog', parameters: [], notes: 'Titik pemasangan dan satuan belum dipetakan; tidak membuat channel terpisah.' },
  { tag: 'VT-07', name: 'Getaran alternator', equipmentId: 'alternator', function: 'Getaran alternator sesuai draf.', certainty: 'documented', signal: 'AI', valueType: 'analog', parameters: [], notes: 'Titik pemasangan, channel dan satuan belum dikonfirmasi; belum ada data.' },
  { tag: 'TT-12', name: 'Suhu BLDC', equipmentId: 'bldc', function: 'Pengukuran suhu BLDC item 12.', certainty: 'documented', signal: 'AI', valueType: 'analog', parameters: ['bldcTemperature'], unit: '°C', notes: 'Belum ada data; tidak disalin dari TT-02.' },
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
export const equipment: Equipment[] = devices.flatMap(d => equipmentDefinitions.map(e => ({ ...e, deviceId: d.id, instanceId: `${d.id}:${e.id}` })));
export const instruments: Instrument[] = devices.flatMap(d => instrumentDefinitions.map(i => ({ ...i, deviceId: d.id, instanceId: `${d.id}:${i.tag}` })));
export function instrumentsForEquipment(deviceId: string, equipmentId: string) {
  return instruments.filter(i => i.deviceId === deviceId && (i.equipmentId === equipmentId || (['gearbox4', 'gearbox5'].includes(equipmentId) && i.equipmentId === 'gearbox45')));
}
export function parameterQuality(device: Device, parameter: Parameter): DataQuality {
  if (!device.online) return 'offline';
  if (device.telemetry[parameter] !== null) return 'simulated';
  return parameter === 'bldcTemperature' ? 'not-simulated' : 'no-current-data';
}
export function readingsForInstrument(device: Device, tag: string): InstrumentReading[] {
  const instrument = instruments.find(i => i.deviceId === device.id && i.tag === tag);
  if (!instrument) return [];
  if (!instrument.parameters.length) return [{ deviceId: device.id, tag, value: null, unit: instrument.unit, quality: device.online ? 'not-simulated' : 'offline' }];
  return instrument.parameters.map(parameter => ({ deviceId: device.id, tag, parameter, value: device.online ? device.telemetry[parameter] : null, unit: parameters[parameter].unit, quality: parameterQuality(device, parameter) }));
}
// Fixed formula, evaluated once. Each channel is illustrative and independent.
export const TREND_TOTAL = 7 * 24 * 12 + 1; // 7 days at 5-minute resolution, ending at DEMO_NOW.
export const trends: Record<string, TrendSample[]> = Object.fromEntries(devices.map((d, di) => [d.id, Array.from({ length: TREND_TOTAL }, (_, i) => {
  const last = TREND_TOTAL - 1;
  const variation = Math.sin(i * 0.68 + di) * 0.65 + Math.sin(i * 1.7) * 0.2;
  const val = (key: 'rpm' | 'voltage' | 'frequency' | 'motorTemperature', scale: number) => {
    const base = d.telemetry[key];
    return base === null ? null : base === 0 || i === last ? base : Number((base + variation * scale).toFixed(2));
  };
  return { timestamp: ago((last - i) * 5), rpm: val('rpm', 7), voltage: val('voltage', 3), frequency: val('frequency', 0.12), motorTemperature: val('motorTemperature', 0.8) };
})]));
