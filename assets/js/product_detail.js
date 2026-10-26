(() => {
  // ---------------------------------------------------------
  // 1. URLパラメータからの汎用商品データの読み込みと反映
  // ---------------------------------------------------------
  const params = new URLSearchParams(window.location.search);
  const requestedProductId = params.get("id") || params.get("category") || "penlight";
  const productId =
    window.PRODUCTS?.[requestedProductId]?.standalone === false ? "fan" : requestedProductId;

  if (productId && window.PRODUCTS && window.PRODUCTS[productId]) {
    const product = window.getProductData?.(productId) || window.PRODUCTS[productId];

    document.title = `${product.name} | おしりーす`;
    document.body.dataset.productId = product.id || productId;

    // 商品名の更新
    const nameEl = document.querySelector("[data-product-detail-name]");
    if (nameEl && product.name) {
      nameEl.textContent = product.name;
    }

    // 価格の更新
    const priceEl = document.querySelector("[data-product-detail-price]");
    if (priceEl && Number.isFinite(product.price)) {
      const rentalDays = Number(product.rentalDays) || 4;
      priceEl.textContent = `¥${product.price.toLocaleString("ja-JP")} / ${rentalDays}日間〜`;
    }

    // 説明の更新
    const descEl = document.querySelector("[data-product-detail-description]");
    if (descEl && product.description) {
      descEl.textContent = product.description;
    }

    // お気に入りIDの更新
    const favBtn = document.querySelector("[data-favorite-id]");
    if (favBtn) {
      favBtn.dataset.favoriteId = product.id || productId;
    }

    // 画像の更新
    const galleryImages = [...document.querySelectorAll("[data-product-gallery-image]")];
    if (galleryImages.length > 0) {
      const images =
        Array.isArray(product.images) && product.images.length
          ? product.images
          : product.image
            ? [product.image]
            : [];

      galleryImages.forEach((img, index) => {
        const slide = img.closest(".product_detail__gallery_slide");
        const hasImage = Boolean(images[index]);
        slide.hidden = !hasImage;
        if (!hasImage) return;
        img.src = images[index];
        img.alt = `${product.name || "商品"}の画像${images.length > 1 ? index + 1 : ""}`;
      });

      const galleryCount = document.querySelector("[data-gallery-count]");
      if (galleryCount && images.length) galleryCount.textContent = `1 / ${images.length}`;
    }

    // 選択項目（options）の動的生成
    const optionsContainer = document.querySelector("[data-product-options]");
    let displayOptions = product.options;

    if (Array.isArray(product.bundleComponents)) {
      displayOptions = product.bundleComponents.flatMap((component) => {
        const componentProduct =
          window.getProductData?.(component.productId) || window.PRODUCTS[component.productId];
        return (componentProduct?.options || [])
          .filter(
            (option) => component.productId !== "fan" || !option.name?.includes("うちわケース"),
          )
          .map((option) => ({
            ...option,
            name: `${component.name}：${option.name}`,
            sourceProductId: component.productId,
            sourceVariants: componentProduct.variants,
          }));
      });
    } else if (product.id === "fan") {
      displayOptions = (product.options || []).map((option) => {
        if (!option.name?.includes("うちわケース")) return option;
        return {
          ...option,
          sourceProductId: "fan_case",
          sourceVariants: window.PRODUCTS.fan_case?.variants,
        };
      });
    }

    if (optionsContainer && displayOptions) {
      optionsContainer.innerHTML = "";

      const optionColors = {
        赤: "#e87678",
        青: "#769ee8",
        ピンク: "#e876de",
        水色: "#76d8e8",
        オレンジ: "#e8a476",
        紫: "#b88ae0",
        黄色: "#efd86a",
        緑: "#73bf8b",
        白: "#ffffff",
        黒: "#393a43",
      };

      const createOptionChoices = (group, label, select, kind) => {
        const choices = document.createElement("div");
        choices.className = `product_detail__option_choices product_detail__option_choices--${kind}`;
        choices.setAttribute("role", "radiogroup");
        choices.setAttribute("aria-labelledby", label.id);
        choices.setAttribute("aria-required", "true");
        const status = document.createElement("p");
        status.className = "product_detail__option_status";
        status.setAttribute("role", "status");
        status.hidden = true;
        select.hidden = true;
        select.tabIndex = -1;
        select.setAttribute("aria-hidden", "true");
        label.removeAttribute("for");
        const buttons = [];
        [...select.options]
          .filter((option) => option.value)
          .forEach((option) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = `product_detail__option_choice product_detail__option_choice--${kind}`;
            button.dataset.optionValue = option.value;
            button.setAttribute("role", "radio");
            button.setAttribute("aria-checked", "false");
            button.setAttribute("aria-label", option.textContent);
            button.title = option.textContent;
            button.disabled = option.disabled;
            button.tabIndex = -1;
            const text = document.createElement("span");
            text.textContent = option.dataset.label;
            if (kind === "color") {
              button.style.setProperty("--option-color", optionColors[option.dataset.label]);
              button.style.setProperty(
                "--option-stroke",
                option.dataset.label === "白" ? "#9da1b9" : optionColors[option.dataset.label],
              );
              const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
              icon.setAttribute("viewBox", "0 0 24 24");
              icon.setAttribute("aria-hidden", "true");
              const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
              use.setAttribute("href", "assets/images/option_heart.svg#heart-shape");
              icon.append(use);
              button.append(icon);
            }
            button.append(text);
            button.addEventListener("click", () => {
              select.value = option.value;
              select.dispatchEvent(new Event("change", { bubbles: true }));
            });
            buttons.push(button);
            choices.append(button);
          });
        const syncChoices = () => {
          const selected = buttons.find((button) => button.dataset.optionValue === select.value);
          const tabStop = selected || buttons.find((button) => !button.disabled);
          buttons.forEach((button) => {
            const checked = button === selected;
            button.setAttribute("aria-checked", String(checked));
            button.classList.toggle("is_selected", checked);
            button.tabIndex = button === tabStop ? 0 : -1;
          });
          status.hidden = true;
          choices.removeAttribute("aria-invalid");
        };
        select.addEventListener("change", syncChoices);
        select.addEventListener("invalid", (event) => {
          event.preventDefault();
          status.textContent = `${label.textContent}を選択してください。`;
          status.hidden = false;
          choices.setAttribute("aria-invalid", "true");
          buttons.find((button) => !button.disabled)?.focus();
        });
        choices.addEventListener("keydown", (event) => {
          if (
            !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)
          )
            return;
          const available = buttons.filter((button) => !button.disabled);
          const currentIndex = available.indexOf(event.target);
          if (currentIndex < 0) return;
          event.preventDefault();
          const direction = ["ArrowLeft", "ArrowUp"].includes(event.key) ? -1 : 1;
          const index =
            event.key === "Home"
              ? 0
              : event.key === "End"
                ? available.length - 1
                : (currentIndex + direction + available.length) % available.length;
          const next = available[index];
          next.click();
          next.focus({ preventScroll: true });
          next.scrollIntoView({ block: "nearest", inline: "nearest" });
        });
        syncChoices();
        group.append(choices, status);
      };

      const createOptionSelect = (groupTitle, optionsList, index, optionConfig = {}) => {
        const group = document.createElement("div");
        group.className = "product_detail__option_group";

        const label = document.createElement("label");
        label.className = "product_detail__option_label";
        const selectId = `product-option-${index}`;
        label.id = `${selectId}-label`;
        label.htmlFor = selectId;
        label.textContent = groupTitle;

        const select = document.createElement("select");
        select.className = "product_detail__option_select";
        select.id = selectId;
        select.name = `option_${index}`;
        select.required = true;
        select.dataset.sourceProductId = optionConfig.sourceProductId || product.id;

        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "選択してください";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        select.appendChild(defaultOption);

        if (Array.isArray(optionsList)) {
          optionsList.forEach((item) => {
            const optionEl = document.createElement("option");
            if (typeof item === "object" && item !== null) {
              optionEl.value = item.value || item.id || item.name || String(item);
              optionEl.textContent = item.label || item.name || item.text || String(item);
            } else {
              optionEl.value = String(item);
              optionEl.textContent = String(item);
            }
            optionEl.dataset.label = optionEl.textContent;

            const matchingVariant = (optionConfig.sourceVariants || product.variants)?.find(
              (variant) => variant.label === optionEl.textContent || variant.id === optionEl.value,
            );
            if (
              matchingVariant &&
              typeof window.getVariantPhysicalStock === "function" &&
              window.getVariantPhysicalStock(
                optionConfig.sourceProductId || product.id,
                matchingVariant.id,
              ) < 1
            ) {
              optionEl.disabled = true;
              optionEl.textContent += "（在庫なし）";
            }
            if (matchingVariant) optionEl.dataset.variantId = matchingVariant.id;
            select.appendChild(optionEl);
          });
        }

        group.appendChild(label);
        group.appendChild(select);
        const sourceId = select.dataset.sourceProductId;
        const isColor =
          ["bag", "fan_case"].includes(sourceId) &&
          [...select.options]
            .filter((option) => option.value)
            .every((option) => optionColors[option.dataset.label]);
        if (isColor || ["fan", "binoculars"].includes(sourceId)) {
          createOptionChoices(group, label, select, isColor ? "color" : "message");
        }
        return group;
      };

      if (Array.isArray(displayOptions)) {
        displayOptions.forEach((opt, idx) => {
          if (typeof opt === "string") {
            const groupEl = createOptionSelect("オプション", [opt], idx);
            optionsContainer.appendChild(groupEl);
          } else if (typeof opt === "object" && opt !== null) {
            const title = opt.name || opt.label || opt.title || `選択項目${idx + 1}`;
            const list = opt.values || opt.options || opt.choices || opt.items || [];
            const groupEl = createOptionSelect(title, list, idx, opt);
            optionsContainer.appendChild(groupEl);
          }
        });
      } else if (typeof displayOptions === "object" && displayOptions !== null) {
        Object.keys(displayOptions).forEach((key, idx) => {
          const list = Array.isArray(displayOptions[key])
            ? displayOptions[key]
            : [displayOptions[key]];
          const groupEl = createOptionSelect(key, list, idx);
          optionsContainer.appendChild(groupEl);
        });
      }
    }
  }

  // ---------------------------------------------------------
  // 2. set.html 用 アコーディオン & 選択切替イベント
  // ---------------------------------------------------------
  const accordionItems = document.querySelectorAll("[data-accordion-item]");

  accordionItems.forEach((item) => {
    const toggleBtn = item.querySelector("[data-accordion-toggle]");
    const content = item.querySelector("[data-accordion-content]");
    const detailLabel = item.querySelector("[data-selected-value]");

    if (toggleBtn && content) {
      toggleBtn.addEventListener("click", () => {
        const isExpanded = toggleBtn.getAttribute("aria-expanded") === "true";
        toggleBtn.setAttribute("aria-expanded", String(!isExpanded));
        content.hidden = isExpanded;
      });
    }

    // ハートボタン選択ハンドラー
    const heartBtns = item.querySelectorAll(".set_heart_button");
    heartBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        heartBtns.forEach((b) => b.classList.remove("is_selected"));
        btn.classList.add("is_selected");

        const val = btn.dataset.value || btn.getAttribute("aria-label");
        if (detailLabel && val) {
          detailLabel.textContent = val;
        }
      });
    });

    // ピルタグ選択ハンドラー
    const tagBtns = item.querySelectorAll(".set_tag_button");
    tagBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        tagBtns.forEach((b) => b.classList.remove("is_selected"));
        btn.classList.add("is_selected");

        const text = btn.textContent.trim();
        if (detailLabel && text) {
          detailLabel.textContent = text;
        }
      });
    });
  });

  // ---------------------------------------------------------
  // 3. 色変更ボタン & ハート選択
  // ---------------------------------------------------------
  const changeBtns = document.querySelectorAll(".changebtn");

  changeBtns.forEach((changeBtn) => {
    const colorOptions = changeBtn
      .closest(".setbtn")
      ?.parentElement.querySelector(".color_options");

    if (!colorOptions) return;

    changeBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      colorOptions.classList.toggle("active");
    });

    const colorHearts = colorOptions.querySelectorAll(".color_heart");

    colorHearts.forEach((heart) => {
      heart.addEventListener("click", (event) => {
        event.preventDefault();

        event.stopPropagation();
        const color = heart.dataset.color;

        const colorText = changeBtn.closest(".setbtn")?.querySelector("[data-product-price]");

        // 英語の色名を日本語に変換
        const colorNames = {
          red: "赤",
          pink: "ピンク",
          orange: "オレンジ",
          yellow: "黄色",
          green: "緑",
          blue: "青",
          purple: "紫",
          lightblue: "水色",
          white: "白",
          black: "黒",
        };

        if (colorText) {
          colorText.textContent = colorNames[color];
        }

        // 色を選んだらハート一覧を閉じる
        colorOptions.classList.remove("active");
      });
    });
  });
})();

// ---------------------------------------------------------
// 4. うちわの文章選択
// ---------------------------------------------------------
const textChangeBtns = document.querySelectorAll(".changebtn");

textChangeBtns.forEach((changeBtn) => {
  const textOptions = changeBtn.closest(".setbtn")?.parentElement.querySelector(".text_options");

  // 文章選択がない商品はスキップ
  if (!textOptions) return;

  // 「変更」を押す
  changeBtn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    textOptions.classList.toggle("active");
  });

  // 文章を選択
  const textBtns = textOptions.querySelectorAll(".text_option");

  textBtns.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      const text = btn.dataset.text;

      const textDisplay = changeBtn.closest(".setbtn")?.querySelector("[data-product-price]");

      if (textDisplay) {
        textDisplay.textContent = text;
      }

      // 選択したら閉じる
      textOptions.classList.remove("active");
    });
  });
});
