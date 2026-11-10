# Panduan Penggunaan GensetMonitor
## Prototype Monitoring PLC

**Versi dokumen:** 1.0

**Tanggal:** 7 November 2026

**Versi aplikasi:** 0.1.0 — frontend prototype

**Pembaca:** partner proyek, operator demonstrasi, dan reviewer.

> **Penting:** ini prototype antarmuka, bukan sistem produksi. Tidak ada koneksi PLC/MQTT, backend, autentikasi nyata, CCTV, atau pengiriman tiket ke server. Jangan memakai angka, indikator, animasi, atau target demo sebagai dasar keputusan keselamatan maupun operasi mesin.

## Daftar isi

1. Pengenalan dan mulai cepat
2. Navigasi, site, dan unit
3. Status dan kualitas data
4. Overview
5. Device dan inventaris mesin
6. Visualisasi Sistem
7. Pengaturan Perangkat
8. Tren & Riwayat
9. Data dan CSV
10. Camera View
11. News dan Support
12. Profile, penyimpanan, reset, dan Logout
13. Contoh demonstrasi dan pemecahan masalah
14. Glosarium dan ekspor PDF

## 1. Pengenalan dan mulai cepat

GensetMonitor memperagakan parameter generator, penelusuran mesin/instrumen, arsip historis, dan pengaturan manual lokal.

| Area | Tersedia | Batasan |
| --- | --- | --- |
| Monitoring | Snapshot dan arsip simulasi | Bukan pembacaan langsung PLC |
| Target/status manual | Nilai lokal dan riwayat perubahan | Tidak mengubah sensor, alarm, animasi, atau proteksi |
| Inventaris/diagram | Ilustrasi, fungsi, sumber, dan kepastian pemetaan | Bukan as-built atau inventaris aktual terverifikasi per unit |
| Kamera | Ilustrasi lokal | Bukan video/CCTV |
| Support | Tiket di browser | Tidak diteruskan ke petugas/server |
| Profile/Logout | Preferensi dan layar akhir sesi | Bukan akun/sesi server yang diamankan |

Snapshot berakhir pada **4 November 2026, 07.00 UTC / 14.00 WIB**, tidak mengikuti jam komputer. Arsip utama mencakup **90 hari**, interval **5 menit**. Periode dihitung dari akhir arsip, bukan waktu Anda membuka aplikasi.

Rentang gauge/input adalah rentang tampilan atau asumsi UI, **bukan rating alat/batas aman**. Ambang suhu motor **35 °C** hanya peringatan ilustratif, bukan proteksi PLC. RPM dan frekuensi adalah parameter terpisah, bukan model fisika tervalidasi.

### Mulai cepat

1. Buka alamat aplikasi dari tim proyek pada browser dengan JavaScript aktif.
2. Pilih **Semua Site** atau site tertentu di bagian atas.
3. Buka **Overview**, pilih generator, lalu periksa ID, status, waktu, dan parameter.
4. Buka **Device → Mesin & instrumen** untuk menelusuri mesin dan tag.
5. Gunakan **Tren & Riwayat** untuk grafik atau **Data** untuk tabel/CSV.
6. Jika mencoba target, tinjau unit dan nilai sebelum **Terapkan ke demo**.

**Hasil:** unit pilihan menjadi konteks halaman terkait; target lokal tidak mengubah monitoring. Tidak diperlukan login. Penyimpanan browser diperlukan agar konfigurasi bertahan setelah muat ulang. Status offline unit tidak berarti aplikasi mendukung penggunaan tanpa internet.

## 2. Navigasi, site, dan unit

Menu berada di kiri; pada layar kecil gunakan **Buka menu**. Menu profil kanan atas juga menyediakan Profile dan Logout.

