import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parsers } from "prettier/plugins/html";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (path) => readFileSync(resolve(root, path), "utf8");
const nodes = (node) => [node, ...(node.children || []).flatMap(nodes)];
const attrs = (node) =>
  Object.fromEntries((node.attrs || []).map((attr) => [attr.name, attr.value]));

test("全ページのローカル画像・スクリプト・スタイル・リンク先が存在する", () => {
  for (const page of readdirSync(root).filter((name) => name.endsWith(".html"))) {
    for (const node of nodes(parsers.html.parse(read(page)))) {
      for (const attr of node.attrs || []) {
        if (!["src", "href", "action", "data-outline", "data-filled"].includes(attr.name)) continue;
        const value = attr.value || "";
        if (!value || /^(?:[a-z]+:|#|\/\/)/i.test(value)) continue;
        const path = decodeURIComponent(value.split(/[?#]/)[0]);
        if (path) assert.ok(existsSync(resolve(root, dirname(page), path)), `${page}: ${value}`);
      }
    }
  }
});

test("JavaScriptとCSS内の画像参照は削除済みファイルを指さない", () => {
  for (const dir of ["assets/js", "src/scss"]) {
    for (const name of readdirSync(resolve(root, dir)).filter((name) =>
      /\.(?:js|scss|css)$/.test(name),
    )) {
      const file = `${dir}/${name}`;
      for (const match of read(file).matchAll(
        /assets\/images\/[^"'`\s)]+\.(?:png|svg|webp)(?:#[^"'`\s)]+)?/g,
      )) {
        const path = match[0].split("#")[0];
        assert.ok(existsSync(resolve(root, path)), `${file}: ${path}`);
      }
    }
  }
});

test("旧セットURLは共通の商品詳細へ転送し、古い選択UIを残さない", () => {
  const source = read("set.html");
  const elements = nodes(parsers.html.parse(source));
  const redirect = elements.find((node) => attrs(node)["http-equiv"] === "refresh");
  assert.equal(attrs(redirect).content, "0; url=product_detail.html?id=set");
  assert.doesNotMatch(source, /data-product-detail|color_options|text_options/);
  assert.doesNotMatch(
    read("assets/js/product_detail.js"),
    /data-accordion-item|\.changebtn|\.color_options|\.text_options/,
  );
  assert.doesNotMatch(
    read("src/scss/_product_detail.scss"),
    /\.set_calendar|\.color_options|\.text_options/,
  );
});

test("検索ダミー商品を残さず、商品詳細からレビューへ普通のリンクで移動する", () => {
  const search = nodes(parsers.html.parse(read("search.html")));
  const list = search.find((node) => attrs(node).class === "result_list");
  assert.equal(nodes(list).filter((node) => node.name === "article").length, 0);
  const detail = nodes(parsers.html.parse(read("product_detail.html")));
  const reviewLink = detail.find((node) => node.name === "a" && attrs(node).href === "review.html");
  assert.ok(reviewLink);
  assert.equal(
    nodes(reviewLink).some((node) => node.name === "button"),
    false,
  );
  assert.doesNotMatch(read("assets/js/app.js"), /レビューは現在準備中|data-filter-button/);
  assert.doesNotMatch(read("review.html"), /src="assets\/js\/(product_data|product_detail)\.js"/);
});
