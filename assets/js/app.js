document
  .querySelectorAll('.app_header a[href="cart.html"], .mypage_header a[href="cart.html"]')
  .forEach((link) => {
    if (link.closest("[data-payment-page]") || link.querySelector("[data-cart-count]")) return;

    const badge = document.createElement("span");
    badge.className = "app_header__cart_count";
    badge.dataset.cartCount = "";
    badge.setAttribute("aria-label", "カート内の商品数");
    link.append(badge);
  });

const cartCountElements = document.querySelectorAll("[data-cart-count]");
const savedCartCount = Number(localStorage.getItem("cartCount") || 0);
const normalizeEmail = (email) =>
  String(email || "")
    .trim()
    .toLowerCase();
const getAccounts = () => JSON.parse(localStorage.getItem("accounts") || "{}");
const legacyAccount = JSON.parse(localStorage.getItem("registeredAccount") || "{}");
const activeAccountEmail = normalizeEmail(
  sessionStorage.getItem("activeAccountEmail") ||
    (sessionStorage.getItem("isLoggedIn") === "true" ? legacyAccount.email : ""),
);

if (activeAccountEmail && !getAccounts()[activeAccountEmail]) {
  const accounts = getAccounts();
  const legacyProfile = JSON.parse(localStorage.getItem("memberProfile") || "{}");
  accounts[activeAccountEmail] = {
    password: legacyAccount.password || "",
    profile: {
      ...legacyProfile,
      name: legacyAccount.name || legacyProfile.name,
      email: activeAccountEmail,
    },
  };
  localStorage.setItem("accounts", JSON.stringify(accounts));
  sessionStorage.setItem("activeAccountEmail", activeAccountEmail);
}

const getActiveAccount = () => getAccounts()[activeAccountEmail] || null;
const saveActiveAccount = (account) => {
  if (!activeAccountEmail) return;
  const accounts = getAccounts();
  accounts[activeAccountEmail] = account;
  localStorage.setItem("accounts", JSON.stringify(accounts));
};
let favoriteColor =
  getActiveAccount()?.profile?.favorite_color || localStorage.getItem("favoriteColor");

const showToast = (message) => {
  let toast = document.querySelector("[data-toast]");

  if (!toast) {
    toast = document.createElement("p");
    toast.className = "app_toast";
    toast.dataset.toast = "";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.append(toast);
  }

  window.clearTimeout(showToast.timeoutId);
  toast.textContent = message;
  toast.classList.remove("is_visible");
  window.requestAnimationFrame(() => toast.classList.add("is_visible"));
  showToast.timeoutId = window.setTimeout(() => {
    toast.classList.remove("is_visible");
  }, 2200);
};

if (sessionStorage.getItem("loginTransition") === "true") {
  sessionStorage.removeItem("loginTransition");
  document.body.classList.add("is_arriving");
}
const mainColors = {
  赤: "#f6cbd3",
  青: "#bfd2f5",
  ピンク: "#f4c9db",
  紫: "#dcc9f1",
  緑: "#c9eccf",
  黄色: "#fff0b8",
  オレンジ: "#ffd8bd",
  水色: "#c5ebf2",
  白: "#f7f7f7",
  黒: "#404148",
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
const lineColors = {
  赤: "#f2cbd4",
  青: "#ccd9f1",
  ピンク: "#ead5ee",
  紫: "#dfd1ef",
  緑: "#cfe6d8",
  黄色: "#eee2b7",
  オレンジ: "#efd5c1",
  水色: "#c8e5ed",
  白: "#dedee4",
  黒: "#d2d3dc",
};

const applyFavoriteColor = (color) => {
  if (!mainColors[color]) return;

  document.documentElement.style.setProperty("--color-main", mainColors[color]);
  document.documentElement.style.setProperty("--color-soft", softColors[color]);
  document.documentElement.style.setProperty("--color-gradient-end", gradientEndColors[color]);
  document.documentElement.classList.toggle("is-dark-favorite", color === "黒");
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
  document.documentElement.style.setProperty("--color-line", lineColors[favoriteColor]);
}

applyFavoriteColor(favoriteColor);

const favoriteColorButtons = document.querySelectorAll("[data-favorite-color]");

const updateFavoriteColorButtons = (color) => {
  favoriteColorButtons.forEach((button) => {
    const isSelected = button.dataset.favoriteColor === color;
    button.classList.toggle("is_selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
};

updateFavoriteColorButtons(favoriteColor);

favoriteColorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    favoriteColor = button.dataset.favoriteColor;
    const activeAccount = getActiveAccount();

    if (activeAccount) {
      saveActiveAccount({
        ...activeAccount,
        profile: { ...activeAccount.profile, favorite_color: favoriteColor },
      });
    }

    localStorage.setItem("favoriteColor", favoriteColor);
    applyFavoriteColor(favoriteColor);
    updateFavoriteColorButtons(favoriteColor);
  });
});

