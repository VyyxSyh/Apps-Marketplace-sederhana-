# PRD — TOKOKO (Simple Marketplace Web App)

## 1. Product Overview

TOKOKO adalah aplikasi web marketplace sederhana yang mempertemukan **penjual** dan **pembeli**. Penjual dapat menambahkan dan mengelola produk, sedangkan pembeli dapat mencari produk, memasukkannya ke keranjang, dan melakukan checkout.

TOKOKO difokuskan sebagai **aplikasi mobile**: seluruh antarmuka dirancang **mobile-first** untuk layar smartphone (360–430 px), dengan bottom navigation, tombol yang mudah dijangkau jempol, dan dapat dipasang ke layar utama sebagai **PWA** (opsional). Tampilan tablet dan desktop bersifat sekunder.

Aplikasi dibangun dengan **HTML, Tailwind CSS (CDN), dan Vanilla JavaScript**. Seluruh data (pengguna, produk, keranjang, pesanan) disimpan di **`localStorage`** browser. File **`data.json`** berisi data awal (seed) yang dimuat saat pertama kali dibuka atau saat data di-reset. Tidak ada backend atau server — cukup buka `index.html` di browser.

## 2. Problem Statement

- Penjual kecil kesulitan mengelola produk dan pesanan di satu tempat karena informasi tersebar di berbagai media sosial dan chat.
- Pembeli sulit menemukan dan membandingkan produk dari banyak penjual.
- Proses membeli sering tidak jelas: tidak ada keranjang, ringkasan biaya, maupun riwayat pesanan yang rapi.
- Dibutuhkan contoh aplikasi marketplace yang sederhana, mudah dipahami, dan tidak memerlukan setup server atau database.

## 3. Product Goals

- Menyediakan alur marketplace inti yang lengkap: **lihat produk → cari → keranjang → checkout → riwayat pesanan**.
- Memberi penjual cara sederhana untuk menambah, mengubah, dan menghapus produk.
- Menampilkan antarmuka yang bersih dan nyaman dipakai di smartphone, dengan satu tangan, sebagai prioritas utama.
- Memberi pengalaman yang terasa seperti aplikasi (navigasi bawah, transisi halus, dapat dipasang ke layar utama).
- Menyimpan data secara persisten di `localStorage` tanpa perlu server.

**Target terukur:**

- Pembeli dapat menyelesaikan checkout dalam ≤ 4 langkah dari halaman produk.
- Seluruh alur utama dapat dijalankan pada layar 360–430 px tanpa zoom dan tanpa scroll horizontal.
- Semua elemen yang dapat diketuk berukuran minimal 44×44 px.
- Penjual dapat menambahkan produk dalam < 2 menit.
- Halaman katalog termuat dalam < 2 detik.
- Data tetap tersimpan setelah halaman di-refresh (localStorage).

## 4. Target Users

| Pengguna | Deskripsi | Kebutuhan Utama |
|---|---|---|
| **Pembeli** | Pengguna umum yang mencari dan membeli produk | Pencarian mudah, harga jelas, keranjang, checkout cepat |
| **Penjual** | Individu atau pemilik usaha kecil yang menjual produk | Menambah dan mengelola produk, melihat pesanan masuk |

**Karakteristik pengguna:**

- Terbiasa memakai browser dan marketplace populer.
- Menggunakan smartphone sebagai perangkat utama (layar 360–430 px), sering dengan satu tangan.
- Menginginkan antarmuka sederhana tanpa tutorial.

> Catatan: Login bersifat simulasi — password tersimpan sebagai teks biasa di localStorage. **Tidak aman untuk data nyata** (lihat bagian 7).

## 5. Core Features

| # | Fitur | Deskripsi Singkat | Prioritas |
|---|---|---|---|
| 1 | Autentikasi (Simulasi) | Register, login, logout dengan peran Pembeli atau Penjual | Must Have |
| 2 | Katalog Produk | Daftar produk dalam bentuk card dengan foto, nama, dan harga | Must Have |
| 3 | Detail Produk | Informasi lengkap produk, stok, dan penjual | Must Have |
| 4 | Pencarian, Filter & Sorting | Cari berdasarkan nama, filter kategori, urutkan harga | Must Have |
| 5 | Keranjang Belanja | Tambah, ubah jumlah, dan hapus item; total otomatis | Must Have |
| 6 | Checkout | Isi data pengiriman dan konfirmasi pesanan | Must Have |
| 7 | Riwayat Pesanan | Daftar pesanan pembeli beserta status | Must Have |
| 8 | Manajemen Produk (Penjual) | Tambah, ubah, hapus produk milik sendiri | Must Have |
| 9 | Pesanan Masuk (Penjual) | Melihat pesanan dan mengubah statusnya | Should Have |
| 10 | Mobile-First UI | Bottom navigation, tombol mudah dijangkau, tampilan optimal di layar smartphone | Must Have |
| 11 | Instalasi PWA | Dapat dipasang ke layar utama dan tampil layar penuh | Could Have |

