# Dokumen perjalanan dan serah-terima proyek GensetMonitor

**Untuk:** partner proyek, developer penerus, dan reviewer desain/engineering.
**Tanggal:** 5 November 2026.
**Baseline yang diperiksa:** commit `6cd103e`, branch `main`.
**Status:** frontend M1–M5 tersedia; belum terhubung ke perangkat/server; menunggu review visual/manual.

> Dokumen ini merangkum pekerjaan dari awal, keputusan partner, kondisi kode, cara menjalankan, batasan, dan rekomendasi kelanjutan. Frontend selesai bukan berarti spesifikasi engineering telah disahkan atau koneksi PLC sudah berjalan. Kata mock/simulasi boleh digunakan di dokumentasi teknis ini; aturan teks UI berbeda.

## Isi dokumen

1. Tujuan dan batas lingkup
2. Perjalanan dari awal
3. Fitur per milestone
4. Data dan keputusan engineering
5. Kipas M-301
6. Copy UI dan keputusan yang disepakati
7. Peta kode
8. Menjalankan dan build
9. Storage, preferensi, CSV
10. Git dan commit
11. Validasi dan keterbatasan
12. Backlog dan langkah melanjutkan
13. Checklist serah-terima

## 1. Tujuan dan batas lingkup

Membangun antarmuka monitoring genset/PLTS untuk presentasi dan pembahasan alur kerja dengan partner/klien sebelum integrasi perangkat nyata. Halaman interaktif memakai data lokal deterministik, bukan sekadar gambar dashboard.

Sudah dikerjakan: shell, Overview, ilustrasi mesin/diagram, detail equipment/instrument, empat unit dan filter site, Virtual per subsistem, tabel/CSV, konfigurasi gauge, chart, placeholder kamera, News, Support, Profile, Logout, serta dokumentasi dan build statis.

**Tidak dikerjakan:** backend/API, MQTT, PLC, database/server tiket, autentikasi/otorisasi nyata, kontrol fisik, stream kamera, sertifikasi engineering, push remote, deploy. Status dan angka berasal dari skenario lokal. Aplikasi belum boleh digunakan sebagai sistem kontrol operasional.

## 2. Perjalanan pekerjaan dari awal

### 2.1 Milestone 1: aplikasi awal

Dibuat aplikasi React/TypeScript dengan sidebar navy, header, filter site, card, dan Overview. Overview menyediakan KPI, pilihan device, gauge, chart, alarm/aktivitas, kamera placeholder, dan diagram/ilustrasi yang dapat diklik. Halaman lainnya awalnya placeholder.

Tahap ini berlangsung **sebelum Git dibuat**. Git tidak menyimpan scaffold dan tiap revisi awal secara terpisah. Kronologi awal di dokumen ini bersumber dari keputusan percakapan dan dokumentasi proyek; riwayat kode yang dapat diambil dari Git dimulai di baseline `387f8e9`.

### 2.2 Revisi berdasarkan P&ID dan klarifikasi partner

PDF P&ID menjadi referensi equipment, instrumen, dan alur fungsi. Mapping diperbaiki agar parameter tidak ditempel ke komponen yang salah. Partner mengklarifikasi item 3/6 motor, 4/5/8/9 gearbox, dan 7 alternator.

Overview menjadi dua tab: **Ilustrasi Mesin** (default SVG custom 2.5D) dan **Diagram Sistem** (teknis ringkas), menggunakan sumber data dan dialog bersama. Identitas partner dan ketidakpastian draf disimpan terpisah; PDF tidak diedit untuk menyesuaikan UI.

### 2.3 Upaya pemulihan ilustrasi lama

Sempat diminta mencari `generator-diagram.tsx` versi awal sebelum revisi P&ID. Pencarian mencakup proyek/salinan file, Local History, Cline task/checkpoint, state VS Code, log terminal, build/cache, dan Trash. Ditemukan jejak nama file/perintah/HMR, **bukan kode yang bisa dipulihkan**. Screenshot lama juga tidak tersedia.

Tidak dilakukan restore checkpoint destruktif atau penggambaran ulang berdasarkan dugaan. Keputusan partner: hentikan pencarian dan gunakan `machine-illustration.tsx` sekarang karena gayanya sudah disetujui; cukup tambahkan kipas.

### 2.4 Git dan baseline

Pemeriksaan sebelum animasi menunjukkan proyek belum memiliki repository Git. Implementasi dihentikan sampai pengguna mengizinkan inisialisasi.

Dilakukan: mempertahankan `.gitignore`, menambahkan pengecualian log/`.env`, `git init -b main`, `git config --local core.fileMode false` untuk drive NTFS, memeriksa staging, memakai identitas Git yang sudah ada, dan membuat baseline `387f8e9`. `node_modules`, `dist`, log, secret tidak dimasukkan.

### 2.5 Kipas dan perluasan milestone

Kipas M-301 ditambahkan pada dinding ventilasi ilustrasi, bukan pada mesin/gearbox. Status independen dari genset; commit `4486163`.

Rencana M2 diperluas menjadi M2–M5 sekaligus. **Rencana kedua**, kamus copy dan 15 keputusan opsi `a`, disetujui lalu dikoreksi dengan copy netral dan M1.5. Rencana pertama tidak berlaku.

Alur akhir: langsung **M1.5 → M2 → M3 → M4 → M5**, tanpa jeda review antarmilestone, commit per bagian, tanpa push/deploy. Permintaan membuat `docs/PLAN.md` dibatalkan; file itu tidak dibuat. Implementasi/dokumentasi terakhir sebelum dokumen ini adalah `6cd103e`.

## 3. Hasil fitur per milestone

### 3.1 M1 dan M1.5: shell, Overview, copy

