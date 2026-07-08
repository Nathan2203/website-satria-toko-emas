# Panduan Penggunaan — Website Harga Emas Satria Toko Emas

Dokumen ini untuk pemilik toko / staf / IT Support yang akan **mengoperasikan**
website sehari-hari (bukan panduan instalasi). Jika website belum pernah
diinstal sama sekali, lihat dulu file `INSTALL.md`.

Tidak perlu kemampuan teknis untuk mengikuti panduan ini — cukup ikuti
langkah demi langkah.

---

## 1. Menjalankan & Menghentikan Website

### Cara Menjalankan
1. Buka folder project **satria-toko-emas**.
2. Klik dua kali file **`start.bat`**.
3. Sebuah jendela hitam (Command Prompt) akan terbuka dan menampilkan tulisan
   seperti ini:
   ```
   Satria Toko Emas — Harga Emas running:
    Display : http://localhost:3000
    Admin   : http://localhost:3000/admin
   ```
4. Website sudah berjalan. **Biarkan jendela hitam ini tetap terbuka** —
   boleh diminimize, tapi jangan ditutup.

### Cara Menghentikan
- Tutup jendela hitam (Command Prompt) tersebut, atau tekan tombol apa saja
  lalu Enter di dalam jendela itu jika diminta.
- Menutup jendela = website berhenti / tidak bisa diakses lagi.
- **Semua data yang sudah disimpan (harga, foto banner) TIDAK hilang**
  meskipun jendela ditutup. Data baru hilang hanya jika folder project-nya
  sendiri dihapus.

### Menjalankan Otomatis Setiap Komputer Menyala
Kalau komputer ini dipakai khusus untuk menampilkan harga emas (misalnya
komputer mini yang tersambung ke TV toko), sebaiknya `start.bat` dijalankan
otomatis setiap kali komputer dinyalakan, supaya tidak perlu klik manual
tiap hari. Minta bantuan IT Support untuk membuat shortcut `start.bat` di
folder **Startup** Windows (Search Windows → ketik "Startup" → buka folder
→ salin shortcut `start.bat` ke sana).

---

## 2. Melihat Tampilan Publik (Banner & Harga Emas)

Tampilan ini yang akan dilihat pelanggan di toko (mis. di layar TV).

1. Pastikan website sudah dijalankan (lihat bagian 1).
2. Buka browser apa saja (Chrome, Edge, dll).
3. Ketik di address bar: **`http://localhost:3000`** lalu tekan Enter.
4. Tampilan yang muncul:
   - Foto/banner toko yang berganti otomatis.
   - Tabel harga emas per kadar (Harga Beli & Harga Jual).
   - Tanggal dan jam saat ini.

### Menampilkan di TV Toko (Layar Penuh)
1. Sambungkan komputer ke TV lewat kabel HDMI.
2. Buka `http://localhost:3000` di browser pada layar TV tersebut.
3. Tekan tombol **F11** di keyboard untuk masuk mode layar penuh (full
   screen). Tekan F11 sekali lagi untuk keluar dari mode ini.
4. Layout otomatis menyesuaikan: kalau layar dalam posisi mendatar
   (landscape/TV), foto akan tampil di kiri dan harga di kanan dengan
   huruf besar agar mudah dibaca dari jarak jauh.

---

## 3. Mengelola Harga Emas & Banner (Panel Admin)

Semua perubahan (harga, kadar, foto banner, pengaturan) dilakukan lewat
**Panel Admin**, yang terpisah dari tampilan publik dan memerlukan password.

### Masuk ke Panel Admin
1. Buka browser, ketik: **`http://localhost:3000/admin`**
2. Masukkan password admin (default: **`admin123`**, lihat bagian 4 untuk
   menggantinya).
3. Klik tombol **"Masuk"**.

### A. Menambah / Mengubah Harga Emas
1. Di dashboard admin, cari kartu **"Harga Emas Hari Ini"**.
2. Isi atau ubah angka pada kolom **Harga Beli** dan **Harga Jual** untuk
   tiap kadar (6K, 8K, 9K, 16K, 17K, dst). Cukup ketik angka penuh tanpa
   titik, contoh: `350000` (bukan `350.000`).
3. Setelah semua angka diisi, klik tombol **"Simpan Harga"**.
4. Akan muncul tulisan **"Tersimpan ✓"** sebagai tanda berhasil.
5. Harga baru langsung tampil di halaman publik (refresh otomatis dalam
   30 detik, atau tekan F5 di halaman publik untuk langsung melihatnya).

> **Catatan:** Setiap kali "Simpan Harga" diklik, sistem otomatis mencatat
> harga tersebut ke riwayat (untuk keperluan grafik di bagian 5). Boleh
> disimpan lebih dari sekali dalam sehari — misalnya kalau harga emas
> berubah pagi dan sore, simpan dua kali, keduanya akan tercatat.

### B. Menambah / Menghapus Kadar Emas
- **Menambah kadar baru** (mis. 18K, 20K): ketik nama kadar di kolom
  **"Tambah kadar (mis. 18K)"** → klik **"+ Tambah"** → isi harganya →
  klik **"Simpan Harga"**.
- **Menghapus kadar**: klik tombol **×** (merah) di baris kadar yang mau
  dihapus, lalu klik **"Simpan Harga"**.