document.querySelectorAll("[data-guide-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    const content = document.getElementById(button.getAttribute("aria-controls"));
    const isExpanded = button.getAttribute("aria-expanded") === "true";

    button.setAttribute("aria-expanded", String(!isExpanded));
    content.hidden = isExpanded;
  });
});

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
  const accountName = getActiveAccount()?.profile?.name || "ゲスト";
  accountNameElement.textContent = accountName;
}

const rentalStatusCounts = document.querySelectorAll("[data-rental-status-count]");

if (rentalStatusCounts.length) {
  const orders = JSON.parse(localStorage.getItem("rentalOrders") || "[]");
  const counts = orders.reduce((result, order) => {
    const status = order.status || "配送待ち";
    result[status] = (result[status] || 0) + 1;
    return result;
  }, {});

  rentalStatusCounts.forEach((element) => {
    element.textContent = String(counts[element.dataset.rentalStatusCount] || 0);
  });
}

const memberInfo = document.querySelector("[data-member-info]");

if (memberInfo) {
  let profile = getActiveAccount()?.profile || {};
  const memberList = memberInfo.querySelector(".member_info__list");
  const editButton = memberInfo.querySelector("[data-member-edit]");
  const editForm = memberInfo.querySelector("[data-member-edit-form]");
  const memberIntro = memberInfo.querySelector("[data-member-intro]");

  const renderMemberInfo = () => {
    const memberValues = {
      ...profile,
      birthday: profile.birth_year
        ? `${profile.birth_year}年${profile.birth_month}月${profile.birth_day}日`
        : "未登録",
      postal: profile.postal_first ? `${profile.postal_first}-${profile.postal_last}` : "未登録",
      address: [profile.prefecture, profile.address].filter(Boolean).join(" "),
      building: profile.building || "なし",
    };

    memberInfo.querySelectorAll("[data-member-value]").forEach((element) => {
      element.textContent = memberValues[element.dataset.memberValue] || "未登録";
    });
  };

  const showEditForm = () => {
    Object.entries(profile).forEach(([name, value]) => {
      const field = editForm.elements.namedItem(name);
      if (field) field.value = value;
    });
    memberList.hidden = true;
    editButton.hidden = true;
    editForm.hidden = false;
    memberIntro.textContent = "登録されている会員情報を変更できます。";
  };

  renderMemberInfo();

  editButton.addEventListener("click", showEditForm);
  memberInfo.querySelector("[data-member-edit-cancel]").addEventListener("click", () => {
    editForm.hidden = true;
    memberList.hidden = false;
    editButton.hidden = false;
    memberIntro.textContent = "登録されている会員情報を確認できます。";
  });
  editForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const profileChanges = Object.fromEntries(new FormData(editForm).entries());
    const activeAccount = getActiveAccount();

    profile = { ...profile, ...profileChanges };
    profile.email = activeAccountEmail;
    saveActiveAccount({ ...activeAccount, profile });
    localStorage.setItem("memberProfile", JSON.stringify(profile));
    localStorage.setItem("accountName", profile.name);
    localStorage.setItem("favoriteColor", profile.favorite_color);
    localStorage.setItem(
      "registeredAccount",
      JSON.stringify({
        ...registeredAccount,
        name: profile.name,
        email: profile.email.toLowerCase(),
      }),
    );
    applyFavoriteColor(profile.favorite_color);
    renderMemberInfo();
    editForm.hidden = true;
    memberList.hidden = false;
    editButton.hidden = false;
    memberIntro.textContent = "登録されている会員情報を確認できます。";
  });
}

