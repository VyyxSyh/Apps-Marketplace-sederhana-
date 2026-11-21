const http = require("node:http");
const fs = require("node:fs/promises");
const crypto = require("node:crypto");
const { promisify } = require("node:util");
const path = require("node:path");

const root = __dirname;
const dataDir = path.join(root, "data");
const usersFile = path.join(dataDir, "users.json");
const passwordsFile = path.join(root, "hash", "pw.json");
const scrypt = promisify(crypto.scrypt);
const port = Number(process.env.PORT) || 3000;
const types = { ".css": "text/css", ".html": "text/html", ".js": "text/javascript", ".json": "application/json" };
async function readUsers() {
  const data = JSON.parse(await fs.readFile(usersFile, "utf8"));
  if (Array.isArray(data.users)) {
    const users = data.users;
    const grouped = { buyer: [], seller: [], gudang: [] };
    for (const user of users) (grouped[user.role] || (grouped[user.role] = [])).push(user);
    await fs.writeFile(usersFile, `${JSON.stringify(grouped, null, 2)}\n`, "utf8");
    return grouped;
  }
  return data;
}
async function readPasswords() {
  try { return JSON.parse(await fs.readFile(passwordsFile, "utf8")); }
  catch (error) { if (error.code === "ENOENT") return {}; throw error; }
}
async function writeJson(file, data) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const temporaryFile = `${file}.tmp`;
  await fs.writeFile(temporaryFile, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  await fs.rename(temporaryFile, file);
}
async function readData() {
  const names = ["products", "categories", "carts", "orders", "chats", "stockMovements"];
  return Object.fromEntries(await Promise.all(names.map(async name => [name, JSON.parse(await fs.readFile(path.join(dataDir, `${name}.json`), "utf8"))])));
}
async function parseBody(req) {
  let body = "";
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 1_000_000) throw Object.assign(new Error("Data terlalu besar."), { status: 413 });
  }
  try { return JSON.parse(body); }
  catch { throw Object.assign(new Error("JSON tidak valid."), { status: 400 }); }
}

