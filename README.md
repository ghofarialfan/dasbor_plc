# GensetMonitor — Frontend Prototype

M1.5–M5: Overview, Device, Virtual, Data, Gauge Widget, Chart Widget, Camera View, News, Support, Profile, Logout, dan finalisasi frontend. Tidak ada backend, MQTT, PLC, autentikasi nyata, kontrol mesin, atau push notification. Konfigurasi deployment frontend statis ke GitHub Pages tersedia.

## Menjalankan

Node minimum **22.12.0** (environment pengembangan: Node 22.23.4).

```sh
npm ci
npm run dev
```

Alamat default http://127.0.0.1:5173 (Vite memilih port lain bila terpakai).

```sh
npm run typecheck
npm run test:data
npm run test:copy
npm run build
npm run preview
```

Preview default http://127.0.0.1:4173. Output statis berada di `dist/`; tidak di-commit. GitHub Actions membangun dan memublikasikannya sebagai artifact Pages. Tidak memerlukan secret aplikasi atau `.env`.

## Halaman dan perilaku

- **Overview:** layout dan ilustrasi mesin lama dipertahankan; copy netral, animasi M-301 tetap independen. Revisi visual Overview ada di backlog.
- **Device:** empat unit GEN-001–004; search nama/ID/lokasi, status, card/list, drawer identitas/equipment/instrumen. Site memakai filter global shell. Offline menampilkan nilai kosong dan last seen.
- **Galeri Mesin (`/machines`):** 20 item inventaris konseptual, 12 template SVG eksternal, detail sumber/kepastian dan relasi tag. Independen dari filter site/device dan tidak memakai pembacaan telemetri.
- **Virtual:** empat SVG subsistem (penggerak/output, oli, ventilasi, keamanan), node keyboard/click membuka dialog detail bersama. P-201 tidak dipasangkan ke gearbox; ES-01 hardwired di luar logika PLC. Tombol kontrol disabled; jeda animasi hanya preferensi tampilan.
- **Data:** telemetry dari sumber deterministik yang sama dengan chart/gauge, filter unit/parameter (tag tercantum dalam opsi), rentang 1/3/6/24 jam dan 7 hari; pagination 50 baris. CSV mengekspor seluruh hasil filter, bukan hanya halaman aktif. Null menjadi sel kosong; koma/kutip/CR/LF di-escape, timestamp ISO `+07:00`, nama berisi `prototype`.
- **Gauge Widget:** tambah/hapus widget, unit/tag/judul; enam channel numerik yang dipetakan (PM-01 V dan Hz terpisah). TT-12 tetap null; LSL bukan gauge. Konfigurasi disimpan lokal. Widget mengikuti cakupan site.
- **Chart Widget:** maksimal dua seri, sumbu kiri/kanan bersatuan masing-masing; 1H/6H resolusi 5 menit, 24H rata-rata per jam, 7D rata-rata per 24 jam (bucket berakhir pada waktu referensi). Bukan interpolasi data hilang. Tooltip dan legend aktif.
- **Camera View:** empat placeholder gelap: Bay depan, Ruang alternator, Pintu kontainer, Area panel. Semuanya belum terhubung; tidak ada foto/stream publik. Layout 1/2/4 dan dialog perbesar.
- **News:** pengumuman deterministik, filter kategori dan dialog detail.
- **Support:** tiket seed dan tiket lokal, validasi judul/deskripsi/unit/alarm, status penyimpanan, tanpa pengiriman server.
- **Profile:** role operator, preferensi zona waktu WIB/WITA/WIT dan indikator notifikasi. Tidak ada ganti password. Kembalikan pengaturan awal menghapus key aplikasi saja.
- **Logout:** konfirmasi dan layar akhir sesi, tanpa mengakhiri sesi server. Masuk kembali langsung menuju Overview tanpa login palsu.

## Data, sumber, dan batasan engineering

