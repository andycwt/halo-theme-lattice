// 主題結構驗證（docs/spec.md 第 8.2 節）。需先建置（pnpm build），因為語系 key 要從展開片段後的 templates/ 檢查。
//
// 檢查項目：
//   1. theme.yaml 必要欄位、與 settings.yaml / package.json 的一致性、自訂模板檔案存在
//   2. settings.yaml 的 group 與欄位名稱不重複
//   3. 三個語系檔的 key 完全一致、沒有空值、沒有重複 key、{n} 參數數量一致
//   4. 模板中用到的每個語系 key 都有定義
// 錯誤會讓程式以非 0 結束；只列出警告（例如定義了但沒用到的 key）不影響結果。
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { parse } from "yaml";

const LOCALES = ["default", "zh_TW", "zh_CN"];
const TEMPLATES_DIR = "templates";

const errors = [];
const warnings = [];
const error = (message) => errors.push(message);
const warn = (message) => warnings.push(message);

// ---------- 1. theme.yaml ----------
const theme = parse(readFileSync("theme.yaml", "utf8"));
const settings = parse(readFileSync("settings.yaml", "utf8"));
const pkg = JSON.parse(readFileSync("package.json", "utf8"));

if (theme?.apiVersion !== "theme.halo.run/v1alpha1")
  error("theme.yaml：apiVersion 必須是 theme.halo.run/v1alpha1");
if (theme?.kind !== "Theme") error("theme.yaml：kind 必須是 Theme");
if (theme?.metadata?.name !== "theme-lattice")
  error("theme.yaml：metadata.name 必須是 theme-lattice（發布後不可更改）");
for (const field of ["displayName", "version", "requires", "settingName", "configMapName"]) {
  if (!theme?.spec?.[field]) error(`theme.yaml：缺少 spec.${field}`);
}
if (!theme?.spec?.author?.name) error("theme.yaml：缺少 spec.author.name");
if (!/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(theme?.spec?.version ?? "")) {
  error(`theme.yaml：spec.version「${theme?.spec?.version}」不是語意化版本`);
}
if (theme?.spec?.version !== pkg.version) {
  error(
    `版本不一致：theme.yaml 為 ${theme?.spec?.version}，package.json 為 ${pkg.version}（以 theme.yaml 為準）`,
  );
}
if (theme?.spec?.settingName !== settings?.metadata?.name) {
  error(
    `theme.yaml 的 settingName（${theme?.spec?.settingName}）與 settings.yaml 的 metadata.name（${settings?.metadata?.name}）不一致`,
  );
}
for (const [kind, templates] of Object.entries(theme?.spec?.customTemplates ?? {})) {
  for (const template of templates) {
    if (!existsSync(path.join("src", template.file))) {
      error(`theme.yaml：customTemplates.${kind} 的 ${template.file} 不存在於 src/`);
    }
  }
}

// ---------- 2. settings.yaml ----------
const groups = new Set();
for (const form of settings?.spec?.forms ?? []) {
  if (groups.has(form.group)) error(`settings.yaml：group「${form.group}」重複`);
  groups.add(form.group);
  const names = new Set();
  for (const field of form.formSchema ?? []) {
    if (!field.name) continue;
    if (names.has(field.name)) error(`settings.yaml：${form.group}.${field.name} 重複`);
    names.add(field.name);
  }
}

// ---------- 3. 語系檔 ----------
function readProperties(file) {
  const entries = new Map();
  readFileSync(file, "utf8")
    .split(/\r?\n/)
    .forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("!")) return;
      const separator = trimmed.indexOf("=");
      if (separator === -1) {
        error(`${file}:${index + 1}：缺少「=」`);
        return;
      }
      const key = trimmed.slice(0, separator).trim();
      const value = trimmed.slice(separator + 1).trim();
      if (entries.has(key)) error(`${file}:${index + 1}：key「${key}」重複`);
      if (!value) error(`${file}:${index + 1}：key「${key}」沒有值`);
      entries.set(key, value);
    });
  return entries;
}

const locales = Object.fromEntries(
  LOCALES.map((locale) => [locale, readProperties(`i18n/${locale}.properties`)]),
);
const allKeys = new Set(Object.values(locales).flatMap((entries) => [...entries.keys()]));
// 參數索引（{0}、{1,choice,...} 等），只比較用到哪些索引，允許各語系使用不同的格式（例如英文的單複數 choice）
const placeholders = (value) =>
  [...new Set([...value.matchAll(/\{(\d+)[,}]/g)].map(([, index]) => index))].sort().join(",");

for (const key of allKeys) {
  const missing = LOCALES.filter((locale) => !locales[locale].has(key));
  if (missing.length > 0) {
    error(`語系 key「${key}」缺少於：${missing.join(", ")}`);
    continue;
  }
  const expected = placeholders(locales.default.get(key));
  for (const locale of LOCALES) {
    if (placeholders(locales[locale].get(key)) !== expected) {
      error(`語系 key「${key}」在 ${locale} 的參數（{0} 等）與 default 不一致`);
    }
  }
}

// ---------- 4. 模板用到的 key ----------
if (!existsSync(TEMPLATES_DIR)) {
  error("找不到 templates/，請先執行 pnpm build");
} else {
  const files = readdirSync(TEMPLATES_DIR, { recursive: true }).filter((file) =>
    file.endsWith(".html"),
  );
  const used = new Set();
  const usedPrefixes = new Set();

  for (const file of files) {
    const html = readFileSync(path.join(TEMPLATES_DIR, file), "utf8");
    // #{key} 與 #{key(參數)}
    for (const [, key] of html.matchAll(/#\{([\w.]+)\s*[(}]/g)) used.add(key);
    // ${#messages.msg('key'...)}，包含三元運算式中的多個 key
    for (const [, call] of html.matchAll(/#messages\.msg\(([^)]*)\)/g)) {
      for (const [, key] of call.matchAll(/'([\w]+\.[\w.]+)'(?!\s*\+)/g)) used.add(key);
      // 'prefix.' + 變數：動態 key，以前綴視為已使用
      for (const [, prefix] of call.matchAll(/'([\w.]+\.)'\s*\+/g)) usedPrefixes.add(prefix);
    }
  }

  for (const key of used) {
    if (!allKeys.has(key)) error(`模板用到未定義的語系 key「${key}」`);
  }
  for (const key of allKeys) {
    const isUsed = used.has(key) || [...usedPrefixes].some((prefix) => key.startsWith(prefix));
    if (!isUsed) warn(`語系 key「${key}」沒有在模板中使用`);
  }
  console.log(
    `已檢查 ${files.length} 個模板、${used.size} 個語系 key（另有動態前綴：${[...usedPrefixes].join(", ") || "無"}）`,
  );
}

// ---------- 結果 ----------
for (const message of warnings) console.warn(`⚠ ${message}`);
for (const message of errors) console.error(`✖ ${message}`);
if (errors.length > 0) {
  console.error(`\n主題驗證失敗：${errors.length} 個錯誤`);
  process.exit(1);
}
console.log(
  `✔ 主題驗證通過（${allKeys.size} 個語系 key × ${LOCALES.length} 個語系${warnings.length ? `，${warnings.length} 個警告` : ""}）`,
);
