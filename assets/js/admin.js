(() => {
  const products = window.PRODUCTS || {};
  const storageKey = "productOverrides";
  const productContainer = document.querySelector("[data-admin-products]");
  const empty = document.querySelector("[data-admin-empty]");
  const editor = document.querySelector("[data-admin-editor]");
  const form = document.querySelector("[data-admin-form]");
  const status = document.querySelector("[data-admin-status]");
  const search = document.querySelector("[data-admin-search]");
  const variantsContainer = document.querySelector("[data-admin-variants]");
  const inventoryTotal = document.querySelector("[data-admin-inventory-total]");
  const inventoryDate = document.querySelector("[data-admin-inventory-date]");
  const dailyInventory = document.querySelector("[data-admin-daily-inventory]");
  const bulkAmount = document.querySelector("[data-admin-bulk-amount]");
  const bulkAdd = document.querySelector("[data-admin-bulk-add]");

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

  const getVariantGroups = (product) => {
    const componentIds =
      product.id === "set"
        ? product.bundleComponents.map((component) => component.productId)
        : product.id === "fan"
          ? ["fan", "fan_case"]
          : [product.id];

    return [...new Set(componentIds)]
      .map((productId) => {
        const source = products[productId];
        if (!source?.variants?.length) return null;
        return {
          productId,
          label:
            productId === "fan"
              ? "うちわの文字"
              : productId === "fan_case"
                ? "うちわケースのカラー"
                : source.name,
          variants: source.variants,
        };
      })
      .filter(Boolean);
  };

  const getLocalDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const renderDailyInventory = () => {
    if (!inventoryDate || !dailyInventory) return;
    const dateKey = inventoryDate.value || getLocalDateKey(new Date());
    dailyInventory.replaceChildren();

    Object.values(products)
      .filter((product) => product.standalone !== false)
      .forEach((product) => {
        const article = document.createElement("article");
        const heading = document.createElement("div");
        const name = document.createElement("h3");
        const total = document.createElement("strong");
        const groups = document.createElement("div");
        const available = window.getProductAvailableStockForDate(product.id, dateKey);

        article.className = "admin_daily_item";
        heading.className = "admin_daily_item__heading";
        name.textContent = product.name;
        total.textContent = available > 0 ? `残り${available}点` : "在庫なし";
        total.className = available > 0 ? "is_available" : "is_unavailable";
        groups.className = "admin_daily_item__groups";

        getVariantGroups(product).forEach((group) => {
          const groupSection = document.createElement("section");
          const groupHeading = document.createElement("h4");
          const variantList = document.createElement("div");

          groupSection.className = "admin_daily_group";
          groupHeading.textContent = group.label;
          variantList.className = "admin_daily_group__list";

          group.variants.forEach((variant) => {
            const stock = window.getVariantStockForDate(group.productId, variant.id, dateKey);
            const row = document.createElement("div");
            const variantName = document.createElement("span");
            const stockLabel = document.createElement("strong");

            row.className = "admin_daily_group__row";
            variantName.textContent = variant.label;
            stockLabel.textContent = stock > 0 ? `${stock}点` : "在庫なし";
            stockLabel.classList.toggle("is_empty", stock < 1);
            row.append(variantName, stockLabel);
            variantList.append(row);
          });

          groupSection.append(groupHeading, variantList);
          groups.append(groupSection);
        });

        heading.append(name, total);
        article.append(heading, groups);
        dailyInventory.append(article);
      });
  };

  const updateInventoryTotal = () => {
    const total = [...variantsContainer.querySelectorAll("[data-variant-stock]")].reduce(
      (sum, input) => sum + Math.max(0, Number(input.value) || 0),
      0,
    );
    inventoryTotal.textContent = `${total}点`;
  };

  const renderVariants = (product) => {
    variantsContainer.replaceChildren();

    getVariantGroups(product).forEach((group) => {
      const section = document.createElement("section");
      const heading = document.createElement("h4");
      const list = document.createElement("div");

      section.className = "admin_inventory__group";
      heading.textContent = group.label;
      list.className = "admin_inventory__list";

      group.variants.forEach((variant) => {
        const row = document.createElement("div");
        const label = document.createElement("span");
        const controls = document.createElement("div");
        const decrease = document.createElement("button");
        const input = document.createElement("input");
        const increase = document.createElement("button");

        row.className = "admin_inventory__item";
        label.textContent = variant.label;
        controls.className = "admin_inventory__controls";
        decrease.type = "button";
        decrease.textContent = "−";
        decrease.setAttribute("aria-label", `${variant.label}の在庫を1減らす`);
        input.type = "number";
        input.min = "0";
        input.step = "1";
        input.required = true;
        input.value = String(window.getVariantStock(group.productId, variant));
        input.dataset.variantStock = "";
        input.dataset.productId = group.productId;
        input.dataset.variantId = variant.id;
        input.setAttribute("aria-label", `${variant.label}の在庫数`);
        increase.type = "button";
        increase.textContent = "＋";
        increase.setAttribute("aria-label", `${variant.label}の在庫を1増やす`);

        decrease.addEventListener("click", () => {
          input.value = String(Math.max(0, Number(input.value) - 1));
          updateInventoryTotal();
        });
        increase.addEventListener("click", () => {
          input.value = String(Math.max(0, Number(input.value) + 1));
          updateInventoryTotal();
        });
        input.addEventListener("input", updateInventoryTotal);

        controls.append(decrease, input, increase);
        row.append(label, controls);
        list.append(row);
      });

      section.append(heading, list);
      variantsContainer.append(section);
    });

    updateInventoryTotal();
  };

  const openEditor = (id) => {
    const product = getProduct(id);
    if (!product) return;
    form.elements.id.value = id;
    form.elements.name.value = product.name;
    form.elements.price.value = product.price;
    form.elements.isPublic.value = String(product.isPublic);
    form.elements.stockStatus.value = product.stockStatus;
    renderVariants(product);
    status.textContent = "";
    editor.hidden = false;
    form.elements.name.focus();
  };

  const render = () => {
    const keyword = search.value.trim().toLowerCase();
    const items = Object.keys(products)
      .map(getProduct)
      .filter((product) => product?.standalone !== false);
    const filteredItems = items.filter((product) => product.name.toLowerCase().includes(keyword));

    productContainer.replaceChildren();
    empty.hidden = items.length > 0;
    updateSummary(items);
    renderDailyInventory();

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
      const availableStock = window.getProductAvailableStock(product.id);
      stock.textContent =
        product.stockStatus === "available" ? `貸出可能（${availableStock}点）` : "貸出不可";
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
  inventoryDate.value = getLocalDateKey(new Date());
  inventoryDate.addEventListener("change", renderDailyInventory);
  bulkAdd.addEventListener("click", () => {
    const amount = Math.max(1, Number(bulkAmount.value) || 1);
    variantsContainer.querySelectorAll("[data-variant-stock]").forEach((input) => {
      input.value = String((Number(input.value) || 0) + amount);
    });
    updateInventoryTotal();
    status.textContent = `${amount}点ずつ追加しました。「変更を保存」を押すと反映されます。`;
  });
  document.querySelector("[data-admin-close]").addEventListener("click", () => {
    editor.hidden = true;
  });
  document.querySelector("[data-admin-reset]").addEventListener("click", () => {
    const id = form.elements.id.value;
    const overrides = getOverrides();
    delete overrides[id];
    saveOverrides(overrides);
    getVariantGroups(products[id]).forEach((group) => {
      group.variants.forEach((variant) => {
        window.setVariantStock(group.productId, variant.id, variant.stock ?? 3);
      });
    });
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
    const restockedProductIds = new Set();
    variantsContainer.querySelectorAll("[data-variant-stock]").forEach((input) => {
      const previousStock = window.getVariantStock(
        input.dataset.productId,
        input.dataset.variantId,
      );
      const nextStock = Math.max(0, Number(input.value) || 0);
      window.setVariantStock(input.dataset.productId, input.dataset.variantId, input.value);
      if (previousStock < 1 && nextStock > 0) restockedProductIds.add(input.dataset.productId);
    });
    if (restockedProductIds.size) {
      window.notifyAvailableWaitlist?.([...restockedProductIds]);
    }
    saveOverrides(overrides);
    status.textContent = "変更を保存しました。";
    render();
  });

  render();
})();
