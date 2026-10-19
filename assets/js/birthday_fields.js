(() => {
  const controllers = new WeakMap();
  document.querySelectorAll("[data-birthday-fields]").forEach((fieldset) => {
    const year = fieldset.querySelector('[name="birth_year"]');
    const month = fieldset.querySelector('[name="birth_month"]');
    const day = fieldset.querySelector('[name="birth_day"]');
    const currentYear = new Date().getFullYear();
    for (let value = currentYear; value >= 1900; value -= 1)
      year.add(new Option(String(value), String(value)));
    for (let value = 1; value <= 12; value += 1)
      month.add(new Option(String(value).padStart(2, "0"), String(value)));

    const updateDays = () => {
      const selectedDay = day.value;
      const selectedMonth = Number(month.value);
      const selectedYear = Number(year.value) || 2000;
      const maximum = selectedMonth ? new Date(selectedYear, selectedMonth, 0).getDate() : 31;
      while (day.options.length > 1) day.remove(1);
      for (let value = 1; value <= maximum; value += 1)
        day.add(new Option(String(value).padStart(2, "0"), String(value)));
      day.value = Number(selectedDay) <= maximum ? selectedDay : "";
    };
    year.addEventListener("change", updateDays);
    month.addEventListener("change", updateDays);
    updateDays();
    controllers.set(fieldset, (profile) => {
      year.value = profile.birth_year ? String(Number(profile.birth_year)) : "";
      month.value = profile.birth_month ? String(Number(profile.birth_month)) : "";
      updateDays();
      day.value = profile.birth_day ? String(Number(profile.birth_day)) : "";
    });
  });

  window.setBirthdayFields = (form, profile) => {
    const fieldset = form.querySelector("[data-birthday-fields]");
    controllers.get(fieldset)?.(profile);
  };
})();
