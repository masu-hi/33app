const NOTICE_READ_STORAGE_KEY = "readNoticeIds";
const DEFAULT_UNREAD_NOTICE_IDS = ["shipping-complete", "return-request"];

const getReadNoticeIds = () => {
  try {
    const savedIds = JSON.parse(localStorage.getItem(NOTICE_READ_STORAGE_KEY) || "[]");
    return Array.isArray(savedIds) ? savedIds : [];
  } catch {
    return [];
  }
};

const getUnreadNoticeCount = () => {
  const readIds = getReadNoticeIds();
  const dynamicIds = JSON.parse(localStorage.getItem("appNotifications") || "[]").map(
    (notice) => notice.id,
  );
  return [...DEFAULT_UNREAD_NOTICE_IDS, ...dynamicIds].filter((id) => !readIds.includes(id)).length;
};

const updateNoticeCount = () => {
  const unreadCount = getUnreadNoticeCount();
  document.querySelectorAll("[data-notice-count]").forEach((badge) => {
    badge.textContent = unreadCount;
    badge.hidden = unreadCount < 1;
  });
};

const markNoticeAsRead = (noticeId) => {
  const readIds = getReadNoticeIds();
  if (!noticeId || readIds.includes(noticeId)) return;

  localStorage.setItem(NOTICE_READ_STORAGE_KEY, JSON.stringify([...readIds, noticeId]));
  updateNoticeCount();
};

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

document.querySelectorAll('a[aria-label="通知"]').forEach((link) => {
  if (link.querySelector("[data-notice-count]")) return;

  const badge = document.createElement("span");
  badge.className = "app_header__notice_count";
  badge.dataset.noticeCount = "";
  badge.setAttribute("aria-label", "未読の通知数");
  link.append(badge);
});

document.querySelectorAll('a[aria-label="通知"]').forEach((link) => {
  link.href = "notice.html";
});

updateNoticeCount();

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
  ピンク: "#f6ecf8",
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
const gradientLineColors = {
  赤: "#cdd3ea",
  青: "#e0cde6",
  ピンク: "#cfd3ea",
  紫: "#cadced",
  緑: "#ced5e9",
  黄色: "#d9cfea",
  オレンジ: "#cdd3ea",
  水色: "#dfcee8",
  白: "#ced1e5",
  黒: "#c5c9dc",
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
  document.documentElement.style.setProperty("--color-gradient-line", gradientLineColors[color]);
  document.documentElement.style.setProperty("--color-line", lineColors[color]);
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
  document.documentElement.style.setProperty(
    "--color-gradient-line",
    gradientLineColors[favoriteColor],
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
        ...legacyAccount,
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

const contactForm = document.querySelector("[data-contact-form]");

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const status = contactForm.querySelector("[data-contact-status]");
  contactForm.reset();
  status.textContent = "お問い合わせを受け付けました。返信までしばらくお待ちください。";
});

document.querySelector("[data-history-back]")?.addEventListener("click", () => {
  if (window.history.length > 1) {
    window.history.back();
    return;
  }

  window.location.href = "home.html";
});

const popularSearchStorageKey = "popularSearchCounts";
const defaultPopularSearches = ["ペンライト", "双眼鏡", "うちわ", "バッグ", "セット"];
const categorySearchNames = {
  penlight: "ペンライト",
  fan: "うちわ",
  binoculars: "双眼鏡",
  bag: "バッグ",
  set: "セット",
};

const getPopularSearchCounts = () => {
  try {
    const counts = JSON.parse(localStorage.getItem(popularSearchStorageKey) || "{}");
    return counts && typeof counts === "object" ? counts : {};
  } catch {
    return {};
  }
};

const recordPopularSearch = (term) => {
  const normalizedTerm = String(term || "").trim();
  if (!normalizedTerm) return;
  const counts = getPopularSearchCounts();
  counts[normalizedTerm] = (Number(counts[normalizedTerm]) || 0) + 1;
  const trimmedCounts = Object.fromEntries(
    Object.entries(counts)
      .sort(([, countA], [, countB]) => Number(countB) - Number(countA))
      .slice(0, 30),
  );
  localStorage.setItem(popularSearchStorageKey, JSON.stringify(trimmedCounts));
};

document.querySelectorAll('form[action="search.html"]').forEach((form) => {
  form.addEventListener("submit", () => {
    recordPopularSearch(new FormData(form).get("keyword"));
  });
});

document.querySelectorAll('a[href^="search.html?"]').forEach((link) => {
  link.addEventListener("click", () => {
    const url = new URL(link.href, window.location.href);
    recordPopularSearch(
      url.searchParams.get("keyword") ||
        url.searchParams.get("artist") ||
        categorySearchNames[url.searchParams.get("category")],
    );
  });
});

