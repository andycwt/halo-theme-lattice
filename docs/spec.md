# Lattice 主題規格書

> Halo 2.x 佈景主題。風格簡潔、內容優先，佈局與配色可以自由配置。
> 本文件的所有決策都已經過逐題討論並由使用者確認（2026-10-21）。決策編號（#n）對應當時的討論順序。

---

## 1. 給新 session 的快速導覽

- **目前狀態**：階段 0–10 與追加的 #29 已完成（2026-10-22）。開發流程見 `docs/development.md`。
- **進行中**：使用者在正式站（Halo 2.26.0）試用 0.1.0，試用回饋優先處理。
- **已發布**：v0.1.0（2026-10-22，https://github.com/andycwt/halo-theme-lattice/releases/tag/v0.1.0），CI 與 release workflow 皆已在 GitHub 上實際通過。
- **下一步**：依試用回饋修正；頁面布局契約（`templates/layout.html`）維持第二版範圍（使用者確認，2026-10-22；Halo 後台主題詳情會顯示「缺失」，不影響運作）。
- **工作方式**：每個階段完成後，先讓使用者確認，再進入下一個階段；並同步更新第 9 節的進度。使用者確認後才 commit。
- **本機開發環境的狀態**（只存在本機 Docker volume，不在版控中）：
  - Halo 2.26.0 在 http://localhost:8090 ，管理員帳號只存在本機（不記錄在 repo），介面語言繁中；Lattice 已安裝並啟用
  - 已安裝插件：Halo 預裝的 Shiki、搜尋、留言等，另外安裝了 plugin-links 2.5.0
  - 測試資料：約 16 篇文章（含置頂、長標題、封面、程式碼、6 章目錄測試文）、3 個分類（含子分類）、15 個標籤、2 個友鏈分組與 6 個連結、4 張 SVG 封面；選單與預設分類已改為繁中，「關於」頁套用關於頁模板
  - 主題設定：二欄佈局（側邊欄在左）、8 個側邊欄元件全開、首頁簡介區塊開啟、個人資料與友鏈頁說明填了範例內容、預設分享圖為 `/upload/cover-1.svg`
  - 啟動方式：`pnpm halo:up`，再執行 `pnpm dev`
- 專案資料夾已改名為 `halo-theme-lattice`（#17）。

---

## 2. 主題身分

| 項目 | 值 | 決策 |
|---|---|---|
| 顯示名稱 | Lattice | #16 |
| `metadata.name` | `theme-lattice`（發布後不可更改） | #16 |
| GitHub repo | https://github.com/andycwt/halo-theme-lattice（2026-10-21 建立，2026-10-22 轉為 public） | #16 |
| 授權 | MIT | #6 |
| 版權聲明 | `NOTICE` 中保留 Ethereal（作者：楠南NanNan，MIT）的版權聲明 | #5、#6 |
| Halo 版本需求 | `requires: ">=2.25.0"` | #8 |
| 主要開發與測試版本 | Halo 2.26.0（使用者正式站的版本） | #8 |
| 撞名檢查 | GitHub 上沒有 Halo 主題叫 Lattice（2026-10-21 查證）；Hexo、Hugo、Obsidian 有同名主題，屬於不同生態系，不會衝突。正式上架前要到 Halo 應用市場手動確認一次 | #16 |

---

## 3. 定位與參考來源

- **定位**（#2）：介於 Rackora 與 Ethereal 之間。**核心先做好**，特色功能留到第二版之後。
- **從零開始**（#5）：
  - **Ethereal**（https://github.com/AloneNanNan/halo-theme-ethereal，MIT）：**可以複製片段**，但必須註明出處。主要參考它的 i18n 切換、佈局設定、側邊欄設定。
  - **Rackora**（https://github.com/everett7623/halo-theme-rackora，GPL-3.0）：**只參考視覺風格和頁面結構概念，不可以複製程式碼**，否則整個主題會被 GPL 綁住。

### 3.1 兩套參考主題的技術差異（查證摘要）

| 項目 | Ethereal | Rackora |
|---|---|---|
| 模板 | Astro 元件內嵌 Thymeleaf，建置後輸出 | 直接寫 Thymeleaf HTML |
| 建置 | Astro 7 + Vite + 多支自訂後處理腳本 | Vite 8 + `@halo-dev/vite-plugin-halo-theme` |
| CSS | Tailwind 4（部分用 Stylus） | 原生 CSS |
| 互動 | Svelte 5、Swup、PhotoSwipe、OverlayScrollbars | 原生 TS、highlight.js、lucide |
| `settings.yaml` | 約 2,800 行 | 約 650 行 |
| Halo 需求 | `>=2.25.0` | `>=2.20.0` |

### 3.2 可以從 Ethereal 參考的實作（已查證，只要用 Halo 原生機制就能做到，不需要 Astro 或 Svelte）

| 功能 | Ethereal 中的位置 | 機制 |
|---|---|---|
| 語系切換 | `src/components/widget/LanguageSwitch.svelte` | 寫入 Halo 官方的 `language` cookie（由 Halo 的 `ThemeLocaleContextResolver` 原生支援），寫入後重新載入頁面；另外用 `ethereal_lang_chosen` cookie 標記「訪客已經自行選擇過」。我們要改寫成原生 TS，cookie 名稱改為 `lattice_lang_chosen` |
| 語系檔 | `i18n/default.properties`、`zh_CN.properties`、`zh_TW.properties` | 模板中用 `#{key}` 取字串 |
| 佈局模式 | `settings.yaml` 的 `layout` group，`layoutMode`（約第 7–35 行） | `select`，值為 `two-column` 或 `three-column`，二欄時另有開關決定側邊欄在左或右 |
| 側邊欄元件清單 | `settings.yaml` 的 `sidebar` group（約第 998–1130 行） | 左右側邊欄各用一個 `$formkit: array`，每個項目有元件類型和是否吸頂；模板中用 `th:each` 依序渲染 |
| 配色 | `settings.yaml` 的 `hue`（約第 710 行） | Lattice **不沿用**色相的作法，改用色票選擇器（見 #12） |