Shell: sidebar desktop/collapsed, drawer mobile, filter site global, notifikasi, menu profil, chip Prototype. Layout/geometri utama Overview dipertahankan; revisi tampilan masuk backlog.

Overview: KPI unit/running/standby/offline; pilihan GEN; dua tab ilustrasi/diagram; detail klik/Enter/Space; enam gauge; chart 1/3/6 jam; warning suhu GEN-002; alarm/aktivitas per site; kamera gelap/perbesar; animasi M-301.

M1.5: copy menjadi Pembaruan terakhir, Belum ada data, Ilustrasi skematik, Peringatan. Disclaimer utama dihapus/diganti instruksi penggunaan. Kepastian dan sumber tidak dihapus; ditampilkan di Status desain pada detail. Pemindahan badge Diagram Sistem diselesaikan di M5.

### 3.2 M2: Device, Virtual, Data

**Device `/device`:** search nama/ID/lokasi, status, card/list, filter site shell; drawer kanan identitas/site/lokasi/operasi/koneksi/pembaruan/last seen; equipment dan instrumen per unit beserta kepastian/sumber. GEN-004 offline, nilai kosong bukan nol.

**Virtual `/virtual`:** empat tab SVG, bukan mengulang ilustrasi Overview:

- Penggerak & Output: PV-01, VFD-12, BLDC 12, motor 2/3/6, gearbox 4/5/8/9, alternator 7, PMG 10/11, AVR-01, PRT-01, CB-01, PM-01, output 17.
- Oli: TK-19/20, LSL-19/20, HV-201, S-201, P-201, CV-201, PT-201, F-201, PDT-201, manifold 15, TT-201, lube poros/PMG dan kembali ke tangki.
- Ventilasi: LV-301, F-301, M-301/DMP-301, ruang unit, LV-302, TT-301/303/304, AT-301, PDT-301.
- Keamanan: ES-01, SIR-01, GPS-01, DNG-01, SPD-01. ES-01 hardwired di luar logika PLC.

Node membuka dialog bersama. VFD-12/M-301/DMP-301/CB-01 memiliki tombol disabled dan tooltip. Jeda animasi bukan kontrol perangkat. Node SVG berukuran tetap dan scroll dalam card; keterbacaan aktual tablet perlu review.

**Data `/data`:** waktu/unit/tag/parameter/nilai/satuan/kualitas; filter unit/parameter (tag tercantum dalam opsi), site dan waktu; pagination 50; empty state; tabel scroll internal; CSV seluruh hasil filter. Setelah M3 rentang 1/3/6/24 jam dan 7 hari tersedia.

### 3.3 M3: Gauge Widget, Chart Widget, Camera View

**Gauge `/gauge-widget`:** tambah melalui dialog unit/tag/judul, hapus widget, simpan lokal. Enam channel numerik: ST-401 RPM, PM-01 V, PM-01 Hz, TT-02, TT-303, TT-12. PM-01 dipisah dua parameter karena satuannya berbeda. LSL bukan gauge. TT-12 tetap null. Widget mengikuti site.

**Chart `/chart-widget`:** maksimal dua seri, sumbu kiri/kanan dengan satuan masing-masing, tooltip/legend, 1H/6H/24H/7D. Seri asli 5 menit; 24H rata-rata per jam, 7D rata-rata per 24 jam berakhir pada waktu referensi (bukan wajib hari kalender tengah malam). Tidak mengisi null dengan nol. Generator diperpanjang ke tujuh hari dan Data memakai sumber tersebut juga.

**Camera `/camera-view`:** empat kamera per unit: CAM-01 Bay depan, CAM-02 Ruang alternator, CAM-03 Pintu kontainer, CAM-04 Area panel. Semuanya Belum terhubung; layar gelap tanpa foto/stream. Layout 1/2/4, konfigurasi layout lokal, dialog perbesar.

### 3.4 M4: News, Support, Profile, Logout

- **News `/news`:** pengumuman statis deterministik, kategori dan detail dialog. Bukan CMS; belum ada tambah/hapus pengumuman.
- **Support `/support`:** seed tiket dan form judul/unit/kategori/deskripsi/opsional alarm. Validasi wajib isi, panjang dan relasi alarm/unit. Penyimpanan lokal, notifikasi sukses "Tiket berhasil dibuat"; bukan pengiriman ke server.
- **Profile `/profile`:** Alex, role Operator/akses tampilan; WIB/WITA/WIT; preferensi indikator notifikasi; "Kembalikan pengaturan awal" menghapus storage milik aplikasi. Tanpa ganti password/auth palsu.
- **Logout `/logout`:** konfirmasi, layar "Anda telah keluar", "Masuk kembali" langsung ke Overview. Tidak memanggil logout server atau form login.

### 3.5 M5: finalisasi

Validasi payload storage, test regresi data/CSV/copy, keyboard tab Virtual, label fokus, pemisahan Status desain, perapian SVG Virtual yang rapat, metadata HTML netral, dokumentasi dan checklist manual. Build statis disiapkan tanpa deploy. Hasil visual/fokus aktual tetap belum diuji dengan browser.

## 4. Data dan keputusan engineering yang wajib dipertahankan

### 4.1 Sumber referensi

PDF di repository: `docs/reference/PID_Genset_PLTS.pdf`; sumber awal pengguna berada di `/home/alfan_ghofari/Downloads/PID_Genset_PLTS.pdf`.

SHA-256 file repository yang diperiksa:

```text
323249c690a6b574ea29b88868381f6c48110783cdc3f125fe3dcf3a17a7b90a
```

Draf konseptual bertanggal 4 November 2026, bukan gambar fabrikasi. Mapping berdasarkan ekstraksi teks; geometri/simbol PDF belum diklaim terverifikasi visual. Jangan menganggap empat GEN membuktikan adanya empat unit fisik dari PDF.

