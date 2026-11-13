# GensetMonitor — Frontend Prototype

M1.5–M5: Overview, Device, Virtual, Data, Gauge Widget, Tren & Riwayat, Camera View, News, Support, Profile, Logout, dan finalisasi frontend. Tidak ada backend, MQTT, PLC, autentikasi nyata, kontrol mesin, atau push notification. Konfigurasi deployment frontend statis ke GitHub Pages tersedia.

## Panduan pengguna

Panduan berbahasa Indonesia untuk partner tersedia di [Panduan Penggunaan GensetMonitor](docs/PANDUAN-PENGGUNA.md), mencakup alur penggunaan, batasan prototype, penyimpanan/reset, troubleshooting, dan petunjuk ekspor PDF. Dokumen Markdown adalah sumber panduan; berkas PDF belum disertakan.

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

- **Overview:** dashboard industri enam area: output seluruh genset dalam filter site dan grafik perbandingan daya/tegangan/arus (1 jam, WIB); ikon mesin per genset dengan popup detail/pengaturan; gauge daya mesin internal unit detail; suhu aktual dan target lokal ruangan; tangki oli TK-19/TK-20; serta CCTV 1 → Thermal → CCTV 2. Output memakai registry PM-01, offline tampil kosong dan total ditandai parsial. Daya internal dan level oli % merupakan fixture ilustratif independen, bukan rating mesin atau hasil konversi LSL. Tekanan/suhu oli berasal dari sirkuit bersama. Target lokal tidak mengubah pembacaan atau mengirim perintah PLC. Media statis dapat diperbesar dan bukan telemetry/live. Tema terang/gelap dan scroll layar kecil dipertahankan; diagram besar di Visualisasi, histori lengkap di Tren & Riwayat.
- **Device:** 4 unit GEN-001–004; search nama/ID/lokasi, status, card/list, drawer identitas/equipment/instrumen. Site memakai filter global shell. Offline menampilkan nilai kosong dan last seen.
- **Mesin & instrumen (tab Device):** katalog inventaris konseptual dengan ilustrasi referensi, sumber/kepastian, relasi tag, dan pembacaan yang mengikuti unit aktif bila tersedia. Route lama `/machines` mengalihkan ke `/device?tab=machines`.
- **Visualisasi:** tab Sistem lengkap dan empat subsistem (penggerak/output, oli, ventilasi, keamanan), node keyboard/click membuka detail. P-201 tidak dipasangkan ke gearbox; ES-01 hardwired di luar logika PLC. Mode baca saja; gerak konseptual mengikuti status unit dan menghormati reduced-motion, bukan feedback operasi komponen.
- **Data:** telemetry dari sumber deterministik yang sama dengan chart/gauge, filter unit/parameter (tag tercantum dalam opsi), rentang 1/3/6/24 jam, 7 dan 90 hari; pagination 50 baris. CSV mengekspor hasil filter, bukan hanya halaman aktif, dengan batas aman 250.000 baris. Null menjadi sel kosong; koma/kutip/CR/LF di-escape, timestamp ISO UTC, nama berisi `prototype`.
- **Gauge Widget:** tambah/hapus widget, unit/tag/judul; enam channel numerik yang dipetakan (PM-01 V dan Hz terpisah). TT-12 tersedia pada sebagian unit tambahan; LSL bukan gauge. Konfigurasi disimpan lokal. Widget mengikuti cakupan site.
- **Tren & Riwayat:** grid enam parameter atau perbandingan maksimal dua seri; rentang 1H/6H/24H/7D/ALL (90 hari), Brush, statistik mentah dan pengurangan titik tampilan yang mempertahankan ekstrem/celah. Tooltip dan legend aktif.
- **Camera View:** empat tampilan lokal: Bay depan, Ruang alternator, Pintu kontainer, Area panel. Tiga memakai ilustrasi SVG saat online, satu tanpa media; unit offline menampilkan kondisi tidak tersedia. Tidak ada foto/stream publik. Layout 1/2/4 dan dialog perbesar.
- **News:** pengumuman deterministik, filter kategori dan dialog detail.
- **Support:** tiket seed dan tiket lokal, validasi judul/deskripsi/unit/alarm, status penyimpanan, tanpa pengiriman server.
- **Profile:** role operator, preferensi zona waktu WIB/WITA/WIT dan indikator notifikasi. Tidak ada ganti password. Kembalikan pengaturan awal menghapus key aplikasi saja.
- **Logout:** konfirmasi dan layar akhir sesi, tanpa mengakhiri sesi server. Masuk kembali langsung menuju Overview tanpa login palsu.

