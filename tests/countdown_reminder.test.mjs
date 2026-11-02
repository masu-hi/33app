import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../assets/js/countdown_reminder.js", import.meta.url), "utf8")
  .replace(/import[\s\S]*?from\s+"[^"]+";/g, "")
  .replace(/export /g, "");
const fixture = () => {
  const store = new Map([["users/alice", { role: "user", name: "テスト", favorite_color: "青" }]]);
  let uid = "alice";
  let queue = Promise.resolve();
  let fail = false;
  const snapshot = (path) => ({
    exists: () => store.has(path),
    data: () => structuredClone(store.get(path)),
  });
  const api = vm.runInNewContext(
    `${source}\n({getCountdownReminders, japanDateKey, claimCountdownReminders, reminderMessage, reminderAction})`,
    {
      db: {},
      Intl,
      Date,
      auth: {
        get currentUser() {
          return uid ? { uid, email: `${uid}@example.com` } : null;
        },
      },
      sessionStorage: { getItem: () => uid },
      doc: (db, ...parts) => parts.join("/"),
      runTransaction: (db, callback) => {
        const result = queue.then(async () => {
          const writes = [];
          const value = await callback({
            get: async (path) => snapshot(path),
            set: (path, data) => writes.push([path, { ...store.get(path), ...data }]),
          });
          if (fail) throw new Error("network failure");
          writes.forEach(([path, value]) => store.set(path, structuredClone(value)));
          return value;
        });
        queue = result.catch(() => {});
        return result;
      },
    },
  );
  return {
    api,
    store,
    setUser: (id) => {
      uid = id;
    },
    fail: () => {
      fail = true;
    },
  };
};
const event = (date, id = "live") => ({ id, date, title: "デモライブ" });

test("1ヶ月前・7日前・3日前・前日・当日だけ対象にし、過去や通常日は表示しない", () => {
  const { api } = fixture();
  for (const date of ["2026-11-30", "2026-12-24", "2026-12-28", "2026-12-30", "2026-12-31"])
    assert.equal(api.getCountdownReminders([event("2026-12-31")], date).length, 1, date);
  for (const date of ["2026-12-02", "2026-12-29", "2027-01-01"])
    assert.equal(api.getCountdownReminders([event("2026-12-31")], date).length, 0, date);
  assert.equal(api.getCountdownReminders([event("invalid")], "2026-12-31").length, 0);
});

test("月末と閏年の1ヶ月前を正しく扱い、日本時間の日付で判定する", () => {
  const { api } = fixture();
  assert.equal(
    api.getCountdownReminders([event("2027-03-31")], "2027-02-28")[0].milestone,
    "あと1ヶ月！",
  );
  assert.equal(api.getCountdownReminders([event("2028-03-31")], "2028-02-29").length, 1);
  assert.equal(api.getCountdownReminders([event("2027-01-15")], "2026-12-15").length, 1);
  assert.equal(api.japanDateKey(new Date("2026-11-01T15:00:00Z")), "2026-11-02");
  assert.equal(api.japanDateKey(new Date("2026-11-01T14:59:59Z")), "2026-11-01");
});

test("複数イベントは一度にまとめて、近い日付から表示する", () => {
  const { api } = fixture();
  const result = api.getCountdownReminders(
    [event("2026-11-09", "week"), event("2026-11-02", "today"), event("2026-11-05", "three")],
    "2026-11-02",
  );
  assert.equal(
    JSON.stringify(result.map((item) => item.id)),
    JSON.stringify(["today", "three", "week"]),
  );
});

test("節目ごとのメッセージと、ライブ当日を含む注文による導線を切り替える", () => {
  const { api } = fixture();
  assert.equal(new Set([30, 7, 3, 1, 0].map(api.reminderMessage)).size, 5);
  const live = { date: "2026-11-09", days: 7 };
  const order = { arrivalDate: "2026-11-08", returnDate: "2026-11-11", status: "配送待ち" };
  assert.equal(api.reminderAction(live, [order]).href, "packing_checklist.html");
  for (const status of ["キャンセル", "返品完了"]) {
    assert.equal(api.reminderAction(live, [{ ...order, status }]).label, "レンタルする");
  }
  assert.equal(
    api.reminderAction(live, [{ ...order, cancelledAt: "2026-11-02" }]).label,
    "レンタルする",
  );
  assert.equal(
    api.reminderAction(live, [{ ...order, returnDate: "2026-11-08" }]).label,
    "レンタルする",
  );
  assert.equal(api.reminderAction(live, []).label, "レンタルする");
  assert.equal(api.reminderAction(live, null).label, "予定を確認する");
  assert.equal(api.reminderAction({ ...live, days: 30 }, []).label, "予定を確認する");
  for (const date of [order.arrivalDate, order.returnDate]) {
    assert.equal(api.reminderAction({ ...live, date }, [order]).href, "packing_checklist.html");
  }
});

test("同じ日の再ログイン・二端末での同時起動では一度だけ表示する", async () => {
  const { api, store } = fixture();
  store.set("users/alice/countdown/current", { events: [event("2026-11-09")] });
  const result = await Promise.all([
    api.claimCountdownReminders("alice", "2026-11-02"),
    api.claimCountdownReminders("alice", "2026-11-02"),
  ]);
  assert.equal(result.filter((items) => items.length).length, 1);
  assert.equal((await api.claimCountdownReminders("alice", "2026-11-02")).length, 0);
  assert.equal(store.get("users/alice").name, "テスト");
  assert.equal(store.get("users/alice").favorite_color, "青");
  assert.equal((await api.claimCountdownReminders("alice", "2026-11-06")).length, 1);
});

test("別アカウントや予定なしには表示せず、通信失敗時に表示済みを記録しない", async () => {
  const f = fixture();
  assert.equal((await f.api.claimCountdownReminders("alice", "2026-11-02")).length, 0);
  assert.equal(f.store.get("users/alice").countdownReminderDate, undefined);
  f.store.set("users/alice/countdown/current", { events: [event("2026-11-09")] });
  f.fail();
  await assert.rejects(f.api.claimCountdownReminders("alice", "2026-11-02"));
  assert.equal(f.store.get("users/alice").countdownReminderDate, undefined);
  f.setUser("bob");
  assert.equal((await f.api.claimCountdownReminders("alice", "2026-11-02")).length, 0);
  f.setUser(null);
  assert.equal((await f.api.claimCountdownReminders(undefined, "2026-11-02")).length, 0);
});
