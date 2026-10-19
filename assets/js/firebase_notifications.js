import {
  collection,
  doc,
  query,
  where,
  onSnapshot,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { db } from "./firebase_config.js";
import { waitForUser } from "./firebase_user.js";

export const markNotificationRead = async (id) => {
  const user = await waitForUser();
  if (!user || sessionStorage.getItem("activeUserId") !== user.uid)
    throw new Error("ログインし直してください。");
  await updateDoc(doc(db, "notifications", id), { isRead: true });
};

export const subscribeNotifications = async () => {
  const user = await waitForUser();
  if (!user || user.isAnonymous || sessionStorage.getItem("activeUserId") !== user.uid) return;
  const unsubscribe = onSnapshot(
    query(collection(db, "notifications"), where("userId", "==", user.uid)),
    (snapshot) => {
      const notices = snapshot.docs.map((item) => ({ ...item.data(), id: item.id }));
      notices.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
      window.userStorage.setItem("appNotifications", JSON.stringify(notices));
      window.dispatchEvent(new CustomEvent("notifications:updated"));
    },
    (error) => console.error("通知を読み込めませんでした。", error),
  );
  window.addEventListener("pagehide", (event) => {
    if (!event.persisted) unsubscribe();
  });
};
