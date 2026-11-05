# Checklist review manual M1.5–M5

Checklist M1.5–M5 berikut belum divalidasi ulang menyeluruh di browser. Hasil khusus Galeri Mesin dicatat terpisah di bawah; bukan PASS seluruh halaman lama atau persetujuan visual pengguna.

- [ ] Desktop 1440px, tablet 768px, mobile 390px: shell/card/typography konsisten; hanya tabel/diagram yang boleh scroll horizontal di dalam card.
- [ ] Chip Prototype di header; card Frontend prototype di sidebar/drawer; ikon + tooltip pada sidebar collapsed. Tidak ada kata terlarang di teks, toast, aria-label atau tooltip.
- [ ] Semua route: navigasi sidebar, Back, Forward, refresh; URL tidak dikenal memberi 404 dan jalan kembali.
- [ ] Semua dialog/drawer: Tab terkurung, Escape/X menutup, fokus kembali ke pemicu, judul/deskripsi terbaca screen reader.
- [ ] Overview: angka, identitas, layout, dua tab tetap; warning TT-02; detail Status desain; M-301 pause/resume/reduced-motion, GEN-004 diam.
- [ ] Device: cari ID/nama/lokasi; semua status; site A/B/all; card/list; drawer offline null, last seen, equipment/instrumen dan sumber.
- [ ] Virtual: empat tab, keyboard panah/Home/End; semua node klik/Enter/Space; P-201 tidak di gearbox; ES-01 hardwired; kontrol disabled dengan tooltip; teks tablet tidak tumpang tindih.
- [ ] Ventilasi: M-301 mengikuti helper status yang sama dengan Overview; bilah berpusat di hub; housing diam; tooltip/fokus/klik tidak terhalang animasi.
- [ ] Data: unit/tag/parameter dan semua rentang hingga 7D mengubah baris; pagination 50; null —, nol standby 0; empty filter; CSV seluruh hasil filter, nama prototype, zona ISO, kutip/comma/newline dan null kosong.
- [ ] Gauge Widget: tambah/hapus/custom title, PM-01 V/Hz terpisah, TT-12 null; refresh mempertahankan; LSL tidak tersedia; ganti site tidak menampilkan unit luar site.
- [ ] Chart: 1H/6H/24H/7D, dua seri dan dua sumbu berlabel satuan; tooltip/legend; agregasi jam/hari; offline tanpa garis.
- [ ] Camera: empat layar gelap, semua Belum terhubung, layout 1/2/4, perbesar/Escape, tanpa foto/stream/LIVE.
- [ ] News: kategori/detail; Support: validasi kosong/length, alarm sesuai unit, sukses "Tiket berhasil dibuat", refresh lokal, storage ditolak memberi error.
- [ ] Profile: WIB/WITA/WIT memperbarui timestamp; notifikasi memengaruhi indikator; reset hanya key aplikasi (bukan storage aplikasi lain).
- [ ] Logout: batal mengembalikan fokus; konfirmasi → Anda telah keluar → Masuk kembali tanpa form login.
- [ ] Storage malformed/enum invalid kembali default tanpa crash; browser tanpa storage tetap usable.
- [ ] Console tidak error; Network tidak mengakses backend/stream; tidak ada tombol kontrol mesin aktif.
- [ ] Build preview: semua direct route refresh dengan SPA fallback; tidak mengklaim deployment selesai.

Backlog Overview dan keterbacaan ilustrasi 1550px tetap menunggu review terpisah, bukan revisi layout dalam milestone ini.

## Galeri Mesin — hasil CHECKPOINT 3B

- [x] Desktop 1440×1000 dan mobile 390×844: kartu/ilustrasi terlihat, lebar dokumen tidak melampaui viewport; panel mobile tepat 390 px tanpa overflow horizontal.
- [x] 20 kartu, 19 ilustrasi item teridentifikasi; semua lazy images termuat setelah scroll. Item 18 dan detailnya tidak memiliki aset rekaan.
- [x] Sidebar desktop dan drawer mobile memuat Galeri Mesin; Device → Galeri, Back dan Forward bekerja. Pergantian site tidak menyaring inventaris.
- [x] Refresh langsung `/machines` di Vite dev port 5179 dan preview port 5180 merender halaman; preview memakai respons cache 304 pada reload yang diperiksa.
- [x] Enter dan Space membuka detail; Tab berpindah antarkartu. Delapan siklus Tab dan Shift+Tab tetap di Dialog; Escape menutup dan mengembalikan fokus ke kartu pemicu.
- [x] PMG 10/11 memakai tag bersama TT-10/ST-10 dengan pemetaan belum ditentukan. P-201 tetap terlihat pada registry tanpa relasi mesin. LSL-19 tampil Digital tanpa gauge persen.
- [x] Console/error browser: tidak ada warning/error aplikasi pada sesi yang diperiksa. Preview tidak memuat resource eksternal atau fetch/XHR. Tidak ada koneksi telemetri nyata.
- [x] `test:copy`, `test:data`, `typecheck`, build outDir `/tmp` lulus. Warning CSS baseline `-: T;` dipertahankan.
- [x] Screenshot viewport galeri/detail desktop dan mobile diambil. Analisis model vision atas screenshot menunjukkan kartu terbaca tanpa overlap yang tampak; bukan persetujuan visual pengguna.
- [ ] Persetujuan visual pengguna atas Galeri Mesin.
- [ ] Konfigurasi dan uji fallback SPA pada hosting produksi; belum ada deployment.

