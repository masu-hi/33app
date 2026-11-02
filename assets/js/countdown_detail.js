/**
 * countdown_detail.js - カウントダウン詳細画面スクリプト
 */
(() => {
  const DEFAULT_EVENT = {
    title: "Sugar ♡ Tune LIVE TOUR",
    date: "2026-12-24",
    place: "名古屋◯◯ホール",
  };

  const selected = window.countdownStore.getSelectedEvent();
  if (!selected) {
    window.location.replace("countdown_list.html");
    return;
  }
  const getEventData = () =>
    window.countdownStore.getEvents().find((event) => event.id === selected.id);
  const status = document.querySelector(".countdown_sync_status");
  const saveButton = document.getElementById("saveMemoButton");
  let baselineMemo = selected.memo || "";
  let dirty = false;
  let saving = false;
  let debounce;

  const elements = {
    detailArtist: document.getElementById("detailArtist"),
    detailTour: document.getElementById("detailTour"),
    detailDate: document.getElementById("detailDate"),
    detailPlace: document.getElementById("detailPlace"),
    detailDays: document.getElementById("detailDays"),
    memoTextarea: document.getElementById("memoTextarea"),
  };

  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

  const render = () => {
    const event = getEventData();
    if (!event) {
      elements.memoTextarea.disabled = true;
      saveButton.disabled = true;
      status.textContent =
        "この予定は別の画面で削除されました。メモが未保存の場合は内容を控えてください。";
      return;
    }
    if (!dirty && !saving) {
      elements.memoTextarea.value = event.memo || "";
      baselineMemo = event.memo || "";
    }
    const targetDate = new Date(event.date + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // 残り日数
    if (elements.detailDays) {
      elements.detailDays.textContent = String(Math.max(0, diffDays));
    }

    // 日付フォーマット
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, "0");
    const day = String(targetDate.getDate()).padStart(2, "0");
    const weekdayStr = weekdays[targetDate.getDay()];

    if (elements.detailDate) {
      elements.detailDate.textContent = `${year}.${month}.${day}(${weekdayStr})`;
    }

    // 場所
    if (elements.detailPlace) {
      elements.detailPlace.textContent = event.place;
    }

    // タイトルカードのアーティスト名とツアー名
    if (event.title === DEFAULT_EVENT.title) {
      if (elements.detailArtist) elements.detailArtist.textContent = "Sugar ♡ Tune";
      if (elements.detailTour) elements.detailTour.textContent = `LIVE TOUR ${year}`;
    } else {
      // ユーザー変更時の柔軟な分割表示
      const parts = event.title.split(/\s+(.+)/);
      if (parts.length > 1) {
        if (elements.detailArtist) elements.detailArtist.textContent = parts[0];
        if (elements.detailTour) elements.detailTour.textContent = parts[1];
      } else {
        if (elements.detailArtist) elements.detailArtist.textContent = event.title;
        if (elements.detailTour) elements.detailTour.textContent = "";
      }
    }
  };

  const saveMemo = async () => {
    clearTimeout(debounce);
    if (!dirty || saving || !getEventData()) return;
    saving = true;
    saveButton.disabled = true;
    const text = elements.memoTextarea.value;
    status.textContent = "メモを保存しています。";
    try {
      await window.countdownStore.updateEvent(selected.id, { memo: text }, { memo: baselineMemo });
      baselineMemo = text;
      dirty = elements.memoTextarea.value !== text;
      status.textContent = dirty ? "メモに未保存の変更があります。" : "メモを保存しました。";
      if (dirty) debounce = setTimeout(saveMemo, 700);
    } catch (error) {
      status.textContent = error.message;
    } finally {
      saving = false;
      saveButton.disabled = !dirty || !getEventData();
    }
  };

  if (elements.memoTextarea) {
    elements.memoTextarea.value = baselineMemo;
    elements.memoTextarea.maxLength = 5000;
    elements.memoTextarea.addEventListener("input", () => {
      dirty = elements.memoTextarea.value !== baselineMemo;
      saveButton.disabled = !dirty || saving;
      status.textContent = dirty ? "メモに未保存の変更があります。" : "";
      clearTimeout(debounce);
      if (dirty) debounce = setTimeout(saveMemo, 700);
    });
  }
  saveButton.disabled = true;
  saveButton.addEventListener("click", saveMemo);
  window.addEventListener("beforeunload", (event) => {
    if (dirty || saving) {
      event.preventDefault();
      event.returnValue = "";
    }
  });
  window.addEventListener("countdown:updated", render);
  const timer = setInterval(render, 60000);
  window.addEventListener("pagehide", () => {
    clearTimeout(debounce);
    clearInterval(timer);
  });
  render();
})();
