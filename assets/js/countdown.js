/**
 * countdown.js - カウントダウン画面専用スクリプト
 */
document.addEventListener("DOMContentLoaded", () => {
  const DEFAULT_EVENT = {
    title: "Sugar ♡ Tune LIVE TOUR",
    date: "2026-12-24",
    place: "名古屋◯◯ホール",
  };

  const getEventData = () => ({ ...DEFAULT_EVENT, ...window.countdownStore.getSelectedEvent() });

  const saveEventData = (data) => {
    try {
      window.countdownStore.updateSelectedEvent(data);
    } catch (e) {
      console.error("Failed to save event data", e);
    }
  };

  const elements = {
    circleLabel: document.getElementById("circleLabel"),
    countdownDays: document.getElementById("countdownDays"),
    countdownDaysUnit: document.getElementById("countdownDaysUnit"),
    circleDate: document.getElementById("circleDate"),
    cardBadgeDate: document.getElementById("cardBadgeDate"),
    cardBadgeWeekday: document.getElementById("cardBadgeWeekday"),
    cardEventTitle: document.getElementById("cardEventTitle"),
    cardEventPlace: document.getElementById("cardEventPlace"),
    countdownMessage: document.getElementById("countdownMessage"),
    editBtn: document.getElementById("editEventBtn"),
    modal: document.getElementById("eventModal"),
    closeModalBtn: document.getElementById("closeModalBtn"),
    form: document.getElementById("eventForm"),
    inputTitle: document.getElementById("inputTitle"),
    inputDate: document.getElementById("inputDate"),
    inputPlace: document.getElementById("inputPlace"),
  };

  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

  const getCountdownMessage = (diffDays) => {
    if (diffDays >= 14) {
      return "当日はなに着ていく？ ♡";
    }
    if (diffDays >= 7) {
      return "忘れもの、ないかな？ 🎀";
    }
    if (diffDays >= 3) {
      return "どきどきしてきたね ♡";
    }
    if (diffDays >= 1) {
      return "ついに明日だね！";
    }
    if (diffDays === 0) {
      return "今日はしあわせな日にしよっ ♡";
    }
    return "ライブおつかれさまでした ♡";
  };

  const render = () => {
    const event = getEventData();
    const targetDate = new Date(event.date + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // サークル内表示
    if (diffDays > 0) {
      if (elements.circleLabel) elements.circleLabel.textContent = "ライブまで";
      if (elements.countdownDays) elements.countdownDays.textContent = String(diffDays);
      if (elements.countdownDaysUnit) elements.countdownDaysUnit.textContent = "日";
    } else if (diffDays === 0) {
      if (elements.circleLabel) elements.circleLabel.textContent = "ライブ当日！";
      if (elements.countdownDays) elements.countdownDays.textContent = "0";
      if (elements.countdownDaysUnit) elements.countdownDaysUnit.textContent = "日";
    } else {
      if (elements.circleLabel) elements.circleLabel.textContent = "ライブ終了";
      if (elements.countdownDays) elements.countdownDays.textContent = String(Math.abs(diffDays));
      if (elements.countdownDaysUnit) elements.countdownDaysUnit.textContent = "日前";
    }

    // 日付フォーマット
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, "0");
    const day = String(targetDate.getDate()).padStart(2, "0");
    const weekdayStr = weekdays[targetDate.getDay()];

    if (elements.circleDate) {
      elements.circleDate.textContent = `${year}.${month}.${day}`;
    }

    // カード内表示
    if (elements.cardBadgeDate) {
      elements.cardBadgeDate.textContent = `${Number(month)}/${day}`;
    }
    if (elements.cardBadgeWeekday) {
      elements.cardBadgeWeekday.textContent = `(${weekdayStr})`;
    }
    if (elements.cardEventTitle) {
      elements.cardEventTitle.textContent = event.title;
    }
    if (elements.cardEventPlace) {
      elements.cardEventPlace.textContent = event.place;
    }

    // 下部メッセージ（残り日数連動）
    if (elements.countdownMessage) {
      elements.countdownMessage.textContent = getCountdownMessage(diffDays);
    }
  };

  // モーダル操作
  if (elements.editBtn && elements.modal) {
    elements.editBtn.addEventListener("click", () => {
      const event = getEventData();
      if (elements.inputTitle) elements.inputTitle.value = event.title;
      if (elements.inputDate) elements.inputDate.value = event.date;
      if (elements.inputPlace) elements.inputPlace.value = event.place;
      elements.modal.showModal();
    });
  }

  if (elements.closeModalBtn && elements.modal) {
    elements.closeModalBtn.addEventListener("click", () => {
      elements.modal.close();
    });
  }

  if (elements.modal) {
    elements.modal.addEventListener("click", (e) => {
      if (e.target === elements.modal) {
        elements.modal.close();
      }
    });
  }

  if (elements.form) {
    elements.form.addEventListener("submit", (e) => {
      e.preventDefault();
      const updated = {
        title: elements.inputTitle.value.trim() || DEFAULT_EVENT.title,
        date: elements.inputDate.value || DEFAULT_EVENT.date,
        place: elements.inputPlace.value.trim() || DEFAULT_EVENT.place,
      };
      saveEventData(updated);
      render();
      if (elements.modal) {
        elements.modal.close();
      }
    });
  }

  render();
});
