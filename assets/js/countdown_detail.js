/**
 * countdown_detail.js - カウントダウン詳細画面スクリプト
 */
document.addEventListener("DOMContentLoaded", () => {
  const DEFAULT_EVENT = {
    title: "Sugar ♡ Tune LIVE TOUR",
    date: "2026-12-24",
    place: "名古屋◯◯ホール",
  };

  const getEventData = () => ({ ...DEFAULT_EVENT, ...window.countdownStore.getSelectedEvent() });

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

  // メモの読み込みと自動保存
  if (elements.memoTextarea) {
    const savedMemo = window.countdownStore.getSelectedEvent().memo || "";
    elements.memoTextarea.value = savedMemo;

    elements.memoTextarea.addEventListener("input", (e) => {
      try {
        window.countdownStore.saveMemo(e.target.value);
      } catch (err) {
        console.error("Failed to save memo", err);
      }
    });
  }

  render();
});