const passwordSettingForm = document.querySelector("[data-password-setting-form]");

passwordSettingForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(passwordSettingForm).entries());
  const status = passwordSettingForm.querySelector("[data-password-setting-status]");
  const activeAccount = getActiveAccount();

  if (!activeAccount || activeAccount.password !== values.current_password) {
    status.textContent = "現在のパスワードが正しくありません。";
    return;
  }

  if (values.new_password !== values.new_password_confirm) {
    status.textContent = "新しいパスワードと確認用パスワードが一致していません。";
    return;
  }

  saveActiveAccount({ ...activeAccount, password: values.new_password });
  passwordSettingForm.reset();
  status.textContent = "パスワードを変更しました。";
});

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
    element.hidden = count < 1;
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

const rentalCalendar = document.querySelector("[data-rental-calendar]");
let selectedReservation = null;

if (rentalCalendar) {
  const monthLabel = document.querySelector("[data-calendar-month]");
  const calendarDays = document.querySelector("[data-calendar-days]");
  const previousMonthButton = document.querySelector("[data-calendar-previous]");
  const nextMonthButton = document.querySelector("[data-calendar-next]");
  const selectedPeriod = document.querySelector("[data-selected-period]");
  const cartButton = document.querySelector("[data-add-cart]");
  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth() + 5, 1);
  let visibleMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  let selectedDateKey = "";

  today.setHours(0, 0, 0, 0);

  const toDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDate = (date) => {
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    return `${date.getMonth() + 1}月${date.getDate()}日(${weekdays[date.getDay()]})`;
  };

  const bookedDateKeys = new Set(
    [4, 9, 16].map((daysLater) => {
      const date = new Date(today);
      date.setDate(date.getDate() + daysLater);
      return toDateKey(date);
    }),
  );

  const isUnavailable = (date) =>
    date < today || date.getDay() === 0 || bookedDateKeys.has(toDateKey(date));

  const renderCalendar = () => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

    monthLabel.textContent = `${year}年${month + 1}月`;
    calendarDays.replaceChildren();
    previousMonthButton.disabled = isCurrentMonth;
    nextMonthButton.disabled = visibleMonth >= lastMonth;

    for (let index = 0; index < firstWeekday; index += 1) {
      const blank = document.createElement("span");
      blank.className = "rental_calendar__blank";
      blank.setAttribute("aria-hidden", "true");
      calendarDays.append(blank);
    }

    for (let day = 1; day <= lastDate; day += 1) {
      const date = new Date(year, month, day);
      const dateKey = toDateKey(date);
      const unavailable = isUnavailable(date);
      const button = document.createElement("button");

      button.type = "button";
      button.className = "rental_calendar__day";
      button.textContent = String(day);
      button.setAttribute("aria-label", `${year}年${month + 1}月${day}日`);
      button.setAttribute("aria-pressed", String(dateKey === selectedDateKey));

      if (unavailable) {
        button.classList.add("is_unavailable");
        button.disabled = true;
      }

      if (dateKey === selectedDateKey) {
        button.classList.add("is_selected");
      }

      button.addEventListener("click", () => {
        const returnDate = new Date(date);
        returnDate.setDate(returnDate.getDate() + 3);
        selectedDateKey = dateKey;
        selectedReservation = {
          arrivalDate: dateKey,
          returnDate: toDateKey(returnDate),
          nights: 3,
          days: 4,
          product: "ペンライト（シンプルタイプ）",
        };
        selectedPeriod.textContent = `${formatDate(date)}～${formatDate(returnDate)}　3泊4日`;
        cartButton.disabled = false;
        cartButton.dataset.cartState = "ready";
        cartButton.classList.remove("is_added");
        cartButton.textContent = "カートに入れる";
        renderCalendar();
      });

      calendarDays.append(button);
    }
  };

  previousMonthButton.addEventListener("click", () => {
    visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
    renderCalendar();
  });

  nextMonthButton.addEventListener("click", () => {
    visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
    renderCalendar();
  });

  renderCalendar();
}

