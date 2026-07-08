# Satria Toko Emas — Website Harga Emas Harian

Website tampilan harga emas harian untuk Satria Toko Emas, lengkap dengan panel
admin (CRUD harga, upload banner, grafik history). Backend Node.js + Express,
penyimpanan file JSON (tanpa database server).

## Fitur
- Tampilan harga emas real-time (auto-refresh tiap 30 detik)
- Banner/foto berpindah otomatis (rasio diseragamkan otomatis)
- Dioptimalkan untuk TV LANDSCAPE (banner kiri, harga kanan, font besar)
- Tetap responsif untuk layar portrait
- Tanggal & jam live (Bahasa Indonesia)
- Grafik history harga per kadar
- Panel admin: kelola harga, kadar, banner, & pengaturan
- (Opsional) auto-fetch harga emas via API — file terpisah, non-aktif default

## Persyaratan
- Node.js versi 18 atau lebih baru — https://nodejs.org (pilih versi LTS)

Daftar lengkap semua yang perlu diinstall (untuk handover ke IT Support)
ada di file **INSTALL.md** — cukup ikuti file itu dari nol sampai jalan.

## File Logo
Logo toko dibaca dari:
```
public/logo.png
```
File logo saat ini berupa foto (background abu-abu), dan CSS sudah
menyesuaikan: foto ditampilkan penuh di dalam bingkai ber-border emas,
proporsi dijaga otomatis (tidak akan gepeng/terpotong).

Jika nanti tersedia logo PNG dengan background TRANSPARAN (export dari file
vektor/PDF asli desainer), cukup timpa `public/logo.png` lalu kembalikan
`padding` pada selector `.logo-badge` di `public/styles.css` (petunjuknya
ada di komentar CSS tersebut) agar background maroon terlihat di sekeliling
logo.

## Install & Menjalankan
1. Install Node.js (sekali saja).
2. Buka folder project di terminal / Command Prompt.
3. Jalankan:
   ```
   npm install
   npm start
   ```
4. Buka di browser:
   - Tampilan publik : http://localhost:3000
   - Panel admin     : http://localhost:3000/admin

Password admin default: `admin123`

## Menampilkan di TV Toko (Landscape)
1. Hubungkan PC mini / laptop ke TV (HDMI).
2. Buka http://localhost:3000 di browser.
3. Tekan F11 untuk mode layar penuh.
Tampilan otomatis: banner di kiri, harga emas di kanan dengan font besar agar
terbaca dari jarak jauh. Ada breakpoint khusus untuk TV Full HD / 4K.

## Mengganti Password (disarankan untuk produksi)
Windows (Command Prompt):
```
set ADMIN_PASSWORD=passwordbaru
set SESSION_SECRET=kunci-rahasia-acak
npm start
```
Linux / macOS:
```
ADMIN_PASSWORD=passwordbaru SESSION_SECRET=kunci-rahasia-acak npm start
```

## Menjalankan Otomatis (selalu nyala)
```
npm install -g pm2
pm2 start server.js --name harga-emas
pm2 startup
pm2 save
```
(Windows alternatif: gunakan "NSSM" sebagai Windows Service, atau buat shortcut
`npm start` di folder Startup.)

## (OPSIONAL) Auto-Fetch Harga Emas via API
Fitur cadangan — aktifkan hanya jika client minta harga otomatis.
1. Daftar API harga emas (mis. https://www.goldapi.io) → dapatkan API key.
2. Set key: `set GOLD_API_KEY=key_anda` (Windows) atau sebagai env var.
3. KALIBRASI `config/autoPrice.config.js` (purity, markup, pembulatan)
   sesuai kebijakan harga riil toko. Harga toko emas ≠ harga spot dunia.
4. Jalankan: `npm run auto-update`
5. Untuk update harian otomatis, jadwalkan perintah di atas via cron
   (Linux/macOS) atau Task Scheduler (Windows).

Catatan: alur manual di panel admin TETAP bekerja tanpa fitur ini.

## Mengganti Logo / Brand
- Logo: timpa file `public/logo.png` (PNG transparan).
- Ukuran tampil logo diatur di `public/styles.css` pada selector `.brand-logo`
  (properti `max-width` per breakpoint) — tinggi selalu mengikuti otomatis
  agar proporsional.
- Warna brand diatur di bagian atas `public/styles.css` (variabel CSS
  `--maroon`, `--gold`, dll).

## Backup Data
Semua data tersimpan di:
- `data/db.json`        → harga, kadar, pengaturan, history
- `public/uploads/`     → file foto banner

Cukup salin kedua folder ini untuk backup; tempel kembali untuk restore.

## Struktur Project
```
server.js                    → backend (API + server)
config/autoPrice.config.js   → konfigurasi auto-fetch (opsional)
services/goldPriceService.js → logic auto-fetch (opsional)
scripts/updatePricesAuto.js  → runner auto-fetch (opsional)
public/index.html            → halaman tampilan publik
public/admin.html            → halaman panel admin
public/styles.css            → styling + warna brand
public/app.js                → logic tampilan publik
public/admin.js              → logic panel admin
public/logo.png              → logo asli client (PNG transparan)
data/db.json                 → database (otomatis dibuat)
```

## Catatan Pengembangan
- Rasio foto banner diseragamkan via CSS (object-fit: cover). Jika ingin
  benar-benar meng-crop file saat upload, tambahkan paket `sharp` di endpoint upload.
- Untuk skala lebih besar, JSON bisa diganti SQLite/PostgreSQL tanpa mengubah
  struktur frontend.