| Menu | Tujuan |
| --- | --- |
| Overview | Seluruh pembacaan satu genset, alarm unit, tren utama/channel tambahan, media lokal |
| Device | Identitas, pencarian unit, inventaris mesin dan instrumen |
| Visualisasi | Diagram sistem lengkap dan subsistem |
| Data | Tabel telemetry, filter, CSV |
| Pengaturan Perangkat | Channel, target/status manual, gauge kustom, riwayat |
| Tren & Riwayat | Arsip dan perbandingan parameter |
| Camera View | Gambar referensi kamera dan thermal |
| News | Pengumuman global |
| Support | Tiket lokal |
| Profile | Preferensi dan reset |
| Logout | Layar akhir sesi demo |

Site membatasi daftar unit. Jika unit aktif tidak termasuk site baru, aplikasi memilih unit yang tersedia di site tersebut. Pemilihan unit pada halaman terkait memakai konteks bersama.

**Cakupan yang perlu dibedakan:**

- Lonceng mencakup seluruh unit pada site. Alarm dan aktivitas di Overview hanya mencakup genset aktif.
- News bersifat global. Daftar tiket dan gauge kustom mengikuti cakupan site.
- Formulir Support mengikuti unit aktif; mengganti unit mengosongkan judul, deskripsi, dan relasi alarm draf.
- Membuka detail kartu Device tidak otomatis memilih unit; gunakan **Gunakan unit ini**.
- Galeri diakses melalui **Device → Mesin & instrumen**, bukan menu mandiri. Bookmark lama `/machines` dialihkan ke tab tersebut.

## 3. Status dan kualitas data

| Label | Makna |
| --- | --- |
| Running | Beroperasi dalam snapshot; bukan konfirmasi semua komponen normal |
| Standby | Terhubung dalam kondisi siaga |
| Tidak diketahui | Status operasi belum diketahui |
| Offline | Tidak ada koneksi/pembacaan terkini; kondisi fisik tidak terkonfirmasi |
| Nilai terbaru | Nilai terbaru dataset simulasi, bukan bukti koneksi live |
| Belum ada data / Belum ada data terkini | Nilai belum tersedia, bukan nol |
| `—` / celah grafik | Nilai kosong/tidak tersedia |

Dataset berisi **4 unit di 2 site**: GEN-001 Site A Running nominal; GEN-002 Site B Running dengan contoh peringatan suhu; GEN-003 Site A Standby; GEN-004 Site B Offline dengan arsip utama kosong.

Nol RPM/tegangan/frekuensi GEN-003 disengaja. Jangan mengganti nilai kosong dengan nol. Offline tidak menghapus arsip yang tersedia secara umum, walaupun GEN-004 sengaja menguji arsip kosong. Status unit tidak menetapkan status setiap komponen. Digital berarti aktif/tidak aktif, bukan persen.

Label Terdokumentasi, Diklarifikasi, Asumsi, TBD/Belum ditentukan, atau Tercantum di draf membahas sumber definisi/pemetaan, bukan kesehatan mesin.

## 4. Overview

**Tujuan:** memantau seluruh pembacaan satu genset dan histori dalam dashboard padat. Layout ditargetkan tanpa scroll pada viewport 1920×1080, zoom 100%, serta ruang halaman 1920×960 dan 1920×900 setelah toolbar browser. Pada tinggi 900–999 px, jarak kartu dan tinggi grafik diringkas; thumbnail tetap 110 px. Layar lebih kecil boleh scroll.

1. Pilih site di header aplikasi dan **Generator** di Overview.
2. Periksa 45 pembacaan dalam kelompok Output & PLTS, Penggerak & alternator, Pelumasan, Ventilasi & lingkungan, serta Status & keamanan. Tag bersama ditampilkan sekali. Nilai kosong ditampilkan sebagai —, bukan nol.
   Indikator di kartu mengikuti jenis pembacaan: tegangan/arus/daya/frekuensi memakai bar, suhu dan RPM memakai mini gauge berjarum, getaran/tekanan/beda tekanan memakai bullet bar, serta RH/posisi damper memakai progress persentase. Digital memakai lampu dan label makna sinyal, bukan persentase isi tangki. Data kosong/offline tidak menampilkan isian atau jarum nilai; angka tetap —. Rentang indikator hanya rentang tampilan, bukan batas aman mesin.
