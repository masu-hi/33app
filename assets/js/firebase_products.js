import "./user_storage.js";

import {
  collection,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { db } from "./firebase_config.js";

let loadingPromise;

const loadVariants = async (productId) => {
  const snapshots = await getDocs(collection(db, "products", productId, "variants"));
  return snapshots.docs
    .map((snapshot) => ({
      id: snapshot.id,
      label: snapshot.data().label,
      stock: Number(snapshot.data().totalStock) || 0,
      sortOrder: Number(snapshot.data().sortOrder) || 0,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(({ sortOrder, ...variant }) => variant);
};

const syncProducts = async () => {
  if (!window.PRODUCTS) return false;

  const publishedQuery = query(collection(db, "products"), where("isPublished", "==", true));
  const productSnapshots = await getDocs(publishedQuery);
  const publishedIds = new Set(productSnapshots.docs.map((snapshot) => snapshot.id));

  productSnapshots.docs.forEach((snapshot) => {
    const firebaseProduct = snapshot.data();
    window.PRODUCTS[snapshot.id] = {
      ...(window.PRODUCTS[snapshot.id] || {}),
      ...firebaseProduct,
      id: snapshot.id,
      isPublic: true,
    };
  });

  Object.values(window.PRODUCTS).forEach((product) => {
    if (product.standalone !== false && !publishedIds.has(product.id)) {
      product.isPublic = false;
    }
  });

  const productIds = Object.keys(window.PRODUCTS);
  const variantEntries = await Promise.all(
    productIds.map(async (productId) => [productId, await loadVariants(productId)]),
  );

  variantEntries.forEach(([productId, variants]) => {
    if (!variants.length) return;
    window.PRODUCTS[productId].variants = variants;
    variants.forEach((variant) => {
      window.setVariantStock?.(productId, variant.id, variant.stock);
    });
  });

  try {
    const days = await getDocs(collection(db, "inventoryDays"));
    window.FIREBASE_INVENTORY_DAYS = Object.fromEntries(
      days.docs.map((day) => [day.id, day.data().reservedCount]),
    );
  } catch (error) {
    console.error("日付別在庫を読み込めませんでした。Firestoreルールを確認してください。", error);
  }
  window.FIREBASE_PRODUCTS_LOADED = true;
  window.dispatchEvent(new CustomEvent("firebase-products-ready"));
  return true;
};

export const loadFirebaseProducts = () => {
  if (!loadingPromise) {
    loadingPromise = syncProducts().catch((error) => {
      console.error("Firebaseの商品データを読み込めませんでした。", error);
      return false;
    });
  }
  return loadingPromise;
};
