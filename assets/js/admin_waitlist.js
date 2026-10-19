import {
  collection,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { db } from "./firebase_config.js";
import { waitForUser } from "./firebase_user.js";
import { loadFirebaseProducts } from "./firebase_products.js";
import { isCloudWaitlistAvailable, sendWaitlistNotification } from "./firebase_waitlist.js";

const list = document.querySelector("[data-admin-waitlist]");
const empty = document.querySelector("[data-admin-waitlist-empty]");
const status = document.querySelector("[data-admin-waitlist-status]");
let entries = [];
let days = {};
const subscriptions = [];
const bulk = document.querySelector("[data-admin-notify-all]");
let sendingAll = false;

const available = (entry) => isCloudWaitlistAvailable(entry, window.PRODUCTS || {}, days);
const render = () => {
  list.replaceChildren();
  empty.hidden = entries.length > 0;
  const requested = entries.filter((entry) => entry.notify !== false);
  document.querySelector("[data-waitlist-total]").textContent = String(entries.length);
  document.querySelector("[data-waitlist-pending]").textContent = String(
    requested.filter((entry) => !entry.notifiedAt).length,
  );
  document.querySelector("[data-waitlist-notified]").textContent = String(
    requested.filter((entry) => entry.notifiedAt).length,
  );
  bulk.disabled = sendingAll || !requested.some((entry) => !entry.notifiedAt && available(entry));
  entries.forEach((entry) => {
    const product = window.PRODUCTS?.[entry.productId] || {};
    const article = document.createElement("article");
    const details = document.createElement("div");
    const name = document.createElement("h2");
    const period = document.createElement("p");
    const options = document.createElement("p");
    const state = document.createElement("span");
    const button = document.createElement("button");
    article.className = "admin_waitlist_item";
    name.textContent = product.name || entry.productId;
    period.textContent = `希望期間：${entry.startDate}〜${entry.endDate} / ${entry.quantity || 1}点`;
    options.textContent = `選択内容：${
      Object.values(entry.selectedOptions || {})
        .filter(Boolean)
        .join(" / ") || "なし"
    }`;
    const ready = available(entry);
    state.textContent =
      entry.notify === false
        ? "通知不要"
        : entry.notifiedAt
          ? "通知済み"
          : ready
            ? "通知可能"
            : "空き待ち";
    state.className = entry.notifiedAt ? "is_notified" : "is_pending";
    button.type = "button";
    button.textContent = entry.notifiedAt ? "通知済み" : "通知する";
    button.disabled = entry.notify === false || Boolean(entry.notifiedAt) || !ready;
    button.addEventListener("click", async () => {
      button.disabled = true;
      status.textContent = "希望期間の在庫を確認しています。";
      try {
        const sent = await sendWaitlistNotification(entry.id);
        status.textContent = sent ? "空き待ち通知を送信しました。" : "この登録には通知済みです。";
      } catch (error) {
        status.textContent = error.code
          ? "通知を送信できませんでした。もう一度お試しください。"
          : error.message;
        button.disabled = false;
      }
    });
    details.append(name, period, options);
    article.append(details, state, button);
    list.append(article);
  });
};

bulk.addEventListener("click", async () => {
  if (sendingAll) return;
  sendingAll = true;
  const pending = entries.filter(
    (entry) => entry.notify !== false && !entry.notifiedAt && available(entry),
  );
  bulk.disabled = true;
  let sent = 0;
  let failed = 0;
  for (const entry of pending) {
    try {
      if (await sendWaitlistNotification(entry.id)) sent += 1;
    } catch {
      failed += 1;
    }
  }
  status.textContent = `${sent}件に通知しました。${failed ? ` ${failed}件は在庫状況をご確認ください。` : ""}`;
  sendingAll = false;
  render();
});

status.textContent = "空き待ちを読み込んでいます。";
if (await waitForUser()) {
  await loadFirebaseProducts();
  const onError = (error) => {
    console.error("空き待ちを読み込めませんでした。", error);
    status.textContent = "読み込めませんでした。管理者としてログインし直してください。";
  };
  subscriptions.push(
    onSnapshot(
      collection(db, "waitlists"),
      (snapshot) => {
        entries = snapshot.docs
          .map((item) => ({ ...item.data(), id: item.id }))
          .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
        if (status.textContent === "空き待ちを読み込んでいます。") status.textContent = "";
        render();
      },
      onError,
    ),
  );
  subscriptions.push(
    onSnapshot(
      collection(db, "inventoryDays"),
      (snapshot) => {
        days = Object.fromEntries(
          snapshot.docs.map((item) => [item.id, item.data().reservedCount]),
        );
        render();
      },
      onError,
    ),
  );
  subscriptions.push(
    onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        snapshot.docs.forEach((item) => {
          window.PRODUCTS[item.id] = {
            ...window.PRODUCTS[item.id],
            ...item.data(),
            id: item.id,
            isPublic: item.data().isPublished !== false,
          };
        });
        render();
      },
      onError,
    ),
  );
  for (const productId of Object.keys(window.PRODUCTS || {})) {
    subscriptions.push(
      onSnapshot(
        collection(db, "products", productId, "variants"),
        (snapshot) => {
          window.PRODUCTS[productId].variants = snapshot.docs.map((item) => ({
            id: item.id,
            label: item.data().label,
            stock: Number(item.data().totalStock || 0),
          }));
          render();
        },
        onError,
      ),
    );
  }
}
window.addEventListener("pagehide", (event) => {
  if (!event.persisted) subscriptions.forEach((unsubscribe) => unsubscribe());
});
