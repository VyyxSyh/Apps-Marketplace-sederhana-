(() => {
  const keys = {
    users: "tokoko-users",
    products: "tokoko-products",
    categories: "tokoko-categories",
    carts: "tokoko-carts",
    orders: "tokoko-orders",
    chats: "tokoko-chats",
    stockMovements: "tokoko-stock-movements",
    session: "tokoko-session"
  };
  let apiAvailable = false;
  let apiRevision = "";
  const read = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  };
  const flattenUsers = data => ["buyer", "seller", "gudang"].flatMap(role => Array.isArray(data[role]) ? data[role] : []);
  const groupUsers = users => Object.fromEntries(["buyer", "seller", "gudang"].map(role => [role, users.filter(user => user.role === role)]));
  const isDemoUser = user => user.demo || ["buyer-demo", "seller-agres", "seller-sentral", "seller-gamer", "seller-enter", "seller-kla"].includes(user.id);
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
  async function fetchSeedData() {
    const names = ["products", "categories", "carts", "orders", "chats", "stockMovements"];
    const files = await Promise.all(names.map(name => fetch(`data/${name}.json`)));
    if (!files.every(response => response.ok)) throw new Error("File data/*.json gagal dimuat.");
    return Object.fromEntries(await Promise.all(names.map(async (name, index) => [name, await files[index].json()])));
  }
  async function fetchSeedUsers() {
    const response = await fetch("/api/users");
    if (response.ok) return response.json();
    const fallback = await fetch("data/users.json");
    if (!fallback.ok) throw new Error("Data akun gagal dimuat.");
    return fallback.json();
  }
  async function init() {
    try {
      if (location.protocol !== "file:") {
      const response = await fetch("/api/data");
      if (response.ok) {
        let data = await response.json();
        apiRevision = data.revision || "";
        const usersResponse = await fetch("/api/users");
        if (!usersResponse.ok) throw new Error("Akun gagal dimuat.");
        const userData = await usersResponse.json();
        if (!Array.isArray(data.products)) {
          const seed = await fetchSeedData(data.categories);
          data = { ...seed, ...data, products: seed.products, categories: seed.categories };
        }
        if (!Array.isArray(data.categories)) throw new Error("Kategori gagal dimuat.");
        apiAvailable = true;
        userData.gudang = (userData.gudang || []).filter(user => user.sellerId);
        write(keys.products, data.products);
        write(keys.categories, data.categories);
        write(keys.orders, data.orders || []);
        write(keys.chats, data.chats || []);
        write(keys.stockMovements, data.stockMovements || []);
        const users = read(keys.users, []);
        const seededUsers = flattenUsers(userData);
        const demoIds = new Set(seededUsers.filter(isDemoUser).map(user => user.id));
        const localUsers = new Map(users.filter(user => !demoIds.has(user.id) && !user.demo).map(user => [user.id, user]));
        const mergedUsers = new Map(seededUsers.map(user => [user.id, user]));
        for (const user of localUsers.values()) if (![...mergedUsers.values()].some(seed => seed.id === user.id || seed.email.toLowerCase() === user.email.toLowerCase())) mergedUsers.set(user.id, user);
        write(keys.users, [...mergedUsers.values()]);
        const session = read(keys.session, null);
        if (session?.userId === "seller-demo") write(keys.session, { userId: "seller-agres", role: "seller" });
        return;
      }
      }
    } catch { /* Use local seed data when not running through the Node server. */ }
    if (localStorage.getItem(keys.users) && localStorage.getItem(keys.products)) {
      for (const [key, value] of [[keys.orders, []], [keys.chats, []], [keys.stockMovements, []]]) if (!localStorage.getItem(key)) write(key, value);
      migrateCategories();
      if (localStorage.getItem("tokoko-seed-version") !== "8") {
        try {
          const [seed, userSeed] = await Promise.all([fetchSeedData(), fetchSeedUsers()]);
          if (seed.products) {
            const demoIds = new Set(["beras-premium", "minyak-goreng", "telur-ayam", "mi-instan", "paket-p3k", "vitamin-c", "kaos-katun", "deterjen-cair", "sabun-mandi", "alat-dapur", "smartphone-demo", "samsung-galaxy-a16-5g", "xiaomi-redmi-note-14-5g", "oppo-a3x", "vivo-y28", "realme-c75", "headphone-demo", "salad-demo", "skincare-demo", "laptop-demo", "buku-demo", "otomotif-demo", "sepatu-lari", "perlengkapan-bayi", "mouse-wireless"]);
            const seededUsers = flattenUsers(userSeed);
            const demoSellerIds = new Set(["seller-demo", ...seededUsers.filter(isDemoUser).map(user => user.id)]);
            const custom = read(keys.products, []).filter(product => !demoIds.has(product.id));
            write(keys.products, [...seed.products, ...custom]);
            write(keys.categories, seed.categories);
            const localUsers = new Map(read(keys.users, []).filter(user => !demoSellerIds.has(user.id) && !user.demo).map(user => [user.id, user]));
            const mergedUsers = new Map(seededUsers.map(user => [user.id, user]));
            for (const user of localUsers.values()) if (![...mergedUsers.values()].some(seedUser => seedUser.id === user.id || seedUser.email.toLowerCase() === user.email.toLowerCase())) mergedUsers.set(user.id, user);
            write(keys.users, [...mergedUsers.values()]);
            const session = read(keys.session, null);
            if (session?.userId === "seller-demo") write(keys.session, { userId: "seller-agres", role: "seller" });
            localStorage.setItem("tokoko-seed-version", "8");
          }
        } catch { /* Keep existing browser data when seed file is unavailable. */ }
      }
      return;
    }
    try {
      const [seed, userSeed] = await Promise.all([fetchSeedData(), fetchSeedUsers()]);
       Object.entries({ users: flattenUsers(userSeed), products: seed.products, categories: seed.categories, carts: seed.carts, orders: seed.orders, chats: seed.chats || [], stockMovements: seed.stockMovements || [] }).forEach(([name, value]) => {
        if (!localStorage.getItem(keys[name])) write(keys[name], value);
      });
       write("tokoko-seed-version", "8");
    } catch {
      throw new Error("Data awal gagal dimuat. Jalankan lewat server atau pastikan folder data tersedia.");
    }
  }

  window.Store = {
    init,
    async authenticate(credentials) {
      if (apiAvailable) {
        const response = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(credentials) });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Autentikasi gagal.");
        return credentials.action === "register" ? { ...result.user, password: credentials.password } : result.user;
      }
      if (credentials.action === "register") {
        const user = { id: crypto.randomUUID(), name: credentials.name.trim(), email: credentials.email.trim().toLowerCase(), password: credentials.password, role: credentials.role };
        if (this.users.some(item => item.email.toLowerCase() === user.email)) throw new Error("Email sudah terdaftar.");
        this.users = [...this.users, (({ password, ...safeUser }) => safeUser)(user)];
        return user;
      }
      const user = this.users.find(item => item.email.toLowerCase() === credentials.email.trim().toLowerCase() && item.password === credentials.password);
      if (!user) throw new Error("Email atau kata sandi tidak cocok.");
      return user;
    },
    async changePassword(userId, currentPassword, newPassword) {
      if (!apiAvailable) throw new Error("Ubah kata sandi hanya tersedia saat memakai server Node.js.");
      const response = await fetch("/api/password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, currentPassword, newPassword }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Kata sandi gagal diubah.");
    },
    async updateBuyerProfile(userId, name, email) {
      if (!apiAvailable) throw new Error("Edit profil hanya tersedia saat memakai server Node.js.");
      const response = await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, name, email }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Profil gagal diperbarui.");
      this.users = this.users.map(user => user.id === userId ? result.user : user);
      return result.user;
    },
    async save() {
      const data = { users: this.users, products: this.products, categories: this.categories, carts: this.carts, orders: this.orders, chats: this.chats, stockMovements: this.stockMovements };
      if (apiAvailable) {
        const dataResponse = await fetch("/api/data", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ products: data.products, categories: data.categories, carts: data.carts, orders: data.orders, chats: data.chats, stockMovements: data.stockMovements, revision: apiRevision })
        });
        const dataResult = await dataResponse.json();
        if (!dataResponse.ok) throw new Error(dataResult.error || "Penyimpanan data gagal.");
        apiRevision = dataResult.revision;
        const usersResponse = await fetch("/api/users", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(groupUsers(data.users)) });
        if (!usersResponse.ok) throw new Error("Penyimpanan akun gagal.");
      }
      Object.entries(data).forEach(([name, value]) => write(keys[name], value));
    },
    async refreshChats() {
      if (!apiAvailable) return this.chats;
      const response = await fetch("/api/data");
      if (!response.ok) throw new Error("Percakapan gagal diperbarui.");
      const data = await response.json();
      if (Array.isArray(data.chats)) this.chats = data.chats;
      return this.chats;
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
    get chats() { return read(keys.chats, []); },
    set chats(value) { write(keys.chats, value); },
    get stockMovements() { return read(keys.stockMovements, []); },
    set stockMovements(value) { write(keys.stockMovements, value); },
    get session() { return read(keys.session, null); },
    set session(value) { value ? write(keys.session, value) : localStorage.removeItem(keys.session); },
    reset() { Object.values(keys).forEach(key => localStorage.removeItem(key)); }
  };
})();