### 4.2 Identitas dan alur

| Item | Identitas sekarang | Asal/batasan |
|---|---|---|
| 1 | PLTS | Draf; kapasitas/array belum pasti |
| 12 | BLDC | Draf; berbeda dari motor item 2 |
| 13 / VFD-12 | Kabinet / driver | Isi/rating kabinet belum lengkap |
| 2 | Motor awal | Detail kopling belum ditetapkan |
| 3 dan 6 | Motor | Klarifikasi rekan proyek |
| 4, 5, 8, 9 | Gearbox | Klarifikasi rekan proyek; rasio belum pasti |
| 7 | Alternator | Klarifikasi; catatan draf lama tetap disimpan |
| 10/11 | PMG | Fungsi eksitasi/daya bantu masih asumsi |
| 15 | Manifold | Fungsi rinci TBD |
| 17 | Output | Diukur PM-01 |
| 19/20 | Tangki oli | LSL digital, bukan persen |

Urutan konseptual **2 → 3 → 4/5 → 6 → 7**. Gearbox 8/9 diposisikan setelah 7 tanpa menyimpulkan arah daya/kopling. Cabang listrik **7 → CB-01 → output 17**; PM-01 alat ukur, bukan konverter.

**Konflik P-201:** PDF menyebut salah satu item 4/5/8/9, partner menyebut item tersebut gearbox. Pompa tetap equipment `pump` dengan tag `P-201`, **bukan dipasangkan ke item angka**. UI: "lokasi fisik belum dikonfirmasi". Jangan menyelesaikan konflik dengan menebak posisi fisik. Jalur oli hanya alur fungsi; tidak ada ukuran pipa, tekanan atau spesifikasi valve baru.

### 4.3 Model yang dipakai

`src/types/index.ts` mendefinisikan:

- `Device`: id, nama, site, lokasi, status operasi, koneksi, lastSeen, telemetry.
- `EquipmentDefinition` / `Equipment`: template dan instance per device.
- `InstrumentDefinition` / `Instrument`: tag, equipmentId, signal, jenis nilai, parameter, satuan/catatan; instance per device.
- `Certainty`: documented, clarified, assumed, tbd; terpisah dari status operasi/kualitas data.
- `IdentitySource`: pid-draft atau project-colleague; `draftIdentity` mempertahankan perbedaan draf.
- `DataQuality`: simulated, not-simulated, offline, no-current-data; kode internal tidak perlu diganti karena copy UI netral.
- `FlowLink`, `Alarm`, `Activity`, `TrendSample`, konfigurasi gauge, News dan SupportTicket.

Instance memakai lingkup seperti `GEN-001:TT-02`; tag sama di unit berbeda bukan channel global yang sama. Instrumen dari draf secara umum ditampilkan dengan sumber PDF; `identitySources` pada equipment menyimpan klarifikasi partner.

### 4.4 Fleet dan nilai terbaru

Waktu referensi tetap: **2026-11-04T07:00:00.000Z / 14:00 WIB**; bukan jam real-time.

| Unit | Site | Operasi/koneksi | Nilai utama |
|---|---|---|---|
| GEN-001 | A | running/online | 500 rpm, 380 V, 50 Hz, motor 31 °C, ruang 27 °C |
| GEN-002 | B | running/online | Sama; motor 36 °C memunculkan warning |
| GEN-003 | A | standby/online | RPM/V/Hz = 0; motor 27 °C, ruang 27 °C |
| GEN-004 | B | unknown/offline | Semua telemetry null; last seen 125 menit sebelum referensi |

TT-12 semua unit null. Empat GEN adalah skenario frontend. Tidak ada daya aktual 4 MW ditampilkan.

### 4.5 Parameter dan kualitas

| Parameter internal | Tag | Satuan | Keterangan |
|---|---|---|---|
| rpm | ST-401 | rpm | Cakupan deret poros, bukan motor tunggal |
| voltage | PM-01 | V | Output 17 |
| frequency | PM-01 | Hz | Independen dari RPM |
| motorTemperature | TT-02 | °C | Motor item 2 |
| roomTemperature | TT-303 | °C | Ruang, bukan BLDC |
| bldcTemperature | TT-12 | °C | Belum ada nilai |

TT-03 tidak menyalin TT-02; motor 6 tidak diberi instrumen fiktif. VT-401 cakupan bersama gearbox 4/5, tidak dipecah channel palsu. TT-07 suhu belitan/bearing tidak dipecah tanpa konfirmasi. VT-07 memiliki keterbatasan lokasi/channel/satuan.

LSL-19/20 tetap boolean/null; true berarti low-level aktif, bukan persen tangki. AT-301 belum dipilih RH atau titik embun, satuan belum final. Instrumen tanpa mock tetap null. Ambang TT-02 **35 °C adalah peringatan ilustrasi, bukan batas proteksi PLC**; rentang gauge bukan rating mesin. RPM dan Hz tidak dihitung satu dari yang lain.

Sumber data tunggal `src/data/demo.ts`; `src/data/queries.ts` hanya filter/selector/agregasi, bukan sumber telemetry kedua. Tujuh hari berisi **2017 sampel per unit** pada interval 5 menit termasuk kedua batas waktu. Data/chart empat parameter historis; suhu ruang/BLDC tersedia sebagai snapshot gauge/detail, belum punya histori terpisah.

## 5. Detail animasi M-301

SVG + CSS tanpa dependency baru. Pada Overview kipas berada di dinding kanan, hub `(1425,168)` dalam viewBox 1550×350. Hanya grup bilah berputar; housing, label, hub, hotspot diam. Virtual memakai helper status/rotasi dan kelas CSS yang sama dengan pusat hub disesuaikan.

