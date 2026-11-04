# GensetMonitor — Frontend Prototype

M1.5–M5: Overview, Device, Virtual, Data, Gauge Widget, Chart Widget, Camera View, News, Support, Profile, Logout, dan finalisasi frontend. Tidak ada backend, MQTT, PLC, autentikasi nyata, kontrol mesin, push, atau deployment.

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

Preview default http://127.0.0.1:4173. Output statis berada di `dist/`; tidak di-commit atau di-deploy. Tidak memerlukan secret atau `.env`.

## Halaman dan perilaku

- **Overview:** layout dan ilustrasi mesin lama dipertahankan; copy netral, animasi M-301 tetap independen. Revisi visual Overview ada di backlog.
- **Device:** empat unit GEN-001–004; search nama/ID/lokasi, status, card/list, drawer identitas/equipment/instrumen. Site memakai filter global shell. Offline menampilkan nilai kosong dan last seen.
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

`src/data/demo.ts` adalah sumber data tunggal; `src/data/queries.ts` hanya selector/agregasi, bukan salinan telemetry. Snapshot akhir **4 November 2026 07:00 UTC / 14:00 WIB**, bukan waktu live. Tiap unit memiliki 2017 sampel 5 menit (7 hari). RPM/Hz independen, nilai terbaru identik dengan gauge. GEN-004 offline: null di semua channel; nol standby GEN-003 disengaja, bukan substitusi null. TT-303 mempertahankan mock suhu ruang; TT-12 tidak menyalin TT-02. Angka 4 MW di draf bukan daya aktual yang ditampilkan.

Identitas 3/6 motor, 4/5/8/9 gearbox, 7 alternator berasal dari rekan proyek; metadata sumber/draf tidak dihapus. PMG/AVR tetap asumsi. P-201 lokasi fisik belum dikonfirmasi. LSL-19/20 boolean/null, bukan persen; AT-301 belum memiliki satuan final. Ambang 35 °C adalah **ambang peringatan ilustrasi, bukan batas proteksi PLC**. Range gauge adalah rentang display, bukan rating mesin. Detail ada di `docs/PID-MAPPING.md`.

Animasi M-301: running berputar, stopped/offline/unknown/not-simulated diam. GEN-004 selalu diam meskipun mock stale running. Hanya bilah berputar, housing/hub tetap. CSS menghormati reduced-motion; kecepatan dekoratif bukan RPM. Tidak ada kontrol fisik.

## Persistensi lokal

Key prefix `genset-demo:v1:`: site, gauge-widgets, tickets, profile, camera-layout. Site lama `genset-demo-site` dimigrasikan sekali. Payload divalidasi; JSON rusak atau enum/unit/channel invalid kembali ke default. Hanya data non-sensitif. Tidak menyimpan password/token. Data berasal dari browser ini saja; hapus key aplikasi lewat Profile. Storage ditolak browser tidak boleh membuat halaman crash; perubahan dapat bertahan hanya selama sesi.

## Routing dan build statis

React Router memakai BrowserRouter. Untuk hosting statis kelak, konfigurasi server agar semua route non-aset fallback ke `index.html`. Refresh `/device`, `/virtual`, `/data`, `/gauge-widget`, `/chart-widget`, `/camera-view`, `/news`, `/support`, `/profile`, `/logout` harus mendapat HTML aplikasi. Vite dev/preview mendukung fallback; server file biasa tanpa fallback tidak cukup. Membuka `dist/index.html` via `file://` bukan cara menjalankan. Tidak ada konfigurasi atau deployment remote dibuat.

## Validasi

`test:data`: filter site/status/search, identitas dan tag per device, LSL boolean/null, P-201 tidak ke item angka, CSV escaping dan zona waktu, konsistensi tabel/gauge/chart, agregasi 7 hari, offline/null, skema widget/tiket, storage invalid/reset. `test:copy`: AST TypeScript/JSX dan metadata HTML; negative fixtures untuk tombol/aria-label/tooltip/dialog/toast. Nama internal enum/file tidak dianggap copy UI. Typecheck dan Vite build juga wajib.

Tidak ada browser fungsional yang digunakan untuk validasi visual. Hasil build/test otomatis bukan bukti lolos screenshot, responsivitas, fokus aktual, atau tooltip di browser. Review manual di `docs/REVIEW-CHECKLIST.md`.

## Backlog

`docs/BACKLOG.md`: revisi Overview dari partner dan audit keterbacaan ilustrasi 1550px. Belum dikerjakan. Tidak ada dependency baru untuk M1.5–M5.
