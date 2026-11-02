import {
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { auth, db } from "./firebase_config.js";

let ownerId;
let state = { events: [], selectedEventId: "", revision: 0 };
let subscriptionError = false;

const checkOwner = () => {
  if (
    !ownerId ||
    auth.currentUser?.uid !== ownerId ||
    sessionStorage.getItem("activeUserId") !== ownerId
  )
    throw new Error("ログイン状態が変わりました。ログインし直してください。");
  if (subscriptionError) throw new Error("予定を読み込めません。ページを再読み込みしてください。");
};
const applyState = (data) => {
  checkOwner();
  const next = data || { events: [], selectedEventId: "", revision: 0 };
  if (Number(next.revision || 0) < state.revision) return;
  state = structuredClone(next);
  window.dispatchEvent(new CustomEvent("countdown:updated"));
};
const validate = (value) => {
  const event = {
    title: String(value.title || "").trim(),
    date: String(value.date || ""),
    place: String(value.place || "").trim(),
    memo: String(value.memo || ""),
  };
  const date = new Date(event.date + "T00:00:00Z");
  if (
    !event.title ||
    event.title.length > 120 ||
    !event.place ||
    event.place.length > 200 ||
    event.memo.length > 5000 ||
    !/^\d{4}-\d{2}-\d{2}$/.test(event.date) ||
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== event.date
  )
    throw new Error(
      "イベント名（120文字以内）・正しい日付・場所（200文字以内）を入力してください。メモは5000文字以内です。",
    );
  return event;
};
const mutate = async (change) => {
  checkOwner();
  const reference = doc(db, "users", ownerId, "countdown", "current");
  const saved = await runTransaction(db, async (transaction) => {
    checkOwner();
    const snapshot = await transaction.get(reference);
    const current = snapshot.data() || { events: [], selectedEventId: "", revision: 0 };
    const next = change(structuredClone(current));
    if (!next) return current;
    next.revision = Number(current.revision || 0) + 1;
    next.updatedAt = new Date().toISOString();
    transaction.set(reference, next);
    return next;
  });
  applyState(saved);
};
const getEvents = () => structuredClone(state.events);
const getSelectedEvent = () =>
  getEvents().find((event) => event.id === state.selectedEventId) || getEvents()[0] || null;
const selectEvent = async (id) =>
  mutate((current) => {
    if (!current.events.some((event) => event.id === id))
      throw new Error("この予定は削除されています。");
    current.selectedEventId = id;
    return current;
  });
const addEvent = async (values, id = crypto.randomUUID()) => {
  const event = validate(values);
  await mutate((current) => {
    const existing = current.events.find((item) => item.id === id);
    if (existing) {
      if (Object.keys(event).some((key) => existing[key] !== event[key]))
        throw new Error("保存済みの内容が異なります。ページを再読み込みしてください。");
      return null;
    }
    if (current.events.length >= 50)
      throw new Error("予定は50件までです。不要な予定を削除してください。");
    current.events.push({ ...event, id, revision: 1 });
    current.selectedEventId = id;
    return current;
  });
};
const updateEvent = async (id, updates, expected) => {
  const keys = Object.keys(updates);
  if (!keys.length || keys.some((key) => !["title", "date", "place", "memo"].includes(key)))
    throw new Error("更新する項目を確認してください。");
  await mutate((current) => {
    const event = current.events.find((item) => item.id === id);
    if (!event)
      throw new Error("この予定は削除されています。入力内容を控えて一覧を確認してください。");
    if (keys.some((key) => event[key] !== expected?.[key]))
      throw new Error(
        "別の画面で同じ項目が変更されました。入力内容を控え、最新の予定を確認してください。",
      );
    Object.assign(event, validate({ ...event, ...updates }), { revision: event.revision + 1 });
    return current;
  });
};
const removeEvent = async (id, revision) =>
  mutate((current) => {
    const event = current.events.find((item) => item.id === id);
    if (!event) return null;
    if (event.revision !== revision)
      throw new Error("この予定は更新されています。内容を確認してから削除してください。");
    current.events = current.events.filter((item) => item.id !== id);
    if (current.selectedEventId === id) current.selectedEventId = current.events[0]?.id || "";
    return current;
  });

export const initializeCountdownStore = async (user) => {
  state = { events: [], selectedEventId: "", revision: 0 };
  subscriptionError = false;
  ownerId = user?.isAnonymous ? null : user?.uid;
  checkOwner();
  for (const key of [
    "countdownEvents",
    "countdownSelectedEventId",
    "countdownEvent",
    "countdownMemo",
  ]) {
    localStorage.removeItem(key);
  }
  const reference = doc(db, "users", ownerId, "countdown", "current");
  applyState((await getDoc(reference)).data());
  const unsubscribe = onSnapshot(
    reference,
    (snapshot) => {
      if (snapshot.metadata?.hasPendingWrites) return;
      if (auth.currentUser?.uid === ownerId && sessionStorage.getItem("activeUserId") === ownerId)
        applyState(snapshot.data());
    },
    () => {
      subscriptionError = true;
      window.dispatchEvent(new CustomEvent("countdown:error"));
    },
  );
  window.addEventListener("pagehide", (event) => {
    if (!event.persisted) unsubscribe();
  });
  window.countdownStore = {
    getEvents,
    getSelectedEvent,
    selectEvent,
    addEvent,
    updateEvent,
    removeEvent,
  };
};
