// Vite config for the vfx Tauri frontend.
//
// `pnpm build` runs `vite build` which bundles src-ts/src/index.ts and
// resolves bare imports (e.g. `@tauri-apps/api/core`) into the output.
// `scripts/copy-resources.mjs` then copies static assets (res/, intro/res/)
// next to the emitted bundle.

import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: __dirname,
  // Output next to where tauri.conf.json expects frontendDist.
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    // Keep stack traces readable.
    sourcemap: true,
    // Skip TypeScript checking during bundling — `pnpm typecheck` handles that
    // separately, and Vite uses esbuild which strips types without type-checking.
    target: 'es2022',
    // Rolldown (Oxc) minify with mangle disabled for class/function names so
    // `constructor.name` survives at runtime (needed by Node's
    // `vfx-{ClassName}` tagging). The top-level `esbuild: { keepNames: true }`
    // does NOT work — Vite 8's minify goes through Oxc, not esbuild.
    minify: {
      mangle: {
        keep_class_names: true,
        keep_fnames: true,
      },
    },
    rollupOptions: {
      // Single entry: the Tauri frontend bootstrap.
      input: resolve(__dirname, 'index.html'),
      output: {
        // Stable filenames so HTML can reference them statically if needed.
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  // Tauri runs the bundle through a custom protocol; clear the base so all
  // asset URLs become relative.
  base: './',
  server: {
    // If someone wires up `tauri dev` with a devUrl, they'd point here.
    port: 1420,
    strictPort: true,
  },
  // Vite only needs to crawl the TS source tree.
  publicDir: false,
});
