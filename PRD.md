# PRD - TOKOKO (Simple Marketplace Web App)

## 1. Product Overview

TOKOKO adalah aplikasi web marketplace sederhana yang mempertemukan **penjual** dan **pembeli**. Penjual dapat menambahkan dan mengelola produk, sedangkan pembeli dapat mencari produk, memasukkannya ke keranjang, dan melakukan checkout.

TOKOKO difokuskan sebagai **aplikasi mobile**: seluruh antarmuka dirancang **mobile-first** untuk layar smartphone (360–430 px), dengan bottom navigation, tombol yang mudah dijangkau jempol, dan dapat dipasang ke layar utama sebagai **PWA** (opsional). Tampilan tablet dan desktop bersifat sekunder.

Aplikasi dibangun dengan HTML, Tailwind CSS, dan Vanilla JavaScript. Seluruh data (pengguna, produk, keranjang, pesanan) disimpan dalam satu file **`db.json`** yang diakses lewat **json-server**, yaitu server REST API tiruan yang membaca dan menulis langsung ke file JSON tersebut. Frontend berkomunikasi dengan data menggunakan `fetch()`.

## 2. Problem Statement

- Penjual kecil kesulitan mengelola produk dan pesanan di satu tempat karena informasi tersebar di berbagai media sosial dan chat.
- Pembeli sulit menemukan dan membandingkan produk dari banyak penjual.
- Proses membeli sering tidak jelas: tidak ada keranjang, ringkasan biaya, maupun riwayat pesanan yang rapi.
- Dibutuhkan contoh aplikasi marketplace yang sederhana, mudah dipahami, dan tidak memerlukan setup database yang rumit.

## 3. Product Goals

- Menyediakan alur marketplace inti yang lengkap: **lihat produk → cari → keranjang → checkout → riwayat pesanan**.
- Memberi penjual cara sederhana untuk menambah, mengubah, dan menghapus produk.
- Menampilkan antarmuka yang bersih dan nyaman dipakai di smartphone, dengan satu tangan, sebagai prioritas utama.
- Memberi pengalaman yang terasa seperti aplikasi (navigasi bawah, transisi halus, dapat dipasang ke layar utama).
- Menyimpan data secara persisten di file JSON tanpa perlu database sungguhan.
- Struktur kode memisahkan lapisan akses data (API) dari tampilan, sehingga mudah diganti ke backend sungguhan di kemudian hari.

**Target terukur:**

- Pembeli dapat menyelesaikan checkout dalam ≤ 4 langkah dari halaman produk.
- Seluruh alur utama dapat dijalankan pada layar 360–430 px tanpa zoom dan tanpa scroll horizontal.
- Semua elemen yang dapat diketuk berukuran minimal 44×44 px.
- Penjual dapat menambahkan produk dalam < 2 menit.
- Halaman katalog termuat dalam < 2 detik pada jaringan lokal.
- Data tetap tersimpan di `db.json` setelah halaman di-refresh atau server dimatikan lalu dijalankan kembali.

## 4. Target Users

| Pengguna | Deskripsi | Kebutuhan Utama |
|---|---|---|
| **Pembeli** | Pengguna umum yang mencari dan membeli produk | Pencarian mudah, harga jelas, keranjang, checkout cepat |
| **Penjual** | Individu atau pemilik usaha kecil yang menjual produk | Menambah dan mengelola produk, melihat pesanan masuk |

**Karakteristik pengguna:**

- Terbiasa memakai browser dan marketplace populer.
- Menggunakan smartphone sebagai perangkat utama (layar 360–430 px), sering dengan satu tangan dan koneksi yang tidak selalu stabil.
- Menginginkan antarmuka sederhana tanpa tutorial.

> Catatan: Karena memakai json-server tanpa autentikasi sungguhan, login bersifat simulasi dan **tidak aman untuk data nyata** (lihat bagian 7).

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

