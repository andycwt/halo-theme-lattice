# 本機開發

## 需求

- Docker（Docker Desktop 需要先啟動）
- Node 與 pnpm（版本見 `docs/spec.md` 第 8.1 節）

## 第一次啟動

```sh
pnpm install
pnpm build          # 先產生 templates/，Halo 才認得這個主題
pnpm halo:up        # 啟動 Halo 並等到健康檢查通過
```

1. 打開 http://localhost:8090/console ，完成初始化（站點名稱、管理員帳號）。
2. 到「主題」→「切換主題」→「未安裝」，安裝並啟用 **Lattice**。

Halo 的資料存在 Docker volume `lattice-dev-halo-2.26.0`，`pnpm halo:down` 不會刪除它。

## 日常開發

```sh
pnpm halo:up        # Halo 沒在執行時
pnpm dev            # vite build --watch
```

存檔後 Vite 會重新建置到 `templates/`，重新整理瀏覽器就能看到變更，不需要重啟 Halo：

| 變更內容 | 生效方式 |
|---|---|
| `src/` 的模板、CSS、TS | 重新整理（容器已關閉模板快取） |
| `i18n/*.properties` | 重新整理 |
| `theme.yaml`、`settings.yaml` | 在後台主題管理中「重載」主題 |

其他指令：`pnpm halo:logs` 查看 Halo 日誌，`pnpm halo:down` 停止容器。

## 運作方式

`dev/docker-compose.yaml` 把專案根目錄掛載成容器內的 `/root/.halo2/themes/theme-lattice`。資料夾名稱必須和 `theme.yaml` 的 `metadata.name` 一致，否則部分資源會載入失敗。環境變數 `SPRING_THYMELEAF_CACHE=false` 會關閉模板快取。

## 相容性測試（Halo 2.25.0）

```sh
pnpm halo:down
HALO_VERSION=2.25.0 pnpm halo:up
```

每個 Halo 版本都有自己的資料 volume（`lattice-dev-halo-<版本>`），切換版本不會碰到降版造成的資料庫不相容。第一次用新版本啟動時，需要重新初始化並安裝主題。測完後執行 `HALO_VERSION=2.25.0 pnpm halo:down`。

連接埠被占用時，可以用 `HALO_PORT=8091` 改用其他連接埠。

## 打包

```sh
pnpm package        # 輸出 dist/theme-lattice-<版本>.zip
```
