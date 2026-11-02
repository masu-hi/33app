(() => {
  const DEFAULT_EVENT = {
    title: "Sugar ♡ Tune LIVE TOUR",
    date: "2026-12-24",
    place: "名古屋◯◯ホール",
  };

  const form = document.getElementById("countdownAddForm");
  const titleInput = document.getElementById("eventTitle");
  const dateInput = document.getElementById("eventDate");
  const placeInput = document.getElementById("eventPlace");
  const memoInput = document.getElementById("eventMemo");
  const dateLabel = document.getElementById("eventDateLabel");
  const calendarMonth = document.getElementById("calendarMonth");
  const calendarDays = document.getElementById("calendarDays");
  const previousMonthButton = document.getElementById("previousMonth");
  const nextMonthButton = document.getElementById("nextMonth");
  const errorMessage = document.getElementById("formError");
  const submitButton = document.querySelector('[form="countdownAddForm"]');
  let requestId = crypto.randomUUID();
  let saving = false;
  form.addEventListener("input", () => {
    if (!saving) requestId = crypto.randomUUID();
  });
  titleInput.maxLength = 120;
  placeInput.maxLength = 200;
  memoInput.maxLength = 5000;

  const formatDate = (value) => {
    if (!value) return "";
    const [year, month, day] = value.split("-");
    return `${year}.${month}.${day}`;
  };

  const parseDate = (value) => {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const event = window.countdownStore.getSelectedEvent() || DEFAULT_EVENT;
  dateInput.value = event.date;
  dateLabel.textContent = formatDate(event.date);
  dateLabel.dateTime = event.date;
  memoInput.value = event.memo || "";

  const initialDate = parseDate(event.date);
  let displayedMonth = new Date(initialDate.getFullYear(), initialDate.getMonth(), 1);

  const toDateValue = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const renderCalendar = () => {
    const year = displayedMonth.getFullYear();
    const month = displayedMonth.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const dayCount = new Date(year, month + 1, 0).getDate();
    const todayValue = toDateValue(new Date());
    const fragment = document.createDocumentFragment();

    calendarMonth.textContent = `${year}年${month + 1}月`;
    calendarDays.replaceChildren();

    for (let blank = 0; blank < firstWeekday; blank += 1) {
      const spacer = document.createElement("span");
      spacer.setAttribute("aria-hidden", "true");
      fragment.append(spacer);
    }

    for (let day = 1; day <= dayCount; day += 1) {
      const date = new Date(year, month, day);
      const value = toDateValue(date);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "countdown_add__day";
      button.textContent = String(day);
      button.dataset.date = value;
      button.setAttribute("aria-label", `${year}年${month + 1}月${day}日`);
      button.setAttribute("aria-pressed", String(value === dateInput.value));

      if (value === dateInput.value) button.classList.add("countdown_add__day--selected");
      if (value === todayValue) button.classList.add("countdown_add__day--today");
      if (date.getDay() === 0) button.classList.add("countdown_add__day--sunday");
      if (date.getDay() === 6) button.classList.add("countdown_add__day--saturday");

      fragment.append(button);
    }

    calendarDays.append(fragment);
  };

  const selectDate = (value) => {
    const selectedDate = parseDate(value);
    dateInput.value = value;
    dateLabel.textContent = formatDate(value);
    dateLabel.dateTime = value;
    displayedMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    errorMessage.hidden = true;
    renderCalendar();
  };

  previousMonthButton.addEventListener("click", () => {
    displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() - 1, 1);
    renderCalendar();
  });

  nextMonthButton.addEventListener("click", () => {
    displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 1);
    renderCalendar();
  });

  calendarDays.addEventListener("click", (clickEvent) => {
    const dayButton = clickEvent.target.closest("[data-date]");
    if (dayButton) selectDate(dayButton.dataset.date);
  });

  renderCalendar();

  form.addEventListener("submit", async (eventSubmit) => {
    eventSubmit.preventDefault();
    if (saving) return;
    const title = titleInput.value.trim();
    const place = placeInput.value.trim();

    if (!title || !dateInput.value || !place) {
      errorMessage.hidden = false;
      return;
    }

    saving = true;
    const controls = [...form.elements, submitButton];
    controls.forEach((control) => {
      control.disabled = true;
    });
    try {
      await window.countdownStore.addEvent(
        { title, date: dateInput.value, place, memo: memoInput.value },
        requestId,
      );
      window.location.href = "countdown.html";
    } catch (error) {
      errorMessage.textContent = error.message;
      errorMessage.hidden = false;
    } finally {
      saving = false;
      controls.forEach((control) => {
        control.disabled = false;
      });
    }
  });
})();