http.createServer(async (req, res) => {
  try {
    if (req.url === "/api/data" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      return res.end(JSON.stringify(await readData()));
    }
    if (req.url === "/api/users" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      const users = await readUsers();
      return res.end(JSON.stringify(users));
    }
    if (req.url === "/api/users" && req.method === "PUT") {
      const data = await parseBody(req);
      if (!data || !["buyer", "seller", "gudang"].every(role => Array.isArray(data[role])) || Object.entries(data).some(([role, users]) => users.some(user => !user.id || !user.email || user.role !== role))) {
        throw Object.assign(new Error("Format akun tidak valid."), { status: 400 });
      }
      const existing = JSON.parse(await fs.readFile(usersFile, "utf8"));
      const oldUsers = ["buyer", "seller", "gudang"].flatMap(role => existing[role] || []);
      const submittedUsers = ["buyer", "seller", "gudang"].flatMap(role => data[role]);
      const currentPasswords = await readPasswords();
      if (submittedUsers.length !== oldUsers.length || submittedUsers.some(user => !oldUsers.some(old => old.id === user.id && old.role === user.role && old.email.toLowerCase() === user.email.toLowerCase())) || oldUsers.some(user => !currentPasswords[user.id])) throw Object.assign(new Error("Akun tidak valid."), { status: 400 });
      await writeJson(usersFile, Object.fromEntries(["buyer", "seller", "gudang"].map(role => [role, data[role].map(user => {
        const { password, ...account } = user;
        const old = oldUsers.find(item => item.id === user.id);
        return { ...old, ...account, password: old.password };
      })])));
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      return res.end(JSON.stringify({ ok: true }));
    }
    if (req.url === "/api/auth" && req.method === "POST") {
      const { action, name, email, password, role } = await parseBody(req);
      if (typeof email !== "string" || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || typeof password !== "string" || password.length < 6 || password.length > 256) throw Object.assign(new Error("Email atau kata sandi tidak valid."), { status: 400 });
      const users = await readUsers();
      const allUsers = ["buyer", "seller", "gudang"].flatMap(group => users[group] || []);
      const passwords = await readPasswords();
      let migrated = false;
      for (const item of allUsers) if (item.password) {
        const salt = passwords[item.id]?.salt || crypto.randomBytes(16).toString("hex");
        passwords[item.id] = { salt, hash: (await scrypt(item.password, salt, 64)).toString("hex") };
        migrated = true;
      }
      if (migrated) {
        await writeJson(passwordsFile, passwords);
        await writeJson(usersFile, users);
      }
      if (action === "login") {
        const user = allUsers.find(item => item.email.toLowerCase() === email.trim().toLowerCase());
        const stored = user && passwords[user.id];
        if (!user || !stored) throw Object.assign(new Error("Email atau kata sandi tidak cocok."), { status: 401 });
        const candidate = await scrypt(password, stored.salt, 64);
        if (candidate.length !== Buffer.from(stored.hash, "hex").length || !crypto.timingSafeEqual(candidate, Buffer.from(stored.hash, "hex"))) throw Object.assign(new Error("Email atau kata sandi tidak cocok."), { status: 401 });
        return res.end(JSON.stringify({ user }));
      }
      if (action === "register") {
        if (typeof name !== "string" || name.trim().length < 2 || !["buyer", "seller"].includes(role)) throw Object.assign(new Error("Data akun tidak valid."), { status: 400 });
        if (allUsers.some(user => user.email.toLowerCase() === email.trim().toLowerCase())) throw Object.assign(new Error("Email sudah terdaftar."), { status: 409 });
        const user = { id: crypto.randomUUID(), name: name.trim(), email: email.trim().toLowerCase(), password, role, demo: true };
        const salt = crypto.randomBytes(16).toString("hex");
        passwords[user.id] = { salt, hash: (await scrypt(password, salt, 64)).toString("hex") };
        users[role].push(user);
        await writeJson(passwordsFile, passwords);
        await writeJson(usersFile, users);
        return res.end(JSON.stringify({ user }));
      }
      throw Object.assign(new Error("Aksi autentikasi tidak valid."), { status: 400 });
    }
    if (req.url === "/api/password" && req.method === "POST") {
      const { userId, currentPassword, newPassword } = await parseBody(req);
      if (typeof userId !== "string" || typeof currentPassword !== "string" || typeof newPassword !== "string" || newPassword.length < 6 || newPassword.length > 256) throw Object.assign(new Error("Kata sandi baru minimal 6 karakter."), { status: 400 });
      const passwords = await readPasswords();
      const stored = passwords[userId];
      if (!stored) throw Object.assign(new Error("Akun tidak ditemukan."), { status: 404 });
      const candidate = await scrypt(currentPassword, stored.salt, 64);
      const expected = Buffer.from(stored.hash, "hex");
      if (candidate.length !== expected.length || !crypto.timingSafeEqual(candidate, expected)) throw Object.assign(new Error("Kata sandi saat ini salah."), { status: 401 });
      const salt = crypto.randomBytes(16).toString("hex");
      passwords[userId] = { salt, hash: (await scrypt(newPassword, salt, 64)).toString("hex"), demoPassword: newPassword };
      const users = JSON.parse(await fs.readFile(usersFile, "utf8"));
      for (const role of ["buyer", "seller", "gudang"]) {
        const user = users[role].find(item => item.id === userId);
        if (user) user.password = newPassword;
      }
      await writeJson(passwordsFile, passwords);
      await writeJson(usersFile, users);
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      return res.end(JSON.stringify({ ok: true }));
    }
    if (req.url === "/api/data" && req.method === "PUT") {
      let body = "";
      for await (const chunk of req) {
        body += chunk;
        if (body.length > 1_000_000) throw Object.assign(new Error("Data terlalu besar."), { status: 413 });
      }
      const data = JSON.parse(body);
      if (!data || !Array.isArray(data.products) || !Array.isArray(data.categories) || !Array.isArray(data.carts) || !Array.isArray(data.orders) || !Array.isArray(data.chats) || !Array.isArray(data.stockMovements)) {
        throw Object.assign(new Error("Format data tidak valid."), { status: 400 });
      }
      for (const name of ["products", "categories", "carts", "orders", "chats", "stockMovements"]) await writeJson(path.join(dataDir, `${name}.json`), data[name] || []);
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      return res.end(JSON.stringify({ ok: true }));
    }

    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    if (["/hash", "/users.json", "/data.json"].includes(pathname) || pathname.startsWith("/hash/")) throw Object.assign(new Error("Tidak ditemukan."), { status: 404 });
    const file = path.resolve(root, `.${pathname === "/" ? "/index.html" : pathname}`);
    if (!file.startsWith(`${root}${path.sep}`)) throw Object.assign(new Error("Tidak ditemukan."), { status: 404 });
    const content = await fs.readFile(file);
    res.writeHead(200, { "Content-Type": `${types[path.extname(file)] || "application/octet-stream"}; charset=utf-8` });
    res.end(content);
  } catch (error) {
    res.writeHead(error.status || 500, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ error: error.message }));
  }
}).listen(port, "127.0.0.1", () => console.log(`TOKOKO: http://127.0.0.1:${port}`));