document.querySelector("[data-add-cart]")?.addEventListener("click", () => {
  if (rentalCalendar && !selectedReservation) return;

  const button = document.querySelector("[data-add-cart]");

  if (button.dataset.cartState === "added") {
    window.location.href = "cart.html";
    return;
  }

  if (selectedReservation) {
    localStorage.setItem("pendingReservation", JSON.stringify(selectedReservation));
  }

  const currentCartCount = Number(localStorage.getItem("cartCount") || 0);
  updateCartCount(currentCartCount + 1);
  button.dataset.cartState = "added";
  button.classList.add("is_added");
  button.textContent = "カートを見る";
  showToast("カートに入れました。");
});

document.querySelector("[data-show-reviews]")?.addEventListener("click", () => {
  window.alert("レビューは現在準備中です。\n評価 4.5 / 5.0");
});

const savedFavorites = new Set(JSON.parse(localStorage.getItem("favoriteProducts") || "[]"));

const favoriteProducts = {
  "penlight-simple": {
    name: "ペンライト（シンプルタイプ）",
    price: "¥800 / 3泊4日〜",
    image: "assets/images/penlight.png",
  },
  "penlight-standard": {
    name: "ペンライト（スタンダード）",
    price: "¥1,800 / 3日〜",
    image: "assets/images/penlight.png",
  },
  "penlight-pair": {
    name: "ペンライト（2点セット）",
    price: "¥3,200 / 3日〜",
    image: "assets/images/penlight.png",
  },
  "penlight-color-change": {
    name: "ペンライト（カラーバリエーション）",
    price: "¥2,600 / 3日〜",
    image: "assets/images/penlight.png",
  },
  "penlight-light": {
    name: "ペンライト（ライトタイプ）",
    price: "¥1,500 / 3日〜",
    image: "assets/images/penlight.png",
  },
  "penlight-long": {
    name: "ペンライト（ロングタイプ）",
    price: "¥3,600 / 3日〜",
    image: "assets/images/penlight.png",
  },
};

const recentlyViewedKey = "recentlyViewedProducts";
const productDetailPage = document.querySelector(".product_detail_page");

if (productDetailPage) {
  const productId = new URLSearchParams(window.location.search).get("id") || "penlight-simple";
  const recentlyViewed = JSON.parse(localStorage.getItem(recentlyViewedKey) || "[]");
  const updatedRecentlyViewed = [
    productId,
    ...recentlyViewed.filter((savedProductId) => savedProductId !== productId),
  ].slice(0, 10);
  localStorage.setItem(recentlyViewedKey, JSON.stringify(updatedRecentlyViewed));
}

const recentlyViewedList = document.querySelector("[data-recently-viewed-list]");
const recentlyViewedEmpty = document.querySelector("[data-recently-viewed-empty]");

if (recentlyViewedList && recentlyViewedEmpty) {
  const recentlyViewed = JSON.parse(localStorage.getItem(recentlyViewedKey) || "[]").filter(
    (productId) => favoriteProducts[productId],
  );
  recentlyViewedEmpty.hidden = recentlyViewed.length > 0;

  recentlyViewed.forEach((productId) => {
    const product = favoriteProducts[productId];
    const article = document.createElement("article");
    const link = document.createElement("a");
    const image = document.createElement("img");
    const details = document.createElement("div");
    const name = document.createElement("h2");
    const price = document.createElement("p");

    article.className = "favorite_item";
    link.className = "favorite_item__link";
    link.href = `product_detail.html?id=${encodeURIComponent(productId)}`;
    image.src = product.image;
    image.alt = "";
    name.textContent = product.name;
    price.textContent = product.price;
    details.append(name, price);
    link.append(image, details);
    article.append(link);
    recentlyViewedList.append(article);
  });
}

const updateFavoriteCount = () => {
  document.querySelectorAll("[data-favorite-count]").forEach((badge) => {
    badge.textContent = savedFavorites.size;
    badge.hidden = savedFavorites.size < 1;
  });
};

