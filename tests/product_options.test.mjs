import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../assets/js/product_detail.js", import.meta.url), "utf8");
const builder = source.slice(
  source.indexOf("const optionColors ="),
  source.indexOf("if (Array.isArray(displayOptions))"),
);

class UIEvent {
  constructor(type, options = {}) {
    this.type = type;
    Object.assign(this, options);
  }
  preventDefault() {
    this.defaultPrevented = true;
  }
}

class Element {
  constructor(tag) {
    this.tag = tag;
    this.children = [];
    this.dataset = {};
    this.attributes = {};
    this.listeners = {};
    this.styles = new Map();
    this.style = { setProperty: (key, value) => this.styles.set(key, value) };
    this.classes = new Set();
    this.classList = {
      toggle: (name, active) => (active ? this.classes.add(name) : this.classes.delete(name)),
    };
  }
  setAttribute(key, value) {
    this.attributes[key] = value;
  }
  removeAttribute(key) {
    delete this.attributes[key];
  }
  append(...nodes) {
    nodes.forEach((node) => {
      node.parent = this;
      this.children.push(node);
    });
  }
  appendChild(node) {
    this.append(node);
    return node;
  }
  addEventListener(type, handler) {
    (this.listeners[type] ||= []).push(handler);
  }
  dispatchEvent(event) {
    event.target ||= this;
    this.listeners[event.type]?.forEach((handler) => handler(event));
    if (event.bubbles && this.parent) this.parent.dispatchEvent(event);
  }
  click() {
    if (!this.disabled) this.dispatchEvent(new UIEvent("click", { bubbles: true }));
  }
  focus() {
    this.focused = true;
  }
  scrollIntoView() {
    this.scrolled = true;
  }
  get options() {
    return this.children.filter((node) => node.tag === "option");
  }
  get selectedOptions() {
    return this.options.filter((option) => option.value === this.value);
  }
  set value(value) {
    this.savedValue = value;
  }
  get value() {
    return this.savedValue ?? "";
  }
  get previousElementSibling() {
    return this.parent.children[this.parent.children.indexOf(this) - 1];
  }
}

const fixture = (id, disabled = []) => {
  const variants = ["赤", "青", "白"].map((label, index) => ({ id: `variant-${index}`, label }));
  const create = vm.runInNewContext(`${builder}\ncreateOptionSelect`, {
    document: {
      createElement: (tag) => new Element(tag),
      createElementNS: (ns, tag) => new Element(tag),
    },
    product: { id, variants },
    window: {
      getVariantPhysicalStock: (sourceId, variantId) => (disabled.includes(variantId) ? 0 : 3),
    },
    Event: UIEvent,
  });
  return { create, variants };
};

test("カラーは同寸のハート選択になり、白にも輪郭があり、在庫なしを選べない", () => {
  const { create } = fixture("bag", ["variant-1"]);
  const group = create("カラー", ["赤", "青", "白"], 0);
  const [label, select, choices] = group.children;
  assert.equal(select.hidden, true);
  assert.equal(select.previousElementSibling, label);
  assert.equal(choices.attributes.role, "radiogroup");
  assert.equal(choices.attributes["aria-labelledby"], label.id);
  assert.equal(choices.children.length, 3);
  const [red, blue, white] = choices.children;
  assert.equal(red.tabIndex, 0);
  assert.equal(blue.disabled, true);
  assert.match(blue.title, /在庫なし/);
  blue.click();
  assert.equal(select.value, "");
  assert.equal(white.styles.get("--option-color"), "#ffffff");
  assert.equal(white.styles.get("--option-stroke"), "#9da1b9");
});

