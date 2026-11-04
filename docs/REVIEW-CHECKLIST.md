# Checklist review manual M1.5–M5

Status: **belum diuji visual di browser oleh agent**. Checklist ini bukan hasil PASS visual.

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
