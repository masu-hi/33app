import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { webcrypto } from "node:crypto";
import vm from "node:vm";

const source = readFileSync(new URL("../assets/js/firebase_user_state.js", import.meta.url), "utf8")
  .replace(/import[\s\S]*?from\s+"[^"]+";/g, "")
  .replace(/export /g, "");
const profileSource = readFileSync(
  new URL("../assets/js/firebase_user.js", import.meta.url),
  "utf8",
)
  .replace(/import[\s\S]*?from\s+"[^"]+";/g, "")
  .replace(/import "[^"]+";/g, "")
  .replace(/export /g, "");

function backend() {
  const store = new Map();
  const versions = new Map();
  const listeners = new Map();
  let failWrites = false;
  const snapshot = (path) => {
    const data = structuredClone(store.get(path));
    return { exists: () => data !== undefined, data: () => data };
  };
  function device(uid, localValues = {}) {
    const local = new Map(Object.entries(localValues));
    const session = new Map([["activeUserId", uid]]);
    const auth = { currentUser: { uid, email: `${uid}@example.com` } };
    const authListeners = new Set();
    const redirects = [];
    const events = [];
    const api = vm.runInNewContext(
      `${profileSource}\n${source}\n({ initializeUserState, saveFavorite, saveCart, saveProfile })`,
      {
        auth,
        db: {},
        crypto: webcrypto,
        CustomEvent: class {
          constructor(type) {
            this.type = type;
          }
        },
        sessionStorage: {
          getItem: (key) => session.get(key),
          setItem: (key, value) => session.set(key, value),
          removeItem: (key) => session.delete(key),
        },
        localStorage: {
          getItem: (key) => local.get(key) ?? null,
          setItem: (key, value) => local.set(key, value),
        },
        window: {
          userStorage: {
            getItem: (key) => local.get(key) ?? null,
            setItem: (key, value) => local.set(key, value),
            removeItem: (key) => local.delete(key),
          },
          dispatchEvent: (event) => events.push(event.type),
          addEventListener() {},
          location: { replace: (url) => redirects.push(url) },
        },
        onAuthStateChanged: (auth, callback) => {
          authListeners.add(callback);
          queueMicrotask(() => {
            if (authListeners.has(callback)) callback(auth.currentUser);
          });
          return () => authListeners.delete(callback);
        },
        doc: (db, ...parts) => parts.join("/"),
        serverTimestamp: () => 0,
        getDoc: async (path) => snapshot(path),
        onSnapshot: (path, callback) => {
          if (!listeners.has(path)) listeners.set(path, new Set());
          listeners.get(path).add(callback);
          callback(snapshot(path));
          return () => listeners.get(path).delete(callback);
        },
        runTransaction: async (db, callback) => {
          if (failWrites) throw Object.assign(new Error("Offline"), { code: "unavailable" });
          for (let attempt = 0; attempt < 10; attempt++) {
            const reads = new Map();
            const writes = new Map();
            const result = await callback({
              get: async (path) => {
                assert.equal(writes.size, 0, "All reads must precede writes");
                reads.set(path, versions.get(path) || 0);
                return snapshot(path);
              },
              set: (path, data) => writes.set(path, data),
            });
            if ([...reads].some(([path, version]) => version !== (versions.get(path) || 0)))
              continue;
            for (const [path, data] of writes) {
              store.set(path, structuredClone(data));
              versions.set(path, (versions.get(path) || 0) + 1);
              listeners.get(path)?.forEach((handler) => handler(snapshot(path)));
            }
            return result;
          }
          throw new Error("Transaction contention");
        },
      },
    );
    return {
      api,
      local,
      events,
      redirects,
      switchUser: (nextUid) => {
        auth.currentUser = nextUid ? { uid: nextUid } : null;
        [...authListeners].forEach((handler) => handler(auth.currentUser));
      },
    };
  }
  return {
    store,
    device,
    failWrites: () => {
      failWrites = true;
    },
  };
}

const memberProfile = {
  name: "テスト会員",
  kana: "テストカイイン",
  phone: "090-1234-5678",
  birth_year: "2000",
  birth_month: "1",
  birth_day: "2",
  postal_first: "453",
  postal_last: "0014",
  prefecture: "愛知県",
  address: "名古屋市中村区則武2-9-22",
  building: "",
  favorite_color: "ピンク",
};

test("会員情報と推しカラーの保存が同じアカウントの別端末へ反映される", async () => {
  const server = backend();
  const first = server.device("alice");
  const second = server.device("alice");
  await first.api.initializeUserState();
  await second.api.initializeUserState();
  await first.api.saveProfile(memberProfile);
  const saved = JSON.parse(second.local.get("memberProfile"));
  assert.equal(saved.name, memberProfile.name);
  assert.equal(saved.address, memberProfile.address);
  assert.equal(saved.phone, memberProfile.phone);
  assert.equal(saved.email, "alice@example.com");
  assert.equal(second.local.get("accountName"), memberProfile.name);
  assert.equal(second.local.get("favoriteColor"), "ピンク");
  assert.ok(second.events.includes("profile:updated"));
  await second.api.saveProfile({ favorite_color: "青" });
  assert.equal(first.local.get("favoriteColor"), "青");
  assert.equal(JSON.parse(first.local.get("memberProfile")).address, memberProfile.address);
  assert.equal(server.store.get("users/alice").role, "user");
});

