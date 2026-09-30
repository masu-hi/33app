(() => {
  const products = window.PRODUCTS || {};
  const storageKey = "productOverrides";
  const productContainer = document.querySelector("[data-admin-products]");
  const empty = document.querySelector("[data-admin-empty]");
  const editor = document.querySelector("[data-admin-editor]");
  const form = document.querySelector("[data-admin-form]");
  const status = document.querySelector("[data-admin-status]");
  const search = document.querySelector("[data-admin-search]");

  if (!productContainer || !empty || !editor || !form) return;

  const getOverrides = () => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "{}");
    } catch {
      return {};
    }
  };

  const saveOverrides = (overrides) => {
    localStorage.setItem(storageKey, JSON.stringify(overrides));
  };

  const getProduct = (id) => {
    const base = products[id];
    if (!base) return null;
    return {
      ...base,
      isPublic: base.isPublic ?? true,
      stockStatus: base.stockStatus || "available",
      ...getOverrides()[id],
    };
  };

  const updateSummary = (items) => {
    document.querySelector("[data-admin-total]").textContent = String(items.length);
    document.querySelector("[data-admin-public]").textContent = String(
      items.filter((product) => product.isPublic).length,
    );
    document.querySelector("[data-admin-available]").textContent = String(
      items.filter((product) => product.stockStatus === "available").length,
    );
  };

  const openEditor = (id) => {
    const product = getProduct(id);
    if (!product) return;
    form.elements.id.value = id;
    form.elements.name.value = product.name;
    form.elements.price.value = product.price;
    form.elements.isPublic.value = String(product.isPublic);
    form.elements.stockStatus.value = product.stockStatus;
    status.textContent = "";
    editor.hidden = false;
    form.elements.name.focus();
  };

  const render = () => {
    const keyword = search.value.trim().toLowerCase();
    const items = Object.keys(products).map(getProduct).filter(Boolean);
    const filteredItems = items.filter((product) => product.name.toLowerCase().includes(keyword));

    productContainer.replaceChildren();
    empty.hidden = items.length > 0;
    updateSummary(items);

    filteredItems.forEach((product) => {
      const row = document.createElement("article");
      const identity = document.createElement("div");
      const name = document.createElement("strong");
      const id = document.createElement("small");
      const price = document.createElement("span");
      const visibility = document.createElement("span");
      const stock = document.createElement("span");
      const editButton = document.createElement("button");

      row.className = "admin_product";
      name.textContent = product.name;
      id.textContent = product.id;
      price.textContent = `¥${Number(product.price).toLocaleString("ja-JP")}`;
      visibility.textContent = product.isPublic ? "公開" : "非公開";
      visibility.className = product.isPublic ? "is_public" : "is_private";
      stock.textContent = product.stockStatus === "available" ? "貸出可能" : "貸出不可";
      stock.className = product.stockStatus === "available" ? "is_available" : "is_unavailable";
      editButton.type = "button";
      editButton.textContent = "編集";
      editButton.addEventListener("click", () => openEditor(product.id));
      identity.append(name, id);
      row.append(identity, price, visibility, stock, editButton);
      productContainer.append(row);
    });
  };

  search.addEventListener("input", render);
  document.querySelector("[data-admin-close]").addEventListener("click", () => {
    editor.hidden = true;
  });
  document.querySelector("[data-admin-reset]").addEventListener("click", () => {
    const id = form.elements.id.value;
    const overrides = getOverrides();
    delete overrides[id];
    saveOverrides(overrides);
    editor.hidden = true;
    render();
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(form).entries());
    const overrides = getOverrides();
    overrides[values.id] = {
      name: values.name.trim(),
      price: Number(values.price),
      isPublic: values.isPublic === "true",
      stockStatus: values.stockStatus,
    };
    saveOverrides(overrides);
    status.textContent = "変更を保存しました。";
    render();
  });

  render();
})();
