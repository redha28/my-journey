# 🦊 My Journey - Patch Index & Release Notes

Dokumentasi riwayat pembaruan, changelog, dan rilis versi untuk extension **My Journey** di Antigravity IDE & Visual Studio Code.

---

## 📑 Daftar Riwayat Versi (Patch Index)

| Versi | Tanggal Rilis | Tipe Rilis | Catatan Rilis |
| :--- | :--- | :--- | :--- |
| **[`v0.1.0`](./v0.1.0.md)** | `2026-08-28` | **Initial Release** | Rilis perdana: Timeline Jira, Kalender, Weekly Analytics, Profile, dan Generator Timesheet Excel Google Spreadsheet. |

---

## 📌 Ringkasan Rilis Terkini: [v0.1.0](./v0.1.0.md)

- **Timeline & 1-Klik Jira Copy**: Salin Judul, Deskripsi, dan Format Jira dengan 1 klik.
- **Git & Jira Key Auto-Detection**: Otomatis mengekstrak tiket Jira dari nama branch aktif.
- **Kalender Interaktif**: Grid bulanan, tanggal merah (Sabtu & Minggu), tombol Edit & Hapus task.
- **Weekly Bar Chart**: Visualisasi analitik mingguan task vs Merge Request.
- **Tab Profile & Settings**: Form konfigurasi data pekerja, organisasi, GPS office, dan penyimpanan lokal.
- **Timesheet Excel Google Spreadsheet (.xlsx)**:
  - Header Biru Cornflower (`#4A86E8`), Kuning Muda 3 (`#EAF1DD`), Abu-Abu Libur (`#D8D8D8`), border hitam tegas.
  - Aturan kehadiran: Rabu = WFH, Hari kerja lain = Office GPS.
  - Jam kerja acak realistis (Masuk: 07:30 - 08:15, Pulang: 16:50 - 17:30).
  - Format file: `nik_namalengkap_Role.xlsx`.

---

## 🛠️ Format Penambahan Patch Baru

Setiap kali merilis versi baru, buat file baru di folder ini:
`patch/v0.x.x.md` lalu tambahkan barisnya ke tabel di atas.
