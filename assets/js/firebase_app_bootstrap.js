import { loadFirebaseProducts } from "./firebase_products.js";

await loadFirebaseProducts();
let initialized = false;
try {
  if (
    document.querySelector(
      "[data-order-confirm], [data-rental-history], [data-cancellation-confirm], [data-extension-page], [data-rental-status-count]",
    )
  ) {
    const { saveRentalOrder, changeRentalOrder, loadRentalOrders } =
      await import("./firebase_orders.js");
    window.saveRentalOrder = saveRentalOrder;
    window.changeRentalOrder = changeRentalOrder;
    await loadRentalOrders();
  }
  await import("./app.js");
  initialized = true;
} catch (error) {
  console.error("レンタル情報を読み込めませんでした。", error);
  const loading = document.querySelector("[data-product-data-loading]");
  if (loading)
    loading.textContent = "情報を読み込めませんでした。ログイン画面から入り直してください。";
} finally {
  if (initialized) {
    document.body.classList.remove("is_product_data_loading");
    document.body.setAttribute("aria-busy", "false");
    document.querySelector("[data-product-data-loading]")?.remove();
  }
}
