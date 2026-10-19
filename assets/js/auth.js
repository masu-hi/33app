import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { auth } from "./firebase_config.js";
import { loadUserProfile, checkoutDestination } from "./firebase_user.js";

const termsBox = document.querySelector("[data-terms-scroll]");
const termsAgree = document.querySelector("[data-terms-agree]");
const termsHint = document.querySelector("[data-terms-hint]");
const confirmButton = document.querySelector("[data-confirm-button]");
const registerForm = document.querySelector("[data-register-form]");
const formError = document.querySelector("[data-form-error]");
const prefectureSelect = document.querySelector("[data-prefecture]");
const addressSearchButton = document.querySelector("[data-address-search]");
const postalStatus = document.querySelector("[data-postal-status]");
const normalizeEmail = (email) =>
  String(email || "")
    .trim()
    .toLowerCase();
const prefectures = [
  "北海道",
  "青森県",
  "岩手県",
  "宮城県",
  "秋田県",
  "山形県",
  "福島県",
  "茨城県",
  "栃木県",
  "群馬県",
  "埼玉県",
  "千葉県",
  "東京都",
  "神奈川県",
  "新潟県",
  "富山県",
  "石川県",
  "福井県",
  "山梨県",
  "長野県",
  "岐阜県",
  "静岡県",
  "愛知県",
  "三重県",
  "滋賀県",
  "京都府",
  "大阪府",
  "兵庫県",
  "奈良県",
  "和歌山県",
  "鳥取県",
  "島根県",
  "岡山県",
  "広島県",
  "山口県",
  "徳島県",
  "香川県",
  "愛媛県",
  "高知県",
  "福岡県",
  "佐賀県",
  "長崎県",
  "熊本県",
  "大分県",
  "宮崎県",
  "鹿児島県",
  "沖縄県",
];

prefectures.forEach((prefecture) => {
  prefectureSelect?.add(new Option(prefecture, prefecture));
});