test("別の項目の同時変更では互いの内容を消さない", async () => {
  const server = backend();
  server.store.set("users/alice", { ...memberProfile, role: "user" });
  const first = server.device("alice");
  const second = server.device("alice");
  await first.api.initializeUserState();
  await second.api.initializeUserState();
  await Promise.all([
    first.api.saveProfile({ name: "変更後の名前" }, memberProfile),
    second.api.saveProfile({ favorite_color: "黒" }, memberProfile),
  ]);
  const profile = server.store.get("users/alice");
  assert.equal(profile.name, "変更後の名前");
  assert.equal(profile.favorite_color, "黒");
  assert.equal(first.local.get("favoriteColor"), "黒");
});

test("同じ項目が別端末で変更されたら古い入力で上書きしない", async () => {
  const server = backend();
  server.store.set("users/alice", { ...memberProfile, role: "user" });
  const first = server.device("alice");
  await first.api.initializeUserState();
  await first.api.saveProfile({ name: "新しい名前" }, memberProfile);
  await assert.rejects(
    first.api.saveProfile({ name: "古い画面の名前" }, memberProfile),
    (error) => error.code === "profile/conflict",
  );
  assert.equal(server.store.get("users/alice").name, "新しい名前");
});

test("パスワードと権限をプロフィールへ保存せず、メールは認証情報と一致させる", async () => {
  const server = backend();
  const first = server.device("alice");
  await first.api.initializeUserState();
  await first.api.saveProfile({
    ...memberProfile,
    email: "alice@example.com",
    role: "admin",
    password: "secret",
  });
  const profile = server.store.get("users/alice");
  assert.equal(profile.role, "user");
  assert.equal(profile.password, undefined);
  assert.equal(first.local.get("accounts").includes("secret"), false);
  await assert.rejects(first.api.saveProfile({ email: "someone@example.com" }), /ログイン用/);
});

test("不正な日付・電話番号・郵便番号・カラーは保存しない", async () => {
  const server = backend();
  const first = server.device("alice");
  await first.api.initializeUserState();
  await first.api.saveProfile(memberProfile);
  for (const invalid of [
    { birth_year: "2025", birth_month: "2", birth_day: "29" },
    { birth_year: "2999", birth_month: "1", birth_day: "1" },
    { phone: "1234" },
    { postal_first: "1234" },
    { favorite_color: "金" },
    { name: "   " },
  ])
    await assert.rejects(first.api.saveProfile(invalid));
  assert.equal(server.store.get("users/alice").name, memberProfile.name);
  assert.equal(server.store.get("users/alice").favorite_color, "ピンク");
});

test("通信失敗時は表示用キャッシュも推しカラーも変更しない", async () => {
  const server = backend();
  const first = server.device("alice");
  await first.api.initializeUserState();
  await first.api.saveProfile(memberProfile);
  server.failWrites();
  await assert.rejects(first.api.saveProfile({ name: "保存されない名前", favorite_color: "青" }));
  assert.equal(first.local.get("accountName"), memberProfile.name);
  assert.equal(first.local.get("favoriteColor"), "ピンク");
});

test("別アカウントの会員情報・色を混ぜず、ログアウト後は更新しない", async () => {
  const server = backend();
  const first = server.device("alice");
  await first.api.initializeUserState();
  await first.api.saveProfile(memberProfile);
  const second = server.device("bob");
  await second.api.initializeUserState();
  assert.equal(second.local.get("favoriteColor"), undefined);
  assert.equal(JSON.parse(second.local.get("memberProfile")).name, undefined);
  first.switchUser(null);
  await assert.rejects(first.api.saveProfile({ favorite_color: "青" }), /ログイン状態/);
  assert.equal(server.store.get("users/alice").favorite_color, "ピンク");
});