3. Klik **Detail / Atur** untuk membaca fungsi, kualitas data, asumsi, dan pengaturan lokal. Target tidak mengubah telemetry atau mengirim perintah PLC.
4. Klik jumlah alarm untuk membuka alarm dan 20 aktivitas terbaru genset aktif. Notifikasi seluruh site tetap tersedia pada lonceng aplikasi.
5. Periksa enam grafik **Tren & Riwayat**, pilih periode 1 jam–90 hari, dan arahkan pointer untuk membaca nilai. Grafik channel tambahan menyediakan pilihan seluruh channel tambahan. Analog memakai line chart; digital memakai step chart 0/1 dengan label Tidak aktif/Aktif dan tooltip sesuai arti sinyal. Perubahan digital dan batas celah tetap dipertahankan saat penyederhanaan grafik; jarak horizontal mengikuti timestamp. Warna enam parameter utama konsisten dengan halaman histori lengkap.
6. Buka histori lengkap untuk analisis lanjutan atau ekspor; gunakan **Visualisasi sistem** untuk diagram besar.
7. Klik panel media untuk memperbesar ilustrasi lokal statis, bukan CCTV.

**Hasil:** pembacaan, grafik, alarm, aktivitas, dan media mengikuti genset aktif. Snapshot dataset dan last seen unit ditampilkan terpisah.

**Batasan:** alarm tidak diakui, dihapus, atau direset melalui Overview. Grafik adalah arsip simulasi interval 5 menit; celah tidak diisi nol. Rentang indikator bukan batas proteksi. Status digital bukan penilaian kesehatan seluruh komponen. Kualitas data dan label lengkap tersedia melalui Detail / Atur.

## 5. Device dan inventaris mesin

### Ringkasan unit

**Tujuan:** mencari dan memeriksa identitas unit.

1. Buka **Device → Ringkasan**.
2. Cari nama, ID, atau lokasi; pilih filter status dan tampilan kartu/daftar.
3. Klik unit untuk membuka panel detail.
4. Pilih bagian **Ringkasan**, **Perangkat**, atau **Instrumen** untuk membaca identitas, koneksi, fungsi, sumber, dan pembacaan.
5. Gunakan **Gunakan unit ini** untuk memilih unit aktif. **Buka pengaturan** memilih unit tersebut dan membuka Pengaturan Perangkat.
6. **Reset filter** hanya membersihkan pencarian/filter status, bukan data lokal.

**Hasil:** detail unit terbuka; unit offline memperlihatkan waktu terakhir terlihat (*last seen*), bukan pembaruan terkini.

### Mesin & instrumen

**Tujuan:** menelusuri katalog dan relasi tag.

1. Pilih unit lalu tab **Mesin & instrumen**.
2. Cari mesin, item, ID, atau tag; gunakan filter jenis jika diperlukan.
3. Klik kartu untuk melihat ilustrasi, fungsi, kepastian inventaris, sumber, catatan, dan instrumen terkait.
4. Buka **Sumber dan catatan** pada instrumen.
5. Klik **Lihat histori** pada pembacaan jika tersedia.
6. Periksa **Instrumen tanpa relasi mesin** untuk tag yang hubungannya belum ditentukan.

**Hasil:** definisi katalog disertai pembacaan unit jika pemetaannya tersedia.

**Batasan:** katalog adalah referensi bersama dan ilustrasi generik, bukan foto alat/inventaris as-built per unit. Definisi tag tidak menjamin pembacaan sudah dipetakan. Tag bersama/grouped tidak berarti sensor individual untuk setiap komponen. Status operasi mesin individual belum dipetakan.

## 6. Visualisasi Sistem

**Tujuan:** memahami susunan konseptual sistem/subsistem.

1. Buka **Visualisasi**, pilih unit.
2. Pilih **Sistem lengkap**, **Penggerak & Output**, **Oli Pelumas**, **Ventilasi**, atau **Keamanan**.
3. Klik komponen untuk detail. Pada detail katalog, gunakan **Lihat di Device** jika tersedia.
4. Baca fungsi, sumber, kepastian pemetaan, dan nilai. Geser diagram horizontal jika layar sempit.

