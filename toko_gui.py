import tkinter as tk
from tkinter import messagebox
from math import cos, pi, sin


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
BG = "#f5f8fc"
PALE_BLUE = "#eaf3ff"
TEXT = "#172b4d"


class RoundButton(tk.Canvas):
    def __init__(self, parent, text, command, bg=ORANGE, fg="white", width=110, height=34, font_size=9):
        super().__init__(parent, width=width, height=height, bg=parent.cget("bg"),
                         highlightthickness=0, bd=0, cursor="hand2")
        self.command, self.color = command, bg
        self.shape = self.create_polygon(self._points(width, height, 12), smooth=False,
                                         fill=bg, outline=bg)
        self.label = self.create_text(width / 2, height / 2, text=text, fill=fg,
                                      font=("Arial", font_size, "bold"))
        self.bind("<Button-1>", lambda _e: self.command())
        self.tag_bind(self.label, "<Button-1>", lambda _e: self.command())
        self.bind("<Enter>", lambda _e: self.itemconfigure(self.shape, fill="#1d65b5"))
        self.bind("<Leave>", lambda _e: self.itemconfigure(self.shape, fill=self.color))

    @staticmethod
    def _points(width, height, radius):
        radius = min(radius, width / 2, height / 2)
        points = []
        for cx, cy, start in ((width-radius, radius, -90),
                              (width-radius, height-radius, 0),
                              (radius, height-radius, 90),
                              (radius, radius, 180)):
            for step in range(9):
                angle = (start + step * 90 / 8) * pi / 180
                points.extend((cx + radius * cos(angle), cy + radius * sin(angle)))
        return points


class RoundedPanel(tk.Canvas):
    def __init__(self, parent, bg="white", radius=14, padding=7):
        super().__init__(parent, height=40, bg=parent.cget("bg"), highlightthickness=0, bd=0)
        self.radius, self.padding = radius, padding
        self.shape = self.create_polygon(0, 0, 1, 1, fill=bg, outline="")
        self.content = tk.Frame(self, bg=bg)
        self.window = self.create_window(padding, padding, window=self.content, anchor="nw")
        self.content.bind("<Configure>", self._resize)
        self.bind("<Configure>", self._resize)

    def _resize(self, _event=None):
        width = max(self.winfo_width(), 1)
        height = max(self.content.winfo_reqheight() + 2 * self.padding, 1)
        self.configure(height=height)
        self.coords(self.shape, *RoundButton._points(width, height, self.radius))
        self.coords(self.window, self.padding, self.padding)
        self.itemconfigure(self.window, width=max(width - 2 * self.padding, 1))


class ShopApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("TokoKita — Belanja Online")
        self.geometry("390x844")
        self.minsize(350, 650)
        self.configure(bg=BG)
        self.cart = {}
        self.category = "Semua"
        self.query = tk.StringVar()
        self.product_columns = 2
        self._build()
        self._show_products()

    def _build(self):
        header = tk.Frame(self, bg="white", padx=12, pady=9)
        header.pack(fill="x")
        searchbox = tk.Frame(header, bg="#f5f7fa", highlightbackground="#dbe3ef", highlightthickness=1)
        searchbox.pack(side="left", fill="x", expand=True, ipady=4)
        tk.Label(searchbox, text="⌕", bg="#f5f7fa", fg="#66758a", font=("Arial", 17)).pack(side="left", padx=(7, 2))
        search = tk.Entry(searchbox, textvariable=self.query, font=("Arial", 11),
                          relief="flat", bd=0, bg="#f5f7fa", fg=TEXT, insertbackground=ORANGE)
        search.pack(side="left", fill="x", expand=True, ipady=4)
        search.bind("<KeyRelease>", lambda _event: self._show_products())
        tk.Button(searchbox, text="Cari", command=self._show_products, bg="#f5f7fa", fg=ORANGE,
                  activebackground=PALE_BLUE, relief="flat", bd=0, cursor="hand2",
                  font=("Arial", 10, "bold")).pack(side="right", padx=4)
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
        tk.Label(promo, text="TOKOKITA  •  KEBUTUHAN HARIAN\n\nBelanja kebutuhan pokok\nPraktis, langsung dari rumah", bg="#dceeff", fg=TEXT,
                 justify="left", font=("Arial", 13, "bold")).pack(side="left", padx=16)
        tk.Label(promo, text="🛒\n🏠", bg="#dceeff", fg=ORANGE, font=("Arial", 30, "bold")).pack(side="right", padx=20)

        account = tk.Frame(self.content, bg="white", padx=15, pady=12)
        account.pack(fill="x")
        tk.Label(account, text="🏠  Semua kebutuhan, satu toko\n      Sembako, kesehatan, dan rumah", bg="white",
                 fg=TEXT, justify="left", font=("Arial", 10, "bold")).pack(side="left")
        RoundButton(account, "Siap antar", lambda: None, bg=GREEN, width=88, height=30, font_size=8).pack(side="right")

        categories = tk.Frame(self.content, bg="white", padx=8, pady=5)
        categories.pack(fill="x")
        for icon, label, category in (("☰", "Semua", "Semua"), ("🍚", "Sembako", "Sembako"),
                                      ("💊", "Obat & P3K", "Obat & P3K"), ("👕", "Pakaian", "Pakaian"),
                                      ("🏠", "Rumah Tangga", "Rumah Tangga")):
            item = tk.Frame(categories, bg="white")
            item.pack(side="left", expand=True, fill="x")
            circle = tk.Canvas(item, width=50, height=50, bg="white", highlightthickness=0, cursor="hand2")
            circle.pack()
            circle.create_oval(2, 2, 47, 47, fill="#e8f3ff", outline="")
            circle.create_text(25, 25, text=icon, fill=GREEN, font=("Arial", 12, "bold"))
            circle.bind("<Button-1>", lambda _e, c=category: self._set_category(c))
            tk.Label(item, text=label, bg="white", fg=TEXT, font=("Arial", 7),
                     justify="center").pack(pady=(3, 0))

        self.cart_label = tk.Label(header, text="0", bg=ORANGE, fg="white", font=("Arial", 7, "bold"))
        self.cart_label.place(in_=self.cart_button, relx=1, rely=0, x=-2, y=1, anchor="ne")
        cart_summary = RoundedPanel(self.content, bg=PALE_BLUE, radius=14, padding=7)
        cart_summary.pack(fill="x", padx=8, pady=(5, 2))
        self.cart_text = tk.Label(cart_summary.content, text="Keranjang masih kosong", bg=PALE_BLUE, fg="#66758a", font=("Arial", 8))
        self.cart_text.pack(side="left")
        self.total_label = tk.Label(cart_summary.content, text="Rp0", bg=PALE_BLUE, fg=ORANGE, font=("Arial", 8, "bold"))
        self.total_label.pack(side="right")
        RoundButton(cart_summary.content, "Checkout", self._checkout, width=78, height=27, font_size=8).pack(side="right", padx=5)

        tabs = tk.Frame(self.content, bg="white", padx=10, pady=8)
        tabs.pack(fill="x")
        self.tab_buttons = []
        for label, category in (("Semua", "Semua"), ("Sembako", "Sembako"), ("Kesehatan", "Obat & P3K"), ("Rumah", "Rumah Tangga")):
            button = tk.Button(tabs, text=label, command=lambda c=category: self._set_category(c),
                               bg=PALE_BLUE if category == self.category else "white",
                               fg=ORANGE if category == self.category else "#66758a",
                               activebackground=PALE_BLUE, relief="flat", bd=0, cursor="hand2",
                               padx=8, pady=5, font=("Arial", 8, "bold"))
            button.pack(side="left", expand=True)
            self.tab_buttons.append((button, category))

        self.products_frame = tk.Frame(self.content, bg=BG)
        self.products_frame.pack(fill="x", padx=8)
        self.bottom_nav = tk.Frame(self, bg="white", highlightbackground="#e5ebf3", highlightthickness=1)
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
        for button, button_category in self.tab_buttons:
            active = button_category == category
            button.configure(bg=PALE_BLUE if active else "white",
                             fg=ORANGE if active else "#66758a",
                             font=("Arial", 8, "bold" if active else "normal"))
        self._show_products()

    def _show_products(self):
        for widget in self.products_frame.winfo_children():
            widget.destroy()
        for col in range(3):
            self.products_frame.grid_columnconfigure(col, weight=0, uniform="")
        self.products_frame.update_idletasks()
        matches = [p for p in PRODUCTS
                   if (self.category == "Semua" or p[1] == self.category)
                   and self.query.get().strip().lower() in p[0].lower()]
        if not matches:
            tk.Label(self.products_frame, text="Produk tidak ditemukan", bg=BG,
                     fg="#777", font=("Arial", 12)).pack(pady=30)
            return
        for index, product in enumerate(matches):
            row, col = divmod(index, self.product_columns)
            name, category, price, old_price, icon, rating, sold, benefit, location, discount = product
            panel = RoundedPanel(self.products_frame, bg="white", radius=15, padding=7)
            card = panel.content
            panel.grid(row=row, column=col, sticky="nsew", padx=3, pady=4)
            picture = tk.Frame(card, bg="#f1f6fd", height=112)
            picture.pack(fill="x", pady=(0, 6))
            picture.pack_propagate(False)
            tk.Label(picture, text=f"-{discount}", bg=ORANGE, fg="white",
                     font=("Arial", 8, "bold"), padx=4).place(x=0, y=0)
            tk.Label(picture, text=icon, bg="#f1f6fd", font=("Segoe UI Emoji", 39)).place(relx=.5, rely=.51, anchor="center")
            tk.Label(card, text=name, bg="white", fg=TEXT, anchor="w",
                     font=("Arial", 9, "bold")).pack(fill="x")
            tk.Label(card, text=f"Rp{price:,}".replace(",", "."), bg="white",
                     fg=ORANGE, anchor="w", font=("Arial", 11, "bold")).pack(fill="x", pady=2)
            tk.Label(card, text=f"Rp{old_price:,}  •  ⭐ {rating}  •  {sold} terjual".replace(",", "."),
                     bg="white", fg="#777", anchor="w", font=("Arial", 6)).pack(fill="x")
            tk.Label(card, text=f"▣ {benefit}", bg="#e8f3ff", fg=GREEN,
                     anchor="w", font=("Arial", 7, "bold")).pack(fill="x", pady=(4, 2))
            tk.Label(card, text=f"📍 {location}", bg="white", fg="#777",
                     anchor="w", font=("Arial", 7)).pack(fill="x")
            RoundButton(card, "+ Keranjang", lambda p=product: self._add(p),
                        width=130, height=30, font_size=8).pack(fill="x", pady=(6, 0))
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
        tk.Label(window, text="Keranjang Belanja", bg="white", fg=TEXT,
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
                row = tk.Frame(items, bg="#f5f8fc", pady=7, padx=7)
                row.pack(fill="x")
                tk.Label(row, text=f"{product[4]}  {name}\nRp{price:,}".replace(",", "."),
                         bg="#f5f8fc", fg=TEXT, justify="left", anchor="w",
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

        RoundButton(window, "Checkout", checkout, width=300, height=38, font_size=10).pack(fill="x", padx=16, pady=(0, 14))
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
