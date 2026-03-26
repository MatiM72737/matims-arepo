import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  // 'base' musi pasować do nazwy Twojego repozytorium na GitHubie
  base: "/matims-arepo/",
});