## Data, sumber, dan batasan engineering

`src/data/demo.ts` adalah sumber data telemetri tunggal; `src/data/queries.ts` hanya selector/agregasi, bukan salinan telemetry. Snapshot akhir **4 November 2026 07:00 UTC / 14:00 WIB**, bukan waktu live. Tiap unit memiliki 25.921 timestamp 5 menit (90 hari), dibangkitkan deterministik sesuai rentang yang diminta. RPM/Hz independen, nilai terbaru identik dengan gauge. GEN-004 offline: null di semua channel; nol standby GEN-003 disengaja, bukan substitusi null. TT-303 mempertahankan mock suhu ruang; TT-12 memiliki channel independen pada sebagian unit tambahan dan tidak menyalin TT-02. Angka 4 MW di draf bukan daya aktual yang ditampilkan.

Identitas 3/6 motor, 4/5/8/9 gearbox, 7 alternator berasal dari rekan proyek; metadata sumber/draf tidak dihapus. PMG/AVR tetap asumsi. P-201 lokasi fisik belum dikonfirmasi. LSL-19/20 boolean/null, bukan persen; AT-301 belum memiliki satuan final. Ambang 35 °C adalah **ambang peringatan ilustrasi, bukan batas proteksi PLC**. Range gauge adalah rentang display, bukan rating mesin. Detail ada di `docs/PID-MAPPING.md`.

Animasi M-301: running berputar, stopped/offline/unknown/not-simulated diam. GEN-004 selalu diam meskipun mock stale running. Hanya bilah berputar, housing/hub tetap. CSS menghormati reduced-motion; kecepatan dekoratif bukan RPM. Tidak ada kontrol fisik.

## Dataset besar dan cakupan skenario

- **4 unit di 2 site**, dengan snapshot normal/running, warning/running, standby, dan offline.
- **90 hari × 5 menit**: 25.921 timestamp per unit, total **103.684 timestamp unit / 622.104 slot nilai utama** untuk enam parameter. Slot null tetap dihitung, bukan dianggap pengukuran valid.
- Seed formula **20261104**, snapshot tetap **4 November 2026 07:00 UTC**, bukan waktu live. Tidak memakai `Math.random()` untuk arsip.
- **364 aktivitas** (360 catatan arsip dan 4 kondisi terakhir), **100 berita**, **120 tiket**, **4 widget kustom awal**. Alarm aktif hanya berasal dari kondisi snapshot saat ini; catatan arsip tidak disamarkan menjadi alarm aktif.
- Pada cakupan empat unit saat ini, seed target dan skenario kosong; riwayat lokal lama yang masih valid tetap dapat ditampilkan. Batas riwayat perubahan tetap 100 per kelompok, tiket 200 dan widget 50. Pengaturan lokal tidak mengubah telemetry, alarm, animasi atau proteksi.
- Arsip hanya dibangkitkan untuk unit/rentang yang diminta. Tidak ada jutaan objek arsip saat startup dan tidak ada histori sensor besar di localStorage. Kompatibilitas `trends[id]` membangkitkan arsip satu unit ketika diakses.
- Halaman Data memakai enam parameter, rentang hingga 90 hari, serta pagination 50 baris tanpa membangun jutaan objek baris sekaligus. News/Support membatasi tampilan 20 entri per halaman.
- CSV mengekspor nilai mentah sesuai filter, timestamp ISO UTC, dan diproses per unit dengan jeda event-loop. Batas aman **250.000 baris per berkas**; untuk volume lebih besar persempit unit/parameter/rentang. Ini bukan streaming server dan masih memakai memori browser untuk berkas final.
- Camera View memiliki SVG lokal statis untuk CAM-01–03 pada unit online; CAM-04 dan unit offline menampilkan kondisi tanpa media. Kegagalan pemuatan gambar juga memiliki fallback. **Bukan video atau CCTV aktual.**

