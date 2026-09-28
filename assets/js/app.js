const cartCountElements = document.querySelectorAll("[data-cart-count]");
const savedCartCount = Number(localStorage.getItem("cartCount") || 0);
let favoriteColor = localStorage.getItem("favoriteColor");

if (sessionStorage.getItem("loginTransition") === "true") {
  sessionStorage.removeItem("loginTransition");
  document.body.classList.add("is_arriving");
}
const mainColors = {
  赤: "#f9e2e7",
  青: "#ecf1fb",
  ピンク: "#f6ecf8",
  紫: "#f3ecfa",
  緑: "#ecf7f0",
  黄色: "#fff9e8",
  オレンジ: "#fff1e6",
  水色: "#eaf7fb",
  白: "#f7f7f7",
  黒: "#ececf0",
};
const softColors = {
  赤: "#fff6f7",
  青: "#f7f9ff",
  ピンク: "#fdf6ff",
  紫: "#fbf7ff",
  緑: "#f5fcf7",
  黄色: "#fffdf5",
  オレンジ: "#fff9f4",
  水色: "#f4fcff",
  白: "#ffffff",
  黒: "#f7f7f9",
};
const gradientEndColors = {
  赤: "#eef0fa",
  青: "#f7eef9",
  ピンク: "#edeefa",
  紫: "#edf3fb",
  緑: "#eef1fa",
  黄色: "#f3effa",
  オレンジ: "#eef0fa",
  水色: "#f7effa",
  白: "#edeef8",
  黒: "#e5e7f1",
};

if (!favoriteColor) {
  const registrationData = JSON.parse(sessionStorage.getItem("registrationData") || "{}");
  favoriteColor = registrationData.favorite_color;

  if (favoriteColor) {
    localStorage.setItem("favoriteColor", favoriteColor);
  }
}

if (favoriteColor && mainColors[favoriteColor]) {
  document.documentElement.style.setProperty("--color-main", mainColors[favoriteColor]);
  document.documentElement.style.setProperty("--color-soft", softColors[favoriteColor]);
  document.documentElement.style.setProperty(
    "--color-gradient-end",
    gradientEndColors[favoriteColor],
  );
}

const currentPage = window.location.pathname.split("/").pop() || "home.html";

document.querySelectorAll("[data-nav-icon]").forEach((link) => {
  const pages = link.dataset.pages.split(",");
  const isCurrent = pages.includes(currentPage);
  const icon = link.querySelector("img");

  icon.src = isCurrent ? icon.dataset.filled : icon.dataset.outline;
  link.classList.toggle("is_current", isCurrent);

  if (isCurrent) {
    link.setAttribute("aria-current", "page");
  }
});

const accountNameElement = document.querySelector("[data-account-name]");

if (accountNameElement) {
  const registrationData = JSON.parse(sessionStorage.getItem("registrationData") || "{}");
  const accountName =
    sessionStorage.getItem("loggedInName") ||
    localStorage.getItem("accountName") ||
    registrationData.name ||
    "ゲスト";
  accountNameElement.textContent = accountName;

  if (!localStorage.getItem("accountName") && registrationData.name) {
    localStorage.setItem("accountName", registrationData.name);
  }
}

document.querySelector("[data-history-back]")?.addEventListener("click", () => {
  if (window.history.length > 1) {
    window.history.back();
    return;
  }

  window.location.href = "home.html";
});

document.querySelectorAll("[data-artist-select]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-artist-select]").forEach((item) => {
      item.setAttribute("aria-pressed", String(item === button));
    });

    const artist = button.textContent.trim();
    window.location.href = `search.html?artist=${encodeURIComponent(artist)}`;
  });
});

const resultsPage = document.querySelector("[data-results-page]");

if (resultsPage) {
  const params = new URLSearchParams(window.location.search);
  const categoryNames = {
    penlight: "ペンライト",
    fan: "うちわ",
    binoculars: "双眼鏡",
    bag: "バッグ",
    photo: "撮影セット",
  };
  const category = params.get("category");
  const searchTerm =
    params.get("artist") || params.get("keyword") || categoryNames[category] || "ペンライト";
  const itemName = params.get("artist")
    ? `${searchTerm} デモグッズ`
    : categoryNames[category] || searchTerm;
  const resultsTitle = document.querySelector("[data-results-title]");
  const resultsInput = document.querySelector("[data-results-input]");
  const resultList = document.querySelector(".result_list");
  const resultItems = [...document.querySelectorAll("[data-result-item]")];

  resultsTitle.textContent = searchTerm;
  document.title = `${searchTerm}の検索結果 | おしりーす`;
  resultsInput.placeholder = `${searchTerm}から検索`;

  document.querySelectorAll("[data-product-name]").forEach((name, index) => {
    const variants = [
      "シンプルタイプ",
      "スタンダード",
      "2点セット",
      "カラーバリエーション",
      "ライトタイプ",
      "ロングタイプ",
    ];
    name.textContent = `${itemName}（${variants[index]}）`;
  });

  document.querySelectorAll("[data-sort]").forEach((button) => {
    button.addEventListener("click", () => {
      const sort = button.dataset.sort;
      const sortedItems = [...resultItems].sort((itemA, itemB) => {
        if (sort === "low") return Number(itemA.dataset.price) - Number(itemB.dataset.price);
        if (sort === "high") return Number(itemB.dataset.price) - Number(itemA.dataset.price);
        if (sort === "new") return Number(itemB.dataset.order) - Number(itemA.dataset.order);
        return Number(itemA.dataset.order) - Number(itemB.dataset.order);
      });

      document.querySelectorAll("[data-sort]").forEach((item) => {
        item.classList.toggle("is_selected", item === button);
      });
      sortedItems.forEach((item) => resultList.append(item));
    });
  });
}

