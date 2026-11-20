const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");

const root = __dirname;
const dataFile = path.join(root, "data.json");
const usersFile = path.join(root, "users.json");
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

http.createServer(async (req, res) => {
  try {
    if (req.url === "/api/data" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      return res.end(await fs.readFile(dataFile));
    }
    if (req.url === "/api/users" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      return res.end(JSON.stringify(await readUsers()));
    }
    if (req.url === "/api/users" && req.method === "PUT") {
      let body = "";
      for await (const chunk of req) {
        body += chunk;
        if (body.length > 1_000_000) throw Object.assign(new Error("Data terlalu besar."), { status: 413 });
      }
      const data = JSON.parse(body);
      if (!data || !["buyer", "seller", "gudang"].every(role => Array.isArray(data[role])) || Object.entries(data).some(([role, users]) => users.some(user => !user.id || !user.email || !user.password || user.role !== role))) {
        throw Object.assign(new Error("Format akun tidak valid."), { status: 400 });
      }
      const temporaryFile = `${usersFile}.tmp`;
      const normalized = Object.fromEntries(["buyer", "seller", "gudang"].map(role => [role, data[role]]));
      await fs.writeFile(temporaryFile, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
      await fs.rename(temporaryFile, usersFile);
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
      if (!data || !Array.isArray(data.products) || !Array.isArray(data.categories)) {
        throw Object.assign(new Error("Format data tidak valid."), { status: 400 });
      }
      const temporaryFile = `${dataFile}.tmp`;
      await fs.writeFile(temporaryFile, `${JSON.stringify(data, null, 2)}\n`, "utf8");
      await fs.rename(temporaryFile, dataFile);
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      return res.end(JSON.stringify({ ok: true }));
    }

    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
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
