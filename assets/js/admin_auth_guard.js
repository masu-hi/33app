import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { auth, db } from "./firebase_config.js";

const redirectToLogin = async () => {
  await signOut(auth).catch(() => {});
  window.location.replace("admin_login.html");
};

onAuthStateChanged(auth, async (user) => {
  try {
    if (!user) {
      await redirectToLogin();
      return;
    }

    const adminSnapshot = await getDoc(doc(db, "admins", user.uid));
    if (!adminSnapshot.exists()) {
      await redirectToLogin();
      return;
    }

    document.body.classList.remove("is_auth_pending");
  } catch (error) {
    console.error("管理者権限を確認できませんでした。", error);
    await redirectToLogin();
  }
});

document.querySelector("[data-admin-logout]")?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.replace("admin_login.html");
});
