const termsBox = document.querySelector("[data-terms-scroll]");
const termsAgree = document.querySelector("[data-terms-agree]");
const termsHint = document.querySelector("[data-terms-hint]");
const confirmButton = document.querySelector("[data-confirm-button]");
const registerForm = document.querySelector("[data-register-form]");
const formError = document.querySelector("[data-form-error]");
const prefectureSelect = document.querySelector("[data-prefecture]");
const addressSearchButton = document.querySelector("[data-address-search]");
const postalStatus = document.querySelector("[data-postal-status]");
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
  sessionStorage.setItem("registrationData", JSON.stringify(values));
  localStorage.setItem("favoriteColor", values.favorite_color);
  window.location.href = "register_confirm.html";
});

const confirmContent = document.querySelector("[data-confirm-content]");

if (confirmContent) {
  const values = JSON.parse(sessionStorage.getItem("registrationData") || "{}");
  const displayValues = {
    ...values,
    birthday: values.birth_year
      ? `${values.birth_year}年${values.birth_month}月${values.birth_day}日`
      : "未入力",
    postal: values.postal_first ? `${values.postal_first}-${values.postal_last}` : "未入力",
    password: values.password ? "●".repeat(values.password.length) : "未入力",
    password_confirm: values.password_confirm
      ? "●".repeat(values.password_confirm.length)
      : "未入力",
  };

  document.querySelectorAll("[data-value]").forEach((element) => {
    element.textContent = displayValues[element.dataset.value] || "未入力";
  });
}

if (document.querySelector("[data-registration-complete]")) {
  const values = JSON.parse(sessionStorage.getItem("registrationData") || "{}");

  if (values.favorite_color) {
    localStorage.setItem("favoriteColor", values.favorite_color);
  }
}
