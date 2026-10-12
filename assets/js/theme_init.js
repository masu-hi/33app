(() => {
  const colors = {
    赤: ["#f6cbd3", "#fff6f7", "#eaf2ff", "#adc3e8", "#f2cbd4", "#353b60"],
    青: ["#bfd2f5", "#f7f9ff", "#fff0f2", "#e8b4bd", "#ccd9f1", "#353b60"],
    ピンク: ["#f6ecf8", "#fdf6ff", "#eaf8fb", "#acd8e2", "#ead5ee", "#353b60"],
    紫: ["#dcc9f1", "#fbf7ff", "#fff2e8", "#e8c09f", "#dfd1ef", "#353b60"],
    緑: ["#c9eccf", "#f5fcf7", "#fff8df", "#e3cf8b", "#cfe6d8", "#353b60"],
    黄色: ["#fff0b8", "#fffdf5", "#edf8ef", "#b4d8bd", "#eee2b7", "#353b60"],
    オレンジ: ["#ffd8bd", "#fff9f4", "#f4efff", "#c9b6e8", "#efd5c1", "#353b60"],
    水色: ["#c5ebf2", "#f4fcff", "#fff0f7", "#e8b6cf", "#c8e5ed", "#353b60"],
    白: ["#f7f7f7", "#ffffff", "#4b4c55", "#292a31", "#dedee4", "#ffffff"],
    黒: ["#404148", "#f7f7f9", "#ffffff", "#d6d6dc", "#d2d3dc", "#353b60"],
  };

  const activeEmail = String(sessionStorage.getItem("activeAccountEmail") || "")
    .trim()
    .toLowerCase();
  let favoriteColor = localStorage.getItem("favoriteColor");

  if (activeEmail) {
    try {
      const accounts = JSON.parse(localStorage.getItem("accounts") || "{}");
      favoriteColor = accounts[activeEmail]?.profile?.favorite_color || favoriteColor;
    } catch {
      // 従来の保存値を使用します。
    }
  }

  const palette = colors[favoriteColor];
  if (!palette) return;

  const [main, soft, gradientEnd, gradientLine, line, gradientText] = palette;
  const root = document.documentElement;
  root.style.setProperty("--color-main", main);
  root.style.setProperty("--color-soft", soft);
  root.style.setProperty("--color-gradient-end", gradientEnd);
  root.style.setProperty("--color-gradient-line", gradientLine);
  root.style.setProperty("--color-gradient-text", gradientText);
  root.style.setProperty("--color-line", line);
  root.classList.toggle("is-dark-favorite", favoriteColor === "黒");
})();
