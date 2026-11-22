const assert = require("node:assert/strict");
const label = status => ({ "Diproses": "Menunggu penjual", "Menunggu penjual": "Menunggu penjual", "Diteruskan ke gudang": "Menunggu gudang", "Disiapkan": "Sedang disiapkan", "Dikemas": "Siap dikirim", "Dikirim": "Dalam pengiriman", "Selesai": "Selesai", "Ditolak": "Ditolak toko", "Dibatalkan": "Dibatalkan" }[status] || status);
const matchesOrder = (order, query, status, product) => {
  const searchable = `${order.orderNumber} ${order.items.map(item => item.name).join(" ")}`.toLocaleLowerCase("id");
  const statuses = order.items.map(item => item.status || order.status);
  return searchable.includes(query.toLocaleLowerCase("id")) && (!status || statuses.some(value => label(value) === status || value === status)) && (!product || order.items.some(item => item.name === product));
};
const order = { orderNumber: "TK-123", status: "Dalam proses", items: [{ name: "Laptop", status: "Dikirim" }, { name: "Mouse", status: "Selesai" }] };
assert.equal(matchesOrder(order, "tk-123", "Dalam pengiriman", "Laptop"), true);
assert.equal(matchesOrder(order, "mouse", "Ditolak toko", "Mouse"), false);