### Matriks uji fitur

| Area | Skenario dataset / pemeriksaan |
| --- | --- |
| Overview, Device, site/search/status | Lima site, running/standby/offline/unknown; semua ID tetap memiliki equipment dan instrumen tersendiri |
| Chart | GEN-002 enam channel, lonjakan suhu, stop historis, celah; grid/comparison; Brush dan statistik mentah; alignment berdasarkan timestamp |
| Offline dan kosong | GEN-004 offline dengan arsip null |
| Channel parsial | GEN-001–003 memiliki enam channel utama; celah komunikasi historis tetap null |
| Data/CSV | Enam parameter, hingga 90 hari, pagination batas awal/akhir, timestamp, kualitas historis per sampel, filter dan batas ekspor |
| Pengaturan perangkat | Hanya GEN-001–004 valid; target/skenario terisolasi, konfirmasi, offline guard, riwayat dibatasi, refresh dan reset |
| Visualisasi dan katalog | Instance per unit; identitas/certainty draf tidak ditingkatkan; tag tanpa pemetaan tetap null, tidak diberi angka rekaan |
| News/Support | Empat kategori, berita detail, tiket open/resolved, relasi alarm valid, pagination dan validasi form |
| Camera View | Gambar lokal, unit offline, kamera tanpa sumber, fallback gambar, layout dan dialog perbesar |
| Profile/logout/storage | Preferensi zona waktu, reset key aplikasi, storage rusak/tidak tersedia; tidak menimpa data pengguna dengan seed baru |

Data awal hanya muncul jika key penyimpanan belum tersedia/tidak valid. Jika browser sudah menyimpan tiket atau widget lama, gunakan **Profile → Kembalikan pengaturan awal** untuk memuat seed baru; tindakan ini menghapus pengaturan lokal aplikasi. Tidak ada reset otomatis atau penghapusan key milik aplikasi lain.

Batas: dataset tidak mengaktifkan PLC, autentikasi backend, CCTV, atau command proteksi. Instrumen tanpa channel/satuan yang dikonfirmasi tetap ditampilkan belum tersedia. Generator adalah skenario demonstrasi, bukan model fisika/rating aktual. Pengujian browser interaktif tetap diperlukan; lulus pemeriksaan data/build tidak membuktikan seluruh alur UI di semua perangkat lancar.

## Tren & Riwayat historis

Tren & Riwayat menampilkan grid enam parameter dengan filter unit yang mengikuti konteks site, pilihan parameter, dan rentang bersama 1H / 6H / 24H / 7D / Semua tersedia. Mode pembanding mendukung maksimal dua parameter dengan sumbu terpisah dan warna parameter konsisten. Histori mencakup RPM, tegangan, frekuensi, suhu motor, suhu ruang dan suhu BLDC. GEN-001–003 memiliki enam channel utama, dan GEN-004 menguji arsip kosong.

Sumber grafik memakai sampel mentah interval 5 menit (90 hari), garis linear, serta celah untuk null. Periode panjang mengurangi titik tampilan dengan mempertahankan ekstrem per bucket dan batas celah. Anggaran dasar 800 titik bukan batas keras: batas celah tambahan tetap dipertahankan. Statistik dihitung dari sampel mentah dalam batas waktu Brush, bukan dari titik tampilan. Brush di bawah grafik mengatur viewport; minimum, maksimum, rata-rata dan jumlah sampel valid mengikuti viewport tersebut. Tooltip menyertakan unit generator, tanggal/jam beserta zona waktu preferensi, tag, nilai, dan satuan. Rentang diukur dari timestamp terakhir arsip, bukan waktu jam komputer.

