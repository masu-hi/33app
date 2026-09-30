window.PRODUCTS = {
  penlight: {
    id: "penlight",
    category: "penlight",
    name: "ペンライト",
    price: 800,
    rentalDays: 4,
    extensionFee: 440,
    shippingFee: 440,
    images: ["assets/images/penlight.png"],
    variants: [{ id: "penlight-default", label: "ペンライト", stock: 3 }],
    searchTags: [
      "ペンライト",
      "ペンラ",
      "ライト",
      "ライブ",
      "コンサート",
      "イベント",
      "応援",
      "推し活",
    ],
    description:
      "シンプルで使いやすい定番のペンライトです。どんな場面でも使いやすい汎用タイプなので、初めての方にもおすすめです。",
    options: [],
  },
  bag: {
    id: "bag",
    category: "bag",
    name: "推し活バッグ",
    price: 2400,
    rentalDays: 3,
    extensionFee: 440,
    shippingFee: 440,
    images: ["assets/images/bag_hero.png"],
    variants: [
      { id: "bag-red", label: "赤", stock: 3 },
      { id: "bag-blue", label: "青", stock: 3 },
      { id: "bag-pink", label: "ピンク", stock: 3 },
      { id: "bag-orange", label: "オレンジ", stock: 3 },
      { id: "bag-purple", label: "紫", stock: 3 },
      { id: "bag-yellow", label: "黄色", stock: 3 },
      { id: "bag-green", label: "緑", stock: 3 },
      { id: "bag-white", label: "白", stock: 3 },
      { id: "bag-black", label: "黒", stock: 3 },
    ],
    searchTags: [
      "推し活バック",
      "痛バ",
      "痛バッグ",
      "トートバッグ",
      "ライブ",
      "コンサート",
      "推し活",
      "推しカラー",
    ],
    description:
      "推し活にぴったりな、可愛らしく使いやすいバッグです。収納力があり、ライブやイベントに必要なものをまとめて持ち運べます。推しカラーで楽しめるバッグです。",
    options: [
      {
        name: "カラー",
        values: ["赤", "青", "ピンク", "オレンジ", "紫", "黄色", "緑", "白", "黒"],
      },
    ],
  },
  binoculars: {
    id: "binoculars",
    category: "binoculars",
    name: "双眼鏡",
    price: 2400,
    rentalDays: 3,
    extensionFee: 440,
    shippingFee: 440,
    images: ["assets/images/binoculars_hero.png"],
    variants: [
      { id: "binoculars-8x", label: "8倍", stock: 3 },
      { id: "binoculars-10x", label: "10倍", stock: 3 },
      { id: "binoculars-12x", label: "12倍", stock: 3 },
      { id: "binoculars-14x", label: "14倍", stock: 3 },
      { id: "binoculars-16x", label: "16倍", stock: 3 },
      { id: "binoculars-stabilized", label: "防振", stock: 3 },
      { id: "binoculars-waterproof", label: "防水", stock: 3 },
    ],
    searchTags: [
      "オペラグラス",
      "ライブ用双眼鏡",
      "コンサート用双眼鏡",
      "ライブ",
      "コンサート",
      "観劇",
      "舞台",
      "高倍率",
      "8倍",
      "10倍",
      "12倍",
      "14倍",
      "16倍",
      "防振",
      "手ブレ補正",
      "防水",
    ],
    description:
      "ライブやコンサートで遠くの推しをしっかり見られる双眼鏡です。コンパクトで持ち運びやすく、ステージ上の表情やパフォーマンスも楽しめます。",
    options: [{ name: "タイプ", values: ["8倍", "10倍", "12倍", "14倍", "16倍", "防振", "防水"] }],
  },
  fan: {
    id: "fan",
    category: "fan",
    name: "ファンサうちわセット",
    price: 2400,
    rentalDays: 3,
    extensionFee: 440,
    shippingFee: 440,
    images: ["assets/images/fan_hero.png"],
    variants: [
      { id: "fan-peace", label: "ピースして", stock: 3 },
      { id: "fan-blow-kiss", label: "投げキッスして", stock: 3 },
      { id: "fan-wink", label: "ウインクして", stock: 3 },
      { id: "fan-finger-heart", label: "指ハートして", stock: 3 },
      { id: "fan-bang", label: "バーンして", stock: 3 },
      { id: "fan-make-heart", label: "ハート作って", stock: 3 },
      { id: "fan-call-name", label: "名前呼んで", stock: 3 },
      { id: "fan-wave", label: "手振って", stock: 3 },
      { id: "fan-shoot", label: "撃って", stock: 3 },
      { id: "fan-find-me", label: "見つけて", stock: 3 },
    ],
    searchTags: [
      "うちわ",
      "ファンサうちわセット",
      "応援うちわ",
      "ファンサ",
      "ファンサービス",
      "ライブ",
      "コンサート",
    ],
    description:
      "ライブでのファンサにぴったりなうちわと、推しカラーを選べるうちわケースのセットです。大きく見やすい定番メッセージから、お好みの文字を選べます。",
    options: [
      {
        name: "うちわの文字",
        values: [
          "ピースして",
          "投げキッスして",
          "ウインクして",
          "指ハートして",
          "バーンして",
          "ハート作って",
          "名前呼んで",
          "手振って",
          "撃って",
          "見つけて",
        ],
      },
      {
        name: "うちわケースの色",
        values: ["赤", "青", "ピンク", "オレンジ", "紫", "黄色", "緑", "白", "黒"],
      },
    ],
  },
  fan_case: {
    id: "fan_case",
    category: "fan_case",
    name: "うちわケース",
    standalone: false,
    price: 2600,
    rentalDays: 3,
    extensionFee: 440,
    shippingFee: 440,
    images: ["assets/images/fan_hero.png"],
    variants: [
      { id: "fan-case-red", label: "赤", stock: 3 },
      { id: "fan-case-blue", label: "青", stock: 3 },
      { id: "fan-case-pink", label: "ピンク", stock: 3 },
      { id: "fan-case-orange", label: "オレンジ", stock: 3 },
      { id: "fan-case-purple", label: "紫", stock: 3 },
      { id: "fan-case-yellow", label: "黄色", stock: 3 },
      { id: "fan-case-green", label: "緑", stock: 3 },
      { id: "fan-case-white", label: "白", stock: 3 },
      { id: "fan-case-black", label: "黒", stock: 3 },
    ],
    searchTags: ["うちわケース", "ケース", "推しカラー", "推し活"],
    description: "バッグと同じカラーから選べる、うちわ用のケースです。",
    options: [
      {
        name: "カラー",
        values: ["赤", "青", "ピンク", "オレンジ", "紫", "黄色", "緑", "白", "黒"],
      },
    ],
  },
  set: {
    id: "set",
    category: "set",
    name: "推し活セット",
    price: 3200,
    rentalDays: 3,
    extensionFee: 440,
    shippingFee: 440,
    images: ["assets/images/setto.png"],
    inventoryMode: "shared",
    bundleComponents: [
      {
        productId: "penlight",
        quantity: 1,
        name: "ペンライト",
        defaultVariant: "penlight-default",
      },
      { productId: "bag", quantity: 1, name: "推し活バッグ", defaultVariant: "bag-red" },
      {
        productId: "fan",
        quantity: 1,
        name: "ファンサうちわ",
        defaultVariant: "fan-peace",
      },
      { productId: "fan_case", quantity: 1, name: "うちわケース", defaultVariant: "fan-case-red" },
      { productId: "binoculars", quantity: 1, name: "双眼鏡", defaultVariant: "binoculars-8x" },
    ],
    searchTags: [
      "推し活セット",
      "撮影セット",
      "ライブセット",
      "コンサートセット",
      "応援セット",
      "レンタルセット",
      "初心者セット",
      "初参戦",
      "ライブ初心者",
      "まとめてレンタル",
      "一式",
      "遠征",
      "ペンライト",
      "うちわ",
      "うちわケース",
      "双眼鏡",
      "バッグ",
    ],
    description:
      "推し活に必須のペンライト、推し活バッグ、ケース付きファンサうちわ、双眼鏡がひとつになったお得なセットです。単品の在庫と連携しており、お好みのバリエーションをお選びいただけます。",
    options: [
      {
        name: "セット内容",
        values: ["ペンライト", "推し活バッグ", "ファンサうちわ", "うちわケース", "双眼鏡"],
      },
    ],
  },
};

