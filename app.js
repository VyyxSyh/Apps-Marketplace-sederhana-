(() => {
  const $ = id => document.getElementById(id);
  const money = value => `Rp ${Number(value).toLocaleString("id-ID")}`;
  const state = { storeId: "", sellerTab: "products", query: "", modal: "", sort: "featured", authNext: "", lastFocus: null, toastTimer: 0 };
  const safe = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const cartForUser = userId => Store.carts.filter(item => item.userId === userId);
  const currentUser = () => Store.users.find(user => user.id === Store.session?.userId) || null;
  const sellerName = id => Store.users.find(user => user.id === id)?.name || "Penjual lokal";
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
    document.querySelectorAll("[data-warehouse-nav]").forEach(el => { el.hidden = user?.role !== "gudang"; });
    document.querySelectorAll("[data-buyer-nav]").forEach(el => { el.hidden = user?.role === "seller" || user?.role === "gudang"; });
    document.querySelectorAll("[data-warehouse-nav]").forEach(el => { el.hidden = user?.role !== "gudang"; });
    const badge = $("cartBadge");
    const count = user?.role === "buyer" ? cartForUser(user.id).reduce((sum, item) => sum + item.quantity, 0) : 0;
    badge.textContent = count;
    badge.hidden = !count;
  }

  function renderCategories() {
    const sellers = [...new Map(Store.products.map(product => [product.sellerId, Store.users.find(user => user.id === product.sellerId)]).filter(([, seller]) => seller).map(([id, seller]) => [id, seller])).entries()];
    $("categories").innerHTML = `<button class="category-chip ${!state.storeId ? "is-active" : ""}" type="button" data-store="" aria-pressed="${!state.storeId}">Semua toko</button>${sellers.map(([id, seller]) => `<button class="category-chip ${state.storeId === id ? "is-active" : ""}" type="button" data-store="${safe(id)}" aria-pressed="${state.storeId === id}">${safe(seller.name)}</button>`).join("")}`;
  }

  function productCard(product) {
    const stock = availableStock(product);
    return `<article class="product-card">
      <button class="product-art" type="button" data-detail="${safe(product.id)}" aria-label="Lihat detail ${safe(product.name)}">
        <span class="product-category">${safe(product.category)}</span>${product.image ? `<img class="product-image" src="${safe(product.image)}" alt="${safe(product.name)}" width="640" height="560" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false">` : ""}<span class="product-emoji" aria-hidden="true" ${product.image ? "hidden" : ""}>${safe(product.icon || "□")}</span>
      </button>
      <div class="product-info">
        <button class="product-name" type="button" data-detail="${safe(product.id)}">${safe(product.name)}</button>
        <div class="product-price">${money(product.price)}${product.oldPrice ? `<span class="product-old-price">${money(product.oldPrice)}</span>` : ""}</div>
        ${product.oldPrice ? `<div class="product-promo">Hemat ${Math.max(1, Math.round((1 - product.price / product.oldPrice) * 100))}%</div>` : ""}
        <div class="product-foot">
          <span class="product-store">${safe(sellerName(product.sellerId))}</span>
          ${stock ? `<span class="stock-chip">Stok ${stock}</span>` : `<span class="stock-chip is-empty">Habis</span>`}
        </div>
        <button class="product-add" type="button" data-add="${safe(product.id)}" ${stock ? "" : "disabled"}>${stock ? "Tambah ke keranjang" : "Stok habis"}</button>
      </div>
    </article>`;
  }

  function renderProducts() {
    let products = Store.products.filter(product => (!state.storeId || product.sellerId === state.storeId) && product.name.toLocaleLowerCase("id").includes(state.query));
    if (state.sort === "price-asc") products.sort((a, b) => a.price - b.price);
    if (state.sort === "price-desc") products.sort((a, b) => b.price - a.price);
    if (state.sort === "name") products.sort((a, b) => a.name.localeCompare(b.name, "id"));
    if (state.sort === "newest") products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    $("productHeading").textContent = state.storeId ? sellerName(state.storeId) : "Semua produk";
    $("productSubheading").textContent = state.query ? `Hasil pencarian: ${state.query}` : "Produk dari berbagai toko";
    $("products").innerHTML = products.length ? products.map(productCard).join("") : `<div class="empty-state"><strong>Produk tidak ditemukan</strong>Coba kata kunci lain atau pilih kategori berbeda.</div>`;
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
    if (["seller-products", "account", "warehouse", "password-form", "store-profile", "product-form", "orders", "buyer-chats"].includes(name)) {
      state.lastFocus = document.activeElement;
      state.modal = name;
      $("fullPageTitle").textContent = title;
      $("fullPageBody").innerHTML = content;
      $("fullPage").classList.toggle("is-account", name === "account");
      $("siteHeader").hidden = name === "account";
      document.querySelector(".bottom-nav").hidden = false;
      $("fullPage").hidden = false;
      document.body.classList.add("dialog-open");
      requestAnimationFrame(() => $("fullPage").querySelector("[data-focus-page]")?.focus() || $("fullPage").querySelector(".full-page-body").focus());
      return;
    }
    $("fullPage").hidden = true;
    state.lastFocus = document.activeElement;
    state.modal = name;
    $("modalTitle").textContent = title;
    $("modalBody").innerHTML = content;
    $("modalBody").classList.toggle("detail-body", name === "detail");
    $("overlay").querySelector(".dialog").classList.toggle("detail-dialog", name === "detail");
    $("overlay").hidden = false;
    document.body.classList.add("dialog-open");
    requestAnimationFrame(() => {
      const first = $("overlay").querySelector("input:not(:disabled), button:not(:disabled), select:not(:disabled), textarea:not(:disabled), summary");
      (first || $("overlay").querySelector(".dialog")).focus();
    });
  }

  function closeDialog() {
    if (!$("fullPage").hidden) {
      $("fullPage").hidden = true;
      $("fullPage").classList.remove("is-account");
      document.body.classList.remove("dialog-open");
      state.modal = "";
      $("siteHeader").hidden = false;
      document.querySelector(".bottom-nav").hidden = false;
      state.lastFocus?.focus?.();
      render();
      return;
    }
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
    if (user) { toast(`Fitur ini hanya untuk peran ${role}.`); return null; }
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
        <div class="field"><label for="authPassword">Kata sandi</label><input id="authPassword" name="password" type="password" autocomplete="${register ? "new-password" : "current-password"}" required minlength="6"></div>
        ${register ? `<div class="field"><label for="authRole">Daftar sebagai</label><select id="authRole" name="role"><option value="buyer">Pembeli</option><option value="seller">Penjual</option></select></div>` : ""}
        <p id="authError" class="form-error" role="alert"></p><button class="primary-button full-width" type="submit">${register ? "Buat akun" : "Masuk"}</button>
      </form>
      <p class="auth-switch">${register ? "Sudah punya akun?" : "Belum punya akun?"} <button class="text-link" type="button" data-auth-mode="${register ? "login" : "register"}" data-next="${safe(next)}">${register ? "Masuk" : "Daftar"}</button></p>
        <details class="demo-accounts"><summary>Akun contoh</summary>${Store.users.filter(user => user.demo).map(user => `<p>${safe(user.name)}: ${safe(user.email)} / ${safe(user.password || "(tersimpan sebagai hash)")}</p>`).join("")}</details>`, "auth");
  }

  function cartTotal(items) { return items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0); }
  const reservedStock = productId => Store.orders.filter(order => !["Dibatalkan", "Selesai", "Dikirim"].includes(order.status)).reduce((sum, order) => sum + order.items.filter(item => item.productId === productId).reduce((count, item) => count + item.quantity, 0), 0);
  const availableStock = product => Math.max(0, Number(product.stock) - reservedStock(product.id));

  function showCart() {
    const user = requireRole("buyer");
    if (!user) return;
    const items = cartForUser(user.id);
    const rows = items.map(item => `<div class="list-row"><div><strong>${safe(item.name)}</strong><div>${money(item.price)} × ${item.quantity}</div></div>
      <div class="quantity-control"><button type="button" data-quantity="${safe(item.productId)}" data-delta="-1" aria-label="Kurangi ${safe(item.name)}">−</button><span>${item.quantity}</span><button type="button" data-quantity="${safe(item.productId)}" data-delta="1" aria-label="Tambah ${safe(item.name)}">+</button></div></div>`).join("");
    openDialog("Keranjang", `${rows || `<div class="empty-state"><strong>Keranjang masih kosong</strong>Pilih produk di katalog untuk mulai berbelanja.</div>`}
      ${items.length ? `<div class="cart-total"><span>Total belanja</span><span>${money(cartTotal(items))}</span></div><button class="primary-button full-width" type="button" data-action="checkout">Lanjut ke checkout</button>` : ""}`, "cart");
  }

  function showDetail(id) {
    const product = Store.products.find(item => item.id === id);
    if (!product) return toast("Produk tidak ditemukan.");
    const discount = product.oldPrice > product.price ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
    openDialog(product.name, `<div class="detail-art">${product.image ? `<img class="detail-image" src="${safe(product.image)}" alt="${safe(product.name)}" width="640" height="640" onerror="this.hidden=true;this.nextElementSibling.hidden=false">` : ""}<span class="detail-placeholder" aria-hidden="true" ${product.image ? "hidden" : ""}>${safe(product.icon || "□")}</span></div>
      <div class="detail-content">
        <div class="detail-price-row"><strong class="detail-price">${money(product.price)}</strong>${product.oldPrice ? `<del class="detail-old-price">${money(product.oldPrice)}</del>` : ""}${discount ? `<span class="detail-discount">Hemat ${discount}%</span>` : ""}</div>
        <h3 class="detail-name">${safe(product.name)}</h3>
          <div class="detail-meta"><span class="detail-stock">Stok tersedia ${availableStock(product)}</span></div>
        <section class="store-details" aria-label="Detail toko">
          <div class="store-heading"><span class="store-mark" aria-hidden="true">${safe(sellerName(product.sellerId).slice(0, 1).toUpperCase())}</span><div class="store-identity"><h3>${safe(sellerName(product.sellerId))}</h3>${Store.users.find(user => user.id === product.sellerId)?.city ? `<p>Lokasi toko · ${safe(Store.users.find(user => user.id === product.sellerId).city)}</p>` : ""}</div><button class="store-follow" type="button" data-follow="${safe(product.sellerId)}" aria-pressed="${localStorage.getItem(`tokoko-follow-${product.sellerId}`) === "true"}">${localStorage.getItem(`tokoko-follow-${product.sellerId}`) === "true" ? "Mengikuti" : "Ikuti"}</button></div>
          <p class="store-inventory">${Store.products.filter(item => item.sellerId === product.sellerId).length.toLocaleString("id-ID")} produk di toko</p>
        </section>
        <section class="detail-description"><h3>Deskripsi produk</h3><p>${safe(product.description || "Belum ada deskripsi produk.")}</p></section>
      </div>
         <div class="detail-actions"><button class="secondary-button" type="button" data-add="${safe(product.id)}" ${product.stock > 0 ? "" : "disabled"}>Tambah ke keranjang</button><button class="secondary-button" type="button" data-start-chat="${safe(product.id)}">Tanya toko</button><button class="primary-button" type="button" data-buy="${safe(product.id)}" ${product.stock > 0 ? "" : "disabled"}>Beli sekarang</button></div>`, "detail");
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
    const unavailable = items.find(item => !Store.products.some(product => product.id === item.productId && availableStock(product) >= item.quantity));
    if (unavailable) return toast(`${unavailable.name} melebihi stok yang tersedia.`);
    openDialog("Checkout", `<div class="notice">Pembayaran dan pengiriman hanya simulasi. Tidak ada transaksi sungguhan.</div>
      <div class="checkout-summary">${items.map(item => `<div class="list-row"><span>${safe(item.name)} × ${item.quantity}</span><strong>${money(item.price * item.quantity)}</strong></div>`).join("")}</div>
      <form id="checkoutForm" novalidate>
        <div class="field"><label for="checkoutName">Nama penerima</label><input id="checkoutName" name="name" autocomplete="name" required value="${safe(user.name)}"></div>
        <div class="field"><label for="checkoutPhone">Nomor telepon</label><input id="checkoutPhone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required></div>
        <div class="field"><label for="checkoutAddress">Alamat pengiriman</label><textarea id="checkoutAddress" name="address" rows="3" autocomplete="street-address" required></textarea></div>
        <div class="field"><label for="paymentMethod">Metode pembayaran (simulasi)</label><select id="paymentMethod" name="payment"><option>Bayar di tempat</option><option>Transfer bank</option></select></div>
        <div class="cart-total"><span>Total</span><span>${money(cartTotal(items))}</span></div>
        <p id="checkoutError" class="form-error" role="alert"></p><button class="primary-button full-width" type="submit">Buat pesanan demo</button>
      </form>`, "checkout");
  }

  function showOrders() {
    const user = requireRole("buyer");
    if (!user) return;
    const orders = Store.orders.filter(order => order.buyerId === user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const content = orders.length ? orders.map(order => `<article class="list-row order-row"><div><strong>${safe(order.orderNumber)}</strong><div>${new Date(order.createdAt).toLocaleDateString("id-ID")} · ${safe(order.status)}</div><div>${order.items.map(item => safe(item.name)).join(", ")}</div></div><strong>${money(order.total)}</strong>${order.status === "Diproses" ? `<button class="secondary-button" type="button" data-cancel-order="${safe(order.id)}">Batalkan</button>` : ""}</article>`).join("") : `<div class="empty-state"><strong>Belum ada pesanan</strong>Pesanan yang kamu buat akan muncul di sini.</div>`;
    openDialog("Pesanan saya", content, "orders");
  }

  const statusLabel = status => ({ "Diproses": "Menunggu penjualan", "Diteruskan ke gudang": "Menunggu gudang", "Disiapkan": "Sedang disiapkan", "Dikemas": "Siap dikirim", "Dikirim": "Dalam pengiriman", "Selesai": "Selesai", "Dibatalkan": "Dibatalkan" }[status] || status);
  function showSalesOrders() {
    if (!requireRole("seller")) return;
    state.sellerTab = "orders";
    return showSellerProducts();
  }

  function showWarehouse() {
    const user = requireRole("gudang");
    if (!user) return;
    const orders = Store.orders.filter(order => ["Diteruskan ke gudang", "Disiapkan", "Dikemas"].includes(order.status)).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const orderRows = orders.map(order => `<article class="list-row order-row"><div><strong>${safe(order.orderNumber)}</strong><div>${safe(order.shipping?.name || "—")} · ${order.items.map(item => `${safe(item.name)} × ${item.quantity}`).join(", ")}</div><div>${safe(order.shipping?.address || "Alamat tidak tersedia")}</div><div>Status: ${safe(statusLabel(order.status))}</div></div><div class="form-actions">${order.status === "Diteruskan ke gudang" ? `<button class="secondary-button" type="button" data-fulfill="pick" data-order="${safe(order.id)}">Mulai siapkan</button>` : ""}${order.status === "Disiapkan" ? `<button class="secondary-button" type="button" data-fulfill="pack" data-order="${safe(order.id)}">Tandai dikemas</button>` : ""}${order.status === "Dikemas" ? `<button class="primary-button" type="button" data-fulfill="ship" data-order="${safe(order.id)}">Tandai dikirim</button>` : ""}</div></article>`).join("");
    const movements = Store.stockMovements || [];
    const movementRows = movements.slice(0, 12).map(movement => `<div class="list-row"><div><strong>${safe(movement.productName)}</strong><div>${safe(movement.type)} · ${safe(movement.reason)}</div></div><span>${movement.delta > 0 ? "+" : ""}${movement.delta} · ${new Date(movement.createdAt).toLocaleDateString("id-ID")}</span></div>`).join("");
    openDialog("Gudang", `<h3>Antrean pemenuhan</h3>${orderRows || `<div class="empty-state"><strong>Antrean kosong</strong>Pesanan yang diteruskan Penjualan akan muncul di sini.</div>`}<h3 class="mt-4">Stok & barang masuk</h3>${Store.products.filter(product => product.stock <= (product.lowStockThreshold ?? 5)).map(product => `<div class="list-row"><strong>${safe(product.name)}</strong><span>Stok menipis: ${product.stock}</span></div>`).join("")}<form id="stockForm" class="mt-4"><div class="field"><label for="stockProduct">Produk</label><select id="stockProduct" name="productId" required>${Store.products.map(product => `<option value="${safe(product.id)}">${safe(product.name)} · stok ${product.stock}</option>`).join("")}</select></div><div class="field"><label for="stockDelta">Barang masuk / koreksi (+/- unit)</label><input id="stockDelta" name="delta" type="number" step="1" required></div><div class="field"><label for="stockReason">Alasan</label><input id="stockReason" name="reason" required minlength="3" maxlength="120" placeholder="Contoh: penerimaan barang"></div><p id="stockError" class="form-error" role="alert"></p><button class="primary-button full-width" type="submit">Simpan perubahan stok</button></form><h3 class="mt-4">Riwayat stok</h3>${movementRows || `<p class="empty-state">Belum ada perubahan stok. Catat penerimaan atau koreksi untuk mulai membuat riwayat.</p>`}`, "warehouse");
  }

  function showSalesTools() {
    if (!requireRole("seller")) return;
    state.sellerTab = "sales";
    return showSellerProducts();
  }

  function salesReport(sellerId) {
    const lines = Store.orders.flatMap(order => order.items.filter(item => item.sellerId === sellerId).map(item => ({ ...item, createdAt: order.createdAt })));
    const units = lines.reduce((sum, line) => sum + line.quantity, 0);
    const revenue = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
    return `<div class="list-row"><span>Unit terjual (berdasarkan pesanan)</span><strong>${units}</strong></div><div class="list-row"><span>Nilai penjualan tercatat</span><strong>${money(revenue)}</strong></div><p class="muted-copy">${lines.length ? `${lines.length} baris produk dari pesanan tersimpan.` : "Belum ada pesanan selesai. Nilai mencakup semua pesanan tersimpan."}</p>`;
  }

  function showChatList(sellerId) {
    const chats = Store.chats.filter(chat => chat.sellerId === sellerId);
    return `${chats.map(chat => `<button class="list-row chat-open" type="button" data-chat="${safe(chat.id)}"><span><strong>${safe(chat.buyerName)}</strong><span>${safe(chat.messages.at(-1)?.text || "Mulai percakapan")}</span></span><span>${chat.unread ? "Belum dibaca" : "Buka"}</span></button>`).join("") || `<div class="empty-state"><strong>Belum ada pesan</strong>Percakapan dari pembeli akan tampil di sini.</div>`}`;
  }

  function showBuyerChats() {
    const buyer = requireRole("buyer"); if (!buyer) return;
    const chats = Store.chats.filter(chat => chat.buyerId === buyer.id);
    openDialog("Pesan toko", chats.map(chat => `<button class="list-row chat-open" type="button" data-chat="${safe(chat.id)}"><span><strong>${safe(sellerName(chat.sellerId))}</strong><span>${safe(chat.messages.at(-1)?.text || "Belum ada pesan")}</span></span><span>Buka</span></button>`).join("") || `<div class="empty-state"><strong>Belum ada percakapan</strong>Buka detail produk lalu pilih Tanya toko.</div>`, "buyer-chats");
  }

  function showChat(chatId) {
    const user = currentUser();
    const chat = Store.chats.find(item => item.id === chatId && (item.sellerId === user?.id || item.buyerId === user?.id));
    if (!chat) return toast("Percakapan tidak ditemukan.");
    if (user.role === "seller") chat.unread = false;
    openDialog(`Chat · ${user.role === "seller" ? chat.buyerName : sellerName(chat.sellerId)}`, `${chat.messages.map(message => `<div class="list-row"><div><strong>${message.from === "seller" ? safe(sellerName(chat.sellerId)) : safe(chat.buyerName)}</strong><div>${safe(message.text)}</div></div><small>${new Date(message.createdAt).toLocaleString("id-ID")}</small></div>`).join("")}<form id="chatForm" data-chat-id="${safe(chat.id)}"><div class="field"><label for="chatMessage">${user.role === "seller" ? "Balas pesan" : "Pesan"}</label><textarea id="chatMessage" name="message" rows="3" required maxlength="1000"></textarea></div><button class="primary-button full-width" type="submit">Kirim pesan</button></form>`, "chat");
  }

  function showAccount() {
    const user = currentUser();
    const roleName = { seller: "Penjual", buyer: "Pembeli", gudang: "Gudang" };
    if (user?.role === "seller") {
      const products = Store.products.filter(product => product.sellerId === user.id);
      const orders = Store.orders.filter(order => order.items.some(item => item.sellerId === user.id));
      const waiting = orders.filter(order => ["Diproses", "Diteruskan ke gudang", "Disiapkan", "Dikemas"].includes(order.status)).length;
      const lines = orders.flatMap(order => order.items.filter(item => item.sellerId === user.id));
      const revenue = lines.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const unread = Store.chats.filter(chat => chat.sellerId === user.id && chat.unread).length;
      const lowStock = products.filter(product => availableStock(product) <= (product.lowStockThreshold ?? 5)).length;
      openDialog("Akun toko", `<section class="seller-account-profile"><div class="seller-avatar" aria-hidden="true">${safe(user.name.trim().slice(0, 1).toUpperCase())}</div><div><h2>${safe(user.name)}</h2><p>${safe(user.email)}</p><p>${safe(user.city || "Lokasi toko belum diatur")}</p></div><button class="secondary-button" type="button" data-action="edit-store-profile">Edit profil</button></section><section class="seller-account-metrics" aria-label="Ringkasan toko"><div><strong>${products.length}</strong><span>Produk</span></div><div><strong>${waiting}</strong><span>Perlu diproses</span></div><div><strong>${money(revenue)}</strong><span>Nilai pesanan tersimpan</span></div></section><section class="seller-account-section"><h3>Perlu perhatian</h3><button class="seller-account-link" type="button" data-account-destination="orders"><span>Pesanan aktif</span><strong>${waiting}</strong></button><button class="seller-account-link" type="button" data-account-destination="sales"><span>Pesan belum dibaca</span><strong>${unread}</strong></button><button class="seller-account-link" type="button" data-account-destination="products"><span>Produk stok menipis</span><strong>${lowStock}</strong></button></section><section class="seller-account-section"><h3>Kelola toko</h3><button class="seller-account-link" type="button" data-account-destination="products"><span>Produk saya</span><span>Kelola katalog</span></button><button class="seller-account-link" type="button" data-account-destination="orders"><span>Pesanan</span><span>Lihat antrean toko</span></button><button class="seller-account-link" type="button" data-account-destination="sales"><span>Penjualan</span><span>Harga, laporan, chat</span></button></section><section class="seller-account-section"><h3>Akun & keamanan</h3><div class="list-row"><span>Email akun</span><strong>${safe(user.email)}</strong></div><button class="secondary-button full-width mt-2" type="button" data-action="change-password">Ubah kata sandi</button><button class="danger-button full-width mt-4" type="button" data-action="logout">Keluar</button></section>`, "account");
      return;
    }
    openDialog("Akun", user ? `<div class="list-row"><span>Nama</span><strong>${safe(user.name)}</strong></div><div class="list-row"><span>Email</span><span>${safe(user.email)}</span></div><div class="list-row"><span>Peran</span><span>${roleName[user.role] || "—"}</span></div><button class="secondary-button full-width mt-2" type="button" data-action="change-password">Ubah kata sandi</button><button class="danger-button full-width mt-4" type="button" data-action="logout">Keluar</button>` : `<div class="notice">Masuk untuk memakai keranjang atau mengelola produk.</div><button class="primary-button full-width" type="button" data-action="login">Masuk</button><button class="secondary-button full-width mt-2" type="button" data-auth-mode="register">Buat akun</button>`, "account");
  }

  function showPasswordForm() {
    if (!currentUser()) return showAuth("login");
    openDialog("Ubah kata sandi", `<form id="passwordForm" novalidate>
      <div class="field"><label for="currentPassword">Kata sandi saat ini</label><input id="currentPassword" name="currentPassword" type="password" autocomplete="current-password" required minlength="6"></div>
      <div class="field"><label for="newPassword">Kata sandi baru</label><input id="newPassword" name="newPassword" type="password" autocomplete="new-password" required minlength="6" maxlength="256"></div>
      <div class="field"><label for="confirmPassword">Ulangi kata sandi baru</label><input id="confirmPassword" name="confirmPassword" type="password" autocomplete="new-password" required minlength="6" maxlength="256"></div>
      <p id="passwordError" class="form-error" role="alert" aria-live="polite"></p><button class="primary-button full-width" type="submit">Simpan kata sandi</button>
    </form>`, "password-form");
  }

  function showStoreProfile() {
    const seller = requireRole("seller");
    if (!seller) return;
    openDialog("Profil toko", `<form id="storeProfileForm" novalidate>
      <div class="field"><label for="storeName">Nama toko</label><input id="storeName" name="name" autocomplete="organization" required minlength="2" maxlength="80" value="${safe(seller.name)}"></div>
      <div class="field"><label for="storeCity">Kota toko</label><input id="storeCity" name="city" autocomplete="address-level2" required minlength="2" maxlength="80" value="${safe(seller.city || "")}"></div>
      <p id="storeProfileError" class="form-error" role="alert" aria-live="polite"></p><button class="primary-button full-width" type="submit">Simpan perubahan</button>
    </form>`, "store-profile");
  }

  function showSellerProducts() {
    const seller = requireRole("seller");
    if (!seller) return;
    const tabs = `<nav class="seller-tabs" aria-label="Menu penjual"><button type="button" class="${state.sellerTab === "products" ? "is-active" : ""}" data-seller-tab="products" aria-current="${state.sellerTab === "products" ? "page" : "false"}">Produk</button><button type="button" class="${state.sellerTab === "orders" ? "is-active" : ""}" data-seller-tab="orders" aria-current="${state.sellerTab === "orders" ? "page" : "false"}">Pesanan</button><button type="button" class="${state.sellerTab === "sales" ? "is-active" : ""}" data-seller-tab="sales" aria-current="${state.sellerTab === "sales" ? "page" : "false"}">Penjualan</button></nav>`;
    if (state.sellerTab === "orders") {
      const orders = Store.orders.filter(order => order.items.some(item => item.sellerId === seller.id)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const rows = orders.map(order => {
        const items = order.items.filter(item => item.sellerId === seller.id);
        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        return `<article class="list-row order-row"><div><strong>${safe(order.orderNumber)}</strong><div>${new Date(order.createdAt).toLocaleDateString("id-ID")} · ${safe(statusLabel(order.status))}</div><div>${items.map(item => `${safe(item.name)} × ${item.quantity}`).join(", ")}</div><div>Pembeli: ${safe(order.shipping?.name || "—")} · ${money(total)}</div></div>${order.status === "Diproses" ? `<button class="primary-button" type="button" data-handoff="${safe(order.id)}">Teruskan ke gudang</button>` : ""}</article>`;
      }).join("");
      openDialog("Produk saya", `${tabs}<h3>Pesanan toko</h3>${rows || `<div class="empty-state"><strong>Belum ada pesanan</strong>Pesanan produk tokomu akan muncul di sini.</div>`}`, "seller-products");
      return;
    }
    if (state.sellerTab === "sales") {
      const products = Store.products.filter(product => product.sellerId === seller.id);
      openDialog("Produk saya", `${tabs}<h3>Harga produk</h3>${products.map(product => `<form class="price-form list-row" data-price-product="${safe(product.id)}"><div><strong>${safe(product.name)}</strong><div>Stok tersedia: ${availableStock(product)}</div></div><label>Harga <input name="price" type="number" min="0" step="1" required value="${product.price}"></label><button class="secondary-button" type="submit">Simpan</button></form>`).join("")}<h3 class="mt-4">Laporan penjualan</h3>${salesReport(seller.id)}<h3 class="mt-4">Pesan pelanggan</h3>${showChatList(seller.id)}`, "seller-products");
      return;
    }
    const products = Store.products.filter(product => product.sellerId === seller.id);
    const rows = products.map(product => `<div class="list-row"><div><strong>${safe(product.name)}</strong><div>${money(product.price)} · Stok ${product.stock}</div></div><div class="form-actions"><button class="secondary-button" type="button" data-edit-product="${safe(product.id)}">Edit</button><button class="danger-button" type="button" data-delete-product="${safe(product.id)}">Hapus</button></div></div>`).join("");
    openDialog("Produk saya", `${tabs}${rows || `<div class="empty-state"><strong>Belum ada produk</strong>Tambahkan produk pertama tokomu.</div>`}<button class="primary-button full-width mt-4" type="button" data-action="new-product">Tambah produk</button>`, "seller-products");
  }

  function showProductForm(productId = "") {
    const seller = requireRole("seller");
    if (!seller) return;
    const product = productId ? Store.products.find(item => item.id === productId && item.sellerId === seller.id) : null;
    if (productId && !product) return toast("Produk ini bukan milik tokomu.");
    openDialog(product ? "Edit produk" : "Tambah produk", `<form id="productForm" data-product-id="${safe(product?.id || "")}" novalidate>
      <div class="field"><label for="productName">Nama produk</label><input id="productName" name="name" required value="${safe(product?.name || "")}"></div>
      <div class="field"><label for="productDescription">Deskripsi</label><textarea id="productDescription" name="description" rows="6" aria-describedby="descriptionHint">${safe(product?.description || "")}</textarea><small id="descriptionHint">Tekan Enter untuk baris baru. Pakai • di awal baris untuk poin.</small></div>
      <div class="field"><label for="productPrice">Harga (rupiah)</label><input id="productPrice" name="price" type="number" inputmode="numeric" min="0" step="1" required value="${safe(product?.price ?? "")}"></div>
      ${product ? `<p class="notice">Stok dikelola Gudang. Stok tersedia: ${product.stock} unit.</p>` : ""}
      <div class="field"><label for="productCategory">Kategori</label><select id="productCategory" name="category">${Store.categories.filter(category => category !== "Semua").map(category => `<option ${product?.category === category ? "selected" : ""}>${safe(category)}</option>`).join("")}</select></div>
      <div class="field"><label for="productImage">Path gambar (opsional)</label><input id="productImage" name="image" placeholder="src/images/nama-produk.jpg" value="${safe(product?.image || "")}"></div>
      <p id="productError" class="form-error" role="alert"></p><button class="primary-button full-width" type="submit">Simpan produk</button>
    </form>`, "product-form");
  }

  async function saveOrder(form) {
    const user = currentUser();
    if (user?.role !== "buyer") return showAuth("login", "checkout");
    const items = cartForUser(user.id);
    const fresh = items.map(item => ({ item, product: Store.products.find(product => product.id === item.productId) }));
    const invalid = fresh.find(({ item, product }) => !product || availableStock(product) < item.quantity);
    if (invalid) { $("checkoutError").textContent = `${invalid.item.name} sudah berubah stoknya. Periksa keranjang lalu coba lagi.`; return; }
    const data = new FormData(form);
    if (!["name", "phone", "address"].every(key => String(data.get(key) || "").trim())) {
      $("checkoutError").textContent = "Lengkapi nama, nomor telepon, dan alamat.";
      return;
    }
    const snapshot = fresh.map(({ item, product }) => ({ productId: product.id, sellerId: product.sellerId, name: product.name, price: product.price, quantity: item.quantity }));
    const order = { id: crypto.randomUUID(), orderNumber: `TK-${Date.now().toString(36).toUpperCase()}`, buyerId: user.id, items: snapshot, shipping: { name: String(data.get("name")).trim(), phone: String(data.get("phone")).trim(), address: String(data.get("address")).trim() }, paymentMethod: data.get("payment"), subtotal: cartTotal(items), shippingCost: 0, total: cartTotal(items), status: "Diproses", createdAt: new Date().toISOString(), history: [{ status: "Diproses", at: new Date().toISOString() }] };
    Store.orders = [order, ...Store.orders];
    Store.carts = Store.carts.filter(item => item.userId !== user.id);
    try { await Store.save(); }
    catch { $("checkoutError").textContent = "Pesanan gagal disimpan ke data.json. Pastikan Node.js masih berjalan."; return; }
    closeDialog();
    openDialog("Pesanan dibuat", `<div class="notice">Pesanan demo berhasil dibuat. Tidak ada pembayaran atau pengiriman sungguhan.</div><div class="list-row"><span>Nomor pesanan</span><strong>${safe(order.orderNumber)}</strong></div><div class="list-row"><span>Total</span><strong>${money(order.total)}</strong></div><button class="primary-button full-width mt-4" type="button" data-action="orders">Lihat pesanan</button>`, "confirmation");
    render();
  }

  function validate(form) { return form.reportValidity(); }

  async function handleSubmit(event) {
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
        try {
          const user = await Store.authenticate({ action: "register", name: String(data.get("name")).trim(), email, password, role: data.get("role") });
          Store.users = [...Store.users.filter(item => item.id !== user.id), user];
          Store.session = { userId: user.id, role: user.role };
        } catch (cause) { error.textContent = cause.message; return; }
      } else {
        let user;
        try { user = await Store.authenticate({ action: "login", email, password }); }
        catch (cause) { error.textContent = cause.message; return; }
        Store.users = [...Store.users.filter(item => item.id !== user.id), user];
        Store.session = { userId: user.id, role: user.role };
      }
      try { await Store.save(); }
      catch { error.textContent = "Akun gagal disimpan ke data.json. Pastikan Node.js masih berjalan."; return; }
      const next = state.authNext;
      state.authNext = "";
      closeDialog(); render(); toast("Berhasil masuk.");
      if (next === "checkout") showCheckout();
      else if (next.startsWith("add:")) addToCart(next.slice(4));
      return;
    }
    if (form.id === "storeProfileForm") {
      const seller = currentUser();
      if (seller?.role !== "seller") return;
      const name = String(data.get("name")).trim();
      const city = String(data.get("city")).trim();
      if (name.length < 2 || city.length < 2) { $("storeProfileError").textContent = "Isi nama toko dan kota minimal 2 karakter."; return; }
      Store.users = Store.users.map(user => user.id === seller.id ? { ...user, name, city } : user);
      try { await Store.save(); }
      catch (error) { $("storeProfileError").textContent = error.message || "Profil toko gagal disimpan."; return; }
      closeDialog(); render(); showAccount(); toast("Profil toko diperbarui.");
      return;
    }
    if (form.id === "passwordForm") {
      const user = currentUser();
      const currentPassword = String(data.get("currentPassword"));
      const newPassword = String(data.get("newPassword"));
      if (newPassword !== data.get("confirmPassword")) { $("passwordError").textContent = "Konfirmasi kata sandi baru tidak cocok."; return; }
      if (newPassword === currentPassword) { $("passwordError").textContent = "Pilih kata sandi yang berbeda dari kata sandi saat ini."; return; }
      try { await Store.changePassword(user.id, currentPassword, newPassword); }
      catch (error) { $("passwordError").textContent = error.message; return; }
      Store.users = Store.users.map(item => item.id === user.id ? { ...item, password: newPassword } : item);
      closeDialog(); showAccount(); toast("Kata sandi berhasil diubah.");
      return;
    }
    if (form.id === "checkoutForm") { await saveOrder(form); return; }
    if (form.id === "stockForm") {
      if (currentUser()?.role !== "gudang") return;
      const product = Store.products.find(item => item.id === data.get("productId"));
      const delta = Number(data.get("delta")); const reason = String(data.get("reason")).trim();
      if (!product || !Number.isSafeInteger(delta) || !delta || product.stock + delta < reservedStock(product.id) || reason.length < 3) { $("stockError").textContent = "Produk, jumlah, atau alasan tidak valid. Stok tidak boleh di bawah jumlah pesanan aktif."; return; }
      Store.products = Store.products.map(item => item.id === product.id ? { ...item, stock: item.stock + delta } : item);
      Store.stockMovements = [{ id: crypto.randomUUID(), productId: product.id, productName: product.name, type: delta > 0 ? "Barang masuk" : "Koreksi stok", delta, reason, userId: currentUser().id, createdAt: new Date().toISOString() }, ...Store.stockMovements];
      try { await Store.save(); } catch (error) { $("stockError").textContent = error.message; return; }
      showWarehouse(); toast("Stok dan riwayat diperbarui."); return;
    }
    if (form.id === "chatForm" || form.id === "buyerChatForm") {
      const user = currentUser();
      const message = String(data.get("message") || "").trim();
      const validChat = Store.chats.find(item => item.id === form.dataset.chatId && (item.sellerId === user?.id || item.buyerId === user?.id));
      if (!user || !validChat || !message) return;
      validChat.messages.push({ from: user.role, text: message, createdAt: new Date().toISOString() }); validChat.unread = user.role === "buyer";
      try { await Store.save(); } catch (error) { toast(error.message); return; }
      showChat(validChat.id); return;
    }
    if (form.matches("[data-price-product]")) {
      const seller = currentUser(); const product = Store.products.find(item => item.id === form.dataset.priceProduct && item.sellerId === seller?.id); const price = Number(data.get("price"));
      if (!product || !Number.isSafeInteger(price) || price < 0) return toast("Harga tidak valid.");
      Store.products = Store.products.map(item => item.id === product.id ? { ...item, price } : item);
      try { await Store.save(); } catch (error) { toast(error.message); return; }
      showSalesTools(); toast("Harga diperbarui."); return;
    }
    if (form.id === "productForm") {
      const seller = currentUser();
      const price = Number(data.get("price"));
      if (!Number.isSafeInteger(price) || price < 0) { $("productError").textContent = "Harga harus berupa bilangan bulat nol atau lebih."; return; }
      const productId = form.dataset.productId;
      const current = Store.products.find(item => item.id === productId);
      const image = String(data.get("image")).trim();
      if (image && !/^src\/images\/[\w.-]+\.(?:png|jpe?g|webp)$/i.test(image)) { $("productError").textContent = "Path gambar gunakan format src/images/nama-file.jpg, png, atau webp."; return; }
      const product = { ...current, id: current?.id || crypto.randomUUID(), sellerId: seller.id, name: String(data.get("name")).trim(), description: String(data.get("description")).trim(), price, stock: current?.stock || 0, category: data.get("category"), image, icon: current?.icon || "📦", createdAt: current?.createdAt || new Date().toISOString() };
      Store.products = current ? Store.products.map(item => item.id === product.id ? product : item) : [product, ...Store.products];
      try { await Store.save(); }
      catch (error) { $("productError").textContent = error.message; return; }
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

  async function addToCart(productId, buyNow = false, trigger = null) {
    const user = requireRole("buyer", buyNow ? "checkout" : `add:${productId}`);
    if (!user) return;
    const product = Store.products.find(item => item.id === productId);
    if (!product || product.stock < 1) return toast("Produk sedang tidak tersedia.");
    const items = cartForUser(user.id);
    const existing = items.find(item => item.productId === product.id);
    if (existing?.quantity >= product.stock) return toast("Jumlah sudah mencapai stok tersedia.");
    const next = existing ? items.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...items, { userId: user.id, productId: product.id, name: product.name, price: product.price, quantity: 1 }];
    Store.carts = [...Store.carts.filter(item => item.userId !== user.id), ...next];
    try { await Store.save(); }
    catch { return toast("Keranjang gagal disimpan ke data.json."); }
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
  document.addEventListener("click", async event => {
    const target = event.target.closest("[data-store], [data-seller-tab], [data-account-destination], [data-add], [data-detail], [data-buy], [data-follow], [data-action], [data-auth-mode], [data-quantity], [data-cancel-order], [data-edit-product], [data-delete-product], [data-handoff], [data-fulfill], [data-order], [data-chat], [data-start-chat]");
    if (!target) return;
    if (target.dataset.sellerTab) { state.sellerTab = target.dataset.sellerTab; showSellerProducts(); return; }
    if (target.dataset.accountDestination) { state.sellerTab = target.dataset.accountDestination; showSellerProducts(); return; }
    if (target.hasAttribute("data-store")) { state.storeId = target.dataset.store; render(); return; }
    if (target.dataset.add) { addToCart(target.dataset.add, false, target); return; }
    if (target.dataset.detail) { showDetail(target.dataset.detail); return; }
    if (target.dataset.buy) { addToCart(target.dataset.buy, true); return; }
    if (target.dataset.startChat) {
      const buyer = requireRole("buyer"); if (!buyer) return;
      const product = Store.products.find(item => item.id === target.dataset.startChat); if (!product?.sellerId) return toast("Toko tidak ditemukan.");
      let chat = Store.chats.find(item => item.buyerId === buyer.id && item.sellerId === product.sellerId);
      if (!chat) { chat = { id: crypto.randomUUID(), buyerId: buyer.id, buyerName: buyer.name, sellerId: product.sellerId, productId: product.id, messages: [], unread: false }; Store.chats = [chat, ...Store.chats]; }
      try { await Store.save(); } catch (error) { return toast(error.message); }
      closeDialog(); openDialog(`Chat · ${sellerName(product.sellerId)}`, `<p class="muted-copy">Tanya tentang ${safe(product.name)}.</p><form id="buyerChatForm" data-chat-id="${safe(chat.id)}"><div class="field"><label for="buyerMessage">Pesan</label><textarea id="buyerMessage" name="message" rows="3" required maxlength="1000"></textarea></div><button class="primary-button full-width" type="submit">Kirim pesan</button></form>`, "chat"); return;
    }
    if (target.dataset.chat) { showChat(target.dataset.chat); return; }
    if (target.dataset.handoff) {
      const seller = currentUser(); const order = Store.orders.find(item => item.id === target.dataset.handoff && item.status === "Diproses" && item.items.some(line => line.sellerId === seller?.id));
      if (!order) return toast("Pesanan tidak dapat diteruskan.");
      order.status = "Diteruskan ke gudang"; (order.history ||= []).push({ status: order.status, at: new Date().toISOString(), userId: seller.id });
      try { await Store.save(); } catch (error) { return toast(error.message); }
      showSellerProducts(); return;
    }
    if (target.dataset.fulfill) {
      const warehouse = currentUser(); const order = Store.orders.find(item => item.id === target.dataset.order); const next = { pick: ["Diteruskan ke gudang", "Disiapkan"], pack: ["Disiapkan", "Dikemas"], ship: ["Dikemas", "Dikirim"] }[target.dataset.fulfill];
      if (warehouse?.role !== "gudang" || !order || order.status !== next?.[0]) return toast("Status pesanan sudah berubah.");
      if (target.dataset.fulfill === "ship") {
        const invalid = order.items.find(line => !Store.products.some(product => product.id === line.productId && product.stock - line.quantity >= reservedStock(product.id) - line.quantity));
        if (invalid) return toast(`Stok ${invalid.name} tidak cukup untuk pengiriman.`);
        Store.products = Store.products.map(product => { const line = order.items.find(item => item.productId === product.id); return line ? { ...product, stock: product.stock - line.quantity, sold: (product.sold || 0) + line.quantity } : product; });
        Store.stockMovements = [...order.items.map(line => ({ id: crypto.randomUUID(), productId: line.productId, productName: line.name, type: "Keluar untuk pesanan", delta: -line.quantity, reason: order.orderNumber, userId: warehouse.id, createdAt: new Date().toISOString() })), ...Store.stockMovements];
      }
      order.status = next[1]; (order.history ||= []).push({ status: order.status, at: new Date().toISOString(), userId: warehouse.id });
      try { await Store.save(); } catch (error) { return toast(error.message); }
      showWarehouse(); return;
    }
    if (target.dataset.follow) {
      const key = `tokoko-follow-${target.dataset.follow}`;
      const following = target.getAttribute("aria-pressed") !== "true";
      try { localStorage.setItem(key, String(following)); }
      catch { return toast("Status ikuti gagal disimpan di browser."); }
      target.setAttribute("aria-pressed", String(following));
      target.textContent = following ? "Mengikuti" : "Ikuti";
      return;
    }
    if (target.dataset.authMode) { showAuth(target.dataset.authMode, target.dataset.next || ""); return; }
    if (target.dataset.quantity) {
      const user = currentUser(); const delta = Number(target.dataset.delta); const product = Store.products.find(item => item.id === target.dataset.quantity);
      Store.carts = Store.carts.flatMap(item => {
        if (item.userId !== user.id || item.productId !== target.dataset.quantity) return [item];
        const quantity = Math.min(product?.stock ?? 0, item.quantity + delta);
        return quantity > 0 ? [{ ...item, quantity }] : [];
      });
      try { await Store.save(); }
      catch { return toast("Keranjang gagal disimpan ke data.json."); }
      render(); showCart(); return;
    }
    if (target.dataset.cancelOrder) {
      const user = currentUser(); const order = Store.orders.find(item => item.id === target.dataset.cancelOrder && item.buyerId === user.id && item.status === "Diproses");
      if (!order || !confirm("Batalkan pesanan ini? Stok produk akan dikembalikan.")) return;
      Store.orders = Store.orders.map(item => item.id === order.id ? { ...item, status: "Dibatalkan" } : item);
      try { await Store.save(); }
      catch { return toast("Pesanan gagal diperbarui di data.json."); }
      showOrders(); render(); return;
    }
    if (target.dataset.editProduct) { showProductForm(target.dataset.editProduct); return; }
    if (target.dataset.deleteProduct) {
      const seller = currentUser(); const product = Store.products.find(item => item.id === target.dataset.deleteProduct && item.sellerId === seller?.id);
      if (!product || !confirm(`Hapus produk “${product.name}”?`)) return;
      Store.products = Store.products.filter(item => item.id !== product.id);
      try { await Store.save(); }
      catch { return toast("Produk gagal dihapus dari data.json."); }
      showSellerProducts(); toast("Produk dihapus."); return;
    }
    const action = target.dataset.action;
    if (!action) return;
    switch (action) {
      case "cart": showCart(); break;
      case "close": closeDialog(); break;
      case "checkout": showCheckout(); break;
      case "orders": showOrders(); break;
      case "sales-orders": showSalesOrders(); break;
      case "sales-tools": showSalesTools(); break;
      case "buyer-chats": showBuyerChats(); break;
      case "account": showAccount(); break;
      case "edit-store-profile": showStoreProfile(); break;
      case "change-password": showPasswordForm(); break;
      case "new-product": showProductForm(); break;
      case "logout": Store.session = null; closeDialog(); render(); toast("Kamu sudah keluar."); break;
      case "seller-products": state.sellerTab = "products"; showSellerProducts(); break;
      case "login": showAuth(); break;
    }
  });
  $("overlay").addEventListener("click", event => { if (event.target === $("overlay")) closeDialog(); });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeDialog();
    if (event.key === "Tab" && (!$("overlay").hidden || !$("fullPage").hidden)) {
      const dialog = !$("fullPage").hidden ? $("fullPage") : $("overlay").querySelector(".dialog");
      const focusable = [...dialog.querySelectorAll("a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), summary, [tabindex='0']")];
      if (!focusable.length) { event.preventDefault(); dialog.focus(); return; }
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    }
  });

  async function start() {
    $("products").innerHTML = `<p class="loading-state" role="status">Memuat produk...</p>`;
    try { await Store.init(); render(); updateNav(); }
    catch (error) {
      $("products").innerHTML = `<div class="empty-state"><strong>Data produk belum tersedia</strong>${safe(error.message)}<p><button class="secondary-button" type="button" data-action="retry">Coba lagi</button></p></div>`;
    }
  }
  document.addEventListener("click", event => { if (event.target.closest('[data-action="retry"]')) start(); });
  start();
})();
