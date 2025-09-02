// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: "./index.html",
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
    host: true,
    port: 4173,
  },
  server: {
    host: true,
    port: 5173,
  },
});
