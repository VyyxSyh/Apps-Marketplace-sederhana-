<div align="center">

# 🛍️ TOKOKO

### Marketplace sederhana, langsung di browser.

Web app marketplace yang mempertemukan penjual dan pembeli. Mobile-first, tanpa backend. Data tersimpan di browser (`localStorage`). Styling memakai Tailwind CSS hasil build dan CSS kustom.

![HTML](https://img.shields.io/badge/HTML-CSS%20%2B%20JavaScript-2878d0)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38B2AC)
![Responsive](https://img.shields.io/badge/layout-mobile--first-1769aa)
![Status](https://img.shields.io/badge/status-in%20development-orange)

</div>

---

## ✨ Tentang

TOKOKO adalah prototipe marketplace untuk kebutuhan sehari-hari. Penjual bisa menambah dan mengelola produk, pembeli bisa mencari, membeli, dan melacak pesanan. Antarmuka mobile-first memakai warna hangat pasar lokal, hijau daun, dan aksen bata.

## 🛒 Fitur (Target)

- Autentikasi simulasi: register, login, logout sebagai pembeli atau penjual.
- Katalog produk, pencarian, filter kategori, dan pengurutan harga.
- Detail produk, keranjang per pengguna, dan checkout simulasi.
- Riwayat pesanan serta pembatalan pesanan yang masih diproses.
- Manajemen produk untuk akun penjual.
- Layout mobile-first, tetap dapat dipakai di tablet dan desktop.

## 🚀 Menjalankan

> Aplikasi memakai Tailwind CSS yang sudah dibangun ke `dist/tailwind.css`; file tersebut dimuat langsung oleh halaman dan harus disertakan saat konversi Web-to-APK. Untuk memuat `data.json`, gunakan static server seperti Live Server VS Code.

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
├── index.html      # Markup SPA dan seed fallback
├── app.js          # Tampilan, alur aplikasi, validasi
├── store.js        # Pembacaan dan penyimpanan localStorage
├── stylesheet.css  # Style khusus TOKOKO
├── dist/            # CSS Tailwind hasil build, dibutuhkan saat runtime
├── data.json       # Seed data awal, termasuk path foto produk
├── src/images/     # Folder untuk foto produk yang kamu tambahkan
├── PRD.md          # Kebutuhan produk
├── README.md       # Dokumentasi
└── LICENSE         # Lisensi MIT
```

## 🖼️ Foto produk

Taruh foto di `src/images/`, lalu isi field `image` produk di `data.json`, misalnya `src/images/headphone.jpg`. Produk demo tertentu memakai foto sementara dari Unsplash, jadi perlu internet. Ganti URL itu dengan path lokal kalau sudah punya fotomu sendiri. Format lokal yang didukung: JPG, PNG, WebP.

## 💾 Penyimpanan data

Semua perubahan (akun, produk, keranjang, pesanan) tersimpan di **`localStorage`** browser. `data.json` menyediakan data awal. Saat dibuka langsung lewat `file://`, aplikasi memakai seed fallback di `index.html` karena browser dapat memblokir `fetch()` ke file JSON. Data hanya tersedia pada browser dan perangkat yang sama.

## ⚠️ Catatan

- Ini adalah **prototipe untuk demo dan pembelajaran**, bukan untuk produksi.
- Password tersimpan sebagai teks biasa di localStorage. **Jangan masukkan data pribadi sensitif.**
- Produk, harga, dan transaksi adalah simulasi.

## 📄 Lisensi

MIT — lihat [LICENSE](LICENSE).
