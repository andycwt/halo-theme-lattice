// 導覽列：捲動後切換精簡樣式；手機版漢堡選單的開關

export function initNavbar() {
  const header = document.querySelector<HTMLElement>("[data-site-header]");
  if (!header) return;

  const sentinel = document.querySelector(".site-header-sentinel");
  if (sentinel) {
    new IntersectionObserver(([entry]) => {
      header.toggleAttribute("data-scrolled", !entry.isIntersecting);
    }).observe(sentinel);
  }

  const nav = header.querySelector<HTMLElement>("[data-site-nav]");
  const toggle = header.querySelector<HTMLButtonElement>("[data-nav-toggle]");
  if (!nav || !toggle) return;

  const setOpen = (open: boolean) => {
    nav.toggleAttribute("data-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    const label = open ? toggle.dataset.labelClose : toggle.dataset.labelOpen;
    if (label) toggle.setAttribute("aria-label", label);
  };

  toggle.addEventListener("click", () => setOpen(!nav.hasAttribute("data-open")));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.hasAttribute("data-open")) {
      setOpen(false);
      toggle.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (nav.hasAttribute("data-open") && !header.contains(event.target as Node)) setOpen(false);
  });

  // 切換到桌面寬度時收起
  matchMedia("(min-width: 768px)").addEventListener("change", (event) => {
    if (event.matches) setOpen(false);
  });
}
