import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { webcrypto } from "node:crypto";

const source = readFileSync(new URL("../assets/js/countdown_store.js", import.meta.url), "utf8")
  .replace(/import[\s\S]*?from\s+"[^"]+";/g, "").replace(/export /g, "");
const event = { title: "テストライブ", date: "2027-01-15", place: "デモホール", memo: "双眼鏡" };

test("全カウントダウン画面が認証後に初期化され、読込前のサンプルを表示しない", () => {
  for (const page of ["countdown", "countdown_add", "countdown_list", "countdown_detail"]) {
    const html = readFileSync(new URL(`../${page}.html`, import.meta.url), "utf8");
    assert.match(html, /type="module" src="assets\/js\/countdown_bootstrap.js"/);
    assert.match(html, /<body class="[^"]*is_product_data_loading/);
    assert.match(html, /data-countdown-loading/);
    assert.doesNotMatch(html, /src="assets\/js\/countdown_store.js"/);
    const script = readFileSync(new URL(`../assets/js/${page}.js`, import.meta.url), "utf8");
    assert.doesNotMatch(script, /DOMContentLoaded/);
  }
});

const fixture = () => {
  const documents = new Map();
  const legacy = new Map(["countdownEvents", "countdownSelectedEventId", "countdownEvent", "countdownMemo", "unrelated"].map((key) => [key, "demo"]));
  const listeners = [];
  let fail = false;
  let queue = Promise.resolve();
  const snapshot = (reference) => ({ data: () => structuredClone(documents.get(reference.path)) });
  const client = async (uid) => {
    let user = { uid, isAnonymous: false };
    const window = { dispatchEvent() {}, addEventListener() {} };
    const context = {
      window, crypto: webcrypto, structuredClone,
      CustomEvent: class { constructor(type) { this.type = type; } },
      auth: { get currentUser() { return user; } }, db: {},
      sessionStorage: { getItem: () => uid },
      localStorage: {
        getItem() { throw new Error("共通の端末データを読まないこと"); },
        removeItem(key) { legacy.delete(key); },
      },
      doc: (db, ...parts) => ({ path: parts.join("/") }),
      getDoc: async (reference) => snapshot(reference),
      onSnapshot: (reference, callback, onError) => {
        const listener = { reference, callback, onError };
        listeners.push(listener);
        callback(snapshot(reference));
        return () => listeners.splice(listeners.indexOf(listener), 1);
      },
      runTransaction: (db, callback) => {
        const run = queue.then(async () => {
          const writes = [];
          const result = await callback({
            get: async (reference) => snapshot(reference),
            set: (reference, data) => writes.push([reference.path, structuredClone(data)]),
          });
          if (fail) throw new Error("network failure");
          writes.forEach(([path, data]) => documents.set(path, data));
          for (const listener of listeners) listener.callback(snapshot(listener.reference));
          return result;
        });
        queue = run.catch(() => {});
        return run;
      },
    };
    const init = vm.runInNewContext(`${source}\ninitializeCountdownStore`, context);
    await init(user);
    return { api: window.countdownStore, switchUser: (uid) => { user = { uid }; } };
  };
  return { documents, legacy, client, fail: () => { fail = true; }, error: () => listeners.forEach((listener) => listener.onError()) };
};

test("未登録の利用者に架空予定や以前の共通データを表示せず、アカウントを分離する", async () => {
  const f = fixture();
  const alice = await f.client("alice");
  assert.deepEqual([...f.legacy.keys()], ["unrelated"]);
  const bob = await f.client("bob");
  assert.equal(alice.api.getSelectedEvent(), null);
  await alice.api.addEvent(event, "event-a");
  assert.equal(alice.api.getEvents().length, 1);
  assert.equal(bob.api.getEvents().length, 0);
  assert.equal(f.documents.has("users/alice/countdown/current"), true);
  assert.equal(f.documents.has("users/bob/countdown/current"), false);
});

test("同じアカウントの二端末で追加・選択・削除が反映され、同時追加も消えない", async () => {
  const f = fixture();
  const a = await f.client("alice");
  const b = await f.client("alice");
  await Promise.all([a.api.addEvent(event, "one"), b.api.addEvent({ ...event, title: "二つ目" }, "two")]);
  assert.equal(a.api.getEvents().length, 2);
  assert.equal(b.api.getEvents().length, 2);
  await b.api.selectEvent("one");
  assert.equal(a.api.getSelectedEvent().id, "one");
  await a.api.removeEvent("one", 1);
  assert.equal(b.api.getSelectedEvent().id, "two");
  await b.api.removeEvent("two", 1);
  assert.equal(a.api.getSelectedEvent(), null);
  const reloaded = await f.client("alice");
  assert.equal(reloaded.api.getEvents().length, 0);
});

test("違う項目の編集は併存し、同じメモの古い内容による上書きは防ぐ", async () => {
  const f = fixture();
  const a = await f.client("alice");
  const b = await f.client("alice");
  await a.api.addEvent(event, "one");
  await a.api.updateEvent("one", { title: "更新したライブ" }, { title: event.title });
  await b.api.updateEvent("one", { memo: "バッグも持参" }, { memo: event.memo });
  assert.equal(a.api.getSelectedEvent().title, "更新したライブ");
  assert.equal(a.api.getSelectedEvent().memo, "バッグも持参");
  await assert.rejects(a.api.updateEvent("one", { memo: "古い入力" }, { memo: event.memo }), /別の画面/);
  await assert.rejects(a.api.removeEvent("one", 1), /更新/);
  await b.api.removeEvent("one", 3);
  await assert.rejects(a.api.updateEvent("one", { memo: "復活させない" }, { memo: "バッグも持参" }), /削除/);
});

test("送信の再試行を重複登録せず、不正な日付や空欄を保存しない", async () => {
  const f = fixture();
  const { api } = await f.client("alice");
  await api.addEvent(event, "one");
  await api.addEvent(event, "one");
  assert.equal(api.getEvents().length, 1);
  for (const changes of [{ title: " " }, { place: "" }, { date: "2027-02-30" }, { memo: "a".repeat(5001) }])
    await assert.rejects(api.addEvent({ ...event, ...changes }));
});

test("通信失敗やアカウント切替後は保存成功にせず、読み込みエラー時も書き込まない", async () => {
  const f = fixture();
  const a = await f.client("alice");
  f.fail();
  await assert.rejects(a.api.addEvent(event, "one"));
  assert.equal(a.api.getEvents().length, 0);
  a.switchUser("bob");
  await assert.rejects(a.api.addEvent(event, "two"), /ログイン/);
  const g = fixture();
  const b = await g.client("bob");
  g.error();
  await assert.rejects(b.api.addEvent(event), /読み込めません/);
});