Status offline tidak menyembunyikan arsip yang sudah tersimpan. GEN-004 pada dataset saat ini memang tidak memiliki sampel valid sehingga tetap menampilkan kondisi kosong. Halaman tidak membuat atau merekam histori baru dan tidak mencampur target/skenario manual. Pemilih tanggal khusus, agregasi server untuk arsip besar, dan perbandingan antarunit belum tersedia.

Uji manual: buka Tren & Riwayat, pilih Semua parameter dan Semua tersedia, pilih GEN-002 dan periksa enam kartu berisi histori, ubah rentang/unit/site, geser Brush dan periksa statistik, gunakan mode pembanding dua seri, kosongkan pilihan, lalu pilih GEN-004 (offline/kosong) dan GEN-003 (standby). Perubahan target manual tidak boleh mengubah chart sensor.

## Pengaturan manual seluruh channel perangkat

Pada Pengaturan Perangkat, enam parameter utama tetap memakai target per gauge. Semua channel tambahan dari registry instrumen kini menyediakan **Atur target** untuk angka atau **Atur status manual** untuk boolean, termasuk indikator kondisi sintetis pada komponen tanpa sensor terverifikasi. Tombol, dialog Atur skenario, serta panel kondisi skenario dan keterangannya telah dihapus dari kartu perangkat. Data skenario lama tidak dihapus; riwayatnya tetap tersedia pada tab Riwayat.

Target numerik tambahan memakai rentang asumsi UI 0 sampai maksimum channel dan kelipatan 0.01; bukan rating atau batas aman mesin. Status boolean menampilkan Aktif/true atau Tidak aktif/false sesuai label channel. Pengaturan memerlukan tinjauan dan konfirmasi, dinonaktifkan saat offline, disimpan per unit/tag/channel pada key `channel-targets`, dan menyimpan maksimum 100 perubahan pada tab Riwayat. VT-401 tetap satu target bersama gearbox 4/5; channel kelompok tidak dipecah. Key target/skenario lama tidak berubah. Reset Profile menghapus key tambahan melalui prefix penyimpanan yang sama.

Nilai manual tidak mengganti pembacaan, telemetry, alarm, proteksi, animasi, atau arsip sensor; tidak ada perintah PLC. Jika penyimpanan gagal, nilai hanya tersedia selama sesi dan UI menampilkan peringatan. Functional-update penyimpanan memakai nilai terbaru agar beberapa perubahan sebelum render berikutnya tidak saling menimpa.

Uji browser: ubah target arus PM-01 dan status LSL-19, periksa konfirmasi dan Riwayat, muat ulang, ganti unit/site, pastikan target VT-401 sama pada gearbox 4/5, batalkan dialog, coba nilai di luar batas, periksa GEN-004 offline, lalu reset dari Profile. Pembacaan sensor dan grafik histori harus tetap sama.

## Demo pengaturan manual per gauge

Setiap gauge Overview mempunyai tombol **Atur** sendiri: RPM, tegangan, frekuensi, suhu motor, suhu ruang, dan suhu BLDC. Nilai tengah gauge tetap pembacaan monitoring; **Target manual demo** ditampilkan terpisah di bawahnya. Target yang belum diisi tidak diberi nilai default rekaan. Suhu BLDC tetap belum ada data meskipun target diisi.

