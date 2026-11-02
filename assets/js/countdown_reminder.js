import {
  doc,
  runTransaction,
  collection,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { auth, db } from "./firebase_config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const dateParts = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toISOString().slice(0, 10) === value
    ? { year, month, day, time: date.getTime() }
    : null;
};
export const japanDateKey = (now = new Date()) =>
  new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

export const getCountdownReminders = (events, today) => {
  const current = dateParts(today);
  if (!current) return [];
  return (Array.isArray(events) ? events : [])
    .flatMap((event) => {
      const target = dateParts(event.date);
      if (!target || !event.id || typeof event.title !== "string") return [];
      const days = Math.round((target.time - current.time) / 86400000);
      const previousMonth = new Date(Date.UTC(target.year, target.month - 2, 1));
      const lastDay = new Date(Date.UTC(target.year, target.month - 1, 0)).getUTCDate();
      previousMonth.setUTCDate(Math.min(target.day, lastDay));
      const oneMonthBefore = previousMonth.toISOString().slice(0, 10) === today;
      if (![0, 1, 3, 7].includes(days) && !oneMonthBefore) return [];
      return [
        {
          id: event.id,
          title: event.title,
          date: event.date,
          days,
          milestone:
            days === 0
              ? "いよいよ今日！"
              : days === 1
                ? "いよいよ明日！"
                : oneMonthBefore
                  ? "あと1ヶ月！"
                  : `あと${days}日！`,
        },
      ];
    })
    .sort((a, b) => a.days - b.days || a.title.localeCompare(b.title, "ja"));
};

const isOwner = (uid) =>
  Boolean(
    uid &&
    auth.currentUser?.uid === uid &&
    !auth.currentUser.isAnonymous &&
    sessionStorage.getItem("activeUserId") === uid,
  );

export const claimCountdownReminders = async (uid, today) => {
  if (!isOwner(uid)) return [];
  return runTransaction(db, async (transaction) => {
    if (!isOwner(uid)) throw new Error("ログイン状態が変わりました。");
    const userRef = doc(db, "users", uid);
    const user = await transaction.get(userRef);
    if (user.data()?.countdownReminderDate === today) return [];
    const countdown = await transaction.get(doc(db, "users", uid, "countdown", "current"));
    const reminders = getCountdownReminders(countdown.data()?.events, today);
    if (!reminders.length) return [];
    const changes = { countdownReminderDate: today };
    transaction.set(
      userRef,
      user.exists() ? changes : { ...changes, role: "user", email: auth.currentUser.email },
      { merge: true },
    );
    return reminders;
  });
};

export const reminderMessage = (days) => {
  if (days === 0) return "今日はライブ当日ですね！思いっきり楽しんできてください！";
  if (days === 1) return "いよいよ明日！持ち物と会場までの行き方を確認して、今日はゆっくり休もう。";
  if (days === 3) return "あと3日！届いたアイテムや持ち物をチェックして、準備を仕上げよう。";
  if (days === 7) return "ライブが近づいてきたね！そろそろ準備を始めてみる？";
  return "あと1ヶ月！どんな推し活アイテムで参戦するか、ゆっくり考えてみよう。";
};

export const reminderAction = (event, orders) => {
  // 日程が重なる有効な注文を、そのライブ用のレンタルとして扱う。
  if (Array.isArray(orders)) {
    const rented = orders.some(
      (order) =>
        !["キャンセル", "返品完了"].includes(order.status) &&
        !order.cancelledAt &&
        dateParts(order.arrivalDate) &&
        dateParts(order.returnDate) &&
        order.arrivalDate <= event.date &&
        event.date <= order.returnDate,
    );
    if (rented) return { href: "packing_checklist.html", label: "持ち物チェックリストを開く" };
    if (event.days <= 7) return { href: "goods_search.html", label: "レンタルする" };
  }
  return { href: "countdown_list.html", label: "予定を確認する" };
};

const addCelebration = (dialog) => {
  const effect = document.createElement("div");
  effect.className = "countdown_reminder__celebration";
  effect.setAttribute("aria-hidden", "true");
  for (const side of ["left", "right"]) {
    const popper = document.createElement("span");
    popper.className = `countdown_reminder__popper countdown_reminder__popper--${side}`;
    effect.append(popper);
    for (let i = 0; i < 24; i += 1) {
      const petal = document.createElement("i");
      petal.className = `countdown_reminder__petal countdown_reminder__petal--${side}`;
      const direction = side === "left" ? 1 : -1;
      petal.style.setProperty("--drift", `${direction * (40 + (i % 8) * 42)}px`);
      petal.style.setProperty("--rise", `${-100 - (i % 6) * 48}px`);
      petal.style.setProperty("--turn", `${direction * (160 + i * 39)}deg`);
      petal.style.setProperty("--delay", `${(i % 5) * 35}ms`);
      petal.style.setProperty("--petal-color", ["#f3a6ce", "#b1d9ff", "#d5c0f4", "#ffe0a6"][i % 4]);
      effect.append(petal);
    }
  }
  dialog.append(effect);
  const timer = window.setTimeout(() => effect.remove(), 4000);
  dialog.addEventListener("close", () => window.clearTimeout(timer), { once: true });
};

