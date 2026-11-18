const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");

const root = __dirname;
const dataFile = path.join(root, "data.json");
const types = { ".css": "text/css", ".html": "text/html", ".js": "text/javascript", ".json": "application/json" };

http.createServer(async (req, res) => {
  try {
    if (req.url === "/api/data" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      return res.end(await fs.readFile(dataFile));
    }
    if (req.url === "/api/data" && req.method === "PUT") {
      let body = "";
      for await (const chunk of req) {
        body += chunk;
        if (body.length > 1_000_000) throw Object.assign(new Error("Data terlalu besar."), { status: 413 });
      }
      const data = JSON.parse(body);
      if (!data || !Array.isArray(data.products) || !Array.isArray(data.categories) || !Array.isArray(data.users)) {
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
}).listen(3000, "127.0.0.1", () => console.log("TOKOKO: http://127.0.0.1:3000"));
