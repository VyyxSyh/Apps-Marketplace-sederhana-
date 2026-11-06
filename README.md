<div align="center">

# 🛍️ TOKOKO

### Marketplace sederhana, langsung di browser.

Web app marketplace yang mempertemukan penjual dan pembeli. Mobile-first, tanpa backend — cukup buka `index.html`. Data tersimpan di browser (`localStorage`). Styling memakai Tailwind CSS CDN dan CSS kustom.

![HTML](https://img.shields.io/badge/HTML-CSS%20%2B%20JavaScript-2878d0)
![Tailwind](https://img.shields.io/badge/Tailwind-CDN-38B2AC)
![Responsive](https://img.shields.io/badge/layout-mobile--first-1769aa)
![Status](https://img.shields.io/badge/status-in%20development-orange)

</div>

---

## ✨ Tentang

TOKOKO adalah prototipe marketplace untuk kebutuhan sehari-hari. Penjual bisa menambah dan mengelola produk, pembeli bisa mencari, membeli, dan melacak pesanan. Antarmuka dirancang mobile-first dengan gaya flat, warna biru, dan kartu produk rounded.

## 🛒 Fitur (Target)

- **Autentikasi simulasi** — register, login, logout dengan peran Pembeli atau Penjual.
- **Katalog produk** — grid card dengan emoji, nama, harga, diskon, rating, dan lokasi toko.
- **Detail produk** — info lengkap, pilih jumlah, tambah ke keranjang atau langsung beli.
- **Pencarian, filter & sorting** — cari nama produk, filter kategori, urutkan harga.
- **Keranjang belanja** — tambah/ubah jumlah/hapus item, total otomatis, persisten di browser.
- **Checkout** — isi data pengiriman, pilih metode bayar (simulasi), buat pesanan.
- **Riwayat pesanan** — daftar pesanan, status, detail, dan pembatalan.
- **Manajemen produk (Penjual)** — tambah, edit, hapus produk milik sendiri.
- **Layout responsif** — optimal di layar 360–430 px, tetap dapat dipakai di tablet dan desktop.

## 🚀 Menjalankan

> Tidak memerlukan Node.js, npm, atau server apapun. Buka `index.html` langsung di browser. Koneksi internet diperlukan untuk memuat Tailwind CSS CDN.

## 🧭 Alur penggunaan

**Pembeli:**

1. Register/login sebagai Pembeli.
2. Cari produk atau pilih kategori.
3. Tekan **+ Keranjang** atau buka detail produk.
4. Buka keranjang, atur jumlah, lihat total.
5. Tekan **Checkout**, isi nama dan alamat, buat pesanan.
6. Lihat riwayat pesanan di menu Pesanan.

**Penjual:**

1. Register/login sebagai Penjual.
2. Tambah produk baru dari menu Produk Saya.
3. Edit atau hapus produk milik sendiri.

## 🗂️ Struktur proyek

```text
.
├── index.html         # Markup utama (SPA)
├── store.js           # Data layer: baca/tulis localStorage, load seed
├── app.js             # Logika UI, render, event handling
├── stylesheet.css     # Style kustom di luar Tailwind
├── data.json          # Seed data awal (produk, kategori, user contoh)
├── PRD.md             # Dokumen kebutuhan produk
├── README.md          # Dokumentasi proyek
└── LICENSE            # Lisensi MIT
```

## 💾 Penyimpanan data

Semua data (user, produk, keranjang, pesanan) disimpan di **`localStorage`** browser. File `data.json` berisi data awal yang dimuat saat pertama kali dibuka atau saat data di-reset. Tidak ada database atau server — data bertahan selama browser tidak di-clear.

## ⚠️ Catatan

- Ini adalah **prototipe untuk demo dan pembelajaran**, bukan untuk produksi.
- Password tersimpan sebagai teks biasa di localStorage — **jangan masukkan data pribadi sensitif**.
- Produk, harga, dan transaksi adalah simulasi.

## 📄 Lisensi

MIT — lihat [LICENSE](LICENSE).
