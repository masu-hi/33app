import {
  waitForUser,
  loadUserProfile,
  saveUserProfile,
  isProfileComplete,
  checkoutDestination,
} from "./firebase_user.js";

const form = document.querySelector("[data-checkout-profile]");
const status = document.querySelector("[data-profile-status]");
const submit = form.querySelector('[type="submit"]');
const prefectures =
  "北海道 青森県 岩手県 宮城県 秋田県 山形県 福島県 茨城県 栃木県 群馬県 埼玉県 千葉県 東京都 神奈川県 新潟県 富山県 石川県 福井県 山梨県 長野県 岐阜県 静岡県 愛知県 三重県 京都府 大阪府 兵庫県 奈良県 和歌山県 鳥取県 島根県 岡山県 広島県 山口県 徳島県 香川県 愛媛県 高知県 福岡県 佐賀県 長崎県 熊本県 大分県 宮崎県 鹿児島県 沖縄県 滋賀県".split(
    " ",
  );
prefectures.forEach((name) => form.elements.prefecture.add(new Option(name, name)));
let user;
try {
  user = await waitForUser();
  if (!user || user.isAnonymous) {
    sessionStorage.setItem("loginReturnToCheckout", "true");
    window.location.replace("login.html");
  } else {
    const profile = await loadUserProfile(user);
    if (isProfileComplete(profile)) window.location.replace(checkoutDestination());
    else {
      for (const [key, value] of Object.entries(profile)) {
        const field = form.elements.namedItem(key);
        if (field) field.value = value;
      }
      window.setBirthdayFields(form, profile);
      form.elements.email.value = user.email;
      submit.disabled = false;
    }
  }
} catch {
  status.textContent = "会員情報を読み込めませんでした。再読み込みしてください。";
}

await import("./app.js");

document.querySelector("[data-profile-address-search]").addEventListener("click", async (event) => {
  const zipcode = `${form.elements.postal_first.value}${form.elements.postal_last.value}`.replace(
    /\D/g,
    "",
  );
  const message = document.querySelector("[data-profile-postal-status]");
  if (!/^\d{7}$/.test(zipcode)) {
    message.textContent = "郵便番号を7桁で入力してください。";
    return;
  }
  event.currentTarget.disabled = true;
  try {
    const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zipcode}`);
    if (!response.ok) throw new Error();
    const result = (await response.json()).results?.[0];
    if (!result) {
      message.textContent = "該当する住所が見つかりませんでした。";
      return;
    }
    form.elements.prefecture.value = result.address1;
    form.elements.address.value = result.address2 + result.address3;
    message.textContent = "番地以降を入力してください。";
  } catch {
    message.textContent = "住所を検索できませんでした。";
  } finally {
    document.querySelector("[data-profile-address-search]").disabled = false;
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!user || submit.disabled) return;
  const values = Object.fromEntries(new FormData(form));
  const year = Number(values.birth_year);
  const month = Number(values.birth_month);
  const day = Number(values.birth_day);
  const birthday = new Date(year, month - 1, day);
  if (
    birthday.getFullYear() !== year ||
    birthday.getMonth() !== month - 1 ||
    birthday.getDate() !== day ||
    birthday > new Date()
  ) {
    status.textContent = "生年月日を正しく入力してください。";
    return;
  }
  const profile = { ...values, email: user.email };
  submit.disabled = true;
  status.textContent = "会員情報を保存しています。";
  try {
    await saveUserProfile(user, profile);
    window.location.replace(checkoutDestination());
  } catch {
    status.textContent = "保存できませんでした。もう一度お試しください。";
    submit.disabled = false;
  }
});
