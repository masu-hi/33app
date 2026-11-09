import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../assets/js/firebase_reviews.js", import.meta.url), "utf8")
  .replace(/import[\s\S]*?from\s+"[^"]+";/g, "")
  .replace(/export /g, "");
const fixture = () => {
  let user = { uid: "alice", isAnonymous: false };
  let fail = false;
  let listener;
  const saved = new Map();
  const api = vm.runInNewContext(`${source}\n({submitReview,subscribeReviews,reviewSummary})`, {
    db: {},
    Date,
    Intl,
    auth: {
      get currentUser() {
        return user;
      },
    },
    sessionStorage: { getItem: () => user?.uid },
    waitForUser: async () => user,
    doc: (db, ...parts) => parts.join("/"),
    collection: (db, name) => name,
    where: (...args) => args,
    query: (...args) => args,
    onSnapshot: (q, callback) => {
      listener = { q, callback };
      return () => {};
    },
    runTransaction: async (db, callback) => {
      const writes = [];
      const result = await callback({
        get: async (id) => ({ exists: () => saved.has(id), data: () => saved.get(id) }),
        set: (id, value) => writes.push([id, value]),
      });
      if (fail) throw new Error("network failure");
      writes.forEach(([id, value]) => saved.set(id, value));
      return result;
    },
  });
  return {
    api,
    saved,
    setUser: (value) => {
      user = value;
    },
    setFail: (value) => {
      fail = value;
    },
    listener: () => listener,
  };
};

test("本人と商品を関連付けて保存し、同じ送信の再試行を二重登録しない", async () => {
  const f = fixture();
  await f.api.submitReview("request-1", "bag", 4, "よかったです");
  await f.api.submitReview("request-1", "bag", 4, "よかったです");
  assert.equal(f.saved.size, 1);
  const review = f.saved.get("reviews/request-1");
  assert.equal(review.userId, "alice");
  assert.equal(review.productId, "bag");
  assert.equal(review.isPublished, true);
  await assert.rejects(f.api.submitReview("request-1", "penlight", 4, "よかったです"));
  f.setUser({ uid: "bob", isAnonymous: false });
  await assert.rejects(f.api.submitReview("request-1", "bag", 4, "よかったです"));
});

test("未ログイン・匿名・不正な入力を保存せず、通信失敗後も同じIDで再試行できる", async () => {
  const f = fixture();
  for (const [product, rating, text] of [
    ["bad", 5, "本文"],
    ["bag", 0, "本文"],
    ["bag", 1.5, "本文"],
    ["bag", 6, "本文"],
    ["bag", 5, " "],
    ["bag", 5, "長".repeat(301)],
  ]) {
    await assert.rejects(f.api.submitReview("req", product, rating, text));
  }
  f.setUser(null);
  await assert.rejects(f.api.submitReview("req", "bag", 5, "本文"));
  f.setUser({ uid: "alice", isAnonymous: true });
  await assert.rejects(f.api.submitReview("req", "bag", 5, "本文"));
  f.setUser({ uid: "alice", isAnonymous: false });
  f.setFail(true);
  await assert.rejects(f.api.submitReview("req", "bag", 5, "本文"));
  assert.equal(f.saved.size, 0);
  f.setFail(false);
  await f.api.submitReview("req", "bag", 5, "本文");
  assert.equal(f.saved.size, 1);
});

test("商品の公開レビューだけを購読し、未確定の書き込みを表示せずデモ5件と集計する", () => {
  const f = fixture();
  let result;
  f.api.subscribeReviews(
    "fan",
    (reviews) => {
      result = reviews;
    },
    () => {},
  );
  assert.equal(
    JSON.stringify(f.listener().q),
    JSON.stringify(["reviews", ["productId", "==", "fan"], ["isPublished", "==", true]]),
  );
  const docs = [
    { id: "old", data: () => ({ rating: 3, text: "前", createdAt: "2026-11-01" }) },
    {
      id: "new",
      data: () => ({ rating: 5, text: "<script>本文</script>", createdAt: "2026-11-09" }),
    },
  ];
  f.listener().callback({ docs, metadata: { hasPendingWrites: true } });
  assert.equal(result, undefined);
  f.listener().callback({ docs, metadata: { hasPendingWrites: false } });
  assert.equal(result[0].id, "new");
  const summary = f.api.reviewSummary(result);
  assert.equal(summary.count, 7);
  assert.equal(summary.average, 32 / 7);
});
