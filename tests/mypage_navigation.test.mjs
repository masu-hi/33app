import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parsers } from "prettier/plugins/html";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const nodes = (node) => [node, ...(node.children || []).flatMap(nodes)];
const attrs = (node) => Object.fromEntries((node.attrs || []).map((item) => [item.name, item.value]));

test("マイページ内の各項目はヘッダー左上から必ずマイページへ戻る", () => {
  const pages = ["member_info.html", "rental_history.html", "cancellation_refund.html", "favorites.html", "recently_viewed.html", "packing_checklist.html", "waitlist.html", "contact.html", "faq.html", "help.html", "color_change.html", "password_setting.html", "credit_card.html"];
  for (const page of pages) {
    const header = nodes(parsers.html.parse(read(page))).find((node) => node.name === "header");
    assert.equal(attrs(header).class, "app_header", page);
    const back = header.children.find((node) => node.name);
    assert.equal(back.name, "a", page);
    assert.equal(attrs(back).href, "mypage.html", page);
    assert.equal(attrs(back)["aria-label"], "マイページへ戻る", page);
    assert.equal("data-history-back" in attrs(back), false, page);
    assert.equal(attrs(nodes(back).find((node) => node.name === "img")).src, "assets/images/back.png", page);
    assert.equal(nodes(header).filter((node) => node.name === "a" && attrs(node).href === "notice.html").length, 1, page);
  }
});

test("最近見た商品の説明文は表示せず、商品一覧と空表示は残す", () => {
  const source = read("recently_viewed.html");
  assert.doesNotMatch(source, /最近表示した商品が新しい順に表示されます/);
  assert.match(source, /data-recently-viewed-list/);
  assert.match(source, /data-recently-viewed-empty/);
});

test("フッターから開く案内ページは設定・カウントダウン付きヘッダーに統一する", () => {
  for (const page of ["about.html", "usage_guide.html", "terms.html", "privacy_policy.html"]) {
    const header = nodes(parsers.html.parse(read(page))).find((node) => node.name === "header");
    const links = nodes(header).filter((node) => node.name === "a");
    assert.deepEqual(links.map((node) => attrs(node).href), ["color_change.html", "countdown.html", "notice.html", "cart.html"], page);
    const timer = nodes(links[1]).find((node) => node.name === "img");
    assert.equal(attrs(timer).src, "assets/images/timer-icon--outline.svg", page);
  }
});
