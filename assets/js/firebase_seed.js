import {
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import {
  doc,
  getDoc,
  serverTimestamp,
  writeBatch,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { app, auth, db } from "./firebase_config.js";

const form = document.querySelector("[data-firebase-seed-form]");
const status = document.querySelector("[data-seed-status]");

const variantTypes = {
  penlight: "type",
  bag: "color",
  binoculars: "type",
  fan: "message",
  fan_case: "color",
};

const setStatus = (message, isError = false) => {
  status.textContent = message;
  status.classList.toggle("is_success", !isError);
};

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submitButton = form.querySelector('button[type="submit"]');
  const submitLabel = submitButton.textContent;
  const values = new FormData(form);

  submitButton.disabled = true;
  submitButton.textContent = "Firebaseに接続中…";
  setStatus("管理者権限を確認しています。完了まで数秒お待ちください。");

  try {
    const credential = await signInWithEmailAndPassword(
      auth,
      String(values.get("email") || "").trim(),
      String(values.get("password") || ""),
    );
    const adminPath = `admins/${credential.user.uid}`;
    const adminSnapshot = await getDoc(doc(db, adminPath));

    if (!adminSnapshot.exists()) {
      throw new Error(
        `管理者ドキュメントを確認できませんでした。プロジェクト: ${app.options.projectId}`,
      );
    }

    const products = Object.values(window.PRODUCTS || {});
    const batch = writeBatch(db);
    let variantCount = 0;

    products.forEach((product) => {
      const { variants = [], ...productData } = product;
      const productReference = doc(db, "products", product.id);

      batch.set(
        productReference,
        {
          ...productData,
          isPublished: product.standalone !== false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      variants.forEach((variant, index) => {
        batch.set(
          doc(db, "products", product.id, "variants", variant.id),
          {
            id: variant.id,
            label: variant.label,
            optionType: variantTypes[product.id] || "type",
            optionValue: variant.label,
            totalStock: Number(variant.stock) || 0,
            isAvailable: Number(variant.stock) > 0,
            sortOrder: index,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
        variantCount += 1;
      });
    });

    await batch.commit();
    setStatus(`${products.length}商品・${variantCount}種類の在庫を登録しました。`);
    form.reset();
    await signOut(auth);
  } catch (error) {
    console.error(error);
    const message =
      error?.code === "auth/invalid-credential"
        ? "メールアドレスまたはパスワードが正しくありません。"
        : error.message || "商品データを登録できませんでした。";
    setStatus(message, true);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = submitLabel;
  }
});