Menu **Pengaturan Perangkat** (route tetap `/gauge-widget`) menampilkan pemilih dan status unit serta tiga subtab: **Perangkat & kemampuan**, **Gauge kustom**, dan **Riwayat**. Subtab mendukung tombol panah kiri/kanan serta Home/End. Pencarian perangkat mencakup nama, ID, dan tag instrumen pada unit aktif; catatan panjang tersedia melalui **Detail instrumen**. Panel Perangkat & kemampuan dikelompokkan menjadi Output & PLTS, Penggerak & alternator, Pelumasan, Ventilasi & lingkungan, serta Status & keamanan, dengan gauge ringkas bertema terang. Tren parameter dan media lokal mengikuti unit aktif di kolom pendamping pada layar lebar dan ditumpuk pada layar kecil. Pencarian hanya menyaring panel perangkat. Tombol **Detail / Atur** membuka informasi instrumen dan kontrol lokal; **Atur target** dan **Atur status manual** mengikuti jenis channel. Tidak ada tombol Atur skenario. Indikator digital membedakan aktif, tidak aktif, dan data kosong tanpa menyamakan aktif dengan kondisi sehat. Gauge kustom tetap mengikuti filter site; riwayat target dan skenario mengikuti unit aktif. Keenam parameter numerik tersedia pada widget perangkat terkait, tanpa panel enam gauge terpisah di atasnya. Widget tambahan juga memiliki tombol Atur; unit tujuan selalu mengikuti identitas widget. Target untuk pasangan unit/parameter yang sama sinkron di semua tampilan. Panel pendinginan terpisah sudah dihapus.

- Rentang skenario input: RPM 0–1000 (langkah 1), tegangan 0–500 V (langkah 1), frekuensi 0–60 Hz (langkah 0,1), suhu motor/BLDC 0–60 °C dan suhu ruang 0–50 °C (langkah 0,1).
- Rentang tersebut hanya batas UI demo, **bukan batas aman, rating alat, rekomendasi operasional, atau bukti parameter writable**. Aktuator/tag writable belum dipetakan.
- Setiap perubahan memerlukan tinjauan unit/tag, nilai monitoring, target lama/baru, lalu **Terapkan ke demo**. Pergantian site/unit membatalkan dialog. Unit offline tidak bisa diubah; tidak ada antrean perintah.
- Telemetry, alarm, status unit, serta animasi tidak berubah. Mengubah target suhu tidak membuktikan suhu motor turun. Visualisasi tetap baca saja.
- Target disimpan terpisah per unit/parameter di `genset-demo:v1:gauge-targets`, dengan maksimum 100 perubahan terakhir secara global. Riwayat ini bukan audit operasional. Storage invalid kembali ke kondisi kosong; kegagalan simpan ditampilkan. Reset Profile menghapus target dan riwayat.
- Data panel pendinginan lama (`device-controls`) tidak dipakai atau dipindahkan menjadi target gauge karena maknanya berbeda; reset Profile juga membersihkan key lama.
- Tidak ada pengiriman jaringan, koneksi PLC, start/stop, kontrol breaker, reset trip, atau bypass proteksi.

Uji manual: Atur RPM GEN-001 lalu konfirmasi; pastikan angka monitoring tidak berubah dan target muncul. Buka Pengaturan Perangkat untuk mengecek sinkronisasi, ganti unit/parameter untuk mengecek isolasi, coba angka desimal pada Hz/suhu, input kosong/di luar rentang, GEN-004 offline, perpindahan site/unit saat dialog terbuka, refresh, dan reset melalui Profile.

### Widget seluruh perangkat

Semua item **Perangkat & kemampuan** di Pengaturan Perangkat memiliki kartu widget dan tombol **Atur**. Motor, BLDC, pengukuran deret poros, output, dan ventilasi menampilkan gauge parameter yang telah dipetakan; targetnya berbagi state dengan Overview. RPM tidak disalin menjadi channel per motor/gearbox.

Setiap kartu juga menyediakan pilihan skenario lokal. Indikator digital menggunakan pilihan status; komponen pasif atau parameter yang belum dipetakan menggunakan kondisi skenario (Normal / Perlu pemeriksaan / Dalam pemeliharaan), tanpa mengarang satuan atau setpoint fisik. Tidak ada persentase level tangki yang diturunkan dari low-level digital. Pilihan breaker, emergency stop, dan relay hanyalah indikator skenario, bukan command, bypass, atau reset proteksi. Status aktual yang belum tersedia tetap belum ada data terverifikasi.

