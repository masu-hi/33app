import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { db } from "./firebase_config.js";
import { waitForUser } from "./firebase_user.js";
import { changeRentalOrder } from "./firebase_orders.js";

(async () => {
  let cloudOrders = [];
  const list = document.querySelector("[data-admin-orders]");
  const empty = document.querySelector("[data-admin-orders-empty]");
  const search = document.querySelector("[data-order-search]");
  const message = document.querySelector("[data-admin-orders-status]");
  const statuses = ["配送待ち", "配送中", "配送完了", "返品待ち", "返品完了", "キャンセル"];

  if (!list || !empty || !search) return;

  const getOrders = () => cloudOrders;

  const createField = (label, value) => {
    const row = document.createElement("div");
    const term = document.createElement("dt");
    const detail = document.createElement("dd");
    term.textContent = label;
    detail.textContent = value || "未登録";
    row.append(term, detail);
    return row;
  };

  const updateSummary = (orders) => {
    document.querySelector("[data-order-total]").textContent = String(orders.length);
    document.querySelector("[data-order-waiting]").textContent = String(
      orders.filter((order) => (order.status || "配送待ち") === "配送待ち").length,
    );
    document.querySelector("[data-order-returning]").textContent = String(
      orders.filter((order) => order.status === "返品待ち").length,
    );
  };

  const render = () => {
    const orders = getOrders();
    const keyword = search.value.trim().toLowerCase();
    const filteredOrders = orders.filter((order) => {
      const requestedStatus = new URLSearchParams(window.location.search).get("status");
      if (requestedStatus && order.status !== requestedStatus) return false;
      const customerName = order.customer?.name || "";
      return `${order.id} ${customerName}`.toLowerCase().includes(keyword);
    });

    list.replaceChildren();
    empty.hidden = filteredOrders.length > 0;
    updateSummary(orders);

    filteredOrders.forEach((order) => {
      const article = document.createElement("article");
      const heading = document.createElement("div");
      const headingText = document.createElement("div");
      const orderId = document.createElement("h2");
      const placedDate = document.createElement("p");
      const statusLabel = document.createElement("label");
      const statusSelect = document.createElement("select");
      const details = document.createElement("dl");
      const customer = order.customer || {};

      article.className = "admin_order";
      if (order.status === "キャンセル") article.classList.add("is_cancelled");
      heading.className = "admin_order__heading";
      orderId.textContent = order.id || "注文番号なし";
      placedDate.textContent = `受付日：${order.placedDate || "未登録"}`;
      statusLabel.textContent = "状況";
      statuses.forEach((status) => statusSelect.add(new Option(status, status)));
      statusSelect.value = order.status || "配送待ち";
      statusSelect.disabled = order.status === "キャンセル";
      statusSelect.addEventListener("change", async () => {
        statusSelect.disabled = true;
        message.textContent = "配送状況を保存しています。";
        try {
          if (statusSelect.value === "キャンセル") {
            await changeRentalOrder(order.id, "cancel");
          } else {
            await updateDoc(doc(db, "orders", order.id), {
              status: statusSelect.value,
              updatedAt: serverTimestamp(),
            });
          }
          message.textContent = "配送状況を保存しました。";
        } catch (error) {
          console.error("配送状況を保存できませんでした。", error);
          statusSelect.value = order.status;
          statusSelect.disabled = false;
          message.textContent = "保存できませんでした。もう一度お試しください。";
        }
      });

      statusLabel.append(statusSelect);
      headingText.append(orderId, placedDate);
      heading.append(headingText, statusLabel);
      details.append(
        createField("申込者", customer.name),
        createField("メール", customer.email),
        createField("電話番号", customer.phone),
        createField("配送先", order.address),
        createField("商品", `${order.product || "未登録"} × ${order.quantity || 1}`),
        createField("レンタル期間", order.period),
        createField("支払い方法", order.paymentName),
        createField(
          "合計金額",
          Number.isFinite(Number(order.total))
            ? `¥${Number(order.total).toLocaleString("ja-JP")}`
            : "未登録",
        ),
      );
      article.append(heading, details);
      if (order.status === "キャンセル") {
        const cancelledOverlay = document.createElement("div");
        cancelledOverlay.className = "admin_order__cancelled";
        cancelledOverlay.textContent = "キャンセルしました。";
        article.append(cancelledOverlay);
      }
      list.append(article);
    });
  };

  search.addEventListener("input", render);
  message.textContent = "申込みを読み込んでいます。";
  const user = await waitForUser();
  if (!user) return;
  const unsubscribe = onSnapshot(
    collection(db, "orders"),
    (snapshot) => {
      cloudOrders = snapshot.docs
        .map((item) => ({ ...item.data(), id: item.id }))
        .sort((a, b) => String(b.placedAt || "").localeCompare(String(a.placedAt || "")));
      message.textContent = "";
      render();
    },
    (error) => {
      console.error("申込みを読み込めませんでした。", error);
      message.textContent =
        "申込みを読み込めませんでした。管理者アカウントでログインし直してください。";
    },
  );
  window.addEventListener("pagehide", unsubscribe, { once: true });
})();
