(() => {
  const keys = {
    users: "tokoko-users",
    products: "tokoko-products",
    categories: "tokoko-categories",
    carts: "tokoko-carts",
    orders: "tokoko-orders",
    session: "tokoko-session"
  };
  const read = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  };
  const categoryMap = { "Sembako": "Makanan & minuman", "Obat & P3K": "Kesehatan & kecantikan", "Pakaian": "Fashion", "Rumah Tangga": "Rumah tangga" };
  function migrateCategories() {
    const categories = read(keys.categories, []);
    const nextCategories = ["Semua", "Elektronik & aksesori", "Fashion", "Rumah tangga", "Makanan & minuman", "Kesehatan & kecantikan", "Ibu & bayi", "Olahraga & hobi", "Otomotif", "Buku & alat tulis", "Komputer & aksesori", "Handphone & aksesori"];
    if (JSON.stringify(categories) !== JSON.stringify(nextCategories)) write(keys.categories, nextCategories);
    const products = read(keys.products, []);
    const migrated = products.map(product => ({ ...product, category: categoryMap[product.category] || product.category, image: product.image || `src/images/${product.id}.jpg` }));
    if (JSON.stringify(products) !== JSON.stringify(migrated)) write(keys.products, migrated);
  }
  const write = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch { throw new Error("Penyimpanan browser penuh atau tidak tersedia. Kosongkan ruang, lalu muat ulang aplikasi."); }
  };
  async function init() {
    if (localStorage.getItem(keys.users) && localStorage.getItem(keys.products)) {
      migrateCategories();
      if (localStorage.getItem("tokoko-seed-version") !== "3") {
        try {
          const response = await fetch("data.json");
          if (response.ok) {
            const seed = await response.json();
            const demoIds = new Set(["beras-premium", "minyak-goreng", "telur-ayam", "mi-instan", "paket-p3k", "vitamin-c", "kaos-katun", "deterjen-cair", "sabun-mandi", "alat-dapur", "smartphone-demo", "headphone-demo", "salad-demo", "skincare-demo", "laptop-demo", "buku-demo", "otomotif-demo", "sepatu-lari", "perlengkapan-bayi", "mouse-wireless"]);
            const custom = read(keys.products, []).filter(product => !demoIds.has(product.id));
            write(keys.products, [...seed.products, ...custom]);
            write(keys.categories, seed.categories);
            localStorage.setItem("tokoko-seed-version", "3");
          }
        } catch { /* Keep existing browser data when seed file is unavailable. */ }
      }
      return;
    }
    try {
      const response = await fetch("data.json");
      if (!response.ok) throw new Error("seed fetch failed");
      const seed = await response.json();
      Object.entries({ users: seed.users, products: seed.products, categories: seed.categories, carts: seed.carts, orders: seed.orders }).forEach(([name, value]) => {
        if (!localStorage.getItem(keys[name])) write(keys[name], value);
      });
      write("tokoko-seed-version", "3");
    } catch {
      throw new Error("Data awal gagal dimuat. Jalankan lewat Live Server atau pastikan data.json tersedia.");
    }
  }

  window.Store = {
    init,
    get users() { return read(keys.users, []); },
    set users(value) { write(keys.users, value); },
    get products() { return read(keys.products, []); },
    set products(value) { write(keys.products, value); },
    get categories() { return read(keys.categories, []); },
    get carts() { return read(keys.carts, []); },
    set carts(value) { write(keys.carts, value); },
    get orders() { return read(keys.orders, []); },
    set orders(value) { write(keys.orders, value); },
    get session() { return read(keys.session, null); },
    set session(value) { value ? write(keys.session, value) : localStorage.removeItem(keys.session); },
    reset() { Object.values(keys).forEach(key => localStorage.removeItem(key)); }
  };
})();
