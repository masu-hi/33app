import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
  runTransaction,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { auth, db } from "./firebase_config.js";
import { waitForUser } from "./firebase_user.js";

const contactTypes = [
  "商品について",
  "レンタルについて",
  "配送・返却について",
  "アカウントについて",
  "その他",
];
const requireUser = async () => {
  const user = await waitForUser();
  if (!user || user.isAnonymous || auth.currentUser?.uid !== user.uid)
    throw new Error("お問い合わせにはログインが必要です。");
  return user;
};

export const submitContact = async (id, values) => {
  const user = await requireUser();
  const message = String(values.message || "").trim();
  if (!contactTypes.includes(values.type) || !message || message.length > 5000)
    throw new Error("種類を選び、内容を5000文字以内で入力してください。");
  const profile = await getDoc(doc(db, "users", user.uid));
  const reference = doc(db, "contacts", id);
  return runTransaction(db, async (transaction) => {
    const existing = await transaction.get(reference);
    if (existing.exists()) {
      const saved = existing.data();
      if (saved.userId !== user.uid || saved.message !== message || saved.type !== values.type)
        throw new Error("送信内容を確認して、もう一度お試しください。");
      return reference.id;
    }
    transaction.set(reference, {
      userId: user.uid,
      senderName: String(profile.data()?.name || "未登録"),
      senderEmail: user.email,
      type: values.type,
      message,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
    return reference.id;
  });
};

export const subscribeContacts = (userId, callback, onError) =>
  onSnapshot(
    userId
      ? query(collection(db, "contacts"), where("userId", "==", userId))
      : collection(db, "contacts"),
    (snapshot) =>
      callback(
        snapshot.docs
          .map((item) => ({ ...item.data(), id: item.id }))
          .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))),
      ),
    onError,
  );

export const replyToContact = async (id, text) => {
  const user = await requireUser();
  if (!(await getDoc(doc(db, "admins", user.uid))).exists())
    throw new Error("管理者としてログインしてください。");
  const reply = String(text || "").trim();
  if (!reply || reply.length > 5000) throw new Error("返信を5000文字以内で入力してください。");
  return runTransaction(db, async (transaction) => {
    const reference = doc(db, "contacts", id);
    const snapshot = await transaction.get(reference);
    if (!snapshot.exists()) throw new Error("お問い合わせが見つかりません。");
    const entry = snapshot.data();
    if (entry.status === "replied")
      throw new Error("このお問い合わせは返信済みです。画面をご確認ください。");
    const now = new Date().toISOString();
    transaction.update(reference, {
      status: "replied",
      reply,
      repliedAt: now,
      repliedBy: user.uid,
    });
    transaction.set(doc(db, "notifications", `contact-${id}`), {
      userId: entry.userId,
      category: "info",
      isRead: false,
      title: "お問い合わせへの返信が届きました",
      message: `お問い合わせの種類：${entry.type}\n\nお問い合わせ内容\n${entry.message}\n\nおしりーすからの返信\n${reply}`,
      contactId: id,
      createdAt: now,
    });
  });
};
