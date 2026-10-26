import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { webcrypto } from "node:crypto";
import vm from "node:vm";

const logic = await import(
  `data:text/javascript,${encodeURIComponent(readFileSync(new URL("../assets/js/rental_inventory.js", import.meta.url), "utf8"))}`
);
const source = readFileSync(new URL("../assets/js/firebase_waitlist.js", import.meta.url), "utf8")
  .replace(/import[\s\S]*?from\s+"[^"]+";/g, "")
  .replace(/export /g, "");
const start = logic.addRentalDays(new Date().toISOString().slice(0, 10), 30);
const end = logic.addRentalDays(start, 3);
const products = {
  bag: {
    name: "バッグ",
    variants: [
      { id: "red", stock: 2 },
      { id: "blue", stock: 2 },
    ],
  },
};

const fixture = () => {
  const store = new Map([
    ["admins/admin", {}],
    ["products/bag", { name: "バッグ", isPublished: true }],
    ["products/bag/variants/red", { totalStock: 2 }],
    ["products/bag/variants/blue", { totalStock: 2 }],
  ]);
  let userId = "customer";
  const snap = (reference) => ({
    id: reference.id,
    exists: () => store.has(reference.path),
    data: () => structuredClone(store.get(reference.path)),
  });
  const context = {
    ...logic,
    crypto: webcrypto,
    TextEncoder,
    Date,
    db: {},
    window: { PRODUCTS: products },
    sessionStorage: { getItem: () => userId },
    waitForUser: async () => ({ uid: userId }),
    doc: (db, ...parts) => ({ path: parts.join("/"), id: parts.at(-1) }),
    getDoc: async (reference) => snap(reference),
    serverTimestamp: () => 0,
    runTransaction: async (db, callback) => {
      const writes = [];
      const result = await callback({
        get: async (reference) => snap(reference),
        set: (reference, data) => writes.push([reference.path, data]),
        update: (reference, data) =>
          writes.push([reference.path, { ...store.get(reference.path), ...data }]),
      });
      writes.forEach(([path, data]) => store.set(path, structuredClone(data)));
      return result;
    },
  };
  const api = vm.runInNewContext(
    `${source}\n({ saveWaitlist, sendWaitlistNotification, isCloudWaitlistAvailable })`,
    context,
  );
  return {
    store,
    api,
    setUser: (id) => {
      userId = id;
    },
  };
};

const entry = (variantId = "red", quantity = 1) => ({
  productId: "bag",
  startDate: start,
  endDate: end,
  variantSelections: { bag: variantId },
  quantity,
  notify: true,
});

test("同じ登録は重複させず、色や個数が違えば別に保存する", async () => {
  const { store, api } = fixture();
  const first = await api.saveWaitlist(entry());
  assert.equal((await api.saveWaitlist(entry())).id, first.id);
  assert.notEqual((await api.saveWaitlist(entry("blue"))).id, first.id);
  assert.notEqual((await api.saveWaitlist(entry("red", 2))).id, first.id);
  assert.equal([...store.keys()].filter((key) => key.startsWith("waitlists/")).length, 3);
});

test("管理者だけが本人宛て通知を送り、同じ登録には一度だけ送る", async () => {
  const { store, api, setUser } = fixture();
  const saved = await api.saveWaitlist(entry());
  await assert.rejects(() => api.sendWaitlistNotification(saved.id));
  setUser("admin");
  assert.equal(await api.sendWaitlistNotification(saved.id), true);
  assert.equal(await api.sendWaitlistNotification(saved.id), false);
  const notifications = [...store].filter(([path]) => path.startsWith("notifications/"));
  assert.equal(notifications.length, 1);
  assert.equal(notifications[0][1].userId, "customer");
  assert.equal(notifications[0][1].isRead, false);
});

test("通知不要と、希望期間の一部だけ在庫不足の場合は送らない", async () => {
  const { store, api, setUser } = fixture();
  const saved = await api.saveWaitlist({ ...entry(), notify: false });
  setUser("admin");
  await assert.rejects(() => api.sendWaitlistNotification(saved.id));
  const path = `waitlists/${saved.id}`;
  store.set(path, { ...store.get(path), notify: true });
  const blockedDate = logic.addRentalDays(start, 2);
  store.set(`inventoryDays/${logic.inventoryDayId("bag", "red", blockedDate)}`, {
    reservedCount: 2,
  });
  await assert.rejects(() => api.sendWaitlistNotification(saved.id));
  assert.equal([...store.keys()].filter((key) => key.startsWith("notifications/")).length, 0);
  assert.equal(
    api.isCloudWaitlistAvailable(entry(), products, {
      [logic.inventoryDayId("bag", "red", blockedDate)]: 2,
    }),
    false,
  );
  assert.equal(
    api.isCloudWaitlistAvailable(entry("blue"), products, {
      [logic.inventoryDayId("bag", "red", blockedDate)]: 2,
    }),
    true,
  );
});

test("未読バッジはFirebaseの既読状態と初期案内に一致する", () => {
  const app = readFileSync(new URL("../assets/js/app.js", import.meta.url), "utf8");
  const storage = new Map([
    [
      "appNotifications",
      JSON.stringify([
        { id: "sent", isRead: false },
        { id: "read", isRead: true },
      ]),
    ],
  ]);
  const getCount = vm.runInNewContext(
    `const appStorage = window.userStorage;\n${app.slice(app.indexOf("const NOTICE_READ_STORAGE_KEY"), app.indexOf("const updateNoticeCount"))}\ngetUnreadNoticeCount`,
    {
      window: { userStorage: { getItem: (key) => storage.get(key) || null } },
    },
  );
  assert.equal(getCount(), 3);
  storage.set("readNoticeIds", JSON.stringify(["welcome", "return-request"]));
  assert.equal(getCount(), 1);
  storage.set(
    "appNotifications",
    JSON.stringify([
      { id: "sent", isRead: true },
      { id: "read", isRead: true },
    ]),
  );
  assert.equal(getCount(), 0);
});
