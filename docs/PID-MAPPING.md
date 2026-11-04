# Pemetaan Overview ke draf P&ID Genset PLTS

## Sumber dan batas interpretasi

Sumber resmi untuk revisi prototype: `/run/media/alfan_ghofari/Data/Prototype monitoring plc/docs/reference/PID_Genset_PLTS.pdf`, disalin dengan izin dari `/home/alfan_ghofari/Downloads/PID_Genset_PLTS.pdf`. Sumber tidak dipindahkan atau diubah; SHA-256 keduanya: `323249c690a6b574ea29b88868381f6c48110783cdc3f125fe3dcf3a17a7b90a`.

Dokumen bertanggal 4 November 2026, 6 halaman, **draf konseptual, bukan untuk fabrikasi**. Dasar pemetaan adalah teks ringkasan (hal. 1), peran item (hal. 2), penjelasan penggerak/output (hal. 3), oli/ventilasi (hal. 4), dan daftar instrumen (hal. 5). Geometri dan simbol diagram PDF belum diverifikasi secara visual. UI bukan reproduksi tata letak, digital twin engineering, atau approval desain.

## Entitas dan kepastian

- Device: unit/container GEN-001 sampai GEN-004. Empat unit ini fleet simulasi, bukan bukti empat unit nyata dari PDF.
- Equipment: peralatan dalam device, memiliki `deviceId` dan `instanceId` (`GEN-001:motor`).
- Instrument: tag dalam lingkup device, misalnya `GEN-001:TT-02` berbeda dari `GEN-002:TT-02`.
- Template definisi dipakai ulang per unit; pembacaan selalu memakai device dan tag.
- `certainty`: `documented` → **Tercantum di draf**, `clarified` → **Keterangan rekan proyek**, `assumed` → **△ Asumsi**, `tbd` → **? TBD**. Ini bukan status operasi, kualitas telemetry, atau verifikasi engineering.
- `kind`: listrik solid, mekanis dash, belt dash-dot, sinyal titik. Kepastian hubungan ditulis terpisah; pola mekanis tidak berarti TBD. Tidak ada jenis `uncertain`.

## Komponen → UI

| Item / tag | Representasi | Kepastian / batasan |
| --- | --- | --- |
| 1 PLTS | Node sumber | Tercantum di draf; kapasitas belum pasti |
| 13 / VFD-12 | Kabinet driver | Isi kabinet asumsi; driver tercantum |
| 12 BLDC | Node penggerak | TT-12 berbeda dari motor 2 |
| 2 motor | Node awal deret poros | Detail kopling tidak ditetapkan |
| 3 / 6 | Motor 3 / Motor 6 | Keterangan rekan proyek; rating dan kopling TBD |
| 4 / 5 | Gearbox individual | Keterangan rekan proyek; rasio dan konfigurasi TBD |
| 7 | Alternator | Keterangan rekan proyek; PDF tetap menyebut asumsi; rating/kutub TBD |
| 8 / 9 | Gearbox individual setelah 7 | Keterangan rekan proyek; hubungan dan arah transfer TBD |
| CB-01 / 17 | Cabang listrik dari 7 → breaker → output | Bukan cabang dari 8–9; PM-01 pengukuran output |
| TK-19 / TK-20 / P-201 / PT-201 | Ringkasan oli & detail instrumen | P-201 belum dipetakan ke item 4/5/8/9 |
| M-301 / DMP-301 / TT-303 | Ringkasan ventilasi | Tidak mengklaim pendinginan di bawah suhu udara luar |
| PMG 10/11 / AVR-01 | Ringkasan terpisah | Fungsi eksitasi/daya bantu asumsi; tidak digambar sambungan tambahan |

Urutan utama: PLTS → kabinet 13/VFD-12 → BLDC 12 → Motor 2 → Motor 3 → Gearbox 4/5 → Motor 6 → Alternator 7. Gearbox 8/9 tetap di posisi konseptual setelah 7, tanpa arah daya dan tanpa detail sambungan. Cabang listrik tetap Alternator 7 → CB-01 → output 17, PM-01 hanya pengukuran.

## Keterangan rekan proyek dan ilustrasi

Identitas item 3 motor, 4/5 gearbox, 6 motor, 7 alternator, 8/9 gearbox berasal dari klarifikasi rekan proyek, bukan revisi PDF. `identitySources` dan `draftIdentity` menyimpan perbedaan asal identitas; `clarified` bukan klaim engineering terverifikasi. Identitas tidak menentukan rasio gearbox, kopling, rating/kutub alternator atau fungsi PMG. Hubungan mekanis tetap TBD terpisah dari identitas. Instruksi aktuator yang ditarik tidak diimplementasikan.

