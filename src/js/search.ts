// 搜尋按鈕：呼叫 plugin-search-widget 的 SearchWidget.open()。
// 伺服器端已依插件狀態決定是否輸出按鈕；插件腳本載入失敗時再隱藏按鈕。

declare global {
  interface Window {
    SearchWidget?: { open: () => void };
  }
}

export function initSearch() {
  const buttons = document.querySelectorAll<HTMLButtonElement>("[data-search-open]");
  if (buttons.length === 0) return;

  for (const button of buttons) {
    button.addEventListener("click", () => window.SearchWidget?.open());
  }

  // 插件腳本以 defer 載入，可能晚於本模組執行，所以等 load 之後再檢查
  const hideIfUnavailable = () => {
    if (window.SearchWidget) return;
    for (const button of buttons) button.hidden = true;
  };
  if (document.readyState === "complete") hideIfUnavailable();
  else window.addEventListener("load", hideIfUnavailable, { once: true });
}
