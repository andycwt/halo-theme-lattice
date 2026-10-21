// 正文程式碼區塊：所有 pre 都加上複製按鈕（Shiki 渲染的區塊由插件自己提供）；開啟內建高亮時，動態載入 highlight.js 並上色。

const COPIED_RESET_MS = 2000;

// Clipboard API 只在安全環境（HTTPS 或 localhost）可用；以 HTTP 架設的站點改用 execCommand
async function copyText(text: string) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const ok = document.execCommand("copy");
  textarea.remove();
  if (!ok) throw new Error("copy failed");
}

function addCopyButton(pre: HTMLPreElement, labels: Record<"copy" | "copied" | "failed", string>) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "code-copy";
  button.textContent = labels.copy;

  let timer: number | undefined;
  button.addEventListener("click", async () => {
    const code = pre.querySelector("code") ?? pre;
    try {
      await copyText(code.textContent ?? "");
      button.textContent = labels.copied;
    } catch {
      button.textContent = labels.failed;
    }
    clearTimeout(timer);
    timer = window.setTimeout(() => (button.textContent = labels.copy), COPIED_RESET_MS);
  });

  // 外層容器讓按鈕固定在右上角，不隨 pre 水平捲動
  const wrapper = document.createElement("div");
  wrapper.className = "code-block";
  pre.replaceWith(wrapper);
  wrapper.append(pre, button);
}

export function initCodeBlocks() {
  for (const container of document.querySelectorAll<HTMLElement>("[data-code-blocks]")) {
    // plugin-shiki 的 <shiki-code> 自帶複製按鈕，而且需要 pre 是它的直接子元素，所以略過
    const pres = [...container.querySelectorAll<HTMLPreElement>("pre")].filter(
      (pre) => !pre.closest("shiki-code"),
    );
    if (pres.length === 0) continue;

    const labels = {
      copy: container.dataset.copyLabel ?? "Copy",
      copied: container.dataset.copiedLabel ?? "Copied",
      failed: container.dataset.copyFailedLabel ?? "Copy failed",
    };
    for (const pre of pres) addCopyButton(pre, labels);

    if (container.dataset.highlight === "true") {
      const blocks = container.querySelectorAll<HTMLElement>("pre > code");
      if (blocks.length > 0) import("./highlight").then(({ highlight }) => highlight(blocks));
    }
  }
}
