const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const app = fs.readFileSync("app.js", "utf8");
const css = fs.readFileSync("stylesheet.css", "utf8");
const server = fs.readFileSync("server.js", "utf8");
assert.match(app, /item\.stock \+ delta/);
assert.equal((app.match(/item\.stock \+ delta/g) || []).length, 1);
assert.match(app, /line\.status \|\| sellerStatus\(order, line\.sellerId\)/);
assert.match(app, /id="sellerRejectForm"[\s\S]*?minlength="5"[\s\S]*?maxlength="500"/);
assert.doesNotMatch(app, /prompt\(/);
assert.match(css, /\.product-promo[\s\S]*?color: #8a3c00/);
assert.match(app, /<button class="product-art" type="button" data-detail="\$\{safe\(product\.id\)\}">/);
assert.match(server, /const data = await parseBody\(req\)/);
assert.match(server, /decodedPathname\.startsWith\("\/hash\/"\)/);

const actions = statuses => [...new Set(statuses)].map(status => ({
  "Diteruskan ke gudang": ["pick", "Mulai siapkan"],
  Disiapkan: ["pack", "Tandai dikemas"],
  Dikemas: ["ship", "Tandai dikirim"]
}[status])).filter(Boolean);
assert.deepEqual(actions(["Diteruskan ke gudang", "Dikemas"]), [["pick", "Mulai siapkan"], ["ship", "Tandai dikirim"]]);

const stockForm = app.slice(app.indexOf('if (form.id === "stockForm")'), app.indexOf('if (form.id === "chatForm"'));
const stock = { id: "p1", stock: 12 };
const delta = 3;
const updated = vm.runInNewContext(`({ ...item, stock: item.stock + delta })`, { item: stock, delta });
assert.equal(updated.stock, 15);
assert.match(stockForm, /const previousProducts = Store\.products/);
console.log("Application behavior checks passed.");
