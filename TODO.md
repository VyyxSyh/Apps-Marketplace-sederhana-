
### Autentikasi
- [ ] User dapat mendaftar dengan data valid; akun baru tersimpan di localStorage dan dapat langsung login.
- [ ] Pendaftaran dengan email yang sudah terdaftar ditolak dengan pesan error.
- [ ] Setelah login, navbar menampilkan menu sesuai peran; setelah logout, menu kembali ke mode tamu.
- [ ] Pembeli yang membuka halaman Penjual dialihkan ke halaman yang sesuai.

### Katalog, Pencarian & Detail
- [ ] Produk dari localStorage tampil sebagai card dengan emoji, nama, harga (format `Rp 125.000`), dan penjual.
- [ ] Mengetik di kolom pencarian memperbarui daftar produk tanpa reload halaman.
- [ ] Filter kategori, sorting, dan pencarian dapat dipakai bersamaan dan menghasilkan daftar yang benar.
- [ ] Produk dengan stok 0 menampilkan `Stok Habis` dan tidak bisa ditambahkan ke keranjang.
- [ ] Halaman detail menampilkan seluruh informasi produk dan jumlah tidak dapat melebihi stok.

### Keranjang & Checkout
- [ ] Menambah produk ke keranjang memperbarui badge jumlah di navbar dan tersimpan di localStorage.
- [ ] Mengubah jumlah atau menghapus item memperbarui subtotal dan total seketika.
- [ ] Isi keranjang tetap ada setelah halaman di-refresh.
- [ ] Checkout dengan data valid membuat pesanan baru, mengurangi stok, dan mengosongkan keranjang.
- [ ] Checkout dengan form tidak lengkap ditolak dengan pesan validasi.
- [ ] Halaman konfirmasi menampilkan nomor pesanan unik.

### Pesanan
- [ ] Pesanan baru muncul di riwayat pembeli dengan status `Diproses`.
- [ ] Pembeli dapat membatalkan pesanan `Diproses` dan stok produk kembali.
- [ ] *(Should Have)* Penjual melihat pesanan yang berisi produk miliknya dan dapat mengubah statusnya.

### Manajemen Produk (Penjual)
- [ ] Penjual dapat menambah produk dan produk tersebut muncul di katalog.
- [ ] Penjual dapat mengedit dan menghapus hanya produk miliknya sendiri.
- [ ] Form menolak harga atau stok negatif dan kolom wajib yang kosong.

### Mobile UX
- [ ] Bottom Navigation tampil di semua halaman utama, menu aktif ter-highlight, dan badge keranjang akurat.
- [ ] Semua tombol dan tautan dapat diketuk dengan nyaman (≥ 44×44 px) tanpa salah ketuk.
- [ ] Tombol `Tambah ke Keranjang` dan `Checkout` selalu terlihat di bagian bawah layar.
- [ ] Filter dan sorting terbuka sebagai bottom sheet dan dapat ditutup dengan mudah.
- [ ] Keyboard HP yang muncul sesuai jenis input.
- [ ] Tampilan tidak terpotong oleh notch atau safe area.

### Umum
- [ ] Tampilan tidak rusak (tidak ada scroll horizontal) pada lebar layar 360px, 390px, dan 430px.
- [ ] Data tetap ada setelah halaman di-refresh.
- [ ] Tidak ada error pada console browser saat alur utama dijalankan.