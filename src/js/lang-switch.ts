// 語系切換：寫入 Halo 原生支援的 language cookie 後重新載入，由伺服器以新語系渲染。
// 機制改寫自 Ethereal 的 LanguageSwitch.svelte（MIT，見 NOTICE）。
import { initDisclosure } from "./disclosure";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
}

export function initLangSwitch() {
  for (const root of document.querySelectorAll<HTMLElement>("[data-lang-switch]")) {
    const toggle = root.querySelector<HTMLButtonElement>("[data-lang-switch-toggle]");
    const menu = root.querySelector<HTMLElement>(".lang-switch-menu");
    if (!toggle || !menu) continue;

    const { close } = initDisclosure(root, toggle, menu);

    for (const option of menu.querySelectorAll<HTMLButtonElement>("[data-lang]")) {
      option.addEventListener("click", () => {
        close();
        if (option.getAttribute("aria-current") === "true") return;
        setCookie("language", option.dataset.lang!);
        // 標記訪客已自行選擇過語系
        setCookie("lattice_lang_chosen", "1");
        location.reload();
      });
    }
  }
}
