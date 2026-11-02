const appStorage = window.userStorage;
let userStateError = null;
const userStateReady = import("./firebase_user_state.js")
  .then(async (api) => ((await api.initializeUserState()) ? api : null))
  .catch((error) => {
    userStateError = error;
    console.error("お気に入り・カートを読み込めませんでした。", error);
    showToast("保存内容を読み込めませんでした。ページを再読み込みしてください。");
    return null;
  });
const getUserState = async () => {
  const api = await userStateReady;
  if (userStateError) throw userStateError;
  return api;
};
window.addEventListener("user-state:error", () => {
  showToast("保存内容との通信が切れました。ページを再読み込みしてください。");
});

const NOTICE_READ_STORAGE_KEY = "readNoticeIds";
const DEFAULT_UNREAD_NOTICE_IDS = ["welcome", "return-request"];

const getReadNoticeIds = () => {
  try {
    const savedIds = JSON.parse(appStorage.getItem(NOTICE_READ_STORAGE_KEY) || "[]");
    return Array.isArray(savedIds) ? savedIds : [];
  } catch {
    return [];
  }
};

const getUnreadNoticeCount = () => {
  const readIds = getReadNoticeIds();
  const dynamicIds = JSON.parse(appStorage.getItem("appNotifications") || "[]")
    .filter((notice) => !notice.isRead)
    .map((notice) => notice.id);
  return new Set([
    ...DEFAULT_UNREAD_NOTICE_IDS.filter((id) => !readIds.includes(id)),
    ...dynamicIds,
  ]).size;
};

const updateNoticeCount = () => {
  const unreadCount = getUnreadNoticeCount();
  document.querySelectorAll("[data-notice-count]").forEach((badge) => {
    badge.textContent = unreadCount;
    badge.hidden = unreadCount < 1;
  });
};

const markNoticeAsRead = async (noticeId) => {
  const notices = JSON.parse(appStorage.getItem("appNotifications") || "[]");
  const dynamic = notices.find((notice) => notice.id === noticeId);
  if (dynamic) {
    const { markNotificationRead } = await import("./firebase_notifications.js");
    await markNotificationRead(noticeId);
    const latest = JSON.parse(appStorage.getItem("appNotifications") || "[]");
    const updated = latest.find((notice) => notice.id === noticeId);
    if (updated) updated.isRead = true;
    appStorage.setItem("appNotifications", JSON.stringify(latest));
    updateNoticeCount();
    return;
  }
  const readIds = getReadNoticeIds();
  if (!noticeId || readIds.includes(noticeId)) return;

  appStorage.setItem(NOTICE_READ_STORAGE_KEY, JSON.stringify([...readIds, noticeId]));
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
const savedCartCount = Number(appStorage.getItem("cartCount") || 0);
const normalizeEmail = (email) =>
  String(email || "")
    .trim()
    .toLowerCase();
const getAccounts = () => JSON.parse(appStorage.getItem("accounts") || "{}");
const legacyAccount = JSON.parse(appStorage.getItem("registeredAccount") || "{}");
let activeAccountEmail = normalizeEmail(
  sessionStorage.getItem("activeAccountEmail") ||
    (sessionStorage.getItem("isLoggedIn") === "true" ? legacyAccount.email : ""),
);

if (activeAccountEmail && !getAccounts()[activeAccountEmail]) {
  const accounts = getAccounts();
  const legacyProfile = JSON.parse(appStorage.getItem("memberProfile") || "{}");
  accounts[activeAccountEmail] = {
    password: legacyAccount.password || "",
    profile: {
      ...legacyProfile,
      name: legacyAccount.name || legacyProfile.name,
      email: activeAccountEmail,
    },
  };
  appStorage.setItem("accounts", JSON.stringify(accounts));
  sessionStorage.setItem("activeAccountEmail", activeAccountEmail);
}

const getActiveAccount = () => getAccounts()[activeAccountEmail] || null;
const saveActiveAccount = (account) => {
  if (!activeAccountEmail) return;
  const accounts = getAccounts();
  accounts[activeAccountEmail] = account;
  appStorage.setItem("accounts", JSON.stringify(accounts));
};
let favoriteColor =
  getActiveAccount()?.profile?.favorite_color || appStorage.getItem("favoriteColor");

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
  赤: "#eaf2ff",
  青: "#fff0f2",
  ピンク: "#eaf8fb",
  紫: "#fff2e8",
  緑: "#fff8df",
  黄色: "#edf8ef",
  オレンジ: "#f4efff",
  水色: "#fff0f7",
  白: "#4b4c55",
  黒: "#ffffff",
};
const gradientLineColors = {
  赤: "#adc3e8",
  青: "#e8b4bd",
  ピンク: "#acd8e2",
  紫: "#e8c09f",
  緑: "#e3cf8b",
  黄色: "#b4d8bd",
  オレンジ: "#c9b6e8",
  水色: "#e8b6cf",
  白: "#292a31",
  黒: "#d6d6dc",
};
const gradientTextColors = {
  赤: "#353b60",
  青: "#353b60",
  ピンク: "#353b60",
  紫: "#353b60",
  緑: "#353b60",
  黄色: "#353b60",
  オレンジ: "#353b60",
  水色: "#353b60",
  白: "#ffffff",
  黒: "#353b60",
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
  document.documentElement.style.setProperty("--color-gradient-text", gradientTextColors[color]);
  document.documentElement.style.setProperty("--color-line", lineColors[color]);
  document.documentElement.classList.toggle("is-dark-favorite", color === "黒");
};

