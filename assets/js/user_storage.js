(() => {
  if (window.userStorage) return;
  const personalKeys = new Set([
    "cartCount",
    "pendingReservation",
    "pendingOrderId",
    "rentalOrders",
    "latestOrder",
    "latestExtension",
    "favoriteProducts",
    "recentlyViewedProducts",
    "waitlistProducts",
    "appNotifications",
    "readNoticeIds",
    "favoriteColor",
    "selectedPaymentMethod",
    "paymentFee",
    "memberProfile",
    "accountName",
    "packingChecklistCheckedItems",
  ]);
  const prefix = "userData:";
  const resetVersion = "2026-10-12-user-demo-reset-1";
  if (localStorage.getItem("userDemoResetVersion") !== resetVersion) {
    const accountKeys = new Set([
      ...personalKeys,
      "accounts",
      "registeredAccount",
      "oshleaseReviews",
    ]);
    for (const key of Object.keys(localStorage)) {
      if (accountKeys.has(key) || key.startsWith(prefix)) localStorage.removeItem(key);
    }
    [
      "activeUserId",
      "activeAccountEmail",
      "isLoggedIn",
      "loggedInName",
      "checkoutShippingInfo",
      "registrationData",
      "checkoutReturnPath",
      "loginReturnToCheckout",
      "loginTransition",
    ].forEach((key) => sessionStorage.removeItem(key));
    localStorage.setItem("userDemoResetVersion", resetVersion);
  }
  const owner = () => sessionStorage.getItem("activeUserId") || "guest";
  const storageKey = (key) => (personalKeys.has(key) ? `${prefix}${owner()}:${key}` : key);

  window.userStorage = {
    getItem: (key) => localStorage.getItem(storageKey(key)),
    setItem: (key, value) => localStorage.setItem(storageKey(key), value),
    removeItem: (key) => localStorage.removeItem(storageKey(key)),
  };

  // 注文・空き待ちは管理表示と在庫計算のために全アカウント分を集約します。
  window.sharedAccountStorage = {
    getItem(key) {
      if (!["rentalOrders", "waitlistProducts"].includes(key)) return localStorage.getItem(key);
      const entries = [];
      for (let index = 0; index < localStorage.length; index += 1) {
        const savedKey = localStorage.key(index);
        if (savedKey !== key && !(savedKey.startsWith(prefix) && savedKey.endsWith(`:${key}`)))
          continue;
        try {
          const items = JSON.parse(localStorage.getItem(savedKey) || "[]");
          if (Array.isArray(items))
            entries.push(...items.map((item) => ({ ...item, __storageKey: savedKey })));
        } catch {
          /* 不正な保存データは集約しません。 */
        }
      }
      return JSON.stringify(entries);
    },
    setItem(key, value) {
      if (!["rentalOrders", "waitlistProducts"].includes(key)) {
        localStorage.setItem(key, value);
        return;
      }
      const groups = new Map();
      for (let index = 0; index < localStorage.length; index += 1) {
        const savedKey = localStorage.key(index);
        if (savedKey === key || (savedKey.startsWith(prefix) && savedKey.endsWith(`:${key}`))) {
          groups.set(savedKey, []);
        }
      }
      for (const item of JSON.parse(value)) {
        const { __storageKey, ...data } = item;
        const target = __storageKey || storageKey(key);
        if (!groups.has(target)) groups.set(target, []);
        groups.get(target).push(data);
      }
      for (const [target, items] of groups) localStorage.setItem(target, JSON.stringify(items));
    },
    removeItem: (key) => localStorage.removeItem(key),
  };
})();
