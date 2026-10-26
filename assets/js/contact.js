import { waitForUser } from "./firebase_user.js";
import { initializeUserState } from "./firebase_user_state.js";
import { submitContact, subscribeContacts } from "./firebase_contacts.js";

const form = document.querySelector("[data-contact-form]");
const status = document.querySelector("[data-contact-status]");
const history = document.querySelector("[data-contact-history]");
const historyStatus = document.querySelector("[data-contact-history-status]");
const controls = [...form.elements];
const setDisabled = (disabled) =>
  controls.forEach((control) => {
    control.disabled = disabled;
  });
let requestId = crypto.randomUUID();
let sending = false;
setDisabled(true);
form.addEventListener("input", () => {
  if (!sending) requestId = crypto.randomUUID();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (sending) return;
  const values = Object.fromEntries(new FormData(form));
  sending = true;
  setDisabled(true);
  status.textContent = "送信しています。";
  try {
    await submitContact(requestId, values);
    requestId = crypto.randomUUID();
    form.reset();
    status.textContent = "お問い合わせを受け付けました。返信はお知らせに届きます。";
  } catch (error) {
    status.textContent = error.code
      ? "送信できませんでした。時間をおいて再度お試しください。"
      : error.message;
  } finally {
    sending = false;
    setDisabled(false);
  }
});

try {
  await initializeUserState();
  await import("./app.js");
  const user = await waitForUser();
  if (!user || user.isAnonymous) {
    document.querySelector("[data-contact-login]").hidden = false;
    status.textContent = "ログインすると送信できます。";
  } else {
    setDisabled(false);
    historyStatus.textContent = "読み込んでいます。";
    const unsubscribe = subscribeContacts(
      user.uid,
      (entries) => {
        history.replaceChildren();
        historyStatus.textContent = entries.length ? "" : "まだお問い合わせはありません。";
        entries.forEach((entry) => {
          const item = document.createElement("details");
          const title = document.createElement("summary");
          const message = document.createElement("p");
          title.textContent = `${entry.type} / ${entry.status === "replied" ? "返信済み" : "返信待ち"}`;
          message.textContent = entry.message;
          item.append(title, message);
          if (entry.reply) {
            const reply = document.createElement("p");
            reply.textContent = `返信：${entry.reply}`;
            item.append(reply);
          }
          history.append(item);
        });
      },
      () => {
        historyStatus.textContent = "お問い合わせを読み込めませんでした。再読み込みしてください。";
      },
    );
    window.addEventListener("pagehide", (event) => {
      if (!event.persisted) unsubscribe();
    });
  }
} catch {
  status.textContent = "ログイン状態を確認できませんでした。ページを再読み込みしてください。";
}