**Hasil:** diagram/detail mengikuti konteks unit.

**Batasan:** baca saja, tanpa kendali jarak jauh. Posisi dan hubungan konseptual, bukan prosedur keselamatan/as-built. Gerak ilustrasi mengikuti status unit, bukan feedback operasi masing-masing komponen. Detail katalog yang dibuka dari Visualisasi dapat hanya berisi definisi tanpa pembacaan; gunakan **Lihat di Device** untuk meninjau instrumen pada unit aktif. Data yang belum tersedia tidak diberi angka rekaan.

Navigasi keyboard: Tab untuk berpindah kontrol; Enter/Spasi untuk mengaktifkan kontrol yang mendukungnya. Tab subsistem mendukung panah kiri/kanan serta Home/End. Tutup dialog memakai tombol tutup atau Escape.

## 7. Pengaturan Perangkat

> Seluruh perubahan hanya lokal. Tidak ada command PLC, bypass, reset proteksi, atau perubahan sensor. Pesan **Diterapkan pada demo lokal** bukan konfirmasi mesin menerima perintah.

### Perangkat & kemampuan

**Tujuan:** membaca channel dan mencoba target/status manual terpisah dari monitoring.

1. Pilih **Unit aktif → Perangkat & kemampuan**.
2. Cari perangkat, ID, atau tag.
3. Baca kartu channel: numerik memakai gauge, digital memakai indikator. Instrumen bersama ditampilkan sekali dengan nama perangkat terkait.
4. Klik **Detail** untuk sinyal/jenis, channel, satuan, kualitas, fungsi, catatan, dan asumsi rentang.
5. Klik **Atur target** atau **Atur status manual** pada channel yang menyediakan kontrol.
6. Masukkan angka sesuai rentang/kelipatan, atau pilih **Aktif / true** maupun **Tidak aktif / false**.
7. Klik **Tinjau perubahan**; periksa unit, tag, nilai lama, dan nilai baru.
8. Pilih **Terapkan ke demo**, **Kembali** untuk koreksi, atau **Batal**.

**Hasil:** nilai manual lokal dan riwayat berubah, monitoring tetap sama. Tombol penerapan tidak aktif jika nilai tidak valid, belum dipilih, sama dengan nilai tersimpan, atau unit offline.

| Target parameter utama | Rentang UI | Kelipatan |
| --- | --- | --- |
| RPM | 0–1000 rpm | 1 |
| Tegangan | 0–500 V | 1 |
| Frekuensi | 0–60 Hz | 0,1 |
| Suhu motor | 0–60 °C | 0,1 |
| Suhu ruang | 0–50 °C | 0,1 |
| Suhu BLDC | 0–60 °C | 0,1 |

Channel numerik tambahan menerima 0 hingga maksimum asumsi pada dialog, kelipatan **0,01**. **Bukan batas aman/rating alat.** Target suhu tidak menurunkan suhu motor; aktuator/tag writable belum dipetakan.

Perangkat tanpa instrumen terpetakan tidak diberi pengukuran numerik. Pengaturan kondisi skenario tidak tersedia pada kartu channel saat ini; riwayat skenario lama tetap tersedia.

### Gauge kustom

**Tujuan:** menambah tampilan parameter utama, bukan sensor baru.

1. Buka **Gauge kustom → Tambah widget**.
2. Pilih unit, satu dari enam parameter numerik, dan judul opsional maksimal 120 karakter.
3. Klik **Tambah**. Judul kosong memakai nama parameter.
4. Untuk menghapus, klik ikon tempat sampah pada widget terkait.

**Hasil:** widget tampil untuk unit dalam cakupan site, bukan hanya unit aktif; judul kustom berada di bawah kartu.

**Batasan:** maksimal **50 widget kustom seluruh site**. Kartu bawaan tidak dihitung. Penghapusan langsung berlaku tanpa konfirmasi/undo. Konfigurasi tersimpan lokal bila browser mengizinkan.

### Riwayat

