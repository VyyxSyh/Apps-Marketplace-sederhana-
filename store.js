(() => {
  const keys = {
    users: "tokoko-users",
    products: "tokoko-products",
    categories: "tokoko-categories",
    carts: "tokoko-carts",
    orders: "tokoko-orders",
    session: "tokoko-session"
  };
  let apiAvailable = false;
  const read = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  };
  const flattenUsers = data => ["buyer", "seller", "gudang"].flatMap(role => Array.isArray(data[role]) ? data[role] : []);
  const groupUsers = users => Object.fromEntries(["buyer", "seller", "gudang"].map(role => [role, users.filter(user => user.role === role)]));
  const categoryMap = {
    "Sembako": "Makanan & Minuman",
    "Obat & P3K": "Kesehatan",
    "Pakaian": "Fashion Pria",
    "Rumah tangga": "Rumah Tangga",
    "Makanan & minuman": "Makanan & Minuman",
    "Kesehatan & kecantikan": "Kecantikan",
    "Olahraga & hobi": "Olahraga",
    "Buku & alat tulis": "Buku & Alat Tulis",
    "Komputer & aksesori": "Komputer & Laptop",
    "Handphone & aksesori": "Handphone & Tablet",
    "Elektronik & aksesori": "Elektronik",
    "Fashion": "Fashion Pria",
    "Ibu & bayi": "Ibu & Bayi"
  };
  function migrateCategories() {
    const categories = read(keys.categories, []);
    const nextCategories = [
      "Semua",
      "Elektronik",
      "Handphone & Tablet",
      "Komputer & Laptop",
      "Fashion Pria",
      "Fashion Wanita",
      "Ibu & Bayi",
      "Kecantikan",
      "Kesehatan",
      "Makanan & Minuman",
      "Rumah Tangga",
      "Otomotif",
      "Olahraga",
      "Buku & Alat Tulis",
      "Hobi & Koleksi"
    ];
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
    try {
      const response = await fetch("/api/data");
      if (response.ok) {
        const data = await response.json();
        const usersResponse = await fetch("/api/users");
        if (!usersResponse.ok) throw new Error("Akun gagal dimuat.");
        const userData = await usersResponse.json();
        apiAvailable = true;
        write(keys.products, data.products);
        write(keys.categories, data.categories);
        const users = read(keys.users, []);
        const seededUsers = flattenUsers(userData);
        const demoIds = new Set(seededUsers.filter(user => user.demo).map(user => user.id));
        const localUsers = new Map(users.filter(user => !demoIds.has(user.id) && !user.demo).map(user => [user.id, user]));
        const mergedUsers = new Map(seededUsers.map(user => [user.id, user]));
        for (const user of localUsers.values()) if (![...mergedUsers.values()].some(seed => seed.id === user.id || seed.email.toLowerCase() === user.email.toLowerCase())) mergedUsers.set(user.id, user);
        write(keys.users, [...mergedUsers.values()]);
        const session = read(keys.session, null);
        if (session?.userId === "seller-demo") write(keys.session, { userId: "seller-agres", role: "seller" });
        return;
      }
    } catch { /* Use local seed data when not running through the Node server. */ }
    if (localStorage.getItem(keys.users) && localStorage.getItem(keys.products)) {
      migrateCategories();
      if (localStorage.getItem("tokoko-seed-version") !== "6") {
        try {
          const [response, usersResponse] = await Promise.all([fetch("data.json"), fetch("users.json")]);
          if (response.ok && usersResponse.ok) {
            const [seed, userSeed] = await Promise.all([response.json(), usersResponse.json()]);
            const demoIds = new Set(["beras-premium", "minyak-goreng", "telur-ayam", "mi-instan", "paket-p3k", "vitamin-c", "kaos-katun", "deterjen-cair", "sabun-mandi", "alat-dapur", "smartphone-demo", "samsung-galaxy-a16-5g", "xiaomi-redmi-note-14-5g", "oppo-a3x", "vivo-y28", "realme-c75", "headphone-demo", "salad-demo", "skincare-demo", "laptop-demo", "buku-demo", "otomotif-demo", "sepatu-lari", "perlengkapan-bayi", "mouse-wireless"]);
            const seededUsers = flattenUsers(userSeed);
            const demoSellerIds = new Set(["seller-demo", ...seededUsers.filter(user => user.role === "seller").map(user => user.id)]);
            const custom = read(keys.products, []).filter(product => !demoIds.has(product.id));
            write(keys.products, [...seed.products, ...custom]);
            write(keys.categories, seed.categories);
            const localUsers = new Map(read(keys.users, []).filter(user => !demoSellerIds.has(user.id) && !user.demo).map(user => [user.id, user]));
            const mergedUsers = new Map(seededUsers.map(user => [user.id, user]));
            for (const user of localUsers.values()) if (![...mergedUsers.values()].some(seedUser => seedUser.id === user.id || seedUser.email.toLowerCase() === user.email.toLowerCase())) mergedUsers.set(user.id, user);
            write(keys.users, [...mergedUsers.values()]);
            const session = read(keys.session, null);
            if (session?.userId === "seller-demo") write(keys.session, { userId: "seller-agres", role: "seller" });
            localStorage.setItem("tokoko-seed-version", "6");
          }
        } catch { /* Keep existing browser data when seed file is unavailable. */ }
      }
      return;
    }
    try {
      const [response, usersResponse] = await Promise.all([fetch("data.json"), fetch("users.json")]);
      if (!response.ok || !usersResponse.ok) throw new Error("seed fetch failed");
      const [seed, userSeed] = await Promise.all([response.json(), usersResponse.json()]);
      Object.entries({ users: flattenUsers(userSeed), products: seed.products, categories: seed.categories, carts: seed.carts, orders: seed.orders }).forEach(([name, value]) => {
        if (!localStorage.getItem(keys[name])) write(keys[name], value);
      });
      write("tokoko-seed-version", "6");
    } catch {
      throw new Error("Data awal gagal dimuat. Jalankan lewat Live Server atau pastikan data.json tersedia.");
    }
  }

  window.Store = {
    init,
    async save() {
      const data = { users: this.users, products: this.products, categories: this.categories, carts: this.carts, orders: this.orders };
      try {
        if (!apiAvailable) throw new Error("Static mode");
        const [usersResponse, dataResponse] = await Promise.all([
          fetch("/api/users", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(groupUsers(data.users)) }),
          fetch("/api/data", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ products: data.products, categories: data.categories, carts: data.carts, orders: data.orders })
          })
        ]);
        if (!usersResponse.ok || !dataResponse.ok) throw new Error("API penyimpanan tidak tersedia.");
      } catch {
        Object.entries(data).forEach(([name, value]) => write(keys[name], value));
      }
    },
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
