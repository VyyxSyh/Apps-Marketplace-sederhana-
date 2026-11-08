(() => {
  const $ = id => document.getElementById(id);
  const money = value => `Rp ${Number(value).toLocaleString("id-ID")}`;
  const state = { category: "Semua", query: "", modal: "", sort: "featured", authNext: "", lastFocus: null, toastTimer: 0 };
  const safe = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const cartForUser = userId => Store.carts.filter(item => item.userId === userId);
  const currentUser = () => Store.users.find(user => user.id === Store.session?.userId) || null;
  const sellerName = id => Store.users.find(user => user.id === id)?.name || "Penjual lokal";
  const brandStore = {
    Samsung: "Samsung Official Store",
    Xiaomi: "Xiaomi Official Store",
    OPPO: "OPPO Official Store",
    vivo: "vivo Official Store",
    realme: "realme Official Store"
  };
  const productStore = product => brandStore[product.brand] || ({
    "Handphone & Tablet": "Xiaomi Official Store",
    "Komputer & Laptop": "Lenovo Official Store",
    "Elektronik": "JBL Official Store",
    "Fashion Pria": "Erigo Official Store",
    "Fashion Wanita": "Cottonink Official Store",
    "Makanan & Minuman": "Dapur Segar",
    "Kecantikan": "Wardah Official Store",
    "Kesehatan": "Kimia Farma Official Store",
    "Rumah Tangga": "Maspion Official Store",
    "Buku & Alat Tulis": "Gramedia Official Store",
    "Otomotif": "Planet Ban Official Store",
    "Olahraga": "Decathlon Official Store",
    "Ibu & Bayi": "MamyPoko Official Store",
    "Hobi & Koleksi": "Multi Toys Official Store"
  })[product.category] || sellerName(product.sellerId);

  function toast(message) {
    const el = $("toast");
    el.textContent = message;
    el.classList.add("is-visible");
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => el.classList.remove("is-visible"), 2400);
  }

  function setNav() {
    const user = currentUser();
    document.querySelectorAll("[data-seller-nav]").forEach(el => { el.hidden = user?.role !== "seller"; });
    document.querySelectorAll("[data-buyer-nav]").forEach(el => { el.hidden = user?.role === "seller"; });
    const badge = $("cartBadge");
    const count = user?.role === "buyer" ? cartForUser(user.id).reduce((sum, item) => sum + item.quantity, 0) : 0;
    badge.textContent = count;
    badge.hidden = !count;
  }

  function renderCategories() {
    $("categories").innerHTML = Store.categories.map(name => `<button class="min-h-11 shrink-0 snap-start rounded-[10px] border px-3 py-[7px] text-[13px] font-[750] transition-colors hover:border-[#9eaa91] ${state.category === name ? "border-(--green) bg-(--green) text-white" : "border-(--line) bg-(--surface) text-[#384337]"}" type="button" data-category="${safe(name)}" aria-pressed="${state.category === name}">${safe(name)}</button>`).join("");
  }

  function productCard(product) {
    const stock = Number(product.stock) || 0;
    const rating = Number(String(product.rating ?? "4,8").replace(",", "."));
    const sold = Number(product.sold) || 0;
    return `<article class="min-w-0 overflow-hidden rounded-[18px] border border-[#d6d3d1] bg-[#fffaf2] shadow-[0_5px_18px_#242a2010]">
      <button class="relative grid aspect-[1.13] w-full place-items-center overflow-hidden border-0 bg-[#eeeadc] max-[520px]:aspect-square min-[768px]:aspect-[1.25]" type="button" data-detail="${safe(product.id)}" aria-label="Lihat detail ${safe(product.name)}">
        <span class="absolute top-[9px] left-[9px] max-w-[calc(100%-18px)] overflow-hidden rounded-[7px] border border-[#ffffff80] bg-[#fffdf0cc] px-2 py-[5px] text-[10px] font-extrabold text-[#47533f] text-ellipsis whitespace-nowrap backdrop-blur-[4px]">${safe(product.category)}</span>${product.image ? `<img class="h-full w-full object-cover" src="${safe(product.image)}" alt="${safe(product.name)}" width="640" height="560" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false">` : ""}<span class="text-[clamp(42px,13vw,74px)] saturate-[.82]" aria-hidden="true" ${product.image ? "hidden" : ""}>${safe(product.icon || "□")}</span>
      </button>
      <div class="min-w-0 p-[9px] min-[768px]:p-[13px]">
        <button class="line-clamp-2 flex min-h-11 w-full border-0 bg-transparent p-0 text-left text-[12px] leading-[1.38] font-[750] text-(--ink) min-[768px]:text-sm" type="button" data-detail="${safe(product.id)}">${safe(product.name)}</button>
        <div class="mt-1.5 flex flex-wrap items-baseline gap-1 text-[14px] font-black tracking-[-0.03em] text-(--green-deep) md:text-base">${money(product.price)}${product.oldPrice ? `<span class="ml-1 text-[11px] font-normal text-(--muted) line-through max-[520px]:mt-0.5 max-[520px]:ml-0 max-[520px]:block">${money(product.oldPrice)}</span>` : ""}</div>
        ${product.oldPrice ? `<div class="mt-[5px] text-[11px] font-extrabold text-[#e56b12]">Hemat ${Math.max(1, Math.round((1 - product.price / product.oldPrice) * 100))}%</div>` : ""}
        <div class="mt-[5px] flex items-center gap-[5px] text-xs text-[#62685c]" aria-label="Rating ${rating.toFixed(1)} dari 5, ${sold} terjual"><span class="text-[17px] leading-none text-amber-500" aria-hidden="true">★</span><span>${rating.toFixed(1)}</span><span class="text-[#62685c]">·</span><span>${sold}+ terjual</span></div>
        <div class="mt-[7px] flex min-w-0 items-center gap-1.5">
          <span class="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[11px] font-bold text-(--muted)">${safe(productStore(product))}</span>
          ${stock ? `<span class="ml-auto shrink-0 rounded-full bg-[#e7efe6] px-[7px] py-0.5 text-[10px] font-extrabold whitespace-nowrap text-(--green-deep)">Stok ${stock}</span>` : `<span class="ml-auto shrink-0 rounded-full bg-[#f6e4df] px-[7px] py-0.5 text-[10px] font-extrabold whitespace-nowrap text-[#a03224]">Habis</span>`}
        </div>
      <button class="relative mt-2.5 min-h-11 w-full rounded-[9px] border border-(--green) bg-transparent text-xs font-[850] text-(--green) [touch-action:manipulation] [user-select:none] transition-[transform,background-color,color,border-color,box-shadow] duration-150 hover:not-disabled:not-[.is-added]:bg-(--green) hover:not-disabled:not-[.is-added]:text-white active:enabled:scale-[.95] active:enabled:bg-(--green-deep) active:enabled:text-white active:brightness-[.88] disabled:cursor-not-allowed disabled:border-[#c5c5bb] disabled:text-(--muted)" type="button" data-add="${safe(product.id)}" ${stock ? "" : "disabled"}>${stock ? "Tambah ke keranjang" : "Stok habis"}</button>
      </div>
    </article>`;
  }

  function renderProducts() {
    let products = Store.products.filter(product => (state.category === "Semua" || product.category === state.category) && product.name.toLocaleLowerCase("id").includes(state.query));
    if (state.sort === "price-asc") products.sort((a, b) => a.price - b.price);
    if (state.sort === "price-desc") products.sort((a, b) => b.price - a.price);
    if (state.sort === "name") products.sort((a, b) => a.name.localeCompare(b.name, "id"));
    if (state.sort === "newest") products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    $("productHeading").textContent = state.category === "Semua" ? "Semua produk" : state.category;
    $("productSubheading").textContent = state.query ? `Hasil pencarian: ${safe(state.query)}` : "Data contoh untuk katalog tugas";
    $("products").innerHTML = products.length ? products.map(productCard).join("") : `<div class="col-span-full rounded-xl border border-dashed border-[#bdb9ab] p-9 text-center text-(--muted)"><strong class="mb-1 block text-(--ink)">Produk tidak ditemukan</strong>Coba kata kunci lain atau pilih kategori berbeda.</div>`;
  }

  function render() { renderCategories(); renderProducts(); setNav(); }

  function updateNav() {
    const active = location.hash === "#catalog" ? "catalog" : "home";
    document.querySelectorAll("[data-nav]").forEach(link => {
      const selected = link.dataset.nav === active;
      link.classList.toggle("is-active", selected);
      if (selected) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  function openDialog(title, content, name) {
    state.lastFocus = document.activeElement;
    state.modal = name;
    $("modalTitle").textContent = title;
    $("modalBody").innerHTML = content;
    $("overlay").querySelector(".dialog").setAttribute("aria-describedby", "modalTitle");
    $("overlay").hidden = false;
    document.body.classList.add("dialog-open");
    requestAnimationFrame(() => {
      const first = $("overlay").querySelector("input:not(:disabled), button:not(:disabled), select:not(:disabled), textarea:not(:disabled), summary");
      (first || $("overlay").querySelector(".dialog")).focus();
    });
  }

  function closeDialog() {
    if ($("overlay").hidden) return;
    $("overlay").hidden = true;
    document.body.classList.remove("dialog-open");
    state.modal = "";
    state.lastFocus?.focus?.();
    render();
  }

  function requireRole(role, next) {
    const user = currentUser();
    if (user?.role === role) return user;
    if (user) { toast(role === "seller" ? "Masuk dengan akun penjual untuk melanjutkan." : "Fitur ini tersedia untuk pembeli."); return null; }
    showAuth("login", next);
    return null;
  }

  function showAuth(mode = "login", next = "") {
    state.authNext = next;
    const register = mode === "register";
    openDialog(register ? "Buat akun TOKOKO" : "Masuk ke TOKOKO", `<div class="notice">Akun demo hanya tersimpan di browser ini. Jangan gunakan kata sandi penting.</div>
      <form id="authForm" novalidate>
        ${register ? `<div class="field"><label for="authName">Nama</label><input id="authName" name="name" autocomplete="name" required></div>` : ""}
        <div class="field"><label for="authEmail">Email</label><input id="authEmail" name="email" type="email" autocomplete="email" required></div>
        <div class="field"><label for="authPassword">Kata sandi</label><div class="password-control"><input id="authPassword" name="password" type="password" autocomplete="${register ? "new-password" : "current-password"}" required minlength="6"><button class="password-toggle" type="button" data-action="toggle-password" aria-label="Tampilkan kata sandi" aria-pressed="false"><svg class="password-hidden-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M3 3 21 21M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3 3.8M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7c1.1 0 2.1-.2 3-.5"/></svg><svg class="password-visible-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg></button></div></div>
        ${register ? `<div class="field"><label for="authRole">Daftar sebagai</label><select id="authRole" name="role"><option value="buyer">Pembeli</option><option value="seller">Penjual</option></select></div>` : ""}
        <p id="authError" class="form-error" role="alert"></p><button class="primary-button full-width active:brightness-[.88]" type="submit">${register ? "Buat akun" : "Masuk"}</button>
      </form>
      <p class="auth-switch"><span>${register ? "Sudah punya akun?" : "Belum punya akun?"}</span><button class="text-link" type="button" data-auth-mode="${register ? "login" : "register"}" data-next="${safe(next)}">${register ? "Masuk" : "Daftar"}</button></p>
      <details class="demo-accounts"><summary>Akun contoh</summary><p>Penjual: penjual@tokoko.test / tokoko123</p><p>Pembeli: pembeli@tokoko.test / tokoko123</p></details>`, "auth");
  }

  function cartTotal(items) { return items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0); }

  function showCart() {
    const user = requireRole("buyer");
    if (!user) return;
    const items = cartForUser(user.id);
    const rows = items.map(item => `<div class="list-row"><div><strong>${safe(item.name)}</strong><div>${money(item.price)} × ${item.quantity}</div></div>
      <div class="quantity-control"><button type="button" data-quantity="${safe(item.productId)}" data-delta="-1" aria-label="Kurangi ${safe(item.name)}">−</button><span>${item.quantity}</span><button type="button" data-quantity="${safe(item.productId)}" data-delta="1" aria-label="Tambah ${safe(item.name)}">+</button></div></div>`).join("");
    openDialog("Keranjang", `${rows || `<div class="rounded-xl border border-dashed border-[#bdb9ab] p-5 text-center text-(--muted)"><strong class="mb-1 block text-(--ink)">Keranjang masih kosong</strong>Pilih produk di katalog untuk mulai berbelanja.</div>`}
      ${items.length ? `<div class="cart-total"><span>Total belanja</span><span>${money(cartTotal(items))}</span></div><button class="primary-button full-width active:brightness-[.88]" type="button" data-action="checkout">Lanjut ke checkout</button>` : ""}`, "cart");
  }

  function showDetail(id) {
    const product = Store.products.find(item => item.id === id);
    if (!product) return toast("Produk tidak ditemukan.");
    const stock = Number(product.stock) || 0;
    const rating = Number(String(product.rating ?? "").replace(",", "."));
    const sold = Number(product.sold) || 0;
    const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
    openDialog(product.name, `<div class="detail-layout">
      <div class="detail-art">${product.image ? `<img class="detail-image" src="${safe(product.image)}" alt="${safe(product.name)}" width="640" height="560" onerror="this.hidden=true;this.nextElementSibling.hidden=false">` : ""}<span aria-hidden="true" ${product.image ? "hidden" : ""}>${safe(product.icon || "□")}</span></div>
      <div class="detail-info">
        <h3 class="detail-name">${safe(product.name)}</h3>
        <div class="detail-price-block"><div class="detail-price">${money(product.price)}</div>${product.oldPrice ? `<div class="detail-old-price"><span class="detail-old-amount">${money(product.oldPrice)}</span><span class="detail-discount">-${discount}%</span></div>` : ""}</div>
        <div class="detail-stats">${Number.isFinite(rating) && rating > 0 ? `<span class="detail-rating"><span aria-hidden="true">★</span> ${rating.toFixed(1)}</span>` : ""}${sold ? `<span>${sold}+ terjual</span>` : ""}${stock ? `<span>Stok ${stock}</span>` : `<span class="detail-out-of-stock">Stok habis</span>`}</div>
        <section class="detail-section"><h4>Deskripsi produk</h4><p class="detail-copy">${safe(product.description || "Deskripsi belum tersedia.")}</p></section>
        <section class="detail-seller"><div class="detail-seller-mark" aria-hidden="true">${safe((sellerName(product.sellerId)[0] || "T").toUpperCase())}</div><div class="detail-seller-copy"><strong>${safe(sellerName(product.sellerId))}</strong><span>${safe(product.city || "Lokasi belum tersedia")}</span></div></section>
      </div>
      <div class="detail-actions"><button class="secondary-button active:brightness-[.88] disabled:cursor-not-allowed" type="button" data-add="${safe(product.id)}" ${stock > 0 ? "" : "disabled"}>Tambah ke keranjang</button><button class="primary-button active:brightness-[.88] disabled:cursor-not-allowed" type="button" data-buy="${safe(product.id)}" ${stock > 0 ? "" : "disabled"}>Beli sekarang</button></div>
    </div>`, "detail");
  }

  function showCheckout(buyId = "") {
    const user = requireRole("buyer");
    if (!user) return;
    let items = cartForUser(user.id);
    if (buyId) {
      const product = Store.products.find(item => item.id === buyId);
      if (!product || !product.stock) return toast("Produk sedang tidak tersedia.");
      const existing = items.find(item => item.productId === product.id);
      items = existing ? items.map(item => item.productId === product.id ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) } : item) : [...items, { userId: user.id, productId: product.id, name: product.name, price: product.price, quantity: 1 }];
      Store.carts = [...Store.carts.filter(item => item.userId !== user.id), ...items];
    }
    if (!items.length) return toast("Keranjang masih kosong.");
    const unavailable = items.find(item => !Store.products.some(product => product.id === item.productId && product.stock >= item.quantity));
    if (unavailable) return toast(`${unavailable.name} melebihi stok yang tersedia.`);
    openDialog("Checkout", `<div class="notice">Pembayaran dan pengiriman hanya simulasi. Tidak ada transaksi sungguhan.</div>
      <div class="checkout-summary">${items.map(item => `<div class="list-row"><span>${safe(item.name)} × ${item.quantity}</span><strong>${money(item.price * item.quantity)}</strong></div>`).join("")}</div>
      <form id="checkoutForm" novalidate>
        <div class="field"><label for="checkoutName">Nama penerima</label><input id="checkoutName" name="name" autocomplete="name" required value="${safe(user.name)}"></div>
        <div class="field"><label for="checkoutPhone">Nomor telepon</label><input id="checkoutPhone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required></div>
        <div class="field"><label for="checkoutAddress">Alamat pengiriman</label><textarea id="checkoutAddress" name="address" rows="3" autocomplete="street-address" required></textarea></div>
        <div class="field"><label for="paymentMethod">Metode pembayaran (simulasi)</label><select id="paymentMethod" name="payment"><option>Bayar di tempat</option><option>Transfer bank</option></select></div>
        <div class="cart-total"><span>Total</span><span>${money(cartTotal(items))}</span></div>
        <p id="checkoutError" class="form-error" role="alert"></p><button class="primary-button full-width active:brightness-[.88]" type="submit">Buat pesanan demo</button>
      </form>`, "checkout");
  }

  function showOrders() {
    const user = requireRole("buyer");
    if (!user) return;
    const orders = Store.orders.filter(order => order.buyerId === user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const content = orders.length ? orders.map(order => `<div class="list-row order-row"><div><strong>${safe(order.orderNumber)}</strong><div>${new Date(order.createdAt).toLocaleDateString("id-ID")} · ${safe(order.status)}</div><div>${order.items.map(item => safe(item.name)).join(", ")}</div></div><strong>${money(order.total)}</strong>${order.status === "Diproses" ? `<button class="secondary-button" type="button" data-cancel-order="${safe(order.id)}">Batalkan</button>` : ""}</div>`).join("") : `<div class="rounded-xl border border-dashed border-[#bdb9ab] p-5 text-center text-(--muted)"><strong class="mb-1 block text-(--ink)">Belum ada pesanan</strong>Pesanan yang kamu buat akan muncul di sini.</div>`;
    openDialog("Pesanan saya", content, "orders");
  }

  function showAccount() {
    const user = currentUser();
    openDialog("Akun", user ? `<div class="list-row"><span>Nama</span><strong>${safe(user.name)}</strong></div><div class="list-row"><span>Email</span><span>${safe(user.email)}</span></div><div class="list-row"><span>Peran</span><span>${user.role === "seller" ? "Penjual" : "Pembeli"}</span></div><button class="danger-button full-width mt-4 active:brightness-[.88]" type="button" data-action="logout">Keluar</button>` : `<div class="notice">Masuk untuk memakai keranjang atau mengelola produk.</div><button class="primary-button full-width active:brightness-[.88]" type="button" data-action="login">Masuk</button><button class="secondary-button full-width mt-2 active:brightness-[.88]" type="button" data-auth-mode="register">Buat akun</button>`, "account");
  }

  function showSellerProducts() {
    const seller = requireRole("seller");
    if (!seller) return;
    const products = Store.products.filter(product => product.sellerId === seller.id);
    const rows = products.map(product => `<div class="list-row"><div><strong>${safe(product.name)}</strong><div>${money(product.price)} · Stok ${product.stock}</div></div><div class="form-actions"><button class="secondary-button active:brightness-[.88]" type="button" data-edit-product="${safe(product.id)}">Edit</button><button class="danger-button active:brightness-[.88]" type="button" data-delete-product="${safe(product.id)}">Hapus</button></div></div>`).join("");
    openDialog("Produk saya", `${rows || `<div class="rounded-xl border border-dashed border-[#bdb9ab] p-5 text-center text-(--muted)"><strong class="mb-1 block text-(--ink)">Belum ada produk</strong>Tambahkan produk pertama tokomu.</div>`}<button class="primary-button full-width mt-4 active:brightness-[.88]" type="button" data-action="new-product">Tambah produk</button>`, "seller-products");
  }

  function showProductForm(productId = "") {
    const seller = requireRole("seller");
    if (!seller) return;
    const product = productId ? Store.products.find(item => item.id === productId && item.sellerId === seller.id) : null;
    if (productId && !product) return toast("Produk ini bukan milik tokomu.");
    openDialog(product ? "Edit produk" : "Tambah produk", `<form id="productForm" data-product-id="${safe(product?.id || "")}" novalidate>
      <div class="field"><label for="productName">Nama produk</label><input id="productName" name="name" required value="${safe(product?.name || "")}"></div>
      <div class="field"><label for="productDescription">Deskripsi</label><textarea id="productDescription" name="description" rows="3">${safe(product?.description || "")}</textarea></div>
      <div class="field"><label for="productPrice">Harga (rupiah)</label><input id="productPrice" name="price" type="number" inputmode="numeric" min="0" step="1" required value="${safe(product?.price ?? "")}"></div>
      <div class="field"><label for="productStock">Stok</label><input id="productStock" name="stock" type="number" inputmode="numeric" min="0" step="1" required value="${safe(product?.stock ?? "")}"></div>
      <div class="field"><label for="productCategory">Kategori</label><select id="productCategory" name="category">${Store.categories.filter(category => category !== "Semua").map(category => `<option ${product?.category === category ? "selected" : ""}>${safe(category)}</option>`).join("")}</select></div>
      <div class="field"><label for="productImage">Path gambar (opsional)</label><input id="productImage" name="image" placeholder="src/images/nama-produk.jpg" value="${safe(product?.image || "")}"></div>
        <p id="productError" class="form-error" role="alert"></p><button class="primary-button full-width active:brightness-[.88]" type="submit">Simpan produk</button>
    </form>`, "product-form");
  }

  function saveOrder(form) {
    const user = currentUser();
    if (user?.role !== "buyer") return showAuth("login", "checkout");
    const items = cartForUser(user.id);
    const fresh = items.map(item => ({ item, product: Store.products.find(product => product.id === item.productId) }));
    const invalid = fresh.find(({ item, product }) => !product || product.stock < item.quantity);
    if (invalid) { $("checkoutError").textContent = `${invalid.item.name} sudah berubah stoknya. Periksa keranjang lalu coba lagi.`; return; }
    const data = new FormData(form);
    if (!["name", "phone", "address"].every(key => String(data.get(key) || "").trim())) {
      $("checkoutError").textContent = "Lengkapi nama, nomor telepon, dan alamat.";
      return;
    }
    const snapshot = fresh.map(({ item, product }) => ({ productId: product.id, sellerId: product.sellerId, name: product.name, price: product.price, quantity: item.quantity }));
    const order = { id: crypto.randomUUID(), orderNumber: `TK-${Date.now().toString(36).toUpperCase()}`, buyerId: user.id, items: snapshot, shipping: { name: String(data.get("name")).trim(), phone: String(data.get("phone")).trim(), address: String(data.get("address")).trim() }, paymentMethod: data.get("payment"), subtotal: cartTotal(items), shippingCost: 0, total: cartTotal(items), status: "Diproses", createdAt: new Date().toISOString() };
    Store.products = Store.products.map(product => {
      const line = snapshot.find(item => item.productId === product.id);
      return line ? { ...product, stock: product.stock - line.quantity, sold: (product.sold || 0) + line.quantity } : product;
    });
    Store.orders = [order, ...Store.orders];
    Store.carts = Store.carts.filter(item => item.userId !== user.id);
    closeDialog();
    openDialog("Pesanan dibuat", `<div class="notice">Pesanan demo berhasil dibuat. Tidak ada pembayaran atau pengiriman sungguhan.</div><div class="list-row"><span>Nomor pesanan</span><strong>${safe(order.orderNumber)}</strong></div><div class="list-row"><span>Total</span><strong>${money(order.total)}</strong></div><button class="primary-button full-width mt-4 active:brightness-[.88]" type="button" data-action="orders">Lihat pesanan</button>`, "confirmation");
    render();
  }

  function validate(form) { return form.reportValidity(); }

  function handleSubmit(event) {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    if (form.id === "searchForm") {
      event.preventDefault(); state.query = $("searchInput").value.trim().toLocaleLowerCase("id"); state.category = "Semua"; render(); $("products").scrollIntoView({ behavior: "smooth", block: "start" }); return;
    }
    event.preventDefault();
    if (!validate(form)) return;
    const data = new FormData(form);
    if (form.id === "authForm") {
      const email = String(data.get("email")).trim().toLowerCase();
      const password = String(data.get("password"));
      const error = $("authError");
      if (data.has("role")) {
        if (String(data.get("name")).trim().length < 2 || password.length < 6) { error.textContent = "Isi nama minimal 2 karakter dan kata sandi minimal 6 karakter."; return; }
        if (Store.users.some(user => user.email.toLowerCase() === email)) { error.textContent = "Email sudah terdaftar. Masuk dengan akun tersebut."; return; }
        const user = { id: crypto.randomUUID(), name: String(data.get("name")).trim(), email, password, role: data.get("role") };
        Store.users = [...Store.users, user]; Store.session = { userId: user.id, role: user.role };
      } else {
        const user = Store.users.find(item => item.email.toLowerCase() === email && item.password === password);
        if (!user) { error.textContent = "Email atau kata sandi tidak cocok."; return; }
        Store.session = { userId: user.id, role: user.role };
      }
      const next = state.authNext;
      state.authNext = "";
      closeDialog(); render(); toast("Berhasil masuk.");
      if (next === "checkout") showCheckout();
      else if (next.startsWith("add:")) addToCart(next.slice(4));
      return;
    }
    if (form.id === "checkoutForm") { saveOrder(form); return; }
    if (form.id === "productForm") {
      const seller = currentUser();
      const price = Number(data.get("price")); const stock = Number(data.get("stock"));
      if (!Number.isSafeInteger(price) || price < 0 || !Number.isSafeInteger(stock) || stock < 0) { $("productError").textContent = "Harga dan stok harus berupa bilangan bulat nol atau lebih."; return; }
      const productId = form.dataset.productId;
      const current = Store.products.find(item => item.id === productId);
      const image = String(data.get("image")).trim();
      if (image && !/^src\/images\/[\w.-]+\.(?:png|jpe?g|webp)$/i.test(image)) { $("productError").textContent = "Path gambar gunakan format src/images/nama-file.jpg, png, atau webp."; return; }
      const product = { ...current, id: current?.id || crypto.randomUUID(), sellerId: seller.id, name: String(data.get("name")).trim(), description: String(data.get("description")).trim(), price, stock, category: data.get("category"), image, icon: current?.icon || "📦", city: current?.city || "", createdAt: current?.createdAt || new Date().toISOString() };
      Store.products = current ? Store.products.map(item => item.id === product.id ? product : item) : [product, ...Store.products];
      closeDialog(); render(); showSellerProducts(); toast(current ? "Produk diperbarui." : "Produk ditambahkan.");
    }
  }

  function bumpBadge() {
    const badge = $("cartBadge");
    if (!badge) return;
    badge.classList.remove("is-bumped");
    void badge.offsetWidth;
    badge.classList.add("is-bumped");
  }

  function animateButton(btn) {
    if (!btn) return;
    if (navigator.vibrate) { try { navigator.vibrate(15); } catch {} }
    btn.classList.add("is-added");
    const original = btn.textContent;
    btn.textContent = "✓ Ditambahkan";
    clearTimeout(btn._addTimer);
    btn._addTimer = setTimeout(() => {
      btn.textContent = original;
      btn.classList.remove("is-added");
    }, 900);
  }

  function addToCart(productId, buyNow = false, trigger = null) {
    const user = requireRole("buyer", buyNow ? "checkout" : `add:${productId}`);
    if (!user) return;
    const product = Store.products.find(item => item.id === productId);
    if (!product || product.stock < 1) return toast("Produk sedang tidak tersedia.");
    const items = cartForUser(user.id);
    const existing = items.find(item => item.productId === product.id);
    if (existing?.quantity >= product.stock) return toast("Jumlah sudah mencapai stok tersedia.");
    const next = existing ? items.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...items, { userId: user.id, productId: product.id, name: product.name, price: product.price, quantity: 1 }];
    Store.carts = [...Store.carts.filter(item => item.userId !== user.id), ...next];
    if (buyNow) { closeDialog(); showCheckout(); }
    else {
      setNav();
      bumpBadge();
      if (trigger) animateButton(trigger);
      toast("Produk ditambahkan ke keranjang.");
    }
  }

  document.addEventListener("submit", handleSubmit);
  document.addEventListener("change", event => {
    if (event.target.id === "sortSelect") { state.sort = event.target.value; renderProducts(); }
  });
  window.addEventListener("hashchange", updateNav);
  document.addEventListener("click", event => {
    const target = event.target.closest("[data-category], [data-add], [data-detail], [data-buy], [data-action], [data-auth-mode], [data-quantity], [data-cancel-order], [data-edit-product], [data-delete-product]");
    if (!target) return;
    if (target.dataset.category) { state.category = target.dataset.category; render(); return; }
    if (target.dataset.add) { addToCart(target.dataset.add, false, target); return; }
    if (target.dataset.detail) { showDetail(target.dataset.detail); return; }
    if (target.dataset.buy) { addToCart(target.dataset.buy, true); return; }
    if (target.dataset.authMode) { showAuth(target.dataset.authMode, target.dataset.next || ""); return; }
    if (target.dataset.quantity) {
      const user = currentUser(); const delta = Number(target.dataset.delta); const product = Store.products.find(item => item.id === target.dataset.quantity);
      Store.carts = Store.carts.flatMap(item => {
        if (item.userId !== user.id || item.productId !== target.dataset.quantity) return [item];
        const quantity = Math.min(product?.stock ?? 0, item.quantity + delta);
        return quantity > 0 ? [{ ...item, quantity }] : [];
      });
      render(); showCart(); return;
    }
    if (target.dataset.cancelOrder) {
      const user = currentUser(); const order = Store.orders.find(item => item.id === target.dataset.cancelOrder && item.buyerId === user.id && item.status === "Diproses");
      if (!order || !confirm("Batalkan pesanan ini? Stok produk akan dikembalikan.")) return;
      Store.products = Store.products.map(product => { const line = order.items.find(item => item.productId === product.id); return line ? { ...product, stock: product.stock + line.quantity, sold: Math.max(0, (product.sold || 0) - line.quantity) } : product; });
      Store.orders = Store.orders.map(item => item.id === order.id ? { ...item, status: "Dibatalkan" } : item); showOrders(); render(); return;
    }
    if (target.dataset.editProduct) { showProductForm(target.dataset.editProduct); return; }
    if (target.dataset.deleteProduct) {
      const seller = currentUser(); const product = Store.products.find(item => item.id === target.dataset.deleteProduct && item.sellerId === seller?.id);
      if (!product || !confirm(`Hapus produk “${product.name}”?`)) return;
      Store.products = Store.products.filter(item => item.id !== product.id); closeDialog(); showSellerProducts(); toast("Produk dihapus."); return;
    }
    const action = target.dataset.action;
    if (!action) return;
    switch (action) {
      case "toggle-password": {
        const input = $("authPassword");
        const visible = input.type === "password";
        input.type = visible ? "text" : "password";
        target.classList.toggle("is-visible", visible);
        target.setAttribute("aria-label", visible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi");
        target.setAttribute("aria-pressed", String(visible));
        break;
      }
      case "cart": showCart(); break;
      case "close": closeDialog(); break;
      case "checkout": showCheckout(); break;
      case "orders": showOrders(); break;
      case "account": showAccount(); break;
      case "login": showAuth(); break;
      case "seller-products": showSellerProducts(); break;
      case "new-product": showProductForm(); break;
      case "logout": Store.session = null; closeDialog(); render(); toast("Kamu sudah keluar."); break;
    }
  });
  $("overlay").addEventListener("click", event => { if (event.target === $("overlay")) closeDialog(); });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeDialog();
    if (event.key === "Tab" && !$("overlay").hidden) {
      const dialog = $("overlay").querySelector(".dialog");
      const focusable = [...dialog.querySelectorAll("a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), summary, [tabindex='0']")];
      if (!focusable.length) { event.preventDefault(); dialog.focus(); return; }
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    }
  });

  async function start() {
    $("products").innerHTML = `<p class="col-span-full py-6 text-center text-(--ink)" role="status">Memuat produk...</p>`;
    try { await Store.init(); render(); updateNav(); }
    catch (error) {
      $("products").innerHTML = `<div class="col-span-full rounded-xl border border-dashed border-[#bdb9ab] p-5 text-center text-(--muted)"><strong class="mb-1 block text-(--ink)">Data produk belum tersedia</strong>${safe(error.message)}<p><button class="secondary-button active:brightness-[.88]" type="button" data-action="retry">Coba lagi</button></p></div>`;
    }
  }
  document.addEventListener("click", event => { if (event.target.closest('[data-action="retry"]')) start(); });
  start();
})();
