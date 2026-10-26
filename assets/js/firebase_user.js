import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { auth, db } from "./firebase_config.js";
import "./user_storage.js";

const profileFields = [
  "name",
  "kana",
  "phone",
  "birth_year",
  "birth_month",
  "birth_day",
  "postal_first",
  "postal_last",
  "prefecture",
  "address",
  "building",
  "favorite_color",
];
const profileColors = ["赤", "青", "ピンク", "紫", "緑", "黄色", "オレンジ", "水色", "白", "黒"];
const requireCurrentUser = (user) => {
  if (!user || user.isAnonymous || auth.currentUser?.uid !== user.uid)
    throw new Error("ログイン状態が変わりました。ログインし直してください。");
};
const fieldValue = (key, value) => {
  const text = String(value ?? "").trim();
  return key.startsWith("birth_") && text ? String(Number(text)) : text;
};

const validateProfileChanges = (changes, previous) => {
  for (const [key, value] of Object.entries(changes)) {
    if (key !== "building" && !value) throw new Error("必須項目を入力してください。");
  }
  if ("phone" in changes && !/^\d{10,11}$/.test(changes.phone.replace(/-/g, "")))
    throw new Error("電話番号は10桁または11桁の数字で入力してください。");
  if (
    ("postal_first" in changes && !/^\d{3}$/.test(changes.postal_first)) ||
    ("postal_last" in changes && !/^\d{4}$/.test(changes.postal_last))
  )
    throw new Error("郵便番号を3桁と4桁で入力してください。");
  if ("favorite_color" in changes && !profileColors.includes(changes.favorite_color))
    throw new Error("推しカラーを選択してください。");
  if (["birth_year", "birth_month", "birth_day"].some((key) => key in changes)) {
    const values = { ...previous, ...changes };
    const year = Number(values.birth_year);
    const month = Number(values.birth_month);
    const day = Number(values.birth_day);
    const date = new Date(year, month - 1, day);
    if (
      year < 1900 ||
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day ||
      date > new Date()
    )
      throw new Error("生年月日を正しく入力してください。");
  }
};

export const waitForUser = () =>
  new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });

export const cacheUserProfile = (user, profile) => {
  requireCurrentUser(user);
  const email = user.email.trim().toLowerCase();
  const previousUserId = sessionStorage.getItem("activeUserId");
  sessionStorage.setItem("activeUserId", user.uid);
  const accounts = JSON.parse(localStorage.getItem("accounts") || "{}");
  const cachedProfile = {
    ...Object.fromEntries(
      profileFields.filter((key) => key in profile).map((key) => [key, profile[key]]),
    ),
    email,
  };
  accounts[email] = { profile: cachedProfile };
  localStorage.setItem("accounts", JSON.stringify(accounts));
  sessionStorage.setItem("activeAccountEmail", email);
  sessionStorage.setItem("isLoggedIn", "true");
  sessionStorage.setItem("loggedInName", profile.name || "会員様");
  if (previousUserId !== user.uid) sessionStorage.removeItem("checkoutShippingInfo");
  sessionStorage.removeItem("registrationData");
  if (profile.favorite_color) window.userStorage.setItem("favoriteColor", profile.favorite_color);
  else window.userStorage.removeItem("favoriteColor");
  window.userStorage.setItem("memberProfile", JSON.stringify(cachedProfile));
  window.userStorage.setItem("accountName", profile.name || "会員様");
  window.dispatchEvent(new CustomEvent("profile:updated"));
};

export const loadUserProfile = async (user) => {
  requireCurrentUser(user);
  const snapshot = await getDoc(doc(db, "users", user.uid));
  const profile = snapshot.exists() ? snapshot.data() : { email: user.email };
  cacheUserProfile(user, profile);
  return profile;
};

export const saveUserProfile = async (user, profile, expectedValues = null) => {
  requireCurrentUser(user);
  if (sessionStorage.getItem("activeUserId") !== user.uid)
    throw new Error("ログインし直してください。");
  if (profile.email && profile.email.trim().toLowerCase() !== user.email.trim().toLowerCase())
    throw new Error("メールアドレスはログイン用のアドレスを使用してください。");
  const changes = Object.fromEntries(
    profileFields
      .filter((key) => key in profile)
      .map((key) => [key, fieldValue(key, profile[key])]),
  );
  const reference = doc(db, "users", user.uid);
  const saved = await runTransaction(db, async (transaction) => {
    requireCurrentUser(user);
    const snapshot = await transaction.get(reference);
    const previous = snapshot.data() || {};
    if (
      expectedValues &&
      Object.keys(changes).some(
        (key) => fieldValue(key, previous[key]) !== fieldValue(key, expectedValues[key]),
      )
    ) {
      const error = new Error(
        "別の画面で会員情報が変更されました。入力内容を控え、キャンセルして最新の情報を確認してから、もう一度変更してください。",
      );
      error.code = "profile/conflict";
      throw error;
    }
    validateProfileChanges(changes, previous);
    const next = {
      ...previous,
      ...changes,
      email: user.email,
      ...(snapshot.exists() ? {} : { role: "user", createdAt: serverTimestamp() }),
      updatedAt: serverTimestamp(),
    };
    transaction.set(reference, next);
    return next;
  });
  cacheUserProfile(user, saved);
  return saved;
};

export const isProfileComplete = (profile) =>
  [
    "name",
    "phone",
    "birth_year",
    "birth_month",
    "birth_day",
    "postal_first",
    "postal_last",
    "prefecture",
    "address",
    "favorite_color",
  ].every((key) => String(profile?.[key] || "").trim());

export const checkoutDestination = () => {
  const value = sessionStorage.getItem("checkoutReturnPath") || "checkout.html";
  const url = new URL(value, window.location.href);
  return url.origin === window.location.origin && url.pathname.endsWith("/checkout.html")
    ? `${url.pathname.split("/").pop()}${url.search}`
    : "checkout.html";
};
