// 三欄佈局縮成二欄（< 1280px）時，左右側邊欄上下排列。左側邊欄只佔上方一列，
// 它的吸頂元件無法停靠，所以移到右側邊欄的吸頂區塊最前面；恢復三欄時再移回。

const THREE_COLUMN_QUERY = "(min-width: 1280px)";

export function initSidebar() {
  const body = document.querySelector('.site-body[data-sidebar="both"]');
  const primary = body?.querySelector<HTMLElement>(".sidebar-primary .sidebar-sticky");
  const secondary = body?.querySelector<HTMLElement>(".sidebar-secondary .sidebar-sticky");
  if (!primary || !secondary) return;

  const primaryWidgets = [...primary.children];
  if (primaryWidgets.length === 0) return;

  const place = (threeColumn: boolean) => {
    if (threeColumn) primary.append(...primaryWidgets);
    else secondary.prepend(...primaryWidgets);
  };

  const query = matchMedia(THREE_COLUMN_QUERY);
  place(query.matches);
  query.addEventListener("change", (event) => place(event.matches));
}