const renderFavoritesPage = () => {
  const list = document.querySelector("[data-favorites-list]");
  const emptyMessage = document.querySelector("[data-favorites-empty]");

  if (!list || !emptyMessage) return;

  list.replaceChildren();
  emptyMessage.hidden = savedFavorites.size > 0;

  savedFavorites.forEach((productId) => {
    const product = favoriteProducts[productId];
    if (!product) return;

    const article = document.createElement("article");
    const link = document.createElement("a");
    const image = document.createElement("img");
    const details = document.createElement("div");
    const name = document.createElement("h2");
    const price = document.createElement("p");
    const favoriteButton = document.createElement("button");

    article.className = "favorite_item";
    link.className = "favorite_item__link";
    link.href = "product_detail.html";
    image.src = product.image;
    image.alt = "";
    name.textContent = product.name;
    price.textContent = product.price;
    favoriteButton.className = "favorite_item__remove";
    favoriteButton.type = "button";
    favoriteButton.dataset.favoriteId = productId;
    favoriteButton.setAttribute("aria-label", "お気に入りから削除");
    favoriteButton.textContent = "♥";

    details.append(name, price);
    link.append(image, details);
    article.append(link, favoriteButton);
    list.append(article);
  });
};

renderFavoritesPage();
updateFavoriteCount();

const favoriteButtons = document.querySelectorAll("[data-favorite-id]");

const updateFavoriteButton = (button, isFavorite) => {
  button.setAttribute("aria-pressed", String(isFavorite));
  button.classList.toggle("is_favorite", isFavorite);
  button.textContent = isFavorite ? "♥" : "♡";
  button.setAttribute("aria-label", isFavorite ? "お気に入りから削除" : "お気に入りに追加");
};

favoriteButtons.forEach((button) => {
  updateFavoriteButton(button, savedFavorites.has(button.dataset.favoriteId));
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-favorite-id]");
  if (!button) return;

  const productId = button.dataset.favoriteId;
  const isFavorite = !savedFavorites.has(productId);

  if (isFavorite) {
    savedFavorites.add(productId);
  } else {
    savedFavorites.delete(productId);
  }

  localStorage.setItem("favoriteProducts", JSON.stringify([...savedFavorites]));
  document.querySelectorAll(`[data-favorite-id="${productId}"]`).forEach((matchingButton) => {
    updateFavoriteButton(matchingButton, isFavorite);
  });
  renderFavoritesPage();
  updateFavoriteCount();
  showToast(isFavorite ? "お気に入りに保存しました。" : "お気に入りから削除しました。");
});

const cartPage = document.querySelector("[data-cart-page]");

if (cartPage) {
  const unitPrice = 800;
  const roundTripShipping = 440;
  const product = document.querySelector("[data-cart-product]");
  const quantityElement = document.querySelector("[data-cart-quantity]");
  const itemCountElement = document.querySelector("[data-cart-item-count]");
  const totalElement = document.querySelector("[data-cart-total]");
  const summary = document.querySelector("[data-cart-summary]");
  const checkout = document.querySelector("[data-cart-checkout]");
  const emptyMessage = document.querySelector("[data-cart-empty]");
  let quantity = Number(localStorage.getItem("cartCount") || 0);

  const renderCart = () => {
    const isEmpty = quantity < 1;
    quantityElement.textContent = quantity;
    itemCountElement.textContent = quantity;
    totalElement.textContent = `¥${(
      unitPrice * quantity +
      (isEmpty ? 0 : roundTripShipping)
    ).toLocaleString("ja-JP")}`;
    product.hidden = isEmpty;
    summary.hidden = isEmpty;
    emptyMessage.hidden = !isEmpty;
    checkout.classList.toggle("is_disabled", isEmpty);
    checkout.setAttribute("aria-disabled", String(isEmpty));
    checkout.tabIndex = isEmpty ? -1 : 0;
    updateCartCount(quantity);
  };

  document.querySelector("[data-cart-decrease]").addEventListener("click", () => {
    quantity = Math.max(0, quantity - 1);
    renderCart();
  });

  document.querySelector("[data-cart-increase]").addEventListener("click", () => {
    quantity += 1;
    renderCart();
  });

  document.querySelector("[data-remove-cart]").addEventListener("click", () => {
    quantity = 0;
    renderCart();
    showToast("カートから削除しました。");
  });

  checkout.addEventListener("click", (event) => {
    if (quantity < 1) event.preventDefault();
  });

  renderCart();
}

