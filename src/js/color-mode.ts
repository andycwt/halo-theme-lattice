// 深淺色切換：按鈕依序循環 自動 → 淺色 → 深色，選擇存在 localStorage。
// 頁面載入時的套用由 src/partials/color-mode-script.html 負責（防閃爍），兩邊的儲存鍵名需一致。

const STORAGE_KEY = "lattice-color-mode";
const MODES = ["auto", "light", "dark"] as const;
type ColorMode = (typeof MODES)[number];

const root = document.documentElement;

function isColorMode(value: unknown): value is ColorMode {
  return MODES.includes(value as ColorMode);
}

function currentMode(): ColorMode {
  const mode = root.dataset.colorMode;
  return isColorMode(mode) ? mode : "auto";
}

function applyMode(mode: ColorMode, buttons: Iterable<HTMLButtonElement>) {
  root.dataset.colorMode = mode;
  // Halo 官方搜尋、評論組件讀取的深淺色標記
  root.dataset.colorScheme = mode;
  for (const button of buttons) {
    const label = button.dataset[`label${mode[0].toUpperCase()}${mode.slice(1)}`] ?? mode;
    button.setAttribute("aria-label", label);
    button.title = label;
  }
}

export function initColorMode() {
  const buttons = [...document.querySelectorAll<HTMLButtonElement>("[data-color-mode-toggle]")];
  if (buttons.length === 0) return;

  applyMode(currentMode(), buttons);

  for (const button of buttons) {
    button.addEventListener("click", () => {
      const next = MODES[(MODES.indexOf(currentMode()) + 1) % MODES.length];
      applyMode(next, buttons);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // 無法寫入（例如隱私模式）時，只在本頁生效
      }
    });
  }

  // 其他分頁切換時同步
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY && isColorMode(event.newValue))
      applyMode(event.newValue, buttons);
  });
}
