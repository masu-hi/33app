import {
  collection,
  doc,
  getDoc,
  query,
  where,
  runTransaction,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { db } from "./firebase_config.js";
import { waitForUser } from "./firebase_user.js";
import {
  inventoryRequirements,
  inventoryDayId,
  rentalDateKeys,
  addRentalDays,
} from "./rental_inventory.js";

const requireUser = async () => {
  const user = await waitForUser();
  if (!user || user.isAnonymous || sessionStorage.getItem("activeUserId") !== user.uid)
    throw new Error("空き待ち登録にはログインが必要です。");
  return user;
};

export const saveWaitlist = async (entry) => {
  const user = await requireUser();
  if (entry.endDate !== addRentalDays(entry.startDate, 3))
    throw new Error("希望期間を選択してください。");
  const quantity = Number(entry.quantity) || 1;
  const requirements = inventoryRequirements({ ...entry, quantity }, window.PRODUCTS);
  const selections = Object.fromEntries(
    requirements.map((item) => [item.productId, item.variantId]),
  );
  const identity = JSON.stringify([
    entry.productId,
    entry.startDate,
    entry.endDate,
    quantity,
    Object.entries(selections).sort(),
  ]);
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(identity));
  const hash = [...new Uint8Array(digest)]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
  const reference = doc(db, "waitlists", `${user.uid}-${hash}`);
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(reference);
    if (snapshot.exists()) return { ...snapshot.data(), id: snapshot.id };
    const saved = {
      productId: entry.productId,
      startDate: entry.startDate,
      endDate: entry.endDate,
      quantity,
      variantSelections: selections,
      selectedOptions: entry.selectedOptions || {},
      notify: entry.notify !== false,
      userId: user.uid,
      createdAt: new Date().toISOString(),
      generation: crypto.randomUUID(),
    };
    transaction.set(reference, saved);
    return { ...saved, id: reference.id };
  });
};

export const subscribeWaitlists = async (callback, onError) => {
  const user = await requireUser();
  return onSnapshot(
    query(collection(db, "waitlists"), where("userId", "==", user.uid)),
    (snapshot) => {
      const entries = snapshot.docs.map((item) => ({ ...item.data(), id: item.id }));
      entries.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
      window.userStorage.setItem("waitlistProducts", JSON.stringify(entries));
      callback(entries);
    },
    onError,
  );
};

export const removeWaitlist = async (id) => {
  await requireUser();
  await deleteDoc(doc(db, "waitlists", id));
};
export const changeWaitlistNotification = async (id, notify) => {
  await requireUser();
  await updateDoc(doc(db, "waitlists", id), { notify, updatedAt: serverTimestamp() });
};

export const isCloudWaitlistAvailable = (entry, products, days) => {
  try {
    if (entry.startDate < new Date().toLocaleDateString("sv-SE")) return false;
    if (
      !products[entry.productId] ||
      products[entry.productId].isPublic === false ||
      products[entry.productId].stockStatus === "unavailable"
    )
      return false;
    const requirements = inventoryRequirements(entry, products);
    return rentalDateKeys(entry.startDate, entry.endDate).every((date) =>
      requirements.every((item) => {
        const variant = products[item.productId]?.variants?.find(
          (value) => value.id === item.variantId,
        );
        return (
          Number(variant?.stock || 0) -
            Number(days[inventoryDayId(item.productId, item.variantId, date)] || 0) >=
          item.quantity
        );
      }),
    );
  } catch {
    return false;
  }
};

export const sendWaitlistNotification = async (id) => {
  const user = await waitForUser();
  if (!user || !(await getDoc(doc(db, "admins", user.uid))).exists())
    throw new Error("管理者としてログインしてください。");
  return runTransaction(db, async (transaction) => {
    const reference = doc(db, "waitlists", id);
    const snapshot = await transaction.get(reference);
    if (!snapshot.exists()) throw new Error("空き待ち登録が削除されています。");
    const entry = snapshot.data();
    if (entry.startDate < new Date().toLocaleDateString("sv-SE"))
      throw new Error("希望開始日を過ぎているため通知できません。");
    if (entry.notify === false) throw new Error("この方は通知を希望していません。");
    if (entry.notifiedAt) return false;
    const productSnapshot = await transaction.get(doc(db, "products", entry.productId));
    if (
      !productSnapshot.exists() ||
      productSnapshot.data().isPublished === false ||
      productSnapshot.data().stockStatus === "unavailable"
    )
      throw new Error("この商品は現在貸し出せません。");
    const requirements = inventoryRequirements(entry, window.PRODUCTS);
    const dates = rentalDateKeys(entry.startDate, entry.endDate);
    for (const item of requirements) {
      const variant = await transaction.get(
        doc(db, "products", item.productId, "variants", item.variantId),
      );
      if (!variant.exists()) throw new Error("選択された種類の在庫を確認できません。");
      for (const date of dates) {
        const day = await transaction.get(
          doc(db, "inventoryDays", inventoryDayId(item.productId, item.variantId, date)),
        );
        const reserved = day.exists() ? Number(day.data().reservedCount || 0) : 0;
        if (Number(variant.data().totalStock || 0) - reserved < item.quantity)
          throw new Error("希望期間・種類・個数の在庫が不足しています。");
      }
    }
    const notification = doc(
      db,
      "notifications",
      `waitlist-${id}-${entry.generation || "initial"}`,
    );
    const existing = await transaction.get(notification);
    const now = new Date().toISOString();
    if (!existing.exists())
      transaction.set(notification, {
        userId: entry.userId,
        category: "info",
        isRead: false,
        title: `【空きが出ました】${productSnapshot.data().name}`,
        message: `${entry.startDate}〜${entry.endDate}の希望期間に、選択された種類・個数で申し込める空きが出ました。先着順のため、商品は確保されません。`,
        productId: entry.productId,
        waitlistId: id,
        createdAt: now,
      });
    transaction.update(reference, { notifiedAt: now, updatedAt: serverTimestamp() });
    return !existing.exists();
  });
};
