const checklistStorage = window.userStorage;

const checklistStorageKey = "packingChecklistCheckedItems";
const checklistList = document.querySelector("[data-checklist-list]");
const checklistPage = document.querySelector(".packing_checklist_page");
const defaultChecklistItems = [...checklistList.querySelectorAll("[data-checklist-item]")].map(
  (item) => ({
    id: item.id,
    label: item.nextElementSibling.textContent.trim(),
  }),
);
const checklistCount = document.querySelector("[data-checklist-count]");
const checklistTotal = document.querySelector("[data-checklist-total]");
const checklistProgress = document.querySelector("[data-checklist-progress]");
const checklistProgressFill = document.querySelector("[data-checklist-progress-fill]");
const checklistReset = document.querySelector("[data-checklist-reset]");
const checklistAddForm = document.querySelector("[data-checklist-add-form]");
const checklistNewItem = document.querySelector("[data-checklist-new-item]");
const checklistFeedback = document.querySelector("[data-checklist-message]");
const checklistStatus = document.querySelector("[data-checklist-status]");

const updateChecklistHeader = () => {
  checklistPage.classList.toggle("is_compact", window.scrollY > 120);
};

window.addEventListener("scroll", updateChecklistHeader, { passive: true });
updateChecklistHeader();

let savedChecklistState = null;

try {
  savedChecklistState = JSON.parse(checklistStorage.getItem(checklistStorageKey) || "null");
} catch {
  savedChecklistState = null;
}

let checklistItems = Array.isArray(savedChecklistState?.items)
  ? savedChecklistState.items.filter(
      (item) => typeof item?.id === "string" && typeof item?.label === "string",
    )
  : defaultChecklistItems;
const savedCheckedIds = Array.isArray(savedChecklistState)
  ? savedChecklistState
  : Array.isArray(savedChecklistState?.checkedIds)
    ? savedChecklistState.checkedIds
    : [];
const checkedChecklistIds = new Set(
  savedCheckedIds.filter((id) => checklistItems.some((item) => item.id === id)),
);

const updateChecklistProgress = () => {
  const checkedCount = checklistItems.filter((item) => checkedChecklistIds.has(item.id)).length;
  const totalCount = checklistItems.length;
  const progressPercent = totalCount ? (checkedCount / totalCount) * 100 : 0;
  let feedbackMessage = "推しに会う準備、はじめよう！";

  if (totalCount === 0) {
    feedbackMessage = "持ち物を追加してライブの準備をしよう！";
  } else if (checkedCount === totalCount) {
    feedbackMessage = "準備完了！最高のライブにしよう！";
  } else if (progressPercent >= 75) {
    feedbackMessage = "あと少し！準備ばっちりだよ。";
  } else if (checkedCount > 0) {
    feedbackMessage = "いい感じ！推しに会う準備が進んでるよ。";
  }

  if (checklistCount) checklistCount.textContent = checkedCount;
  if (checklistTotal) checklistTotal.textContent = totalCount;
  if (checklistProgress) checklistProgress.setAttribute("aria-valuenow", checkedCount);
  if (checklistProgress) checklistProgress.setAttribute("aria-valuemax", totalCount);
  if (checklistProgressFill) checklistProgressFill.style.width = `${progressPercent}%`;
  if (checklistFeedback) checklistFeedback.textContent = feedbackMessage;
  checklistPage.classList.toggle("is_complete", totalCount > 0 && checkedCount === totalCount);
};

const saveChecklistState = () => {
  checklistStorage.setItem(
    checklistStorageKey,
    JSON.stringify({ items: checklistItems, checkedIds: [...checkedChecklistIds] }),
  );
};

