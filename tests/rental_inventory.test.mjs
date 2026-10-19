import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const logic = await import(
  `data:text/javascript,${encodeURIComponent(readFileSync(new URL("../assets/js/rental_inventory.js", import.meta.url), "utf8"))}`
);
const source = readFileSync(new URL("../assets/js/firebase_orders.js", import.meta.url), "utf8")
  .replace(/import[\s\S]*?from\s+"[^"]+";/g, "")
  .replace(/export /g, "");

const fixture = () => {
  const store = new Map([
    ["products/penlight", { price: 800, isPublished: true }],
    ["products/penlight/variants/default", { totalStock: 1 }],
  ]);
  const versions = new Map();
  const user = { uid: "test-user", email: "test@example.com" };
  const snapshots = (path) => {
    const data = structuredClone(store.get(path));
    return { id: path.split("/").at(-1), exists: () => data !== undefined, data: () => data };
  };
  const context = {
    ...logic,
    window: {
      PRODUCTS: { penlight: { id: "penlight", variants: [{ id: "default" }] } },
      userStorage: { setItem() {} },
    },
    db: {},
    sessionStorage: { getItem: () => user.uid },
    waitForUser: async () => user,
    loadUserProfile: async () => {},
    collection: (db, ...parts) => parts.join("/"),
    doc: (db, ...parts) => parts.join("/"),
    where: (...args) => args,
    query: (path) => ({ path }),
    serverTimestamp: () => 0,
    getDocs: async ({ path }) => ({
      docs: [...store.keys()]
        .filter((key) => key.startsWith(`${path}/`) && store.get(key).userId === user.uid)
        .map(snapshots),
    }),
    runTransaction: async (db, callback) => {
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const reads = new Map();
        const writes = [];
        const result = await callback({
          get: async (path) => {
            reads.set(path, versions.get(path) || 0);
            return snapshots(path);
          },
          set: (path, data) => writes.push([path, data]),
          update: (path, data) => writes.push([path, { ...store.get(path), ...data }]),
        });
        if ([...reads].some(([path, version]) => version !== (versions.get(path) || 0))) continue;
        for (const [path, data] of writes) {
          store.set(path, structuredClone(data));
          versions.set(path, (versions.get(path) || 0) + 1);
        }
        return result;
      }
      throw new Error("Transaction contention");
    },
  };
  const api = vm.runInNewContext(`${source}\n({ saveRentalOrder, changeRentalOrder })`, context);
  return { store, api };
};

const order = (id, start = "2026-11-01") => ({
  id,
  productId: "penlight",
  arrivalDate: start,
  returnDate: logic.addRentalDays(start, 3),
  quantity: 1,
  subtotal: 800,
  total: 1240,
  customer: {},
  variantSelections: { penlight: "default" },
  status: "配送待ち",
});

test("同時注文でも1点の在庫に1件だけ確保する", async () => {
  const { api, store } = fixture();
  const results = await Promise.allSettled([
    api.saveRentalOrder(order("first")),
    api.saveRentalOrder(order("second")),
  ]);
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  for (const day of logic.rentalDateKeys("2026-11-01", "2026-11-04")) {
    assert.equal(
      store.get(`inventoryDays/${logic.inventoryDayId("penlight", "default", day)}`).reservedCount,
      1,
    );
  }
});

test("キャンセルと注文の再試行で予約数を重複更新しない", async () => {
  const { api, store } = fixture();
  await api.saveRentalOrder(order("first"));
  await api.saveRentalOrder(order("first"));
  await api.changeRentalOrder("first", "cancel");
  await api.changeRentalOrder("first", "cancel");
  assert.equal(store.get("inventoryDays/penlight__default__2026-11-01").reservedCount, 0);
  await api.saveRentalOrder(order("second"));
  assert.equal(store.get("inventoryDays/penlight__default__2026-11-01").reservedCount, 1);
});

test("翌日在庫がなければ延長せず、空けば1日だけ延長する", async () => {
  const { api, store } = fixture();
  await api.saveRentalOrder(order("first"));
  await api.saveRentalOrder(order("second", "2026-11-05"));
  await assert.rejects(() => api.changeRentalOrder("first", "extend", "credit", "2026-11-04"));
  assert.equal(store.get("orders/first").returnDate, "2026-11-04");
  await api.changeRentalOrder("second", "cancel");
  await api.changeRentalOrder("first", "extend", "paypay", "2026-11-04");
  await api.changeRentalOrder("first", "extend", "paypay", "2026-11-04");
  assert.equal(store.get("orders/first").returnDate, "2026-11-05");
  assert.equal(store.get("orders/first").extensionTotal, 440);
});

test("セット構成の個数と不正な日付を検証する", () => {
  const products = {
    set: { bundleComponents: [{ productId: "penlight", quantity: 2 }] },
    penlight: { variants: [{ id: "default" }] },
  };
  assert.equal(
    logic.inventoryRequirements({ productId: "set", quantity: 3 }, products)[0].quantity,
    6,
  );
  assert.equal(logic.addRentalDays("2028-02-28", 1), "2028-02-29");
  assert.throws(() => logic.addRentalDays("2026-02-30", 1));
});
