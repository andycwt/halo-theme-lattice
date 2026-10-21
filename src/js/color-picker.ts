// 訪客自訂主色：導覽列的調色盤面板（預設色票、自由選色、恢復站點預設），選擇存在 localStorage。
// 頁面載入時的套用由 src/partials/color-mode-script.html 負責（防閃爍），兩邊的儲存鍵名需一致。
import { initDisclosure } from "./disclosure";

const STORAGE_KEY = "lattice-primary";
const HEX_PATTERN = /^#[0-9a-f]{6}$/i;

const root = document.documentElement;

function readStored() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value && HEX_PATTERN.test(value) ? value : null;
  } catch {
    return null;
  }
}

function store(color: string | null) {
  try {
    if (color) localStorage.setItem(STORAGE_KEY, color);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 無法寫入（例如隱私模式）時，只在本頁生效
  }
}

export function initColorPicker() {
  const picker = document.querySelector<HTMLElement>("[data-color-picker]");
  const toggle = picker?.querySelector<HTMLButtonElement>("[data-color-picker-toggle]");
  const panel = picker?.querySelector<HTMLElement>(".color-picker-panel");
  if (!picker || !toggle || !panel) return;

  const siteColor = picker.dataset.siteColor ?? "";
  const swatches = [...panel.querySelectorAll<HTMLButtonElement>("[data-color]")];
  const input = panel.querySelector<HTMLInputElement>("[data-color-input]");
  const reset = panel.querySelector<HTMLButtonElement>("[data-color-reset]");

  // 套用顏色；null 代表恢復站點預設（移除覆寫，回到伺服器輸出的 inline style 或 CSS 預設值）
  const apply = (color: string | null) => {
    if (color) root.style.setProperty("--lattice-primary", color);
    else if (siteColor) root.style.setProperty("--lattice-primary", siteColor);
    else root.style.removeProperty("--lattice-primary");

    const current = (color ?? siteColor).toLowerCase();
    for (const swatch of swatches) {
      swatch.setAttribute("aria-pressed", String(swatch.dataset.color!.toLowerCase() === current));
    }
    if (input && current) input.value = current;
    if (reset) reset.disabled = color === null;
  };

  initDisclosure(picker, toggle, panel);
  apply(readStored());

  for (const swatch of swatches) {
    swatch.addEventListener("click", () => {
      const color = swatch.dataset.color!;
      apply(color);
      store(color);
    });
  }

  // 拖曳選色器時即時預覽，放開（change）時才儲存
  input?.addEventListener("input", () => apply(input.value));
  input?.addEventListener("change", () => store(input.value));

  reset?.addEventListener("click", () => {
    apply(null);
    store(null);
  });

  // 其他分頁變更時同步
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY)
      apply(event.newValue && HEX_PATTERN.test(event.newValue) ? event.newValue : null);
  });
}
