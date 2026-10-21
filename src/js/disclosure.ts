// 導覽列下拉面板（語系切換、主色選擇）共用的開關行為：
// 按鈕切換 aria-expanded 與面板的 hidden；Esc、點擊外部或焦點離開時收起。

export function initDisclosure(root: HTMLElement, toggle: HTMLButtonElement, panel: HTMLElement) {
  const isOpen = () => toggle.getAttribute("aria-expanded") === "true";
  const setOpen = (open: boolean) => {
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
  };

  toggle.addEventListener("click", () => setOpen(!isOpen()));

  root.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (isOpen() && !root.contains(event.target as Node)) setOpen(false);
  });

  root.addEventListener("focusout", (event) => {
    if (!root.contains(event.relatedTarget as Node | null)) setOpen(false);
  });

  return { close: () => setOpen(false) };
}
