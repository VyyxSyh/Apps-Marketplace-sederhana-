(() => {
  const $ = id => document.getElementById(id);
  const money = value => `Rp ${Number(value).toLocaleString("id-ID")}`;
  const state = { storeId: "", sellerTab: "products", sellerSalesView: "report", pendingProductRestore: null, query: "", modal: "", sort: "featured", authNext: "", lastFocus: null, toastTimer: 0, chatTimer: 0, detailProductId: "" };
  const safe = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const cartForUser = userId => Store.carts.filter(item => item.userId === userId);
  const currentUser = () => Store.users.find(user => user.id === Store.session?.userId) || null;
  const sellerName = id => Store.users.find(user => user.id === id)?.name || "Penjual lokal";
  const warehouseSellerId = user => user?.role === "gudang" ? user.sellerId : null;
  const warehouseOwnsProduct = (user, product) => product?.sellerId === warehouseSellerId(user);
  function toast(message, action) {
    const el = $("toast");
    el.replaceChildren(document.createTextNode(message));
    el.classList.toggle("has-action", Boolean(action));
    if (action) {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.action = action.name;
      button.textContent = action.label;
      el.append(button);
    }
    el.classList.add("is-visible");
    clearTimeout(state.toastTimer);
    const dismiss = () => {
      el.classList.remove("is-visible", "has-action");
      if (action?.name === "undo-product-delete") state.pendingProductRestore = null;
    };
    state.toastTimer = setTimeout(() => {
      if (el.contains(document.activeElement)) el.addEventListener("focusout", () => { if (!el.contains(document.activeElement)) dismiss(); }, { once: true });
      else dismiss();
    }, action ? 8000 : 2400);
  }

  function setNav() {
    const user = currentUser();
    document.querySelectorAll("[data-seller-nav]").forEach(el => { el.hidden = user?.role !== "seller"; });
    document.querySelectorAll("[data-buyer-nav]").forEach(el => { el.hidden = user?.role === "seller" || user?.role === "gudang"; });
    document.querySelectorAll("[data-account-nav]").forEach(el => { el.hidden = false; });
    const badge = $("cartBadge");
    if (!badge) return;
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
      <button class="product-art" type="button" data-detail="${safe(product.id)}">
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
    $("products").innerHTML = products.length ? products.map(productCard).join("") : `<div class="empty-state"><strong>Produk tidak ditemukan</strong>Coba kata kunci lain atau pilih toko berbeda.</div>`;
  }

  function render() {
    setNav();
    if (document.body.dataset.page) return;
    renderCategories(); renderProducts();
  }

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
    $("modalBody").classList.toggle("detail-body", name === "detail");
    $("overlay").querySelector(".dialog").classList.toggle("detail-dialog", name === "detail");
    $("overlay").querySelector(".dialog").classList.toggle("order-dialog", name === "orders" || name === "order-detail");
    $("overlay").querySelector(".dialog").classList.remove("is-expanded");
    $("overlay").querySelector(".dialog").style.removeProperty("--sheet-height");
    const header = $("overlay").querySelector(".dialog-header");
    header.innerHTML = name === "detail" ? `<h2 id="modalTitle">${safe(title)}</h2><div class="detail-toolbar"><button class="toolbar-icon back-icon" type="button" data-detail-back aria-label="Kembali"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M19 12H5m7 7-7-7 7-7"/></svg></button><span class="detail-toolbar-spacer"></span><button class="toolbar-icon" type="button" data-detail-search aria-label="Cari produk"><svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg></button><button class="toolbar-icon" type="button" data-detail-share aria-label="Bagikan produk"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 16V3m-5 5 5-5 5 5M5 12v8h14v-8"/></svg></button><button class="toolbar-icon cart-toolbar-button" type="button" data-detail-cart aria-label="Buka keranjang"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h8.5a2 2 0 0 0 1.9-1.5L22 8H6"/><circle cx="10" cy="21" r="1"/><circle cx="18" cy="21" r="1"/></svg><span class="detail-cart-count" hidden></span></button></div>` : `<h2 id="modalTitle">${safe(title)}</h2><button class="icon-button" type="button" data-action="close" aria-label="Tutup">×</button>`;
    const cartCount = header.querySelector(".detail-cart-count");
    if (cartCount) { const count = cartForUser(currentUser()?.id).reduce((sum, item) => sum + item.quantity, 0); cartCount.textContent = count; cartCount.hidden = !count; }
    $("overlay").hidden = false;
    document.body.classList.add("dialog-open");
    requestAnimationFrame(() => {
      const dialog = $("overlay").querySelector(".dialog");
      if (name === "detail") { dialog.scrollTop = 0; dialog.focus(); return; }
       const first = name === "chat" ? $("overlay").querySelector("#chatMessage") : $("overlay").querySelector("input:not(:disabled), button:not(:disabled), select:not(:disabled), textarea:not(:disabled), summary");
      (first || $("overlay").querySelector(".dialog")).focus();
    });
  }

  function closeDialog() {
    if ($("overlay").hidden) return;
    clearInterval(state.chatTimer);
    $("overlay").hidden = true;
    document.body.classList.remove("dialog-open");
    state.modal = "";
    state.lastFocus?.focus?.();
    if (!document.body.dataset.page) render();
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
    openDialog(register ? "Buat akun KOLAP" : "Masuk ke KOLAP", `<div class="notice">Akun demo hanya tersimpan di browser ini. Jangan gunakan kata sandi penting.</div>
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
  const reservedStock = productId => Store.orders.reduce((sum, order) => sum + order.items.filter(item => item.productId === productId && activeLine(item) && !["Dikirim", "Selesai"].includes(item.status)).reduce((count, item) => count + item.quantity, 0), 0);
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
    state.detailProductId = id;
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
          <div class="detail-actions"><button class="secondary-button ask-store-button" type="button" data-start-chat="${safe(product.id)}" aria-label="Tanya toko ${safe(sellerName(product.sellerId))}" title="Tanya toko"><svg aria-hidden="true" viewBox="0 0 512 512"><path d="M0 240c0 54.4 19.3 104.6 51.9 144.9L3.1 474.3c-2 3.7-3.1 7.9-3.1 12.2 0 14.1 11.4 25.5 25.5 25.5 4 0 7.8-.6 11.5-2.1L153.4 460c31.4 12.9 66.1 20 102.6 20 141.4 0 256-107.5 256-240S397.4 0 256 0 0 107.5 0 240zM94 407.9c9.3-17.1 7.4-38.1-4.8-53.2-26.1-32.3-41.2-71.9-41.2-114.7 0-103.2 90.2-192 208-192s208 88.8 208 192-90.2 192-208 192c-30.2 0-58.7-5.9-84.3-16.4-11.9-4.9-25.3-4.8-37.1 .3L76 440.9 94 407.9zM144 272a32 32 0 1 0 0-64 32 32 0 0 0 0 64zm144-32a32 32 0 1 0-64 0 32 32 0 0 0 64 0zm80 32a32 32 0 1 0 0-64 32 32 0 0 0 0 64z"/></svg></button><button class="primary-button" type="button" data-buy="${safe(product.id)}" ${product.stock > 0 ? "" : "disabled"}>Beli sekarang</button><button class="secondary-button" type="button" data-add="${safe(product.id)}" ${product.stock > 0 ? "" : "disabled"}>+ Keranjang</button></div>`, "detail");
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
    if (items.length > 5) return toast("Maksimal 5 produk berbeda per pesanan.");
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

  const sellerStatus = (order, sellerId) => order.sellerStatuses?.[sellerId] || (order.items.some(item => item.sellerId === sellerId) ? ({ Diproses: "Menunggu penjual", "Diteruskan ke gudang": "Diteruskan ke gudang" })[order.status] || order.status : "Diproses");
  const activeLine = line => !["Ditolak", "Dibatalkan"].includes(line.status);
  function showOrders() {
    const user = requireRole("buyer");
    if (!user) return;
    const orders = Store.orders.filter(order => order.buyerId === user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const cards = orders.map(order => {
      const sellers = [...new Set(order.items.map(item => item.sellerId))];
      const total = order.items.filter(activeLine).reduce((sum, line) => sum + line.price * line.quantity, 0);
      const statuses = sellers.map(id => sellerStatus(order, id));
      const overall = statuses.every(status => status === "Selesai") ? "Selesai" : statuses.every(status => ["Ditolak", "Dibatalkan"].includes(status)) ? "Dibatalkan" : statuses.some(status => status === "Dikirim") ? "Dalam pengiriman" : statuses.some(status => status === "Disiapkan" || status === "Dikemas" || status === "Diteruskan ke gudang") ? "Diproses" : statuses.some(status => status === "Ditolak" || status === "Dibatalkan") ? "Perlu perhatian" : "Menunggu penjual";
      const lines = order.items.filter(activeLine);
      const preview = lines[0];
      return `<article class="buyer-order-card" data-order-card="${safe(order.id)}" data-search="${safe(`${order.orderNumber} ${order.items.map(item => item.name).join(" ")} ${sellers.map(sellerName).join(" ")}`.toLocaleLowerCase("id"))}" data-statuses="${safe(statuses.join("|"))}" data-products="${safe(order.items.map(item => item.name).join("|"))}"><header class="buyer-order-head"><span class="buyer-order-bag" aria-hidden="true">▣</span><div class="buyer-order-kind"><strong>Belanja</strong><time datetime="${safe(order.createdAt)}">${new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</time></div><span class="buyer-order-status" data-status="${safe(overall)}">${safe(overall)}</span><button class="buyer-order-more" type="button" data-order-detail="${safe(order.id)}" aria-label="Detail pesanan ${safe(order.orderNumber)}">⋮</button></header><button class="buyer-order-preview" type="button" data-order-detail="${safe(order.id)}"><span class="buyer-order-thumb">${preview?.image ? `<img src="${safe(preview.image)}" alt="" width="72" height="72">` : `<span aria-hidden="true">${safe(preview?.icon || "□")}</span>`}</span><span class="buyer-order-product"><strong>${safe(preview?.name || "Produk")}</strong><span>${preview?.quantity || 0} barang</span></span></button>${lines.length > 1 ? `<p class="buyer-order-extra">+${lines.length - 1} produk lainnya</p>` : ""}<footer class="buyer-order-foot"><div><span>Total belanja</span><strong>${money(total)}</strong><small>${sellers.map(id => `${safe(sellerName(id))}: ${safe(statusLabel(sellerStatus(order, id)))}`).join(" · ")}</small></div><button class="secondary-button" type="button" data-order-detail="${safe(order.id)}">Detail pesanan</button></footer>${sellers.some(id => sellerStatus(order, id) === "Menunggu penjual") ? `<div class="buyer-order-cancel">${sellers.filter(id => sellerStatus(order, id) === "Menunggu penjual").map(id => `<button class="secondary-button" type="button" data-buyer-cancel-line="${safe(id)}" data-order="${safe(order.id)}">Batalkan ${safe(sellerName(id))}</button>`).join("")}</div>` : ""}</article>`;
    }).join("");
    const content = `<section class="buyer-orders-page"><form class="buyer-orders-search" id="orderSearchForm"><label for="orderSearch">Cari transaksi</label><input id="orderSearch" type="search" placeholder="Cari transaksi"><button class="secondary-button" type="submit">Cari</button></form><div class="buyer-order-filters" aria-label="Filter pesanan"><label><span>Status</span><select id="orderStatusFilter"><option value="">Semua status</option><option>Menunggu penjual</option><option>Diproses</option><option>Dalam pengiriman</option><option>Selesai</option><option>Ditolak toko</option><option>Dibatalkan</option></select></label><label><span>Produk</span><select id="orderProductFilter"><option value="">Semua produk</option>${[...new Set(orders.flatMap(order => order.items.map(item => item.name)))].map(name => `<option>${safe(name)}</option>`).join("")}</select></label></div><div class="buyer-order-list">${cards || `<div class="empty-state"><strong>Belum ada pesanan</strong>Pesanan yang kamu buat akan muncul di sini.</div>`}</div><div class="empty-state buyer-order-filter-empty" hidden>Tidak ada pesanan yang cocok dengan pencarian atau filter.</div></section>`;
    openDialog("Pesanan saya", content, "orders");
  }

  function showOrderDetail(order) {
    const lines = order.items;
    const sellers = [...new Set(lines.map(line => line.sellerId))];
    const total = lines.filter(activeLine).reduce((sum, line) => sum + line.price * line.quantity, 0);
    const shipment = order.shipping || {};
    const items = sellers.map(id => {
      const sellerLines = lines.filter(line => line.sellerId === id);
      const status = sellerStatus(order, id);
      const next = { "Menunggu penjual": "Menunggu keputusan toko", "Diteruskan ke gudang": "Gudang menyiapkan barang", "Disiapkan": "Gudang mengemas barang", "Dikemas": "Menunggu pengiriman", "Dikirim": "Dalam pengiriman", "Selesai": "Pesanan selesai", "Ditolak": "Toko menolak barang", "Dibatalkan": "Barang dibatalkan" }[status] || statusLabel(status);
      return `<section class="buyer-detail-seller"><h4>${safe(sellerName(id))}</h4><p>${safe(statusLabel(status))} · Berikutnya: ${safe(next)}</p>${sellerLines.map(line => `<article class="buyer-detail-product"><div class="buyer-order-thumb">${line.image ? `<img src="${safe(line.image)}" alt="" width="72" height="72">` : `<span aria-hidden="true">${safe(line.icon || "□")}</span>`}</div><div><strong>${safe(line.name)}</strong><span>${safe(statusLabel(line.status || status))}</span><span>${line.quantity} × ${money(line.price)}</span>${line.rejectionReason ? `<p class="buyer-rejection-reason">Alasan toko: ${safe(line.rejectionReason)}</p>` : ""}</div></article>`).join("")}</section>`;
    }).join("");
    openDialog("Detail pesanan", `<section class="buyer-detail-status"><strong>${safe(statusLabel(order.status))}</strong><span>Tanggal pembelian · ${new Date(order.createdAt).toLocaleString("id-ID")}</span><span>Nomor pesanan · ${safe(order.orderNumber)}</span></section><section class="buyer-detail-section"><h3>Detail produk</h3>${items}</section><section class="buyer-detail-section"><h3>Info pengiriman</h3><dl><dt>Penerima</dt><dd>${safe(shipment.name || "Belum diisi")}</dd><dt>Nomor telepon</dt><dd>${safe(shipment.phone || "Belum diisi")}</dd><dt>Alamat</dt><dd>${safe(shipment.address || "Belum diisi")}</dd></dl></section><section class="buyer-detail-section"><h3>Bantuan</h3>${sellers.map(id => `<button class="buyer-order-help" type="button" data-order-chat="${safe(id)}" data-order="${safe(order.id)}">Chat ${safe(sellerName(id))}</button>`).join("")}</section><section class="buyer-detail-section buyer-payment"><h3>Rincian pembayaran</h3><div><span>Metode pembayaran</span><strong>${safe(order.paymentMethod || "Belum diatur")}</strong></div><div><span>Subtotal produk</span><strong>${money(lines.filter(activeLine).reduce((sum, line) => sum + line.price * line.quantity, 0))}</strong></div><div class="buyer-payment-total"><span>Total belanja</span><strong>${money(total)}</strong></div></section>`, "order-detail");
  }

  const statusLabel = status => ({ "Diproses": "Menunggu penjual", "Menunggu penjual": "Menunggu penjual", "Diteruskan ke gudang": "Diproses", "Disiapkan": "Sedang disiapkan", "Dikemas": "Siap dikirim", "Dikirim": "Dalam pengiriman", "Selesai": "Selesai", "Ditolak": "Ditolak toko", "Dibatalkan": "Dibatalkan" }[status] || status);
  function showSalesOrders() {
    if (!requireRole("seller")) return;
    state.sellerTab = "orders";
    return showSellerProducts();
  }

  function showWarehouse() {
    const user = requireRole("gudang");
    if (!user) return;
    const sellerId = warehouseSellerId(user);
    const orders = Store.orders.filter(order => order.items.some(line => line.sellerId === sellerId && ["Diteruskan ke gudang", "Disiapkan", "Dikemas"].includes(line.status))).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const orderRows = orders.map(order => {
      const lines = order.items.filter(line => line.sellerId === sellerId && ["Diteruskan ke gudang", "Disiapkan", "Dikemas"].includes(line.status));
      const statuses = [...new Set(lines.map(line => line.status))];
      const actions = [...new Set(lines.map(line => line.status || sellerStatus(order, line.sellerId)))].map(status => ({ "Diteruskan ke gudang": ["pick", "Mulai siapkan"], "Disiapkan": ["pack", "Tandai dikemas"], "Dikemas": ["ship", "Tandai dikirim"] })[status]).filter(Boolean);
      return `<article class="list-row order-row"><div><strong>${safe(order.orderNumber)}</strong><div>${safe(order.shipping?.name || "—")} · ${lines.map(item => `${safe(item.name)} × ${item.quantity}`).join(", ")}</div><div>${safe(order.shipping?.address || "Alamat tidak tersedia")}</div><div>Status: ${statuses.map(statusLabel).map(safe).join(", ")}</div></div><div class="form-actions">${actions.map(([action, label]) => `<button class="${action === "ship" ? "primary" : "secondary"}-button" type="button" data-fulfill="${action}" data-order="${safe(order.id)}" data-seller="${safe(sellerId)}">${label}</button>`).join("")}</div></article>`;
    }).join("");
    const movements = Store.stockMovements || [];
    const movementRows = movements.slice(0, 12).map(movement => `<div class="list-row"><div><strong>${safe(movement.productName)}</strong><div>${safe(movement.type)} · ${safe(movement.reason)}</div></div><span>${movement.delta > 0 ? "+" : ""}${movement.delta} · ${new Date(movement.createdAt).toLocaleDateString("id-ID")}</span></div>`).join("");
    const warehouseRoot = $("warehouseContent");
    if (warehouseRoot) { warehouseRoot.innerHTML = `<h1 class="standalone-title">Pesanan ${safe(sellerName(sellerId))}</h1><p><a class="secondary-button" href="warehouse.html?view=stock">Stok ${safe(sellerName(sellerId))}</a></p>${orderRows || `<div class="empty-state"><strong>Antrean kosong</strong>Pesanan yang diteruskan toko akan muncul di sini.</div>`}`; return; }
    openDialog("Gudang", `<h3>Antrean pemenuhan</h3>${orderRows || `<div class="empty-state"><strong>Antrean kosong</strong>Pesanan yang diteruskan toko akan muncul di sini.</div>`}`, "warehouse");
  }

  function showStockManagement() {
    const user = requireRole("gudang"); if (!user) return;
    const products = Store.products.filter(product => warehouseOwnsProduct(user, product));
    const productIds = new Set(products.map(product => product.id));
    const low = products.filter(product => availableStock(product) <= (product.lowStockThreshold ?? 5));
    const movementRows = Store.stockMovements.filter(movement => productIds.has(movement.productId)).slice(0, 30).map(movement => `<div class="list-row"><div><strong>${safe(movement.productName)}</strong><div>${safe(movement.type)} · ${safe(movement.reason)}</div></div><span>${movement.delta > 0 ? "+" : ""}${movement.delta} · ${new Date(movement.createdAt).toLocaleDateString("id-ID")}</span></div>`).join("");
    const content = `<h1 class="standalone-title">Stok ${safe(sellerName(user.sellerId))}</h1><h2>Stok menipis</h2>${low.map(product => `<div class="list-row"><strong>${safe(product.name)}</strong><span>${availableStock(product)} unit</span></div>`).join("") || `<p class="muted-copy">Tidak ada stok menipis.</p>`}<h2 class="mt-4">Barang masuk, opname, atau retur</h2><form id="stockForm"><div class="field"><label for="stockProduct">Produk</label><select id="stockProduct" name="productId" required>${products.map(product => `<option value="${safe(product.id)}">${safe(product.name)} · stok ${product.stock}</option>`).join("")}</select></div><div class="field"><label for="stockType">Jenis pencatatan</label><select id="stockType" name="type"><option value="Barang masuk">Barang masuk</option><option value="Stok opname">Stok opname</option><option value="Barang rusak">Barang rusak</option><option value="Retur layak jual">Retur layak jual</option><option value="Retur rusak">Retur rusak</option></select></div><div class="field"><label id="stockDeltaLabel" for="stockDelta">Jumlah unit masuk</label><input id="stockDelta" name="delta" type="number" step="1" required><small id="stockDeltaHelp">Masukkan jumlah unit yang diterima.</small></div><div class="field"><label for="stockReason">Alasan / nomor retur</label><input id="stockReason" name="reason" required minlength="3" maxlength="120"></div><p id="stockError" class="form-error" role="alert"></p><button class="primary-button full-width" type="submit" ${products.length ? "" : "disabled"}>Simpan perubahan stok</button></form><h2 class="mt-4">Riwayat stok</h2>${movementRows || `<p class="muted-copy">Belum ada perubahan stok.</p>`}`;
    const root = $("warehouseContent"); if (root) root.innerHTML = content; else openDialog("Pengelolaan stok", content, "stock");
    updateStockDeltaField();
  }

  function updateStockDeltaField() {
    const type = $("stockType")?.value;
    const label = $("stockDeltaLabel");
    const help = $("stockDeltaHelp");
    if (!label || !help) return;
    const adjustments = {
      "Barang masuk": ["Jumlah unit masuk", "Masukkan jumlah unit yang diterima."],
      "Stok opname": ["Stok fisik hasil hitung", "Masukkan jumlah unit yang ada secara fisik. Selisih stok dihitung otomatis."],
      "Barang rusak": ["Jumlah unit rusak", "Stok akan dikurangi sebanyak jumlah ini."],
      "Retur layak jual": ["Jumlah unit retur layak jual", "Stok akan ditambah sebanyak jumlah ini."],
      "Retur rusak": ["Jumlah unit retur rusak", "Stok tidak berubah karena barang rusak tidak masuk stok jual."]
    };
    [label.textContent, help.textContent] = adjustments[type] || adjustments["Barang masuk"];
  }

  function showSalesTools() {
    if (!requireRole("seller")) return;
    state.sellerTab = "sales";
    return showSellerProducts();
  }

  function salesReport(sellerId) {
    const lines = Store.orders.flatMap(order => order.items.filter(item => item.sellerId === sellerId && ["Dikirim", "Selesai"].includes(item.status || order.status)).map(item => ({ ...item, createdAt: order.createdAt })));
    const units = lines.reduce((sum, line) => sum + line.quantity, 0);
    const revenue = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
    const awaiting = Store.orders.flatMap(order => order.items.filter(item => item.sellerId === sellerId && (item.status || order.status) === "Menunggu penjual")).length;
    const rejected = Store.orders.flatMap(order => order.items.filter(item => item.sellerId === sellerId && (item.status || order.status) === "Ditolak")).length;
    return `<div class="list-row"><span>Menunggu keputusan</span><strong>${awaiting}</strong></div><div class="list-row"><span>Ditolak</span><strong>${rejected}</strong></div><div class="list-row"><span>Unit terkirim</span><strong>${units}</strong></div><div class="list-row"><span>Nilai terkirim</span><strong>${money(revenue)}</strong></div>`;
  }

  function showChatList(sellerId) {
    const chats = Store.chats.filter(chat => chat.sellerId === sellerId);
    return `<div class="chat-list">${chats.map(chat => `<button class="chat-list-item" type="button" data-chat="${safe(chat.id)}"><span class="chat-avatar" aria-hidden="true">${safe(chat.buyerName.slice(0, 1).toUpperCase())}</span><span class="chat-list-copy"><strong>${safe(chat.buyerName)}</strong><span>${safe(chat.messages.at(-1)?.text || "Mulai percakapan")}</span></span>${chat.unread ? `<span class="chat-unread">Pesan baru</span>` : ""}</button>`).join("") || `<div class="empty-state"><strong>Belum ada pesan</strong>Percakapan dari pembeli akan tampil di sini.</div>`}</div>`;
  }

  function showBuyerChats() {
    const buyer = requireRole("buyer"); if (!buyer) return;
    const chats = Store.chats.filter(chat => chat.buyerId === buyer.id);
    openDialog("Pesan toko", `<div class="chat-list">${chats.map(chat => `<button class="chat-list-item" type="button" data-chat="${safe(chat.id)}"><span class="chat-avatar" aria-hidden="true">${safe(sellerName(chat.sellerId).slice(0, 1).toUpperCase())}</span><span class="chat-list-copy"><strong>${safe(sellerName(chat.sellerId))}</strong><span>${safe(chat.messages.at(-1)?.text || "Belum ada pesan")}</span></span></button>`).join("") || `<div class="empty-state"><strong>Belum ada percakapan</strong>Buka detail produk lalu pilih Tanya toko.</div>`}</div>`, "buyer-chats");
  }

  async function showChat(chatId) {
    const user = currentUser();
    if (Store.refreshChats) await Store.refreshChats().catch(() => {});
    const chat = Store.chats.find(item => item.id === chatId && (item.sellerId === user?.id || item.buyerId === user?.id));
    if (!chat) return toast("Percakapan tidak ditemukan.");
    if (user.role === "seller") chat.unread = false;
    const title = user.role === "seller" ? chat.buyerName : sellerName(chat.sellerId);
    const messages = chat.messages.map(message => `<article class="chat-bubble ${message.from === user.role ? "is-mine" : "is-theirs"}"><p>${safe(message.text)}</p><time datetime="${safe(message.createdAt)}">${new Date(message.createdAt).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</time></article>`).join("");
    openDialog(`Chat · ${title}`, `<section class="chat-panel" data-chat-id="${safe(chat.id)}" aria-label="Percakapan dengan ${safe(title)}"><div class="chat-thread" aria-live="polite" aria-relevant="additions text">${messages || `<p class="chat-empty">Mulai percakapan. Tanyakan tentang produk atau pesanan.</p>`}</div><form class="chat-compose" id="chatForm" data-chat-id="${safe(chat.id)}"><label class="sr-only" for="chatMessage">Tulis pesan</label><textarea id="chatMessage" name="message" rows="1" placeholder="Tulis pesan…" required maxlength="1000"></textarea><button class="primary-button" type="submit">Kirim</button></form></section>`, "chat");
    const thread = $("overlay").querySelector(".chat-thread");
    if (thread) thread.scrollTop = thread.scrollHeight;
    $("chatMessage")?.focus();
    clearInterval(state.chatTimer);
    state.chatTimer = setInterval(async () => {
      const panel = $("overlay").querySelector(".chat-panel");
      if (state.modal !== "chat" || panel?.dataset.chatId !== chat.id || !Store.refreshChats) return;
      const nearBottom = thread.scrollHeight - thread.scrollTop - thread.clientHeight < 48;
      await Store.refreshChats().catch(() => {});
      if (state.modal !== "chat" || $("overlay").querySelector(".chat-panel")?.dataset.chatId !== chat.id) return;
      const refreshed = Store.chats.find(item => item.id === chat.id);
      if (!refreshed || refreshed.messages.length === chat.messages.length) return;
      chat.messages = refreshed.messages;
      thread.innerHTML = chat.messages.map(message => `<article class="chat-bubble ${message.from === user.role ? "is-mine" : "is-theirs"}"><p>${safe(message.text)}</p><time datetime="${safe(message.createdAt)}">${new Date(message.createdAt).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</time></article>`).join("");
      if (nearBottom) thread.scrollTop = thread.scrollHeight;
    }, 4000);
  }

  function showAccount() {
    const user = currentUser();
    const roleName = { seller: "Penjual", buyer: "Pembeli", gudang: "Gudang" };
    if (user?.role === "seller") {
      const products = Store.products.filter(product => product.sellerId === user.id);
      const orders = Store.orders.filter(order => order.items.some(item => item.sellerId === user.id));
      const waiting = orders.flatMap(order => order.items.filter(item => item.sellerId === user.id && !["Ditolak", "Dibatalkan", "Dikirim", "Selesai"].includes(item.status || order.status))).length;
      const lines = orders.flatMap(order => order.items.filter(item => item.sellerId === user.id && ["Dikirim", "Selesai"].includes(item.status || order.status)));
      const revenue = lines.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const unread = Store.chats.filter(chat => chat.sellerId === user.id && chat.unread).length;
      const lowStock = products.filter(product => availableStock(product) <= (product.lowStockThreshold ?? 5)).length;
      const content = `<section class="seller-account-profile"><div class="seller-avatar" aria-hidden="true">${safe(user.name.trim().slice(0, 1).toUpperCase())}</div><div><h2>${safe(user.name)}</h2><p>${safe(user.email)}</p><p>${safe(user.city || "Lokasi toko belum diatur")}</p></div><button class="secondary-button" type="button" data-action="edit-store-profile">Edit profil</button></section><section class="seller-account-metrics" aria-label="Ringkasan toko"><div><strong>${products.length}</strong><span>Produk</span></div><div><strong>${waiting}</strong><span>Perlu diproses</span></div><div><strong>${money(revenue)}</strong><span>Nilai pesanan tersimpan</span></div></section><section class="seller-account-section"><h3>Perlu perhatian</h3><button class="seller-account-link" type="button" data-account-destination="orders"><span>Pesanan aktif</span><strong>${waiting}</strong></button><button class="seller-account-link" type="button" data-account-destination="sales"><span>Pesan belum dibaca</span><strong>${unread}</strong></button><button class="seller-account-link" type="button" data-account-destination="products"><span>Produk stok menipis</span><strong>${lowStock}</strong></button></section><section class="seller-account-section"><h3>Kelola toko</h3><a class="seller-account-link" href="seller.html"><span>Produk saya</span><span>Kelola toko</span></a><button class="seller-account-link" type="button" data-account-destination="orders"><span>Pesanan</span><span>Lihat antrean toko</span></button><button class="seller-account-link" type="button" data-account-destination="sales"><span>Penjualan</span><span>Laporan & pesan</span></button></section><section class="seller-account-section"><h3>Akun & keamanan</h3><div class="list-row"><span>Email akun</span><strong>${safe(user.email)}</strong></div><button class="secondary-button full-width mt-2" type="button" data-action="change-password">Ubah kata sandi</button><button class="danger-button full-width mt-4" type="button" data-action="logout">Keluar</button></section>`;
      if (document.body.dataset.page === "account") { $("accountContent").innerHTML = `<h1 class="standalone-title">Akun toko</h1>${content}`; return; }
      openDialog("Akun toko", content, "account");
      return;
    }
    const content = user ? `<div class="list-row"><span>Nama</span><strong>${safe(user.name)}</strong></div><div class="list-row"><span>Email</span><span>${safe(user.email)}</span></div><div class="list-row"><span>Peran</span><span>${roleName[user.role] || "—"}</span></div><button class="secondary-button full-width mt-2" type="button" data-action="change-password">Ubah kata sandi</button><button class="danger-button full-width mt-4" type="button" data-action="logout">Keluar</button>` : `<div class="notice">Masuk untuk memakai keranjang atau mengelola produk.</div><button class="primary-button full-width" type="button" data-action="login">Masuk</button><button class="secondary-button full-width mt-2" type="button" data-auth-mode="register">Buat akun</button>`;
    if (document.body.dataset.page === "account") { $("accountContent").innerHTML = `<h1 class="standalone-title">Akun</h1>${content}`; return; }
    openDialog("Akun", content, "account");
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
    const tabs = `<nav class="seller-tabs" aria-label="Bagian penjual"><button type="button" class="${state.sellerTab === "products" ? "is-active" : ""}" data-seller-tab="products" aria-pressed="${state.sellerTab === "products"}">Produk</button><button type="button" class="${state.sellerTab === "orders" ? "is-active" : ""}" data-seller-tab="orders" aria-pressed="${state.sellerTab === "orders"}">Pesanan</button><button type="button" class="${state.sellerTab === "sales" ? "is-active" : ""}" data-seller-tab="sales" aria-pressed="${state.sellerTab === "sales"}">Penjualan</button></nav>`;
    if (state.sellerTab === "orders") {
      const orders = Store.orders.filter(order => order.items.some(item => item.sellerId === seller.id)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const rows = orders.map(order => {
        const items = order.items.filter(item => item.sellerId === seller.id);
      const total = items.filter(activeLine).reduce((sum, item) => sum + item.price * item.quantity, 0);
        const status = sellerStatus(order, seller.id);
        const actionable = items.some(line => (line.status || status) === "Menunggu penjual");
        return `<article class="list-row order-row"><div><strong>${safe(order.orderNumber)}</strong><div>${new Date(order.createdAt).toLocaleDateString("id-ID")} · ${safe(statusLabel(status))}</div><div>${items.map(item => `${safe(item.name)} × ${item.quantity}${item.rejectionReason ? ` · Ditolak: ${safe(item.rejectionReason)}` : ""}`).join(", ")}</div><div>Pembeli: ${safe(order.shipping?.name || "—")} · ${money(total)}</div></div><div class="form-actions"><button class="secondary-button" type="button" data-seller-order-detail="${safe(order.id)}">Detail pesanan</button>${actionable ? `<button class="primary-button" type="button" data-seller-order-detail="${safe(order.id)}">Tinjau barang</button>` : ""}</div></article>`;
      }).join("");
      const content = `${tabs}<h1 class="standalone-title">Pesanan toko</h1>${rows || `<div class="empty-state"><strong>Belum ada pesanan</strong>Pesanan produk tokomu akan muncul di sini.</div>`}`;
      if (document.body.dataset.page === "seller") { $("sellerContent").innerHTML = content; return; }
      openDialog("Produk saya", content, "seller-products");
      return;
    }
    if (state.sellerTab === "sales") {
      const sections = `<nav class="seller-subtabs" aria-label="Bagian penjualan"><button type="button" data-seller-sales-view="report" aria-pressed="${state.sellerSalesView === "report"}">Laporan</button><button type="button" data-seller-sales-view="messages" aria-pressed="${state.sellerSalesView === "messages"}">Pesan</button></nav>`;
      const view = state.sellerSalesView === "report"
        ? `<h1 class="standalone-title">Laporan penjualan</h1>${salesReport(seller.id)}`
        : `<h1 class="standalone-title">Pesan pelanggan</h1>${showChatList(seller.id)}`;
      const content = `${tabs}${sections}${view}`;
      if (document.body.dataset.page === "seller") { $("sellerContent").innerHTML = content; return; }
      openDialog("Produk saya", content, "seller-products");
      return;
    }
    const products = Store.products.filter(product => product.sellerId === seller.id);
    const rows = products.map(product => `<article class="list-row seller-product-row"><div class="seller-product-copy"><strong>${safe(product.name)}</strong><div>${money(product.price)} · Stok ${product.stock}</div></div><div class="seller-product-actions"><button class="secondary-button icon-action" type="button" data-edit-product="${safe(product.id)}" aria-label="Edit ${safe(product.name)}"><svg aria-hidden="true" viewBox="0 0 512 512"><path d="M441 58.9 453.1 71c9.4 9.4 9.4 24.6 0 33.9L424 134.1 377.9 88 407 58.9c9.4-9.4 24.6-9.4 33.9 0zM209.8 256.2 344 121.9 390.1 168 255.8 302.2c-2.9 2.9-6.5 5-10.4 6.1l-58.5 16.7 16.7-58.5c1.1-3.9 3.2-7.5 6.1-10.4zM373.1 25 175.8 222.2c-8.7 8.7-15 19.4-18.3 31.1l-28.6 100c-2.4 8.4-.1 17.4 6.1 23.6s15.2 8.5 23.6 6.1l100-28.6c11.8-3.4 22.5-9.7 31.1-18.3L487 138.9c28.1-28.1 28.1-73.7 0-101.8L474.9 25c-28.1-28.1-73.7-28.1-101.8 0zM88 64C39.4 64 0 103.4 0 152v272c0 48.6 39.4 88 88 88h272c48.6 0 88-39.4 88-88V312c0-13.3-10.7-24-24-24s-24 10.7-24 24v112c0 22.1-17.9 40-40 40H88c-22.1 0-40-17.9-40-40V152c0-22.1 17.9-40 40-40h112c13.3 0 24-10.7 24-24s-10.7-24-24-24H88z"/></svg></button><button class="danger-button icon-action" type="button" data-delete-product="${safe(product.id)}" aria-label="Hapus ${safe(product.name)}"><svg aria-hidden="true" viewBox="0 0 448 512"><path d="M166.2-16c-13.3 0-25.3 8.3-30 20.8L120 48H24C10.7 48 0 58.7 0 72s10.7 24 24 24h400c13.3 0 24-10.7 24-24s-10.7-24-24-24h-96l-16.2-43.2C307.1-7.7 295.2-16 281.8-16H166.2zM32 144v304c0 35.3 28.7 64 64 64h256c35.3 0 64-28.7 64-64V144h-48v304c0 8.8-7.2 16-16 16H96c-8.8 0-16-7.2-16-16V144H32zm160 72c0-13.3-10.7-24-24-24s-24 10.7-24 24v176c0 13.3 10.7 24 24 24s24-10.7 24-24V216zm112 0c0-13.3-10.7-24-24-24s-24 10.7-24 24v176c0 13.3 10.7 24 24 24s24-10.7 24-24V216z"/></svg></button></div></article>`).join("");
    const content = `${tabs}<div class="seller-products-heading"><h1 class="standalone-title">Produk toko <span>(${products.length})</span></h1><button class="primary-button" type="button" data-action="new-product">Tambah produk</button></div>${rows || `<div class="empty-state"><strong>Belum ada produk</strong>Tambahkan produk pertama tokomu.</div>`}`;
    if (document.body.dataset.page === "seller") { $("sellerContent").innerHTML = content; return; }
    openDialog("Produk saya", content, "seller-products");
  }

  function showSellerOrderDetail(orderId) {
    const seller = requireRole("seller");
    const order = Store.orders.find(item => item.id === orderId && item.items.some(line => line.sellerId === seller?.id));
    if (!order) return toast("Pesanan toko tidak ditemukan.");
    const items = order.items.map((line, index) => ({ line, index })).filter(({ line }) => line.sellerId === seller.id);
    openDialog(`Pesanan ${order.orderNumber}`, `<div class="seller-order-detail"><p>Pembeli: ${safe(order.shipping?.name || "—")} · ${safe(new Date(order.createdAt).toLocaleString("id-ID"))}</p>${items.map(({ line, index }) => {
      const status = line.status || sellerStatus(order, seller.id);
      const pending = status === "Menunggu penjual";
      return `<article class="seller-order-line"><div><strong>${safe(line.name)} × ${line.quantity}</strong><span>${money(line.price * line.quantity)}</span><span>Status: ${safe(statusLabel(status))}</span>${line.rejectionReason ? `<p class="seller-rejection-reason">Alasan ditolak: ${safe(line.rejectionReason)}</p>` : ""}</div>${pending ? `<div class="form-actions"><button class="danger-button" type="button" data-seller-line-decision="reject" data-line-index="${index}" data-order="${safe(order.id)}">Tolak barang</button><button class="primary-button" type="button" data-seller-line-decision="process" data-line-index="${index}" data-order="${safe(order.id)}">Proses</button></div>` : ""}</article>`;
    }).join("")}<strong>Total barang toko: ${money(items.reduce((sum, { line }) => sum + (activeLine(line) ? line.price * line.quantity : 0), 0))}</strong></div>`, "seller-order-detail");
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
    const snapshot = fresh.map(({ item, product }) => ({ productId: product.id, sellerId: product.sellerId, name: product.name, price: product.price, quantity: item.quantity, status: "Menunggu penjual" }));
    const sellerStatuses = Object.fromEntries([...new Set(snapshot.map(item => item.sellerId))].map(id => [id, "Menunggu penjual"]));
    const order = { id: crypto.randomUUID(), orderNumber: `TK-${Date.now().toString(36).toUpperCase()}`, buyerId: user.id, items: snapshot, sellerStatuses, shipping: { name: String(data.get("name")).trim(), phone: String(data.get("phone")).trim(), address: String(data.get("address")).trim() }, paymentMethod: data.get("payment"), subtotal: cartTotal(items), shippingCost: 0, total: cartTotal(items), status: "Menunggu penjual", createdAt: new Date().toISOString(), history: [{ status: "Menunggu penjual", at: new Date().toISOString() }] };
    Store.orders = [order, ...Store.orders];
    Store.carts = Store.carts.filter(item => item.userId !== user.id);
    try { await Store.save(); }
    catch { Store.orders = Store.orders.filter(item => item.id !== order.id); Store.carts = [...Store.carts, ...items]; $("checkoutError").textContent = "Pesanan gagal disimpan. Keranjang dipulihkan; coba lagi."; return; }
    closeDialog();
    openDialog("Pesanan dibuat", `<div class="notice">Pesanan demo berhasil dibuat. Tidak ada pembayaran atau pengiriman sungguhan.</div><div class="list-row"><span>Nomor pesanan</span><strong>${safe(order.orderNumber)}</strong></div><div class="list-row"><span>Total</span><strong>${money(order.total)}</strong></div><button class="primary-button full-width mt-4" type="button" data-action="orders">Lihat pesanan</button>`, "confirmation");
    render();
  }

  function validate(form) { return form.reportValidity(); }

  async function handleSubmit(event) {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    if (form.id === "searchForm") {
      event.preventDefault(); state.query = $("searchInput").value.trim().toLocaleLowerCase("id"); render(); $("products").scrollIntoView({ behavior: "smooth", block: "start" }); return;
    }
    if (form.id === "orderSearchForm") { event.preventDefault(); filterBuyerOrders(); return; }
    event.preventDefault();
    if (!validate(form)) return;
    const data = new FormData(form);
    if (form.id === "sellerRejectForm") {
      const seller = currentUser();
      const order = Store.orders.find(item => item.id === form.dataset.order && item.items.some(line => line.sellerId === seller?.id));
      const index = Number(form.dataset.lineIndex);
      const line = order?.items[index];
      const reason = String(data.get("reason") || "").trim();
      const error = $("rejectionError");
      if (seller?.role !== "seller" || !line || line.sellerId !== seller.id || (line.status || sellerStatus(order, seller.id)) !== "Menunggu penjual") { error.textContent = "Status barang sudah berubah."; return; }
      if (reason.length < 5 || reason.length > 500) { error.textContent = "Alasan harus berisi 5 sampai 500 karakter."; return; }
      const before = Store.orders;
      Store.orders = Store.orders.map(item => {
        if (item.id !== order.id) return item;
        const updatedLines = item.items.map((entry, i) => i === index ? { ...entry, status: "Ditolak", rejectionReason: reason } : entry);
        const sellerLines = updatedLines.filter(entry => entry.sellerId === seller.id);
        const sellerStatuses = { ...(item.sellerStatuses || {}), [seller.id]: sellerLines.every(entry => ["Ditolak", "Dibatalkan"].includes(entry.status)) ? "Ditolak" : sellerLines.every(entry => entry.status !== "Menunggu penjual") ? "Diteruskan ke gudang" : "Menunggu penjual" };
        const total = updatedLines.filter(activeLine).reduce((sum, entry) => sum + entry.price * entry.quantity, 0);
        return { ...item, items: updatedLines, sellerStatuses, total, history: [...(item.history || []), { status: "Ditolak", reason, at: new Date().toISOString(), userId: seller.id, productId: line.productId }] };
      });
      try { await Store.save(); } catch (cause) { Store.orders = before; error.textContent = `Penolakan gagal disimpan: ${cause.message}`; return; }
      showSellerOrderDetail(order.id); toast("Barang ditolak. Reservasi stok dilepas."); return;
    }
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
      closeDialog(); if (!document.body.dataset.page) render(); toast("Berhasil masuk.");
      if (currentUser()?.role === "seller" && document.body.dataset.page !== "seller") { location.href = "seller.html"; return; }
      if (document.body.dataset.page === "account") showAccount();
      else if (document.body.dataset.page === "seller") showSellerProducts();
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
      closeDialog(); if (!document.body.dataset.page) render(); if (document.body.dataset.page === "account") showAccount(); else if (document.body.dataset.page === "seller") showSellerProducts(); toast("Profil toko diperbarui.");
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
      closeDialog(); if (document.body.dataset.page === "account") showAccount(); toast("Kata sandi berhasil diubah.");
      return;
    }
    if (form.id === "checkoutForm") { await saveOrder(form); return; }
    if (form.id === "stockForm") {
      const warehouse = currentUser();
      const product = Store.products.find(item => item.id === data.get("productId") && warehouseOwnsProduct(warehouse, item));
      const amount = Number(data.get("delta")); const reason = String(data.get("reason")).trim(); const type = String(data.get("type"));
      const delta = type === "Stok opname" ? amount - (product?.stock || 0) : type === "Barang rusak" ? -amount : type === "Retur rusak" ? 0 : amount;
      if (!product || !Number.isSafeInteger(amount) || amount < (type === "Stok opname" ? 0 : 1) || !Number.isSafeInteger(delta) || (!delta && type !== "Retur rusak" && type !== "Stok opname") || product.stock + delta < reservedStock(product.id) || reason.length < 3) { $("stockError").textContent = "Jumlah atau alasan tidak valid. Stok tidak boleh di bawah jumlah pesanan aktif."; return; }
      const previousProducts = Store.products; const previousMovements = Store.stockMovements;
      Store.products = Store.products.map(item => item.id === product.id ? { ...item, stock: item.stock + delta } : item);
      Store.stockMovements = [{ id: crypto.randomUUID(), productId: product.id, productName: product.name, type, delta, reason, userId: currentUser().id, createdAt: new Date().toISOString() }, ...Store.stockMovements];
      try { await Store.save(); } catch (error) { Store.products = previousProducts; Store.stockMovements = previousMovements; $("stockError").textContent = error.message; return; }
      showStockManagement(); toast("Stok dan riwayat diperbarui."); return;
    }
    if (form.id === "chatForm" || form.id === "buyerChatForm") {
      const user = currentUser();
      const message = String(data.get("message") || "").trim();
      const validChat = Store.chats.find(item => item.id === form.dataset.chatId && (item.sellerId === user?.id || item.buyerId === user?.id));
      if (!user || !validChat || !message) return;
      const priorUnread = validChat.unread;
      validChat.messages.push({ from: user.role, text: message, createdAt: new Date().toISOString() }); validChat.unread = user.role === "buyer";
      try { await Store.save(); } catch (error) { validChat.messages.pop(); validChat.unread = priorUnread; toast(error.message); return; }
      showChat(validChat.id); $("chatMessage")?.focus(); return;
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
      closeDialog(); if (!document.body.dataset.page) render(); showSellerProducts(); toast(current ? "Produk diperbarui." : "Produk ditambahkan.");
    }
  }

  function filterBuyerOrders() {
    const query = $("orderSearch")?.value.trim().toLocaleLowerCase("id") || "";
    const status = $("orderStatusFilter")?.value || "";
    const product = $("orderProductFilter")?.value || "";
    document.querySelectorAll("[data-order-card]").forEach(card => {
      card.hidden = !(card.dataset.search.includes(query) && (!status || card.dataset.statuses.split("|").some(value => statusLabel(value) === status || value === status)) && (!product || card.dataset.products.split("|").includes(product)));
    });
    const empty = document.querySelector(".buyer-order-filter-empty");
    if (empty) empty.hidden = [...document.querySelectorAll("[data-order-card]")].some(card => !card.hidden);
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
    if (!existing && items.length >= 5) return toast("Maksimal 5 produk berbeda per pesanan.");
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
  document.addEventListener("keydown", event => {
    if (event.target.id === "chatMessage" && event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!event.isComposing && event.keyCode !== 229) event.target.form.requestSubmit();
    }
  });
  document.addEventListener("change", event => {
    if (event.target.id === "sortSelect" && !document.body.dataset.page) { state.sort = event.target.value; renderProducts(); }
    if (event.target.id === "stockType") updateStockDeltaField();
    if (["orderStatusFilter", "orderProductFilter"].includes(event.target.id)) filterBuyerOrders();
  });
  window.addEventListener("hashchange", updateNav);
  document.addEventListener("click", async event => {
    const target = event.target.closest("[data-store], [data-seller-tab], [data-seller-sales-view], [data-account-destination], [data-detail-back], [data-detail-search], [data-detail-share], [data-detail-cart], [data-order-chat], [data-order-detail], [data-seller-order-detail], [data-seller-line-decision], [data-add], [data-detail], [data-buy], [data-follow], [data-action], [data-auth-mode], [data-quantity], [data-cancel-order], [data-buyer-cancel-line], [data-seller-decision], [data-edit-product], [data-delete-product], [data-handoff], [data-fulfill], [data-order], [data-chat], [data-start-chat]");
    if (!target) return;
    if (target.hasAttribute("data-detail-back")) { closeDialog(); return; }
    if (target.hasAttribute("data-detail-search")) { closeDialog(); $("searchInput")?.focus(); return; }
    if (target.hasAttribute("data-detail-share")) {
      const url = new URL(`index.html#product-${encodeURIComponent(state.detailProductId || "")}`, location.href).href;
      try { if (navigator.share) await navigator.share({ title: $("modalTitle").textContent, url }); else { await navigator.clipboard.writeText(url); toast("Tautan produk disalin."); } }
      catch (error) { if (error.name !== "AbortError") toast("Tautan produk gagal dibagikan."); }
      return;
    }
    if (target.hasAttribute("data-detail-cart")) { showCart(); return; }
    if (target.hasAttribute("data-order-chat")) {
      const order = Store.orders.find(item => item.id === target.dataset.order && item.buyerId === currentUser()?.id);
      const sellerId = target.dataset.orderChat;
      if (!order || !order.items.some(line => line.sellerId === sellerId)) return;
      const chat = Store.chats.find(item => item.buyerId === order.buyerId && item.sellerId === sellerId);
      if (chat) { showChat(chat.id); return; }
      const buyer = currentUser();
      const newChat = { id: crypto.randomUUID(), buyerId: buyer.id, buyerName: buyer.name, sellerId, productId: order.items.find(line => line.sellerId === sellerId)?.productId, messages: [], unread: false };
      Store.chats = [newChat, ...Store.chats];
      try { await Store.save(); } catch (error) { Store.chats = Store.chats.filter(item => item.id !== newChat.id); return toast(error.message); }
      showChat(newChat.id);
      return;
    }
    if (target.hasAttribute("data-order-detail")) {
      const buyer = currentUser();
      const order = Store.orders.find(item => item.id === target.dataset.orderDetail && item.buyerId === buyer?.id);
      if (order) showOrderDetail(order);
      return;
    }
    if (target.hasAttribute("data-seller-order-detail")) { showSellerOrderDetail(target.dataset.sellerOrderDetail); return; }
    if (target.dataset.sellerSalesView) { state.sellerSalesView = target.dataset.sellerSalesView; showSellerProducts(); return; }
    if (target.dataset.sellerTab) { state.sellerTab = target.dataset.sellerTab; history.replaceState(null, "", `seller.html?tab=${state.sellerTab}`); showSellerProducts(); return; }
    if (target.dataset.accountDestination) { location.href = `seller.html?tab=${encodeURIComponent(target.dataset.accountDestination)}`; return; }
    if (target.dataset.sellerDecision) {
      const seller = currentUser(); const order = Store.orders.find(item => item.id === target.dataset.order && item.items.some(line => line.sellerId === seller?.id));
      const status = order && sellerStatus(order, seller.id);
      if (seller?.role !== "seller" || !order || status !== "Menunggu penjual") return toast("Pesanan sudah berubah.");
      const action = target.dataset.sellerDecision;
      if (!confirm(action === "reject" ? "Tolak semua barang dari tokomu pada pesanan ini?" : "Teruskan barang tokomu ke gudang?")) return;
      const next = action === "reject" ? "Ditolak" : "Diteruskan ke gudang";
      const before = Store.orders;
      Store.orders = Store.orders.map(item => item.id !== order.id ? item : { ...item, items: item.items.map(line => line.sellerId === seller.id ? { ...line, status: next } : line), sellerStatuses: { ...(item.sellerStatuses || {}), [seller.id]: next }, status: "Dalam proses" });
      try { await Store.save(); } catch (error) { Store.orders = before; return toast(`Pesanan gagal disimpan: ${error.message}`); }
      showSellerProducts(); return;
    }
    if (target.dataset.sellerLineDecision) {
      const seller = currentUser();
      const order = Store.orders.find(item => item.id === target.dataset.order && item.items.some(line => line.sellerId === seller?.id));
      const index = Number(target.dataset.lineIndex);
      const line = order?.items[index];
      if (seller?.role !== "seller" || !line || line.sellerId !== seller.id || (line.status || sellerStatus(order, seller.id)) !== "Menunggu penjual") return toast("Status barang sudah berubah.");
      const rejected = target.dataset.sellerLineDecision === "reject";
      if (rejected) {
        openDialog(`Tolak ${line.name}`, `<form id="sellerRejectForm" data-order="${safe(order.id)}" data-line-index="${index}"><div class="field"><label for="rejectionReason">Alasan penolakan</label><textarea id="rejectionReason" name="reason" required minlength="5" maxlength="500" aria-describedby="rejectionError"></textarea><p id="rejectionError" class="form-error" role="alert"></p></div><div class="form-actions"><button class="danger-button" type="submit">Tolak barang</button><button class="secondary-button" type="button" data-action="close">Batal</button></div></form>`, "seller-reject");
        return;
      }
      const reason = "";
      const nextStatus = rejected ? "Ditolak" : "Diteruskan ke gudang";
      const before = Store.orders;
      Store.orders = Store.orders.map(item => {
        if (item.id !== order.id) return item;
        const updatedLines = item.items.map((entry, i) => i === index ? { ...entry, status: nextStatus, ...(rejected ? { rejectionReason: reason } : {}) } : entry);
        const sellerLines = updatedLines.filter(entry => entry.sellerId === seller.id);
        const sellerStatuses = { ...(item.sellerStatuses || {}), [seller.id]: sellerLines.every(entry => entry.status === "Ditolak" || entry.status === "Dibatalkan") ? "Ditolak" : sellerLines.every(entry => entry.status !== "Menunggu penjual") ? "Diteruskan ke gudang" : "Menunggu penjual" };
        const activeTotal = updatedLines.filter(activeLine).reduce((sum, entry) => sum + entry.price * entry.quantity, 0);
        return { ...item, items: updatedLines, sellerStatuses, total: activeTotal, status: "Dalam proses", history: [...(item.history || []), { status: nextStatus, reason, at: new Date().toISOString(), userId: seller.id, productId: line.productId }] };
      });
      try { await Store.save(); } catch (error) { Store.orders = before; return toast(`Keputusan gagal disimpan: ${error.message}`); }
      showSellerOrderDetail(order.id);
      toast(rejected ? "Barang ditolak. Reservasi stok dilepas." : "Barang diteruskan ke gudang.");
      return;
    }
    if (target.dataset.buyerCancelLine) {
      const buyer = currentUser(); const order = Store.orders.find(item => item.id === target.dataset.order && item.buyerId === buyer?.id);
      const sellerId = target.dataset.buyerCancelLine; const line = order?.items.find(item => item.sellerId === sellerId);
      if (!line || sellerStatus(order, line.sellerId) !== "Menunggu penjual" || !confirm(`Batalkan barang dari ${sellerName(line.sellerId)}?`)) return;
      const before = Store.orders;
      Store.orders = Store.orders.map(item => item.id !== order.id ? item : { ...item, items: item.items.map(entry => entry.sellerId === line.sellerId ? { ...entry, status: "Dibatalkan" } : entry), total: item.total - order.items.filter(entry => entry.sellerId === line.sellerId).reduce((sum, entry) => sum + entry.price * entry.quantity, 0), sellerStatuses: { ...(item.sellerStatuses || {}), [line.sellerId]: "Dibatalkan" }, status: "Dalam proses" });
      try { await Store.save(); } catch (error) { Store.orders = before; return toast(`Pembatalan gagal disimpan: ${error.message}`); }
      showOrders(); return;
    }
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
       showChat(chat.id); return;
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
      const warehouse = currentUser(); const sellerId = warehouseSellerId(warehouse); const order = Store.orders.find(item => item.id === target.dataset.order); const next = { pick: ["Diteruskan ke gudang", "Disiapkan"], pack: ["Disiapkan", "Dikemas"], ship: ["Dikemas", "Dikirim"] }[target.dataset.fulfill];
    const lines = order?.items.filter(line => line.sellerId === sellerId && (line.status || (line.sellerId && order.sellerStatuses?.[line.sellerId]) || (order.status === "Diproses" ? "Menunggu penjual" : order.status)) === next?.[0]) || [];
      if (warehouse?.role !== "gudang" || target.dataset.seller !== sellerId || !order || !lines.length) return toast("Status pesanan atau akses gudang sudah berubah.");
      const previousProducts = Store.products; const previousMovements = Store.stockMovements; const before = Store.orders;
      if (target.dataset.fulfill === "ship") {
        const invalid = lines.find(line => !Store.products.some(product => product.id === line.productId && product.stock - line.quantity >= reservedStock(product.id) - line.quantity));
        if (invalid) return toast(`Stok ${invalid.name} tidak cukup untuk pengiriman.`);
        Store.products = Store.products.map(product => { const quantity = lines.filter(item => item.productId === product.id).reduce((sum, line) => sum + line.quantity, 0); return quantity ? { ...product, stock: product.stock - quantity, sold: (product.sold || 0) + quantity } : product; });
        Store.stockMovements = [...lines.map(line => ({ id: crypto.randomUUID(), productId: line.productId, productName: line.name, type: "Keluar untuk pesanan", delta: -line.quantity, reason: order.orderNumber, userId: warehouse.id, createdAt: new Date().toISOString() })), ...Store.stockMovements];
      }
      const updatedLines = order.items.map(line => lines.includes(line) ? { ...line, status: next[1] } : line);
      const statuses = updatedLines.filter(activeLine).map(line => line.status);
      const orderStatus = statuses.length && statuses.every(status => status === "Dikirim" || status === "Selesai") ? "Selesai" : "Dalam proses";
      Store.orders = Store.orders.map(item => item.id !== order.id ? item : { ...item, items: updatedLines, sellerStatuses: Object.fromEntries([...new Set(updatedLines.map(line => line.sellerId))].map(id => [id, updatedLines.find(line => line.sellerId === id)?.status])), status: orderStatus, history: [...(item.history || []), { status: next[1], at: new Date().toISOString(), userId: warehouse.id }] });
      try { await Store.save(); } catch (error) { Store.products = previousProducts; Store.stockMovements = previousMovements; Store.orders = before; return toast(`Pembaruan gagal disimpan: ${error.message}`); }
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
      const user = currentUser(); const order = Store.orders.find(item => item.id === target.dataset.cancelOrder && item.buyerId === user.id && item.items.some(line => sellerStatus(item, line.sellerId) === "Menunggu penjual"));
      if (!order || !confirm("Batalkan pesanan ini? Stok produk akan dikembalikan.")) return;
      const rejectedLines = order.items.filter(line => sellerStatus(order, line.sellerId) === "Menunggu penjual");
      if (rejectedLines.length !== order.items.filter(activeLine).length) return toast("Batalkan barang toko satu per satu lewat halaman pesanan.");
      Store.orders = Store.orders.map(item => item.id === order.id ? { ...item, items: item.items.map(line => rejectedLines.includes(line) ? { ...line, status: "Dibatalkan" } : line), status: "Dalam proses" } : item);
      try { await Store.save(); }
      catch { return toast("Pesanan gagal diperbarui di data.json."); }
      showOrders(); render(); return;
    }
    if (target.dataset.action === "warehouse-account") { showAccount(); return; }
    if (target.dataset.editProduct) { showProductForm(target.dataset.editProduct); return; }
    if (target.dataset.deleteProduct) {
      const seller = currentUser(); const product = Store.products.find(item => item.id === target.dataset.deleteProduct && item.sellerId === seller?.id);
      if (!product || !confirm(`Hapus produk “${product.name}”?`)) return;
      const index = Store.products.findIndex(item => item.id === product.id);
      Store.products = Store.products.filter(item => item.id !== product.id);
      try { await Store.save(); }
      catch { return toast("Produk gagal dihapus dari data.json."); }
      state.pendingProductRestore = { product, index };
      showSellerProducts(); toast(`${product.name} dihapus.`, { name: "undo-product-delete", label: "Urungkan" }); return;
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
      case "warehouse": showWarehouse(); break;
      case "account": location.href = "account.html"; break;
      case "edit-store-profile": showStoreProfile(); break;
      case "change-password": showPasswordForm(); break;
      case "new-product": showProductForm(); break;
      case "undo-product-delete": {
        const pending = state.pendingProductRestore;
        if (!pending || Store.products.some(item => item.id === pending.product.id)) return;
        const products = [...Store.products];
        products.splice(Math.max(0, Math.min(pending.index, products.length)), 0, pending.product);
        Store.products = products;
        try { await Store.save(); }
        catch { Store.products = Store.products.filter(item => item.id !== pending.product.id); return toast("Produk gagal dipulihkan ke data.json."); }
        state.pendingProductRestore = null;
        showSellerProducts();
        $("toast").classList.remove("is-visible", "has-action");
        toast(`${pending.product.name} dipulihkan.`);
        break;
      }
      case "logout": Store.session = null; closeDialog(); if (document.body.dataset.page) location.href = "index.html"; else render(); toast("Kamu sudah keluar."); break;
      case "seller-products": location.href = "seller.html"; break;
      case "login": showAuth(); break;
    }
  });
  $("overlay").addEventListener("click", event => { if (event.target === $("overlay")) closeDialog(); });
  const sheet = $("overlay").querySelector(".dialog");
  let sheetDragY = null, sheetStartHeight = 0, sheetStartScroll = 0, sheetPointer = null;
  sheet.addEventListener("touchstart", event => {
    if (state.modal !== "detail" || !matchMedia("(max-width: 839px)").matches) return;
    sheetDragY = event.touches[0].clientY;
    sheetStartHeight = sheet.getBoundingClientRect().height;
    sheetStartScroll = sheet.scrollTop;
  }, { passive: true });
  sheet.addEventListener("touchmove", event => {
    if (state.modal !== "detail" || sheetDragY == null) return;
    const delta = sheetDragY - event.touches[0].clientY;
    const atFull = sheetStartHeight >= innerHeight - 1;
    if (atFull && (delta > 0 || sheetStartScroll > 0)) return;
    if (delta <= 0 && sheetStartScroll > 0) return;
    event.preventDefault();
    const height = delta > 0
      ? Math.min(innerHeight, sheetStartHeight + delta)
      : Math.max(innerHeight * 0.45, sheetStartHeight + delta);
    sheet.style.setProperty("--sheet-height", `${height}px`);
    sheet.classList.toggle("is-expanded", height >= innerHeight - 1);
    sheet.scrollTop = 0;
  }, { passive: false });
  sheet.addEventListener("touchend", () => { sheetDragY = null; }, { passive: true });
  sheet.addEventListener("pointerdown", event => {
    if (state.modal !== "detail" || event.pointerType === "touch" || !matchMedia("(max-width: 839px)").matches || event.button > 0 || !event.target.closest(".detail-toolbar")) return;
    sheetDragY = event.clientY;
    sheetStartHeight = sheet.getBoundingClientRect().height;
    sheetStartScroll = sheet.scrollTop;
    sheetPointer = event.pointerId;
    sheet.setPointerCapture(event.pointerId);
  });
  sheet.addEventListener("pointermove", event => {
    if (state.modal !== "detail" || sheetDragY == null || event.pointerId !== sheetPointer) return;
    const delta = sheetDragY - event.clientY;
    let height, scroll;
    if (delta >= 0) {
      height = Math.min(innerHeight, sheetStartHeight + delta);
      scroll = sheetStartScroll + Math.max(0, sheetStartHeight + delta - innerHeight);
    } else {
      const downward = -delta;
      const scrollBack = Math.min(sheetStartScroll, downward);
      scroll = sheetStartScroll - scrollBack;
      height = Math.max(innerHeight * 0.45, sheetStartHeight - Math.max(0, downward - scrollBack));
    }
    sheet.style.setProperty("--sheet-height", `${height}px`);
    sheet.classList.toggle("is-expanded", height >= innerHeight - 1);
    sheet.scrollTop = scroll;
  });
  const endSheetDrag = event => {
    if (event.pointerId !== sheetPointer) return;
    sheetDragY = sheetPointer = null;
  };
  sheet.addEventListener("pointerup", endSheetDrag);
  sheet.addEventListener("pointercancel", endSheetDrag);
  sheet.addEventListener("wheel", event => {
    if (state.modal !== "detail" || !matchMedia("(max-width: 839px)").matches) return;
    const height = sheet.getBoundingClientRect().height;
    const maxHeight = innerHeight;
    if (event.deltaY > 0 && height < maxHeight) {
      event.preventDefault();
      const nextHeight = Math.min(maxHeight, height + event.deltaY);
      sheet.style.setProperty("--sheet-height", `${nextHeight}px`);
      sheet.classList.toggle("is-expanded", nextHeight >= maxHeight - 1);
      sheet.scrollTop = 0;
    } else if (event.deltaY < 0 && sheet.scrollTop <= 0 && height > innerHeight * 0.45) {
      event.preventDefault();
      const nextHeight = Math.max(innerHeight * 0.45, height + event.deltaY);
      sheet.style.setProperty("--sheet-height", `${nextHeight}px`);
      sheet.classList.toggle("is-expanded", nextHeight >= maxHeight - 1);
    }
  }, { passive: false });
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
    const page = document.body.dataset.page;
    if (!page) $("products").innerHTML = `<p class="loading-state" role="status">Memuat produk...</p>`;
    setNav();
    try {
      await Store.init();
      setNav();
      if (page === "account" && currentUser()?.role === "gudang") { location.replace("warehouse.html"); return; }
      if (page === "account") showAccount();
      else if (page === "warehouse") {
        if (currentUser()?.role !== "gudang") { location.replace("index.html"); return; }
        if (new URLSearchParams(location.search).get("view") === "stock") showStockManagement(); else showWarehouse();
      }
      else if (page === "seller") {
        const tab = new URLSearchParams(location.search).get("tab");
        if (["products", "orders", "sales"].includes(tab)) state.sellerTab = tab;
        showSellerProducts();
      } else { render(); updateNav(); if (location.hash.startsWith("#product-")) showDetail(decodeURIComponent(location.hash.slice(9))); }
    }
    catch (error) {
      const content = $("products") || $("accountContent") || $("sellerContent");
      content.innerHTML = `<div class="empty-state"><strong>Data belum tersedia</strong>${safe(error.message)}<p><button class="secondary-button" type="button" data-action="retry">Coba lagi</button></p></div>`;
    }
  }
  document.addEventListener("click", event => { if (event.target.closest('[data-action="retry"]')) start(); });
  start();
})();