---

## 4. 技術架構

| 項目 | 決定 | 決策 |
|---|---|---|
| 建置 | Vite + `@halo-dev/vite-plugin-halo-theme`（查證時版本為 1.0.3） | #3 |
| 打包 | `@halo-dev/theme-package-cli`（查證時版本為 1.1.1） | #27 |
| 模板 | Thymeleaf；共用片段用官方插件的 `include`、`slot`、`props`（建置時預先編譯），或 Thymeleaf 原生的 `th:replace` | #3 |
| 前端腳本 | 原生 TypeScript，不使用 UI 框架 | #3 |
| CSS | 原生 CSS + CSS 變數（design tokens），使用 CSS 巢狀寫法與 `@layer` | #4 |
| 程式碼高亮 | 內建 highlight.js，只打包常用語言；**只在頁面上有 `pre code` 時才動態載入**；後台提供開關（站長已安裝高亮插件時可以關閉） | #20 |
| 複製按鈕 | 所有 `pre` 區塊都提供，和高亮開關無關 | #20 |
| 換頁轉場 | CSS `@view-transition { navigation: auto; }`，零 JS，後台提供開關；**不使用 Swup 或任何 AJAX 換頁** | #23 |
| 留言 | 官方 `plugin-comment-widget`，模板中放 `<halo:comment>`；沒有安裝插件時隱藏區塊 | #19 |
| 搜尋 | 官方 `plugin-search-widget`，按鈕呼叫 `SearchWidget.open()`；`window.SearchWidget` 不存在時隱藏按鈕；用 CSS 變數把主色傳給搜尋組件 | #19 |
| 友情連結 | 官方 `plugin-links`，提供 `/links` 路由 | #28 |
| 瀏覽器支援 | 近兩年的主流瀏覽器（Chrome、Edge、Safari、Firefox），不支援 IE 或舊版 Safari | 共識摘要 |
| 無障礙 | 以 WCAG 2.1 AA 為目標：色彩對比、鍵盤操作、`prefers-reduced-motion` 時關閉轉場 | 共識摘要 |

### 4.1 官方 Vite 插件的固定慣例（已查證 README）

- 頁面原始碼：`src/*.html`，每個檔案都是一個頁面入口，例如 `src/post.html` 輸出成 `templates/post.html`
- 共用片段：`src/partials/`（不會被當成頁面入口）
- 靜態資源：`public/`
- 輸出：`templates/`、`templates/assets/`
- `include` 的路徑解析：`foo.html` 優先找 `src/partials/foo.html`；`/foo.html` 相對於 `src/`；`./` 和 `../` 相對於目前的檔案

---

## 5. 目錄結構（#25）

```
halo-theme-lattice/
├── CLAUDE.md
├── LICENSE                  # MIT
├── NOTICE                   # Ethereal 的 MIT 版權聲明
├── README.md
├── package.json
├── vite.config.ts
├── tsconfig.json
├── theme.yaml               # Halo 主題描述檔，版本號的唯一來源
├── settings.yaml            # 後台設定表單
├── annotation-setting.yaml  # 如果有需要
├── i18n/
│   ├── default.properties   # 英文
│   ├── zh_TW.properties
│   └── zh_CN.properties
├── public/                  # 靜態資源（預設分享圖、favicon 等）
├── templates/               # 建置產物（gitignore）
├── dev/
│   └── docker-compose.yaml  # 本機 Halo 開發環境
├── .github/workflows/       # CI 與發布
├── docs/
│   └── spec.md              # 本文件
└── src/
    ├── index.html  post.html  page.html  page_about.html
    ├── archives.html  categories.html  category.html
    ├── tags.html  tag.html  author.html  links.html
    ├── error/404.html  error/error.html
    ├── partials/            # layout、seo-head、navbar、footer、sidebar、widgets/*、post-item 等
    ├── css/
    ├── js/                  # main.ts、post.ts（TOC、高亮、複製按鈕）等
    └── scripts/             # 驗證、效能預算等工具腳本（.mjs）
```

---

## 6. 功能規格

### 6.1 頁面（#9、#28）

**Halo 標準模板（11 個）**：`index`、`post`、`page`、`archives`、`categories`、`category`、`tags`、`tag`、`author`、`error/404`、`error/error`

**額外頁面**
- **`page_about`**（自訂頁面模板，在 `theme.yaml` 的 `customTemplates.page` 宣告）
  - 頂部顯示頭像、暱稱、一句話簡介，**沿用「個人資料」元件的設定資料**，不另外新增設定
  - 下方是頁面正文（站長在 Halo 編輯器裡撰寫）
  - 可以選擇是否顯示留言區
  - 不新增專屬的後台設定
- **`links`**（依賴 `plugin-links`）
  - 依照插件的分組，用卡片格狀顯示，每張卡片包含頭像、名稱、描述
  - 底部顯示正文區塊（讓站長寫申請友鏈的方式），可以選擇顯示留言區
  - 不做隨機訪問、複製本站資訊等功能（留到第二版）

### 6.2 多語系（#7、#15）