const popularSearches = document.querySelector("[data-popular-searches]");

if (popularSearches) {
  const counts = getPopularSearchCounts();
  const terms = [...new Set([...defaultPopularSearches, ...Object.keys(counts)])]
    .sort((termA, termB) => {
      const countDifference = (Number(counts[termB]) || 0) - (Number(counts[termA]) || 0);
      if (countDifference) return countDifference;
      const indexA = defaultPopularSearches.indexOf(termA);
      const indexB = defaultPopularSearches.indexOf(termB);
      return (indexA < 0 ? 999 : indexA) - (indexB < 0 ? 999 : indexB);
    })
    .slice(0, 5);

  popularSearches.replaceChildren(
    ...terms.map((term) => {
      const link = document.createElement("a");
      link.href = `search.html?keyword=${encodeURIComponent(term)}`;
      link.textContent = term;
      link.addEventListener("click", () => recordPopularSearch(term));
      return link;
    }),
  );
}

document.querySelectorAll("[data-artist-select]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-artist-select]").forEach((item) => {
      item.setAttribute("aria-pressed", String(item === button));
    });

    const artist = button.textContent.trim();
    const artistId = button.dataset.artistId;
    recordPopularSearch(artist);
    const params = new URLSearchParams({ artist });
    if (artistId) params.set("artistId", artistId);
    window.location.href = `search.html?${params.toString()}`;
  });
});

const resultsPage = document.querySelector("[data-results-page]");

