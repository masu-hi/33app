/**
 * countdown.js - カウントダウン画面専用スクリプト
 */
(() => {
  const getEventData = () => window.countdownStore.getSelectedEvent();
  const status = document.querySelector(".countdown_sync_status");
  let editingEvent;

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
  const editStatus = document.createElement("p");
  editStatus.setAttribute("role", "status");
  elements.form.append(editStatus);
  elements.inputTitle.maxLength = 120;
  elements.inputPlace.maxLength = 200;

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
    if (elements.editBtn) elements.editBtn.disabled = !event;
    if (!event) {
      for (const key of ["countdownDays", "circleDate", "cardBadgeDate", "cardEventPlace"]) {
        if (elements[key]) elements[key].textContent = "--";
      }
      if (elements.circleLabel) elements.circleLabel.textContent = "イベント未登録";
      if (elements.cardBadgeWeekday) elements.cardBadgeWeekday.textContent = "";
      if (elements.cardEventTitle)
        elements.cardEventTitle.textContent = "イベントを追加してください";
      if (elements.countdownMessage)
        elements.countdownMessage.textContent = "楽しみな予定を登録しましょう";
      return;
    }
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
      if (!event) return;
      editingEvent = event;
      editStatus.textContent = "";
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
    elements.form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const updated = {
        title: elements.inputTitle.value.trim(),
        date: elements.inputDate.value,
        place: elements.inputPlace.value.trim(),
      };
      const controls = [...elements.form.elements];
      controls.forEach((control) => {
        control.disabled = true;
      });
      status.textContent = "保存しています。";
      try {
        await window.countdownStore.updateEvent(editingEvent.id, updated, editingEvent);
        render();
        elements.modal?.close();
        status.textContent = "予定を保存しました。";
      } catch (error) {
        status.textContent = error.message;
        editStatus.textContent = error.message;
      } finally {
        controls.forEach((control) => {
          control.disabled = false;
        });
      }
    });
  }

  window.addEventListener("countdown:updated", render);
  const timer = setInterval(render, 60000);
  window.addEventListener("pagehide", () => clearInterval(timer));
  render();
})();
