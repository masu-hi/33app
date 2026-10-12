import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { auth, db } from "./firebase_config.js";
import "./user_storage.js";

export const waitForUser = () =>
  new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });

export const cacheUserProfile = (user, profile) => {
  const email = user.email.trim().toLowerCase();
  const previousUserId = sessionStorage.getItem("activeUserId");
  sessionStorage.setItem("activeUserId", user.uid);
  const accounts = JSON.parse(localStorage.getItem("accounts") || "{}");
  accounts[email] = { profile: { ...profile, email } };
  localStorage.setItem("accounts", JSON.stringify(accounts));
  sessionStorage.setItem("activeAccountEmail", email);
  sessionStorage.setItem("isLoggedIn", "true");
  sessionStorage.setItem("loggedInName", profile.name || "会員様");
  if (previousUserId !== user.uid) sessionStorage.removeItem("checkoutShippingInfo");
  sessionStorage.removeItem("registrationData");
  if (profile.favorite_color) window.userStorage.setItem("favoriteColor", profile.favorite_color);
  else window.userStorage.removeItem("favoriteColor");
};

export const loadUserProfile = async (user) => {
  const snapshot = await getDoc(doc(db, "users", user.uid));
  const profile = snapshot.exists() ? snapshot.data() : { email: user.email };
  cacheUserProfile(user, profile);
  return profile;
};

export const saveUserProfile = async (user, profile) => {
  const reference = doc(db, "users", user.uid);
  const snapshot = await getDoc(reference);
  await setDoc(
    reference,
    {
      ...profile,
      email: user.email,
      ...(snapshot.exists() ? {} : { role: "user", createdAt: serverTimestamp() }),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
  cacheUserProfile(user, { ...(snapshot.data() || {}), ...profile });
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
