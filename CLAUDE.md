# 專案工作規範與架構說明

本專案是 Halo 2.x 佈景主題 **Lattice**（`theme-lattice`）。

## 開始工作前必讀
- **`docs/spec.md`**：完整規格書，記錄所有已拍板的決策、查證過的技術事實，以及實作階段與目前進度。
- 規格書中的決策都已由使用者確認，不要自行推翻。如果需要變更，先向使用者提出並取得同意，再同步更新 `docs/spec.md`。
- 每完成一個實作階段，都要更新 `docs/spec.md` 的「實作階段與進度」章節。

## 目錄結構規範
- `src/`：所有手寫的程式原始碼（Thymeleaf 模板、CSS、TypeScript）與工具腳本（`src/scripts/`）一律存放於此。
  - 注意：官方 Vite 插件會把 `src/` 底下所有的 `.html`（`src/partials/` 除外）當成頁面入口，所以不要在 `src/` 放非模板用途的 `.html`。
- `docs/`：所有的規格書、設計文件、會議記錄或說明文件一律存放於此目錄。
- 根目錄只保留專案全域設定檔，以及 Halo 或官方工具規定必須放在根目錄的檔案：
  - 專案設定：`CLAUDE.md`、`.gitignore`、`package.json`、`pnpm-lock.yaml`、`vite.config.ts`、`tsconfig.json`、Prettier 等工具設定、`LICENSE`、`NOTICE`、`README.md`
  - Halo 主題描述檔：`theme.yaml`、`settings.yaml`、`annotation-setting.yaml`
  - `i18n/`：語系檔（Halo 規定的位置）
  - `public/`：靜態資源（官方 Vite 插件的慣例）
  - `templates/`：建置產物，列入 `.gitignore`，不進版控
  - `dev/`：本機開發環境（`docker-compose.yaml` 等）
  - `.github/`：CI 與發布流程

## 協同作業原則
1. 新增或修改任何功能程式碼時，請放在 `src/` 相應路徑。
2. 撰寫或更新架構說明、技術文件時，請放在 `docs/`。
3. 產生重要檔案前，請簡要說明用途與放置路徑。
