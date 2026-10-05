import { loadFirebaseProducts } from "./firebase_products.js";

await loadFirebaseProducts();
await import("./app.js");
await import("./product_detail.js");