- 語系：英文（`default.properties`）、繁體中文（`zh_TW`）、簡體中文（`zh_CN`）
- **只翻譯主題介面字串**；文章、站名、選單、後台設定的文字都不做多語系
- 導覽列放語系切換按鈕，機制參考第 3.2 節
- 驗證腳本必須檢查三個語系檔的 key 完全一致，而且模板中用到的每個 `#{key}` 都有定義

### 6.3 佈局（#10、#14）

- **整站預設**：二欄（側邊欄在左）、二欄（側邊欄在右）、三欄
- **文章頁覆寫**：跟隨整站預設，或二欄左、二欄右、三欄
- **響應式**：

| 螢幕寬度 | 三欄設定時 | 二欄設定時 |
|---|---|---|
| ≥ 1280px | 三欄 | 二欄 |
| 768–1279px | 縮成二欄，右側邊欄的元件接在左側邊欄下方 | 二欄 |
| < 768px | 單欄，所有側邊欄元件移到主內容下方 | 單欄，側邊欄元件移到主內容下方 |

- 手機上的文章目錄改成右下角的浮動按鈕，點擊後彈出
- 單欄模式下吸頂自動失效

### 6.4 側邊欄元件（#11）

元件庫（8 個）：**個人資料**、**公告**、**分類**、**標籤**、**最新文章**、**站點統計**、**文章目錄（只在文章頁顯示）**、**自訂 HTML**

- 左右側邊欄各是一個可以拖曳排序的清單（`$formkit: array`），由站長自己選擇元件和順序
- 每個元件可以設定是否吸頂
- 全部只使用 Halo 內建的資料，不依賴插件
- 標籤元件依文章數由多到少只顯示前 N 個（`tagsCount`，預設 30），超過時底部顯示「查看全部 N 個標籤」連到標籤總覽，避免標籤很多時側邊欄過長（使用者要求，2026-10-22，正式站約 200 個標籤）

### 6.5 配色與深淺色（#12、#13）

- 後台用**色票選擇器**選一個主色
- 用 `oklch()` 和 `color-mix()` 從主色推算深淺兩種模式的背景、文字、邊框、強調色
- 主色對比不足時，自動調整前景文字色，以符合 AA 標準
- **訪客自訂主色**（#29，使用者於 2026-10-21 新增）：
  - 導覽列提供調色盤按鈕，面板內有 8 個預設色票、自由選色器與「恢復站點預設」
  - 訪客的選擇存在 `localStorage`，並由 `<head>` 的防閃爍腳本在渲染前套用
  - 後台「外觀」提供「允許訪客自訂主色」開關，預設開啟；關閉時隱藏按鈕並忽略訪客先前的選擇
  - 任何顏色都經過同一套推算，對比維持 AA
- 深淺色模式：
  - 站長設定預設模式：自動（跟隨系統）、淺色、深色
  - 訪客可以用導覽列的按鈕切換，選擇存在 `localStorage`
  - 「鎖定」開關：開啟後隱藏切換按鈕，強制使用預設模式
  - 在 `<head>` 放 inline script，在頁面渲染前先套用正確的模式，避免畫面閃爍

### 6.6 字型（#21）

- 預設使用系統字型堆疊，包含繁中與簡中的常見字型
- 後台切換：無襯線或襯線（作用於正文）
- **標題字型**（使用者要求，2026-10-22）：跟隨正文（預設）或明體（襯線）。明體時標題改用襯線字型堆疊（Mac 宋體-繁、Windows 新細明體、Noto Serif TC），字重降為 500，因為新細明體沒有粗體，避免瀏覽器模擬加粗。側邊欄元件標題是介面標籤，維持正文字型。手機多半沒有內建中文明體，會退回黑體
- 後台欄位：「自訂字型 CSS 網址」，填入後在 `<head>` 引入，並提供對應的 `font-family` 欄位

### 6.7 頁首與首頁（#22、#18）

- **導覽列**：Logo、站名、選單、搜尋（有插件才顯示）、語系切換、深淺色切換；吸頂顯示，捲動後縮小並加上半透明背景；手機上用漢堡選單
- **首頁簡介區塊**：預設關閉；欄位包含大標題、副標題、背景圖（選填）
- **文章列表樣式**（首頁、分類、標籤、作者頁共用）：純文字列表（預設）或卡片；選卡片時，沒有封面圖的文章自動退回文字樣式；兩種樣式共用同一個 fragment

### 6.8 SEO（#26）

- 集中在 `src/partials/seo-head.html`
- 輸出內容：`<title>`、`canonical`、Open Graph、Twitter Card、JSON-LD（文章 `BlogPosting`、首頁 `WebSite`、全站 `BreadcrumbList`）
- **不輸出 `<meta name="description">`**：Halo 會在首頁、文章、單頁面、分類、標籤自動注入 description，主題重複輸出會產生兩個同名標籤（使用者同意，2026-10-21，依 Halo 主題 SEO 文件）。`og:description`、`twitter:description` 仍由主題輸出
- 文章沒有封面圖時，分享圖退回使用後台設定的「預設分享圖」
- 後台開關分成兩個（使用者同意，2026-10-21，依 Halo 建議）：「輸出頁面元資料」（canonical、Open Graph、Twitter Card）與「輸出結構化資料」（JSON-LD），讓站長只關掉與 SEO 插件重複的部分。`<title>` 一律輸出，不受開關影響

---

## 7. `settings.yaml` 規劃

原則：**避免設定膨脹**，目標控制在數百行以內。以下是分組草案，實作時可以微調欄位名稱，但不可以增加功能範圍。

