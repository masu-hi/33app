import { initializeUserState } from "./firebase_user_state.js";

try {
  const user = await initializeUserState();
  if (!user) {
    window.location.replace("login.html");
  } else {
    await import("./app.js");
    document.body.classList.remove("is_product_data_loading");
    document.body.setAttribute("aria-busy", "false");
    document.querySelector("[data-product-data-loading]")?.remove();
  }
} catch (error) {
  console.error("会員情報を読み込めませんでした。", error);
  const loading = document.querySelector("[data-product-data-loading]");
  if (loading)
    loading.textContent = "会員情報を読み込めませんでした。ページを再読み込みしてください。";
}