test("ハートを選ぶと元のselectと在庫の種類IDが更新され、changeが親に届く", () => {
  const { create } = fixture("bag");
  const group = create("カラー", ["赤", "青", "白"], 0);
  const [, select, choices] = group.children;
  let changes = 0;
  group.addEventListener("change", () => changes++);
  choices.children[1].click();
  assert.equal(select.value, "青");
  assert.equal(select.selectedOptions[0].dataset.variantId, "variant-1");
  assert.equal(select.dataset.sourceProductId, "bag");
  assert.equal(changes, 1);
  assert.equal(choices.children[1].attributes["aria-checked"], "true");
  assert.equal(choices.children[0].attributes["aria-checked"], "false");
});

test("セットのうちわケースはケースの在庫IDを使い、うちわ文字は元の文言を保存する", () => {
  const { create, variants } = fixture("set");
  const caseGroup = create("うちわケース：カラー", ["赤", "青"], 0, {
    sourceProductId: "fan_case",
    sourceVariants: variants,
  });
  caseGroup.children[2].children[0].click();
  assert.equal(caseGroup.children[1].dataset.sourceProductId, "fan_case");
  assert.equal(caseGroup.children[1].selectedOptions[0].dataset.variantId, "variant-0");
  const fanGroup = create("うちわの文字", ["ピースして", "投げキッスして"], 1, {
    sourceProductId: "fan",
  });
  fanGroup.children[2].children[1].click();
  assert.equal(fanGroup.children[1].value, "投げキッスして");
  assert.equal(fanGroup.children[2].children[1].children[0].textContent, "投げキッスして");
});

test("矢印キーで在庫なしを飛ばし、横スクロールの先の選択肢も選べる", () => {
  const { create } = fixture("bag", ["variant-1"]);
  const group = create("カラー", ["赤", "青", "白"], 0);
  const [, select, choices] = group.children;
  choices.dispatchEvent(new UIEvent("keydown", { key: "ArrowRight", target: choices.children[0] }));
  assert.equal(select.value, "白");
  assert.equal(choices.children[2].focused, true);
  assert.equal(choices.children[2].scrolled, true);
  choices.dispatchEvent(new UIEvent("keydown", { key: "Home", target: choices.children[2] }));
  assert.equal(select.value, "赤");
});

test("未選択時は見える選択肢にフォーカスしてエラーを示す", () => {
  const { create } = fixture("fan");
  const group = create("うちわの文字", ["ピースして", "指ハートして"], 0);
  const [, select, choices, status] = group.children;
  const event = new UIEvent("invalid");
  select.dispatchEvent(event);
  assert.equal(event.defaultPrevented, true);
  assert.equal(status.hidden, false);
  assert.equal(choices.children[0].focused, true);
  choices.children[0].click();
  assert.equal(status.hidden, true);
});

test("単品の双眼鏡タイプはうちわ文字と同じ横並び選択で値を更新する", () => {
  const { create } = fixture("binoculars");
  const group = create("タイプ", ["8倍", "10倍", "防振", "防水"], 0);
  const [, select, choices] = group.children;
  assert.equal(select.hidden, true);
  assert.equal(choices.children.length, 4);
  assert.match(choices.children[0].className, /--message/);
  choices.children[2].click();
  assert.equal(select.value, "防振");
  assert.equal(choices.children[2].attributes["aria-checked"], "true");
});

test("セットの双眼鏡も種類別の在庫IDと在庫なし状態を維持する", () => {
  const { create } = fixture("set", ["waterproof"]);
  const group = create("双眼鏡：タイプ", ["8倍", "防振", "防水"], 3, {
    sourceProductId: "binoculars",
    sourceVariants: [
      { id: "8x", label: "8倍" },
      { id: "stabilized", label: "防振" },
      { id: "waterproof", label: "防水" },
    ],
  });
  const [, select, choices] = group.children;
  assert.equal(select.dataset.sourceProductId, "binoculars");
  assert.equal(choices.children[2].disabled, true);
  choices.children[1].click();
  assert.equal(select.selectedOptions[0].dataset.variantId, "stabilized");
  choices.children[2].click();
  assert.equal(select.value, "防振");
});