| group | 欄位 |
|---|---|
| `layout` 佈局 | 整站佈局模式；文章頁佈局覆寫；文章列表樣式（文字或卡片） |
| `sidebar` 側邊欄 | 左側邊欄元件清單（array：元件類型、是否吸頂、自訂 HTML 內容）；右側邊欄元件清單（同上）；公告內容；最新文章數量；標籤顯示數量 |
| `profile` 個人資料 | 頭像、暱稱、簡介、社群連結（array） |
| `style` 外觀 | 主色（color picker）；允許訪客自訂主色開關；預設深淺色模式；鎖定模式開關；正文字型（無襯線或襯線）；標題字型（跟隨正文或明體）；自訂字型 CSS 網址與 `font-family` |
| `home` 首頁 | 簡介區塊開關、大標題、副標題、背景圖 |
| `post` 文章 | 程式碼高亮開關；關於頁和友鏈頁是否顯示留言 |
| `advanced` 進階 | View Transitions 開關；輸出頁面元資料開關；輸出結構化資料開關；預設分享圖 |

---

## 8. 開發環境與品質把關

### 8.1 本機環境（#24）

- 本機已安裝 Docker 29.8.2、Node v25.8.1、pnpm 12.4.2。查證當下 Docker daemon 沒有在執行，需要先打開 Docker Desktop
- `dev/docker-compose.yaml`：Halo 映像檔（`halohub/halo`）固定在 `2.26.0`，把專案根目錄掛載為容器內的 `~/.halo2/themes/theme-lattice`，並關閉模板快取
- 開發流程：執行 `vite build --watch`，存檔後重新整理瀏覽器
- 相容測試：把映像檔版本改成 `2.25.0` 再跑一次
- 準備測試資料：長標題、沒有封面圖的文章、大量標籤、程式碼區塊、三種語系

### 8.2 品質把關與發布（#27）

| 項目 | 內容 |
|---|---|
| 格式化與檢查 | Prettier + `tsc` 型別檢查，用 git pre-commit hook 自動執行 |
| 主題結構驗證（`src/scripts/`） | `theme.yaml` 必要欄位；**三個語系檔的 key 完全一致**；模板中用到的 `#{key}` 都有定義 |
| 效能預算 | CSS ≤ 30KB gzip；主要 JS ≤ 15KB gzip（不含按需載入的 highlight.js） |
| CI | push 和 PR 時，用 GitHub Actions 執行建置和所有檢查 |
| 發布 | 推送 `v*` tag 時，自動打包 zip 並建立 GitHub Release |
| 版本號 | 以 `theme.yaml` 為唯一來源，`package.json` 同步 |

---

## 9. 實作階段與進度

每個階段完成後，先讓使用者驗收，再進入下一個階段。完成的階段請打勾並註記日期。

- [x] **階段 0：規格定案**：本文件完成；`CLAUDE.md` 目錄規範已更新（2026-10-21）
- [x] **階段 1：專案骨架**：`package.json`、`vite.config.ts`、`tsconfig.json`、`theme.yaml`、空的 `settings.yaml`、三個語系檔、`LICENSE`、`NOTICE`、`.gitignore`（含 `templates/`、`node_modules/`）、Prettier、pre-commit hook；建置出可以安裝的最小主題（只有 `index.html`）（2026-10-21）
  - 常用指令：`pnpm dev`（watch 建置）、`pnpm build`（型別檢查 + 建置）、`pnpm package`（建置 + 打包到 `dist/`）、`pnpm format`
  - pre-commit hook 由 `simple-git-hooks` 安裝（`pnpm install` 時自動設定），執行 lint-staged（Prettier）與 `tsc --noEmit`
  - 根目錄多了 `pnpm-workspace.yaml`：pnpm 12 要在這裡用 `allowBuilds` 核准 `simple-git-hooks` 的安裝腳本，否則 `pnpm install` 會報錯
  - 已在拋棄式 Halo 2.26.0 容器中驗證：zip 可安裝、可啟用、首頁正常渲染、`/themes/theme-lattice/assets/*` 可載入、`zh-TW` 語系字串正確
  - 查證事實：Halo 2.26.0 映像檔預裝 `plugin-comment-widget`、`plugin-search-widget`、`plugin-shiki`（程式碼高亮）
  - 打包修正（使用者同意，2026-10-21）：`theme-package` 預設只打包 `templates/`、`i18n/`、`LICENSE`、`README.md`、`*.yaml` 等，不含 `NOTICE`，且會把 `pnpm-lock.yaml`、`pnpm-workspace.yaml` 一起打包。`pnpm package` 在打包後執行 `src/scripts/normalize-package.mjs`（使用 `adm-zip`），補上 `NOTICE` 並移除這兩個 pnpm 檔案
- [x] **階段 2：本機開發環境**：`dev/docker-compose.yaml`，確認在 Halo 2.26.0 上可以即時預覽（2026-10-21）
  - 指令：`pnpm halo:up`、`pnpm halo:down`、`pnpm halo:logs`；操作說明在 `docs/development.md`
  - 關閉模板快取用環境變數 `SPRING_THYMELEAF_CACHE=false`（Halo 官方主題開發文件的作法）
  - 用環境變數 `HALO_VERSION` 切換 Halo 版本，每個版本使用獨立的資料 volume（`lattice-dev-halo-<版本>`），避免降版造成資料庫不相容
  - 已驗證：Halo 從掛載的目錄辨識出主題，安裝並啟用後，在 `pnpm dev` 執行中修改模板、CSS、語系檔，重新整理就會生效，不需要重啟
  - 第 8.1 節的測試資料尚未準備，留到需要時（階段 6 內容頁面前）再做
