import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../assets/js/password_reset.js", import.meta.url), "utf8")
  .replace('import("./firebase_config.js")', "Promise.resolve({ auth: sdkAuth })")
  .replace(
    'import("https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js")',
    "Promise.resolve({ sendPasswordResetEmail: sdkSend })",
  );

function fixture(code) {
  let submit;
  let retry;
  let calls = 0;
  const button = { disabled: false, textContent: "" };
  const result = { hidden: true, focus() {} };
  const error = { textContent: "" };
  const auth = {};
  const form = {
    elements: { email: { value: " user@example.com " } },
    querySelector: () => button,
    reportValidity: () => true,
    setAttribute() {},
    removeAttribute() {},
    addEventListener: (name, handler) => {
      submit = handler;
    },
  };
  vm.runInNewContext(source, {
    sdkAuth: auth,
    document: {
      querySelector: (selector) =>
        ({
          "[data-password-reset-form]": form,
          "[data-password-reset-error]": error,
          "[data-password-reset-result]": result,
        })[selector],
    },
    window: { addEventListener() {} },
    setTimeout: (handler) => {
      retry = handler;
      return 1;
    },
    clearTimeout() {},
    sdkSend: async (selectedAuth, email) => {
      calls++;
      assert.equal(selectedAuth, auth);
      assert.equal(email, "user@example.com");
      if (code) throw { code };
    },
  });
  return {
    button,
    result,
    error,
    auth,
    calls: () => calls,
    submit: () => submit({ preventDefault() {} }),
    retry: () => retry(),
  };
}

test("日本語の再設定メールを送り、連続送信を防ぎ、1分後に再送できる", async () => {
  const page = fixture();
  await page.submit();
  assert.equal(page.auth.languageCode, "ja");
  assert.equal(page.result.hidden, false);
  assert.equal(page.button.disabled, true);
  await page.submit();
  assert.equal(page.calls(), 1);
  page.retry();
  assert.equal(page.button.disabled, false);
});

test("未登録アドレスでも登録の有無を表示しない", async () => {
  const page = fixture("auth/user-not-found");
  await page.submit();
  assert.equal(page.result.hidden, false);
  assert.equal(page.error.textContent, "");
});

test("通信失敗時には再試行できる", async () => {
  const page = fixture("auth/network-request-failed");
  await page.submit();
  assert.match(page.error.textContent, /インターネット接続/);
  assert.equal(page.result.hidden, true);
  assert.equal(page.button.disabled, false);
});

test("送信制限時には時間をおく案内を表示する", async () => {
  const page = fixture("auth/too-many-requests");
  await page.submit();
  assert.match(page.error.textContent, /時間をおいて/);
  assert.equal(page.button.disabled, false);
});