- FR-1.1 User dapat mendaftar dengan nama, email, password, dan memilih peran (Pembeli atau Penjual); data disimpan ke koleksi `users` di `db.json`.
- FR-1.2 Email harus unik; sebelum menyimpan, aplikasi memeriksa `users` dan menampilkan pesan error jika email sudah terdaftar.
- FR-1.3 User dapat login dengan mencocokkan email dan password pada data `users`.
- FR-1.4 Setelah login, hanya **ID dan peran user** yang disimpan di `localStorage` sebagai sesi (data lain selalu diambil dari API).
- FR-1.5 User dapat logout; sesi dihapus dan diarahkan ke halaman katalog.
- FR-1.6 Halaman khusus peran dibatasi: Pembeli tidak dapat membuka halaman Penjual dan sebaliknya (dialihkan ke halaman yang sesuai).
- FR-1.7 Form menampilkan validasi (kolom kosong, format email, password minimal 6 karakter).

### FR-2 — Katalog Produk

- FR-2.1 Halaman utama mengambil data dari `GET /products` dan menampilkannya dalam grid Product Card.
- FR-2.2 Product Card menampilkan foto, nama produk, harga (format Rupiah), dan nama penjual.
- FR-2.3 Produk dengan stok 0 menampilkan label `Stok Habis` dan tidak dapat ditambahkan ke keranjang.
- FR-2.4 Katalog dapat diakses tanpa login; login diminta saat menambah ke keranjang atau checkout.
- FR-2.5 Saat data dimuat, tampilkan indikator loading; jika gagal, tampilkan pesan error dengan tombol `Coba Lagi`.
- FR-2.6 Jika belum ada produk, tampilkan empty state.

### FR-3 — Detail Produk

- FR-3.1 Mengambil data produk berdasarkan ID (`GET /products/:id`).
- FR-3.2 Menampilkan foto, nama, harga, deskripsi, kategori, stok, dan nama penjual.
- FR-3.3 Pembeli dapat memilih jumlah (tidak boleh melebihi stok) dan menekan `Tambah ke Keranjang`.
- FR-3.4 Tersedia tombol `Beli Sekarang` yang langsung menuju checkout dengan produk tersebut.

### FR-4 — Pencarian, Filter & Sorting

- FR-4.1 User dapat mencari produk berdasarkan nama secara real-time saat mengetik (dengan debounce ±300 ms).
- FR-4.2 Filter kategori: `Semua` atau salah satu kategori.
- FR-4.3 Sorting: `Terbaru`, `Harga Terendah`, `Harga Tertinggi`, `Nama A–Z`.
- FR-4.4 Pencarian, filter, dan sorting dapat dikombinasikan sekaligus (menggunakan query json-server seperti `q`, `category`, `_sort`, `_order`, atau penyaringan di sisi klien).
- FR-4.5 Jika tidak ada hasil, tampilkan pesan "Produk tidak ditemukan".

### FR-5 — Keranjang Belanja

- FR-5.1 Pembeli dapat menambahkan produk ke keranjang dari Product Card maupun Detail Produk.
- FR-5.2 Item keranjang disimpan di koleksi `carts` pada `db.json` berdasarkan `userId`, sehingga tetap ada setelah refresh.
- FR-5.3 Jika produk sudah ada di keranjang, jumlahnya bertambah (maksimal sesuai stok).
- FR-5.4 Pembeli dapat mengubah jumlah (`−` / `+`) dan menghapus item.
- FR-5.5 Subtotal per item dan total keseluruhan dihitung otomatis tanpa reload halaman.
- FR-5.6 Ikon keranjang di navbar menampilkan badge jumlah item.
- FR-5.7 Jika keranjang kosong, tampilkan empty state dengan tombol menuju katalog.

### FR-6 — Checkout

- FR-6.1 Checkout meminta: nama penerima, nomor telepon, dan alamat pengiriman.
- FR-6.2 Pembeli memilih metode pembayaran (contoh: `Transfer Bank` atau `Bayar di Tempat`); pembayaran bersifat simulasi.
- FR-6.3 Ringkasan pesanan menampilkan daftar item, subtotal, ongkos kirim (flat), dan total bayar.
- FR-6.4 Saat pesanan dibuat (`POST /orders`), aplikasi mengurangi stok tiap produk (`PATCH /products/:id`) dan mengosongkan keranjang pengguna.
- FR-6.5 Sebelum membuat pesanan, aplikasi mengambil data stok terbaru; jika stok tidak mencukupi, tampilkan pesan dan sesuaikan jumlah.
- FR-6.6 Data pesanan menyimpan salinan (snapshot) nama dan harga produk saat transaksi, sehingga tidak berubah jika produk diedit kemudian.
- FR-6.7 Setelah berhasil, tampilkan halaman konfirmasi dengan nomor pesanan unik.