addressSearchButton?.addEventListener("click", async () => {
  const first = registerForm.elements.postal_first.value.replace(/\D/g, "");
  const last = registerForm.elements.postal_last.value.replace(/\D/g, "");
  const zipcode = `${first}${last}`;

  if (!/^\d{7}$/.test(zipcode)) {
    postalStatus.textContent = "郵便番号を7桁で入力してください。";
    return;
  }

  addressSearchButton.disabled = true;
  postalStatus.textContent = "住所を検索しています。";

  try {
    const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zipcode}`);
    if (!response.ok) throw new Error("request failed");
    const data = await response.json();
    const result = data.results?.[0];

    if (!result) {
      postalStatus.textContent = "該当する住所が見つかりませんでした。";
      return;
    }

    registerForm.elements.prefecture.value = result.address1;
    registerForm.elements.address.value = `${result.address2}${result.address3}`;
    postalStatus.textContent = "住所を入力しました。番地以降を確認してください。";
    registerForm.elements.address.focus();
  } catch {
    postalStatus.textContent = "住所を検索できませんでした。通信環境を確認して再度お試しください。";
  } finally {
    addressSearchButton.disabled = false;
  }
});

const updateConfirmButton = () => {
  if (confirmButton && termsAgree) {
    confirmButton.disabled = !termsAgree.checked;
  }
};

termsBox?.addEventListener("scroll", () => {
  const reachedBottom = termsBox.scrollTop + termsBox.clientHeight >= termsBox.scrollHeight - 4;

  if (reachedBottom && termsAgree) {
    termsAgree.disabled = false;
    termsHint.textContent = "利用規約を最後まで確認しました";
  }
});

termsAgree?.addEventListener("change", updateConfirmButton);

registerForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(registerForm);

  if (formData.get("password") !== formData.get("password_confirm")) {
    formError.textContent = "パスワードとパスワード確認が一致していません。";
    return;
  }

  const values = Object.fromEntries(formData.entries());
  values.email = normalizeEmail(values.email);
  sessionStorage.setItem("registrationData", JSON.stringify(values));
  window.location.href = "register_confirm.html";
});

const confirmContent = document.querySelector("[data-confirm-content]");

if (confirmContent) {
  const values = JSON.parse(sessionStorage.getItem("registrationData") || "{}");
  const displayValues = {
    ...values,
    password: values.password ? "●".repeat(values.password.length) : "未入力",
  };

  document.querySelectorAll("[data-value]").forEach((element) => {
    element.textContent = displayValues[element.dataset.value] || "未入力";
  });
}

let registrationUser = null;
document.querySelector("[data-registration-submit]")?.addEventListener("click", async (event) => {
  event.preventDefault();
  const button = event.currentTarget;
  if (button.getAttribute("aria-disabled") === "true") return;
  const status = document.querySelector("[data-registration-error]");
  const values = JSON.parse(sessionStorage.getItem("registrationData") || "{}");
  const loginLink = document.querySelector("[data-registration-login]");
  if (loginLink) loginLink.hidden = true;
  if (!values.email || !values.password) {
    status.textContent = "入力情報を確認できませんでした。入力画面からもう一度お進みください。";
    return;
  }
  button.setAttribute("aria-disabled", "true");
  status.textContent = "登録しています。";
  try {
    // 詳細プロフィールは初回決済時に保存します。
    if (!registrationUser) {
      try {
        registrationUser = (
          await createUserWithEmailAndPassword(auth, values.email, values.password)
        ).user;
      } catch (error) {
        if (error.code !== "auth/email-already-in-use") throw error;
        // 登録後の再試行でも、本人確認ができた場合に限り完了へ進めます。
        status.textContent = "登録済みのアカウントを確認しています。";
        registrationUser = (await signInWithEmailAndPassword(auth, values.email, values.password))
          .user;
      }
    }
    await signOut(auth);
    sessionStorage.removeItem("registrationData");
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("activeAccountEmail");
    sessionStorage.removeItem("activeUserId");
    sessionStorage.removeItem("checkoutShippingInfo");
    sessionStorage.setItem("registrationCompleteToast", "true");
    window.location.replace("login.html");
  } catch (error) {
    const messages = {
      "auth/email-already-in-use": "このメールアドレスは登録済みです。ログインしてください。",
      "auth/invalid-credential":
        "このメールアドレスは登録済みですが、パスワードが一致しません。ログイン画面からお進みください。",
      "auth/weak-password": "パスワードを8文字以上で設定してください。",
      "auth/invalid-email": "メールアドレスを確認してください。",
      "auth/network-request-failed": "通信できませんでした。もう一度お試しください。",
    };
    status.textContent =
      messages[error.code] || "登録を完了できませんでした。もう一度お試しください。";
    if (
      loginLink &&
      ["auth/invalid-credential", "auth/email-already-in-use"].includes(error.code)
    ) {
      loginLink.hidden = false;
    }
    button.setAttribute("aria-disabled", "false");
  }
});

const loginForm = document.querySelector("[data-login-form]");

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const loginData = new FormData(loginForm);
  const email = normalizeEmail(loginData.get("email"));
  const password = String(loginData.get("password") || "");
  const loginError = loginForm.querySelector("[data-login-error]");
  const button = loginForm.querySelector('[type="submit"]');
  button.disabled = true;
  loginError.textContent = "ログインしています。";
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    await loadUserProfile(credential.user);
    sessionStorage.setItem("loginTransition", "true");
    const returnToCheckout = sessionStorage.getItem("loginReturnToCheckout") === "true";
    sessionStorage.removeItem("loginReturnToCheckout");
    window.location.href = returnToCheckout ? checkoutDestination() : loginForm.action;
  } catch (error) {
    loginError.textContent =
      error.code === "auth/invalid-credential"
        ? "メールアドレスまたはパスワードが正しくありません。"
        : "ログインを完了できませんでした。通信環境を確認してお試しください。";
    button.disabled = false;
  }
});
