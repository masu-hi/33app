import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../assets/js/product_data.js", import.meta.url), "utf8");
const fixture = () => {
  const window = { userStorage: { getItem: () => null } };
  vm.runInNewContext(source, { window });
  return window;
};

test("全商品の基本期間を4日間に統一し、古いFirebaseの3日間も表示へ持ち込まない", () => {
  const window = fixture();
  for (const product of Object.values(window.PRODUCTS)) {
    assert.equal(product.rentalDays, 4);
    window.PRODUCTS[product.id].rentalDays = 3;
    window.FIREBASE_PRODUCTS_LOADED = true;
    assert.equal(window.getProductData(product.id).rentalDays, 4);
  }
});

test("セットの標準画像は生成済みのWebPを使用する", () => {
  const window = fixture();
  assert.equal(window.getProductData("set").images[0], "assets/images/set_hero.webp");
  assert.equal(existsSync(new URL("../assets/images/set_hero.webp", import.meta.url)), true);
});

test("Firebaseの旧画像だけを置換し、価格や他の画像は変更しない", () => {
  const window = fixture();
  window.FIREBASE_PRODUCTS_LOADED = true;
  window.PRODUCTS.set = {
    ...window.PRODUCTS.set,
    price: 7280,
    images: ["assets/images/setto.png", "assets/images/custom_set.webp"],
  };
  const product = window.getProductData("set");
  assert.equal(product.images[0], "assets/images/set_hero.webp");
  assert.equal(product.images[1], "assets/images/custom_set.webp");
  assert.equal(product.price, 7280);
  assert.equal(window.getProductData("bag").images[0], "assets/images/bag_hero.png");
  window.PRODUCTS.set.images = ["assets/images/custom_set.webp"];
  assert.equal(window.getProductData("set").images[0], "assets/images/custom_set.webp");
});
