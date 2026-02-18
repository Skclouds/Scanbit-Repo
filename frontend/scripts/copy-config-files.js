import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'dist');
const publicDir = join(rootDir, 'public');

// Copy critical files from public to dist (Vite also copies public/)
const filesToCopy = [
  { from: 'manifest.json', to: 'manifest.json' },
  { from: 'brochure.pdf', to: 'brochure.pdf' },
];

filesToCopy.forEach(({ from, to }) => {
  const sourcePath = join(publicDir, from);
  const destPath = join(distDir, to);
  if (existsSync(sourcePath)) {
    try {
      copyFileSync(sourcePath, destPath);
    } catch (_error) {}
  }
});

// Add data-cfasync="false" to script tags so deferred loaders don't break the app
const indexPath = join(distDir, 'index.html');
if (existsSync(indexPath)) {
  let html = readFileSync(indexPath, 'utf8');
  if (html.includes('/src/main') || /src=["']\/src\//.test(html)) {
    console.error('[postbuild] dist/index.html still references /src/ — production must serve compiled assets from /assets. Run "npm run build" and deploy the dist/ folder only.');
    process.exit(1);
  }
  if (!/\/assets\/.*\.(js|m?js)/.test(html)) {
    console.error('[postbuild] dist/index.html has no /assets/ JS — build may have failed. Deploy only the dist/ folder.');
    process.exit(1);
  }
  html = html.replace(/<script\s+(?!data-cfasync)/g, '<script data-cfasync="false" ');
  writeFileSync(indexPath, html);
}
