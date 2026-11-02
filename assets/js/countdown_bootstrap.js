import { initializeUserState } from "./firebase_user_state.js";
import { initializeCountdownStore } from "./countdown_store.js";

const pages = {
  "countdown.html": "./countdown.js",
  "countdown_add.html": "./countdown_add.js",
  "countdown_list.html": "./countdown_list.js",
  "countdown_detail.html": "./countdown_detail.js",
};
const status = document.createElement("p");
status.className = "countdown_sync_status";
status.setAttribute("role", "status");
document.querySelector(".app_shell").prepend(status);
const loading = document.querySelector("[data-countdown-loading]");
try {
  const user = await initializeUserState();
  if (!user || user.isAnonymous) {
    window.location.replace("login.html");
  } else {
    await initializeCountdownStore(user);
    await import("./app.js");
    await import(pages[window.location.pathname.split("/").pop()]);
    document.body.classList.remove("is_product_data_loading");
    loading.remove();
  }
} catch (error) {
  console.error("予定を読み込めませんでした。", error);
  loading.replaceChildren();
  const message = document.createElement("p");
  message.textContent =
    "予定を読み込めませんでした。接続状態とFirestoreルールを確認して、再読み込みしてください。";
  const retry = document.createElement("button");
  retry.type = "button";
  retry.textContent = "再読み込み";
  retry.addEventListener("click", () => window.location.reload());
  loading.append(message, retry);
}
window.addEventListener("countdown:error", () => {
  status.textContent = "予定との接続が切れました。入力内容を控え、再読み込みしてください。";
});