const paymentPage = document.querySelector("[data-payment-page]");

if (paymentPage) {
  const paymentFees = { credit: 0, paypay: 0, deferred: 250, convenience: 220 };
  const paymentMethods = [...document.querySelectorAll("[data-payment-method]")];
  const cardFieldGroups = [...document.querySelectorAll("[data-card-fields]")];
  const paymentRadios = [...document.querySelectorAll('input[name="payment"]')];
  const cardRadios = [...document.querySelectorAll('input[name="credit_card"]')];

  const setControlsEnabled = (container, enabled) => {
    container.querySelectorAll("input, select, button").forEach((control) => {
      control.disabled = !enabled;
    });
  };

  const updateCardFields = () => {
    const selectedCard =
      document.querySelector('input[name="credit_card"]:checked')?.value || "new";

    cardFieldGroups.forEach((group) => {
      const isActive = group.dataset.cardFields === selectedCard;
      group.hidden = !isActive;
      setControlsEnabled(group, isActive);

      group.querySelectorAll("input, select").forEach((control) => {
        if (control.type !== "checkbox") control.required = isActive;
      });
    });
  };

  const updatePaymentMethod = () => {
    const selectedPayment = document.querySelector('input[name="payment"]:checked')?.value;

    paymentMethods.forEach((method) => {
      const isActive = method.dataset.paymentMethod === selectedPayment;
      const panel = method.querySelector("[data-payment-panel]");
      method.classList.toggle("is_selected", isActive);
      panel.hidden = !isActive;
      setControlsEnabled(panel, isActive);
    });

    const storeInputs = document.querySelectorAll('input[name="store"]');
    storeInputs.forEach((input) => {
      input.required = selectedPayment === "convenience";
    });

    if (selectedPayment === "credit") updateCardFields();
    localStorage.setItem("selectedPaymentMethod", selectedPayment || "credit");
    localStorage.setItem("paymentFee", String(paymentFees[selectedPayment] || 0));
  };

  paymentRadios.forEach((radio) => radio.addEventListener("change", updatePaymentMethod));
  cardRadios.forEach((radio) => radio.addEventListener("change", updateCardFields));
  document.querySelector(".payment_balance_button")?.addEventListener("click", () => {
    showToast("PayPay残高を更新しました。");
  });
  updatePaymentMethod();
}

const paymentNames = {
  credit: "クレジットカード",
  paypay: "PayPay",
  deferred: "後払い",
  convenience: "コンビニ前払い",
};

const formatStoredDate = (dateKey) => {
  if (!dateKey) return "未選択";
  const [year, month, day] = dateKey.split("-").map(Number);
  return `${year}年${month}月${day}日`;
};

const getOrderDraft = () => {
  const registration = JSON.parse(sessionStorage.getItem("registrationData") || "{}");
  const reservation = JSON.parse(localStorage.getItem("pendingReservation") || "{}");
  const quantity = Math.max(1, Number(localStorage.getItem("cartCount") || 0));
  const payment = localStorage.getItem("selectedPaymentMethod") || "credit";
  const paymentFee = Number(localStorage.getItem("paymentFee") || 0);
  const subtotal = 800 * quantity;
  const shipping = 440;

  return {
    id: `order-${Date.now()}`,
    product: "ペンライト（シンプルタイプ）",
    quantity,
    subtotal,
    shipping,
    paymentFee,
    total: subtotal + shipping + paymentFee,
    payment,
    paymentName: paymentNames[payment],
    arrivalDate: reservation.arrivalDate || "",
    returnDate: reservation.returnDate || "",
    period:
      reservation.arrivalDate && reservation.returnDate
        ? `${formatStoredDate(reservation.arrivalDate)}〜${formatStoredDate(reservation.returnDate)}`
        : "3泊4日",
    address:
      [
        registration.postal_first && registration.postal_last
          ? `〒${registration.postal_first}-${registration.postal_last}`
          : "",
        registration.prefecture,
        registration.address,
        registration.building,
      ]
        .filter(Boolean)
        .join(" ") || "登録済みのお届け先",
  };
};

