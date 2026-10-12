import { waitForUser, loadUserProfile, isProfileComplete } from "./firebase_user.js";

try {
  const user = await waitForUser();
  sessionStorage.setItem("checkoutReturnPath", `checkout.html${window.location.search}`);
  if (!user || user.isAnonymous) {
    sessionStorage.setItem("loginReturnToCheckout", "true");
    window.location.replace("login.html");
  } else {
    const profile = await loadUserProfile(user);
    if (!isProfileComplete(profile)) {
      window.location.replace("checkout_profile.html");
    } else {
      await import("./app.js");
      document.body.classList.remove("is_product_data_loading");
      document.body.setAttribute("aria-busy", "false");
      document.querySelector("[data-product-data-loading]")?.remove();
    }
  }
} catch (error) {
  console.error("会員情報を確認できませんでした。", error);
  const message = document.querySelector("[data-product-data-loading]");
  message.textContent = "会員情報を確認できませんでした。ページを再読み込みしてください。";
}