if (!favoriteColor) {
  const registrationData = JSON.parse(sessionStorage.getItem("registrationData") || "{}");
  favoriteColor = registrationData.favorite_color;

  if (favoriteColor) {
    appStorage.setItem("favoriteColor", favoriteColor);
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
  document.documentElement.style.setProperty(
    "--color-gradient-text",
    gradientTextColors[favoriteColor],
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
  button.addEventListener("click", async () => {
    if (button.disabled) return;
    favoriteColorButtons.forEach((item) => {
      item.disabled = true;
    });
    const status = document.querySelector("[data-color-status]");
    if (status) status.textContent = "推しカラーを保存しています。";
    try {
      const api = await getUserState();
      if (!api) throw new Error("推しカラーを保存するにはログインしてください。");
      await api.saveProfile({ favorite_color: button.dataset.favoriteColor });
      if (status) status.textContent = "推しカラーを変更しました。";
      showToast("推しカラーを変更しました。");
    } catch (error) {
      const message = error.code
        ? "推しカラーを保存できませんでした。もう一度お試しください。"
        : error.message;
      if (status) status.textContent = message;
      else showToast(message);
    } finally {
      favoriteColorButtons.forEach((item) => {
        item.disabled = false;
      });
    }
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
  const accountName =
    getActiveAccount()?.profile?.name ||
    (sessionStorage.getItem("isLoggedIn") === "true" ? "会員様" : "ゲスト");
  accountNameElement.textContent = accountName;
}

window.addEventListener("profile:updated", () => {
  activeAccountEmail = normalizeEmail(sessionStorage.getItem("activeAccountEmail"));
  const profile = getActiveAccount()?.profile || {};
  favoriteColor = profile.favorite_color || "ピンク";
  applyFavoriteColor(favoriteColor);
  updateFavoriteColorButtons(favoriteColor);
  if (accountNameElement) accountNameElement.textContent = profile.name || "会員様";
});

const rentalStatusCounts = document.querySelectorAll("[data-rental-status-count]");

if (rentalStatusCounts.length) {
  const orders = JSON.parse(appStorage.getItem("rentalOrders") || "[]");
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
  let editBaseline = {};
  let savingProfile = false;
  const memberView = memberInfo.querySelector("[data-member-view]");
  const editButton = memberInfo.querySelector("[data-member-edit]");
  const editForm = memberInfo.querySelector("[data-member-edit-form]");
  const memberIntro = memberInfo.querySelector("[data-member-intro]");
  const formError = memberInfo.querySelector("[data-member-form-error]");

  const renderMemberInfo = () => {
    profile = getActiveAccount()?.profile || {};
    const memberValues = {
      ...profile,
      birthday: profile.birth_year
        ? `${profile.birth_year}年${profile.birth_month}月${profile.birth_day}日`
        : "未登録",
      postal: profile.postal_first ? `${profile.postal_first}-${profile.postal_last}` : "未登録",
      address: [profile.prefecture, profile.address].filter(Boolean).join(" "),
      building: profile.building || "なし",
      email: profile.email || activeAccountEmail || "未登録",
    };

    memberInfo.querySelectorAll("[data-member-value]").forEach((element) => {
      element.textContent = memberValues[element.dataset.memberValue] || "未登録";
    });
  };

  const showEditForm = () => {
    renderMemberInfo();
    editBaseline = { ...profile };
    editForm.reset();
    if (formError) formError.textContent = "";
    Object.entries(profile).forEach(([name, value]) => {
      const field = editForm.elements.namedItem(name);
      if (field) field.value = value;
    });
    window.setBirthdayFields?.(editForm, profile);
    if (memberView) memberView.hidden = true;
    editForm.hidden = false;
    memberIntro.textContent = "登録されている会員情報を変更できます。";
  };

  renderMemberInfo();
  window.addEventListener("profile:updated", renderMemberInfo);

  editButton?.addEventListener("click", showEditForm);
  memberInfo.querySelector("[data-member-edit-cancel]")?.addEventListener("click", () => {
    if (savingProfile) return;
    editForm.hidden = true;
    if (memberView) memberView.hidden = false;
    memberIntro.textContent = "登録されている会員情報を確認できます。";
  });

  const memberAddressSearchBtn = memberInfo.querySelector("[data-member-address-search]");
  if (memberAddressSearchBtn) {
    const memberPostalStatus = memberInfo.querySelector("[data-member-postal-status]");
    memberAddressSearchBtn.addEventListener("click", async () => {
      const first = editForm.elements.postal_first.value.replace(/\D/g, "");
      const last = editForm.elements.postal_last.value.replace(/\D/g, "");
      const zipcode = `${first}${last}`;

      if (!/^\d{7}$/.test(zipcode)) {
        if (memberPostalStatus)
          memberPostalStatus.textContent = "郵便番号を7桁で入力してください。";
        return;
      }

      memberAddressSearchBtn.disabled = true;
      if (memberPostalStatus) memberPostalStatus.textContent = "住所を検索しています。";

      try {
        const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zipcode}`);
        if (!response.ok) throw new Error("request failed");
        const data = await response.json();
        const result = data.results?.[0];

        if (!result) {
          if (memberPostalStatus)
            memberPostalStatus.textContent = "該当する住所が見つかりませんでした。";
          return;
        }

        editForm.elements.prefecture.value = result.address1;
        editForm.elements.address.value = `${result.address2}${result.address3}`;
        if (memberPostalStatus)
          memberPostalStatus.textContent = "住所を入力しました。番地以降を確認してください。";
        editForm.elements.address.focus();
      } catch {
        if (memberPostalStatus)
          memberPostalStatus.textContent =
            "住所を検索できませんでした。通信環境を確認して再度お試しください。";
      } finally {
        memberAddressSearchBtn.disabled = false;
      }
    });
  }

  editForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (savingProfile || !editForm.reportValidity()) return;
    if (formError) formError.textContent = "";

    const formData = new FormData(editForm);
    const values = Object.fromEntries(formData.entries());
    const changes = Object.fromEntries(
      Object.entries(values).filter(
        ([key, value]) =>
          key !== "email" && String(value).trim() !== String(editBaseline[key] ?? "").trim(),
      ),
    );
    const submitButton = editForm.querySelector('[type="submit"]');
    savingProfile = true;
    editForm.setAttribute("aria-busy", "true");
    const controls = [...editForm.querySelectorAll("input, select, button")];
    controls.forEach((control) => {
      control.disabled = true;
    });
    const originalLabel = submitButton.textContent;
    submitButton.textContent = "保存しています…";
    try {
      const api = await getUserState();
      if (!api) throw new Error("会員情報を変更するにはログインしてください。");
      await api.saveProfile(changes, editBaseline);
      renderMemberInfo();
      editForm.hidden = true;
      if (memberView) memberView.hidden = false;
      memberIntro.textContent = "登録されている会員情報を確認できます。";
      showToast("会員情報を更新しました。");
    } catch (error) {
      if (formError)
        formError.textContent =
          error.code && error.code !== "profile/conflict"
            ? "保存できませんでした。通信環境を確認して、もう一度お試しください。"
            : error.message;
    } finally {
      savingProfile = false;
      controls.forEach((control) => {
        control.disabled = false;
      });
      editForm.removeAttribute("aria-busy");
      submitButton.textContent = originalLabel;
    }
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
    const counts = JSON.parse(appStorage.getItem(popularSearchStorageKey) || "{}");
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
  appStorage.setItem(popularSearchStorageKey, JSON.stringify(trimmedCounts));
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
  appStorage.setItem("cartCount", String(count));
  cartCountElements.forEach((element) => {
    element.textContent = count;
    element.hidden = count < 1;
  });
};

updateCartCount(savedCartCount);
window.addEventListener("cart:updated", () => {
  updateCartCount(Number(appStorage.getItem("cartCount") || 0));
});

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
  const maximumQuantity = Math.max(1, selectableStock || 1);

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
      const options = [...document.querySelectorAll("[data-product-options] select")].filter(
        (select) => select.value,
      );
      if (
        options.some((select) => {
          const sourceId = select.dataset.sourceProductId;
          const variantId = select.selectedOptions[0]?.dataset.variantId;
          const component = quantityProduct?.bundleComponents?.find(
            (item) => item.productId === sourceId,
          );
          return (
            variantId &&
            window.getVariantStockForDate?.(sourceId, variantId, dateKey) <
              selectedProductQuantity * (component?.quantity || 1)
          );
        })
      )
        return true;
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

  document.querySelector("[data-product-options]")?.addEventListener("change", resetSelectedPeriod);

  renderQuantity();
  renderCalendar();
}

document.querySelector("[data-add-cart]")?.addEventListener("click", async () => {
  const button = document.querySelector("[data-add-cart]");
  if (button.disabled) return;

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
    const selectedOptions = Object.fromEntries(
      optionSelects.map((select) => [
        select.previousElementSibling?.textContent.trim() || "オプション",
        select.options[select.selectedIndex]?.textContent || select.value,
      ]),
    );
    const variantSelections = Object.fromEntries(
      optionSelects
        .map((select) => [
          select.dataset.sourceProductId,
          select.selectedOptions[0]?.dataset.variantId,
        ])
        .filter(([productId, variantId]) => productId && variantId),
    );
    const entry = {
      productId: document.body.dataset.productId || selectedWaitlistReservation.productId,
      startDate: selectedWaitlistReservation.arrivalDate,
      endDate: selectedWaitlistReservation.returnDate,
      selectedOptions,
      variantSelections,
      quantity: selectedProductQuantity,
      notify: true,
      createdAt: new Date().toISOString(),
    };
    button.disabled = true;
    try {
      const { saveWaitlist } = await import("./firebase_waitlist.js");
      await saveWaitlist(entry);
      button.dataset.cartState = "waitlist-added";
      button.classList.add("is_added");
      button.textContent = "空き待ちリストを見る";
      showToast("空き待ちリストに登録しました。");
    } catch (error) {
      showToast(
        error.code ? "空き待ちを保存できませんでした。もう一度お試しください。" : error.message,
      );
    } finally {
      button.disabled = false;
    }
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
  }

  button.disabled = true;
  try {
    const api = await getUserState();
    if (api) {
      await api.saveCart(
        selectedReservation,
        selectedProductQuantity,
        appStorage.getItem("cartRevision") || "",
      );
    } else {
      appStorage.setItem("pendingReservation", JSON.stringify(selectedReservation));
      appStorage.removeItem("pendingOrderId");
      updateCartCount(selectedProductQuantity);
    }
    button.dataset.cartState = "added";
    button.classList.add("is_added");
    button.textContent = "カートを見る";
    showToast("カートに入れました。");
  } catch (error) {
    showToast(
      error.code ? "カートを保存できませんでした。もう一度お試しください。" : error.message,
    );
  } finally {
    button.disabled = false;
  }
});

const savedFavorites = new Set(JSON.parse(appStorage.getItem("favoriteProducts") || "[]"));

const legacyFavoriteProducts = {
  "penlight-simple": {
    name: "ペンライト（シンプルタイプ）",
    price: "¥800 / 4日間〜",
    image: "assets/images/penlight.png",
  },
  "penlight-standard": {
    name: "ペンライト（スタンダード）",
    price: "¥1,800 / 4日間〜",
    image: "assets/images/penlight.png",
  },
  "penlight-pair": {
    name: "ペンライト（2点セット）",
    price: "¥3,200 / 4日間〜",
    image: "assets/images/penlight.png",
  },
  "penlight-color-change": {
    name: "ペンライト（カラーバリエーション）",
    price: "¥2,600 / 4日間〜",
    image: "assets/images/penlight.png",
  },
  "penlight-light": {
    name: "ペンライト（ライトタイプ）",
    price: "¥1,500 / 4日間〜",
    image: "assets/images/penlight.png",
  },
  "penlight-long": {
    name: "ペンライト（ロングタイプ）",
    price: "¥3,600 / 4日間〜",
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
  const recentlyViewed = JSON.parse(appStorage.getItem(recentlyViewedKey) || "[]");
  const updatedRecentlyViewed = [
    productId,
    ...recentlyViewed.filter((savedProductId) => savedProductId !== productId),
  ].slice(0, 10);
  appStorage.setItem(recentlyViewedKey, JSON.stringify(updatedRecentlyViewed));
}

const recentlyViewedList = document.querySelector("[data-recently-viewed-list]");
const recentlyViewedEmpty = document.querySelector("[data-recently-viewed-empty]");

if (recentlyViewedList && recentlyViewedEmpty) {
  const recentlyViewed = JSON.parse(appStorage.getItem(recentlyViewedKey) || "[]").filter(
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

document.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-favorite-id]");
  if (!button || button.disabled) return;

  const productId = button.dataset.favoriteId;
  button.disabled = true;
  try {
    const api = await getUserState();
    const isFavorite = !savedFavorites.has(productId);
    if (api) {
      await api.saveFavorite(productId, isFavorite);
    } else {
      if (isFavorite) savedFavorites.add(productId);
      else savedFavorites.delete(productId);
      appStorage.setItem("favoriteProducts", JSON.stringify([...savedFavorites]));
      window.dispatchEvent(new CustomEvent("favorites:updated"));
    }
    showToast(isFavorite ? "お気に入りに保存しました。" : "お気に入りから削除しました。");
  } catch (error) {
    showToast(
      error.code ? "お気に入りを保存できませんでした。もう一度お試しください。" : error.message,
    );
  } finally {
    button.disabled = false;
  }
});

window.addEventListener("favorites:updated", () => {
  savedFavorites.clear();
  JSON.parse(appStorage.getItem("favoriteProducts") || "[]").forEach((id) =>
    savedFavorites.add(id),
  );
  renderFavoritesPage();
  document.querySelectorAll("[data-favorite-id]").forEach((button) => {
    updateFavoriteButton(button, savedFavorites.has(button.dataset.favoriteId));
  });
  updateFavoriteCount();
});

const cartPage = document.querySelector("[data-cart-page]");

if (cartPage) {
  let pendingReservation;
  let cartProductData;
  let unitPrice;
  const roundTripShipping = 440;
  const product = document.querySelector("[data-cart-product]");
  const quantityElement = document.querySelector("[data-cart-quantity]");
  const itemCountElement = document.querySelector("[data-cart-item-count]");
  const totalElement = document.querySelector("[data-cart-total]");
  const summary = document.querySelector("[data-cart-summary]");
  const checkout = document.querySelector("[data-cart-checkout]");
  const emptyMessage = document.querySelector("[data-cart-empty]");
  const availabilityMessage = document.querySelector("[data-cart-availability]");
  let isUnavailable;
  let savingCart = false;
  const controls = [
    ...cartPage.querySelectorAll("[data-cart-decrease], [data-cart-increase], [data-remove-cart]"),
  ];
  let quantity = Number(appStorage.getItem("cartCount") || 0);

  const renderCart = () => {
    pendingReservation = JSON.parse(appStorage.getItem("pendingReservation") || "{}");
    cartProductData =
      window.getProductData?.(pendingReservation.productId || "penlight") ||
      window.PRODUCTS?.[pendingReservation.productId || "penlight"];
    unitPrice = Number(cartProductData?.price ?? pendingReservation.price ?? 800);
    isUnavailable =
      !cartProductData ||
      cartProductData.isPublic === false ||
      cartProductData.stockStatus === "unavailable";
    quantity = Number(appStorage.getItem("cartCount") || 0);
    controls.forEach((button) => {
      button.disabled = savingCart;
    });
    product.querySelector("img").src =
      cartProductData?.images?.[0] || pendingReservation.image || "assets/images/penlight.png";
    product.querySelector("h2").textContent =
      cartProductData?.name || pendingReservation.product || "ペンライト";
    product.querySelector("img").alt =
      `${cartProductData?.name || pendingReservation.product || "商品"}の商品画像`;
    product.querySelector(".cart_product__details p").textContent =
      `¥${unitPrice.toLocaleString("ja-JP")} / ${cartProductData?.rentalDays || 4}日間〜`;

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
    const cannotCheckout = isEmpty || isUnavailable || savingCart;
    checkout.classList.toggle("is_disabled", cannotCheckout);
    checkout.setAttribute("aria-disabled", String(cannotCheckout));
    checkout.tabIndex = cannotCheckout ? -1 : 0;
    availabilityMessage.hidden = isEmpty || !isUnavailable;
    availabilityMessage.textContent = "この商品は現在お申し込みいただけません。";
    updateCartCount(quantity);
  };

  const changeCartQuantity = async (nextQuantity) => {
    if (savingCart) return;
    savingCart = true;
    const reservation = pendingReservation;
    const revision = appStorage.getItem("cartRevision") || "";
    renderCart();
    try {
      const api = await getUserState();
      if (api) await api.saveCart(reservation, nextQuantity, revision);
      else {
        updateCartCount(nextQuantity);
        appStorage.removeItem("pendingOrderId");
        if (!nextQuantity) appStorage.removeItem("pendingReservation");
      }
      if (!nextQuantity) showToast("カートから削除しました。");
    } catch (error) {
      showToast(
        error.code ? "カートを保存できませんでした。もう一度お試しください。" : error.message,
      );
    } finally {
      savingCart = false;
      renderCart();
    }
  };

  document
    .querySelector("[data-cart-decrease]")
    .addEventListener("click", () => changeCartQuantity(Math.max(0, quantity - 1)));
  document
    .querySelector("[data-cart-increase]")
    .addEventListener("click", () => changeCartQuantity(quantity + 1));
  document
    .querySelector("[data-remove-cart]")
    .addEventListener("click", () => changeCartQuantity(0));

  checkout.addEventListener("click", (event) => {
    if (quantity < 1 || isUnavailable || savingCart) {
      event.preventDefault();
      return;
    }
    if (sessionStorage.getItem("isLoggedIn") !== "true") {
      event.preventDefault();
      sessionStorage.setItem("checkoutReturnPath", "checkout.html");
      sessionStorage.setItem("loginReturnToCheckout", "true");
      showToast("購入にはログインが必要です。");
      window.setTimeout(() => {
        window.location.href = "login.html";
      }, 1000);
    }
  });

  renderCart();
  window.addEventListener("cart:updated", renderCart);
}

const paymentPage = document.querySelector("[data-payment-page]");

if (paymentPage) {
  if (sessionStorage.getItem("isLoggedIn") !== "true") {
    window.location.href = "login.html";
  }

  const checkoutPrefectureSelect = document.querySelector("[data-checkout-prefecture]");
  if (checkoutPrefectureSelect && checkoutPrefectureSelect.options.length <= 1) {
    const prefecturesList = [
      "北海道",
      "青森県",
      "岩手県",
      "宮城県",
      "秋田県",
      "山形県",
      "福島県",
      "茨城県",
      "栃木県",
      "群馬県",
      "埼玉県",
      "千葉県",
      "東京都",
      "神奈川県",
      "新潟県",
      "富山県",
      "石川県",
      "福井県",
      "山梨県",
      "長野県",
      "岐阜県",
      "静岡県",
      "愛知県",
      "三重県",
      "滋賀県",
      "京都府",
      "大阪府",
      "兵庫県",
      "奈良県",
      "和歌山県",
      "鳥取県",
      "島根県",
      "岡山県",
      "広島県",
      "山口県",
      "徳島県",
      "香川県",
      "愛媛県",
      "高知県",
      "福岡県",
      "佐賀県",
      "長崎県",
      "熊本県",
      "大分県",
      "宮崎県",
      "鹿児島県",
      "沖縄県",
    ];
    prefecturesList.forEach((p) => checkoutPrefectureSelect.add(new Option(p, p)));
  }

  const profile = getActiveAccount()?.profile || {};
  const checkoutForm = document.querySelector("[data-checkout-form]");
  if (checkoutForm) {
    if (profile.name) checkoutForm.elements.shipping_name.value = profile.name;
    if (profile.postal_first)
      checkoutForm.elements.shipping_postal_first.value = profile.postal_first;
    if (profile.postal_last) checkoutForm.elements.shipping_postal_last.value = profile.postal_last;
    if (profile.prefecture) checkoutForm.elements.shipping_prefecture.value = profile.prefecture;
    if (profile.address) checkoutForm.elements.shipping_address.value = profile.address;
    if (profile.building) checkoutForm.elements.shipping_building.value = profile.building;

    if (profile.name && profile.address && profile.phone) {
      const shippingSection = document.querySelector("[data-shipping-section]");
      shippingSection.hidden = true;
      const shippingSummary = document.createElement("section");
      shippingSummary.className = "checkout_shipping_section";
      const heading = document.createElement("h2");
      heading.textContent = "お届け先";
      const details = document.createElement("p");
      details.textContent = [
        profile.name,
        `〒${profile.postal_first}-${profile.postal_last}`,
        profile.prefecture,
        profile.address,
        profile.building,
        profile.phone,
      ]
        .filter(Boolean)
        .join(" ");
      shippingSummary.append(heading, details);
      shippingSection.after(shippingSummary);
      window.addEventListener("profile:updated", () => {
        const latest = getActiveAccount()?.profile || {};
        details.textContent = [
          latest.name,
          `〒${latest.postal_first || ""}-${latest.postal_last || ""}`,
          latest.prefecture,
          latest.address,
          latest.building,
          latest.phone,
        ]
          .filter(Boolean)
          .join(" ");
        ["name", "postal_first", "postal_last", "prefecture", "address", "building"].forEach(
          (key) => {
            checkoutForm.elements[`shipping_${key}`].value = latest[key] || "";
          },
        );
      });
    }

    const checkoutAddressSearchBtn = document.querySelector("[data-checkout-address-search]");
    if (checkoutAddressSearchBtn) {
      const postalStatus = document.querySelector("[data-checkout-postal-status]");
      checkoutAddressSearchBtn.addEventListener("click", async () => {
        const first = checkoutForm.elements.shipping_postal_first.value.replace(/\D/g, "");
        const last = checkoutForm.elements.shipping_postal_last.value.replace(/\D/g, "");
        const zipcode = `${first}${last}`;
        if (!/^\d{7}$/.test(zipcode)) {
          if (postalStatus) postalStatus.textContent = "郵便番号を7桁で入力してください。";
          return;
        }
        checkoutAddressSearchBtn.disabled = true;
        if (postalStatus) postalStatus.textContent = "住所を検索しています。";
        try {
          const response = await fetch(
            `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zipcode}`,
          );
          if (!response.ok) throw new Error("failed");
          const data = await response.json();
          const result = data.results?.[0];
          if (!result) {
            if (postalStatus) postalStatus.textContent = "該当する住所が見つかりませんでした。";
            return;
          }
          checkoutForm.elements.shipping_prefecture.value = result.address1;
          checkoutForm.elements.shipping_address.value = `${result.address2}${result.address3}`;
          if (postalStatus)
            postalStatus.textContent = "住所を入力しました。番地以降を確認してください。";
          checkoutForm.elements.shipping_address.focus();
        } catch {
          if (postalStatus)
            postalStatus.textContent = "住所を検索できませんでした。通信環境を確認してください。";
        } finally {
          checkoutAddressSearchBtn.disabled = false;
        }
      });
    }

    checkoutForm.addEventListener("submit", () => {
      const shippingInfo = {
        name: checkoutForm.elements.shipping_name?.value || "",
        postal_first: checkoutForm.elements.shipping_postal_first?.value || "",
        postal_last: checkoutForm.elements.shipping_postal_last?.value || "",
        prefecture: checkoutForm.elements.shipping_prefecture?.value || "",
        address: checkoutForm.elements.shipping_address?.value || "",
        building: checkoutForm.elements.shipping_building?.value || "",
      };
      sessionStorage.setItem("checkoutShippingInfo", JSON.stringify(shippingInfo));
    });
  }

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
    appStorage.setItem("selectedPaymentMethod", selectedPayment || "credit");
    appStorage.setItem("paymentFee", String(paymentFees[selectedPayment] || 0));
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
  if (window.FIREBASE_PRODUCTS_LOADED && !order.inventoryReserved) return false;
  const nextDateKey = addDaysToStoredDate(order.returnDate, 1);
  const selections = Object.entries(order.variantSelections || order.bundleVariants || {});
  return selections.length
    ? selections.every(
        ([productId, variantId]) =>
          window.getVariantStockForDate?.(productId, variantId, nextDateKey) >=
          (order.inventoryQuantities?.[productId] || order.quantity || 1),
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
  const serial = crypto.randomUUID().slice(0, 8).toUpperCase();
  return `OSR-${date}-${serial}`;
};

const getOrderDraft = () => {
  const checkoutShipping = JSON.parse(sessionStorage.getItem("checkoutShippingInfo") || "{}");
  const registration = JSON.parse(sessionStorage.getItem("registrationData") || "{}");
  const accountProfile = getActiveAccount()?.profile || {};
  const customer = { ...registration, ...accountProfile, ...checkoutShipping };
  const reservation = JSON.parse(appStorage.getItem("pendingReservation") || "{}");
  const currentProduct =
    window.getProductData?.(reservation.productId || "penlight") ||
    window.PRODUCTS?.[reservation.productId || "penlight"];
  const quantity = Math.max(1, Number(appStorage.getItem("cartCount") || 0));
  const payment = appStorage.getItem("selectedPaymentMethod") || "credit";
  const paymentFee = Number(appStorage.getItem("paymentFee") || 0);
  const subtotal = Number(currentProduct?.price ?? reservation.price ?? 800) * quantity;
  const shipping = 440;

  let orderId = appStorage.getItem("pendingOrderId");
  if (!orderId) {
    orderId = createOrderId();
    appStorage.setItem("pendingOrderId", orderId);
  }

  const shippingPostalFirst = customer.shipping_postal_first || customer.postal_first;
  const shippingPostalLast = customer.shipping_postal_last || customer.postal_last;
  const shippingPrefecture = customer.shipping_prefecture || customer.prefecture;
  const shippingAddressStr = customer.shipping_address || customer.address;
  const shippingBuildingStr = customer.shipping_building || customer.building;
  const customerNameStr = customer.shipping_name || customer.name || "会員様";

  const formattedAddress = [
    shippingPostalFirst && shippingPostalLast
      ? `〒${shippingPostalFirst}-${shippingPostalLast}`
      : customer.postal
        ? `〒${customer.postal}`
        : "",
    shippingPrefecture,
    shippingAddressStr,
    shippingBuildingStr,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    id: orderId,
    cartRevision: appStorage.getItem("cartRevision") || "",
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
      name: customerNameStr,
      email: customer.email || activeAccountEmail || "未登録",
      phone: customer.phone || customer.tel || "未登録",
    },
    arrivalDate: reservation.arrivalDate || "",
    returnDate: reservation.returnDate || "",
    period:
      reservation.arrivalDate && reservation.returnDate
        ? `${formatStoredDate(reservation.arrivalDate)}〜${formatStoredDate(reservation.returnDate)}`
        : "3泊4日",
    address: formattedAddress || "登録済みのお届け先",
  };
};

const extensionPage = document.querySelector("[data-extension-page]");

if (extensionPage) {
  const orderId = new URLSearchParams(window.location.search).get("order");
  const order = JSON.parse(appStorage.getItem("rentalOrders") || "[]").find(
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
  const savedOrders = JSON.parse(appStorage.getItem("rentalOrders") || "[]");
  const extensionOrder = extensionOrderId
    ? savedOrders.find((order) => order.id === extensionOrderId)
    : null;
  const draft = extensionOrder
    ? {
        ...extensionOrder,
        subtotal: 440 * extensionOrder.quantity,
        shipping: 0,
        paymentFee: 0,
        total: 440 * extensionOrder.quantity,
        payment: appStorage.getItem("selectedPaymentMethod") || "credit",
        paymentName: paymentNames[appStorage.getItem("selectedPaymentMethod") || "credit"],
        period: `${formatStoredDate(extensionOrder.arrivalDate)}〜${formatStoredDate(
          addDaysToStoredDate(extensionOrder.returnDate, 1),
        )}`,
      }
    : getOrderDraft();
  const currentOrderProduct = window.getProductData?.(draft.productId);
  const cannotPlaceOrder =
    !extensionOrder &&
    (!currentOrderProduct ||
      currentOrderProduct.isPublic === false ||
      currentOrderProduct.stockStatus === "unavailable" ||
      Number(appStorage.getItem("cartCount") || 0) < 1);
  const availabilityMessage = document.querySelector("[data-order-availability]");
  availabilityMessage.hidden = !cannotPlaceOrder;
  availabilityMessage.textContent =
    "この商品は現在お申し込みいただけません。カートをご確認ください。";
  document.querySelector("[data-place-order]").disabled = cannotPlaceOrder;
  if (!extensionOrder) {
    window.addEventListener("cart:updated", () => {
      if ((appStorage.getItem("cartRevision") || "") === draft.cartRevision) return;
      document.querySelector("[data-place-order]").disabled = true;
      availabilityMessage.hidden = false;
      availabilityMessage.textContent =
        "カートの内容が変更されました。カートからもう一度お手続きください。";
    });
  }

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
    document.querySelector(".order_product img").alt = `${draft.product}の商品画像`;
    document.querySelector(".order_product p").textContent =
      `¥${Number(draft.subtotal / draft.quantity).toLocaleString("ja-JP")} / 4日間〜`;
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

  document.querySelector("[data-place-order]").addEventListener("click", async (event) => {
    if (cannotPlaceOrder) return;
    const button = event.currentTarget;
    if (button.disabled) return;
    if (extensionOrder) {
      button.disabled = true;
      try {
        const target = await window.changeRentalOrder(
          extensionOrder.id,
          "extend",
          draft.payment,
          extensionOrder.returnDate,
        );
        const orders = JSON.parse(appStorage.getItem("rentalOrders") || "[]").map((order) =>
          order.id === target.id ? target : order,
        );
        appStorage.setItem("rentalOrders", JSON.stringify(orders));
        appStorage.setItem(
          "latestExtension",
          JSON.stringify({
            ...target,
            total: 440 * target.quantity,
            paymentName: draft.paymentName,
          }),
        );
        window.location.href = `order_complete.html?extension=${encodeURIComponent(target.id)}`;
      } catch (error) {
        availabilityMessage.hidden = false;
        availabilityMessage.textContent = error.code
          ? "延長を保存できませんでした。もう一度お試しください。"
          : error.message;
        button.disabled = false;
      }
      return;
    }

    const placedAt = new Date();
    const order = {
      ...draft,
      placedAt: placedAt.toISOString(),
      placedDate: `${placedAt.getFullYear()}年${placedAt.getMonth() + 1}月${placedAt.getDate()}日`,
      status: "配送待ち",
    };
    button.disabled = true;
    const originalLabel = button.textContent;
    button.textContent = "注文を保存しています…";
    try {
      if (!window.saveRentalOrder)
        throw new Error("注文を保存できません。ページを再読み込みしてください。");
      const savedOrder = await window.saveRentalOrder(order);
      const orders = JSON.parse(appStorage.getItem("rentalOrders") || "[]");
      if (!orders.some((item) => item.id === savedOrder.id)) {
        orders.unshift(savedOrder);
        appStorage.setItem("rentalOrders", JSON.stringify(orders));
        if (!savedOrder.inventoryReserved) window.reduceStockForOrder?.(savedOrder);
      }
      appStorage.setItem("latestOrder", JSON.stringify(savedOrder));
      if (appStorage.getItem("cartRevision") === draft.cartRevision) {
        appStorage.setItem("cartCount", "0");
        appStorage.removeItem("pendingReservation");
        appStorage.removeItem("pendingOrderId");
      }
      window.location.href = "order_complete.html";
    } catch (error) {
      console.error("注文を保存できませんでした。", error);
      availabilityMessage.hidden = false;
      availabilityMessage.textContent = error.code
        ? "注文を保存できませんでした。通信環境を確認して、もう一度お試しください。"
        : error.message;
      button.disabled = false;
      button.textContent = originalLabel;
    }
  });
}

const orderCompletePage = document.querySelector("[data-order-complete]");

if (orderCompletePage) {
  const extensionOrderId = new URLSearchParams(window.location.search).get("extension");
  const order = extensionOrderId
    ? JSON.parse(appStorage.getItem("latestExtension") || "null")
    : JSON.parse(appStorage.getItem("latestOrder") || "null") || getOrderDraft();
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
  const returnDeadlineElements = document.querySelectorAll("[data-complete-return-deadline]");
  returnDeadlineElements.forEach((element) => {
    element.textContent = order.returnDate
      ? `${formatStoredDate(order.returnDate)} 24:00まで`
      : "未設定";
  });
  document.querySelector("[data-complete-payment]").textContent = order.paymentName;
  document.querySelector("[data-complete-total]").textContent =
    `¥${order.total.toLocaleString("ja-JP")}`;
  updateCartCount(0);
}

const rentalHistoryPage = document.querySelector("[data-rental-history]");

if (rentalHistoryPage) {
  const orders = JSON.parse(appStorage.getItem("rentalOrders") || "[]");
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
    const orders = JSON.parse(appStorage.getItem("rentalOrders") || "[]");
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

      confirmButton.addEventListener("click", async () => {
        if (confirmButton.disabled) return;
        const savedOrders = JSON.parse(appStorage.getItem("rentalOrders") || "[]");
        const target = savedOrders.find((item) => item.id === orderId);
        if (!target) return;

        confirmButton.disabled = true;
        try {
          const cancelled = await window.changeRentalOrder(target.id, "cancel");
          appStorage.setItem(
            "rentalOrders",
            JSON.stringify(
              savedOrders.map((item) => (item.id === cancelled.id ? cancelled : item)),
            ),
          );
          showComplete();
        } catch (error) {
          showToast(
            error.code
              ? "キャンセルを保存できませんでした。もう一度お試しください。"
              : error.message,
          );
          confirmButton.disabled = false;
        }
      });
    }
  }
}

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

  const renderNotices = () => {
    const openIds = new Set(
      [...noticeList.querySelectorAll("[data-dynamic-notice]")]
        .filter((item) => item.querySelector("details")?.open)
        .map((item) => item.dataset.noticeId),
    );
    noticeList.querySelectorAll("[data-dynamic-notice]").forEach((item) => item.remove());
    JSON.parse(appStorage.getItem("appNotifications") || "[]")
      .slice()
      .reverse()
      .forEach((notice) => {
        const item = document.createElement("li");
        const details = document.createElement("details");
        const summary = document.createElement("summary");
        const title = document.createElement("h2");
        const header = document.createElement("div");
        const meta = document.createElement("div");
        const badge = document.createElement("span");
        const arrow = document.createElement("span");
        const unreadDot = document.createElement("span");
        const body = document.createElement("div");
        const message = document.createElement("p");

        item.className = notice.isRead ? "notice_item" : "notice_item is_unread";
        item.dataset.dynamicNotice = "";
        item.dataset.category = ["info", "order", "important"].includes(notice.category)
          ? notice.category
          : "info";
        item.dataset.noticeId = notice.id;
        details.className = "notice_item__details";
        summary.className = "notice_item__summary";
        header.className = "notice_item__header";
        meta.className = "notice_item__meta";
        badge.className = `notice_badge notice_badge--${item.dataset.category}`;
        badge.textContent = { info: "お知らせ", order: "注文・配送", important: "重要" }[
          item.dataset.category
        ];
        arrow.className = "notice_item__arrow";
        arrow.setAttribute("aria-hidden", "true");
        unreadDot.className = "notice_item__unread_dot";
        unreadDot.setAttribute("aria-label", "未読");
        meta.append(badge);
        const date = new Date(notice.createdAt);
        if (!Number.isNaN(date.getTime())) {
          const time = document.createElement("time");
          time.className = "notice_item__date";
          time.dateTime = date.toISOString();
          time.textContent = new Intl.DateTimeFormat("ja-JP", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })
            .format(date)
            .replaceAll("/", ".");
          meta.append(time);
        }
        meta.append(unreadDot);
        header.append(meta, arrow);
        title.className = "notice_item__title";
        body.className = "notice_item__body";
        title.textContent = notice.title;
        message.textContent = notice.message;
        message.className = "notice_item__message";
        body.append(message);
        summary.append(header, title);
        details.append(summary, body);
        if (notice.productId || notice.contactId) {
          const action = document.createElement("div");
          action.className = "notice_item__action";
          const link = document.createElement("a");
          link.className = "notice_item__link";
          link.href = notice.contactId
            ? "contact.html"
            : `product_detail.html?id=${encodeURIComponent(notice.productId)}`;
          link.textContent = notice.contactId ? "お問い合わせを確認する ›" : "商品を確認する ›";
          action.append(link);
          body.append(action);
        }
        details.open = openIds.has(notice.id);
        item.append(details);
        noticeList.prepend(item);
      });

    document.querySelectorAll("[data-notice-id]").forEach((item) => {
      const noticeId = item.dataset.noticeId;
      if (!item.hasAttribute("data-dynamic-notice") && getReadNoticeIds().includes(noticeId)) {
        item.classList.remove("is_unread");
      }

      const details = item.querySelector(".notice_item__details");
      if (!details || details.dataset.readHandler) return;
      details.dataset.readHandler = "true";
      details.addEventListener("toggle", async (event) => {
        if (!event.currentTarget.open || !item.classList.contains("is_unread")) return;

        item.classList.remove("is_unread");
        try {
          await markNoticeAsRead(noticeId);
        } catch {
          item.classList.add("is_unread");
          showToast("既読にできませんでした。もう一度お試しください。");
        }
      });
    });
    const category =
      document.querySelector("[data-notice-tab].is_active")?.dataset.noticeTab || "all";
    let count = 0;
    noticeList.querySelectorAll(".notice_item").forEach((item) => {
      item.hidden = category !== "all" && item.dataset.category !== category;
      if (!item.hidden) count += 1;
    });
    if (emptyElement) emptyElement.hidden = count > 0;
  };
  renderNotices();
  window.addEventListener("notifications:updated", renderNotices);

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

window.addEventListener("notifications:updated", updateNoticeCount);
import("./firebase_notifications.js")
  .then(({ subscribeNotifications }) => subscribeNotifications())
  .catch((error) => console.error("通知を読み込めませんでした。", error));
