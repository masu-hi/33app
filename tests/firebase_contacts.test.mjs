import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../assets/js/firebase_contacts.js", import.meta.url), "utf8")
  .replace(/import[\s\S]*?from\s+"[^"]+";/g, "")
  .replace(/export /g, "");

const fixture = () => {
  const store = new Map([
    ["users/customer", { name: "テスト利用者" }],
    ["admins/admin", {}],
  ]);
  let user = { uid: "customer", email: "customer@example.com" };
  let failWrites = false;
  const snapshot = (reference) => ({
    id: reference.id,
    exists: () => store.has(reference.path),
    data: () => structuredClone(store.get(reference.path)),
  });
  const context = {
    db: {},
    auth: { get currentUser() { return user; } },
    waitForUser: async () => user,
    doc: (db, ...parts) => ({ path: parts.join("/"), id: parts.at(-1) }),
    getDoc: async (reference) => snapshot(reference),
    runTransaction: async (db, callback) => {
      const writes = [];
      const result = await callback({
        get: async (reference) => snapshot(reference),
        set: (reference, values) => writes.push([reference.path, values]),
        update: (reference, values) => writes.push([reference.path, { ...store.get(reference.path), ...values }]),
      });
      if (failWrites) throw new Error("network error");
      writes.forEach(([path, values]) => store.set(path, structuredClone(values)));
      return result;
    },
  };
  const api = vm.runInNewContext(`${source}\n({ submitContact, replyToContact })`, context);
  return {
    api, store,
    setUser: (value) => { user = value; },
    failWrites: () => { failWrites = true; },
  };
};
const values = { type: "商品について", message: "バッグのサイズを教えてください。" };

test("送信者は認証中のアカウントから保存し、同じ送信の再試行は重複しない", async () => {
  const { api, store } = fixture();
  await api.submitContact("inquiry", { ...values, userId: "other", senderEmail: "other@example.com" });
  await api.submitContact("inquiry", values);
  assert.equal(store.get("contacts/inquiry").userId, "customer");
  assert.equal(store.get("contacts/inquiry").senderEmail, "customer@example.com");
  assert.equal(store.get("contacts/inquiry").senderName, "テスト利用者");
  assert.equal(store.get("contacts/inquiry").status, "pending");
  assert.equal([...store.keys()].filter((key) => key.startsWith("contacts/")).length, 1);
});

test("未ログイン・匿名・不正な種類・空本文・長すぎる内容は送信しない", async () => {
  const { api, setUser } = fixture();
  await assert.rejects(api.submitContact("a", { ...values, type: "不正" }));
  await assert.rejects(api.submitContact("a", { ...values, message: "  " }));
  await assert.rejects(api.submitContact("a", { ...values, message: "あ".repeat(5001) }));
  setUser(null);
  await assert.rejects(api.submitContact("a", values));
  setUser({ uid: "guest", isAnonymous: true });
  await assert.rejects(api.submitContact("a", values));
});

test("管理者の返信は本人宛て未読通知と同時に保存し、二重返信しない", async () => {
  const { api, store, setUser } = fixture();
  await api.submitContact("inquiry", values);
  await assert.rejects(api.replyToContact("inquiry", "返信"), /管理者/);
  setUser({ uid: "admin", email: "admin@example.com" });
  await api.replyToContact("inquiry", "サイズは商品ページをご確認ください。");
  assert.equal(store.get("contacts/inquiry").status, "replied");
  const notice = store.get("notifications/contact-inquiry");
  assert.equal(notice.userId, "customer");
  assert.equal(notice.isRead, false);
  assert.equal(notice.contactId, "inquiry");
  assert.match(notice.message, /バッグのサイズ/);
  assert.match(notice.message, /商品ページをご確認/);
  await assert.rejects(api.replyToContact("inquiry", "二回目"), /返信済み/);
  assert.equal(store.get("notifications/contact-inquiry").message, notice.message);
});

test("通信失敗なら返信済みにせず通知も作らない", async () => {
  const { api, store, setUser, failWrites } = fixture();
  await api.submitContact("inquiry", values);
  setUser({ uid: "admin", email: "admin@example.com" });
  failWrites();
  await assert.rejects(api.replyToContact("inquiry", "返信"));
  assert.equal(store.get("contacts/inquiry").status, "pending");
  assert.equal(store.has("notifications/contact-inquiry"), false);
});