### FR-7 — Riwayat Pesanan (Pembeli)

- FR-7.1 Pembeli dapat melihat daftar pesanannya (`GET /orders?buyerId=...`), diurutkan dari yang terbaru.
- FR-7.2 Setiap pesanan menampilkan nomor pesanan, tanggal, total, dan status.
- FR-7.3 Pembeli dapat membuka detail pesanan (daftar produk, alamat, metode pembayaran, rincian biaya).
- FR-7.4 Status pesanan: `Diproses`, `Dikirim`, `Selesai`, `Dibatalkan`.
- FR-7.5 Pembeli dapat membatalkan pesanan selama status masih `Diproses`; stok produk dikembalikan.

### FR-8 — Manajemen Produk (Penjual)

- FR-8.1 Penjual dapat melihat daftar produk miliknya (`GET /products?sellerId=...`).
- FR-8.2 Penjual dapat menambah produk: nama, deskripsi, harga, stok, kategori, dan **URL gambar** (atau file gambar di folder `assets/images/` yang diisi manual).
- FR-8.3 Penjual dapat mengedit (`PATCH`) dan menghapus (`DELETE`) hanya produk miliknya sendiri.
- FR-8.4 Form produk memvalidasi input (kolom wajib, harga dan stok tidak boleh negatif).
- FR-8.5 Penghapusan produk meminta konfirmasi terlebih dahulu.

### FR-9 — Pesanan Masuk (Penjual)

- FR-9.1 Penjual dapat melihat pesanan yang berisi produk miliknya.
- FR-9.2 Penjual dapat mengubah status pesanan dari `Diproses` ke `Dikirim`, lalu ke `Selesai`.
- FR-9.3 Penjual dapat memfilter pesanan berdasarkan status.

### FR-10 — Navigasi & Mobile UX