- [x] **階段 3：設計系統**：CSS 變數與 tokens、主色推算、深淺色模式（含防閃爍腳本與切換按鈕）、字型堆疊、基礎排版（2026-10-21）
  - CSS 結構：`src/css/main.css` 宣告 `@layer reset, tokens, base, layout, components, utilities`；tokens 在 `tokens.css`，基礎排版與文章正文（`.prose`）在 `base.css`
  - 建置目標（`vite.config.ts`）：`chrome123`、`edge123`、`firefox128`、`safari18`。這些版本原生支援 CSS 巢狀、`light-dark()`、相對色語法，Vite 不需轉譯
  - 配色：預設主色 `#2f6bd8`。每個顏色先算淺色與深色兩個版本，再用 `light-dark()` 組合；`light-dark()` 只放在最外層。強調色淺色模式限制亮度 ≤ 0.48、深色模式 ≥ 0.74，強調色上的文字固定白字（淺色模式）或深色字（深色模式）
  - 對比驗證：用 headless Chrome 測 17 個主色（含純白、純黑、螢光綠、青、黃等極端值）× 深淺兩種模式 × 11 組前景與背景，全部 ≥ 4.5:1（最低 4.85）
  - 深淺色模式：`<html data-color-mode="auto|light|dark">` 控制 `color-scheme`；鎖定時輸出 `data-color-mode-locked`，不輸出切換按鈕。訪客選擇存在 `localStorage` 的 `lattice-color-mode`；按鈕依序循環「自動 → 淺色 → 深色」
  - 模板讀取的設定鍵（`theme.config.style.*`，表單在階段 4 加入）：`primaryColor`、`colorMode`、`lockColorMode`、`bodyFont`（`sans`／`serif`）、`customFontUrl`、`customFontFamily`。沒有設定或值不合法時都退回預設值；主色只接受 `#` 開頭的 3–8 位十六進位
  - 共用片段：`partials/style-head.html`（防閃爍腳本、自訂字型）、`partials/color-mode-toggle.html`；片段中的註解使用 Thymeleaf 註解 `<!--/* */-->`，不會輸出給訪客
  - 已在 Halo 2.26.0 驗證：預設值渲染、各項設定生效、鎖定模式、切換與重新載入後保留、`<body>` 出現前就已套用訪客選擇（不閃爍）
- [x] **階段 4：版面骨架**：`layout` partial、導覽列（含語系切換、搜尋入口）、頁尾、二欄或三欄佈局與響應式、`settings.yaml` 的 `layout` 和 `style` group（2026-10-21）
  - 頁面用法：`<include src="layout.html" page="post">`，具名 slot `head` 放 `<title>` 等；`page="post"` 時套用「文章頁佈局」覆寫。腳本與樣式入口用絕對路徑 `/js/main.ts`、`/css/main.css`，讓 `src/error/` 底下的頁面也能共用
  - `settings.yaml`：`layout`（`siteLayout` 預設 `two-column-right`、`postLayout` 預設 `follow`、`postListStyle` 預設 `text`）、`style`（`primaryColor` 預設 `#2f6bd8` 等，鍵名同階段 3）
  - 側邊欄位置由伺服器端決定，輸出 `.site-body[data-sidebar=none|left|right|both]`：
    - 二欄時，左右兩個元件清單依序合併到同一個側邊欄（使用者同意，2026-10-21；整站佈局預設值與自動減少欄數的規則也一併同意）
    - 三欄但只有一邊的清單有元件時，退成二欄；兩邊都沒有元件時為單欄（主內容寬度限制在 `--content-width`）
    - 768–1279px 的三欄縮成二欄，右側邊欄接在左側邊欄下方；< 768px 單欄，側邊欄在主內容下方
  - 導覽列：Logo 用系統設定的 `site.logo`（Halo 文件建議不要在主題設定重複提供）；主選單用 `menuFinder.getPrimary()`，最多兩層（桌面為下拉選單，手機在漢堡選單中縮排顯示）；漢堡選單的斷點為 768px；捲動偵測用 `IntersectionObserver`
  - 搜尋：`pluginFinder.available('PluginSearchWidget')` 才輸出按鈕；插件腳本以 `defer` 載入、晚於主題腳本執行，所以在 `load` 事件後才檢查 `window.SearchWidget`。`tokens.css` 把配色傳給 `--halo-search-widget-*` 變數
  - 語系切換：查證 Halo 2.26.0 的 `ThemeLocaleContextResolver`，語系依序取自 `?language=` 參數、`language` cookie、登入者語系、`Accept-Language`。切換時寫入 `language` 與 `lattice_lang_chosen` cookie 後重新載入。`lattice_lang_chosen` 目前沒有程式讀取（Ethereal 用它搭配「站長預設語系」功能，本主題規格沒有這個功能）
  - 頁尾：版權年份、站名、Powered by Halo、主題名稱；版面最後輸出 `<halo:footer />`（Halo 規定，用於系統的頁尾程式碼注入）。主題名稱的連結等 GitHub remote 設定後再補
  - 已在 Halo 2.26.0 驗證：各種佈局設定組合與退回規則、二層選單、手機漢堡選單、捲動後導覽列縮小、三種語系切換、搜尋彈窗配色；390px 寬度沒有橫向捲動
