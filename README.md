# Student API - Proyek Backend Developer

Sebuah RESTful API profesional untuk manajemen mahasiswa, mata kuliah, dan pendaftaran mata kuliah (enrollments). Dibangun dengan **Node.js**, **Express.js**, dan **MySQL/MariaDB**.

Proyek ini merupakan implementasi penuh dari peta jalan (roadmap) backend developer selama 8 minggu, menggabungkan standar desain premium, praktik keamanan terbaik (Autentikasi JWT, RBAC, Rate Limiting), pencatatan log dengan Morgan, dokumentasi Swagger, dan pengujian integrasi menggunakan Jest.

---

## Fitur Utama

- **Autentikasi JWT**: Registrasi dan login yang aman dengan password yang di-hash menggunakan `bcryptjs`.
- **Role-Based Access Control (RBAC)**:
  - **Staff**: Hanya memiliki akses untuk membaca data mahasiswa dan mata kuliah (`GET`).
  - **Admin**: Memiliki akses penuh, termasuk membuat, memperbarui, dan menghapus data (`POST`, `PUT`, `DELETE`), serta mendaftarkan mahasiswa ke mata kuliah.
- **CRUD Mahasiswa (Student)**: Manajemen data mahasiswa secara lengkap dengan validasi input.
- **Pencarian, Pagination & Sorting**:
  - Filter mahasiswa berdasarkan `name`, `nim`, atau `major`.
  - Pagination di sisi server lengkap dengan metadata respons (`page`, `limit`, `totalCount`, `totalPages`).
  - Pengurutan (sorting) berdasarkan kolom yang diizinkan (misal: `name`, `nim`, `major`) dengan urutan `ASC` atau `DESC`.
- **Relasi Many-to-Many**: Mendaftarkan mahasiswa ke mata kuliah melalui tabel perantara `enrollments` menggunakan kueri SQL `JOIN` yang kompleks.
- **Dokumentasi Swagger**: Dokumentasi API interaktif yang digenerasi secara otomatis dan dapat diakses melalui Swagger UI di `/api-docs`.
- **Rate Limiting**: Melindungi rute API dari serangan DDoS dan brute-force.
- **Logging**: Pencatatan aktivitas *request* di terminal menggunakan `morgan`.
- **Pengujian Integrasi**: 14 skenario tes yang kuat untuk memverifikasi logika API menggunakan `jest` dan `supertest`.

---

## Teknologi yang Digunakan

- **Inti (Core)**: Node.js (ES Modules), Express.js
- **Database**: MySQL / MariaDB (menggunakan *connection pool* `mysql2/promise`)
- **Keamanan**: jsonwebtoken, bcryptjs, express-rate-limit
- **Validasi**: Joi
- **Dokumentasi**: Swagger UI, swagger-jsdoc
- **Logging**: Morgan
- **Pengujian (Testing)**: Jest, Supertest

---

## Struktur Proyek

```
├── src/
│   ├── config/
│   │   ├── db.js          # Konfigurasi connection pool MySQL
│   │   └── swagger.js     # Pengaturan Swagger JSDoc
│   ├── controllers/
│   │   ├── authController.js    # Logika Register, login, profile
│   │   ├── studentController.js # CRUD Mahasiswa dengan pencarian/pagination
│   │   └── courseController.js  # CRUD Mata Kuliah & pendaftaran (JOIN query)
│   ├── db/
│   │   ├── schema.sql     # Skrip SQL DDL untuk mendefinisikan tabel
│   │   ├── migrate.js     # Runner untuk membuat ulang/menjalankan schema.sql
│   │   └── seed.js        # Skrip untuk memasukkan data awal (mock data)
│   ├── middlewares/
│   │   ├── authMiddleware.js    # Verifikasi token JWT
│   │   ├── roleMiddleware.js    # Middleware pembatasan RBAC
│   │   ├── validationMiddleware.js # Validator body request dengan Joi
│   └── app.js             # Setup Express app dan routing middleware
│   └── server.js          # Entry point aplikasi (menjalankan server HTTP)
├── tests/
│   └── api.test.js        # Pengujian integrasi menggunakan Jest
├── .env                   # Konfigurasi variabel environment
├── package.json           # Konfigurasi skrip dan dependensi
└── README.md              # Dokumentasi proyek
```

---

## Cara Instalasi dan Setup

### 1. Prasyarat
Pastikan Anda telah menginstal [Node.js](https://nodejs.org/) (v16+) dan [MySQL/MariaDB](https://mariadb.org/) yang berjalan di mesin lokal Anda.

### 2. Instal Dependensi
Clone atau salin direktori ini, buka terminal Anda di dalam folder utama (root), lalu jalankan:
```bash
npm install
```

### 3. Konfigurasi Environment
Buat atau edit file `.env` di direktori utama dan sesuaikan kredensial Anda:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password_mysql_anda
DB_NAME=student_db
DB_PORT=3306
JWT_SECRET=super_secret_key_student_api_2026
JWT_EXPIRES_IN=24h
NODE_ENV=development
```

### 4. Setup Database & Migrasi
Buat database `student_db` beserta seluruh tabelnya secara otomatis:
```bash
npm run migrate
```

### 5. Memasukkan Data Awal (Seed)
Masukkan data pengujian untuk pengguna (Admin & Staff), mata kuliah, mahasiswa, dan pendaftaran (enrollments):
```bash
npm run seed
```
**Akun Uji Coba yang Dibuat:**
- **Admin**: `admin@studentapi.com` (Password: `adminpassword`)
- **Staff**: `staff@studentapi.com` (Password: `staffpassword`)

---

## Menjalankan Aplikasi

### Menjalankan Server Development
Menjalankan aplikasi dengan fitur *auto-reload* kode menggunakan `nodemon`:
```bash
npm run dev
```
Server akan berjalan di: [http://localhost:5000](http://localhost:5000)

### Mengakses Dokumentasi API Interaktif (Swagger)
Setelah server berjalan, buka tautan berikut di browser Anda:
👉 [**http://localhost:5000/api-docs**](http://localhost:5000/api-docs)

Anda bisa melakukan autentikasi langsung di dalam Swagger UI dengan cara melakukan registrasi atau login, menyalin token JWT, lalu mengklik **"Authorize"** dan memasukkannya sebagai token Bearer.

---

## Menjalankan Pengujian (Integration Tests)

Untuk menjalankan seluruh skenario pengujian otomatis:
```bash
npm run test
```
Perintah ini akan menjalankan 14 tes yang memvalidasi alur register/login, batasan RBAC, operasi CRUD mahasiswa, fitur pencarian, pagination, dan relasi JOIN antara mata kuliah & mahasiswa.
