(() => {
  const storageKey = "waitlistProducts";
  const list = document.querySelector("[data-admin-waitlist]");
  const empty = document.querySelector("[data-admin-waitlist-empty]");
  const statusMessage = document.querySelector("[data-admin-waitlist-status]");
  const products = window.PRODUCTS || {};

  if (!list || !empty) return;

  const getEntries = () => {
    try {
      const entries = JSON.parse(localStorage.getItem(storageKey) || "[]");
      return Array.isArray(entries) ? entries : [];
    } catch {
      return [];
    }
  };

  const saveEntries = (entries) => {
    localStorage.setItem(storageKey, JSON.stringify(entries));
  };

  const render = () => {
    const entries = getEntries();
    const notifyEntries = entries.filter((entry) => entry.notify !== false);
    list.replaceChildren();
    empty.hidden = entries.length > 0;
    document.querySelector("[data-waitlist-total]").textContent = String(entries.length);
    document.querySelector("[data-waitlist-pending]").textContent = String(
      notifyEntries.filter((entry) => !entry.notifiedAt).length,
    );
    document.querySelector("[data-waitlist-notified]").textContent = String(
      notifyEntries.filter((entry) => entry.notifiedAt).length,
    );

    entries.forEach((entry, index) => {
      const product = products[entry.productId] || {};
      const article = document.createElement("article");
      const details = document.createElement("div");
      const name = document.createElement("h2");
      const period = document.createElement("p");
      const options = document.createElement("p");
      const state = document.createElement("span");
      const button = document.createElement("button");
      const selectedOptions = Object.values(entry.selectedOptions || {}).filter(Boolean);
      const wantsNotification = entry.notify !== false;
      const isAvailable = window.isWaitlistEntryAvailable?.(entry) ?? false;

      article.className = "admin_waitlist_item";
      name.textContent = product.name || entry.productId;
      period.textContent =
        entry.startDate && entry.endDate
          ? `希望期間：${entry.startDate}〜${entry.endDate}`
          : "希望期間：未指定";
      options.textContent = selectedOptions.length
        ? `選択内容：${selectedOptions.join(" / ")}`
        : "選択内容：なし";
      state.textContent = !wantsNotification
        ? "通知不要"
        : entry.notifiedAt
          ? "通知済み"
          : isAvailable
            ? "通知可能"
            : "入荷待ち";
      state.className = entry.notifiedAt ? "is_notified" : "is_pending";
      button.type = "button";
      button.textContent = entry.notifiedAt ? "通知済み" : "通知する";
      button.disabled = !wantsNotification || Boolean(entry.notifiedAt) || !isAvailable;
      button.addEventListener("click", () => {
        const sent = window.notifyAvailableWaitlist?.([entry.productId], [index]);
        statusMessage.textContent = sent
          ? `${product.name || entry.productId}の空き待ち通知を送信しました。`
          : "希望期間の在庫を確認できなかったため、通知できませんでした。";
        render();
      });

      details.append(name, period, options);
      article.append(details, state, button);
      list.append(article);
    });
  };

  window.notifyAvailableWaitlist?.(Object.keys(products));
  render();
})();
