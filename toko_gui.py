import tkinter as tk
from tkinter import messagebox


PRODUCTS = [
    ("Beras Premium 5 kg", "Sembako", 74800, 89000, "🍚", "4.9", "2,4 rb", "Gratis ongkir", "Jakarta Barat", "16%"),
    ("Minyak Goreng 2 Liter", "Sembako", 34800, 42000, "🫗", "4.9", "1,8 rb", "Belanja hemat", "Jakarta Utara", "17%"),
    ("Telur Ayam 1 kg", "Sembako", 29500, 35000, "🥚", "4.8", "986", "Segar pilihan", "Tangerang", "15%"),
    ("Mi Instan Isi 5", "Sembako", 14500, 18000, "🍜", "4.9", "3,1 rb", "Gratis ongkir", "Bandung", "19%"),
    ("Paket P3K Keluarga", "Obat & P3K", 39500, 52000, "🩹", "4.8", "642", "Isi lengkap", "Surabaya", "24%"),
    ("Vitamin C Tablet", "Obat & P3K", 22000, 28000, "💊", "4.9", "1,5 rb", "Produk bersegel", "Jakarta Pusat", "21%"),
    ("Masker Medis Isi 50", "Obat & P3K", 18000, 25000, "😷", "4.8", "817", "Stok tersedia", "Depok", "28%"),
    ("Kaos Katun Unisex", "Pakaian", 59000, 89000, "👕", "4.7", "317", "Voucher toko", "Bogor", "34%"),
    ("Deterjen Cair 1 Liter", "Rumah Tangga", 27500, 35000, "🧴", "4.9", "1,2 rb", "Gratis ongkir", "Bekasi", "21%"),
    ("Sabun Mandi Isi 3", "Rumah Tangga", 24000, 30000, "🧼", "4.8", "728", "Paket hemat", "Yogyakarta", "20%"),
    ("Peralatan Dapur 5 pcs", "Rumah Tangga", 68000, 99000, "🍳", "4.7", "406", "Diskon toko", "Semarang", "31%"),
]
ORANGE = "#2878d0"
GREEN = "#1769aa"

class ShopApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("TokoKita — Belanja Online")
        self.geometry("390x844")
        self.minsize(350, 650)
        self.configure(bg="white")
        self.cart = {}
        self.category = "Semua"
        self.query = tk.StringVar()
        self.product_columns = 2
        self._build()
        self._show_products()

    def _build(self):
        header = tk.Frame(self, bg="white", padx=12, pady=9)
        header.pack(fill="x")
        searchbox = tk.Frame(header, bg="white", highlightbackground="#aaa", highlightthickness=1)
        searchbox.pack(side="left", fill="x", expand=True, ipady=4)
        tk.Label(searchbox, text="⌕", bg="white", fg="#666", font=("Arial", 17)).pack(side="left", padx=(7, 2))
        search = tk.Entry(searchbox, textvariable=self.query, font=("Arial", 11),
                          relief="flat", bd=0)
        search.pack(side="left", fill="x", expand=True, ipady=4)
        search.bind("<KeyRelease>", lambda _event: self._show_products())
        tk.Button(searchbox, text="Cari", command=self._show_products, bg="white", fg="#111",
                  relief="flat", font=("Arial", 11, "bold")).pack(side="right", padx=4)
        self.header_icons = []
        for icon in ("✉", "♧"):
            label = tk.Label(header, text=icon, bg="white", fg="#222", font=("Arial", 17))
            label.pack(side="left", padx=(10, 0))
            self.header_icons.append(label)
        self.cart_button = tk.Button(header, text="🛒", command=self._open_cart, bg="white",
                                     fg="#222", relief="flat", font=("Arial", 17), padx=4)
        self.cart_button.pack(side="left", padx=(7, 0))

        self.canvas = tk.Canvas(self, bg="white", highlightthickness=0)
        self.canvas.pack(fill="both", expand=True)
        self.content = tk.Frame(self.canvas, bg="white")
        self.content_window = self.canvas.create_window((0, 0), window=self.content, anchor="nw")
        self.content.bind("<Configure>", lambda _e: self.canvas.configure(scrollregion=self.canvas.bbox("all")))
        self.canvas.bind("<Configure>", self._resize_content)
        self.canvas.bind_all("<MouseWheel>", lambda e: self.canvas.yview_scroll(-int(e.delta / 120), "units"))

        promo = tk.Frame(self.content, bg="#dceeff", height=126)
        promo.pack(fill="x")
        promo.pack_propagate(False)
        tk.Label(promo, text="TOKOKITA  •  KEBUTUHAN HARIAN\n\nBelanja kebutuhan pokok\nPraktis, langsung dari rumah", bg="#dceeff", fg="#111",
                 justify="left", font=("Arial", 13, "bold")).pack(side="left", padx=16)
        tk.Label(promo, text="🛒\n🏠", bg="#dceeff", fg=ORANGE, font=("Arial", 30, "bold")).pack(side="right", padx=20)

        account = tk.Frame(self.content, bg="white", padx=15, pady=10)
        account.pack(fill="x")
        tk.Label(account, text="🏠  Semua kebutuhan, satu toko\n      Sembako, kesehatan, dan rumah", bg="white",
                 fg="#222", justify="left", font=("Arial", 10, "bold")).pack(side="left")
        tk.Label(account, text="Siap antar", bg=GREEN, fg="white",
                 font=("Arial", 9, "bold"), padx=10, pady=5).pack(side="right")

        categories = tk.Frame(self.content, bg="white", padx=8, pady=5)
        categories.pack(fill="x")
        for icon, label, category in (("☰", "Semua", "Semua"), ("🍚", "Sembako", "Sembako"),
                                      ("💊", "Obat & P3K", "Obat & P3K"), ("👕", "Pakaian", "Pakaian"),
                                      ("🏠", "Rumah Tangga", "Rumah Tangga")):
            item = tk.Frame(categories, bg="white")
            item.pack(side="left", expand=True, fill="x")
            circle = tk.Canvas(item, width=43, height=43, bg="white", highlightthickness=0)
            circle.pack()
            circle.create_oval(2, 2, 41, 41, fill="#e8f3ff", outline="#cfe4fa")
            circle.create_text(21, 21, text=icon, fill=GREEN, font=("Arial", 10, "bold"))
            circle.bind("<Button-1>", lambda _e, c=category: self._set_category(c))
            tk.Label(item, text=label, bg="white", fg="#222", font=("Arial", 7),
                     justify="center").pack(pady=(3, 0))

        self.cart_label = tk.Label(header, text="0", bg=ORANGE, fg="white", font=("Arial", 7, "bold"))
        self.cart_label.place(in_=self.cart_button, relx=1, rely=0, x=-2, y=1, anchor="ne")
        cart_summary = tk.Frame(self.content, bg="#f0f6fc", padx=10, pady=5)
        cart_summary.pack(fill="x", padx=8, pady=(5, 2))
        self.cart_text = tk.Label(cart_summary, text="Keranjang masih kosong", bg="#f0f6fc", fg="#777", font=("Arial", 8))
        self.cart_text.pack(side="left")
        self.total_label = tk.Label(cart_summary, text="Rp0", bg="#f0f6fc", fg=ORANGE, font=("Arial", 8, "bold"))
        self.total_label.pack(side="right")
        tk.Button(cart_summary, text="Checkout", command=self._checkout, bg=ORANGE, fg="white",
                  relief="flat", font=("Arial", 8, "bold"), padx=5).pack(side="right", padx=5)

        tabs = tk.Frame(self.content, bg="white", padx=10, pady=8)
        tabs.pack(fill="x")
        for label, category in (("Semua", "Semua"), ("Sembako", "Sembako"), ("Kesehatan", "Obat & P3K"), ("Rumah", "Rumah Tangga")):
            tk.Button(tabs, text=label, command=lambda c=category: self._set_category(c),
                      bg="white", fg=GREEN if label == "For You" else "#222", relief="flat",
                      font=("Arial", 9, "bold" if label == "For You" else "normal")).pack(side="left", expand=True)

        self.products_frame = tk.Frame(self.content, bg="white")
        self.products_frame.pack(fill="x", padx=8)
        self.bottom_nav = tk.Frame(self, bg="white", highlightbackground="#ddd", highlightthickness=1)
        self.bottom_nav.pack(fill="x", side="bottom")
        for icon, label in (("⬟", "Home"), ("▷", "Feed"), ("♡", "Mall"), ("▤", "Transaksi"), ("♙", "Akun")):
            tk.Button(self.bottom_nav, text=f"{icon}\n{label}", bg="white", fg=GREEN if label == "Home" else "#333",
                      relief="flat", font=("Arial", 9), pady=5).pack(side="left", expand=True, fill="x")

    def _resize_content(self, event):
        self.canvas.itemconfigure(self.content_window, width=event.width)
        columns = 3 if event.width >= 700 else 2
        if columns != self.product_columns:
            self.product_columns = columns
            self._show_products()
        compact = event.width < 390
        for icon in self.header_icons:
            icon.pack_configure(padx=(5 if compact else 10, 0))
        for button in self.bottom_nav.winfo_children():
            button.configure(font=("Arial", 8 if compact else 10))

    def _set_category(self, category):
        self.category = category
        self._show_products()

    def _show_products(self):
        for widget in self.products_frame.winfo_children():
            widget.destroy()
        self.products_frame.update_idletasks()
        matches = [p for p in PRODUCTS
                   if (self.category == "Semua" or p[1] == self.category)
                   and self.query.get().strip().lower() in p[0].lower()]
        if not matches:
            tk.Label(self.products_frame, text="Produk tidak ditemukan", bg="#f5f5f5",
                     fg="#777", font=("Arial", 12)).pack(pady=30)
            return
        for index, product in enumerate(matches):
            row, col = divmod(index, self.product_columns)
            name, category, price, old_price, icon, rating, sold, benefit, location, discount = product
            card = tk.Frame(self.products_frame, bg="white", padx=5, pady=5,
                            highlightbackground="#e9e9e9", highlightthickness=1)
            card.grid(row=row, column=col, sticky="nsew", padx=3, pady=4)
            picture = tk.Frame(card, bg="#eef6ff", height=112)
            picture.pack(fill="x", pady=(0, 6))
            picture.pack_propagate(False)
            tk.Label(picture, text=f"-{discount}", bg=ORANGE, fg="white",
                     font=("Arial", 8, "bold"), padx=4).place(x=0, y=0)
            tk.Label(picture, text=icon, bg="#eef6ff", font=("Segoe UI Emoji", 39)).place(relx=.5, rely=.51, anchor="center")
            tk.Label(card, text=name, bg="white", fg="#222", anchor="w",
                     font=("Arial", 9, "bold")).pack(fill="x")
            tk.Label(card, text=f"Rp{price:,}".replace(",", "."), bg="white",
                     fg=ORANGE, anchor="w", font=("Arial", 11, "bold")).pack(fill="x", pady=2)
            tk.Label(card, text=f"Rp{old_price:,}  •  ⭐ {rating}  •  {sold} terjual".replace(",", "."),
                     bg="white", fg="#777", anchor="w", font=("Arial", 6)).pack(fill="x")
            tk.Label(card, text=f"▣ {benefit}", bg="#e8f3ff", fg=GREEN,
                     anchor="w", font=("Arial", 7, "bold")).pack(fill="x", pady=(4, 2))
            tk.Label(card, text=f"📍 {location}", bg="white", fg="#777",
                     anchor="w", font=("Arial", 7)).pack(fill="x")
            tk.Button(card, text="+ Keranjang", command=lambda p=product: self._add(p),
                      bg=ORANGE, fg="white", relief="flat", font=("Arial", 8), pady=4).pack(fill="x", pady=(5, 0))
        for col in range(self.product_columns):
            self.products_frame.grid_columnconfigure(col, weight=1, uniform="product")

    def _add(self, product):
        self.cart[product[0]] = self.cart.get(product[0], 0) + 1
        self._update_cart()

    def _open_cart(self):
        window = tk.Toplevel(self)
        window.title("Keranjang belanja")
        window.geometry("340x430")
        window.configure(bg="white")
        tk.Label(window, text="Keranjang Belanja", bg="white", fg="#222",
                 font=("Arial", 16, "bold")).pack(anchor="w", padx=16, pady=14)
        items = tk.Frame(window, bg="white")
        items.pack(fill="both", expand=True, padx=12)
        total_label = tk.Label(window, bg="white", fg=ORANGE, font=("Arial", 12, "bold"))
        total_label.pack(anchor="e", padx=16, pady=8)

        def refresh():
            for widget in items.winfo_children():
                widget.destroy()
            total = 0
            for name, qty in list(self.cart.items()):
                product = next(p for p in PRODUCTS if p[0] == name)
                price = product[2]
                total += price * qty
                row = tk.Frame(items, bg="white", pady=7)
                row.pack(fill="x")
                tk.Label(row, text=f"{product[4]}  {name}\nRp{price:,}".replace(",", "."),
                         bg="white", fg="#333", justify="left", anchor="w",
                         font=("Arial", 9)).pack(side="left", fill="x", expand=True)
                tk.Button(row, text="−", command=lambda n=name: change(n, -1), width=2).pack(side="left")
                tk.Label(row, text=str(qty), bg="white", width=3).pack(side="left")
                tk.Button(row, text="+", command=lambda n=name: change(n, 1), width=2).pack(side="left")
            if not self.cart:
                tk.Label(items, text="Keranjang masih kosong", bg="white", fg="#888").pack(pady=25)
            total_label.config(text=f"Total: Rp{total:,}".replace(",", "."))
            self._update_cart()

        def change(name, delta):
            self.cart[name] += delta
            if self.cart[name] <= 0:
                del self.cart[name]
            refresh()

        def checkout():
            if not self.cart:
                messagebox.showinfo("Keranjang kosong", "Tambahkan produk sebelum checkout.", parent=window)
                return
            window.destroy()
            self._checkout()

        tk.Button(window, text="Checkout", command=checkout, bg=ORANGE, fg="white",
                  relief="flat", font=("Arial", 10, "bold"), pady=9).pack(fill="x", padx=16, pady=(0, 14))
        refresh()

    def _update_cart(self):
        count = sum(self.cart.values())
        total = sum(next(p[2] for p in PRODUCTS if p[0] == name) * qty
                    for name, qty in self.cart.items())
        lines = [f"{name} ×{qty}" for name, qty in self.cart.items()]
        self.cart_label.config(text=str(count))
        self.cart_text.config(text="  •  ".join(lines) if lines else "Keranjang masih kosong")
        self.total_label.config(text=f"Rp{total:,}".replace(",", "."))

    def _checkout(self):
        if not self.cart:
            messagebox.showinfo("Keranjang kosong", "Tambahkan produk sebelum checkout.")
            return
        total = sum(next(p[2] for p in PRODUCTS if p[0] == name) * qty
                    for name, qty in self.cart.items())
        messagebox.showinfo("Checkout", f"Pesanan berhasil dibuat!\nTotal: Rp{total:,}".replace(",", "."))
        self.cart.clear()
        self._update_cart()


if __name__ == "__main__":
    ShopApp().mainloop()