if (resultsPage) {
  const params = new URLSearchParams(window.location.search);
  const products = window.PRODUCTS || {};
  const categoryNames = {
    penlight: "ペンライト",
    fan: "ファンサうちわセット",
    binoculars: "双眼鏡",
    bag: "バッグ",
    set: "推し活セット",
  };
  const category = params.get("category");
  const artistName = params.get("artist");
  const requestedArtistId = params.get("artistId");
  const artistId =
    requestedArtistId ||
    window.ARTISTS?.find((artist) => artist.name.toLowerCase() === artistName?.toLowerCase())?.id;
  const searchTerm =
    artistName || params.get("keyword") || categoryNames[category] || "すべての商品";
  const resultsTitle = document.querySelector("[data-results-title]");
  const resultsInput = document.querySelector("[data-results-input]");
  const resultList = document.querySelector(".result_list");
  const normalizedKeyword = (params.get("keyword") || "").trim().toLowerCase();

  const displayProducts = Object.values(products)
    .filter((product) => product.standalone !== false)
    .map((product) => window.getProductData?.(product.id) || product)
    .filter((product) => product.isPublic !== false)
    .filter((product) => !category || product.category === category)
    .filter((product) => !artistName || (artistId && product.artistIds?.includes(artistId)))
    .filter((product) => {
      if (!normalizedKeyword) return true;
      return [product.name, categoryNames[product.category], ...(product.searchTags || [])]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedKeyword));
    });

  resultsTitle.textContent = searchTerm;
  document.title = `${searchTerm}の検索結果 | おしりーす`;
  resultsInput.placeholder = `${searchTerm}から検索`;
  resultList.replaceChildren();

  displayProducts.forEach((product, index) => {
    const article = document.createElement("article");
    const link = document.createElement("a");
    const image = document.createElement("img");
    const details = document.createElement("div");
    const name = document.createElement("h2");
    const price = document.createElement("p");
    const favoriteButton = document.createElement("button");

    article.className = "result_item";
    article.dataset.resultItem = "";
    article.dataset.price = String(product.price || 0);
    article.dataset.order = String(index + 1);
    link.className = "result_item__link";
    link.href = `product_detail.html?id=${encodeURIComponent(product.id)}`;
    image.src = product.images?.[0] || "assets/images/penlight.png";
    image.alt = `${product.name}の商品画像`;
    name.textContent = product.name;
    price.textContent = `¥${Number(product.price || 0).toLocaleString("ja-JP")} / ${product.rentalDays || 4}日間〜`;
    favoriteButton.className = "result_item__favorite";
    favoriteButton.type = "button";
    favoriteButton.dataset.favoriteId = product.id;
    favoriteButton.setAttribute("aria-label", "お気に入りに追加");
    favoriteButton.textContent = "♡";

    details.append(name, price);
    link.append(image, details);
    article.append(link, favoriteButton);
    resultList.append(article);
  });

  if (!displayProducts.length) {
    const empty = document.createElement("p");
    empty.className = "result_list__empty";
    empty.textContent = "条件に合う商品がありません。";
    resultList.append(empty);
  }
  resultList.hidden = false;

  const binocularFilter = document.querySelector("[data-binocular-filter]");

  if (category === "binoculars" || searchTerm === "双眼鏡") {
    binocularFilter.hidden = false;
    const selectedFilters = new Set();
    const filterOptions = [...document.querySelectorAll("[data-binocular-filter-option]")];

    const renderFilterOptions = () => {
      filterOptions.forEach((option) => {
        const filter = option.dataset.binocularFilterOption;
        const isSelected = selectedFilters.has(filter);
        option.setAttribute("aria-pressed", String(isSelected));
        option.textContent = `${filter}${isSelected ? "−" : "＋"}`;
        option.setAttribute(
          "aria-label",
          isSelected ? `${filter}の絞り込みを取り消す` : `${filter}で絞り込む`,
        );
      });
    };

    filterOptions.forEach((option) => {
      option.addEventListener("click", () => {
        const filter = option.dataset.binocularFilterOption;
        selectedFilters.has(filter) ? selectedFilters.delete(filter) : selectedFilters.add(filter);
        renderFilterOptions();
      });
    });
  }

  document.querySelectorAll("[data-sort]").forEach((button) => {
    button.addEventListener("click", () => {
      const sort = button.dataset.sort;
      const resultItems = [...resultList.querySelectorAll("[data-result-item]")];
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
  const gallerySlides = [...productGallery.children].filter((slide) => !slide.hidden);
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
let selectedWaitlistReservation = null;
let selectedProductQuantity = 1;

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
  let selectedReturnDateKey = "";
  const productParams = new URLSearchParams(window.location.search);
  const currentProductId = productParams.get("id") || productParams.get("category") || "penlight";
  const quantityOutput = document.querySelector("[data-product-quantity]");
  const quantityDecrease = document.querySelector("[data-product-quantity-decrease]");
  const quantityIncrease = document.querySelector("[data-product-quantity-increase]");
  const quantityProduct = window.PRODUCTS?.[currentProductId];
  const maximumVariantStock = (productId) =>
    Math.max(
      0,
      ...(window.PRODUCTS?.[productId]?.variants || []).map((variant) =>
        Number(window.getVariantPhysicalStock?.(productId, variant.id) || 0),
      ),
    );
  const selectableStock =
    currentProductId === "fan"
      ? Math.min(maximumVariantStock("fan"), maximumVariantStock("fan_case"))
      : quantityProduct?.inventoryMode === "shared"
        ? Number(window.getProductAvailableStock?.(currentProductId))
        : maximumVariantStock(currentProductId);
  const maximumQuantity = Math.max(
    1,
    selectableStock || 1,
  );

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

  const overlapsBookedPeriod = (arrivalDate) => {
    for (let dayOffset = 0; dayOffset < 4; dayOffset += 1) {
      const rentalDate = new Date(arrivalDate);
      rentalDate.setDate(rentalDate.getDate() + dayOffset);
      const dateKey = toDateKey(rentalDate);
      if (
        window.getProductAvailableStockForDate?.(currentProductId, dateKey) <
        selectedProductQuantity
      ) {
        return true;
      }
    }
    return false;
  };

  const isBlockedDate = (date) => date < today || date.getDay() === 0;

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
      const blocked = isBlockedDate(date);
      const waitlistOnly = !blocked && overlapsBookedPeriod(date);
      const button = document.createElement("button");

      button.type = "button";
      button.className = "rental_calendar__day";
      button.textContent = String(day);
      button.setAttribute("aria-label", `${year}年${month + 1}月${day}日`);
      const isSelectedPeriod =
        selectedDateKey && selectedDateKey <= dateKey && dateKey <= selectedReturnDateKey;
      button.setAttribute("aria-pressed", String(Boolean(isSelectedPeriod)));

      if (blocked || waitlistOnly) {
        button.classList.add("is_unavailable");
        button.disabled = blocked;
      }

      if (waitlistOnly) {
        button.classList.add("is_waitlist");
        button.setAttribute("aria-label", `${year}年${month + 1}月${day}日、空き待ち可能`);
      }

      if (isSelectedPeriod) {
        button.classList.add("is_selected");
      }

      button.addEventListener("click", () => {
        const returnDate = new Date(date);
        returnDate.setDate(returnDate.getDate() + 3);
        selectedDateKey = dateKey;
        selectedReturnDateKey = toDateKey(returnDate);
        const reservation = {
          arrivalDate: dateKey,
          returnDate: toDateKey(returnDate),
          nights: 3,
          days: 4,
          productId: currentProductId,
          product:
            document.querySelector("[data-product-detail-name]")?.textContent.trim() ||
            "ペンライト（シンプルタイプ）",
        };
        selectedReservation = waitlistOnly ? null : reservation;
        selectedWaitlistReservation = waitlistOnly ? reservation : null;
        selectedPeriod.textContent = `${formatDate(date)}～${formatDate(returnDate)}　3泊4日`;
        cartButton.disabled = false;
        cartButton.dataset.cartState = waitlistOnly ? "waitlist" : "ready";
        cartButton.classList.remove("is_added");
        cartButton.textContent = waitlistOnly ? "空き待ちリストに入れる" : "カートに入れる";
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

  const resetSelectedPeriod = () => {
    selectedReservation = null;
    selectedWaitlistReservation = null;
    selectedDateKey = "";
    selectedReturnDateKey = "";
    selectedPeriod.textContent = "商品が届く日を選択してください";
    cartButton.disabled = true;
    cartButton.dataset.cartState = "ready";
    cartButton.classList.remove("is_added");
    cartButton.textContent = "カートに入れる";
    renderCalendar();
  };

  const renderQuantity = () => {
    quantityOutput.textContent = String(selectedProductQuantity);
    quantityDecrease.disabled = selectedProductQuantity <= 1;
    quantityIncrease.disabled = selectedProductQuantity >= maximumQuantity;
  };

  quantityDecrease?.addEventListener("click", () => {
    if (selectedProductQuantity <= 1) return;
    selectedProductQuantity -= 1;
    renderQuantity();
    resetSelectedPeriod();
  });

  quantityIncrease?.addEventListener("click", () => {
    if (selectedProductQuantity >= maximumQuantity) return;
    selectedProductQuantity += 1;
    renderQuantity();
    resetSelectedPeriod();
  });

  renderQuantity();
  renderCalendar();
}

document.querySelector("[data-add-cart]")?.addEventListener("click", () => {
  const button = document.querySelector("[data-add-cart]");

  if (button.dataset.cartState === "waitlist-added") {
    window.location.href = "waitlist.html";
    return;
  }

  if (rentalCalendar && !selectedReservation && !selectedWaitlistReservation) return;

  if (button.dataset.cartState === "added") {
    window.location.href = "cart.html";
    return;
  }

  const optionSelects = [...document.querySelectorAll("[data-product-options] select")];
  const invalidOption = optionSelects.find((select) => !select.value);
  if (invalidOption) {
    invalidOption.reportValidity();
    return;
  }

  if (button.dataset.cartState === "waitlist") {
    const entries = JSON.parse(localStorage.getItem("waitlistProducts") || "[]");
    const selectedOptions = Object.fromEntries(
      optionSelects.map((select) => [
        select.previousElementSibling?.textContent.trim() || "オプション",
        select.options[select.selectedIndex]?.textContent || select.value,
      ]),
    );
    entries.unshift({
      productId: document.body.dataset.productId || selectedWaitlistReservation.productId,
      startDate: selectedWaitlistReservation.arrivalDate,
      endDate: selectedWaitlistReservation.returnDate,
      selectedOptions,
      quantity: selectedProductQuantity,
      notify: true,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("waitlistProducts", JSON.stringify(entries));
    button.dataset.cartState = "waitlist-added";
    button.classList.add("is_added");
    button.textContent = "空き待ちリストを見る";
    showToast("空き待ちリストに登録しました。");
    return;
  }

  if (selectedReservation) {
    const productId = document.body.dataset.productId || selectedReservation.productId;
    const product = window.getProductData?.(productId) || window.PRODUCTS?.[productId];
    selectedReservation.productId = productId;
    selectedReservation.quantity = selectedProductQuantity;
    selectedReservation.price = product?.price || 0;
    selectedReservation.image = product?.images?.[0] || "assets/images/penlight.png";
    selectedReservation.selectedOptions = optionSelects.map((select) => ({
      name: select.previousElementSibling?.textContent.trim() || "オプション",
      value: select.options[select.selectedIndex]?.textContent || select.value,
    }));
    selectedReservation.variantSelections = Object.fromEntries(
      optionSelects
        .map((select) => [
          select.dataset.sourceProductId,
          select.selectedOptions[0]?.dataset.variantId,
        ])
        .filter((selection) => selection[0] && selection[1]),
    );
    if (product?.variants?.length === 1 && !selectedReservation.variantSelections[productId]) {
      selectedReservation.variantSelections[productId] = product.variants[0].id;
    }
    product?.bundleComponents?.forEach((component) => {
      if (!selectedReservation.variantSelections[component.productId]) {
        selectedReservation.variantSelections[component.productId] = component.defaultVariant;
      }
    });
    localStorage.setItem("pendingReservation", JSON.stringify(selectedReservation));
  }

  updateCartCount(selectedProductQuantity);
  button.dataset.cartState = "added";
  button.classList.add("is_added");
  button.textContent = "カートを見る";
  showToast("カートに入れました。");
});

document.querySelector("[data-show-reviews]")?.addEventListener("click", () => {
  window.alert("レビューは現在準備中です。\n評価 4.5 / 5.0");
});

const savedFavorites = new Set(JSON.parse(localStorage.getItem("favoriteProducts") || "[]"));

const legacyFavoriteProducts = {
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

const dataFavoriteProducts = Object.fromEntries(
  Object.entries(window.PRODUCTS || {}).map(([productId, baseProduct]) => {
    const product = window.getProductData?.(productId) || baseProduct;
    return [
      productId,
      {
        name: product.name,
        price: `¥${Number(product.price || 0).toLocaleString("ja-JP")} / ${product.rentalDays || 4}日間〜`,
        image: product.images?.[0] || "assets/images/penlight.png",
      },
    ];
  }),
);
const favoriteProducts = { ...legacyFavoriteProducts, ...dataFavoriteProducts };

const recentlyViewedKey = "recentlyViewedProducts";
const productDetailPage = document.querySelector(".product_detail_page");

if (productDetailPage) {
  const productId =
    new URLSearchParams(window.location.search).get("id") ||
    new URLSearchParams(window.location.search).get("category") ||
    "penlight";
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
    badge.classList.toggle("is_visible", savedFavorites.size > 0);
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
    link.href = `product_detail.html?id=${encodeURIComponent(productId)}`;
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
  const pendingReservation = JSON.parse(localStorage.getItem("pendingReservation") || "{}");
  const cartProductData =
    window.getProductData?.(pendingReservation.productId || "penlight") ||
    window.PRODUCTS?.[pendingReservation.productId || "penlight"];
  const unitPrice = Number(cartProductData?.price ?? pendingReservation.price ?? 800);
  const roundTripShipping = 440;
  const product = document.querySelector("[data-cart-product]");
  const quantityElement = document.querySelector("[data-cart-quantity]");
  const itemCountElement = document.querySelector("[data-cart-item-count]");
  const totalElement = document.querySelector("[data-cart-total]");
  const summary = document.querySelector("[data-cart-summary]");
  const checkout = document.querySelector("[data-cart-checkout]");
  const emptyMessage = document.querySelector("[data-cart-empty]");
  let quantity = Number(localStorage.getItem("cartCount") || 0);

  product.querySelector("img").src =
    pendingReservation.image || cartProductData?.images?.[0] || "assets/images/penlight.png";
  product.querySelector("h2").textContent =
    pendingReservation.product || cartProductData?.name || "ペンライト";
  product.querySelector(".cart_product__details p").textContent =
    `¥${unitPrice.toLocaleString("ja-JP")} / ${cartProductData?.rentalDays || 4}日間〜`;

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
  const extensionOrderId = new URLSearchParams(window.location.search).get("extension");
  const paymentFees = { credit: 0, paypay: 0, deferred: 250, convenience: 220 };
  const paymentMethods = [...document.querySelectorAll("[data-payment-method]")];
  const cardFieldGroups = [...document.querySelectorAll("[data-card-fields]")];
  const paymentRadios = [...document.querySelectorAll('input[name="payment"]')];
  const cardRadios = [...document.querySelectorAll('input[name="credit_card"]')];

  if (extensionOrderId) {
    paymentPage.dataset.extensionOrderId = extensionOrderId;
    document.querySelector(".payment_page__header_title").textContent = "レンタル延長";
    document.querySelector(".payment_form h1").textContent = "延長料金の決済方法";
    document.querySelector(".mypage_header__back").href =
      `rental_extension.html?order=${encodeURIComponent(extensionOrderId)}`;
    document
      .querySelectorAll('[data-payment-method="deferred"], [data-payment-method="convenience"]')
      .forEach((method) => {
        method.hidden = true;
        method.querySelectorAll("input, select, button").forEach((control) => {
          control.disabled = true;
        });
      });
  }

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

const addDaysToStoredDate = (dateKey, days) => {
  const date = new Date(`${dateKey}T00:00:00`);
  date.setDate(date.getDate() + days);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

const canExtendRentalOrder = (order) => {
  if (!order?.returnDate || order.status === "キャンセル") return false;
  const nextDateKey = addDaysToStoredDate(order.returnDate, 1);
  const selections = Object.entries(order.variantSelections || order.bundleVariants || {});
  return selections.length
    ? selections.every(
        ([productId, variantId]) =>
          window.getVariantStockForDate?.(productId, variantId, nextDateKey) > 0,
      )
    : window.getProductAvailableStockForDate?.(order.productId, nextDateKey) > 0;
};

const createOrderId = () => {
  const now = new Date();
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const serial = String(now.getTime()).slice(-6);
  return `OSR-${date}-${serial}`;
};

const getOrderDraft = () => {
  const registration = JSON.parse(sessionStorage.getItem("registrationData") || "{}");
  const accountProfile = getActiveAccount()?.profile || {};
  const customer = { ...registration, ...accountProfile };
  const reservation = JSON.parse(localStorage.getItem("pendingReservation") || "{}");
  const currentProduct =
    window.getProductData?.(reservation.productId || "penlight") ||
    window.PRODUCTS?.[reservation.productId || "penlight"];
  const quantity = Math.max(1, Number(localStorage.getItem("cartCount") || 0));
  const payment = localStorage.getItem("selectedPaymentMethod") || "credit";
  const paymentFee = Number(localStorage.getItem("paymentFee") || 0);
  const subtotal = Number(currentProduct?.price ?? reservation.price ?? 800) * quantity;
  const shipping = 440;

  let orderId = localStorage.getItem("pendingOrderId");
  if (!orderId) {
    orderId = createOrderId();
    localStorage.setItem("pendingOrderId", orderId);
  }

  return {
    id: orderId,
    productId: reservation.productId || "penlight",
    product: currentProduct?.name || reservation.product || "ペンライト（シンプルタイプ）",
    image: currentProduct?.images?.[0] || reservation.image || "assets/images/penlight.png",
    selectedOptions: reservation.selectedOptions || [],
    variantSelections: reservation.variantSelections || {},
    quantity,
    subtotal,
    shipping,
    paymentFee,
    total: subtotal + shipping + paymentFee,
    payment,
    paymentName: paymentNames[payment],
    customer: {
      name: customer.name || "未登録",
      email: customer.email || activeAccountEmail || "未登録",
      phone: customer.phone || customer.tel || "未登録",
    },
    arrivalDate: reservation.arrivalDate || "",
    returnDate: reservation.returnDate || "",
    period:
      reservation.arrivalDate && reservation.returnDate
        ? `${formatStoredDate(reservation.arrivalDate)}〜${formatStoredDate(reservation.returnDate)}`
        : "3泊4日",
    address:
      [
        customer.postal_first && customer.postal_last
          ? `〒${customer.postal_first}-${customer.postal_last}`
          : "",
        customer.prefecture,
        customer.address,
        customer.building,
      ]
        .filter(Boolean)
        .join(" ") || "登録済みのお届け先",
  };
};

const extensionPage = document.querySelector("[data-extension-page]");

if (extensionPage) {
  const orderId = new URLSearchParams(window.location.search).get("order");
  const order = JSON.parse(localStorage.getItem("rentalOrders") || "[]").find(
    (item) => item.id === orderId,
  );
  const availableContent = document.querySelector("[data-extension-available]");
  const unavailableContent = document.querySelector("[data-extension-unavailable]");

  if (!order || !canExtendRentalOrder(order)) {
    availableContent.hidden = true;
    unavailableContent.hidden = false;
  } else {
    const nextReturnDate = addDaysToStoredDate(order.returnDate, 1);
    document.querySelector("[data-extension-order-id]").textContent = order.id;
    document.querySelector("[data-extension-product]").textContent = order.product;
    document.querySelector("[data-extension-current-period]").textContent = order.period;
    document.querySelector("[data-extension-new-period]").textContent =
      `${formatStoredDate(order.arrivalDate)}〜${formatStoredDate(nextReturnDate)}`;
    document.querySelector("[data-extension-payment]").href =
      `checkout.html?extension=${encodeURIComponent(order.id)}`;
  }
}

const orderConfirmPage = document.querySelector("[data-order-confirm]");

if (orderConfirmPage) {
  const extensionOrderId = new URLSearchParams(window.location.search).get("extension");
  const savedOrders = JSON.parse(localStorage.getItem("rentalOrders") || "[]");
  const extensionOrder = extensionOrderId
    ? savedOrders.find((order) => order.id === extensionOrderId)
    : null;
  const draft = extensionOrder
    ? {
        ...extensionOrder,
        subtotal: 440,
        shipping: 0,
        paymentFee: 0,
        total: 440,
        payment: localStorage.getItem("selectedPaymentMethod") || "credit",
        paymentName: paymentNames[localStorage.getItem("selectedPaymentMethod") || "credit"],
        period: `${formatStoredDate(extensionOrder.arrivalDate)}〜${formatStoredDate(
          addDaysToStoredDate(extensionOrder.returnDate, 1),
        )}`,
      }
    : getOrderDraft();

  if (extensionOrder) {
    document.title = "延長内容の確認 | おしりーす";
    document.querySelector(".order_page__header_title").textContent = "レンタル延長";
    document.querySelector(".order_confirm h1").textContent = "延長内容の確認";
    document.querySelector(".mypage_header__back").href =
      `checkout.html?extension=${encodeURIComponent(extensionOrder.id)}`;
    document.querySelector(".order_product h2").textContent = extensionOrder.product;
    document.querySelector(".order_product img").src =
      extensionOrder.image || "assets/images/penlight.png";
    document.querySelector(".order_product p").textContent = "延長料金 1日440円";
    document.querySelector("[data-order-shipping]").parentElement.hidden = true;
    document.querySelector("[data-place-order]").textContent = "延長を確定する";
  } else {
    document.querySelector(".order_product h2").textContent = draft.product;
    document.querySelector(".order_product img").src = draft.image;
    document.querySelector(".order_product p").textContent =
      `¥${Number(draft.subtotal / draft.quantity).toLocaleString("ja-JP")} / 3泊4日〜`;
  }

  document.querySelector("[data-order-id]").textContent = draft.id;
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
    if (extensionOrder) {
      const orders = JSON.parse(localStorage.getItem("rentalOrders") || "[]");
      const target = orders.find((order) => order.id === extensionOrder.id);
      if (!target || !canExtendRentalOrder(target)) {
        showToast("在庫状況が変わったため延長できませんでした。");
        return;
      }
      target.returnDate = addDaysToStoredDate(target.returnDate, 1);
      target.period = `${formatStoredDate(target.arrivalDate)}〜${formatStoredDate(target.returnDate)}`;
      target.extensionCount = (Number(target.extensionCount) || 0) + 1;
      target.extensionTotal = (Number(target.extensionTotal) || 0) + 440;
      target.lastExtensionPayment = draft.paymentName;
      localStorage.setItem("rentalOrders", JSON.stringify(orders));
      localStorage.setItem(
        "latestExtension",
        JSON.stringify({ ...target, total: 440, paymentName: draft.paymentName }),
      );
      window.location.href = `order_complete.html?extension=${encodeURIComponent(target.id)}`;
      return;
    }

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
    window.reduceStockForOrder?.(order);
    localStorage.setItem("latestOrder", JSON.stringify(order));
    localStorage.setItem("cartCount", "0");
    localStorage.removeItem("pendingReservation");
    localStorage.removeItem("pendingOrderId");
    window.location.href = "order_complete.html";
  });
}

const orderCompletePage = document.querySelector("[data-order-complete]");

if (orderCompletePage) {
  const extensionOrderId = new URLSearchParams(window.location.search).get("extension");
  const order = extensionOrderId
    ? JSON.parse(localStorage.getItem("latestExtension") || "null")
    : JSON.parse(localStorage.getItem("latestOrder") || "null") || getOrderDraft();
  if (!order) window.location.href = "rental_history.html";

  if (extensionOrderId) {
    document.title = "延長完了 | おしりーす";
    document.querySelector(".order_page__header_title").textContent = "レンタル延長";
    document.querySelector(".order_complete h1").textContent = "延長完了";
    document.querySelector(".order_complete__thanks").textContent = "レンタル期間を延長しました";
    document.querySelector(".order_complete__message").textContent =
      "延長手続きが完了しました。新しい返却期限までに商品をご返却ください。";
    const returnLink = document.querySelector(".order_page__primary");
    returnLink.href = "rental_history.html";
    returnLink.textContent = "レンタル履歴に戻る";
  }
  document.querySelector("[data-complete-id]").textContent = order.id;
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
  const activeOrders = orders.filter((order) => order.status !== "キャンセル");
  const list = document.querySelector("[data-rental-history-list]");
  const empty = document.querySelector("[data-rental-history-empty]");
  empty.hidden = activeOrders.length > 0;

  activeOrders.forEach((order) => {
    const article = document.createElement("article");
    const orderId = document.createElement("p");
    const status = document.createElement("p");
    const period = document.createElement("p");
    const product = document.createElement("div");
    const image = document.createElement("img");
    const details = document.createElement("div");
    const name = document.createElement("h2");
    const price = document.createElement("p");
    const extensionLink = document.createElement("a");
    const cancelLink = document.createElement("a");

    article.className = "rental_history_item";
    orderId.className = "rental_history_item__order_id";
    status.className = "rental_history_item__status";
    period.className = "rental_history_item__period";
    product.className = "rental_history_item__product";
    status.textContent = order.status;
    orderId.textContent = `注文番号：${order.id}`;
    period.textContent = `レンタル期間：${order.period}`;
    image.src = order.image || "assets/images/penlight.png";
    image.alt = "";
    name.textContent = `${order.product} × ${order.quantity}`;
    price.textContent = `合計 ¥${order.total.toLocaleString("ja-JP")}`;
    details.append(name, price);
    product.append(image, details);
    article.append(orderId, status, period, product);
    const canExtend = canExtendRentalOrder(order);

    if (canExtend) {
      extensionLink.href = `rental_extension.html?order=${encodeURIComponent(order.id)}`;
      extensionLink.textContent = "延長する";
    } else {
      extensionLink.setAttribute("aria-disabled", "true");
      extensionLink.textContent = "こちらの商品は延長できません";
    }
    extensionLink.className = "rental_history_item__extension";
    article.append(extensionLink);
    cancelLink.className = "rental_history_item__cancel";
    cancelLink.href = `cancellation_refund.html?order=${encodeURIComponent(order.id)}`;
    cancelLink.textContent = "キャンセルする";
    article.append(cancelLink);
    list.append(article);
  });
}

const cancellationConfirm = document.querySelector("[data-cancellation-confirm]");

if (cancellationConfirm) {
  const orderId = new URLSearchParams(window.location.search).get("order");
  const guide = document.querySelector("[data-cancellation-guide]");
  const prompt = document.querySelector("[data-cancellation-prompt]");
  const complete = document.querySelector("[data-cancellation-complete]");
  const confirmButton = document.querySelector("[data-confirm-cancellation]");

  if (orderId) {
    const orders = JSON.parse(localStorage.getItem("rentalOrders") || "[]");
    const order = orders.find((item) => item.id === orderId);

    if (order) {
      cancellationConfirm.hidden = false;
      guide.hidden = true;
      document.querySelector("[data-cancellation-order-id]").textContent = order.id;
      document.querySelector("[data-cancellation-product]").textContent =
        `${order.product} × ${order.quantity || 1}`;
      document.querySelector("[data-cancellation-period]").textContent = order.period;

      const showComplete = () => {
        prompt.hidden = true;
        complete.hidden = false;
      };

      if (order.status === "キャンセル") showComplete();

      confirmButton.addEventListener("click", () => {
        const savedOrders = JSON.parse(localStorage.getItem("rentalOrders") || "[]");
        const target = savedOrders.find((item) => item.id === orderId);
        if (!target) return;

        if (target.status !== "キャンセル") {
          target.status = "キャンセル";
          target.cancelledAt = new Date().toISOString();
          const restoredProductIds = window.restoreStockForOrder?.(target) || [];
          window.notifyAvailableWaitlist?.(restoredProductIds);
          localStorage.setItem("rentalOrders", JSON.stringify(savedOrders));
        }
        showComplete();
      });
    }
  }
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
    const extensionOrderId = paymentPage.dataset.extensionOrderId;
    window.location.href = extensionOrderId
      ? `order_confirm.html?extension=${encodeURIComponent(extensionOrderId)}`
      : "order_confirm.html";
    return;
  }

  document.querySelector("[data-checkout-message]").textContent =
    "入力内容を確認しました。発表用デモのため、決済は実行されません。";
});

const noticeTabs = document.querySelectorAll("[data-notice-tab]");
if (noticeTabs.length) {
  const emptyElement = document.querySelector("[data-notice-empty]");
  const noticeList = document.querySelector("[data-notice-list]");

  JSON.parse(localStorage.getItem("appNotifications") || "[]").forEach((notice) => {
    const item = document.createElement("li");
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    const title = document.createElement("h2");
    const body = document.createElement("p");

    item.className = "notice_item is_unread";
    item.dataset.category = "info";
    item.dataset.noticeId = notice.id;
    details.className = "notice_item__details";
    summary.className = "notice_item__summary";
    title.className = "notice_item__title";
    body.className = "notice_item__body";
    title.textContent = notice.title;
    body.textContent = notice.message;
    summary.append(title);
    details.append(summary, body);
    item.append(details);
    noticeList.prepend(item);
  });

  document.querySelectorAll("[data-notice-id]").forEach((item) => {
    const noticeId = item.dataset.noticeId;
    if (getReadNoticeIds().includes(noticeId)) {
      item.classList.remove("is_unread");
    }

    item.querySelector(".notice_item__details")?.addEventListener("toggle", (event) => {
      if (!event.currentTarget.open || !item.classList.contains("is_unread")) return;

      item.classList.remove("is_unread");
      markNoticeAsRead(noticeId);
    });
  });

  noticeTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      noticeTabs.forEach((t) => {
        t.classList.remove("is_active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is_active");
      tab.setAttribute("aria-selected", "true");

      const category = tab.dataset.noticeTab;
      let visibleCount = 0;
      document.querySelectorAll("[data-notice-list] .notice_item").forEach((item) => {
        const matches = category === "all" || item.dataset.category === category;
        item.hidden = !matches;
        if (matches) visibleCount += 1;
      });

      if (emptyElement) {
        emptyElement.hidden = visibleCount > 0;
      }
    });
  });
}
