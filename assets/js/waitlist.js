import {
  subscribeWaitlists,
  removeWaitlist,
  changeWaitlistNotification,
} from "./firebase_waitlist.js";

const list = document.querySelector("[data-waitlist-list]");
const empty = document.querySelector("[data-waitlist-empty]");
const status = document.querySelector("[data-waitlist-status]");
let entries = [];

const render = () => {
  list.replaceChildren();
  empty.hidden = entries.length > 0;
  entries.forEach((entry) => {
    const product =
      window.getProductData?.(entry.productId) || window.PRODUCTS?.[entry.productId] || {};
    const article = document.createElement("article");
    const link = document.createElement("a");
    const image = document.createElement("img");
    const details = document.createElement("div");
    const name = document.createElement("h2");
    const period = document.createElement("p");
    const options = document.createElement("p");
    const preference = document.createElement("label");
    const checkbox = document.createElement("input");
    const remove = document.createElement("button");
    article.className = "waitlist_item";
    link.className = "waitlist_item__product";
    link.href = `product_detail.html?id=${encodeURIComponent(entry.productId)}`;
    image.src = product.images?.[0] || "assets/images/penlight.png";
    image.alt = "";
    name.textContent = product.name || entry.productId;
    period.textContent = `希望期間：${entry.startDate}〜${entry.endDate} / ${entry.quantity}点`;
    options.textContent = Object.values(entry.selectedOptions || {})
      .filter(Boolean)
      .join(" / ");
    preference.className = "waitlist_item__preference";
    checkbox.type = "checkbox";
    checkbox.checked = entry.notify !== false;
    preference.append(
      checkbox,
      document.createTextNode(entry.notifiedAt ? "通知を受け取る（通知済み）" : "通知を受け取る"),
    );
    checkbox.addEventListener("change", async () => {
      checkbox.disabled = true;
      try {
        await changeWaitlistNotification(entry.id, checkbox.checked);
        status.textContent = "通知設定を保存しました。";
      } catch {
        checkbox.checked = entry.notify !== false;
        status.textContent = "通知設定を保存できませんでした。";
      } finally {
        checkbox.disabled = false;
      }
    });
    remove.type = "button";
    remove.textContent = "削除";
    remove.addEventListener("click", async () => {
      remove.disabled = true;
      try {
        await removeWaitlist(entry.id);
        status.textContent = "空き待ち登録を削除しました。";
      } catch {
        status.textContent = "削除できませんでした。もう一度お試しください。";
        remove.disabled = false;
      }
    });
    details.append(name, period, options);
    link.append(image, details);
    article.append(link, preference, remove);
    list.append(article);
  });
};
status.textContent = "空き待ちを読み込んでいます。";
try {
  const unsubscribe = await subscribeWaitlists(
    (loaded) => {
      entries = loaded;
      render();
      if (status.textContent === "空き待ちを読み込んでいます。") status.textContent = "";
    },
    () => {
      status.textContent = "空き待ちを読み込めませんでした。もう一度ログインしてください。";
    },
  );
  window.addEventListener("pagehide", (event) => {
    if (!event.persisted) unsubscribe();
  });
} catch (error) {
  status.textContent = error.message;
}
