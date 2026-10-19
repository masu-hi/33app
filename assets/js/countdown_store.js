(() => {
  const EVENTS_KEY = "countdownEvents";
  const SELECTED_KEY = "countdownSelectedEventId";
  const LEGACY_EVENT_KEY = "countdownEvent";
  const LEGACY_MEMO_KEY = "countdownMemo";
  const DEFAULT_EVENT = {
    title: "Sugar ♡ Tune LIVE TOUR",
    date: "2026-12-24",
    place: "名古屋◯◯ホール",
    memo: "",
  };

  const makeId = () =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `event-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const syncSelectedEvent = (events, selectedId) => {
    const selected = events.find((event) => event.id === selectedId);
    if (!selected) {
      localStorage.removeItem(SELECTED_KEY);
      if (events.length === 0) {
        localStorage.removeItem(LEGACY_EVENT_KEY);
        localStorage.removeItem(LEGACY_MEMO_KEY);
      }
      return null;
    }

    localStorage.setItem(SELECTED_KEY, selected.id);
    localStorage.setItem(
      LEGACY_EVENT_KEY,
      JSON.stringify({ title: selected.title, date: selected.date, place: selected.place }),
    );
    localStorage.setItem(LEGACY_MEMO_KEY, selected.memo || "");
    return selected;
  };

  const saveEvents = (events, selectedId = localStorage.getItem(SELECTED_KEY)) => {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    const nextId = events.some((event) => event.id === selectedId)
      ? selectedId
      : (events[0]?.id ?? null);
    syncSelectedEvent(events, nextId);
    return events;
  };

  const getEvents = () => {
    const saved = localStorage.getItem(EVENTS_KEY);
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          let changed = false;
          const events = parsed.map((event) => {
            if (event.id) return event;
            changed = true;
            return { ...event, id: makeId(), memo: event.memo || "" };
          });
          if (changed) saveEvents(events);
          const selectedId = localStorage.getItem(SELECTED_KEY);
          if (events.length && !events.some((event) => event.id === selectedId)) {
            syncSelectedEvent(events, events[0].id);
          }
          return events;
        }
      } catch {
        // 壊れたイベント一覧は、従来データがあれば移行します。
      }
    }

    try {
      const legacy = JSON.parse(localStorage.getItem(LEGACY_EVENT_KEY) || "null");
      if (legacy) {
        const event = {
          ...DEFAULT_EVENT,
          ...legacy,
          id: "event-legacy",
          memo: localStorage.getItem(LEGACY_MEMO_KEY) || "",
        };
        saveEvents([event], event.id);
        return [event];
      }
    } catch {
      // 不正な従来データは初期イベント表示にフォールバックします。
    }

    return [];
  };

  const getSelectedEvent = () => {
    const events = getEvents();
    const selectedId = localStorage.getItem(SELECTED_KEY);
    return events.find((event) => event.id === selectedId) || events[0] || DEFAULT_EVENT;
  };

  const selectEvent = (eventId) => {
    const events = getEvents();
    if (!events.some((event) => event.id === eventId)) return false;
    syncSelectedEvent(events, eventId);
    return true;
  };

  const addEvent = (event) => {
    const events = getEvents();
    const added = { ...event, id: makeId(), memo: event.memo || "" };
    saveEvents([...events, added], added.id);
    return added;
  };

  const removeEvent = (eventId) => {
    const events = getEvents().filter((event) => event.id !== eventId);
    saveEvents(events);
    return events;
  };

  const saveMemo = (memo) => {
    const events = getEvents();
    const selectedId = localStorage.getItem(SELECTED_KEY);
    const selected = events.find((event) => event.id === selectedId);
    if (!selected) {
      localStorage.setItem(LEGACY_MEMO_KEY, memo);
      return;
    }
    selected.memo = memo;
    saveEvents(events, selected.id);
  };

  const updateSelectedEvent = (updates) => {
    const events = getEvents();
    const selectedId = localStorage.getItem(SELECTED_KEY);
    const selected = events.find((event) => event.id === selectedId);
    if (!selected) return;
    Object.assign(selected, updates);
    saveEvents(events, selected.id);
  };

  window.countdownStore = {
    getEvents,
    getSelectedEvent,
    selectEvent,
    addEvent,
    removeEvent,
    saveMemo,
    updateSelectedEvent,
  };
})();
