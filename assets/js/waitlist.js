(() => {
  const storageKey = "waitlistProducts";

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
    window.dispatchEvent(new CustomEvent("waitlist:updated", { detail: entries }));
  };

  const add = (entry) => {
    if (!entry?.productId) return false;

    const normalized = {
      productId: String(entry.productId),
      startDate: entry.startDate || "",
      endDate: entry.endDate || "",
      selectedOptions: entry.selectedOptions || {},
      createdAt: entry.createdAt || new Date().toISOString(),
    };
    const entries = getEntries();
    const duplicateIndex = entries.findIndex(
      (savedEntry) =>
        savedEntry.productId === normalized.productId &&
        savedEntry.startDate === normalized.startDate &&
        savedEntry.endDate === normalized.endDate,
    );

    if (duplicateIndex >= 0) entries.splice(duplicateIndex, 1);
    entries.unshift(normalized);
    saveEntries(entries);
    return true;
  };

  const remove = (index) => {
    const entries = getEntries();
    entries.splice(index, 1);
    saveEntries(entries);
  };

  window.WaitlistStore = { add, getAll: getEntries, remove };

  const list = document.querySelector("[data-waitlist-list]");
  const empty = document.querySelector("[data-waitlist-empty]");
  if (!list || !empty) return;

  const products = window.PRODUCTS || {};
  const overrides = JSON.parse(localStorage.getItem("productOverrides") || "{}");

  const render = () => {
    const entries = getEntries();
    list.replaceChildren();
    empty.hidden = entries.length > 0;

    entries.forEach((entry, index) => {
      const baseProduct = products[entry.productId] || {};
      const product = { ...baseProduct, ...overrides[entry.productId] };
      const article = document.createElement("article");
      const link = document.createElement("a");
      const image = document.createElement("img");
      const details = document.createElement("div");
      const name = document.createElement("h2");
      const period = document.createElement("p");
      const options = document.createElement("p");
      const removeButton = document.createElement("button");

      article.className = "waitlist_item";
      link.className = "waitlist_item__product";
      link.href = `product_detail.html?id=${encodeURIComponent(entry.productId)}`;
      image.src = product.images?.[0] || "assets/images/penlight.png";
      image.alt = "";
      name.textContent = product.name || entry.productId;
      period.textContent =
        entry.startDate && entry.endDate
          ? `希望期間：${entry.startDate}〜${entry.endDate}`
          : "希望期間：未指定";
      const selectedLabels = Object.values(entry.selectedOptions).filter(Boolean);
      options.textContent = selectedLabels.length ? selectedLabels.join(" / ") : "";
      options.hidden = selectedLabels.length === 0;
      removeButton.type = "button";
      removeButton.textContent = "削除";
      removeButton.addEventListener("click", () => {
        remove(index);
        render();
      });

      details.append(name, period, options);
      link.append(image, details);
      article.append(link, removeButton);
      list.append(article);
    });
  };

  render();
})();
