// 文章目錄：依正文（[data-toc-source]）的 h2–h4 產生巢狀清單，填入側邊欄元件與手機版對話框，
// 並在捲動時標示目前所在的段落（aria-current="location"）。

const HEADING_SELECTOR = "h2, h3, h4";
const ACTIVE_ZONE = 80;

function slugify(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[\s\p{P}\p{S}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

// 確保每個標題都有唯一的 id，作為目錄連結的錨點
function ensureIds(headings: HTMLElement[]) {
  const used = new Set(
    [...document.querySelectorAll<HTMLElement>("[id]")].map((element) => element.id),
  );
  headings.forEach((heading, index) => {
    if (heading.id) return;
    const base = slugify(heading.textContent ?? "") || `section-${index + 1}`;
    let id = base;
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
    heading.id = id;
    used.add(id);
  });
}

function buildList(headings: HTMLElement[]) {
  const minLevel = Math.min(...headings.map((heading) => Number(heading.tagName[1])));
  const root = document.createElement("ol");
  const stack: { level: number; list: HTMLOListElement }[] = [{ level: minLevel, list: root }];

  for (const heading of headings) {
    const level = Number(heading.tagName[1]);
    while (stack.length > 1 && level < stack[stack.length - 1].level) stack.pop();

    let { list } = stack[stack.length - 1];
    if (level > stack[stack.length - 1].level) {
      const parentItem = list.lastElementChild ?? list.appendChild(document.createElement("li"));
      const nested = document.createElement("ol");
      parentItem.appendChild(nested);
      stack.push({ level, list: nested });
      list = nested;
    }

    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = `#${encodeURIComponent(heading.id)}`;
    link.textContent = heading.textContent;
    link.dataset.tocTarget = heading.id;
    item.appendChild(link);
    list.appendChild(item);
  }
  return root;
}

function trackActive(headings: HTMLElement[], navs: HTMLElement[]) {
  let activeId: string | undefined;

  const update = () => {
    // 標題進入導覽列下方一小段範圍內就算目前段落；捲到頁面底部時，最後一個標題可能到不了頂端，直接選它
    const threshold =
      (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0) + ACTIVE_ZONE;
    const atBottom = innerHeight + scrollY >= document.documentElement.scrollHeight - 2;
    let current = headings[0];
    if (atBottom) current = headings[headings.length - 1];
    else {
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= threshold) current = heading;
        else break;
      }
    }
    if (current.id === activeId) return;
    activeId = current.id;

    for (const nav of navs) {
      for (const link of nav.querySelectorAll<HTMLAnchorElement>("a[data-toc-target]")) {
        const active = link.dataset.tocTarget === activeId;
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");

        // 目錄超出吸頂區塊高度時，讓目前項目保持可見（只捲動區塊本身，不捲動頁面）
        const container = link.closest<HTMLElement>(".sidebar-sticky");
        if (active && container) {
          const linkTop = link.offsetTop - container.offsetTop;
          if (
            linkTop < container.scrollTop ||
            linkTop > container.scrollTop + container.clientHeight - link.offsetHeight
          ) {
            container.scrollTop = linkTop - container.clientHeight / 2;
          }
        }
      }
    }
  };

  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      update();
    });
  };
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  update();
}

function initMobileDialog(list: HTMLOListElement) {
  const fab = document.querySelector<HTMLButtonElement>("[data-toc-fab]");
  const dialog = document.querySelector<HTMLDialogElement>("[data-toc-dialog]");
  const nav = dialog?.querySelector<HTMLElement>("[data-toc-mobile]");
  if (!fab || !dialog || !nav) return;

  nav.appendChild(list);
  fab.hidden = false;

  fab.addEventListener("click", () => dialog.showModal());
  dialog.querySelector("[data-toc-dialog-close]")?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    // 點擊目錄連結或對話框外的背景時關閉
    if (event.target === dialog || (event.target as Element).closest("a")) dialog.close();
  });
  return nav;
}

export function initToc() {
  const widgets = [...document.querySelectorAll<HTMLElement>("[data-toc-widget]")];
  const source = document.querySelector<HTMLElement>("[data-toc-source]");
  if (widgets.length === 0 || !source) return;

  const headings = [...source.querySelectorAll<HTMLElement>(HEADING_SELECTOR)].filter((heading) =>
    heading.textContent?.trim(),
  );
  if (headings.length === 0) return;

  ensureIds(headings);

  const navs: HTMLElement[] = [];
  for (const widget of widgets) {
    const nav = widget.querySelector<HTMLElement>("[data-toc]");
    if (!nav) continue;
    nav.appendChild(buildList(headings));
    widget.hidden = false;
    navs.push(nav);
  }

  const mobileNav = initMobileDialog(buildList(headings));
  if (mobileNav) navs.push(mobileNav);

  trackActive(headings, navs);
}