const orderConfirmPage = document.querySelector("[data-order-confirm]");

if (orderConfirmPage) {
  const draft = getOrderDraft();
  document.querySelector("[data-order-address]").textContent = draft.address;
  document.querySelector("[data-order-period]").textContent = draft.period;
  document.querySelector("[data-order-payment]").textContent = draft.paymentName;
  document.querySelector("[data-order-quantity]").textContent = draft.quantity;
  document.querySelector("[data-order-subtotal]").textContent =
    `¥${draft.subtotal.toLocaleString("ja-JP")}`;
  document.querySelector("[data-order-fee]").textContent =
    `¥${draft.paymentFee.toLocaleString("ja-JP")}`;
  document.querySelector("[data-order-fee-row]").hidden = draft.paymentFee === 0;
  document.querySelector("[data-order-total]").textContent =
    `¥${draft.total.toLocaleString("ja-JP")}`;

  document.querySelector("[data-place-order]").addEventListener("click", () => {
    const placedAt = new Date();
    const order = {
      ...draft,
      placedAt: placedAt.toISOString(),
      placedDate: `${placedAt.getFullYear()}年${placedAt.getMonth() + 1}月${placedAt.getDate()}日`,
      status: "配送待ち",
    };
    const orders = JSON.parse(localStorage.getItem("rentalOrders") || "[]");
    orders.unshift(order);
    localStorage.setItem("rentalOrders", JSON.stringify(orders));
    localStorage.setItem("latestOrder", JSON.stringify(order));
    localStorage.setItem("cartCount", "0");
    localStorage.removeItem("pendingReservation");
    window.location.href = "order_complete.html";
  });
}

const orderCompletePage = document.querySelector("[data-order-complete]");

if (orderCompletePage) {
  const order = JSON.parse(localStorage.getItem("latestOrder") || "null") || getOrderDraft();
  document.querySelector("[data-complete-date]").textContent = order.placedDate || "本日";
  document.querySelector("[data-complete-period]").textContent = order.period;
  document.querySelector("[data-complete-payment]").textContent = order.paymentName;
  document.querySelector("[data-complete-total]").textContent =
    `¥${order.total.toLocaleString("ja-JP")}`;
  updateCartCount(0);
}

const rentalHistoryPage = document.querySelector("[data-rental-history]");

if (rentalHistoryPage) {
  const orders = JSON.parse(localStorage.getItem("rentalOrders") || "[]");
  const list = document.querySelector("[data-rental-history-list]");
  const empty = document.querySelector("[data-rental-history-empty]");
  empty.hidden = orders.length > 0;

  orders.forEach((order) => {
    const article = document.createElement("article");
    const status = document.createElement("p");
    const period = document.createElement("p");
    const product = document.createElement("div");
    const image = document.createElement("img");
    const details = document.createElement("div");
    const name = document.createElement("h2");
    const price = document.createElement("p");

    article.className = "rental_history_item";
    status.className = "rental_history_item__status";
    period.className = "rental_history_item__period";
    product.className = "rental_history_item__product";
    status.textContent = order.status;
    period.textContent = `レンタル期間：${order.period}`;
    image.src = "assets/images/penlight.png";
    image.alt = "";
    name.textContent = `${order.product} × ${order.quantity}`;
    price.textContent = `合計 ¥${order.total.toLocaleString("ja-JP")}`;
    details.append(name, price);
    product.append(image, details);
    article.append(status, period, product);
    list.append(article);
  });
}

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
  if (paymentPage) {
    window.location.href = "order_confirm.html";
    return;
  }

  document.querySelector("[data-checkout-message]").textContent =
    "入力内容を確認しました。発表用デモのため、決済は実行されません。";
});
