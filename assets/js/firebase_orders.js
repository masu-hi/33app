import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  runTransaction,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { db } from "./firebase_config.js";
import { waitForUser, loadUserProfile } from "./firebase_user.js";
import {
  addRentalDays,
  rentalDateKeys,
  inventoryRequirements,
  inventoryDayId,
} from "./rental_inventory.js";

const sameOrder = (saved, order, userId) =>
  saved.userId === userId &&
  ["productId", "arrivalDate", "returnDate", "quantity", "total"].every(
    (key) => saved[key] === order[key],
  ) &&
  JSON.stringify(Object.entries(saved.variantSelections || {}).sort()) ===
    JSON.stringify(Object.entries(order.variantSelections || {}).sort());

export const saveRentalOrder = async (order) => {
  const user = await waitForUser();
  if (!user || user.isAnonymous || sessionStorage.getItem("activeUserId") !== user.uid) {
    throw new Error("ログイン状態を確認できません。ログインし直してください。");
  }
  if (
    !order.id ||
    !order.productId ||
    !order.arrivalDate ||
    !order.returnDate ||
    !Number.isInteger(order.quantity) ||
    order.quantity < 1 ||
    !Number.isFinite(order.total)
  ) {
    throw new Error("注文内容を確認できません。カートからお手続きください。");
  }

  const snapshots = await getDocs(query(collection(db, "orders"), where("userId", "==", user.uid)));
  const existing = snapshots.docs.find((snapshot) => snapshot.id === order.id);
  if (existing) {
    if (!sameOrder(existing.data(), order, user.uid))
      throw new Error("注文内容が変更されています。カートをご確認ください。");
    return { ...existing.data(), id: existing.id };
  }

  if (order.returnDate !== addRentalDays(order.arrivalDate, 3))
    throw new Error("レンタル期間を確認してください。");
  const requirements = inventoryRequirements(order, window.PRODUCTS);
  const saved = {
    ...order,
    userId: user.uid,
    customer: { ...order.customer, email: user.email },
    inventoryReserved: true,
    inventoryQuantities: Object.fromEntries(
      requirements.map((item) => [item.productId, item.quantity]),
    ),
    variantSelections: Object.fromEntries(
      requirements.map((item) => [item.productId, item.variantId]),
    ),
  };
  return runTransaction(db, async (transaction) => {
    const reference = doc(db, "orders", order.id);
    const snapshot = await transaction.get(reference);
    if (snapshot.exists()) {
      if (!sameOrder(snapshot.data(), saved, user.uid))
        throw new Error("注文内容が変更されています。カートをご確認ください。");
      return { ...snapshot.data(), id: snapshot.id };
    }
    const productSnapshot = await transaction.get(doc(db, "products", order.productId));
    if (
      !productSnapshot.exists() ||
      productSnapshot.data().isPublished === false ||
      productSnapshot.data().stockStatus === "unavailable"
    ) {
      throw new Error("この商品は現在お申し込みいただけません。");
    }
    if (Number(productSnapshot.data().price) * order.quantity !== order.subtotal) {
      throw new Error("商品の価格が変更されました。ページを再読み込みして金額をご確認ください。");
    }
    const changes = await readInventoryChanges(
      transaction,
      saved,
      rentalDateKeys(order.arrivalDate, order.returnDate),
      1,
    );
    writeInventoryChanges(transaction, changes);
    transaction.set(reference, {
      ...saved,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return saved;
  });
};

const readInventoryChanges = async (transaction, order, dates, direction) => {
  const requirements = inventoryRequirements(order, window.PRODUCTS);
  const variants = await Promise.all(
    requirements.map((item) =>
      transaction.get(doc(db, "products", item.productId, "variants", item.variantId)),
    ),
  );
  const changes = [];
  for (const [index, item] of requirements.entries()) {
    const variant = variants[index];
    if (!variant.exists()) throw new Error("商品の在庫を確認できませんでした。");
    for (const dateKey of dates) {
      const reference = doc(
        db,
        "inventoryDays",
        inventoryDayId(item.productId, item.variantId, dateKey),
      );
      const snapshot = await transaction.get(reference);
      const previous = snapshot.exists() ? snapshot.data() : { reservedCount: 0, allocations: {} };
      const allocations = { ...(previous.allocations || {}) };
      const previousQuantity = Number(allocations[order.id] || 0);
      const nextQuantity = direction > 0 ? item.quantity : 0;
      const reservedCount = Number(previous.reservedCount || 0) + nextQuantity - previousQuantity;
      if (
        reservedCount < 0 ||
        (direction > 0 && reservedCount > Number(variant.data().totalStock || 0))
      ) {
        throw new Error(
          "希望期間の在庫が不足しています。別の日程を選ぶか、空き待ちに登録してください。",
        );
      }
      if (nextQuantity) allocations[order.id] = nextQuantity;
      else delete allocations[order.id];
      changes.push({
        reference,
        data: {
          productId: item.productId,
          variantId: item.variantId,
          dateKey,
          reservedCount,
          allocations,
          lastOrderId: order.id,
        },
      });
    }
  }
  return changes;
};

const writeInventoryChanges = (transaction, changes) => {
  changes.forEach(({ reference, data }) => transaction.set(reference, data));
};

export const changeRentalOrder = async (
  orderId,
  action,
  payment = "credit",
  expectedReturnDate = null,
) => {
  const user = await waitForUser();
  if (!user || user.isAnonymous) throw new Error("ログインし直してください。");
  return runTransaction(db, async (transaction) => {
    const reference = doc(db, "orders", orderId);
    const snapshot = await transaction.get(reference);
    if (!snapshot.exists()) throw new Error("注文が見つかりません。");
    const order = { ...snapshot.data(), id: snapshot.id };
    if (action === "cancel" && order.status === "キャンセル") return order;
    if (action === "cancel") {
      const changes = order.inventoryReserved
        ? await readInventoryChanges(
            transaction,
            order,
            rentalDateKeys(order.arrivalDate, order.returnDate),
            -1,
          )
        : [];
      const next = { ...order, status: "キャンセル", cancelledAt: new Date().toISOString() };
      writeInventoryChanges(transaction, changes);
      transaction.update(reference, {
        status: next.status,
        cancelledAt: next.cancelledAt,
        updatedAt: serverTimestamp(),
      });
      return next;
    }
    if (
      action !== "extend" ||
      !["credit", "paypay"].includes(payment) ||
      order.status === "キャンセル" ||
      order.status === "返品完了" ||
      !order.inventoryReserved
    ) {
      throw new Error("この注文は延長できません。");
    }
    if (expectedReturnDate && order.returnDate !== expectedReturnDate) {
      if (order.returnDate === addRentalDays(expectedReturnDate, 1)) return order;
      throw new Error("レンタル期間が変更されています。履歴からもう一度お手続きください。");
    }
    const nextDate = addRentalDays(order.returnDate, 1);
    const changes = await readInventoryChanges(transaction, order, [nextDate], 1);
    const extensionFee = 440 * order.quantity;
    const next = {
      ...order,
      returnDate: nextDate,
      extensionCount: (order.extensionCount || 0) + 1,
      extensionTotal: (order.extensionTotal || 0) + extensionFee,
      lastExtensionPayment: payment === "credit" ? "クレジットカード" : "PayPay",
    };
    const format = (date) =>
      date
        .split("-")
        .map(Number)
        .map((value, index) => `${value}${["年", "月", "日"][index]}`)
        .join("");
    next.period = `${format(next.arrivalDate)}〜${format(next.returnDate)}`;
    writeInventoryChanges(transaction, changes);
    transaction.update(reference, {
      returnDate: next.returnDate,
      period: next.period,
      extensionCount: next.extensionCount,
      extensionTotal: next.extensionTotal,
      lastExtensionPayment: next.lastExtensionPayment,
      updatedAt: serverTimestamp(),
    });
    return next;
  });
};

export const loadRentalOrders = async () => {
  const user = await waitForUser();
  if (!user || user.isAnonymous) return [];
  await loadUserProfile(user);
  const snapshots = await getDocs(query(collection(db, "orders"), where("userId", "==", user.uid)));
  const orders = snapshots.docs.map((snapshot) => ({ ...snapshot.data(), id: snapshot.id }));
  orders.sort((a, b) => String(b.placedAt || "").localeCompare(String(a.placedAt || "")));
  window.userStorage.setItem("rentalOrders", JSON.stringify(orders));
  return orders;
};

export const reserveExistingRentalOrder = async (orderId) => {
  const user = await waitForUser();
  if (!user || !(await getDoc(doc(db, "admins", user.uid))).exists())
    throw new Error("管理者としてログインしてください。");
  return runTransaction(db, async (transaction) => {
    const reference = doc(db, "orders", orderId);
    const snapshot = await transaction.get(reference);
    if (!snapshot.exists()) throw new Error("注文が見つかりません。");
    const order = { ...snapshot.data(), id: snapshot.id };
    if (order.inventoryReserved || ["キャンセル", "返品完了"].includes(order.status)) return order;
    const requirements = inventoryRequirements(order, window.PRODUCTS);
    const updated = {
      ...order,
      inventoryReserved: true,
      variantSelections: Object.fromEntries(
        requirements.map((item) => [item.productId, item.variantId]),
      ),
      inventoryQuantities: Object.fromEntries(
        requirements.map((item) => [item.productId, item.quantity]),
      ),
    };
    const changes = await readInventoryChanges(
      transaction,
      updated,
      rentalDateKeys(order.arrivalDate, order.returnDate),
      1,
    );
    writeInventoryChanges(transaction, changes);
    transaction.update(reference, {
      inventoryReserved: true,
      variantSelections: updated.variantSelections,
      inventoryQuantities: updated.inventoryQuantities,
      updatedAt: serverTimestamp(),
    });
    return updated;
  });
};