- [x] **階段 5：側邊欄**：8 個元件、左右側邊欄的 array 設定、吸頂、手機版目錄浮動按鈕（2026-10-21）
  - 設定：`sidebar` group（`leftWidgets`、`rightWidgets`、`announcement`、`recentPostsCount`）、`profile` group（`avatar`、`nickname`、`bio`、`socials`）。清單項目欄位為 `type`、`sticky`，自訂 HTML 另有 `html`（用 `if: "$value.type === 'customHtml'"` 只在該類型顯示）
  - 元件類型值：`profile`、`announcement`、`categories`、`tags`、`recentPosts`、`siteStats`、`toc`、`customHtml`；預設左側為個人資料、文章目錄（吸頂），右側為最新文章、分類、標籤
  - 查證：Halo 會在重載主題時，把 `settings.yaml` 頂層欄位的預設值寫入 ConfigMap
  - 渲染：`layout.html` 依側邊欄逐一處理清單，先輸出不吸頂的元件（`.sidebar-static`），再把吸頂的元件集中到 `.sidebar-sticky`，避免多個吸頂元件互相重疊。元件片段只在模板中出現一次（`partials/sidebar-widget.html` 依 `type` 切換）
  - 三欄縮成二欄（768–1279px）時，`src/js/sidebar.ts` 把左側邊欄的吸頂元件移到右側邊欄吸頂區塊的最前面，因為上方的左側邊欄只佔一列，無法停靠
  - 個人資料：頭像、暱稱、簡介未設定時，分別退回 `site.logo`、`site.title`、`site.subtitle`；社群連結只顯示文字
  - 分類顯示兩層；最新文章依發布時間排序（不讓置頂文章排在前面），數量限 1–20，不合法時用 5
  - 文章目錄：`src/js/toc.ts` 讀取 `[data-toc-source]` 中的 h2–h4，產生巢狀清單並補上缺少的 id；標題進入導覽列下方 80px 內即視為目前段落。< 768px 時隱藏側邊欄中的目錄，改用右下角浮動按鈕開啟 `<dialog>`
  - Thymeleaf 注意事項：同一元素上 `th:if` 先於 `th:with` 執行，所以條件依賴區域變數時，`th:with` 要放在外層 `th:block`；`<include>` 會被整個替換，所以 `th:if`、`th:case` 也要放在外層 `th:block`
  - 已在 Halo 2.26.0 驗證：8 個元件、深淺色、各佈局下的吸頂（含三欄縮成二欄）、目錄高亮與點擊跳轉、手機浮動按鈕與對話框
- [x] **階段 6：內容頁面**：`index`（含簡介區塊、兩種列表樣式）、`post`（目錄、highlight.js、複製按鈕、留言）、`page`、`archives`、`categories`、`category`、`tags`、`tag`、`author`、分頁（2026-10-21）
  - 設定：`home` group（`heroEnabled`、`heroTitle`、`heroSubtitle`、`heroImage`）、`post` group（`highlightEnabled`）。關於頁與友鏈頁的留言開關留到階段 7
  - 共用片段：`post-list.html`（兩種樣式共用）、`post-meta.html`、`pagination.html`、`article-content.html`（文章與獨立頁面的正文）
  - 文章列表：卡片樣式在列表寬度 ≥ 36rem 時改為封面在左、文字在右（container query），較窄時封面在上；封面用 `thumbnail.gen` 產生 `srcset`
  - 程式碼高亮：highlight.js 只註冊 26 種常用語言，打包成獨立 chunk（gzip 約 42KB），頁面有 `pre > code` 時才動態載入；沒有標示或不認得的語言當作純文字，不自動偵測
  - 偵測到 `plugin-shiki` 啟用時，自動停用內建高亮（使用者同意，2026-10-21）；後台開關仍可手動關閉
  - 複製按鈕：所有 `pre` 都有。Shiki 渲染的區塊由插件自帶的複製按鈕負責（主題若包住它的 `pre` 會讓 Shiki 無法渲染）。Clipboard API 只在 HTTPS 或 localhost 可用，以 HTTP 架設的站點改用 `execCommand("copy")`
  - 留言：依 Halo 文件以 `haloCommentEnabled` 判斷是否輸出 `<halo:comment>`（文章與獨立頁面）
  - 插件配色：`<html>` 加上 Halo 官方組件讀取的 `data-color-scheme`，與 `data-color-mode` 同步。搜尋與評論組件的 CSS 變數放在不分層的 `src/css/plugins.css`，因為評論組件的未分層樣式會在 `[data-color-scheme=dark]` 上設定自己的預設色，會蓋過分層的 tokens
  - 查證：Halo 2.26.0 起，主題可以提供 `templates/layout.html` 的 `html(head, content)` 片段，讓插件前台頁面共用主題外框（評估結果見階段 7）
  - 測試資料：新增 14 篇文章（含置頂、長標題、封面、程式碼）、3 個分類（含子分類）、15 個標籤，以及 4 張 SVG 封面。標籤在文章之後才建立，Halo 的標籤文章數統計因此停在 0，這是測試資料建立順序造成的，不影響主題
  - 已在 Halo 2.26.0 驗證：所有頁面路由、兩種列表樣式、分頁、簡介區塊（含背景圖）、highlight.js（停用 Shiki 時）、Shiki 共存、複製按鈕（真實點擊並讀回剪貼簿）、留言組件配色（深淺色）、390px 下所有頁面沒有橫向捲動
