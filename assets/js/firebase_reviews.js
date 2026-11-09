import {
  collection,
  doc,
  query,
  where,
  onSnapshot,
  runTransaction,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { auth, db } from "./firebase_config.js";
import { waitForUser } from "./firebase_user.js";

const productIds = ["penlight", "bag", "binoculars", "fan", "set"];
export const reviewProductId = (id) => (productIds.includes(id) ? id : "penlight");
// HTMLに残すデモ5件の評価（5、5、5、5、4）。架空の15,300件は集計しない。
export const reviewSummary = (reviews) => {
  const valid = reviews.filter(
    (review) => Number.isInteger(review.rating) && review.rating >= 1 && review.rating <= 5,
  );
  const count = 5 + valid.length;
  return { count, average: (24 + valid.reduce((sum, review) => sum + review.rating, 0)) / count };
};

export const submitReview = async (id, productId, rating, value) => {
  const user = await waitForUser();
  const owner = () =>
    user &&
    !user.isAnonymous &&
    auth.currentUser?.uid === user.uid &&
    sessionStorage.getItem("activeUserId") === user.uid;
  if (!owner()) throw new Error("レビューの投稿にはログインが必要です。");
  const text = String(value || "").trim();
  if (
    !productIds.includes(productId) ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5 ||
    !text ||
    text.length > 300 ||
    !/^[a-zA-Z0-9-]{1,100}$/.test(id)
  )
    throw new Error("評価を選び、レビューを300文字以内で入力してください。");
  const reference = doc(db, "reviews", id);
  return runTransaction(db, async (transaction) => {
    if (!owner()) throw new Error("ログイン状態が変わりました。");
    const existing = await transaction.get(reference);
    if (existing.exists()) {
      const saved = existing.data();
      if (
        saved.userId !== user.uid ||
        saved.productId !== productId ||
        saved.rating !== rating ||
        saved.text !== text
      )
        throw new Error("送信内容が変わりました。再読み込みして確認してください。");
      return id;
    }
    transaction.set(reference, {
      userId: user.uid,
      productId,
      rating,
      text,
      isPublished: true,
      createdAt: new Date().toISOString(),
    });
    return id;
  });
};

export const subscribeReviews = (productId, callback, onError) =>
  onSnapshot(
    query(
      collection(db, "reviews"),
      where("productId", "==", productId),
      where("isPublished", "==", true),
    ),
    (snapshot) => {
      if (snapshot.metadata?.hasPendingWrites) return;
      callback(
        snapshot.docs
          .map((entry) => ({ ...entry.data(), id: entry.id }))
          .filter(
            (review) =>
              Number.isInteger(review.rating) &&
              review.rating >= 1 &&
              review.rating <= 5 &&
              typeof review.text === "string",
          )
          .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))),
      );
    },
    onError,
  );
