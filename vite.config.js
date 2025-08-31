// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: "./index.html",
        about: "./about/index.html",
      },
      output: {
        manualChunks: {
          three: ["three"],
          postprocessing: ["postprocessing"],
        },
      },
    },
  },
  preview: {
    host: true, // 🎯 모든 네트워크 인터페이스에서 접근 허용
    port: 4173, // 기본 preview 포트
  },
  server: {
    host: true, // 🎯 모든 네트워크 인터페이스에서 접근 허용
    port: 5173, // 기본 preview 포트
  },
});
