const pageGroups = {
  account: () => import("./account_pages.js"),
  admin: () => import("./admin_pages.js"),
  auth: () => import("./auth_pages.js"),
  browse: () => import("./browse_pages.js"),
  countdown: () => import("./countdown_pages.js"),
  guide: () => import("./guide_pages.js"),
  rental: () => import("./rental_pages.js"),
};

const loadClassicScript = (filename) =>
  new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = new URL(filename, import.meta.url).href;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`読み込めないスクリプト: ${filename}`));
    document.head.append(script);
  });

try {
  const group = document.documentElement.dataset.pageGroup;
  const { pages, defaultView } = await pageGroups[group]();
  const view = new URLSearchParams(location.search).get("view") || defaultView;
  if (!Object.hasOwn(pages, view)) {
    throw new Error("指定された画面が見つかりません。");
  }

  const { page, title, bodyAttributes, markup, scripts } = pages[view];
  document.title = title;
  document.body.dataset.page = page;
  for (const [name, value] of Object.entries(bodyAttributes)) {
    document.body.setAttribute(name, value);
  }
  // テンプレートはプロジェクト内の定数。URLや利用者の入力はHTMLに差し込まない。
  document.body.innerHTML = markup;

  for (const script of scripts) {
    if (script.startsWith("module:")) {
      await import(new URL(script.slice("module:".length), import.meta.url).href);
    } else {
      await loadClassicScript(script);
    }
  }

  if (location.hash) {
    const id = new URL(location.href).hash.slice(1);
    document.getElementById(id)?.scrollIntoView();
  }
} catch (error) {
  console.error(error);
  const status = document.createElement("p");
  status.setAttribute("role", "alert");
  status.textContent = "画面を表示できませんでした。URLを確認するか、再読み込みしてください。";
  const home = document.createElement("a");
  home.href = "index.html";
  home.textContent = "入口に戻る";
  document.body.className = "";
  document.body.removeAttribute("aria-busy");
  document.body.replaceChildren(status, home);
}
