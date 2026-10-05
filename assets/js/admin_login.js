import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { auth, db } from "./firebase_config.js";

const form = document.querySelector("[data-admin-login-form]");
const status = document.querySelector("[data-admin-login-status]");

const isAdmin = async (user) => {
  if (!user) return false;
  const snapshot = await getDoc(doc(db, "admins", user.uid));
  return snapshot.exists();
};

onAuthStateChanged(auth, async (user) => {
  if (await isAdmin(user)) window.location.replace("admin.html");
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = form.querySelector('button[type="submit"]');
  const values = new FormData(form);

  button.disabled = true;
  button.textContent = "確認中…";
  status.textContent = "";

  try {
    const credential = await signInWithEmailAndPassword(
      auth,
      String(values.get("email") || "").trim(),
      String(values.get("password") || ""),
    );

    if (!(await isAdmin(credential.user))) {
      await signOut(auth);
      throw new Error("このアカウントには管理者権限がありません。");
    }

    window.location.replace("admin.html");
  } catch (error) {
    status.textContent =
      error?.code === "auth/invalid-credential"
        ? "メールアドレスまたはパスワードが正しくありません。"
        : error.message || "ログインできませんでした。";
  } finally {
    button.disabled = false;
    button.textContent = "ログイン";
  }
});
