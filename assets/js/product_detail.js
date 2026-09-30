document.addEventListener("DOMContentLoaded", () => {
  // ---------------------------------------------------------
  // 1. URLパラメータからの汎用商品データの読み込みと反映
  // ---------------------------------------------------------
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  if (productId && window.PRODUCTS && window.PRODUCTS[productId]) {
    const product = window.PRODUCTS[productId];

    // 商品名の更新
    const nameEl = document.querySelector("[data-product-detail-name]");
    if (nameEl && product.name) {
      nameEl.textContent = product.name;
    }

    // 価格の更新
    const priceEl = document.querySelector("[data-product-detail-price]");
    if (priceEl && product.price) {
      priceEl.textContent = product.price;
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
    const galleryImages = document.querySelectorAll("[data-product-gallery-image]");
    if (galleryImages.length > 0) {
      if (product.image) {
        galleryImages.forEach((img) => {
          img.src = product.image;
          img.alt = `${product.name || "商品"}の画像`;
        });
      } else if (Array.isArray(product.images) && product.images.length > 0) {
        galleryImages.forEach((img, index) => {
          const imgSrc = product.images[index] || product.images[0];
          img.src = imgSrc;
          img.alt = `${product.name || "商品"}の画像${index + 1}`;
        });
      }
    }

    // 選択項目（options）の動的生成
    const optionsContainer = document.querySelector("[data-product-options]");
    if (optionsContainer && product.options) {
      optionsContainer.innerHTML = "";

      const createOptionSelect = (groupTitle, optionsList, index) => {
        const group = document.createElement("div");
        group.className = "product_detail__option_group";

        const label = document.createElement("label");
        label.className = "product_detail__option_label";
        const selectId = `product-option-${index}`;
        label.htmlFor = selectId;
        label.textContent = groupTitle;

        const select = document.createElement("select");
        select.className = "product_detail__option_select";
        select.id = selectId;
        select.name = `option_${index}`;
        select.required = true;

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
            select.appendChild(optionEl);
          });
        }

        group.appendChild(label);
        group.appendChild(select);
        return group;
      };

      if (Array.isArray(product.options)) {
        product.options.forEach((opt, idx) => {
          if (typeof opt === "string") {
            const groupEl = createOptionSelect("オプション", [opt], idx);
            optionsContainer.appendChild(groupEl);
          } else if (typeof opt === "object" && opt !== null) {
            const title = opt.name || opt.label || opt.title || `選択項目${idx + 1}`;
            const list = opt.values || opt.options || opt.choices || opt.items || [];
            const groupEl = createOptionSelect(title, list, idx);
            optionsContainer.appendChild(groupEl);
          }
        });
      } else if (typeof product.options === "object" && product.options !== null) {
        Object.keys(product.options).forEach((key, idx) => {
          const list = Array.isArray(product.options[key])
            ? product.options[key]
            : [product.options[key]];
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

        const colorText = changeBtn
          .closest(".setbtn")
          ?.querySelector("[data-product-price]");

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
          black: "黒"
        };

        if (colorText) {
          colorText.textContent = colorNames[color];
        }

        // 色を選んだらハート一覧を閉じる
        colorOptions.classList.remove("active");
      });
    });
  });
});

// ---------------------------------------------------------
// 4. うちわの文章選択
// ---------------------------------------------------------
const textChangeBtns = document.querySelectorAll(".changebtn");

textChangeBtns.forEach((changeBtn) => {
  const textOptions = changeBtn
    .closest(".setbtn")
    ?.parentElement.querySelector(".text_options");

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

      const textDisplay = changeBtn
        .closest(".setbtn")
        ?.querySelector("[data-product-price]");

      if (textDisplay) {
        textDisplay.textContent = text;
      }

      // 選択したら閉じる
      textOptions.classList.remove("active");
    });
  });
});
