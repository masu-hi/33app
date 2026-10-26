import { loadFirebaseProducts } from "./firebase_products.js";
import { initializeUserState } from "./firebase_user_state.js";

let initialized = false;
try {
  await Promise.all([loadFirebaseProducts(), initializeUserState()]);
  await import("./app.js");
  await import("./product_detail.js");
  window.dispatchEvent(new CustomEvent("favorites:updated"));
  initialized = true;
} catch (error) {
  console.error("商品・保存内容を読み込めませんでした。", error);
  const loading = document.querySelector("[data-product-data-loading]");
  if (loading) loading.textContent = "情報を読み込めませんでした。ページを再読み込みしてください。";
} finally {
  if (initialized) {
    document.body.classList.remove("is_product_data_loading");
    document.body.setAttribute("aria-busy", "false");
    document.querySelector("[data-product-data-loading]")?.remove();
  }
}