const INVENTORY_STORAGE_KEY = "productVariantInventory";

window.getSavedInventory = () => {
  try {
    return JSON.parse(localStorage.getItem(INVENTORY_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
};

window.getVariantStock = (productId, variant) => {
  const variantId = typeof variant === "string" ? variant : variant?.id;
  if (!variantId) return 0;

  const product = window.PRODUCTS[productId];
  const target =
    product?.variants?.find((v) => v.id === variantId) ||
    (typeof variant === "object" ? variant : null);
  const defaultStock = Number.isFinite(target?.stock) ? target.stock : 3;

  const savedInventory = window.getSavedInventory();
  const savedStock = savedInventory[productId]?.[variantId];
  return Number.isFinite(savedStock) ? savedStock : defaultStock;
};

window.setVariantStock = (productId, variantId, stock) => {
  const inventory = window.getSavedInventory();
  const nextStock = Math.max(0, Number(stock) || 0);
  inventory[productId] = { ...inventory[productId], [variantId]: nextStock };
  localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(inventory));
  return nextStock;
};

window.changeVariantStock = (productId, variantId, change) => {
  const current = window.getVariantStock(productId, variantId);
  const next = Math.max(0, current + change);
  return window.setVariantStock(productId, variantId, next);
};

window.getProductAvailableStock = (productId) => {
  const product = window.PRODUCTS[productId];
  if (!product) return 0;

  if (product.inventoryMode === "shared") {
    const componentMaxSets = product.bundleComponents.map(
      ({ productId: componentId, quantity }) => {
        const compTotalStock = window.getProductAvailableStock(componentId);
        return Math.floor(compTotalStock / quantity);
      },
    );
    return Math.min(3, ...componentMaxSets);
  }

  return (product.variants || []).reduce(
    (total, variant) => total + window.getVariantStock(productId, variant),
    0,
  );
};

const orderOverlapsDate = (order, dateKey) =>
  order.arrivalDate &&
  order.returnDate &&
  order.arrivalDate <= dateKey &&
  dateKey <= order.returnDate;

window.getVariantPhysicalStock = (productId, variantId) => {
  const currentStock = window.getVariantStock(productId, variantId);
  const activeOrders = JSON.parse(localStorage.getItem("rentalOrders") || "[]").filter(
    (order) => order.status !== "キャンセル",
  );
  let allocatedTotal = 0;

  activeOrders.forEach((order) => {
    if (order.variantSelections?.[productId] !== variantId) return;
    const quantity = Number(order.quantity) || 1;
    allocatedTotal += quantity;
  });

  return currentStock + allocatedTotal;
};

window.getVariantStockForDate = (productId, variantId, dateKey) => {
  const physicalStock = window.getVariantPhysicalStock(productId, variantId);
  const activeOrders = JSON.parse(localStorage.getItem("rentalOrders") || "[]").filter(
    (order) => order.status !== "キャンセル" && orderOverlapsDate(order, dateKey),
  );
  const allocatedOnDate = activeOrders.reduce((total, order) => {
    if (order.variantSelections?.[productId] !== variantId) return total;
    return total + (Number(order.quantity) || 1);
  }, 0);

  return Math.max(0, physicalStock - allocatedOnDate);
};

window.getProductAvailableStockForDate = (productId, dateKey) => {
  const product = window.PRODUCTS[productId];
  if (!product) return 0;

  const totalForProduct = (targetId) =>
    (window.PRODUCTS[targetId]?.variants || []).reduce(
      (total, variant) => total + window.getVariantStockForDate(targetId, variant.id, dateKey),
      0,
    );

  if (productId === "fan") {
    return Math.min(totalForProduct("fan"), totalForProduct("fan_case"));
  }

  if (product.inventoryMode === "shared") {
    return Math.min(
      ...product.bundleComponents.map((component) =>
        Math.floor(totalForProduct(component.productId) / component.quantity),
      ),
    );
  }

  return totalForProduct(productId);
};

window.getSetVariantAvailableStock = (selectedVariants = {}) => {
  const setProduct = window.PRODUCTS.set;
  if (!setProduct) return 0;

  const stocks = setProduct.bundleComponents.map((comp) => {
    const variantId = selectedVariants[comp.productId] || comp.defaultVariant;
    return window.getVariantStock(comp.productId, variantId);
  });

  return Math.min(...stocks);
};

window.reduceStockForOrder = (order) => {
  if (!order) return;
  const quantity = Number(order.quantity) || 1;

  if (order.variantSelections && Object.keys(order.variantSelections).length) {
    Object.entries(order.variantSelections).forEach(([productId, variantId]) => {
      window.changeVariantStock(productId, variantId, -quantity);
    });
    return;
  }

  if (order.productId === "set" || order.isSet) {
    const bundle = order.bundleVariants || {
      penlight: "penlight-default",
      bag: "bag-red",
      fan: "fan-peace",
      fan_case: "fan-case-red",
      binoculars: "binoculars-8x",
    };
    Object.entries(bundle).forEach(([componentId, variantId]) => {
      window.changeVariantStock(componentId, variantId, -quantity);
    });
  } else if (order.productId && order.variantId) {
    window.changeVariantStock(order.productId, order.variantId, -quantity);
  }
};

window.restoreStockForOrder = (order) => {
  if (!order) return [];
  const quantity = Number(order.quantity) || 1;
  const selections = order.variantSelections || order.bundleVariants || {};
  const restoredProductIds = [];

  Object.entries(selections).forEach(([productId, variantId]) => {
    window.changeVariantStock(productId, variantId, quantity);
    restoredProductIds.push(productId);
  });

  if (!restoredProductIds.length && order.productId && order.variantId) {
    window.changeVariantStock(order.productId, order.variantId, quantity);
    restoredProductIds.push(order.productId);
  }

  return restoredProductIds;
};

window.notifyAvailableWaitlist = (changedProductIds = []) => {
  const changedIds = new Set(changedProductIds);
  const entries = JSON.parse(localStorage.getItem("waitlistProducts") || "[]");
  const notifications = JSON.parse(localStorage.getItem("appNotifications") || "[]");
  let changed = false;

  entries.forEach((entry, index) => {
    const relatesToChange =
      changedIds.has(entry.productId) ||
      (entry.productId === "set" &&
        window.PRODUCTS.set.bundleComponents.some((component) =>
          changedIds.has(component.productId),
        ));
    if (!relatesToChange || entry.notifiedAt || entry.notify === false) return;
    if (window.getProductAvailableStock(entry.productId) < 1) return;

    entry.notifiedAt = new Date().toISOString();
    const product = window.PRODUCTS[entry.productId];
    notifications.unshift({
      id: `waitlist-${entry.productId}-${Date.now()}-${index}`,
      title: `【空きが出ました】${product?.name || "登録商品"}`,
      message: `${entry.startDate}からの希望期間に申し込める在庫が確保されました。商品詳細から空き状況をご確認ください。`,
      createdAt: entry.notifiedAt,
    });
    changed = true;
  });

  if (changed) {
    localStorage.setItem("waitlistProducts", JSON.stringify(entries));
    localStorage.setItem("appNotifications", JSON.stringify(notifications));
  }
  return changed;
};

window.resetAllInventory = () => {
  localStorage.removeItem(INVENTORY_STORAGE_KEY);
};