## 6. Functional Requirements

### FR-1 — Autentikasi (Simulasi)

- FR-1.1 User dapat mendaftar dengan nama, email, password, dan memilih peran (Pembeli atau Penjual); data disimpan ke `localStorage`.
- FR-1.2 Email harus unik; sebelum menyimpan, aplikasi memeriksa data users dan menampilkan pesan error jika email sudah terdaftar.
- FR-1.3 User dapat login dengan mencocokkan email dan password pada data users.
- FR-1.4 Setelah login, ID dan peran user aktif disimpan di `localStorage` sebagai sesi.
- FR-1.5 User dapat logout; sesi dihapus dan diarahkan ke halaman katalog.
- FR-1.6 Halaman khusus peran dibatasi: Pembeli tidak dapat membuka halaman Penjual dan sebaliknya.
- FR-1.7 Form menampilkan validasi (kolom kosong, format email, password minimal 6 karakter).

### FR-2 — Katalog Produk

- FR-2.1 Halaman utama membaca data produk dari `localStorage` dan menampilkannya dalam grid Product Card.
- FR-2.2 Product Card menampilkan foto/emoji, nama produk, harga (format Rupiah), dan nama penjual.
- FR-2.3 Produk dengan stok 0 menampilkan label `Stok Habis` dan tidak dapat ditambahkan ke keranjang.
- FR-2.4 Katalog dapat diakses tanpa login; login diminta saat menambah ke keranjang atau checkout.
- FR-2.5 Jika belum ada produk, tampilkan empty state.

### FR-3 — Detail Produk

- FR-3.1 Menampilkan informasi produk berdasarkan ID.
- FR-3.2 Menampilkan foto/emoji, nama, harga, deskripsi, kategori, stok, dan nama penjual.
- FR-3.3 Pembeli dapat memilih jumlah (tidak boleh melebihi stok) dan menekan `Tambah ke Keranjang`.
- FR-3.4 Tersedia tombol `Beli Sekarang` yang langsung menuju checkout dengan produk tersebut.

### FR-4 — Pencarian, Filter & Sorting

- FR-4.1 User dapat mencari produk berdasarkan nama secara real-time saat mengetik (dengan debounce ±300 ms).
- FR-4.2 Filter kategori: `Semua` atau salah satu kategori.
- FR-4.3 Sorting: `Terbaru`, `Harga Terendah`, `Harga Tertinggi`, `Nama A–Z`.
- FR-4.4 Pencarian, filter, dan sorting dapat dikombinasikan sekaligus.
- FR-4.5 Jika tidak ada hasil, tampilkan pesan "Produk tidak ditemukan".

### FR-5 — Keranjang Belanja

- FR-5.1 Pembeli dapat menambahkan produk ke keranjang dari Product Card maupun Detail Produk.
- FR-5.2 Item keranjang disimpan di `localStorage` berdasarkan `userId`, sehingga tetap ada setelah refresh.
- FR-5.3 Jika produk sudah ada di keranjang, jumlahnya bertambah (maksimal sesuai stok).
- FR-5.4 Pembeli dapat mengubah jumlah (`−` / `+`) dan menghapus item.
- FR-5.5 Subtotal per item dan total keseluruhan dihitung otomatis.
- FR-5.6 Ikon keranjang di navbar menampilkan badge jumlah item.
- FR-5.7 Jika keranjang kosong, tampilkan empty state dengan tombol menuju katalog.

### FR-6 — Checkout

- FR-6.1 Checkout meminta: nama penerima, nomor telepon, dan alamat pengiriman.
- FR-6.2 Pembeli memilih metode pembayaran (contoh: `Transfer Bank` atau `Bayar di Tempat`); pembayaran bersifat simulasi.
- FR-6.3 Ringkasan pesanan menampilkan daftar item, subtotal, ongkos kirim (flat), dan total bayar.
- FR-6.4 Saat pesanan dibuat, aplikasi mengurangi stok tiap produk dan mengosongkan keranjang pengguna di `localStorage`.
- FR-6.5 Sebelum membuat pesanan, aplikasi memeriksa stok; jika stok tidak mencukupi, tampilkan pesan dan sesuaikan jumlah.
- FR-6.6 Data pesanan menyimpan salinan (snapshot) nama dan harga produk saat transaksi.
- FR-6.7 Setelah berhasil, tampilkan halaman konfirmasi dengan nomor pesanan unik.

