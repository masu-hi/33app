import { loadFirebaseProducts } from "./firebase_products.js";

await loadFirebaseProducts();
try {
  await import("./app.js");
  await import("./product_detail.js");
} finally {
  document.body.classList.remove("is_product_data_loading");
  document.body.setAttribute("aria-busy", "false");
  document.querySelector("[data-product-data-loading]")?.remove();
}
