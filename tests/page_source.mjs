import { readFileSync } from "node:fs";
import { pages as account } from "../assets/js/account_pages.js";
import { pages as admin } from "../assets/js/admin_pages.js";
import { pages as auth } from "../assets/js/auth_pages.js";
import { pages as browse } from "../assets/js/browse_pages.js";
import { pages as countdown } from "../assets/js/countdown_pages.js";
import { pages as guide } from "../assets/js/guide_pages.js";
import { pages as rental } from "../assets/js/rental_pages.js";

export const pageGroups = { account, admin, auth, browse, countdown, guide, rental };
const templates = new Map(
  Object.values(pageGroups).flatMap((pages) =>
    Object.values(pages).map((page) => [page.page, page]),
  ),
);
export const templateNames = [...templates.keys()];

export const readPageSource = (path) => {
  const template = templates.get(path);
  if (!template) return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
  const attrs = Object.entries(template.bodyAttributes)
    .map(([name, value]) => `${name}="${value}"`)
    .join(" ");
  const scripts = template.scripts.map((script) => {
    if (script.startsWith("module:")) {
      return `<script type="module" src="assets/js/${script.slice(7)}"></script>`;
    }
    return `<script src="assets/js/${script}"></script>`;
  });
  return `<body ${attrs}>${template.markup}${scripts.join("")}</body>`;
};
