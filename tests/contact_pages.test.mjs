import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("全管理メニューからお問い合わせ一覧へ移動できる", () => {
  for (const file of ["admin.html", "admin_dashboard.html", "admin_orders.html", "admin_waitlist.html", "admin_contacts.html"]) {
    assert.match(read(file), /href="admin_contacts.html"/);
  }
  const page = read("admin_contacts.html");
  assert.match(page, /admin_auth_guard.js/);
  assert.match(page, /data-admin-contacts/);
  assert.match(page, /data-contacts-filter/);
});

test("お問い合わせは保存処理へつながり、従来の表示だけの受付処理を残さない", () => {
  assert.match(read("contact.html"), /type="module" src="assets\/js\/contact.js"/);
  assert.doesNotMatch(read("assets/js/app.js"), /contactForm\?\.addEventListener/);
  const contact = read("assets/js/contact.js");
  assert.match(contact, /await submitContact\(requestId, values\)/);
  assert.ok(contact.indexOf("await submitContact") < contact.indexOf("form.reset()"));
  assert.match(contact, /subscribeContacts\(\s*user.uid/);
  assert.match(read("assets/js/app.js"), /notice.contactId\s*\? "contact.html"/);
});

test("キャンセル規定ボタンはガイドの該当箇所へ直接移動する", () => {
  assert.match(read("cancellation_refund.html"), /href="usage_guide.html#cancellation-refund"/);
  assert.match(read("usage_guide.html"), /id="cancellation-refund"/);
  assert.match(read("src/scss/style.scss"), /#cancellation-refund\s*\{\s*scroll-margin-top: 111px/);
});