| Unit/status | Perilaku |
|---|---|
| GEN-001/002 | Mock kipas running, berputar |
| GEN-003 | Mock kipas stopped, diam; tidak diturunkan dari standby genset |
| GEN-004 | Offline mengesampingkan mock, selalu diam |
| unknown / not-simulated | Diam, indikator abu-abu/teks status |
| Jeda / reduced-motion | Putaran dihentikan tanpa mengubah status mesin |

`ventilationFanStatus()` menentukan status, `ventilationFanRotates()` izin rotasi. CSS linear 1,2 detik adalah kecepatan dekoratif, **bukan RPM terukur**. Tidak ada putaran pada motor/gearbox/alternator. Klik/keyboard kipas membuka detail bersama. Halusnya animasi dan ketepatan hub aktual masih perlu review browser.

## 6. Aturan copy UI dan keputusan yang disepakati

### 6.1 Aturan untuk pekerjaan berikutnya

Dilarang pada teks UI, tooltip, aria-label, toast, judul dialog dan tombol: **dummy, mock, simulasi/simulated, contoh, fake, demo, "bukan live stream", "Preview only"**. Nama variabel/file/test/docs boleh memakai kata tersebut.

Penanda prototype hanya chip **Prototype** di header dan card **Frontend prototype** di sidebar/drawer, serta tooltip ikon saat collapsed. Hindari menambahkan label prototype/disclaimer ke tiap card.

| Kebutuhan | Copy yang disepakati |
|---|---|
| Nilai belum tersedia | Belum ada data / Belum ada data terkini |
| Timestamp | Pembaruan terakhir |
| Gambar sistem | Ilustrasi skematik |
| Ambang TT-02 | Ambang peringatan: 35 °C |
| Reset | Kembalikan pengaturan awal |
| Support sukses | Tiket berhasil dibuat |
| Akhir sesi | Anda telah keluar |
| Kembali dari akhir sesi | Masuk kembali |
| Kamera | Kamera belum terhubung / Belum terhubung |
| Kontrol disabled | Tooltip: Kontrol jarak jauh belum diaktifkan |
| Kipas | Jeda animasi / Lanjutkan animasi |

Jangan mengarang alasan seperti sensor rusak atau jaringan putus. Kamera harus gelap, tanpa LIVE/Online/Recording dan tanpa foto yang menyerupai rekaman asli. Catatan ambang bukan proteksi PLC cukup di Status desain dialog dan docs/README. Copy netral bukan izin menyatakan data lokal sebagai pembacaan nyata.

### 6.2 Ringkasan 15 keputusan rencana kedua (semua opsi a)

1. M1.5 fokus copy; pemindahan badge Diagram Sistem ditunda ke M5.
2. Label nilai menjadi Nilai terbaru.
3. Jeda/lanjut animasi tetap aktif sebagai preferensi tampilan.
4. `test:copy` terpisah untuk menjaga kata terlarang.
5. CSV berisi prototype; timestamp nama file Asia/Jakarta.
6. Empat kamera dengan nama yang tercantum pada M3.
7. Gauge enam parameter numerik; PM-01 V dan Hz terpisah.
8. Satu generator diperpanjang tujuh hari, agregasi untuk rentang panjang.
9. Storage prefix versi dan migrasi site lama.
10. Tiket persisten di localStorage.
11. Reset seluruh pengaturan/widget/tiket milik aplikasi.
12. Kontrol Virtual disabled dan tooltip.
13. Commit M1.5 satu, M2 tiga, M3 tiga, M4 empat, M5 satu–dua.
14. Filter site Device memakai shell global.
15. Detail Device drawer kanan.

Koreksi setelah keputusan: reset memakai copy baru; tiga disclaimer utama dihapus; Support sukses tidak berisi label demo; Logout tanpa form login; kamera semuanya belum terhubung; Data mendapat 24H/7D setelah M3; tidak membuat PLAN.md; review baru setelah M5. Koreksi ini mengalahkan teks rencana lama.

## 7. Peta kode untuk developer penerus

Root pada komputer pengembangan: `/run/media/alfan_ghofari/Data/Prototype monitoring plc`. Path di tabel di bawah relatif terhadap root repository agar dokumen tetap dapat dipakai setelah folder dipindahkan.

| File/folder | Tanggung jawab |
|---|---|
| `src/main.tsx` | React root, BrowserRouter, ErrorBoundary, TooltipProvider, DemoProvider |
| `src/App.tsx` | Route halaman; `/` Overview, fallback Placeholder/404 |
| `src/components/layout/` | Shell/sidebar/navigation; filter site dan notifikasi |
| `src/context/demo-context.tsx` | State site/device bersama, fallback pilihan dalam site, preferensi |
| `src/types/index.ts` | Kontrak Device/Equipment/Instrument/quality/certainty/dll. |
| `src/data/demo.ts` | Definisi, fleet, instrument instance, mock, trend, News, seed tiket |
| `src/data/queries.ts` | Filter Device, telemetryRows dan chartSeries |
| `src/components/shared.tsx` | Panel, heading, status/kepastian, badge, empty state |
| `src/components/ui/` | Button, dialog/drawer, tooltip, dropdown berbasis Radix |
| `src/components/overview/` | Ilustrasi, diagram, shared EquipmentDetails, gauge/chart/kamera/alarm |
| `src/components/virtual/subsystems.tsx` | Empat SVG subsistem, node dan bilah kipas |
| `src/pages/` | Halaman route Device sampai Logout |
| `src/lib/storage.ts` | Load/save/reset key aplikasi, fallback JSON |
| `src/lib/preferences.ts` | Zona waktu dan preferensi tervalidasi |
| `src/lib/validation.ts` | Skema widget/tiket dan batas payload |
| `src/lib/csv.ts` | CSV escaping/download/ISO zona waktu |
| `src/lib/utils.ts` | Format angka/waktu dan utility class |
| `src/index.css` | Tailwind base, fokus, animasi kipas/reduced-motion |
| `scripts/check-data.mjs` | Invariant data dan regresi helper |
| `scripts/check-copy.mjs` | Pemeriksaan AST UI/HTML + negative fixtures |
| `vite.config.ts` | Alias `@`, plugin React, chunk chart/vendor |
| `docs/PID-MAPPING.md` | Mapping dan konflik engineering (memuat catatan historis) |
| `docs/BACKLOG.md` | Dua backlog Overview yang belum dikerjakan |
| `docs/REVIEW-CHECKLIST.md` | Checklist visual/fungsional manual, belum ditandai PASS |