Tab **Riwayat** memperlihatkan perubahan target/status channel, skenario perangkat lama, dan target parameter utama. Setiap kelompok menyimpan maksimal **100 perubahan terbaru secara keseluruhan**, lalu difilter berdasarkan unit aktif. Ini bukan histori sensor atau audit operasional dan tidak masuk grafik/CSV telemetry.

## 8. Tren & Riwayat

**Tujuan:** membaca arsip dan membandingkan parameter.

1. Pilih unit, lalu **Grafik per parameter** atau **Bandingkan dua parameter**.
2. Pilih **1H**, **6H**, **24H**, **7D**, atau **Semua tersedia** (hingga 90 hari).
3. Klik parameter untuk memilih/melepas seri. Perbandingan maksimal dua parameter dengan satuan/sumbu masing-masing.
4. Arahkan pointer untuk membaca waktu, tag, nilai, dan satuan.
5. Geser pembatas di bawah grafik (*Brush*) untuk memilih area waktu.
6. Baca minimum, maksimum, rata-rata, dan jumlah sampel valid yang mengikuti area terpilih.

**Hasil:** arsip mengikuti unit/parameter/periode. Tanpa parameter, aplikasi meminta pilihan; arsip kosong menampilkan pesan belum ada data historis.

**Batasan:** celah tidak diisi nol atau nilai monitoring saat ini. Periode panjang mengurangi titik tampilan sambil mempertahankan ekstrem/celah; statistik memakai sampel mentah. Dua sumbu tidak membuktikan hubungan sebab-akibat. Target/status manual tidak termasuk grafik.

Panel **Grafik kapabilitas tambahan** menyediakan satu channel tambahan, rentang hingga 90 hari, dan **Ekspor CSV kapabilitas**. Ini simulasi eksplisit dengan satuan/rentang asumsi. Digital pada grafik: **1 = aktif/true**, **0 = tidak aktif/false**.

## 9. Data dan CSV

**Tujuan:** memeriksa tabel dan mengunduh sampel sesuai filter.

1. Buka **Data**; pilih **Semua unit** atau satu unit dalam site terpilih.
2. Pilih semua parameter atau satu parameter utama.
3. Pilih **1 jam**, **3 jam**, **6 jam**, **24 jam**, **7 hari**, atau **90 hari**.
4. Periksa waktu, unit, tag, parameter, nilai, satuan, dan kualitas. **Sebelumnya/Berikutnya** berpindah halaman, 50 baris per halaman.
5. Klik **Ekspor CSV**, tunggu penyiapan selesai.

**Hasil:** `genset-telemetry-prototype.csv` memuat seluruh hasil filter, **bukan hanya halaman aktif**. Kolom ekspor: waktu, unit, tag, parameter, nilai, satuan, kualitas. Timestamp CSV memakai **ISO UTC**, sedangkan tampilan mengikuti preferensi zona waktu. Nilai kosong menjadi sel kosong.

**Batasan:** maksimal **250.000 baris per berkas**. Jika ditolak/gagal, persempit unit, parameter, atau rentang. Ekspor memakai memori browser, bukan layanan server.

Panel **Data kapabilitas tambahan** mengikuti **unit aktif**, bukan pilihan Semua unit tabel utama. Pilih channel dan rentangnya sendiri, lalu **Ekspor CSV kapabilitas** untuk `genset-capability-demo.csv`, termasuk identitas channel, kualitas, dan asumsi. Filter/ekspor panel tambahan terpisah dari tabel utama. Target/status manual tidak termasuk kedua ekspor.

## 10. Camera View

**Tujuan:** mencoba layout dan ketersediaan media.

1. Pilih unit pada **Camera View**.
2. Pilih 1, 2, atau 4 kolom; jumlah kolom menyesuaikan lebar layar.
3. Klik perbesar pada kamera, lalu tutup dialog untuk kembali.

**Hasil:** dua gambar kamera genset dan satu citra thermal referensi sama seperti Overview dan preview Pengaturan Perangkat. Gambar tetap tersedia saat unit offline, bukan live CCTV dan bukan kondisi aktual unit. Angka pada citra thermal bukan telemetry aplikasi. Layout tersimpan lokal bila tersedia. Jika gambar gagal dimuat, pesan kegagalan menggantikan gambar.

