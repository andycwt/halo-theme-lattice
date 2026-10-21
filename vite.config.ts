import { defineConfig } from "vite";
import { haloThemePlugin } from "@halo-dev/vite-plugin-halo-theme";

// 目錄慣例（src → templates、public → templates/assets、base 為 /themes/<metadata.name>）由官方插件決定
export default defineConfig({
  plugins: [haloThemePlugin()],
});