Dialog bersama memakai Radix: fokus terkurung dan Escape disediakan primitive; pemicu SVG membutuhkan pemulihan fokus eksplisit. Jangan mengganti semua dialog dengan implementasi ad hoc atau menduplikasi sumber data di setiap halaman.

## 8. Cara menjalankan, menguji, dan build

### 8.1 Prasyarat dan stack

Node minimum 22.12.0; environment sebelumnya Node 22.23.4. Gunakan lockfile `package-lock.json` dan `npm ci`. Stack: React 18.3.1, TypeScript 5.9.3, Vite 7.3.7, React Router 7.18.5, Recharts 2.15.4, Tailwind 3.4.19, Radix UI, Lucide React. Tidak ada dependency tambahan pada M1.5–M5.

### 8.2 Development

```sh
cd '/run/media/alfan_ghofari/Data/Prototype monitoring plc'
npm ci
npm run dev
```

Buka alamat yang ditulis Vite, default `http://127.0.0.1:5173`. Bila port terpakai, Vite memilih port lain. Host default loopback; akses perangkat lain di LAN memerlukan konfigurasi yang disengaja, belum dilakukan.

### 8.3 Validasi dan preview

```sh
npm run typecheck
npm run test:data
npm run test:copy
npm run build
npm run preview
```

Build di `dist/`, preview default `http://127.0.0.1:4173`. Tidak perlu `.env`, akun, token atau secret untuk prototype. `node_modules/`, `dist/`, log, `.env*` di-ignore Git. Jangan membuka `dist/index.html` lewat `file://` sebagai pengganti server.

### 8.4 Direct route dan hosting statis kelak

BrowserRouter memerlukan server yang mengembalikan `index.html` untuk route non-aset. Vite dev/preview mendukung fallback. Server file statis biasa tanpa SPA fallback dapat memberi 404 pada refresh `/device` meskipun navigasi dari Overview berfungsi.

Route tersedia: `/`, `/device`, `/virtual`, `/data`, `/gauge-widget`, `/chart-widget`, `/camera-view`, `/news`, `/support`, `/profile`, `/logout`; route lain fallback halaman tidak tersedia. Konfigurasi hosting/deploy belum dibuat. Pilihan server/subpath/base URL perlu diputuskan sebelum deployment.

## 9. Penyimpanan, preferensi, dan CSV

### 9.1 LocalStorage

Prefix **`genset-demo:v1:`**; kata demo internal diperbolehkan dan tidak perlu diganti hanya untuk copy UI.

| Suffix | Isi |
|---|---|
| site | Site terpilih; migrasi sekali dari `genset-demo-site` |
| gauge-widgets | ID widget, unit, parameter, judul |
| tickets | Tiket lokal + seed, maksimal 200 pada validasi/penyimpanan |
| profile | timezone dan notifications |
| camera-layout | Pilihan kolom 1/2/4 |

JSON rusak atau payload tidak sesuai validator kembali default. Validator widget membatasi 50 dan memastikan unit/channel valid; tiket mengecek unit/kategori/status/waktu/alarm. Saat storage tidak tersedia, halaman tidak boleh crash; beberapa perubahan hanya bertahan dalam sesi. Reset menghapus key prefix aplikasi, bukan seluruh localStorage browser.

Data lokal tidak tersinkron antarkomputer/browser dan bukan database. Tidak ada token/password. Untuk tiket nyata perlu server, kepemilikan data, autentikasi, dan audit trail.

### 9.2 Preferensi

Default Asia/Jakarta (WIB), opsi Asia/Makassar (WITA) dan Asia/Jayapura (WIT). Formatter bersama memakai preferensi; timestamp sumber tetap ISO UTC. Notifikasi mengatur indikator UI, bukan pengiriman push/email/SMS. Nama Alex/role Operator adalah identitas tampilan, bukan akun terautentikasi.

### 9.3 CSV

Ekspor dari hasil filter penuh, bukan hanya 50 baris yang terlihat. Null → sel kosong; koma/kutip/CR/LF di-escape. Waktu ISO dengan `+07:00`; nama `genset-telemetry-prototype-YYYYMMDDHHmm.csv` dari Asia/Jakarta. CSV sengaja tidak mengikuti pilihan timezone profil: format ekspor memakai zona tetap agar konsisten.

Download memakai Blob/object URL di browser tanpa server. Waktu pembuatan tiket dan nama file dapat mengikuti waktu tindakan pengguna; deterministik berlaku pada seed/telemetry, bukan berarti seluruh tindakan interaktif memakai timestamp tetap.

## 10. Git dan riwayat commit

Branch `main`, `core.fileMode=false` lokal repo untuk NTFS. Pada pemeriksaan handover belum ada remote. Tidak ada push/deploy. File PDF masuk baseline; generated build dan dependency tidak masuk Git.