const renderChecklistItems = () => {
  checklistList.replaceChildren();

  checklistItems.forEach((item) => {
    const row = document.createElement("div");
    row.className = "packing_checklist__row";

    const label = document.createElement("label");
    label.className = "packing_checklist__item";
    label.htmlFor = item.id;

    const checkbox = document.createElement("input");
    checkbox.id = item.id;
    checkbox.type = "checkbox";
    checkbox.name = "packing_item";
    checkbox.value = item.id;
    checkbox.dataset.checklistItem = "";
    checkbox.checked = checkedChecklistIds.has(item.id);
    checkbox.addEventListener("change", () => {
      const wasComplete =
        checklistItems.length > 0 && checkedChecklistIds.size === checklistItems.length;

      if (checkbox.checked) {
        checkedChecklistIds.add(item.id);
        row.classList.add("is_checked", "is_checking");
        row.addEventListener("animationend", () => row.classList.remove("is_checking"), {
          once: true,
        });
      } else {
        checkedChecklistIds.delete(item.id);
        row.classList.remove("is_checked", "is_checking");
      }

      saveChecklistState();
      updateChecklistProgress();

      const isComplete =
        checklistItems.length > 0 && checkedChecklistIds.size === checklistItems.length;
      if (!wasComplete && isComplete) celebrateChecklist();
    });

    row.classList.toggle("is_checked", checkbox.checked);

    const itemLabel = document.createElement("span");
    itemLabel.textContent = item.label;
    label.append(checkbox, itemLabel);

    const editButton = document.createElement("button");
    editButton.className = "packing_checklist__edit";
    editButton.type = "button";
    editButton.setAttribute("aria-label", `${item.label}を編集`);
    editButton.textContent = "編集";
    editButton.addEventListener("click", () => {
      const originalLabel = item.label;
      const editor = document.createElement("form");
      editor.className = "packing_checklist__editor";

      const input = document.createElement("input");
      input.type = "text";
      input.value = item.label;
      input.maxLength = 40;
      input.setAttribute("aria-label", "持ち物の名前");
      input.required = true;
      input.addEventListener("input", () => {
        if (!input.value.trim()) return;
        item.label = input.value;
        saveChecklistState();
      });

      const saveButton = document.createElement("button");
      saveButton.type = "submit";
      saveButton.textContent = "保存";

      const cancelButton = document.createElement("button");
      cancelButton.type = "button";
      cancelButton.textContent = "取消";
      cancelButton.addEventListener("click", () => {
        item.label = originalLabel;
        saveChecklistState();
        renderChecklistItems();
      });

      editor.addEventListener("submit", (event) => {
        event.preventDefault();
        const nextLabel = input.value.trim();
        if (!nextLabel) {
          input.reportValidity();
          return;
        }

        item.label = nextLabel;
        checklistStatus.textContent = `${nextLabel}に変更しました`;
        saveChecklistState();
        renderChecklistItems();
      });

      editor.append(input, saveButton, cancelButton);
      row.replaceChildren(editor);
      input.focus();
      input.select();
    });

    row.append(label, editButton);

    const deleteButton = document.createElement("button");
    deleteButton.className = "packing_checklist__delete";
    deleteButton.type = "button";
    deleteButton.setAttribute("aria-label", `${item.label}を削除`);
    deleteButton.textContent = "×";
    deleteButton.addEventListener("click", () => {
      checklistItems = checklistItems.filter((checklistItem) => checklistItem.id !== item.id);
      checkedChecklistIds.delete(item.id);
      checklistStatus.textContent = `${item.label}を削除しました`;
      saveChecklistState();
      renderChecklistItems();
    });

    row.append(deleteButton);
    checklistList.append(row);
  });

  updateChecklistProgress();
};

const celebrateChecklist = () => {
  const confettiLayer = document.createElement("div");
  confettiLayer.className = "packing_checklist__confetti";
  confettiLayer.setAttribute("aria-hidden", "true");
  document.body.append(confettiLayer);

  ["✦", "♥", "✧", "✦", "♥", "✧", "✦", "♥", "✧", "✦", "♥", "✧"].forEach((symbol) => {
    const particle = document.createElement("span");
    particle.className = "packing_checklist__confetti_piece";
    particle.textContent = symbol;
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.setProperty("--confetti-drift", `${Math.random() * 120 - 60}px`);
    particle.style.animationDelay = `${Math.random() * 180}ms`;
    particle.addEventListener(
      "animationend",
      () => {
        particle.remove();
        if (!confettiLayer.childElementCount) confettiLayer.remove();
      },
      { once: true },
    );
    confettiLayer.append(particle);
  });
};

checklistAddForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const label = checklistNewItem.value.trim();
  if (!label) return;

  checklistItems.push({
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    label,
  });
  checklistNewItem.value = "";
  checklistStatus.textContent = `${label}を追加しました`;
  saveChecklistState();
  renderChecklistItems();
});

checklistReset?.addEventListener("click", () => {
  checkedChecklistIds.clear();
  saveChecklistState();
  renderChecklistItems();
});

renderChecklistItems();
