// 語系切換：寫入 Halo 原生支援的 language cookie 後重新載入，由伺服器以新語系渲染。
// 機制改寫自 Ethereal 的 LanguageSwitch.svelte（MIT，見 NOTICE）。

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
}

export function initLangSwitch() {
  for (const root of document.querySelectorAll<HTMLElement>("[data-lang-switch]")) {
    const toggle = root.querySelector<HTMLButtonElement>("[data-lang-switch-toggle]");
    const menu = root.querySelector<HTMLElement>(".lang-switch-menu");
    if (!toggle || !menu) continue;

    const isOpen = () => toggle.getAttribute("aria-expanded") === "true";
    const setOpen = (open: boolean) => {
      menu.hidden = !open;
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

    for (const option of menu.querySelectorAll<HTMLButtonElement>("[data-lang]")) {
      option.addEventListener("click", () => {
        setOpen(false);
        if (option.getAttribute("aria-current") === "true") return;
        setCookie("language", option.dataset.lang!);
        // 標記訪客已自行選擇過語系
        setCookie("lattice_lang_chosen", "1");
        location.reload();
      });
    }
  }
}