### FR-7 — Riwayat Pesanan (Pembeli)

- FR-7.1 Pembeli dapat melihat daftar pesanannya, diurutkan dari yang terbaru.
- FR-7.2 Setiap pesanan menampilkan nomor pesanan, tanggal, total, dan status.
- FR-7.3 Pembeli dapat membuka detail pesanan (daftar produk, alamat, metode pembayaran, rincian biaya).
- FR-7.4 Status pesanan: `Diproses`, `Dikirim`, `Selesai`, `Dibatalkan`.
- FR-7.5 Pembeli dapat membatalkan pesanan selama status masih `Diproses`; stok produk dikembalikan.

### FR-8 — Manajemen Produk (Penjual)

- FR-8.1 Penjual dapat melihat daftar produk miliknya.
- FR-8.2 Penjual dapat menambah produk: nama, deskripsi, harga, stok, kategori, dan emoji/URL gambar.
- FR-8.3 Penjual dapat mengedit dan menghapus hanya produk miliknya sendiri.
- FR-8.4 Form produk memvalidasi input (kolom wajib, harga dan stok tidak boleh negatif).
- FR-8.5 Penghapusan produk meminta konfirmasi terlebih dahulu.

### FR-9 — Pesanan Masuk (Penjual) — Should Have

- FR-9.1 Penjual dapat melihat pesanan yang berisi produk miliknya.
- FR-9.2 Penjual dapat mengubah status pesanan dari `Diproses` ke `Dikirim`, lalu ke `Selesai`.
- FR-9.3 Penjual dapat memfilter pesanan berdasarkan status.

### FR-10 — Navigasi & Mobile UX