- FR-10.1 **Bottom Navigation** tampil di semua halaman utama, berisi ikon + label: `Beranda`, `Cari`, `Keranjang`, `Pesanan`, `Akun`. Menu aktif ditandai warna Primary dan badge jumlah pada `Keranjang`.
- FR-10.2 Untuk Penjual, Bottom Navigation berisi: `Beranda`, `Produk Saya`, `Pesanan Masuk`, `Akun`.
- FR-10.3 **Top Bar** berisi logo TOKOKO dan kolom pencarian; pada halaman dalam (detail, checkout), Top Bar menampilkan tombol kembali dan judul halaman.
- FR-10.4 Katalog menampilkan grid **2 kolom**; filter dan sorting dibuka lewat tombol `Filter` dalam bentuk **bottom sheet**.
- FR-10.5 Halaman Detail Produk menampilkan galeri foto yang dapat digeser (swipe) dan tombol `Tambah ke Keranjang` serta `Beli Sekarang` yang menempel (sticky) di bagian bawah layar.
- FR-10.6 Halaman Keranjang menampilkan ringkasan total dan tombol `Checkout` yang menempel di bagian bawah layar, di atas Bottom Navigation.
- FR-10.7 Seluruh elemen interaktif berukuran minimal 44×44 px dan diberi jarak cukup untuk mencegah salah ketuk.
- FR-10.8 Kolom form memakai jenis input yang sesuai (`type="email"`, `type="tel"`, `inputmode="numeric"`) agar keyboard HP yang muncul tepat.
- FR-10.9 Tombol aksi utama ditempatkan di bagian bawah layar (zona jempol); aksi destruktif (hapus, batal) meminta konfirmasi.
- FR-10.10 Feedback aksi (berhasil, gagal) ditampilkan sebagai toast singkat di dekat bagian bawah layar, tidak menutupi Bottom Navigation.
- FR-10.11 Konten tidak tertutup Top Bar, Bottom Navigation, maupun *notch*/*safe area* perangkat (`env(safe-area-inset-*)`).
- FR-10.12 *(Could Have)* Aplikasi dapat dipasang ke layar utama (PWA): memiliki `manifest.json` (nama, ikon, warna tema, `display: standalone`) dan service worker sederhana untuk meng-cache aset statis.
- FR-10.13 Pada layar tablet dan desktop, konten tampil dalam kontainer berlebar maksimum (±480 px untuk tampilan aplikasi) atau grid yang diperlebar; tampilan ini tidak menjadi prioritas.

## 7. Non-Functional Requirements

| Kategori | Kebutuhan |
|---|---|
| **Usability** | Dapat dioperasikan dengan satu tangan; tombol utama berada di zona jempol; ukuran area ketuk ≥ 44×44 px; pesan error dan validasi jelas dalam Bahasa Indonesia; jenis keyboard sesuai input. |
| **Performance** | Halaman katalog termuat < 2 detik pada jaringan lokal dan < 3 detik pada 4G; gambar memakai `loading="lazy"` dan ukuran yang wajar; pencarian memakai debounce; data tidak diambil berulang tanpa perlu; total aset awal dijaga ringan. |
| **Responsiveness** | Pendekatan **mobile-first**: dirancang dan diuji utama pada lebar 360, 390, dan 430 px; tablet dan desktop sekunder. Mendukung orientasi potret (utama); lanskap tidak boleh merusak tata letak. |
| **Compatibility** | Berjalan di Chrome Android dan Safari iOS versi terbaru, serta browser modern desktop (Chrome, Firefox, Edge) sebagai pelengkap. |
| **Data Persistence** | Data disimpan di `db.json` melalui json-server dan tetap ada setelah server dimatikan. Frontend tidak menulis file langsung; semua perubahan lewat REST API. |
| **Reliability** | Setiap pemanggilan `fetch` ditangani dengan `try/catch` serta menampilkan state loading dan error. Operasi checkout (kurangi stok, buat pesanan, kosongkan keranjang) tidak atomik karena json-server tidak mendukung transaksi; urutannya dijaga agar pesanan dibuat sebelum stok dikurangi. |
| **Maintainability** | Kode dipisah per modul; seluruh pemanggilan API dikumpulkan dalam satu file (`api.js`) agar mudah diganti dengan backend sungguhan. |
| **Security (Keterbatasan)** | Password tersimpan sebagai teks biasa di `db.json` dan API terbuka tanpa otorisasi sehingga siapa pun dapat mengubah data lewat URL API. Cocok untuk tugas, demo, dan pembelajaran, **bukan untuk produksi**. Input pengguna di-escape saat dirender ke DOM untuk mencegah XSS. |
| **Accessibility** | Kontras warna terbaca di bawah cahaya terang; elemen interaktif punya label yang jelas; gambar memiliki atribut `alt`; HTML memakai tag semantik; teks tidak lebih kecil dari 14 px. |
| **Portability** | Dijalankan lokal dengan Node.js (json-server) dan static server; dapat di-deploy dengan mengganti json-server ke backend sungguhan. |

## 8. Tech Stack

- HTML
- Tailwind CSS
- Vanilla JavaScript
- JSON (`db.json`) + json-server sebagai penyimpan data dan REST API tiruan

**Catatan implementasi:**

- Browser tidak dapat menulis ke file JSON secara langsung, sehingga dibutuhkan json-server (Node.js) sebagai perantara. `npx json-server` dapat dijalankan tanpa instalasi global.
- Tailwind dapat dimuat lewat CDN (cepat untuk tugas) atau Tailwind CLI; gunakan pendekatan mobile-first (kelas dasar untuk mobile, `md:`/`lg:` untuk layar lebih besar).
- Setiap halaman wajib memuat `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">` dan `<meta name="theme-color">`.
- **Pengujian di HP:** jalankan frontend dan json-server agar dapat diakses dari jaringan Wi-Fi yang sama (contoh: `--host 0.0.0.0`), lalu buka alamat IP laptop dari HP. Alamat dasar API disimpan di satu konstanta (`API_BASE`) di `api.js`, **jangan memakai `localhost`** karena di HP akan menunjuk ke HP itu sendiri.
- Selama pengembangan, gunakan mode responsif DevTools (iPhone SE, Pixel 7, iPhone 14 Pro Max) dan uji langsung di HP asli.
- **Opsional PWA:** tambahkan `manifest.json` dan `sw.js` sederhana. Service worker hanya meng-cache aset statis (HTML, CSS, JS); data tetap diambil dari API.
- **Opsional aplikasi native:** frontend dapat dibungkus menjadi aplikasi Android/iOS memakai Capacitor di tahap lanjut tanpa menulis ulang kode.
- Frontend dibuka lewat static server (misalnya ekstensi Live Server di VS Code) karena `fetch()` tidak berjalan stabil dari protokol `file://`.
- Jalankan API: `npx json-server --watch db.json --port 3000` (sesuaikan dengan versi json-server yang dipakai).
- **Alternatif tanpa Node.js:** simpan data awal di `db.json` yang dibaca lewat `fetch()` (read-only), lalu simpan perubahan (akun, keranjang, pesanan) di `localStorage`. Lebih mudah dijalankan, tetapi data tidak benar-benar tersimpan di file JSON.

**Endpoint utama (json-server):**

| Koleksi | Endpoint | Kegunaan |
|---|---|---|
| `users` | `/users` | Register dan login |
| `products` | `/products` | Katalog dan manajemen produk |
| `categories` | `/categories` | Daftar kategori untuk filter |
| `carts` | `/carts` | Keranjang per pengguna |
| `orders` | `/orders` | Pesanan, riwayat, dan status |

**Contoh struktur `db.json`:**

```json
{
  "users": [
    { "id": 1, "name": "Budi", "email": "budi@mail.com", "password": "123456", "role": "seller" }
  ],
  "categories": [
    { "id": 1, "name": "Fashion" }
  ],
  "products": [
    {
      "id": 1,
      "sellerId": 1,
      "name": "Kaos Polos",
      "description": "Kaos katun nyaman",
      "price": 75000,
      "stock": 20,
      "category": "Fashion",
      "image": "https://example.com/kaos.jpg",
      "createdAt": "2026-11-06T10:00:00Z"
    }
  ],
  "carts": [
    { "id": 1, "userId": 2, "productId": 1, "quantity": 2 }
  ],
  "orders": [
    {
      "id": 1,
      "orderNumber": "TKK-20261106-001",
      "buyerId": 2,
      "items": [
        { "productId": 1, "sellerId": 1, "name": "Kaos Polos", "price": 75000, "quantity": 2 }
      ],
      "shipping": { "name": "Ani", "phone": "08123456789", "address": "Jl. Mawar No. 1" },
      "paymentMethod": "Transfer Bank",
      "subtotal": 150000,
      "shippingCost": 10000,
      "total": 160000,
      "status": "Diproses",
      "createdAt": "2026-11-06T10:30:00Z"
    }
  ]
}
```

**Usulan struktur folder:**

```
tokoko/
├── index.html            # Katalog
├── product.html          # Detail produk
├── cart.html             # Keranjang
├── checkout.html         # Checkout
├── orders.html           # Riwayat pesanan
├── login.html
├── register.html
├── seller/
│   ├── products.html     # Kelola produk
│   └── orders.html       # Pesanan masuk
├── js/
│   ├── api.js            # Semua pemanggilan fetch ke json-server
│   ├── auth.js
│   ├── products.js
│   ├── cart.js
│   ├── orders.js
│   └── utils.js
├── assets/
│   └── images/
├── manifest.json         # (opsional) PWA
├── sw.js                 # (opsional) service worker
├── db.json
└── prd.md
```

## 9. Acceptance Criteria

**Autentikasi**
- [ ] User dapat mendaftar dengan data valid; akun baru muncul di `db.json` dan dapat langsung login.
- [ ] Pendaftaran dengan email yang sudah terdaftar ditolak dengan pesan error.
- [ ] Setelah login, navbar menampilkan menu sesuai peran; setelah logout, menu kembali ke mode tamu.
- [ ] Pembeli yang membuka halaman Penjual dialihkan ke halaman yang sesuai.

**Katalog, Pencarian & Detail**
- [ ] Produk dari `db.json` tampil sebagai card dengan foto, nama, harga (format `Rp 125.000`), dan penjual.
- [ ] Mengetik di kolom pencarian memperbarui daftar produk tanpa reload halaman.
- [ ] Filter kategori, sorting, dan pencarian dapat dipakai bersamaan dan menghasilkan daftar yang benar.
- [ ] Produk dengan stok 0 menampilkan `Stok Habis` dan tidak bisa ditambahkan ke keranjang.
- [ ] Halaman detail menampilkan seluruh informasi produk dan jumlah tidak dapat melebihi stok.
- [ ] Jika json-server mati, halaman menampilkan pesan error dan tombol `Coba Lagi` (bukan halaman kosong).

**Keranjang & Checkout**
- [ ] Menambah produk ke keranjang memperbarui badge jumlah di navbar dan tersimpan di `db.json`.
- [ ] Mengubah jumlah atau menghapus item memperbarui subtotal dan total seketika.
- [ ] Isi keranjang tetap ada setelah halaman di-refresh.
- [ ] Checkout dengan data valid membuat pesanan baru di `orders`, mengurangi stok di `products`, dan mengosongkan keranjang.
- [ ] Checkout dengan form tidak lengkap ditolak dengan pesan validasi.
- [ ] Halaman konfirmasi menampilkan nomor pesanan unik.

**Pesanan**
- [ ] Pesanan baru muncul di riwayat pembeli dengan status `Diproses`.
- [ ] Pembeli dapat membatalkan pesanan `Diproses` dan stok produk kembali.
- [ ] Penjual melihat pesanan yang berisi produk miliknya dan dapat mengubah statusnya.
- [ ] Perubahan status oleh penjual terlihat di riwayat pesanan pembeli.

**Manajemen Produk (Penjual)**
- [ ] Penjual dapat menambah produk dan produk tersebut muncul di katalog serta tersimpan di `db.json`.
- [ ] Penjual dapat mengedit dan menghapus hanya produk miliknya sendiri.
- [ ] Form menolak harga atau stok negatif dan kolom wajib yang kosong.

**Mobile UX**
- [ ] Bottom Navigation tampil di semua halaman utama, menu aktif ter-highlight, dan badge keranjang akurat.
- [ ] Semua tombol dan tautan dapat diketuk dengan nyaman (≥ 44×44 px) tanpa salah ketuk.
- [ ] Tombol `Tambah ke Keranjang` dan `Checkout` selalu terlihat di bagian bawah layar tanpa menutupi konten penting.
- [ ] Filter dan sorting terbuka sebagai bottom sheet dan dapat ditutup dengan mudah.
- [ ] Keyboard HP yang muncul sesuai jenis input (email, telepon, angka) dan form tidak tertutup keyboard saat mengetik.
- [ ] Tampilan tidak terpotong oleh notch atau safe area pada perangkat iPhone dan Android.
- [ ] Aplikasi dapat dibuka dan dijalankan penuh dari HP melalui alamat IP jaringan lokal.
- [ ] *(Opsional)* Aplikasi dapat dipasang ke layar utama dan terbuka dalam mode layar penuh.

**Umum**
- [ ] Tampilan tidak rusak (tidak ada scroll horizontal) pada lebar layar 360px, 390px, dan 430px; tampilan 768px dan 1280px tetap dapat dipakai.
- [ ] Data tetap ada di `db.json` setelah server dimatikan lalu dijalankan kembali.
- [ ] Tidak ada error pada console browser saat alur utama dijalankan.

## 10. Future Improvements

- Mode dark/light.
- Tampilan tablet dan desktop yang dioptimalkan.
- Notifikasi push untuk status pesanan.
- Dukungan offline lebih lengkap (cache data produk).
- Dibungkus menjadi aplikasi native (Android/iOS) dengan Capacitor.
- Backend dan database sungguhan (autentikasi aman, password ter-hash, otorisasi API).
- Upload foto produk ke penyimpanan sungguhan.
- Ulasan dan rating produk.
- Wishlist / produk favorit.
- Integrasi payment gateway dan ongkir real-time.
- Chat antara pembeli dan penjual.
