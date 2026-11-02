import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parsers } from "prettier/plugins/html";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const attributes = (node) => Object.fromEntries((node.attrs || []).map((attr) => [attr.name, attr.value]));
const descendants = (node) => [node, ...(node.children || []).flatMap(descendants)];
const hasClass = (node, name) => (attributes(node).class || "").split(/\s+/).includes(name);

test("アーティスト検索の各領域は一度だけ表示され、画像の中へ入れ子にならない", () => {
  const tree = parsers.html.parse(read("artist_search.html"));
  const nodes = descendants(tree);
  const main = nodes.find((node) => node.name === "main");
  for (const className of ["app_header", "search_intro", "app_search", "artist_content", "app_footer", "bottom_nav"]) {
    const matches = nodes.filter((node) => hasClass(node, className));
    assert.equal(matches.length, 1, `${className}は一つだけ`);
    assert.ok(main.children.includes(matches[0]), `${className}はmainの直下`);
  }
  const visual = nodes.find((node) => hasClass(node, "search_choice__visual"));
  assert.equal(attributes(visual)["aria-hidden"], "true");
  assert.equal(descendants(visual).some((node) => ["h1", "form", "section", "nav", "footer"].includes(node.name)), false);
  assert.equal(nodes.filter((node) => node.name === "h1").length, 1);
  assert.equal(nodes.filter((node) => "data-artist-select" in attributes(node)).length, 8);
});

test("ホームからアーティスト検索へつながり、検索先とアーティストIDを保持する", () => {
  const home = descendants(parsers.html.parse(read("home.html")));
  assert.equal(attributes(home.find((node) => hasClass(node, "search_choice--artist"))).href, "artist_search.html");
  const artist = descendants(parsers.html.parse(read("artist_search.html")));
  const form = artist.find((node) => node.name === "form");
  assert.equal(attributes(form).action, "search.html");
  assert.equal(attributes(descendants(form).find((node) => node.name === "input")).name, "artist");
  assert.deepEqual(artist.filter((node) => "data-artist-select" in attributes(node)).map((node) => attributes(node)["data-artist-id"]), ["lumina", "sora-note", "mint-parade", "vivid-loop", "nocturne", "snow-drop", "coral-beat", "sunny-days"]);
});