- FR-10.1 **Bottom Navigation** tampil di semua halaman utama, berisi ikon + label: `Beranda`, `Cari`, `Keranjang`, `Pesanan`, `Akun`. Menu aktif ditandai warna Primary dan badge jumlah pada `Keranjang`.
- FR-10.2 Untuk Penjual, Bottom Navigation berisi: `Beranda`, `Produk Saya`, `Pesanan Masuk`, `Akun`.
- FR-10.3 **Top Bar** berisi logo TOKOKO dan kolom pencarian; pada halaman dalam (detail, checkout), Top Bar menampilkan tombol kembali dan judul halaman.
- FR-10.4 Katalog menampilkan grid **2 kolom**; filter dan sorting dibuka lewat tombol `Filter` dalam bentuk **bottom sheet**.
- FR-10.5 Halaman Detail Produk menampilkan emoji/gambar produk dan tombol `Tambah ke Keranjang` serta `Beli Sekarang` yang menempel (sticky) di bagian bawah layar.
- FR-10.6 Halaman Keranjang menampilkan ringkasan total dan tombol `Checkout` yang menempel di bagian bawah layar, di atas Bottom Navigation.
- FR-10.7 Seluruh elemen interaktif berukuran minimal 44×44 px dan diberi jarak cukup untuk mencegah salah ketuk.
- FR-10.8 Kolom form memakai jenis input yang sesuai (`type="email"`, `type="tel"`, `inputmode="numeric"`) agar keyboard HP yang muncul tepat.
- FR-10.9 Tombol aksi utama ditempatkan di bagian bawah layar (zona jempol); aksi destruktif (hapus, batal) meminta konfirmasi.
- FR-10.10 Feedback aksi (berhasil, gagal) ditampilkan sebagai toast singkat di dekat bagian bawah layar.
- FR-10.11 Konten tidak tertutup Top Bar, Bottom Navigation, maupun *notch*/*safe area* perangkat.
- FR-10.12 *(Could Have)* PWA: `manifest.json` dan service worker sederhana.
- FR-10.13 Pada layar tablet dan desktop, konten tampil dalam kontainer berlebar maksimum (±480 px); tampilan ini tidak menjadi prioritas.

## 7. Non-Functional Requirements

| Kategori | Kebutuhan |
|---|---|
| **Usability** | Dapat dioperasikan dengan satu tangan; tombol utama berada di zona jempol; ukuran area ketuk ≥ 44×44 px; pesan error dan validasi jelas dalam Bahasa Indonesia; jenis keyboard sesuai input. |
| **Performance** | Halaman termuat < 2 detik; gambar memakai `loading="lazy"`; pencarian memakai debounce; total aset awal dijaga ringan. |
| **Responsiveness** | Pendekatan **mobile-first**: dirancang dan diuji utama pada lebar 360, 390, dan 430 px; tablet dan desktop sekunder. Mendukung orientasi potret (utama); lanskap tidak boleh merusak tata letak. |
| **Compatibility** | Berjalan di Chrome Android dan Safari iOS versi terbaru, serta browser modern desktop (Chrome, Firefox, Edge) sebagai pelengkap. |
| **Data Persistence** | Data disimpan di `localStorage`. File `data.json` berisi seed data yang dimuat saat pertama kali atau saat reset. Data bertahan selama browser tidak di-clear. |
| **Maintainability** | Kode dipisah per modul: `store.js` (data layer localStorage), `app.js` (logika UI), `index.html` (markup). |
| **Security (Keterbatasan)** | Password tersimpan sebagai teks biasa di localStorage. Cocok untuk tugas, demo, dan pembelajaran, **bukan untuk produksi**. Input pengguna di-escape saat dirender ke DOM untuk mencegah XSS. |
| **Accessibility** | Kontras warna terbaca di bawah cahaya terang; elemen interaktif punya label yang jelas; gambar memiliki atribut `alt`; HTML memakai tag semantik; teks tidak lebih kecil dari 14 px. |
| **Portability** | Cukup buka `index.html` di browser. Koneksi internet diperlukan hanya untuk Tailwind CDN. Dapat di-deploy sebagai static site. |

## 8. Tech Stack

- **HTML** — markup
- **Tailwind CSS (CDN)** — styling, pendekatan mobile-first (`md:`/`lg:` untuk layar lebih besar)
- **Vanilla JavaScript** — logika aplikasi
- **localStorage** — penyimpan data persisten di browser
- **data.json** — seed data awal (produk, kategori, user contoh)

**Catatan implementasi:**

- Tidak memerlukan Node.js, npm, atau server apapun.
- Tailwind dimuat lewat CDN. Pastikan ada koneksi internet saat membuka.
- Setiap halaman wajib memuat `<meta name="viewport" content="width=device-width, initial-scale=1">` dan `<meta name="theme-color">`.
- Selama pengembangan, gunakan mode responsif DevTools (iPhone SE, Pixel 7, iPhone 14 Pro Max).
- Buka `index.html` langsung di browser atau lewat Live Server VS Code.

**Struktur data di localStorage:**

| Key | Isi | Keterangan |
|---|---|---|
| `tokoko-users` | `User[]` | Daftar user yang terdaftar |
| `tokoko-session` | `{ userId, role }` | Sesi login aktif |
| `tokoko-products` | `Product[]` | Semua produk |
| `tokoko-categories` | `Category[]` | Daftar kategori |
| `tokoko-carts` | `CartItem[]` | Keranjang per user |
| `tokoko-orders` | `Order[]` | Semua pesanan |

**Contoh seed data (`data.json`):**

```json
{
  "users": [
    { "id": 1, "name": "Budi", "email": "budi@mail.com", "password": "123456", "role": "seller" },
    { "id": 2, "name": "Ani", "email": "ani@mail.com", "password": "123456", "role": "buyer" }
  ],
  "categories": [
    { "id": 1, "name": "Sembako" },
    { "id": 2, "name": "Obat & P3K" },
    { "id": 3, "name": "Pakaian" },
    { "id": 4, "name": "Rumah Tangga" }
  ],
  "products": [
    {
      "id": 1,
      "sellerId": 1,
      "name": "Beras Premium 5 kg",
      "description": "Beras pulen kualitas premium",
      "price": 74800,
      "oldPrice": 89000,
      "stock": 50,
      "category": "Sembako",
      "icon": "🍚",
      "rating": 4.9,
      "sold": 2400,
      "tag": "Gratis ongkir",
      "city": "Jakarta Barat",
      "discount": "16%",
      "createdAt": "2026-11-01T10:00:00Z"
    }
  ],
  "carts": [],
  "orders": []
}
```

**Struktur folder:**

```text
tokoko/
├── index.html         # Markup utama (SPA)
├── store.js           # Data layer: baca/tulis localStorage, load seed
├── app.js             # Logika UI, render, event handling
├── stylesheet.css     # Style kustom di luar Tailwind
├── data.json          # Seed data awal
├── PRD.md             # Dokumen kebutuhan produk
├── README.md          # Dokumentasi proyek
└── LICENSE            # Lisensi MIT
```

## 9. Future Improvements (Should Have & Beyond)

- Pesanan masuk penjual (Should Have — tahap 2).
- Mode dark/light.
- Tampilan tablet dan desktop yang dioptimalkan.
- PWA (manifest.json, service worker).
- Dibungkus menjadi aplikasi native (Android/iOS) dengan Capacitor.
- Backend dan database sungguhan (autentikasi aman, password ter-hash, otorisasi API).
- Upload foto produk.
- Ulasan dan rating produk.
- Wishlist / produk favorit.
- Integrasi payment gateway dan ongkir real-time.
- Chat antara pembeli dan penjual.