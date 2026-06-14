#!/usr/bin/env node
// Copies resource files (png/ttf/otf) into dist/.
// Run AFTER `vite build` — Vite emits dist/index.html and dist/assets/, this
// script only adds the static resource directories that the runtime loads
// via relative paths like `./res/image/close.png`.
import { cpSync, existsSync, mkdirSync, rmSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const dist = join(root, 'dist');

// Clear only the resource dirs we own. NEVER touch `assets/` (Vite output)
// or `index.html` (Vite-generated).
for (const sub of ['res', 'intro']) {
  rmSync(join(dist, sub), { recursive: true, force: true });
}

// Helper: recursively copy a directory if it exists.
function copyDirIfExists(src, dest) {
  if (existsSync(src) && statSync(src).isDirectory()) {
    mkdirSync(dest, { recursive: true });
    cpSync(src, dest, { recursive: true });
    return true;
  }
  return false;
}

// Primary resources live in src-ts/src/res/.
const primaryRes = join(root, 'src-ts', 'src', 'res');
copyDirIfExists(primaryRes, join(dist, 'res'));

// Intro-specific resources.
const introRes = join(root, 'src-ts', 'src', 'intro', 'res');
copyDirIfExists(introRes, join(dist, 'intro', 'res'));

// Report.
function countFiles(dir) {
  let n = 0;
  if (!existsSync(dir)) return 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) n += countFiles(join(dir, entry.name));
    else n += 1;
  }
  return n;
}
console.log(`[copy-resources] dist/res/: ${countFiles(join(dist, 'res'))} files`);
console.log(`[copy-resources] dist/intro/res/: ${countFiles(join(dist, 'intro', 'res'))} files`);
