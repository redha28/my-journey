# My Journey - Antigravity IDE Extension 🚀

**My Journey** adalah extension produktivitas & developer journal untuk Antigravity IDE. Extension ini membantu Anda mencatat perjalanan kerja harian berdasarkan **Merge Request (MR)**, melihat kalender aktivitas, memantau grafik analitik mingguan (**Weekly Bar Chart**), dan meng-export laporan **Daily Standup** dalam format Markdown dengan 1-klik.

---

## ✨ Fitur Utama

1. **📅 Kalender Aktivitas Interaktif**
   - Tampilan kalender bulanan dan mingguan dengan penanda dot aktivitas.
   - Badge penanda jumlah task dan Merge Request di setiap tanggal.
   - Klik tanggal untuk melihat atau menambahkan entri pada hari tersebut.

2. **📝 Input Task & Merge Request**
   - Input judul task, link Merge Request (GitLab/GitHub/Bitbucket), status MR (*Draft, In Review, Merged, Closed*).
   - Tag kategori (*Feature, Bugfix, Refactor, Review, Meeting, Docs, Testing*).
   - Auto-detect branch Git yang sedang aktif di workspace.
   - Durasi waktu pengerjaan dan checklist selesai.

3. **📊 Weekly Bar Chart Analytics**
   - Grafik batang interaktif distribusi harian (Senin s.d. Minggu).
   - Perbandingan **Tasks Completed** vs **Merge Requests**.
   - Kartu ringkasan: Total task mingguan, total MR, estimasi jam kerja, dan fokus kategori terbesar.
   - Navigasi antar minggu (minggu lalu, minggu ini, minggu depan).

4. **⏱️ Timeline Alur Kerja**
   - Feed kronologis pekerjaan harian yang rapi dan elegan.
   - Filter berdasarkan Tanggal Terpilih, Hanya MR, atau Semua Waktu.
   - Pencarian cepat (search bar) berdasarkan nama task, branch, atau nomor MR.
   - Tombol langsung untuk membuka Merge Request di browser.

5. **📋 1-Click Standup & Report Export**
   - Format **Daily Standup** (*Yesterday / Today / Blockers*).
   - Format **Weekly Summary** terkelompok berdasarkan kategori.
   - Format **Merge Requests Log Table**.
   - Tombol salin ke clipboard otomatis.

6. **🔒 Penyimpanan Lokal & Privasi**
   - Data otomatis tersimpan di `.myjourney/data.json` di dalam folder project Anda.

---

## 🛠️ Cara Menjalankan & Mengembangkan

### 1. Build Project
```bash
npm install
npm run build
```

### 2. Jalankan Extension di Antigravity IDE / VS Code
1. Tekan tombol `F5` pada keyboard di Antigravity IDE untuk membuka **Extension Development Host**.
2. Buka icon **"My Journey"** pada Activity Bar (sidebar kiri) atau jalankan command `My Journey: Open Full Dashboard` dari Command Palette (`Ctrl+Shift+P`).

---

## 📂 Struktur Project

```
├── package.json                   # Konfigurasi Extension
├── vite.config.ts                 # Bundler Webview React
├── src/
│   ├── extension.ts               # Entrypoint backend extension
│   ├── services/
│   │   ├── StorageService.ts      # Pengelola file .myjourney/data.json
│   │   └── GitService.ts          # Integrasi Git branch & repo
│   ├── providers/
│   │   └── JourneyWebviewProvider.ts # Provider Webview & Message Bridge
│   └── webview/                   # Frontend React + Tailwind UI
│       ├── App.tsx
│       ├── components/
│       │   ├── Calendar/          # Komponen Kalender
│       │   ├── Analytics/         # Weekly Bar Chart (Recharts)
│       │   ├── Timeline/          # Feed Timeline
│       │   ├── TaskForm/          # Modal Input Task & MR
│       │   └── ExportModal/       # Modal Export Standup
│       └── utils/                 # Helper date, category, vscode bridge
```
