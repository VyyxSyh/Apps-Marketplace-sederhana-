<div align="center">

# 🛍️ TokoKita

### Kebutuhan harian, tinggal klik.

Web app belanja kebutuhan harian dengan tampilan mobile-first. Bisa dibuka di browser atau dipasang sebagai aplikasi melalui platform web-to-app. Styling memakai Tailwind CSS CDN dan CSS khusus untuk komponen antarmuka.

![HTML](https://img.shields.io/badge/HTML-CSS%20%2B%20JavaScript-2878d0)
![Tailwind](https://img.shields.io/badge/Tailwind-CDN-38B2AC)
![Responsive](https://img.shields.io/badge/layout-responsive-1769aa)
![Status](https://img.shields.io/badge/status-prototype-blue)

</div>

---

## ✨ Tentang

TokoKita adalah prototipe marketplace untuk kebutuhan sehari-hari: sembako, obat dan P3K, pakaian, serta perlengkapan rumah. Antarmuka dirancang mobile-first dengan gaya flat, warna biru, dan kartu produk rounded.

## 🛒 Fitur

- Cari produk dan filter berdasarkan kategori.
- Lihat harga, diskon, rating, benefit, dan lokasi toko.
- Tambahkan produk ke keranjang, ubah jumlah, hitung total otomatis.
- Checkout demo dengan validasi nama dan alamat.
- Simpan riwayat pesanan dan nama profil secara lokal di browser.
- Tandai produk favorit.
- Chat dan notifikasi memiliki tampilan demo.
- Layout responsif untuk layar ponsel maupun desktop.

## 🚀 Menjalankan

> TokoKita tidak membutuhkan instalasi paket atau server backend. Buka `index.html` langsung di browser. Koneksi internet diperlukan untuk memuat Tailwind CSS CDN.

Untuk mengemas menjadi aplikasi, unggah/deploy file web ini ke layanan web-to-app milikmu. File utama aplikasi adalah `index.html`.

## 🧭 Alur penggunaan

1. Cari produk atau pilih kategori.
2. Tekan **+ Keranjang** untuk menambahkan barang.
3. Buka ikon keranjang untuk mengatur jumlah dan melihat total.
4. Tekan **Lanjut checkout**, isi nama dan alamat, lalu buat pesanan demo.

## 🗂️ Struktur proyek

```text
.
├── index.html   # Web app: markup, style, dan interaksi
├── toko_gui.py  # Versi GUI Python/Tkinter sebelumnya
├── README.md    # Dokumentasi proyek
└── LICENSE      # Lisensi MIT
```

## ⚠️ Catatan prototipe

Produk dan harga adalah data contoh. Keranjang hanya tersimpan selama halaman terbuka; profil dan riwayat demo tersimpan di `localStorage` browser. Tidak ada akun nyata, pembayaran, inventori, chat toko, atau pengiriman sungguhan. Jangan masukkan data pribadi sensitif.

## 📄 Lisensi

MIT — lihat [LICENSE](LICENSE).