**Batasan:** bukan streaming, rekaman, atau kontrol CCTV. Media statis tidak menunjukkan kondisi lokasi saat ini.

## 11. News dan Support

### News

**Tujuan:** membaca contoh pengumuman.

1. Pilih Semua atau kategori operasional, pemeliharaan, keselamatan, atau umum.
2. Klik pengumuman untuk isi dan waktunya.
3. Gunakan Sebelumnya/Berikutnya, 20 item per halaman.

**Hasil:** daftar mengikuti kategori. **Batasan:** dataset global, bukan berita langsung server; tidak difilter site/unit.

### Support

**Tujuan:** mencatat permintaan dukungan lokal.

1. Pastikan unit benar sebelum mengisi draf.
2. Isi **Judul**, **Kategori**, dan **Deskripsi**.
3. Pilih **Terkait alarm** jika perlu; opsi hanya untuk unit tersebut.
4. Klik **Buat tiket**, lalu periksa daftar.

**Validasi:** judul/deskripsi wajib berisi teks; judul maksimal **120 karakter**, deskripsi **2000 karakter**. Maksimal **200 tiket keseluruhan**, termasuk seed awal. Batas tercapai menolak tiket baru tanpa menghapus tiket lama.

**Hasil:** tiket baru berstatus Terbuka muncul. Daftar mengikuti site, terbaru lebih dahulu, 20 tiket per halaman.

**Batasan:** tidak dikirim ke petugas/server; gunakan kanal resmi proyek untuk kebutuhan nyata. UI belum menyediakan edit, hapus, atau penyelesaian tiket. Mengganti unit mengosongkan draf judul/deskripsi/relasi alarm. Jangan isi informasi rahasia/pribadi. Bila penyimpanan gagal, tiket hanya tersedia selama sesi dan peringatan ditampilkan.

## 12. Profile, penyimpanan, reset, dan Logout

### Preferensi

1. Buka **Profile**.
2. Pilih **Asia/Jakarta (WIB)**, **Asia/Makassar (WITA)**, atau **Asia/Jayapura (WIT)**.
3. Atur **Notifikasi aktif**, lalu periksa pesan penyimpanan.

**Hasil:** format waktu mengikuti preferensi. Checkbox notifikasi mengatur indikator jumlah pada lonceng; daftar alarm tetap dapat dibuka.

**Batasan:** bukan push notification/SMS/email atau pengaturan PLC. Alex/Operator adalah profil demo, bukan akun terautentikasi.

### Penyimpanan lokal

Pilihan site/unit, preferensi, layout kamera, widget, tiket, target/status manual, skenario lama, dan riwayat disimpan melalui `localStorage` aplikasi.

- Gunakan browser, profil browser, dan alamat aplikasi yang sama agar data lokal tetap tersedia.
- Tidak ada sinkronisasi ke perangkat/browser/alamat lain. Jangan mengandalkan sinkronisasi antartab sebagai alur operasional.
- Penghapusan data situs atau berakhirnya penyimpanan privat dapat menghilangkan konfigurasi.
- Jika storage ditolak/penuh, banyak perubahan hanya bertahan selama sesi. Preferensi Profile yang gagal disimpan dikembalikan ke nilai sebelumnya.
- Arsip telemetry berasal dari dataset, bukan rekaman PLC oleh browser. CSV **bukan backup konfigurasi yang dapat diimpor kembali**.

### Kembalikan pengaturan awal

> **Tidak dapat dibatalkan.** Jangan reset sebagai langkah pertama mengatasi filter/data kosong.

1. Catat informasi lokal yang masih dibutuhkan. CSV telemetry tidak mencadangkan tiket, widget, target, atau riwayat.
2. Buka **Profile → Kembalikan pengaturan awal**.
3. Pilih **Batal** untuk mempertahankan data atau **Ya, kembalikan** untuk reset.
4. Setelah berhasil, halaman dimuat ulang dan data awal digunakan kembali.

