// 效能預算（docs/spec.md 第 8.2 節）：CSS ≤ 30KB gzip；主要 JS ≤ 15KB gzip（不含按需載入的 chunk，例如 highlight.js）。
// 需先建置（pnpm build）。「主要 JS」指模板以 <script src> 直接載入的檔案。
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";

const ASSETS_DIR = "templates/assets";
const BUDGET = { css: 30 * 1024, js: 15 * 1024 };

if (!existsSync(ASSETS_DIR)) {
  console.error("找不到 templates/assets/，請先執行 pnpm build");
  process.exit(1);
}

const gzipSize = (file) => gzipSync(readFileSync(file), { level: 9 }).length;
const kb = (bytes) => `${(bytes / 1024).toFixed(2)} KB`;

// 模板直接載入的資源（<script src> 與 <link rel="stylesheet">）
const entries = new Set();
for (const file of readdirSync("templates", { recursive: true }).filter((name) =>
  name.endsWith(".html"),
)) {
  const html = readFileSync(path.join("templates", file), "utf8");
  for (const [, asset] of html.matchAll(/(?:src|href)="[^"]*\/assets\/([^"]+\.(?:js|css))"/g))
    entries.add(asset);
}

const assets = readdirSync(ASSETS_DIR).filter((name) => /\.(js|css)$/.test(name));
const totals = { css: 0, js: 0 };
const rows = [];
for (const name of assets) {
  const type = name.endsWith(".css") ? "css" : "js";
  const size = gzipSize(path.join(ASSETS_DIR, name));
  // CSS 全部計入；JS 只計入模板直接載入的檔案
  const counted = type === "css" || entries.has(name);
  if (counted) totals[type] += size;
  rows.push(`  ${counted ? "●" : "○"} ${name.padEnd(36)} ${kb(size).padStart(10)}`);
}

console.log("資源大小（gzip；● 計入預算，○ 按需載入不計入）：");
console.log(rows.sort().join("\n"));

let failed = false;
for (const type of ["css", "js"]) {
  const ok = totals[type] <= BUDGET[type];
  failed ||= !ok;
  console.log(
    `${ok ? "✔" : "✖"} ${type.toUpperCase()} ${kb(totals[type])} / 預算 ${kb(BUDGET[type])}`,
  );
}
if (failed) {
  console.error("\n超出效能預算");
  process.exit(1);
}
