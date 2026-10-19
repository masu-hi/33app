(() => {
  if (sessionStorage.getItem("registrationCompleteToast") !== "true") return;
  sessionStorage.removeItem("registrationCompleteToast");
  const toast = document.createElement("p");
  toast.className = "app_toast";
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  toast.textContent = "アカウント登録が完了しました。";
  document.body.append(toast);
  window.requestAnimationFrame(() => toast.classList.add("is_visible"));
  window.setTimeout(() => toast.remove(), 3500);
})();
