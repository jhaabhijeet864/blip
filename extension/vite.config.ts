/// <reference types="vitest" />
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: false,
    target: "es2022",
    rollupOptions: {
      input: {
        background: resolve(__dirname, "src/background.ts"),
        content: resolve(__dirname, "src/content.ts"),
        injected: resolve(__dirname, "src/injected.ts"),
        popup: resolve(__dirname, "src/popup.ts"),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        format: "es",
      },
    },
  },
  test: {
    environment: "node",
  },
});

