import {
  collection,
  getDocs,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { db } from "./firebase_config.js";
import { waitForUser } from "./firebase_user.js";
import { reserveExistingRentalOrder } from "./firebase_orders.js";

const message = document.querySelector("[data-dashboard-status]");
const dateInput = document.querySelector("[data-dashboard-date]");
dateInput.value = new Date().toLocaleDateString("sv-SE");
let products = [];
let orderRecords = [];
const migrationButton = document.querySelector("[data-dashboard-migrate]");
let inventoryDays = {};
const subscriptions = [];
let productRevision = 0;

const addRow = (list, parts, href) => {
  const row = document.createElement("div");
  row.className = "admin_dashboard_row";
  for (const [index, text] of parts.entries()) {
    const element = document.createElement(index === 0 && href ? "a" : "span");
    if (index === 0 && href) element.href = href;
    element.textContent = text;
    row.append(element);
  }
  list.append(row);
};

const renderStock = () => {
  const list = document.querySelector("[data-dashboard-stock]");
  list.replaceChildren();
  let count = 0;
  for (const product of products) {
    if (product.isPublished === false || product.standalone === false) continue;
    for (const variant of product.variants) {
      const reserved = inventoryDays[`${product.id}__${variant.id}__${dateInput.value}`] || 0;
      const available = Math.max(0, Number(variant.totalStock || 0) - reserved);
      if (available > 1) continue;
      addRow(list, [product.name, variant.label, available ? "残り1点" : "在庫なし"], "admin.html");
      count += 1;
    }
  }
  document.querySelector("[data-dashboard-stock-empty]").hidden = count > 0;
};

dateInput.addEventListener("change", renderStock);
const user = await waitForUser();
if (user) {
  const error = (cause) => {
    console.error("管理データを読み込めませんでした。", cause);
    message.textContent = "データを読み込めませんでした。管理者としてログインし直してください。";
  };
  subscriptions.push(
    onSnapshot(
      collection(db, "orders"),
      (snapshot) => {
        const orders = snapshot.docs.map((item) => ({ ...item.data(), id: item.id }));
        orderRecords = orders;
        document.querySelectorAll("[data-dashboard-count]").forEach((item) => {
          item.textContent = String(
            item.dataset.dashboardCount === "all"
              ? orders.length
              : orders.filter((order) => order.status === item.dataset.dashboardCount).length,
          );
        });
        const list = document.querySelector("[data-dashboard-orders]");
        list.replaceChildren();
        orders
          .sort((a, b) => String(b.placedAt || "").localeCompare(String(a.placedAt || "")))
          .slice(0, 10)
          .forEach((order) => {
            addRow(
              list,
              [order.id, `${order.product} × ${order.quantity}`, order.status],
              "admin_orders.html",
            );
          });
        document.querySelector("[data-dashboard-orders-empty]").hidden = orders.length > 0;
        message.textContent = "";
      },
      error,
    ),
  );
  subscriptions.push(
    onSnapshot(
      collection(db, "products"),
      async (snapshot) => {
        const revision = ++productRevision;
        try {
          const loaded = await Promise.all(
            snapshot.docs.map(async (item) => {
              const variants = await getDocs(collection(db, "products", item.id, "variants"));
              return {
                ...item.data(),
                id: item.id,
                variants: variants.docs.map((variant) => ({ ...variant.data(), id: variant.id })),
              };
            }),
          );
          if (revision !== productRevision) return;
          products = loaded;
          loaded.forEach((product) => {
            window.PRODUCTS[product.id] = { ...window.PRODUCTS[product.id], ...product };
          });
          migrationButton.disabled = false;
          document.querySelector("[data-dashboard-products]").textContent = String(
            products.filter(
              (product) => product.isPublished !== false && product.standalone !== false,
            ).length,
          );
          renderStock();
        } catch (cause) {
          error(cause);
        }
      },
      error,
    ),
  );
  subscriptions.push(
    onSnapshot(
      collection(db, "inventoryDays"),
      (snapshot) => {
        inventoryDays = Object.fromEntries(
          snapshot.docs.map((item) => [item.id, item.data().reservedCount]),
        );
        renderStock();
      },
      error,
    ),
  );
}
migrationButton.addEventListener("click", async () => {
  migrationButton.disabled = true;
  const pending = orderRecords.filter(
    (order) => !order.inventoryReserved && !["キャンセル", "返品完了"].includes(order.status),
  );
  let updated = 0;
  let failed = 0;
  for (const order of pending) {
    try {
      await reserveExistingRentalOrder(order.id);
      updated += 1;
    } catch (error) {
      console.error("既存注文の在庫を反映できませんでした。", error);
      failed += 1;
    }
  }
  message.textContent = failed
    ? `${updated}件反映しました。${failed}件は在庫数または選択種類をご確認ください。`
    : `${updated}件の在庫を反映しました。`;
  migrationButton.disabled = false;
});
window.addEventListener("pagehide", (event) => {
  if (!event.persisted) subscriptions.forEach((unsubscribe) => unsubscribe());
});