- [x] **階段 7：額外頁面與錯誤頁**：`page_about`、`links`、`error/404`、`error/error`（2026-10-21）
  - `theme.yaml` 宣告自訂頁面模板「關於頁」（`page_about.html`）。個人資料內容抽成 `partials/profile-body.html`，側邊欄元件與關於頁共用同一份資料與退回規則
  - `post` group 新增 `aboutComments`、`linksComments`（預設開啟）與 `linksIntro`
  - **友鏈頁說明的來源**：規格要求友鏈頁底部有正文區塊，但 plugin-links 只提供標題。使用者選擇在主題設定新增「友鏈頁說明」欄位（`linksIntro`，可寫 HTML，留空不顯示）（2026-10-21）
  - 友鏈頁使用 plugin-links 的 `groups` 變數依分組顯示，未分組的連結由插件放在 `ungrouped` 虛擬分組，顯示為「其他連結」；沒有 logo 時顯示名稱首字。留言使用 `group="plugin.halo.run" kind="Plugin"`，`name` 為 `pluginName`
  - 查證：plugin-links 2.5.0 要求 Halo ≥ 2.26.0。模板只使用舊版也有的 `groups`、`linksTitle`、`pluginName`；Halo 2.25.0 的相容測試（階段 10）需要搭配舊版插件確認。頁面標題來自插件設定（預設「链接」），站長可在插件設定修改
  - 查證：以 API 建立連結時若 `groupName` 為空字串，該連結不會出現在 `groups`（插件只把未設定 `groupName` 的連結歸入 `ungrouped`）；從後台建立的連結不受影響
  - 錯誤頁：`error/404.html` 與通用的 `error/error.html`，顯示狀態碼、說明與「回到首頁」按鈕；`page="error"` 時不顯示側邊欄。Halo 只在請求接受 HTML 時才渲染錯誤模板（API 請求回傳 JSON）；安全過濾器（403）與 URL 解析錯誤（400）不經過主題模板
  - 頁面布局契約（`templates/layout.html`）：plugin-links 直接渲染主題的 `links.html`，不需要這個契約；需要它的是瞬間、相簿等自帶頁面的插件，屬於第二版範圍，因此暫不實作，Halo 會使用內建的 fallback 布局
  - 已在 Halo 2.26.0 驗證：關於頁、友鏈頁（三個分組、無 logo 的首字、說明區塊、深淺色）、兩個留言開關、404 與通用錯誤頁、390px 無橫向捲動
- [x] **階段 8：SEO 與轉場**：`seo-head` partial、JSON-LD、View Transitions、`advanced` group（2026-10-21）
  - `advanced` group：`viewTransitions`、`seoMetadata`、`seoStructuredData`（皆預設開啟）、`defaultShareImage`
  - `partials/seo-head.html` 依 `pageType` 整理出 `seo` map（title、description、type、path、image、page）後統一輸出；各頁面不再自己寫 `<title>`。`pageType` 移到 `<html>` 的 `th:with`，讓 `<head>` 也能使用
  - 標題格式：`頁面標題 - 第 N 頁 - 站名`（首頁為站名，第 2 頁以後加頁碼）
  - canonical：首頁、文章、頁面、分類、標籤、作者（皆只在第 1 頁）、分類總覽、標籤總覽、友鏈頁。分頁的第 2 頁以後與歸檔（含年月歸檔，無法從模板得知目前路徑）不輸出，依 Halo 文件「分頁不能沿用第一頁的 canonical」
  - 分享圖：頁面封面 → 預設分享圖 → 站點 Logo；相對路徑會加上 `site.url` 轉成絕對網址。分享描述截斷在 200 字
  - JSON-LD 以 SpEL 建立 map，再用 Thymeleaf JavaScript 內嵌序列化，確保是合法 JSON；`.?[value != null]` 去掉沒有值的欄位。首頁 `WebSite`、文章 `BlogPosting`（含作者、發布與修改時間、標籤為 keywords）、首頁與錯誤頁以外的頁面 `BreadcrumbList`（文章的麵包屑經過第一個分類）
  - 轉場：`<head>` 內 `@media (prefers-reduced-motion: no-preference) { @view-transition { navigation: auto } }`；導覽列設定 `view-transition-name: site-header`，換頁時不跟內容一起淡入淡出
  - 已在 Halo 2.26.0 驗證：15 種頁面各只有一個 `<title>` 與最多一個（Halo 注入的）description，JSON-LD 全部能解析；三個開關分別生效；沒有封面的文章使用預設分享圖；Chrome 中真實點擊站內連結會觸發跨頁轉場，減少動態效果或關閉設定時不觸發
- [x] **追加：訪客自訂主色（#29）**（2026-10-21）
  - `partials/color-picker.html` 放在導覽列語系切換與深淺色切換之間；`src/js/color-picker.ts` 處理選擇、即時預覽（拖曳自由選色器時）、儲存（`localStorage` 的 `lattice-primary`）與跨分頁同步
  - 8 個預設色票：藍 `#2f6bd8`、靛 `#4f46e5`、紫 `#7c3aed`、粉紅 `#db2777`、紅 `#dc2626`、橘 `#ea580c`、綠 `#16a34a`、青綠 `#0d9488`
  - `style` group 新增 `allowVisitorColor`（預設開啟）；開啟時 `<html>` 輸出 `data-primary-customizable`，防閃爍腳本只在有這個屬性時套用訪客的主色
  - 語系切換與主色面板的開關行為抽成 `src/js/disclosure.ts` 共用
  - 已在 Halo 2.26.0 驗證：選色票、自由選色、恢復站點預設、重新載入後保留且在 `<body>` 出現前就已套用、關閉設定時隱藏按鈕並忽略訪客的選擇、390px 下面板不超出畫面
