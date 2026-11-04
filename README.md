# GensetMonitor — Frontend Demo

Milestone 1: scaffold, App Shell, dan Overview interaktif. Semua data lokal dan deterministik; tidak ada backend atau integrasi perangkat. Proyek baru dibuat pada direktori yang sebelumnya kosong.

## Menjalankan

Diuji dengan Node **22.23.4** dan npm **10.9.9**. Node minimum proyek: 22.12.0.

```bash
npm ci
npm run dev
```

Buka **http://127.0.0.1:5173**. Jika port digunakan, Vite menampilkan port pengganti pada terminal.

```bash
npm run typecheck
npm run test:data
npm run build
npm run preview
```

Preview build: **http://127.0.0.1:4173**. Tidak ada deployment otomatis. Tidak membutuhkan `.env`, akun, atau secret. `package-lock.json` mengunci dependency; jangan memakai `--force` atau `--legacy-peer-deps`.

## Yang tersedia

- Sidebar navy, navigasi aktif, collapse desktop, icon sidebar tablet, drawer mobile.
- Header dengan filter site, notifikasi alarm, menu profil, dan badge demo yang tetap terlihat ketika scroll.
- Overview: KPI, diagram sistem konseptual dengan detail peralatan/instrumen (klik/Enter/Space), alarm, enam gauge responsif, chart, camera placeholder yang dapat diperbesar, dan recent activity.
- Dropdown site/device, alarm, dan aktivitas benar-benar mengubah device yang digunakan diagram, gauge, chart, dan preview kamera.
- Chart memiliki pilihan parameter dan 1/3/6 jam, satuan, tooltip, dan legend.
- Semua halaman lain adalah placeholder yang menyebut milestone. Termasuk Logout: belum ada flow akhir sesi dan tidak mengklaim logout server.
- Komponen UI lokal mengikuti pola shadcn/ui (Radix primitives, CVA, `cn`, `components.json`). Native select digunakan agar sederhana dan mudah diakses.

## Data dan semantik

Sumber tunggal: `src/data/demo.ts`. Referensi tetap **4 November 2026, 14:00 WIB**, bukan waktu live. Timestamp ditampilkan dalam `Asia/Jakarta`.

| Device | Site | Operasi | Data |
|---|---|---|---|
| GEN-001 | A | Running | 500 rpm, 380 V, 50 Hz, suhu motor 31 °C, ruang 27 °C |
| GEN-002 | B | Running / warning demo | Sama, tetapi suhu motor 36 °C |
| GEN-003 | A | Standby | 0 rpm, 0 V, 0 Hz, suhu motor/ruang 27 °C |
| GEN-004 | B | Unknown / offline | Semua nilai terkini `null`; last seen 11:55 WIB |

Default tanpa preferensi tersimpan: **Semua Site** → 4 total, 2 running, 1 standby, 1 offline. Site A → 2/1/1/0; Site B → 2/1/0/1. Alarm dan aktivitas mengikuti site. Device yang tidak valid untuk site langsung diganti dengan device pertama di site itu.

**Angka adalah ilustrasi UI, bukan spesifikasi engineering yang telah divalidasi.** Tidak ada hubungan mekanis RPM–frekuensi yang disimpulkan. GEN-002 memakai **ambang ilustrasi demo suhu motor 35 °C**, bukan batas proteksi PLC. Range gauge hanya range display.

Pemetaan tag: RPM poros ST-401; tegangan dan frekuensi output PM-01; suhu motor TT-02; suhu ruang TT-303; suhu BLDC TT-12. TT-303 mempertahankan mock suhu ruang; TT-12 tetap `null` / Belum disimulasikan. Parameter bearing/coolant generik dihapus. TT-07 tetap deskripsi suhu belitan dan bearing alternator tanpa channel terpisah. LSL-19/20 digital boolean/null, bukan persen. AT-301 belum ditetapkan RH atau titik embun dan tidak diberi satuan final.

Device, Equipment, dan Instrument dipisahkan; tag selalu dalam lingkup device (`GEN-001:TT-02` berbeda dari `GEN-002:TT-02`). Kepastian sumber `documented | assumed | tbd` terpisah dari status operasi/kualitas data; label `documented` adalah **Tercantum di draf**, bukan terverifikasi. Empat GEN tetap fleet simulasi, bukan empat unit nyata yang dibuktikan PDF.

Nol pada standby adalah nilai ilustrasi yang disengaja, bukan pengganti nilai hilang. Gauge null tidak menggambar busur nilai di nol; label membedakan Belum disimulasikan, Offline, dan No current data. GEN-004 tidak memiliki nilai terkini maupun riwayat yang ditampilkan, dengan last seen jelas.

Referensi PDF disalin tanpa mengubah sumber dan checksum identik. Dokumen **draf konseptual, bukan untuk fabrikasi**. Pemetaan, asumsi, dan batas interpretasi tersedia di `/run/media/alfan_ghofari/Data/Prototype monitoring plc/docs/PID-MAPPING.md`. Diagram memakai klarifikasi rekan proyek: Motor 2 → Motor 3 → Gearbox 4/5 → Motor 6 → Alternator 7; gearbox 8/9 tetap pada posisi konseptual tanpa arah transfer; cabang listrik dari item 7 → CB-01 → output 17, dengan PM-01 sebagai pengukuran output. Jenis garis dan kepastian hubungan ditampilkan terpisah. Tidak ada klaim daya aktual 4 MW.

Trend dibuat sekali dengan fungsi sinus deterministik dan interval 5 menit; titik terakhir cocok dengan snapshot. Perubahan filter tidak menghasilkan nilai acak baru. Grafik offline tidak mengubah `null` menjadi nol.

