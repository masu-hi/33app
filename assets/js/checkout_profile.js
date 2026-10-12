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
form.elements.birthday.max = new Date().toLocaleDateString("sv-SE");
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
      form.elements.postal.value = `${profile.postal_first || ""}${profile.postal_last || ""}`;
      if (profile.birth_year)
        form.elements.birthday.value = `${profile.birth_year}-${String(profile.birth_month).padStart(2, "0")}-${String(profile.birth_day).padStart(2, "0")}`;
      submit.disabled = false;
    }
  }
} catch {
  status.textContent = "会員情報を読み込めませんでした。再読み込みしてください。";
}

document.querySelector("[data-profile-address-search]").addEventListener("click", async (event) => {
  const zipcode = form.elements.postal.value.replace(/\D/g, "");
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
  const [birth_year, birth_month, birth_day] = values.birthday.split("-");
  const postal = values.postal.replace(/\D/g, "");
  const { birthday, ...fields } = values;
  const profile = {
    ...fields,
    birth_year,
    birth_month,
    birth_day,
    postal_first: postal.slice(0, 3),
    postal_last: postal.slice(3),
  };
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