**Dihapus/dikembalikan:** site/unit, preferensi, layout kamera, widget, tiket lokal, target/status manual, skenario lama, dan riwayat. Seed awal dapat memuat tiket/widget contoh: reset tidak berarti semua daftar kosong.

**Tidak berubah:** dataset telemetry, kondisi fisik mesin, data aplikasi lain. Hanya key GensetMonitor dihapus. Jika reset gagal, sebagian key mungkin sudah terhapus; baca pesan dan periksa izin storage sebelum mencoba lagi.

### Logout

1. Buka **Logout → Keluar**.
2. Pilih **Batal** atau **Ya, keluar**.
3. Pada layar **Anda telah keluar**, klik **Masuk kembali** untuk kembali ke Overview.

**Batasan:** hanya perubahan tampilan; tidak mengakhiri sesi server, mengunci aplikasi, atau menghapus data lokal. Jangan menganggap Logout melindungi informasi di komputer bersama.

## 13. Contoh demonstrasi dan pemecahan masalah

### Contoh alur

**Peringatan suhu:** pilih Site B/GEN-002 di Overview; periksa suhu motor 36 °C dan alarm ilustratif di atas 35 °C. Buka Tren & Riwayat, pilih suhu motor/24H, periksa waktu dan ekstrem. Catat tiket lokal bila perlu; tindak lanjut nyata tetap melalui kanal resmi. Ini bukan prosedur penanganan overtemperature.

**Target lokal:** pilih GEN-001, buka Pengaturan Perangkat, cari RPM, catat monitoring. Atur target 520 rpm jika berbeda dari target tersimpan, tinjau, terapkan, lalu periksa Riwayat. Kembali ke Overview: RPM tetap dari snapshot, bukan target 520. Tidak ada perintah mesin.

**Offline dan ekspor:** pilih GEN-004 untuk Offline, last seen, nilai kosong, dan kontrol nonaktif. Periksa contoh arsip utama kosong. Beralih ke GEN-001; di Data pilih satu unit, satu parameter, 6 jam, lalu ekspor dan cocokkan ID/tag/satuan/timestamp UTC.

### Pemecahan masalah

| Gejala | Tindakan/penjelasan |
| --- | --- |
| Unit/mesin tidak muncul | Periksa site, pencarian, status/jenis; gunakan Semua Site atau Reset filter |
| Nilai kosong/grafik kosong | Periksa unit, parameter, rentang, kualitas, dan pemetaan; GEN-004 sengaja kosong, bukan nol |
| Waktu tidak maju | Snapshot tetap 4 November 2026; bukan live |
| Target/status tidak dapat diterapkan | Periksa offline, rentang/kelipatan, pilihan digital, dan nilai harus berbeda |
| Target berubah, gauge tidak | Benar: target lokal tidak mengubah telemetry |
| Digital 0/1 | False/true, bukan persen |
| Widget hilang/tidak bisa ditambah | Periksa site; batas keseluruhan 50, bukan per unit |
| CSV gagal/ditolak | Persempit filter; batas 250.000 baris, periksa izin unduh/memori |
| Kamera kosong | Periksa pemuatan media lokal; gambar referensi bukan CCTV dan tidak mengikuti status online unit |
| Tiket tidak diterima petugas | Tidak dikirim server; hubungi kanal resmi |
| Tiket gagal dibuat | Periksa kolom wajib, 120/2000 karakter, batas 200 tiket, dan storage |
| Perubahan hilang | Periksa browser/profil/alamat yang sama, mode privat, izin/data situs |
| Alarm bukan milik unit aktif | Notifikasi mencakup site; klik alarm untuk memilih unit terkait |
| Logout tidak mengunci | Tidak ada autentikasi nyata |

Saat melapor, catat halaman, site, unit, tag/channel, filter/rentang, langkah reproduksi, pesan error, browser, dan screenshot bila aman. Jangan reset sebelum mencatat informasi.

## 14. Glosarium dan ekspor PDF