const updateCartCount = (count) => {
  localStorage.setItem("cartCount", String(count));
  cartCountElements.forEach((element) => {
    element.textContent = count;
  });
};

updateCartCount(savedCartCount);

const productGallery = document.querySelector("[data-product-gallery]");

if (productGallery) {
  const gallerySlides = [...productGallery.children];
  const galleryCount = document.querySelector("[data-gallery-count]");
  const previousGalleryButton = document.querySelector("[data-gallery-previous]");
  const nextGalleryButton = document.querySelector("[data-gallery-next]");
  const galleryControls = [previousGalleryButton, nextGalleryButton].filter(Boolean);
  let activeSlide = 0;
  let swipeStartX = null;

  const setGalleryControls = (visible) => {
    galleryControls.forEach((button) => {
      button.hidden = !visible;
    });
    productGallery.setAttribute("aria-expanded", String(visible));
  };

  const showSlide = (index) => {
    activeSlide = (index + gallerySlides.length) % gallerySlides.length;
    productGallery.style.transform = `translateX(-${activeSlide * 100}%)`;

    if (galleryCount) {
      galleryCount.textContent = `${activeSlide + 1} / ${gallerySlides.length}`;
    }
  };

  productGallery.addEventListener("pointerdown", (event) => {
    swipeStartX = event.clientX;
    productGallery.setPointerCapture(event.pointerId);
  });

  productGallery.addEventListener("pointerup", (event) => {
    if (swipeStartX === null) return;

    const swipeDistance = event.clientX - swipeStartX;
    swipeStartX = null;

    if (Math.abs(swipeDistance) < 35) {
      setGalleryControls(previousGalleryButton?.hidden);
      return;
    }

    showSlide(activeSlide + (swipeDistance < 0 ? 1 : -1));
  });

  productGallery.addEventListener("pointercancel", () => {
    swipeStartX = null;
  });

  productGallery.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      showSlide(activeSlide + 1);
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showSlide(activeSlide - 1);
    }
  });

  previousGalleryButton?.addEventListener("click", () => {
    showSlide(activeSlide - 1);
  });

  nextGalleryButton?.addEventListener("click", () => {
    showSlide(activeSlide + 1);
  });
}

document.querySelector("[data-add-cart]")?.addEventListener("click", () => {
  updateCartCount(1);
  window.location.href = "cart.html";
});

document.querySelector("[data-history-back]")?.addEventListener("click", () => {
  if (window.history.length > 1) {
    window.history.back();
    return;
  }

  window.location.href = "home.html";
});

document.querySelector("[data-show-reviews]")?.addEventListener("click", () => {
  window.alert("レビューは現在準備中です。\n評価 4.5 / 5.0");
});

document.querySelector(".product_detail__favorite")?.addEventListener("click", (event) => {
  const button = event.currentTarget;
  const isFavorite = button.getAttribute("aria-pressed") === "true";
  button.setAttribute("aria-pressed", String(!isFavorite));
  button.textContent = isFavorite ? "♡" : "♥";
  button.setAttribute("aria-label", isFavorite ? "お気に入りに追加" : "お気に入りから削除");
});

document.querySelector("[data-remove-cart]")?.addEventListener("click", (event) => {
  updateCartCount(0);
  event.currentTarget.closest(".cart_item")?.remove();
});

document.querySelector("[data-filter-button]")?.addEventListener("click", () => {
  const category = document.querySelector("[data-filter-category]").value;
  const color = document.querySelector('input[name="color"]:checked').value;
  let count = 0;

  document.querySelectorAll("[data-product]").forEach((product) => {
    const categoryMatches = category === "all" || product.dataset.category === category;
    const colorMatches = color === "all" || product.dataset.color === color;
    const visible = categoryMatches && colorMatches;
    product.hidden = !visible;
    count += visible ? 1 : 0;
  });

  document.querySelector("[data-result-count]").textContent = count;
});

document.querySelector("[data-checkout-form]")?.addEventListener("submit", (event) => {
  event.preventDefault();
  document.querySelector("[data-checkout-message]").textContent =
    "入力内容を確認しました。発表用デモのため、決済は実行されません。";
});
