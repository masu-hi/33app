const adminOrderStorage = window.sharedAccountStorage;

(() => {
  const storageKey = "rentalOrders";
  const list = document.querySelector("[data-admin-orders]");
  const empty = document.querySelector("[data-admin-orders-empty]");
  const search = document.querySelector("[data-order-search]");
  const statuses = ["配送待ち", "配送中", "配送完了", "返品待ち", "返品完了", "キャンセル"];

  if (!list || !empty || !search) return;

  const getOrders = () => {
    try {
      const orders = JSON.parse(adminOrderStorage.getItem(storageKey) || "[]");
      return Array.isArray(orders) ? orders : [];
    } catch {
      return [];
    }
  };

  const saveOrders = (orders) => {
    adminOrderStorage.setItem(storageKey, JSON.stringify(orders));
  };

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
      statusSelect.addEventListener("change", () => {
        const updatedOrders = getOrders();
        const target = updatedOrders.find((savedOrder) => savedOrder.id === order.id);
        if (!target) return;
        const previousStatus = target.status || "配送待ち";
        target.status = statusSelect.value;
        if (statusSelect.value === "キャンセル" && previousStatus !== "キャンセル") {
          const restoredProductIds = window.restoreStockForOrder?.(target) || [];
          window.notifyAvailableWaitlist?.(restoredProductIds);
        } else if (previousStatus === "キャンセル" && statusSelect.value !== "キャンセル") {
          window.reduceStockForOrder?.(target);
        }
        saveOrders(updatedOrders);
        render();
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
  render();
})();