- [x] **階段 9：i18n 補齊與驗證**：三個語系翻譯完整、主題結構驗證腳本、效能預算腳本（2026-10-22）
  - 指令：`pnpm check`（格式、型別、建置、驗證、預算）、`pnpm validate`、`pnpm budget`；`pnpm package` 也會先跑驗證與預算
  - `src/scripts/validate-theme.mjs`：檢查建置後的 `templates/`（片段已展開，key 才是完整的）。`#messages.msg('prefix.' + 變數)` 這類動態 key 以前綴視為已使用；定義了但沒用到的 key 只列為警告。已用故意寫錯的語系檔與模板確認會報錯
  - `src/scripts/check-budget.mjs`：以模板中 `<script src>`、`<link>` 實際引用的檔案判斷「主要 JS」，按需載入的 chunk 不計入。目前 CSS 6.4KB、主要 JS 3.8KB（highlight.js chunk 40.6KB 不計入）
  - 翻譯：66 個 key × 3 個語系全部到位；以英文渲染全站檢查，主題介面文字沒有殘留中文（出現的中文都是選單、分類等站點資料，或刻意以原文顯示的語言名稱）
  - 英文單複數：`archives.count` 改用 Java MessageFormat 的 `choice`（`1 post`／`12 posts`）；驗證腳本只比對各語系用到的參數索引，允許格式不同
- [x] **追加：標籤元件限制數量**（2026-10-22，正式站試用回饋）
  - `sidebar` group 新增 `tagsCount`（1–100，預設 30）；`widgets/tags.html` 依文章數由多到少顯示前 N 個，文章數相同時沿用 `tagFinder.listAll()` 的順序（新建的在前），超過時顯示 `widget.tagsMore` 連結到 `/tags`
  - `tagFinder` 沒有排序參數（已查 2.26.0 的 `TagFinder` 介面），所以在模板中排序：取第 N 名的文章數為門檻，依文章數由高到低輸出高於門檻的標籤，再用等於門檻的標籤補滿 N 個
  - 已在 Halo 2.26.0 驗證：1、2、5、100 與未設定（預設 30）各自正確，未超過時不顯示連結
- [x] **追加：標題換行與標題字型**（2026-10-22，正式站試用回饋）
  - 標題的 `text-wrap` 由 `balance` 改為 `pretty`：`balance` 讓各行等長，長標題第一行明明還有空間就提早換行；`pretty` 先填滿每一行，只避免最後一行只剩一兩個字。Firefox 不支援時退回一般換行
  - `style` group 新增 `headingFont`（`body`／`serif`），`<html>` 輸出 `data-heading-font="serif"`；`--font-heading` 與新的 `--heading-weight` 由 tokens 控制
  - 參考：Rackora 的標題使用 Source Serif 4 + 簡中宋體（Noto Serif SC、Songti SC、SimSun）；本主題沿用既有的繁中優先襯線堆疊，沒有複製 Rackora 的程式碼
  - 已在 Halo 2.26.0 驗證：文章頁大標題、正文小標、文章列表標題都改用明體、字重 500；側邊欄元件標題維持黑體
- [x] **階段 10：CI 與發布**：GitHub Actions、自動發布流程、`README.md`、Halo 2.25.0 相容測試、無障礙檢查（2026-10-22）
  - `.github/workflows/ci.yml`：push 到 main 與 PR 時執行 `pnpm install --frozen-lockfile` 與 `pnpm check`。`package.json` 加上 `packageManager: pnpm@12.4.2`（pnpm 12 會把它寫進 lockfile）與 `engines.node >=22.12`；CI 使用 Node 24
  - `.github/workflows/release.yml`：推送 `v*` tag 時，確認 tag 與 `theme.yaml` 版本一致，執行 `pnpm format:check` 與 `pnpm package`，再用 `gh release create` 上傳 zip 並自動產生 release notes
  - `README.md`：特色、需求、安裝與升級、設定總覽、開發指令、發布步驟、授權與 Ethereal 出處
  - 公開前準備：頁尾的主題名稱連到 repo；`theme.yaml` 補上 `author.website`、`homepage`、`repo`、`issues`；第 1 節移除本機測試帳號密碼（git 歷史中仍可看到，只用於本機 Docker，沒有風險）
  - 無障礙（axe-core 4.10.2，WCAG 2.1 A/AA + best-practice）：14 種頁面 × 深淺色 × 桌面與 390px 寬度。修正兩項：水平捲動的程式碼區塊加上 `tabindex="0"`，讓鍵盤可以捲動；三欄時兩個 `<aside>` 加上不同的 `aria-label`（`sidebar.primary`、`sidebar.secondary`）。鍵盤 Tab 順序、跳至主要內容、焦點框皆正常
  - 無障礙的剩餘問題都來自插件、主題無法修正：plugin-shiki 的複製按鈕沒有文字標籤、預設配色（github-light／dark）部分顏色對比不足（可在插件設定換配色）；留言插件的編輯區沒有標籤
  - Halo 2.25.0 相容測試（獨立 volume，plugin-links 2.3.0；2.4.0 起要求 Halo 2.26）：全新安裝並啟用、三欄 + 8 個元件 + 首頁簡介、16 種頁面（含英文與簡中）皆正常，日誌沒有模板錯誤，主題狀態 READY
  - CI 與 release workflow 已在 GitHub 上實際通過（`pnpm/action-setup` 升到 v6，改用 Node 24 執行環境）；repo 轉為 public 並發布 v0.1.0（2026-10-22）

---

## 10. 範圍外（第二版以後）

- 瞬間（moments）、相簿（photos）、作品集、時間軸等特色頁面
- 一言、音樂播放器、天氣、日程等側邊欄元件；熱門文章（依賴瀏覽數）
- 站長端的預設配色組合（訪客端的 8 個預設色票已在 #29 納入第一版）
- Hero 輪播、打字機效果等首頁特效
- 後台文字欄位的多語系、文章內容的多語系
- 友鏈頁的隨機訪問、複製本站資訊