Riwayat sebelum penambahan dokumen handover ini:

```text
6cd103e M5: dokumentasi final, backlog dan checklist review manual
b882ffc M5: konsistensi UI, aksesibilitas, validasi storage dan regresi data
2a89976 M4: konfirmasi keluar dan layar akhir sesi
d811a86 M4: Profile dan preferensi zona waktu serta reset pengaturan
302a0b3 M4: Support dengan formulir validasi dan tiket lokal
9b1910e M4: News dengan kategori dan detail pengumuman
072e710 M3: Camera View grid dengan status belum terhubung
3d4e2fb M3: data 7 hari dan Chart Widget multi-seri
78f91cd M3: Gauge Widget dengan konfigurasi tersimpan lokal
f38aaf5 M2: halaman Data dengan tabel telemetry dan ekspor CSV
270c72c M2: halaman Virtual per subsistem dengan SVG interaktif
2e037c9 M2: halaman Device dengan pencarian, filter, dan drawer detail
04cea02 M1.5: teks UI netral dan penjaga copy
4486163 Tambah animasi kipas ventilasi M-301 pada ilustrasi mesin
387f8e9 Baseline: Overview dengan ilustrasi mesin dan pemetaan P&ID terbaru
```

Commit sesuai urutan halaman, tetapi beberapa wiring route dan hardening lintas halaman masuk commit berikutnya/M5. Untuk menjalankan hasil lengkap gunakan HEAD final, jangan mengasumsikan setiap commit halaman adalah paket berdiri sendiri. Jangan reset ke baseline hanya untuk mengambil gaya ilustrasi karena akan membuang mapping/perbaikan sesudahnya.

Memindahkan proyek ke partner: sertakan source, lockfile, docs, dan folder `.git` bila riwayat perlu dipertahankan; jangan sertakan `node_modules`, `dist`, `.env` atau data lokal browser. Bila nanti memakai remote, buat repository dan lakukan push hanya setelah pemilik menyetujui akses serta isi file. Dokumen ini tidak melakukan push.

## 11. Validasi yang tersedia dan keterbatasannya

### 11.1 Hasil terakhir yang dapat diperiksa

Rangkaian final M5 pada log lokal `/tmp/m5-final.log` mencatat:

| Pemeriksaan | Hasil |
|---|---|
| `npm run typecheck` | PASS |
| `npm run test:data` | PASS |
| `npm run test:copy` | PASS |
| `npm run build` | PASS; Vite 3,43 detik pada putaran tersebut |
| `git diff --check` | Bersih pada akhir M5 |
| Checksum PDF | Sama dengan referensi di bagian 4 |
| Browser/screenshot/UI automation | **Belum dilakukan** |

Log `/tmp` bukan artefak permanen repo dan bisa hilang setelah reboot. Partner harus menjalankan ulang perintah di bagian 8. Angka durasi build hanya catatan environment, bukan target performa atau SLA.

### 11.2 Cakupan otomatis

`test:data` memeriksa fleet/site/status/search, identitas dan provenance, mapping tag, device-scoped instance, LSL boolean/null, AT belum bersatuan, P-201 tanpa item gearbox, null/quality, RPM/Hz independen, status kipas termasuk stale offline, pause/resume, sumber CSS reduced-motion, CSV comma/quote/CR/LF/null/zona, konsistensi Data dengan chart/gauge, agregasi tujuh hari, validasi widget/tiket, fallback/reset storage.

`test:copy` memakai AST TypeScript/JSX dan metadata HTML. Negative fixtures memastikan kata terlarang pada tombol, tooltip, aria-label, dialog dan toast gagal. Pengecualian diterapkan untuk lokasi kode internal, bukan izin menampilkan enum mock sebagai label.

Test tersebut bukan pengganti E2E/browser; tidak membuktikan seluruh copy dinamis, input pengguna, perilaku Radix/fokus nyata, atau rendering CSS pada setiap browser.

### 11.3 Hal yang belum terbukti/masih perlu inspeksi

- Responsivitas aktual 390/768/1440 px dan keterbacaan SVG.
- Kehalusan putaran dan pusat hub kipas, khususnya transform SVG Virtual.
- Escape, fokus kembali, Tab trap, tooltip, dan reduced-motion di browser nyata.
- Download CSV dan tampilan di aplikasi spreadsheet yang dipakai partner.
- Direct-route refresh pada server hosting tujuan (belum ada hosting).
- Kualitas desain engineering, rating/perlindungan dan posisi fisik perangkat.

Jangan menyampaikan bahwa poin tersebut sudah lolos visual. UI camera/Logout/Support juga tidak membuktikan koneksi/auth/tiket server.

## 12. Backlog, risiko, dan rekomendasi melanjutkan

### 12.1 Backlog yang memang ditunda

1. Revisi tampilan Overview dari partner.
2. Audit keterbacaan ilustrasi Overview: viewBox 1550px berpotensi membuat label kecil pada layar kecil.

Keduanya ada di `docs/BACKLOG.md`, belum dikerjakan. M5 merapikan SVG **Virtual**, bukan mengerjakan ulang layout ilustrasi Overview.

### 12.2 Risiko teknis yang perlu diperhatikan penerus

