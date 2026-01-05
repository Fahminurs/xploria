# Xploria

Panduan singkat untuk men-setup dan menjalankan proyek Xploria (sistem otentikasi dan antarmuka web).

## Ringkasan Proyek
- Aplikasi web berbasis Node.js + Express dengan tampilan `ejs`.
- Fitur: otentikasi (termasuk Google Sign-In), upload profil, integrasi serial/Arduino.
- File server utama: `server.js`.

## Prasyarat
- Node.js (direkomendasikan v16+)
- npm (atau yarn)
- MySQL / MariaDB untuk import database awal

## Instalasi
1. Clone atau salin repo ini ke mesin Anda.
2. Masuk ke folder proyek:

```bash
cd path/to/Xploria
```

3. Install dependency:

```bash
npm install
```

4. Buat file environment (opsional tapi direkomendasikan):

Contoh `.env`:

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=xploria
# GOOGLE_CLIENT_ID=...
# GOOGLE_CLIENT_SECRET=...
```

Letakkan file `.env` di root proyek (sejajar dengan `server.js`). Proyek menggunakan paket `dotenv`.

## Database
Database contoh tersedia di `database/xploria.sql`.

Contoh import (menggunakan MySQL CLI):

```bash
# buat database (jika belum ada)
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS xploria CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# import struktur & data
mysql -u root -p xploria < database/xploria.sql
```

Jika Anda menggunakan GUI (MySQL Workbench, phpMyAdmin), impor file `database/xploria.sql` melalui antarmuka tersebut.

## Konfigurasi
- Pastikan variabel koneksi database di `.env` cocok dengan kredensial MySQL Anda.
- Jika aplikasi menggunakan Google Sign-In atau SMTP (untuk email), tambahkan konfigurasi terkait di `.env` sesuai kebutuhan.

Periksa file konfigurasi/route yang relevan jika Anda membutuhkan variabel tambahan: lihat `routes/route.js`, `model/model.js`, dan `public/email.js`.

## Menjalankan Aplikasi
- Mode produksi:

```bash
npm start
```

- Mode pengembangan (dengan `nodemon`, hot-reload):

```bash
npm run dev
```

Server akan mendengarkan di `PORT` dari `.env` atau default `5000`.

Buka di browser:

```
http://localhost:5000
```

## Struktur File Penting
- `server.js` - entry utama server (Express)
- `package.json` - dependency & script
- `database/xploria.sql` - dump database
- `routes/route.js` - definisi route utama
- `views/` - template EJS untuk halaman
- `public/` - aset statis (CSS, JS, gambar, uploads)

## Troubleshooting
- Port sudah digunakan: ubah `PORT` di `.env` atau hentikan proses yang memakai port.
- Koneksi DB gagal: periksa `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` di `.env` dan pastikan MySQL berjalan.
- Modul hilang setelah `npm install`: jalankan `npm ci` atau hapus `node_modules` lalu `npm install` ulang.

## Langkah Selanjutnya / Tips
- Jika Anda ingin menjalankan secara remote, gunakan process manager seperti `pm2` atau containerize aplikasi.
- Tambahkan file `.env.example` yang berisi variabel environment yang diperlukan (tanpa nilai sensitif).

---

Butuh saya jalankan server sekarang atau buat `.env.example` juga? Beri tahu saya langkah yang Anda mau saya lanjutkan.