test("プロフィール更新のイベントで名前・メイン色・反対色・線を画面へ反映する", () => {
  const app = readFileSync(new URL("../assets/js/app.js", import.meta.url), "utf8");
  const paletteCode = app.slice(
    app.indexOf("const mainColors ="),
    app.indexOf("if (!favoriteColor)"),
  );
  const listenerCode = app.slice(
    app.indexOf('window.addEventListener("profile:updated"'),
    app.indexOf("const rentalStatusCounts"),
  );
  const styles = new Map();
  const classes = new Map();
  const accountNameElement = {};
  let profile = {};
  let handler;
  let selectedColor;
  vm.runInNewContext(
    `let activeAccountEmail; let favoriteColor;\n${paletteCode}\n${listenerCode}`,
    {
      document: {
        documentElement: {
          style: { setProperty: (name, value) => styles.set(name, value) },
          classList: { toggle: (name, value) => classes.set(name, value) },
        },
      },
      window: {
        addEventListener: (name, callback) => {
          handler = callback;
        },
      },
      normalizeEmail: (value) => value,
      sessionStorage: { getItem: () => "alice@example.com" },
      getActiveAccount: () => ({ profile }),
      updateFavoriteColorButtons: (value) => {
        selectedColor = value;
      },
      accountNameElement,
    },
  );
  profile = { name: "変更後の名前", favorite_color: "青" };
  handler();
  assert.equal(accountNameElement.textContent, "変更後の名前");
  assert.equal(styles.get("--color-main"), "#bfd2f5");
  assert.equal(styles.get("--color-gradient-end"), "#fff0f2");
  assert.equal(styles.get("--color-gradient-line"), "#e8b4bd");
  assert.equal(styles.get("--color-line"), "#ccd9f1");
  assert.equal(selectedColor, "青");
  profile = { favorite_color: "黒" };
  handler();
  assert.equal(classes.get("is-dark-favorite"), true);
  profile = {};
  handler();
  assert.equal(classes.get("is-dark-favorite"), false);
  assert.equal(styles.get("--color-main"), "#f6ecf8");
});

const reservation = {
  productId: "bag",
  arrivalDate: "2026-11-01",
  returnDate: "2026-11-04",
  variantSelections: { bag: "red" },
  selectedOptions: [{ name: "カラー", value: "赤" }],
};

test("本人の既存データを一度だけ引き継ぎ、削除済みの内容を復活させない", async () => {
  const server = backend();
  const first = server.device("alice", {
    favoriteProducts: '["bag"]',
    cartCount: "2",
    pendingReservation: JSON.stringify(reservation),
  });
  await first.api.initializeUserState();
  assert.equal(server.store.get("users/alice/cart/current").quantity, 2);
  await first.api.saveFavorite("bag", false);
  await first.api.saveCart(null, 0, first.local.get("cartRevision"));
  const stale = server.device("alice", {
    favoriteProducts: '["bag"]',
    cartCount: "2",
    pendingReservation: JSON.stringify(reservation),
  });
  await stale.api.initializeUserState();
  assert.equal(stale.local.get("favoriteProducts"), "[]");
  assert.equal(stale.local.get("cartCount"), "0");
  assert.equal(stale.local.has("pendingReservation"), false);
});

test("同じアカウントの別端末へお気に入りの追加・削除を反映する", async () => {
  const server = backend();
  const first = server.device("alice");
  const second = server.device("alice");
  await first.api.initializeUserState();
  await second.api.initializeUserState();
  await first.api.saveFavorite("bag", true);
  assert.equal(second.local.get("favoriteProducts"), '["bag"]');
  await second.api.saveFavorite("bag", false);
  assert.equal(first.local.get("favoriteProducts"), "[]");
});

test("同時に別の商品をお気に入りにしても片方を消さない", async () => {
  const server = backend();
  const first = server.device("alice");
  const second = server.device("alice");
  await first.api.initializeUserState();
  await second.api.initializeUserState();
  await Promise.all([first.api.saveFavorite("bag", true), second.api.saveFavorite("fan", true)]);
  assert.deepEqual(JSON.parse(first.local.get("favoriteProducts")).sort(), ["bag", "fan"]);
});

test("カートの日程・種類・個数と削除を別端末に反映する", async () => {
  const server = backend();
  const first = server.device("alice");
  const second = server.device("alice");
  await first.api.initializeUserState();
  await second.api.initializeUserState();
  await first.api.saveCart(reservation, 2, first.local.get("cartRevision"));
  assert.deepEqual(JSON.parse(second.local.get("pendingReservation")), {
    ...reservation,
    quantity: 2,
  });
  await second.api.saveCart(reservation, 3, second.local.get("cartRevision"));
  assert.equal(first.local.get("cartCount"), "3");
  await second.api.saveCart(null, 0, second.local.get("cartRevision"));
  assert.equal(first.local.get("cartCount"), "0");
});

test("古いカートの操作は新しいカートを上書きしない", async () => {
  const { device } = backend();
  const first = device("alice");
  await first.api.initializeUserState();
  const oldRevision = first.local.get("cartRevision");
  await first.api.saveCart(reservation, 2, oldRevision);
  await assert.rejects(first.api.saveCart(null, 0, oldRevision), /別の画面でカートが変更/);
  assert.equal(first.local.get("cartCount"), "2");
});

test("別アカウントにデータを混ぜず、切り替え後の古い画面からの保存を拒否する", async () => {
  const server = backend();
  const first = server.device("alice");
  await first.api.initializeUserState();
  await first.api.saveFavorite("bag", true);
  const second = server.device("bob");
  await second.api.initializeUserState();
  assert.equal(second.local.get("favoriteProducts"), "[]");
  assert.equal(second.local.get("cartCount"), "0");
  first.switchUser("bob");
  assert.deepEqual(first.redirects, ["login.html"]);
  await assert.rejects(first.api.saveFavorite("fan", true), /ログイン状態が変わり/);
  assert.deepEqual(server.store.get("users/alice/favorites/current").productIds, ["bag"]);
});
