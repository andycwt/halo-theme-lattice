// 修正 theme-package 打包結果：補上 NOTICE（第三方 MIT 版權聲明），移除 pnpm 的設定檔
import { readFileSync } from "node:fs";
import AdmZip from "adm-zip";
import { parse } from "yaml";

const ADD = ["NOTICE"];
const REMOVE = ["pnpm-lock.yaml", "pnpm-workspace.yaml"];

const { metadata, spec } = parse(readFileSync("theme.yaml", "utf8"));
const zipPath = `dist/${metadata.name}-${spec.version}.zip`;
const zip = new AdmZip(zipPath);

for (const name of REMOVE) {
  if (zip.getEntry(name)) zip.deleteFile(name);
}
for (const name of ADD) {
  zip.addFile(name, readFileSync(name));
}
zip.writeZip(zipPath);

const missing = ADD.filter((name) => !zip.getEntry(name));
const leftover = REMOVE.filter((name) => zip.getEntry(name));
if (missing.length || leftover.length) {
  console.error(
    `打包檢查失敗：缺少 ${missing.join(", ") || "無"}；多餘 ${leftover.join(", ") || "無"}`,
  );
  process.exit(1);
}
console.log(`已修正 ${zipPath}：加入 ${ADD.join(", ")}，移除 ${REMOVE.join(", ")}`);
