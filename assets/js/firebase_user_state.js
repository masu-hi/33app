import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import {
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { auth, db } from "./firebase_config.js";
import {
  waitForUser,
  loadUserProfile,
  cacheUserProfile,
  saveUserProfile,
} from "./firebase_user.js";

let initialization;
let ownerId = null;
let subscriptions = [];
let subscriptionError = null;

const readJSON = (key, fallback) => {
  try {
    return JSON.parse(window.userStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

const checkOwner = () => {
  if (
    !ownerId ||
    auth.currentUser?.uid !== ownerId ||
    sessionStorage.getItem("activeUserId") !== ownerId
  )
    throw new Error("ログイン状態が変わりました。ログインし直してください。");
  if (subscriptionError)
    throw new Error("保存内容を確認できません。ページを再読み込みしてください。");
  return ownerId;
};

const cacheFavorites = (data) => {
  window.userStorage.setItem("favoriteProducts", JSON.stringify(data?.productIds || []));
  window.dispatchEvent(new CustomEvent("favorites:updated"));
};

const cacheCart = (data) => {
  const previousRevision = window.userStorage.getItem("cartRevision");
  const revision = data?.revision || "";
  window.userStorage.setItem("cartCount", String(data?.quantity || 0));
  if (data?.reservation && data.quantity > 0) {
    window.userStorage.setItem("pendingReservation", JSON.stringify(data.reservation));
  } else {
    window.userStorage.removeItem("pendingReservation");
  }
  window.userStorage.setItem("cartRevision", revision);
  if (previousRevision !== revision) window.userStorage.removeItem("pendingOrderId");
  window.dispatchEvent(new CustomEvent("cart:updated"));
};

export const initializeUserState = () => {
  if (initialization) return initialization;
  initialization = (async () => {
    const user = await waitForUser();
    if (!user || user.isAnonymous) {
      [
        "activeUserId",
        "activeAccountEmail",
        "isLoggedIn",
        "loggedInName",
        "checkoutShippingInfo",
      ].forEach((key) => sessionStorage.removeItem(key));
      window.dispatchEvent(new CustomEvent("favorites:updated"));
      window.dispatchEvent(new CustomEvent("cart:updated"));
      return null;
    }
    await loadUserProfile(user);
    ownerId = user.uid;
    const favoritesRef = doc(db, "users", ownerId, "favorites", "current");
    const cartRef = doc(db, "users", ownerId, "cart", "current");
    const localFavorites = readJSON("favoriteProducts", []);
    const reservation = readJSON("pendingReservation", null);
    const quantity = Number(window.userStorage.getItem("cartCount") || 0);
    // Empty cloud documents also mark migration complete, so deleted items cannot reappear.
    const initial = await runTransaction(db, async (transaction) => {
      checkOwner();
      const favoritesSnapshot = await transaction.get(favoritesRef);
      const cartSnapshot = await transaction.get(cartRef);
      const favorites = favoritesSnapshot.exists()
        ? favoritesSnapshot.data()
        : {
            productIds: Array.isArray(localFavorites)
              ? [...new Set(localFavorites.filter((id) => typeof id === "string"))]
              : [],
            updatedAt: serverTimestamp(),
          };
      const hasCart = reservation?.productId && Number.isInteger(quantity) && quantity > 0;
      const cart = cartSnapshot.exists()
        ? cartSnapshot.data()
        : {
            reservation: hasCart ? { ...reservation, quantity } : null,
            quantity: hasCart ? quantity : 0,
            revision: crypto.randomUUID(),
            updatedAt: serverTimestamp(),
          };
      if (!favoritesSnapshot.exists()) transaction.set(favoritesRef, favorites);
      if (!cartSnapshot.exists()) transaction.set(cartRef, cart);
      return { favorites, cart };
    });
    checkOwner();
    cacheFavorites(initial.favorites);
    cacheCart(initial.cart);
    const onError = (error) => {
      subscriptionError = error;
      window.dispatchEvent(new CustomEvent("user-state:error"));
    };
    subscriptions = [
      onSnapshot(
        doc(db, "users", ownerId),
        (snapshot) => {
          if (snapshot.metadata?.hasPendingWrites) return;
          if (
            auth.currentUser?.uid === ownerId &&
            sessionStorage.getItem("activeUserId") === ownerId
          )
            cacheUserProfile(user, snapshot.data() || {});
        },
        onError,
      ),
      onSnapshot(
        favoritesRef,
        (snapshot) => {
          if (
            auth.currentUser?.uid === ownerId &&
            sessionStorage.getItem("activeUserId") === ownerId
          )
            cacheFavorites(snapshot.data());
        },
        onError,
      ),
      onSnapshot(
        cartRef,
        (snapshot) => {
          if (
            auth.currentUser?.uid === ownerId &&
            sessionStorage.getItem("activeUserId") === ownerId
          )
            cacheCart(snapshot.data());
        },
        onError,
      ),
    ];
    subscriptions.push(
      onAuthStateChanged(auth, (current) => {
        if (current?.uid === ownerId) return;
        subscriptions.forEach((unsubscribe) => unsubscribe());
        ownerId = null;
        [
          "activeUserId",
          "activeAccountEmail",
          "isLoggedIn",
          "loggedInName",
          "checkoutShippingInfo",
        ].forEach((key) => sessionStorage.removeItem(key));
        window.location.replace("login.html");
      }),
    );
    window.addEventListener("pagehide", (event) => {
      if (!event.persisted) subscriptions.forEach((unsubscribe) => unsubscribe());
    });
    window.addEventListener("pageshow", (event) => {
      if (event.persisted) window.location.reload();
    });
    return user;
  })();
  return initialization;
};

export const saveFavorite = async (productId, selected) => {
  const uid = checkOwner();
  if (!productId || typeof productId !== "string") throw new Error("商品を確認できません。");
  const reference = doc(db, "users", uid, "favorites", "current");
  await runTransaction(db, async (transaction) => {
    checkOwner();
    const snapshot = await transaction.get(reference);
    const ids = new Set(snapshot.data()?.productIds || []);
    if (selected) ids.add(productId);
    else ids.delete(productId);
    transaction.set(reference, { productIds: [...ids], updatedAt: serverTimestamp() });
  });
};

export const saveProfile = async (changes, expectedValues = null) => {
  checkOwner();
  return saveUserProfile(auth.currentUser, changes, expectedValues);
};

export const saveCart = async (reservation, quantity, expectedRevision) => {
  const uid = checkOwner();
  if (!Number.isInteger(quantity) || quantity < 0 || (quantity > 0 && !reservation?.productId))
    throw new Error("商品と個数を確認してください。");
  const reference = doc(db, "users", uid, "cart", "current");
  await runTransaction(db, async (transaction) => {
    checkOwner();
    const snapshot = await transaction.get(reference);
    if ((snapshot.data()?.revision || "") !== expectedRevision)
      throw new Error(
        "別の画面でカートが変更されました。最新の内容を確認して、もう一度お試しください。",
      );
    transaction.set(reference, {
      reservation: quantity > 0 ? { ...reservation, quantity } : null,
      quantity,
      revision: crypto.randomUUID(),
      updatedAt: serverTimestamp(),
    });
  });
};