export const renderCountdownReminder = (reminders, orders = null) => {
  if (!reminders.length) return;
  const dialog = document.createElement("dialog");
  dialog.className = "countdown_reminder";
  dialog.setAttribute("aria-labelledby", "countdown-reminder-title");
  const inner = document.createElement("div");
  inner.className = "countdown_reminder__inner";
  const close = document.createElement("button");
  close.className = "countdown_reminder__close";
  close.type = "button";
  close.setAttribute("aria-label", "閉じる");
  close.textContent = "×";
  const heading = document.createElement("h1");
  heading.id = "countdown-reminder-title";
  heading.className = "countdown_reminder__heading";
  heading.textContent = "ライブのお知らせ";
  const list = document.createElement("ul");
  list.className = "countdown_reminder__events";
  reminders.forEach((event) => {
    const item = document.createElement("li");
    const circle = document.createElement("div");
    circle.className = "countdown_reminder__circle";
    const face = document.createElement("div");
    face.className = "countdown_reminder__face";
    const title = document.createElement("h2");
    title.textContent = `${event.title}まで`;
    const date = document.createElement("time");
    date.dateTime = event.date;
    date.textContent = event.date.replaceAll("-", ".");
    const count = document.createElement("p");
    count.className = "countdown_reminder__days";
    count.textContent = event.days === 0 ? "当日！" : `あと${event.days}日`;
    face.append(title, count, date);
    circle.append(face);
    const message = document.createElement("p");
    message.className = "countdown_reminder__message";
    message.textContent = reminderMessage(event.days);
    const action = reminderAction(event, orders);
    const view = document.createElement("a");
    view.className = "countdown_reminder__link";
    view.href = action.href;
    view.textContent = action.label;
    item.append(circle, message, view);
    list.append(item);
  });
  const actions = document.createElement("div");
  actions.className = "countdown_reminder__actions";
  const dismiss = document.createElement("button");
  dismiss.type = "button";
  dismiss.textContent = "閉じる";
  close.addEventListener("click", () => dialog.close());
  dismiss.addEventListener("click", () => dialog.close());
  actions.append(dismiss);
  inner.append(heading, list, actions);
  dialog.append(close, inner);
  dialog.addEventListener("close", () => dialog.remove(), { once: true });
  document.body.append(dialog);
  dialog.showModal();
  if (reminders.some((event) => event.days === 0)) addCelebration(dialog);
  dismiss.focus();
  return dialog;
};

const waitUntilReady = () =>
  new Promise((resolve) => {
    const ready = () =>
      document.visibilityState !== "hidden" &&
      !document.body.classList.contains("is_product_data_loading") &&
      !document.querySelector("dialog[open]");
    if (ready()) {
      resolve();
      return;
    }
    const observer = new MutationObserver(check);
    function check() {
      if (!ready()) return;
      observer.disconnect();
      document.removeEventListener("visibilitychange", check);
      resolve();
    }
    observer.observe(document.body, { attributes: true, subtree: true, childList: true });
    document.addEventListener("visibilitychange", check);
  });

let checking = false;
export const showDailyCountdownReminder = async () => {
  if (checking) return;
  checking = true;
  try {
    await waitUntilReady();
    const uid = auth.currentUser?.uid;
    if (!isOwner(uid)) return;
    const today = japanDateKey();
    const reminders = await claimCountdownReminders(uid, today);
    let orders = null;
    if (reminders.length && isOwner(uid)) {
      try {
        const snapshot = await getDocs(query(collection(db, "orders"), where("userId", "==", uid)));
        orders = snapshot.docs.map((item) => item.data());
      } catch (error) {
        // 未取得を「注文なし」と誤判定しない。
        console.warn("カウントダウン用のレンタル情報を確認できませんでした。", error);
      }
    }
    if (isOwner(uid) && japanDateKey() === today && reminders.length) {
      const dialog = renderCountdownReminder(reminders, orders);
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user?.uid !== uid) dialog.close();
      });
      dialog.addEventListener("close", unsubscribe, { once: true });
      window.addEventListener("pagehide", unsubscribe, { once: true });
    }
  } finally {
    checking = false;
  }
};
