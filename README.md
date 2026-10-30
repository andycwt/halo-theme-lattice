# Lattice

簡潔、內容優先的 [Halo](https://www.halo.run) 2.x 佈景主題，佈局與配色都可以自由設定。

A clean, content-first theme for Halo 2.x with configurable layout and colors. The interface is available in English, Traditional Chinese and Simplified Chinese.

## 特色

- **佈局**：二欄（側邊欄在左或右）或三欄，文章頁可以另外指定；在平板、手機上自動縮減欄數
- **側邊欄元件**：個人資料、公告、分類、標籤、最新文章、站點統計、文章目錄、自訂 HTML，左右兩側各自拖曳排序，可設定吸頂
- **配色**：選一個主色，自動推算深淺兩種模式的配色並維持 WCAG AA 對比；訪客也可以自訂主色（可關閉）
- **深淺色模式**：自動、淺色、深色，可鎖定；渲染前套用，不會閃爍
- **字型**：無襯線或襯線，也可以引入自訂字型
- **介面語系**：英文、繁體中文、簡體中文，導覽列可切換
- **SEO**：Open Graph、Twitter Card、canonical、JSON-LD，分成兩個開關，可以和 SEO 插件搭配
- **每日一句**：搭配瞬間插件，在首頁顯示一則帶有指定標籤的瞬間，每天輪換；帶有該標籤的瞬間以「原文、翻譯、出處」的引言樣式呈現
- **其他**：關於頁模板、友情連結頁、瞬間頁面、程式碼高亮與複製按鈕、換頁轉場（View Transitions）、手機上的浮動目錄
- **輕量**：CSS 約 7KB、JS 約 4KB（gzip）

## 需求

- Halo **2.25.0** 以上
- 選用插件：
  - [友情連結](https://github.com/halo-dev/plugin-links)：提供 `/links` 頁面
  - [瞬間](https://github.com/halo-sigs/plugin-moments)：提供 `/moments` 頁面與首頁每日一句的資料（需要 Halo 2.26.0 以上）
  - 搜尋、留言：導覽列的搜尋按鈕與文章留言區，安裝了才會顯示
  - Shiki：啟用時主題會自動停用內建的程式碼高亮

## 安裝

1. 到 [Releases](https://github.com/andycwt/halo-theme-lattice/releases) 下載最新的 `theme-lattice-<版本>.zip`
2. Halo 後台 →「外觀」→「主題」→「安裝」，上傳 zip
3. 啟用主題，再到「主題設定」調整

升級時在主題清單選擇 Lattice →「升級」，上傳新版 zip，原本的設定會保留。

## 設定

| 分組 | 內容 |
|---|---|
| 佈局 | 整站佈局、文章頁佈局、文章列表樣式（文字或卡片） |
| 外觀 | 主色、允許訪客自訂主色、深淺色模式與鎖定、正文字型、自訂字型 |
| 側邊欄 | 左右側邊欄的元件與順序、公告內容、最新文章數量、標籤顯示數量 |
| 個人資料 | 頭像、暱稱、簡介、社群連結（側邊欄與關於頁共用） |
| 首頁 | 簡介區塊的開關、標題、副標題、背景圖；每日一句的開關與標籤 |
| 文章 | 程式碼高亮、關於頁與友鏈頁的留言、友鏈頁說明 |
| 進階 | 換頁轉場、頁面元資料、結構化資料、預設分享圖 |

**關於頁**：新增一個獨立頁面，在頁面設定的「模板」選擇「關於頁」。頂部會顯示「個人資料」的內容，下方是頁面正文。

**每日一句**：在瞬間插件新增瞬間，加上標籤「佳句」（可在設定修改），內容分成三段：原文、翻譯、`— 出處`。到「首頁」設定開啟「每日一句」後，首頁會依發布時間由舊到新，每天顯示一則。注意：瞬間插件 1.19.0 在「標籤 × 瞬間」超過約 256 筆、且有多種標籤時，`/moments` 頁面會停止回應，建議其他瞬間不要加標籤。

## 開發

需要 Node 22.12 以上、pnpm 與 Docker。

```sh
pnpm install
pnpm build          # 產生 templates/
pnpm halo:up        # 啟動本機 Halo（http://localhost:8090）
pnpm dev            # 監看變更並重新建置
pnpm check          # 格式、型別、建置、主題結構驗證、效能預算
pnpm package        # 打包成 dist/theme-lattice-<版本>.zip
```

詳細說明見 [`docs/development.md`](docs/development.md)，設計決策見 [`docs/spec.md`](docs/spec.md)。

### 發布

1. 修改 `theme.yaml` 與 `package.json` 的 `version`
2. commit 後建立並推送 tag：`git tag v0.2.0 && git push origin v0.2.0`
3. GitHub Actions 會檢查 tag 與版本號一致、打包，並建立 Release

## 授權

[MIT](LICENSE) © WeiTsung Chu

語系切換的實作改寫自 [Ethereal](https://github.com/AloneNanNan/halo-theme-ethereal)（MIT），版權聲明見 [NOTICE](NOTICE)。
