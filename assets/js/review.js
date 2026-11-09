import {
  submitReview,
  subscribeReviews,
  reviewProductId,
  reviewSummary,
} from "./firebase_reviews.js";
import { auth } from "./firebase_config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const submitButton = document.querySelector("[data-review-submit]");
const textarea = document.querySelector(".review_form__textarea");
const stars = [...document.querySelectorAll("[data-review-stars] button")];
const list = document.querySelector(".review_list");
const productId = reviewProductId(new URLSearchParams(location.search).get("id"));
const status = document.createElement("p");
status.setAttribute("role", "status");
submitButton.after(status);
let rating = 0;
let saving = false;
let requestId = crypto.randomUUID();
const renewRequest = () => {
  if (!saving) requestId = crypto.randomUUID();
};
textarea.addEventListener("input", renewRequest);
stars.forEach((star, index) => {
  star.setAttribute("aria-label", `${index + 1}点`);
  star.setAttribute("aria-pressed", "false");
  star.addEventListener("click", () => {
    rating = index + 1;
    renewRequest();
    stars.forEach((item, i) => {
      item.classList.toggle("is_selected", i < rating);
      item.setAttribute("aria-pressed", String(i + 1 === rating));
    });
  });
});

const render = (reviews) => {
  list.querySelectorAll("[data-cloud-review]").forEach((item) => item.remove());
  const fragment = document.createDocumentFragment();
  reviews.forEach((review) => {
    const item = document.createElement("article");
    item.className = "review_item";
    item.dataset.cloudReview = "";
    const header = document.createElement("div");
    header.className = "review_item__header";
    const scoreStars = document.createElement("span");
    scoreStars.className = "review_item__stars";
    scoreStars.textContent = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
    const score = document.createElement("span");
    score.className = "review_item__score";
    score.textContent = `${review.rating}/5`;
    const time = document.createElement("time");
    const date = new Date(review.createdAt);
    if (Number.isFinite(date.getTime())) {
      time.dateTime = date.toISOString();
      time.textContent = new Intl.DateTimeFormat("ja-JP", {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
        .format(date)
        .replaceAll("/", ".");
    }
    header.append(scoreStars, score, time);
    const text = document.createElement("p");
    text.className = "review_item__text";
    text.textContent = review.text;
    text.style.whiteSpace = "pre-wrap";
    item.append(header, text);
    fragment.append(item);
  });
  list.prepend(fragment);
  const summary = reviewSummary(reviews);
  document.querySelector("[data-review-count]").textContent =
    `${summary.count.toLocaleString()}件のレビュー（デモ5件を含む）`;
  document.querySelector("[data-review-average]").textContent = summary.average.toFixed(1);
  const summaryStars = document.querySelector("[data-review-summary-stars]");
  summaryStars.replaceChildren();
  const rounded = Math.round(summary.average * 2) / 2;
  for (let i = 1; i <= 5; i += 1) {
    const star = document.createElement("span");
    star.className = `star${rounded >= i ? " is_full" : rounded >= i - 0.5 ? " is_half" : ""}`;
    star.textContent = "★";
    summaryStars.append(star);
  }
};
render([]);
const unsubscribe = subscribeReviews(productId, render, () => {
  status.textContent = "レビューを読み込めませんでした。接続状態を確認して再読み込みしてください。";
});
const stopAuth = onAuthStateChanged(auth, () => {
  textarea.value = "";
  rating = 0;
  requestId = crypto.randomUUID();
  stars.forEach((star) => {
    star.classList.remove("is_selected");
    star.setAttribute("aria-pressed", "false");
  });
});
window.addEventListener(
  "pagehide",
  () => {
    unsubscribe();
    stopAuth();
  },
  { once: true },
);

submitButton.addEventListener("click", async () => {
  if (saving) return;
  if (!rating || !textarea.value.trim()) {
    status.textContent = "評価を選び、レビューを入力してください。";
    if (!rating) stars[0].focus();
    else textarea.focus();
    return;
  }
  const ownerId = auth.currentUser?.uid;
  saving = true;
  [submitButton, textarea, ...stars].forEach((control) => {
    control.disabled = true;
  });
  status.textContent = "投稿しています。";
  try {
    await submitReview(requestId, productId, rating, textarea.value);
    if (auth.currentUser?.uid !== ownerId) return;
    textarea.value = "";
    rating = 0;
    requestId = crypto.randomUUID();
    stars.forEach((star) => {
      star.classList.remove("is_selected");
      star.setAttribute("aria-pressed", "false");
    });
    status.textContent = "レビューを投稿しました。";
  } catch (error) {
    if (auth.currentUser?.uid === ownerId)
      status.textContent = `${error.message} 入力内容は残っています。`;
  } finally {
    saving = false;
    [submitButton, textarea, ...stars].forEach((control) => {
      control.disabled = false;
    });
  }
});