`src/data/demo.ts` adalah sumber data telemetri tunggal; `src/data/queries.ts` hanya selector/agregasi, bukan salinan telemetry. Snapshot akhir **4 November 2026 07:00 UTC / 14:00 WIB**, bukan waktu live. Tiap unit memiliki 2017 sampel 5 menit (7 hari). RPM/Hz independen, nilai terbaru identik dengan gauge. GEN-004 offline: null di semua channel; nol standby GEN-003 disengaja, bukan substitusi null. TT-303 mempertahankan mock suhu ruang; TT-12 tidak menyalin TT-02. Angka 4 MW di draf bukan daya aktual yang ditampilkan.

Identitas 3/6 motor, 4/5/8/9 gearbox, 7 alternator berasal dari rekan proyek; metadata sumber/draf tidak dihapus. PMG/AVR tetap asumsi. P-201 lokasi fisik belum dikonfirmasi. LSL-19/20 boolean/null, bukan persen; AT-301 belum memiliki satuan final. Ambang 35 °C adalah **ambang peringatan ilustrasi, bukan batas proteksi PLC**. Range gauge adalah rentang display, bukan rating mesin. Detail ada di `docs/PID-MAPPING.md`.

Animasi M-301: running berputar, stopped/offline/unknown/not-simulated diam. GEN-004 selalu diam meskipun mock stale running. Hanya bilah berputar, housing/hub tetap. CSS menghormati reduced-motion; kecepatan dekoratif bukan RPM. Tidak ada kontrol fisik.

## Persistensi lokal

Key prefix `genset-demo:v1:`: site, gauge-widgets, tickets, profile, camera-layout. Site lama `genset-demo-site` dimigrasikan sekali. Payload divalidasi; JSON rusak atau enum/unit/channel invalid kembali ke default. Hanya data non-sensitif. Tidak menyimpan password/token. Data berasal dari browser ini saja; hapus key aplikasi lewat Profile. Storage ditolak browser tidak boleh membuat halaman crash; perubahan dapat bertahan hanya selama sesi.

## Routing dan build statis

React Router memakai HashRouter agar navigasi dan refresh bekerja di GitHub Pages tanpa fallback server. Contoh URL halaman: `/dasbor_plc/#/machines` dan `/dasbor_plc/#/device`. Gunakan format hash ini untuk bookmark; URL lama tanpa hash seperti `/dasbor_plc/device` tidak didukung di Pages. Membuka `dist/index.html` via `file://` bukan cara menjalankan.

### Deployment GitHub Pages

Repositori tujuan: https://github.com/ghofarialfan/dasbor_plc.

1. Commit perubahan konfigurasi dan gabungkan branch pengembangan ke `main`. Workflow `.github/workflows/deploy-pages.yml` berjalan otomatis pada push ke `main` atau manual melalui **Actions → Deploy GitHub Pages → Run workflow** setelah workflow tersedia di default branch.
2. Buka **Settings → Pages → Build and deployment → Source → GitHub Actions**. Pastikan paket/visibilitas repositori mendukung Pages; situs yang dipublikasikan bisa diakses publik sesuai pengaturan Pages. Jangan unggah data operasional rahasia.
3. Periksa tab **Actions** sampai job `build` dan `deploy` berhasil.
4. Buka https://ghofarialfan.github.io/dasbor_plc/ dan uji navigasi serta refresh https://ghofarialfan.github.io/dasbor_plc/#/machines.

Workflow menggunakan Node 22, `npm ci`, pemeriksaan data/copy, typecheck melalui build, dan `npm run build -- --base=/dasbor_plc/`. Token `GITHUB_TOKEN` disediakan GitHub secara otomatis; tidak perlu menyimpan personal access token. Nama repositori yang berubah memerlukan penyesuaian argumen `--base` dan URL di atas. Jika branch produksi bukan `main`, sesuaikan filter `branches` workflow.

Untuk menguji build subpath secara lokal:

```sh
npm run build -- --base=/dasbor_plc/
npm run preview -- --base=/dasbor_plc/
```

Buka http://127.0.0.1:4173/dasbor_plc/#/machines. Konfigurasi ini hanya menghosting frontend prototype, bukan koneksi PLC/MQTT, backend, atau autentikasi. Status deployment remote belum diverifikasi dari lingkungan lokal.