- **Satu sumber data:** jangan membuat array telemetry tandingan untuk tiap halaman. Tambahkan adapter/selector bila sumber nyata datang.
- **Histori terbatas:** hanya empat channel tren. Channel baru butuh keputusan mock atau kontrak API, satuan, timestamp, dan quality.
- **Storage vs form:** validator saat load membatasi jumlah/panjang widget; review juga pembatasan form add widget agar payload yang dibuat UI tidak melebihi validator saat refresh. Ini kandidat hardening lanjutan, bukan jaminan seluruh edge case sudah ditangani.
- **Logout:** hanya akhir sesi tampilan, bukan security boundary. Semua route masih frontend tanpa pengamanan.
- **CSV input tak tepercaya:** saat menerima label/data dari backend, kaji mitigasi spreadsheet-formula injection selain escaping CSV. Versi sekarang memakai field seed/telemetry yang dikontrol aplikasi.
- **Kamera:** daftar/nama adalah keputusan presentasi, belum inventaris kamera terpasang. Integrasi kamera perlu mekanisme akses dan keamanan tersendiri.
- **Engineering:** P-201, manifold, fungsi PMG/AVR, kopling/rasio/rating dan satuan beberapa instrumen belum selesai secara desain.
- **Dokumen historis:** `PID-MAPPING.md` memuat uraian lama dan penjelasan perubahan M2–M5; baca addendum terbaru, jangan memakai kalimat historis seperti "tanpa putaran" sebagai kondisi kini.
- **Audit dependency:** versi terkunci; hasil build bukan audit keamanan permanen. Sebelum produksi lakukan review dependency/keamanan baru.

### 12.3 Urutan kelanjutan yang direkomendasikan (belum diimplementasikan)

**A. Review partner terlebih dahulu**

Jalankan build preview, gunakan checklist bagian 13 dan `docs/REVIEW-CHECKLIST.md`, catat screenshot/viewport dan issue nyata. Tentukan revisi Overview; jangan ubah identitas engineering hanya karena layout baru.

**B. Klarifikasi engineering**

Minta keputusan tertulis lokasi P-201; rasio/kopling gearbox; kutub/rating alternator; fungsi PMG 10/11 dan AVR; manifold 15; titik VT-401/VT-07; channel TT-07; pilihan RH/dew-point AT-301; satuan/rentang instrumen; ambang peringatan vs trip yang disetujui engineer. Jangan mengubah ambang UI menjadi proteksi PLC.

**C. Kontrak integrasi**

Tentukan backend/API/protokol gateway, tag/address PLC per unit, polling/subscription, timestamp/zona, quality, stale timeout, reconnect, histori/agregasi, unit engineering, hak akses, alarm acknowledgement, server tiket dan kamera. Pertahankan `deviceId + tag/parameter` agar channel tidak tercampur.

**D. Implementasi nyata bertahap**

Buat branch baru setelah persetujuan. Pisahkan telemetry monitoring dari command/control. Jika kontrol kelak diizinkan, desain otorisasi, interlock, konfirmasi, audit log dan kegagalan terlebih dahulu; frontend ini tidak cukup sebagai lapisan keselamatan. Ganti mock melalui adapter teruji, bukan menimpa nilai di semua komponen.

**E. Uji dan rilis**

Tambah component/E2E test bila alat disepakati; uji offline/stale/null, invalid storage, akses keyboard, tablet/mobile; verifikasi server SPA fallback; review keamanan/secrets; backup dan rollback. Push/deploy merupakan pekerjaan baru dengan persetujuan eksplisit, bukan bagian serah-terima ini.

## 13. Checklist serah-terima dan skenario presentasi

### 13.1 Checklist partner/developer

- [ ] Source, `.git`, lockfile dan PDF diterima; tidak ada secret/dependency/build tak perlu.
- [ ] `npm ci` dan empat perintah validasi lulus di komputer partner.
- [ ] Seluruh route tersedia; direct refresh dan Back/Forward benar.
- [ ] Site A/B/all konsisten di Device/Virtual/Data/widget/Support.
- [ ] GEN-002 menunjukkan warning 36 °C; GEN-004 null/last seen, bukan nol.
- [ ] Status desain/sumber lengkap; item 3/6 motor, 4/5/8/9 gearbox, 7 alternator.
- [ ] P-201 tidak dipasangkan ke item gearbox; LSL bukan persen; AT satuan belum final.
- [ ] Kipas running/stopped/offline, jeda, reduced-motion, hub dan klik diuji visual.
- [ ] Semua dialog Escape/Tab/fokus kembali; tab Virtual panah/Home/End.
- [ ] Data 24H/7D, pagination/empty/filter/CSV diuji dan hasil dibuka spreadsheet.
- [ ] Add/hapus gauge, judul, refresh/storage invalid/reset diuji.
- [ ] Chart dua satuan/dua sumbu/legend/tooltip/agregasi; null tidak jadi nol.
- [ ] Kamera empat layar gelap Belum terhubung; layout/perbesar benar.
- [ ] News filter/detail, Support validasi/sukses/storage, Profile timezone/notifikasi/reset, Logout/masuk kembali diuji.
- [ ] Tidak ada copy terlarang/disclaimer utama/label LIVE.
- [ ] Checklist viewport 390/768/1440 px diselesaikan, terutama Overview 1550px.
- [ ] Isu visual/engineering dicatat terpisah dari fitur yang benar-benar selesai.

### 13.2 Alur presentasi singkat yang disarankan

1. Buka Overview pada semua site; jelaskan unit dan parameter.
2. Pilih GEN-002 untuk peringatan lalu GEN-004 untuk data kosong/last seen.
3. Klik mesin/kipas, lihat detail dan Status desain tanpa mengklaim engineering final.
4. Buka Device dan Virtual; tunjukkan subsistem dan konflik P-201 yang belum dikonfirmasi.
5. Buka Data, ubah rentang/filter dan ekspor CSV.
6. Tambah gauge, bandingkan dua seri chart, tunjukkan kamera belum terhubung.
7. Buat tiket lokal, ubah preferensi, dan uji akhir sesi.
8. Kumpulkan revisi partner; jangan menjanjikan integrasi perangkat yang belum dibangun.

### 13.3 Dokumen yang dibaca bersama