## Penyimpanan dan batasan

`localStorage` hanya menyimpan `genset-demo-site`, preferensi site non-sensitif. Jika penyimpanan ditolak, muncul pemberitahuan dan demo tetap berjalan. Font Inter disajikan lokal melalui npm, bukan CDN.

Tidak ada database, MQTT, PLC, auth nyata, kamera live, stream publik, command kontrol, analytics, layanan berbayar, atau request API aplikasi. Perangkat “online” pun hanya status pada skenario simulasi. Kamera selalu placeholder. Tidak memakai label LIVE.

Dependency langsung dipasang dengan versi pasti. Recharts 2.15.4 kompatibel dengan React 18 tetapi branch v2 sudah tidak aktif dan npm memberi deprecation warning; migrasi v3 dapat dipertimbangkan terpisah, bukan disamarkan sebagai error build.

## Checklist review browser

Browser fungsional/automation belum tersedia di environment pengerjaan; `/usr/bin/firefox` hanya launcher Snap tanpa browser terpasang. Checklist manual, bukan klaim sudah lolos visual:

- **1440 px:** sidebar penuh; KPI 4 kolom, gauge 3 kolom; diagram + alarm dan chart + kamera berdampingan. Collapse/expand sidebar.
- **768 px:** sidebar ikon dengan tooltip; KPI/gauge responsif; panel tidak saling menimpa.
- **390 px:** drawer dari hamburger; KPI 2 kolom dan gauge 1 kolom; halaman tidak overflow horizontal; badge demo terlihat saat scroll.
- Drawer/dialog: fokus berada di dalam; Tab tidak keluar; Escape dan tombol X menutup; fokus kembali ke pemicu.
- Site Semua/A/B: cek KPI di atas, alarm, aktivitas, pilihan device, dan konsistensi diagram/gauge/chart.
- Pilih GEN-002: gauge suhu motor 36 °C dan warning ambang demo 35 °C.
- Pilih GEN-004: tidak ada data sensor atau garis chart; last seen jelas.
- Ubah parameter/time range chart: data/unit/tick/tooltip ikut berubah. Hover pada chart dan ikon informasi.
- Geser diagram dalam panel; klik equipment dan cek tag per device, label kepastian, serta nilai null tanpa indikator nol. Perbesar kamera; tutup dengan Escape.
- Menu notifikasi/profil dapat dibuka dengan keyboard; semua menu lain menuju placeholder dan bisa kembali.
- Refresh menyimpan site saja. Cek browser console untuk error; cek Network tidak ada stream/API.

## Dependency dan hasil pemeriksaan

Versi terpasang: React/React DOM 18.3.1; React Router DOM **7.18.5**; Recharts 2.15.4; Lucide React 0.577.0; Tailwind CSS 3.4.19; Vite 7.3.7; plugin React 5.2.0; TypeScript 5.9.3; PostCSS 8.5.32; Autoprefixer 10.6.2. Versi lengkap ada pada `package.json` dan `package-lock.json`.

Router awal 6.30.6 diganti ke 7.18.5 setelah audit menemukan dua advisory moderate. Versi pengganti diverifikasi membutuhkan Node >=20 dan React >=18, cocok dengan environment. Tidak memakai flag pemaksaan. `npm ls` bersih; audit akhir melaporkan 0 vulnerability (hasil registry saat pemeriksaan, bukan jaminan keamanan permanen).

Pemeriksaan akhir: `npm run typecheck`, `npm run test:data`, dan `npm run build` berhasil. Chunk chart dan vendor dipisah sehingga build akhir tidak memberi warning ukuran chunk. Instalasi pertama sempat timeout jaringan lalu berhasil diulang. Tidak ada pemeriksaan visual browser yang diklaim selesai; lihat checklist di atas.

## Struktur penting

`src/components/layout/` — shell, sidebar, metadata navigasi. `src/components/ui/` — primitives reusable. `src/components/overview/` — diagram, gauge, chart, alerts/activity, camera. `src/context/demo-context.tsx` — state/filter bersama. `src/types/` — types. `src/pages/` — Overview dan placeholder. `scripts/check-data.mjs` — pemeriksaan invariant data tanpa framework test tambahan.

Milestone 2–5 belum dikerjakan. Search/device detail, Virtual lengkap, tabel/CSV, konfigurasi widget, camera grid, News, Support, Profile, dan alur Logout belum tersedia.

## Ilustrasi mesin dan klarifikasi identitas

Overview kini memiliki tab **Ilustrasi Mesin** (default, SVG 2.5D statis) dan **Diagram Sistem**, dengan dialog peralatan bersama. Item 3/6 adalah motor, 4/5 dan 8/9 gearbox, 7 alternator berdasarkan **Keterangan rekan proyek**, bukan perubahan PDF. Alur konseptual 2 → 3 → 4/5 → 6 → 7 dan cabang 7 → CB-01 → output 17 dipertahankan; PM-01 pengukuran. Gearbox 8/9 tanpa arah daya. TT-03 ditambahkan dengan nilai null; motor 6 tanpa tag; TT-07/VT-07 dan VT-401 tidak dipecah ke channel baru. Detail sumber dan ketidakpastian ada di `docs/PID-MAPPING.md`.

Ilustrasi konseptual — bukan gambar OEM. Geser ilustrasi di mobile; uji hover/fokus, Enter/Space/tap, kedua tab, fokus kembali setelah dialog ditutup, dan pemilihan device. Pemeriksaan visual browser belum dilakukan. Tidak ada library 3D, backend, kontrol perangkat atau deployment baru.
