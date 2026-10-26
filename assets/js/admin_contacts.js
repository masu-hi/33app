import { waitForUser } from "./firebase_user.js";
import { subscribeContacts, replyToContact } from "./firebase_contacts.js";

const list = document.querySelector("[data-admin-contacts]");
const status = document.querySelector("[data-contacts-status]");
const filter = document.querySelector("[data-contacts-filter]");
const drafts = new Map();
const sending = new Set();
let entries = [];

const render = () => {
  list.replaceChildren();
  document.querySelector("[data-contacts-total]").textContent = entries.length;
  document.querySelector("[data-contacts-pending]").textContent = entries.filter(
    (entry) => entry.status === "pending",
  ).length;
  const visible = entries.filter(
    (entry) => filter.value === "all" || entry.status === filter.value,
  );
  document.querySelector("[data-contacts-empty]").hidden = visible.length > 0;
  visible.forEach((entry) => {
    const item = document.createElement("article");
    item.className = "admin_contact";
    const title = document.createElement("h2");
    title.textContent = `${entry.type} / ${entry.status === "replied" ? "返信済み" : "未返信"}`;
    const sender = document.createElement("p");
    sender.textContent = `送信者：${entry.senderName}（${entry.senderEmail}）`;
    const date = document.createElement("p");
    date.textContent = `受付日時：${new Date(entry.createdAt).toLocaleString("ja-JP")}`;
    const message = document.createElement("p");
    message.className = "admin_contact__message";
    message.textContent = entry.message;
    item.append(title, sender, date, message);
    if (entry.status === "replied") {
      const reply = document.createElement("p");
      reply.className = "admin_contact__message";
      reply.textContent = `返信（${new Date(entry.repliedAt).toLocaleString("ja-JP")}）\n${entry.reply}`;
      item.append(reply);
    } else {
      const form = document.createElement("form");
      const label = document.createElement("label");
      label.textContent = "返信内容";
      const input = document.createElement("textarea");
      input.required = true;
      input.maxLength = 5000;
      input.value = drafts.get(entry.id) || "";
      input.disabled = sending.has(entry.id);
      input.addEventListener("input", () => drafts.set(entry.id, input.value));
      label.append(input);
      const button = document.createElement("button");
      button.type = "submit";
      button.textContent = sending.has(entry.id) ? "送信中…" : "返信を送信する";
      button.disabled = sending.has(entry.id);
      form.append(label, button);
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (sending.has(entry.id)) return;
        sending.add(entry.id);
        input.disabled = true;
        button.disabled = true;
        status.textContent = "返信を送信しています。";
        try {
          await replyToContact(entry.id, input.value);
          drafts.delete(entry.id);
          status.textContent = "返信を送信しました。利用者のお知らせに届きます。";
        } catch (error) {
          status.textContent = error.code
            ? "送信できませんでした。入力内容を確認して再度お試しください。"
            : error.message;
        } finally {
          sending.delete(entry.id);
          render();
        }
      });
      item.append(form);
    }
    list.append(item);
  });
};
filter.addEventListener("change", render);
if (await waitForUser()) {
  const unsubscribe = subscribeContacts(
    null,
    (updated) => {
      entries = updated;
      if (status.textContent === "お問い合わせを読み込んでいます。") status.textContent = "";
      render();
    },
    () => {
      status.textContent = "読み込めませんでした。管理者権限とFirestoreルールをご確認ください。";
    },
  );
  window.addEventListener("pagehide", (event) => {
    if (!event.persisted) unsubscribe();
  });
}