- `README.md`: menjalankan, fitur dan batasan.
- `docs/hapid.md`: perjalanan dan konteks lengkap (dokumen ini).
- `docs/PID-MAPPING.md`: provenance, mapping dan konflik desain.
- `docs/BACKLOG.md`: pekerjaan yang ditunda.
- `docs/REVIEW-CHECKLIST.md`: review manual detail.
- `docs/reference/PID_Genset_PLTS.pdf`: draf sumber, bukan approval fabrikasi.

**Kesimpulan serah-terima:** fondasi frontend dan seluruh halaman M1–M5 sudah tersedia untuk review. Tahap berikutnya adalah validasi visual partner, penutupan pertanyaan engineering, lalu perencanaan integrasi nyata secara terpisah. Jangan menyamakan keberhasilan build/test dengan commissioning sistem monitoring PLC.

## 14. Galeri Mesin — CHECKPOINT 3B

Bagian ini ditambahkan setelah persetujuan CHECKPOINT 3A dengan revisi; seluruh aturan dan catatan sebelumnya tetap berlaku. `package.json` dan `scripts/check-copy.mjs` tidak diubah. Tidak ada dependency baru, commit, push, deployment atau koneksi telemetri nyata.

### 14.1 Halaman, copy dan interaksi

Route `/machines` dan menu **Galeri Mesin** menampilkan inventaris konseptual independen dari site/device terpilih. Provider, sumber data telemetri, kontrak readings dan ilustrasi Overview tetap. Komponen baru memakai Panel/Button dan Dialog existing dengan panel kanan; ilustrasi berupa `<img>`, bukan SVG inline baru.

Banner hanya sekali pada halaman: **Inventaris konseptual — Belum ada data**. Acuan bagian 6.1: baris 208 melarang kata tertentu; baris 210 melarang tambahan label prototype/disclaimer pada tiap kartu; baris 214 menetapkan copy data belum tersedia; baris 226 melarang alasan gangguan rekaan. Status default memakai **Unknown** existing, pembacaan **—** dengan **Belum ada data terkini.**; tidak mengklaim Offline atau koneksi tanpa bukti. Label kepastian definisi tidak disamakan dengan status pemetaan/operasi.

Tombol kartu membuka detail melalui Enter/Space atau klik. Dialog menampilkan sumber, catatan, kepastian identitas/geometri/fungsi/pemetaan dan registry tag terkait. Tab/Shift+Tab terkurung; Escape dan tombol tutup mengembalikan fokus ke kartu pemicu. Tag tanpa relasi mesin tetap terlihat pada bagian registry, bukan disembunyikan.

### 14.2 Metadata dan aset

`src/data/machines.json` memuat 20 item, `src/data/instruments.json` memuat 33 tag unik; tipe berada di `src/types/machine-assets.ts`, konsumsi dan relasi statis di `src/data/machine-catalog.ts`. Ini bukan instance per GEN atau duplikasi readings. Satu entri tag tidak menetapkan satu sensor fisik; registry mencakup tag instrumen/peralatan/aktuator dari draf dan konflik P-201. Sinyal draf tidak berarti transport berjalan; semua binding runtime kosong dan status unknown.

Item 18 tetap tanpa template/aset/posisi. Fungsi 14/16 belum ditentukan. ST-401 berlingkup deret poros, VT-401 area 4–5, TT-10/ST-10 kelompok 10/11 tetap unresolved, VFD-12 terkait 12/13 dengan tipe driver belum pasti. PM-01/CB-01 tidak digandakan per item. LSL-19/20 digital, bukan persen. Tidak dibuat TT-06/TT-11/ST-11. P-201 tidak dipetakan ke 4/5/8/9; konflik identitas pompa/gearbox tidak ditutup. Klaim 380 V dan geometri referensi bukan validasi engineering.

Dua belas SVG runtime berada di `public/assets/machines/`. Master tetap tidak berubah di bengkel `genset-interaktif`; metadata editor dibuang tanpa perubahan geometri, viewBox, aksesibilitas, ID non-editor atau body/status. Total 63.860 → 37.478 byte; XML/resource/ID lulus dan 24 perbandingan render master/runtime 512/64 px menghasilkan nol perbedaan piksel RGBA.

### 14.3 Verifikasi dan batas hasil

`npm run test:copy`, `npm run test:data`, `npm run typecheck`, dan `npm run build -- --outDir "/tmp/genset-machine-integration-i5qvappu/dist" --configLoader runner` lulus. Pemeriksaan registry tambahan membuktikan identitas unik, referensi aset, cakupan bersama, null item 18, level digital, status unknown dan binding kosong. Warning CSS baseline `-: T;` tetap ada; tidak diperbaiki. Tidak ada script lint.

Browser aktual diuji pada desktop 1440×1000 dan mobile 390×844: refresh langsung `/machines` di dev/preview, navigasi/back/forward, drawer mobile, independensi site, pemuatan 19 ilustrasi, detail PMG/TK-19/item 18, keyboard/fokus dan overflow horizontal. Tidak ada warning/error aplikasi pada console yang diperiksa; preview tanpa fetch/XHR atau resource eksternal. Screenshot galeri/detail kedua viewport diambil. Analisis model vision atas screenshot bukan persetujuan visual pengguna dan bukan validasi ulang seluruh halaman lama.

Dev dan preview menyediakan fallback BrowserRouter; reload preview yang diperiksa mengembalikan 304 dengan halaman tetap merender. Hosting produksi tetap harus mengembalikan `index.html` untuk route non-aset seperti `/machines`. Hosting produksi belum dikonfigurasi, diuji atau di-deploy. CHECKPOINT 3B menunggu review pengguna, bukan commissioning PLC.

