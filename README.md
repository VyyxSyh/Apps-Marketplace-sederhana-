<div align="center">

# 🛍️ TokoKita

### Belanja kebutuhan harian, simpel dari satu aplikasi.

Marketplace desktop sederhana dengan tampilan mobile, dibuat menggunakan Python dan Tkinter.

![Python](https://img.shields.io/badge/Python-3.x-3776AB?logo=python&logoColor=white)
![UI](https://img.shields.io/badge/UI-Tkinter-1769aa)
![Status](https://img.shields.io/badge/status-prototype-blue)
![License](https://img.shields.io/badge/license-MIT-green)

</div>

---

## ✨ Tentang

TokoKita adalah prototipe aplikasi belanja kebutuhan sehari-hari. Pengguna dapat melihat produk sembako, obat dan P3K, pakaian, serta perlengkapan rumah tangga dalam satu antarmuka yang ringkas.

> Dibuat sebagai proyek pembelajaran GUI Python. Tampilan terinspirasi aplikasi marketplace; bukan aplikasi resmi Shopee atau toko sungguhan.

## 📱 Fitur

- **Katalog kebutuhan harian** — sembako, kesehatan, pakaian, dan rumah tangga.
- **Cari & filter** — temukan produk lewat nama atau kategori.
- **Info produk** — harga, diskon, rating, jumlah terjual, benefit, dan lokasi.
- **Keranjang interaktif** — tambah atau kurangi jumlah produk, total dihitung otomatis.
- **Checkout simulasi** — coba alur pemesanan tanpa transaksi sungguhan.
- **UI responsif** — grid produk menyesuaikan ukuran jendela; daftar produk dapat di-scroll.
- **Tema biru flat** — tampilan ringan dengan elemen rounded.

## 🚀 Mulai

### Persyaratan

- Python 3
- Tkinter (umumnya sudah tersedia pada instalasi Python desktop)

Tidak memerlukan dependensi pihak ketiga.

### Jalankan

```bash
git clone <url-repository>
cd <folder-repository>
python toko_gui.py
```

Windows juga dapat menjalankan:

```bash
py toko_gui.py
```

## 🧭 Penggunaan

1. Ketik nama produk di kolom pencarian, atau pilih kategori.
2. Tekan **+ Keranjang** pada produk yang diinginkan.
3. Buka ikon keranjang untuk melihat barang dan mengatur kuantitas.
4. Tekan **Checkout** untuk mencoba konfirmasi pesanan.

## 🗂️ Struktur

```text
.
├── toko_gui.py   # Aplikasi GUI dan data produk contoh
├── README.md     # Dokumentasi proyek
└── LICENSE       # Lisensi MIT
```

## ⚠️ Batasan

Proyek ini masih berupa prototipe lokal. Produk dan harga tersimpan sebagai data contoh di dalam kode. Login, chat, pembayaran, inventori, pemesanan nyata, dan integrasi pengiriman belum tersedia.

## 📄 Lisensi

Dirilis di bawah [MIT License](LICENSE).