Skenario dimulai belum diatur, ditinjau sebelum konfirmasi, dibatasi per unit/perangkat, dan disimpan di `genset-demo:v1:equipment-scenarios`. Riwayat skenario dibatasi 100 perubahan, terpisah dari riwayat target numerik. Storage invalid kembali kosong; kegagalan simpan diberi peringatan. Reset Profile menghapus kedua penyimpanan, sementara penggunaan pengaturan tidak mengubah widget tambahan yang sudah tersimpan.

Uji manual tambahan: pastikan setiap item mempunyai tombol Atur; ubah kondisi filter, indikator low-level tangki, dan skenario breaker. Periksa nilai lama/baru, pembatalan, refresh, isolasi antarperangkat/unit, GEN-004 offline, pembatalan dialog saat berganti site/unit, serta reset Profile. Pastikan monitoring, alarm, dan animasi tetap tidak berubah.

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


## Widget bawaan perangkat

Pengaturan Perangkat → Perangkat & kemampuan otomatis menampilkan seluruh instrumen yang terpetakan pada unit aktif, memakai registry dan pembacaan yang sama dengan Device. Enam channel utama dan channel tambahan memiliki pembacaan simulasi eksplisit. Satuan, rentang, serta binding tambahan merupakan asumsi demo, bukan spesifikasi aktual. Sinyal digital memakai indikator, bukan persen; definisi sinyal draf yang belum final tetap dipertahankan. Perangkat tanpa instrumen memakai kartu kondisi/kemampuan. VT-401 tetap pengukuran bersama gearbox 4/5, bukan dua channel baru.

Widget bawaan tidak disimpan sebagai widget kustom dan tidak mengurangi batas 50 widget kustom. Pengaturan skenario tetap terpisah dari nilai pengukuran. Unit offline tidak menampilkan angka terkini. Dataset hanya mencakup GEN-001–GEN-004 pada Site A/B: normal, warning suhu, standby, dan offline. Setiap alat memiliki pembacaan atau kondisi demo; tag DEMO sintetis dipakai untuk alat tanpa instrumen draf.

## Sinkronisasi state dan cakupan fitur

- Site dan unit aktif dipersistenkan, divalidasi, dan dipakai bersama oleh Overview, Device, Visualisasi, Chart, Data (mode satu unit), Camera View, serta formulir pengaturan/tiket. Pergantian site memilih fallback unit dalam site tersebut. Pencarian/status Device hanya memfilter daftar lokal; mode semua unit Data tidak mengganti unit aktif.
- Tiket, gauge widget, tata letak kamera, target, dan skenario berada di provider bersama. Event `storage` menyelaraskan tab browser; konflik menggunakan nilai valid terakhir yang ditulis, bukan penggabungan otomatis. Penulisan bersamaan antartab masih dapat saling menggantikan karena localStorage bukan database transaksional.
- Data tersimpan yang valid tetap dipertahankan; seed hanya menjadi fallback untuk key kosong/rusak. Telemetry dan arsip tidak disimpan di localStorage. Target/skenario tidak mengubah telemetry, alarm, atau kondisi peralatan aktual.
- Aktivitas dan tiket ditampilkan 20 entri per halaman, dengan tanggal/zona waktu; tiket diurutkan terbaru dahulu. Batas total 50 widget dan 200 tiket menolak penambahan baru, bukan membuang tiket lama.
- CAM-01 di Overview memakai komponen dan aturan ketersediaan yang sama dengan Camera View: CAM-01–03 menampilkan SVG statis saat online, CAM-04/unit offline tanpa media. Semua gambar merupakan ilustrasi lokal, bukan CCTV.
- News dan katalog mesin adalah konten global/konseptual. Keduanya tidak mengarang relasi site, unit, maupun pembacaan sensor.
- Profile meminta konfirmasi sebelum reset seluruh key aplikasi dan memuat ulang seed. Reset tidak menghapus key aplikasi lain; kegagalan penghapusan dilaporkan. Tab lain menerima perubahan melalui event storage. Logout tetap tidak menghapus pengaturan.
- Preferensi zona waktu/notifikasi berlaku lintas halaman/tab. Bila penyimpanan preferensi gagal, kontrol kembali ke preferensi yang aktif agar UI tidak mengklaim pengaturan yang belum berlaku.

