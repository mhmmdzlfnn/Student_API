# 📘 Panduan Penggunaan - Academia Student API & Dashboard

Panduan ini dirancang untuk membantu Anda memahami cara mengatur, menjalankan, dan berinteraksi dengan **Academia Student API** beserta dashboard antarmukanya.

---

## 🚀 Langkah 1: Persiapan Awal (Prasyarat)

Sebelum menjalankan aplikasi, pastikan Anda telah menyiapkan komponen berikut di komputer Anda:
1. **Node.js** (Versi 16 atau lebih baru).
2. **MySQL / MariaDB** server yang sedang aktif.

---

## 🛠️ Langkah 2: Konfigurasi Environment & Database

### 1. File Environment (`.env`)
Pastikan file `.env` di root direktori proyek Anda sudah memiliki konfigurasi database yang sesuai. Berikut adalah contoh isi `.env`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password_mysql_anda  # Ubah sesuai password MySQL lokal Anda
DB_NAME=student_db
DB_PORT=3306
JWT_SECRET=super_secret_key_student_api_2026
JWT_EXPIRES_IN=24h
NODE_ENV=development
```

> [!IMPORTANT]
> Pastikan service MySQL Anda sudah menyala sebelum melanjutkan ke langkah berikutnya.

### 2. Jalankan Migrasi Database
Untuk membuat database `student_db` beserta seluruh tabel relasionalnya secara otomatis, buka terminal di folder proyek dan jalankan perintah:
```bash
npm run migrate
```
*Script ini akan membaca file `src/db/schema.sql` dan membuat skema database baru secara otomatis.*

### 3. Masukkan Data Awal (Seed Data)
Agar Anda dapat langsung mencoba dashboard dengan data siap pakai, jalankan perintah berikut untuk mengisi data dummy:
```bash
npm run seed
```
Perintah ini akan membuat akun pengujian, data mahasiswa, mata kuliah, dan status pendaftaran default:
*   **Akun Admin**: `admin@academia.com` | Password: `adminpassword`
*   **Akun Staff**: `staff@academia.com` | Password: `staffpassword`

---

## 💻 Langkah 3: Menjalankan Aplikasi

Jalankan server dalam mode development menggunakan perintah:
```bash
npm run dev
```
Setelah server berjalan, Anda akan melihat output di terminal:
`Database connected successfully.` dan server berjalan di **`http://localhost:5000`**.

---

## 🖥️ Langkah 4: Cara Berinteraksi dengan Aplikasi

Ada dua cara utama untuk berinteraksi dengan API ini:

### Cara A: Menggunakan Academia Dashboard (Rekomendasi - Mudah & Visual)
Buka browser Anda dan akses:
👉 **[http://localhost:5000](http://localhost:5000)**

1.  **Halaman Login:**
    *   Masukkan email dan password salah satu akun uji coba (Admin atau Staff).
    *   *Tips: Gunakan akun Admin untuk fitur penuh (menambah/mengedit/menghapus data).*
2.  **Menu Overview:**
    *   Menampilkan metrik ringkasan (Total Mahasiswa, Total Mata Kuliah, Role Anda) serta daftar mahasiswa/mata kuliah terbaru.
3.  **Menu Mahasiswa:**
    *   Melihat tabel mahasiswa lengkap dengan **pencarian** dan **pagination**.
    *   Jika masuk sebagai **Admin**, tombol **"Tambah Mahasiswa"** akan muncul, dan Anda bisa melakukan edit atau hapus data mahasiswa.
4.  **Menu Mata Kuliah:**
    *   Melihat daftar mata kuliah yang tersedia.
    *   Jika masuk sebagai **Admin**, Anda dapat menambah mata kuliah baru.
5.  **Menu Enrollment:**
    *   Mencari daftar mata kuliah yang diambil oleh mahasiswa tertentu.
    *   Jika masuk sebagai **Admin**, Anda bisa mendaftarkan mahasiswa ke mata kuliah baru lewat tombol **"Enrollment Baru"**.

---

### Cara B: Menggunakan Dokumentasi Swagger UI (Untuk Developer)
Buka browser Anda dan akses:
👉 **[http://localhost:5000/api-docs](http://localhost:5000/api-docs)**

Swagger menyediakan interface interaktif untuk memanggil setiap endpoint API secara langsung dari browser.
1.  Buka bagian **`POST /api/auth/login`**.
2.  Klik **"Try it out"**, masukkan email dan password, lalu klik **"Execute"**.
3.  Salin string `token` dari respons JSON yang sukses.
4.  Scroll ke bagian atas halaman Swagger, klik tombol **"Authorize"** (ikon gembok).
5.  Masukkan token yang disalin dengan format: `Bearer <token_anda>` lalu klik **Authorize**.
6.  Sekarang Anda bisa memanggil endpoint yang dilindungi (seperti `GET /api/students`, `POST /api/students`, dll.) langsung dari Swagger.

---

## 📋 Daftar Rute API (Endpoints Reference)

Aplikasi ini menggunakan **Role-Based Access Control (RBAC)** dengan ketentuan akses berikut:

| Method | Endpoint | Fungsi | Hak Akses (Role) |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Mendaftarkan akun user baru | Publik |
| **POST** | `/api/auth/login` | Login user & mendapatkan JWT Token | Publik |
| **GET** | `/api/students` | Mengambil data mahasiswa (Support filter, sort, page) | Staff, Admin |
| **POST** | `/api/students` | Menambah data mahasiswa baru | Admin |
| **PUT** | `/api/students/:id` | Mengupdate data mahasiswa | Admin |
| **DELETE**| `/api/students/:id` | Menghapus data mahasiswa | Admin |
| **GET** | `/api/courses` | Mengambil semua daftar mata kuliah | Staff, Admin |
| **POST** | `/api/courses` | Menambah mata kuliah baru | Admin |
| **POST** | `/api/courses/enroll` | Mendaftarkan mahasiswa ke mata kuliah | Admin |
| **GET** | `/api/courses/student/:id` | Melihat mata kuliah yang diambil mahasiswa | Staff, Admin |

---

## 🧪 Langkah 5: Menjalankan Pengujian (Testing)

Untuk memastikan seluruh fungsionalitas backend berjalan dengan benar, jalankan suite pengujian otomatis:
```bash
npm run test
```
*Jest dan Supertest akan mensimulasikan panggilan API dan memastikan skema validasi, otorisasi token JWT, dan logika database bekerja 100% sesuai spesifikasi.*

---

## ❓ Troubleshooting (Kendala Umum)

*   **Error: Database connection failed**
    *   *Solusi:* Periksa apakah MySQL telah berjalan, dan pastikan konfigurasi `DB_USER` dan `DB_PASSWORD` di file `.env` sudah benar sesuai pengaturan MySQL di komputer Anda.
*   **Data tidak muncul di Dashboard**
    *   *Solusi:* Pastikan Anda sudah menjalankan perintah `npm run migrate` diikuti dengan `npm run seed` untuk membuat tabel dan mengisi datanya.
*   **Error 403 (Forbidden) saat melakukan aksi di Dashboard**
    *   *Solusi:* Anda kemungkinan login menggunakan akun dengan role **Staff**. Keluar (Logout) lalu masuk kembali menggunakan akun **Admin** (`admin@academia.com` / `adminpassword`) untuk mendapatkan hak akses penuh.