### C. Menambah Foto / Banner
1. Cari kartu **"Foto / Banner"**.
2. Klik **"Choose File"** (atau "Pilih File") → pilih foto dari komputer.
3. Klik tombol **"Upload"**.
4. Foto akan langsung muncul di daftar foto dan otomatis tampil di halaman
   publik (ikut berputar bergantian dengan foto lain, jika ada lebih dari
   satu).

Tips foto:
- Gunakan foto beresolusi cukup besar (disarankan lebar minimal 1000
  piksel) supaya tetap tajam saat ditampilkan di layar besar seperti TV.
- Ukuran file foto maksimal **8 MB** per foto. Jika lebih besar, sistem
  akan menampilkan pesan peringatan dan foto tidak akan terupload —
  kompres dulu foto tersebut sebelum diupload ulang.
- Tidak ada batas jumlah foto yang bisa diupload. Namun jika foto terlalu
  banyak, tiap foto akan tampil sangat singkat sebelum berganti ke foto
  berikutnya — sesuaikan jumlah foto dengan kecepatan pergantian (lihat
  bagian D).

### D. Menghapus Foto / Banner
- Di kartu **"Foto / Banner"**, klik tombol **"Hapus"** pada foto yang
  ingin dihapus. Foto langsung hilang dari daftar dan dari tampilan
  publik.

### E. Mengatur Nama Toko & Kecepatan Pergantian Banner
1. Cari kartu **"Pengaturan"**.
2. **Nama Toko**: ubah teks sesuai kebutuhan.
3. **Interval Banner (detik)**: atur berapa detik tiap foto tampil sebelum
   berganti ke foto berikutnya (contoh: isi `5` untuk 5 detik).
4. Klik **"Simpan Pengaturan"**.

### Keluar dari Panel Admin
- Klik tombol **"Logout"** di pojok kanan atas setelah selesai mengelola,
  terutama jika komputer dipakai bersama-sama.

---

## 4. Mengganti Password Admin

Password default (`admin123`) sebaiknya **diganti** sebelum dipakai
sehari-hari di toko, supaya panel admin tidak sembarangan bisa diakses
orang lain.

> Mengganti password memerlukan sedikit langkah teknis (via Command
> Prompt), berbeda dari pengaturan biasa di panel admin. Jika tidak yakin,
> minta bantuan IT Support untuk langkah ini.

**Langkah (Windows):**
1. Pastikan website sedang **tidak berjalan** (tutup jendela `start.bat`
   jika masih terbuka).
2. Buka **Command Prompt** (Search Windows → ketik "cmd" → Enter).
3. Pindah ke folder project, contoh:
   ```
   cd "D:\Freelance Project\Website Satria Toko Emas\satria-toko-emas"
   ```
   (sesuaikan dengan lokasi folder project di komputer Anda)
4. Jalankan perintah berikut, ganti `passwordbaru` dengan password pilihan
   Anda:
   ```
   set ADMIN_PASSWORD=passwordbaru
   npm start
   ```
5. Selama jendela Command Prompt ini terbuka, password admin yang aktif
   adalah `passwordbaru`.

**Agar password baru tetap aktif setiap kali `start.bat` diklik** (tanpa
mengetik perintah di atas berulang kali), minta IT Support untuk
mengaktifkan environment variable `ADMIN_PASSWORD` secara permanen di
Windows, atau membuat file `start.bat` khusus yang sudah menyertakan
password tersebut. Detail teknisnya ada di `README.md` bagian
"Mengganti Password".

---

## 5. Menampilkan Grafik/Chart Harga

Grafik ini menunjukkan naik-turunnya harga emas dari waktu ke waktu,
berdasarkan riwayat setiap kali harga disimpan lewat panel admin.

1. Buka halaman publik: **`http://localhost:3000`**
2. Klik tombol **"Lihat Grafik Harga"** di bawah tabel harga.
3. Sebuah jendela kecil akan terbuka menampilkan grafik garis:
   - Garis kuning = Harga Beli
   - Garis merah = Harga Jual
4. Untuk melihat grafik kadar lain, gunakan dropdown/pilihan kadar di
   pojok kanan atas jendela grafik (contoh: pindah dari "6K" ke "17K").
5. Klik tanda **×** di pojok kanan atas jendela untuk menutup grafik.

> Grafik akan semakin informatif seiring waktu, karena setiap kali harga
> disimpan lewat panel admin, satu titik data baru otomatis ditambahkan.
> Di awal pemakaian, grafik mungkin masih terlihat sederhana (hanya
> sedikit titik) — ini normal.

---

## Ringkasan Cepat

| Tugas | Alamat / Cara |
|---|---|
| Jalankan website | Klik dua kali `start.bat` |
| Hentikan website | Tutup jendela Command Prompt |
| Lihat tampilan publik | http://localhost:3000 |
| Masuk panel admin | http://localhost:3000/admin |
| Ganti harga emas | Panel admin → isi angka → "Simpan Harga" |
| Tambah/hapus banner | Panel admin → kartu "Foto / Banner" |
| Ganti password admin | Lihat bagian 4 (butuh IT Support) |
| Lihat grafik harga | Halaman publik → tombol "Lihat Grafik Harga" |

Jika mengalami kendala di luar panduan ini, hubungi developer/IT Support
yang menangani website ini.