Validasi sinkronisasi: `npm run test:data`, `npm run test:copy`, `npm run typecheck`, `npm run build`, dan `git diff --check`. Regresi state menggunakan harness hook deterministik untuk penulisan, validasi, kegagalan kuota, perubahan eksternal, dan reset; bukan pengganti pengujian interaksi browser/responsivitas.


## Koreksi cakupan demo empat unit

- GEN-005–GEN-020 dan Site C–E tidak lagi dibangkitkan. Migrasi hanya menghapus referensi unit tersebut dari tiket, widget, target, skenario, dan histori pengaturan; preferensi empat unit serta key aplikasi lain dipertahankan. Pilihan unit/site yang dihapus mendapat fallback valid.
- Pembacaan tambahan mencakup suhu/getaran, oli, PV, PMG, eksitasi, damper, RH asumsi, digital proteksi/keamanan, serta kondisi sintetis peralatan tanpa instrumen. VT-401 tetap satu channel bersama gearbox 4/5. TT-07 serta TT-10/ST-10 tidak dipecah menjadi sensor fisik yang belum terkonfirmasi.
- Data dan Chart menambahkan panel kapabilitas per unit/channel, histori 90 hari interval 5 menit, serta CSV numerik/boolean. Enam parameter utama tetap memakai tabel/grafik existing. Panel tambahan menggunakan fungsi simulasi yang sama dengan widget/Device; query satu channel membatasi jumlah sampel menjadi 25.921.
- GEN-004 sengaja tanpa pembacaan terkini maupun arsip. Offline bukan nilai nol. Target/skenario lokal tidak mengubah readings, arsip, alarm, atau kontrol fisik.


### Device dan katalog mesin

Detail unit dapat dibuka tanpa mengubah unit aktif. Gunakan **Gunakan unit ini** untuk memilihnya, atau **Buka pengaturan** untuk membuka pengaturan lokal dengan konteks unit tersebut. Drawer memisahkan Ringkasan, Perangkat, dan Instrumen; pembacaan tetap terpisah dari target dan skenario lokal, tanpa perintah PLC.

Katalog mendukung pencarian nama/item/tag, filter jenis, dan reset. Pembacaan dicocokkan dengan tag registry yang sama pada unit terpilih, bukan ditebak dari nama mesin. Relasi mesin fisik tetap konseptual; status operasi mesin individual tidak disimpulkan dari status unit. Binding yang tidak tersedia ditandai **Belum dipetakan**. VT-401 tetap satu pembacaan bersama gearbox 4/5 dan definisi sensor kelompok tidak dipecah. Link histori membawa unit serta parameter/channel melalui URL.

### Kartu channel Pengaturan Perangkat

Pengaturan Perangkat menampilkan satu kartu per channel pada grid responsif (1 kolom ponsel, 2 tablet, 3 desktop). Gauge numerik memakai dial yang sama dengan Parameter utama; channel digital tetap berupa indikator, bukan persentase. Tombol **Detail** membuka dialog berisi identitas unit, perangkat terkait, tag, channel, sinyal, kualitas data, fungsi, catatan, rentang, dan asumsi. Channel bersama seperti VT-401 ditampilkan sekali, termasuk ketika mencari gearbox 4 atau 5. Pengaturan target/status manual dan pembatasan offline tidak berubah.