Tab default **Ilustrasi Mesin** menampilkan SVG 2.5D custom statis dengan label **Ilustrasi konseptual — bukan gambar OEM**. Tab **Diagram Sistem** memakai model dan detail peralatan yang sama. Hover/fokus memberi nama/item, klik/Enter/Space/tap membuka dialog, pilihan diberi outline. Tidak ada simulasi putaran. Area geser mempertahankan keterbacaan mobile. Warning hanya TT-02 berdasarkan alarm mock yang sudah ada. Shell, filter, gauge, trend, kamera dan null semantics dipertahankan.

## Instrumen → parameter

| Tag | Kunci telemetry / UI | Semantik |
| --- | --- | --- |
| ST-401 | `rpm` / gauge + trend | RPM poros, tidak menghitung Hz |
| PM-01 | `voltage`, `frequency` / gauge + trend | V dan Hz output 17; I/daya belum disimulasikan |
| TT-02 | `motorTemperature` / gauge + trend + warning | Motor item 2, 31 °C GEN-001 / 36 °C GEN-002 |
| TT-303 | `roomTemperature` / gauge + detail ventilasi | Mock suhu ruang lama tetap 27 °C |
| TT-12 | `bldcTemperature` / gauge + detail BLDC | null, Belum disimulasikan; tidak menyalin TT-02 |
| TT-03 | Detail motor 3 | Suhu item 3 dari draf; null, Belum disimulasikan |
| VT-401 | Detail gearbox 4/5 (cakupan bersama) | Getaran deret poros 4 dan 5; null, titik pemasangan/satuan TBD, bukan dua channel |
| VT-07 | Detail alternator 7 | Getaran alternator sesuai draf; null, channel/satuan belum dipastikan |
| TT-07 | Detail item 7 | Suhu belitan dan bearing alternator; tidak dipecah menjadi channel baru |
| LSL-19 / LSL-20 | Detail TK-19 / TK-20 | boolean/null digital low-level, bukan persen; belum disimulasikan |
| AT-301 | Detail ventilasi | RH atau titik embun belum dipilih, satuan belum final |
| PT-201 | Detail P-201 | Belum disimulasikan, tidak mengarang tekanan |
| VFD-12, CB-01, AVR-01, M-301, DMP-301 | Detail peralatan | Deskripsi/sinyal draf, tidak ada command atau nilai palsu |

Motor 6: **Instrumen belum dipetakan**, tanpa tag baru. ST-401 berada pada cakupan deret poros, bukan ditempel ke satu motor/gearbox. TT-03/VT-07/VT-401 diperiksa dari ekstraksi teks PDF, bukan verifikasi visual.

Parameter bearing/coolant generik dihapus karena tidak punya mapping benar. TT-07 tetap utuh sesuai deskripsi draf.

## Mock bukan spesifikasi engineering

Snapshot tetap 4 November 2026 pukul 14:00 WIB; trend sinus deterministik, setiap channel independen. Nilai 500 rpm / 380 V / 50 Hz adalah mock; tidak ada kalkulasi frekuensi dari RPM atau klaim daya aktual 4 MW. Ambang warning TT-02 35 °C tetap ilustrasi demo, bukan proteksi PLC. Range gauge adalah display range.

Kualitas data terpisah: `simulated`, `not-simulated`, `offline`, `no-current-data`. TT-12 null pada unit online → Belum disimulasikan; GEN-004 → Offline; parameter yang biasa disimulasikan namun kosong → No current data. Null tidak menggambar busur nilai/indikator di nol. Nol standby GEN-003 tetap nol yang disengaja. Semua pembacaan offline null dan tidak menampilkan riwayat palsu.

## Validasi dan keterbatasan

`npm run typecheck`, `npm run test:data`, `npm run build`. Test mencakup fleet/filter, mapping tag, identitas per device, data hilang, status digital, unit AT-301, TT-07, urutan/cabang flow, kepastian, dan RPM/Hz independen. Browser fungsional belum tersedia; responsivitas, scrollbar diagram, fokus dialog, serta viewport 390/768/1440 px perlu review manual. Diagram memakai ukuran node tetap dan area geser, bukan mengecilkan teks. Gauge memakai grid 1/2/3 kolom.

Tidak ada backend, PLC, perintah perangkat, deployment, atau Milestone 2.
