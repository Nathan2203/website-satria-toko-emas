# Panduan Instalasi — Satria Toko Emas (Website Harga Emas)

Dokumen ini untuk IT Support: daftar LENGKAP semua yang perlu diinstall
untuk menjalankan project ini dari nol, di komputer Windows/Linux/macOS.

---

## 1. Yang Perlu Diinstall Manual (hanya SATU)

| Software | Versi | Sumber | Keterangan |
|----------|-------|--------|------------|
| **Node.js** | 18 LTS atau lebih baru (disarankan 20/22 LTS) | https://nodejs.org | Runtime backend. `npm` sudah otomatis ikut terinstall. |

Hanya itu. Tidak butuh database server (MySQL/PostgreSQL), tidak butuh
web server terpisah (Apache/Nginx/XAMPP), tidak butuh PHP/Python.
Data disimpan sebagai file JSON di folder `data/`.

**Cara cek Node.js sudah terinstall atau belum** — buka Command Prompt / terminal:
```
node --version
npm --version
```
Kalau keduanya menampilkan nomor versi (mis. `v20.11.0`), lanjut ke langkah 2.

---

## 2. Library Backend (otomatis via npm, TIDAK perlu download manual)

Semua library berikut sudah terdaftar di `package.json` dan akan terpasang
otomatis dengan satu perintah `npm install` (butuh koneksi internet sekali saja):

| Library | Versi | Fungsi |
|---------|-------|--------|
| express | ^4.19.2 | Framework web server / API |
| express-session | ^1.18.0 | Session login admin |
| multer | ^2.2.0 | Upload foto banner |

Frontend tidak perlu diinstall apa-apa — hanya HTML/CSS/JS biasa.
Satu-satunya library frontend adalah **Chart.js** (grafik harga) yang dimuat
langsung dari CDN di `public/index.html`, jadi butuh internet saat halaman
publik dibuka. *(Jika komputer display offline total, beritahu developer
agar Chart.js dibundel lokal.)*

---

## 3. Langkah Instalasi

**Cara cepat (Windows):** klik dua kali file `setup.bat` di folder project —
script ini mengecek Node.js lalu menjalankan `npm install` otomatis.

**Cara manual (semua OS):**
```
cd satria-toko-emas
npm install
npm start
```

Setelah jalan, buka di browser:
- Tampilan publik : http://localhost:3000
- Panel admin     : http://localhost:3000/admin  (password default: `admin123`)

---

## 4. Setelah Terinstall (opsional tapi disarankan)

- **Ganti password admin** untuk produksi — lihat bagian "Mengganti Password"
  di `README.md`.
- **Agar server selalu nyala** (auto-start setelah restart) — lihat bagian
  "Menjalankan Otomatis" di `README.md` (pm2 / NSSM / folder Startup).
- **Backup rutin**: cukup salin folder `data/` dan `public/uploads/`.

## 5. Fitur Opsional (TIDAK perlu diinstall kecuali diminta)

Auto-fetch harga emas via API (goldapi.io) — nonaktif secara default,
tidak butuh instalasi tambahan, hanya API key + kalibrasi. Lihat bagian
"(OPSIONAL) Auto-Fetch Harga Emas via API" di `README.md`.

---

**Ringkasan untuk IT Support:** install Node.js LTS → jalankan `setup.bat`
(atau `npm install`) → `npm start` → buka http://localhost:3000. Selesai.
