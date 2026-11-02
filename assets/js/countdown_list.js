(() => {
  const list = document.getElementById("eventList");
  const status = document.querySelector(".countdown_sync_status");
  let saving = false;
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

  const formatCountdown = (dateValue) => {
    const target = new Date(`${dateValue}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = Math.ceil((target.getTime() - today.getTime()) / 86400000);
    if (days > 0) return `あと${days}日`;
    if (days === 0) return "今日がライブ当日！";
    return `${Math.abs(days)}日前のライブ`;
  };

  const render = () => {
    const events = window.countdownStore.getEvents();
    list.replaceChildren();

    if (events.length === 0) {
      const empty = document.createElement("div");
      empty.className = "countdown_list__empty";
      const message = document.createElement("p");
      message.textContent = "登録したイベントはまだありません";
      const addLink = document.createElement("a");
      addLink.href = "countdown_add.html";
      addLink.textContent = "イベントを追加する";
      empty.append(message, addLink);
      list.append(empty);
      return;
    }

    events.forEach((event) => {
      const date = new Date(`${event.date}T00:00:00`);
      const item = document.createElement("article");
      item.className = "countdown_list__item";
      const link = document.createElement("a");
      link.className = "countdown_list__link";
      link.href = "countdown.html";
      link.dataset.eventId = event.id;
      link.setAttribute("aria-label", `${event.title}、${formatCountdown(event.date)}を表示`);

      const dateBadge = document.createElement("span");
      dateBadge.className = "countdown_list__date";
      dateBadge.innerHTML = `<span>${date.getMonth() + 1}/${date.getDate()}</span><span>(${weekdays[date.getDay()]})</span>`;

      const info = document.createElement("span");
      info.className = "countdown_list__info";
      const title = document.createElement("span");
      title.className = "countdown_list__event_title";
      title.textContent = event.title;
      const place = document.createElement("span");
      place.className = "countdown_list__place";
      place.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>';
      const placeText = document.createElement("span");
      placeText.textContent = event.place;
      place.append(placeText);
      const countdown = document.createElement("span");
      countdown.className = "countdown_list__countdown";
      countdown.textContent = formatCountdown(event.date);
      info.append(title, place, countdown);

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "countdown_list__remove";
      remove.dataset.removeEvent = event.id;
      remove.setAttribute("aria-label", `${event.title}を削除`);
      remove.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v7m4-7v7M6 7l1 14h10l1-14M9 7V4h6v3"/></svg>';

      link.append(dateBadge, info);
      item.append(link, remove);
      list.append(item);
    });
  };

  list.addEventListener("click", async (clickEvent) => {
    if (saving) {
      clickEvent.preventDefault();
      return;
    }
    const removeButton = clickEvent.target.closest("[data-remove-event]");
    if (removeButton) {
      clickEvent.preventDefault();
      clickEvent.stopPropagation();
      const event = window.countdownStore
        .getEvents()
        .find((item) => item.id === removeButton.dataset.removeEvent);
      if (!event || !window.confirm(`「${event.title}」を削除しますか？`)) return;
      saving = true;
      removeButton.disabled = true;
      try {
        await window.countdownStore.removeEvent(event.id, event.revision);
        status.textContent = "予定を削除しました。";
      } catch (error) {
        status.textContent = error.message;
      } finally {
        saving = false;
        render();
      }
      return;
    }

    const link = clickEvent.target.closest("[data-event-id]");
    if (link) {
      clickEvent.preventDefault();
      saving = true;
      try {
        await window.countdownStore.selectEvent(link.dataset.eventId);
        window.location.href = link.href;
      } catch (error) {
        status.textContent = error.message;
        saving = false;
      }
    }
  });

  window.addEventListener("countdown:updated", render);
  const timer = setInterval(render, 60000);
  window.addEventListener("pagehide", () => clearInterval(timer));
  render();
})();