## Validasi

`test:data`: filter site/status/search, identitas dan tag per device, LSL boolean/null, P-201 tidak ke item angka, CSV escaping dan zona waktu, konsistensi tabel/gauge/chart, agregasi 7 hari, offline/null, skema widget/tiket, storage invalid/reset. `test:copy`: AST TypeScript/JSX dan metadata HTML; negative fixtures untuk tombol/aria-label/tooltip/dialog/toast. Nama internal enum/file tidak dianggap copy UI. Typecheck dan Vite build juga wajib.

Validasi awal M1.5–M5 tidak memakai browser fungsional. Galeri Mesin sudah diuji di browser pada desktop 1440×1000 dan mobile 390×844; ini bukan validasi ulang seluruh halaman lama. Hasil otomatis bukan pengganti persetujuan visual pengguna. Cakupan pemeriksaan ada di `docs/REVIEW-CHECKLIST.md`.

## Backlog

`docs/BACKLOG.md`: revisi Overview dari partner dan audit keterbacaan ilustrasi 1550px. Belum dikerjakan. Tidak ada dependency baru untuk M1.5–M5.

## Galeri Mesin — CHECKPOINT 3B

- Metadata: `src/data/machines.json` (20 item), `src/data/instruments.json` (33 tag unik), tipe `src/types/machine-assets.ts`, dan ekspor/selector statis `src/data/machine-catalog.ts`. Ini definisi konseptual, bukan instance GEN atau sumber readings baru.
- Runtime: `public/assets/machines/*.svg`, ditampilkan melalui `<img>`; master tetap di bengkel `genset-interaktif/assets-source/machines/`. Ekspor membuang metadata editor tanpa perubahan geometri: 24 perbandingan RGBA pada 512/64 px identik. Total runtime 37.478 byte dibanding master 63.860 byte.
- Banner satu kali: **Inventaris konseptual — Belum ada data**, mengikuti `docs/hapid.md` bagian 6.1, terutama baris 210, 214 dan 226 pada dokumen sebelum penambahan bagian Galeri. Status tetap **Unknown**, pembacaan **—**; tidak mengklaim Offline/koneksi yang tidak diketahui.
- Item 18 tanpa aset/posisi. Item 14/16 tetap Fungsi belum ditentukan. Geometri generik, fungsi, identitas dan pemetaan dibedakan; klaim 380 V pada item 17 bukan spesifikasi terverifikasi.
- Satu entri per tag tidak menyatakan satu sensor fisik. Registry juga mempertahankan tag peralatan/aktuator. ST-401 berlingkup sistem poros; VT-401 area 4–5; TT-10/ST-10 kelompok 10/11 tetap unresolved. P-201 tanpa item numerik, konflik lama tetap terbuka. Binding runtime kosong; sinyal draf seperti Modbus bukan koneksi.
- Detail memakai Dialog existing dengan panel kanan, tombol kartu, Tab/Shift+Tab terkurung, Escape dan pemulihan fokus. Provider, kontrak/data telemetri dan ilustrasi Overview tidak diubah. Tidak ada dependency baru; `package.json` dan pemeriksaan copy tetap.

Build/preview terisolasi dari root dashboard:

```sh
BUILD_DIR="$(mktemp -d /tmp/genset-machines.XXXXXX)"
npm run test:copy
npm run test:data
npm run typecheck
npm run build -- --outDir "$BUILD_DIR/dist" --configLoader runner
npm run preview -- --outDir "$BUILD_DIR/dist" --configLoader runner
```

Keempat pemeriksaan lulus pada CHECKPOINT 3B. Warning CSS baseline `Expected identifier but found "-"` pada deklarasi `-: T;` tetap ada dan tidak diperbaiki. Refresh langsung `/machines` terbukti merender di dev dan preview; preview dapat mengembalikan 304 saat cache dipakai. Hosting produksi tetap membutuhkan fallback SPA dan belum diuji/deploy.

