import { defineConfig } from "vite";
import { haloThemePlugin } from "@halo-dev/vite-plugin-halo-theme";

// 目錄慣例（src → templates、public → templates（public/assets 對應 Halo 的 /themes/<name>/assets）、base 為 /themes/<metadata.name>）由官方插件決定
export default defineConfig({
  plugins: [haloThemePlugin()],
  build: {
    // 支援近兩年的主流瀏覽器（docs/spec.md 第 4 節）；這些版本原生支援 CSS 巢狀、light-dark()、相對色語法，
    // 不需要讓 Vite 轉譯成冗長的 fallback
    target: ["chrome123", "edge123", "firefox128", "safari18"],
  },
});
