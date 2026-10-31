import * as esbuild from "esbuild";
import { existsSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, "dist");

if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

const entries = [
  { in: resolve(__dirname, "src/injected.ts"), out: resolve(distDir, "injected.js"), format: "iife" },
  { in: resolve(__dirname, "src/content.ts"), out: resolve(distDir, "content.js"), format: "iife" },
  { in: resolve(__dirname, "src/background.ts"), out: resolve(distDir, "background.js"), format: "iife" },
  { in: resolve(__dirname, "src/popup.ts"), out: resolve(distDir, "popup.js"), format: "iife" },
];

for (const entry of entries) {
  await esbuild.build({
    entryPoints: [entry.in],
    outfile: entry.out,
    bundle: true,
    format: entry.format,
    target: "es2022",
    platform: "browser",
    minify: false,
    sourcemap: false,
  });
  console.log(`Bundled ${entry.out} (${entry.format})`);
}

