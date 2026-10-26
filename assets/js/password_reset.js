const resetForm = document.querySelector("[data-password-reset-form]");
const resetError = document.querySelector("[data-password-reset-error]");
const resetResult = document.querySelector("[data-password-reset-result]");
const resetButton = resetForm.querySelector("button[type='submit']");
let resetCooldown = null;

resetForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (resetButton.disabled || !resetForm.reportValidity()) return;
  resetError.textContent = "";
  resetResult.hidden = true;
  resetButton.disabled = true;
  resetButton.textContent = "送信中…";
  resetForm.setAttribute("aria-busy", "true");
  try {
    const [{ auth }, { sendPasswordResetEmail }] = await Promise.all([
      import("./firebase_config.js"),
      import("https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js"),
    ]);
    auth.languageCode = "ja";
    try {
      await sendPasswordResetEmail(auth, resetForm.elements.email.value.trim());
    } catch (error) {
      // Do not disclose whether an email address belongs to an account.
      if (error.code !== "auth/user-not-found") throw error;
    }
    resetResult.hidden = false;
    resetResult.focus();
    resetButton.textContent = "再送信は1分後にできます";
    resetCooldown = setTimeout(() => {
      resetButton.disabled = false;
      resetButton.textContent = "再設定メールを再送する";
      resetCooldown = null;
    }, 60000);
  } catch (error) {
    const messages = {
      "auth/invalid-email": "メールアドレスの形式をご確認ください。",
      "auth/too-many-requests": "送信回数が多いため、しばらく時間をおいてお試しください。",
      "auth/network-request-failed":
        "通信できませんでした。インターネット接続を確認して、もう一度お試しください。",
    };
    resetError.textContent =
      messages[error.code] || "メールを送信できませんでした。時間をおいてもう一度お試しください。";
    resetButton.disabled = false;
    resetButton.textContent = "再設定メールを送る";
  } finally {
    resetForm.removeAttribute("aria-busy");
  }
});

window.addEventListener("pageshow", () => {
  if (resetCooldown !== null) {
    clearTimeout(resetCooldown);
    resetCooldown = null;
    resetButton.disabled = false;
    resetButton.textContent = "再設定メールを送る";
  }
});