| Istilah | Arti |
| --- | --- |
| Site | Kelompok lokasi unit |
| Unit/device | Generator dalam konteks pilihan |
| Equipment | Komponen/peralatan konseptual |
| Tag/instrumen | Identitas sensor/sinyal, misalnya PM-01 |
| Channel | Satu nilai dalam instrumen; satu tag bisa multichannel |
| Telemetry | Nilai monitoring, di sini simulasi |
| Snapshot | Kondisi dataset pada waktu tetap |
| Target manual demo | Nilai lokal terpisah dari sensor |
| Boolean/digital | True/false; bisa kosong jika tidak tersedia |
| Last seen | Waktu terakhir unit terlihat pada dataset |
| Brush | Pembatas area waktu di bawah grafik |
| CSV | Berkas tabel teks untuk spreadsheet |
| TBD | Belum ditentukan/dikonfirmasi |

### Konsistensi indikator antarhalaman

Overview, Pengaturan Perangkat (termasuk widget kustom), pembacaan Device, dan dialog Visualisasi menggunakan aturan indikator yang sama: listrik berupa bar, suhu/RPM berupa gauge jarum, tekanan/getaran berupa bullet bar, RH/posisi damper berupa progress persentase, dan sinyal digital berupa lampu dengan label sesuai sinyal. Ukuran indikator mengikuti ruang halaman; susunan tiap halaman tidak disamakan dengan Overview.

Data kosong atau offline tetap **—**, tanpa isian nilai atau jarum. Channel boolean tetap digital meskipun jenis instrumen belum ditentukan. Rentang indikator adalah rentang tampilan, bukan batas aman atau proteksi PLC. Peringatan suhu motor tetap **>35 °C**.

Tabel Data menampilkan label digital seperti “Tidak rendah”, “Berjalan”, atau “Tertutup”; CSV tetap menyimpan boolean mentah `true`/`false`. Tren & Riwayat mempertahankan line chart analog dan step chart digital 0/1, dengan tooltip tanggal lengkap dan label sinyal. Histori arsip tidak dihapus hanya karena unit saat ini offline.

### Ekspor PDF untuk partner

1. Render Markdown ini dengan editor yang mendukung ekspor PDF, atau ekspor HTML lalu cetak ke PDF melalui browser.
2. Pilih A4 portrait, margin cukup, dan skala yang menjaga tabel terbaca.
3. Periksa pemisahan halaman, tabel, nomor halaman, judul, versi, dan tanggal sebelum membagikan.
4. Contoh nama: `Panduan-GensetMonitor-v1.0.pdf`.

Tidak ada ketergantungan gambar/tautan eksternal. Screenshot belum disertakan karena belum ada tangkapan UI terkini yang diverifikasi. Jika ditambahkan kemudian, gunakan build yang sama dan hindari data sensitif.

Panduan disusun berdasarkan implementasi frontend pada tanggal dokumen, bukan hasil uji operasional mesin. Perubahan menu, dataset, kontrol, backend, atau storage memerlukan pembaruan panduan. Markdown/PDF menjadi acuan lengkap partner; bantuan singkat di aplikasi dapat ditambahkan kemudian tanpa menggandakan seluruh isi.


## Mode terang dan night mode

Gunakan toggle **Night mode** (ikon bulan/matahari) di header untuk mengganti tema seluruh halaman. Toggle tersedia pada desktop dan mobile serta dapat dioperasikan dengan keyboard. Tema awal adalah terang.

Night mode memakai palet Deep Navy, Slate, dan Electric Blue. Panel, tabel, form, grafik, gauge, dialog, serta menu mengikuti tema; foto kamera, thermal, dan aset gambar mesin mempertahankan warna aslinya. Tema tidak mengubah nilai sensor, status, ambang peringatan, atau data historis.

Pilihan disimpan di browser dan disinkronkan antar-tab browser. Jika penyimpanan gagal, perubahan tetap tersedia selama sesi dan aplikasi menampilkan pemberitahuan. **Kembalikan pengaturan awal** pada Profile menghapus preferensi tema dan mengembalikan mode terang.
