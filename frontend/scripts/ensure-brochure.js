import { copyFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const publicDir = join(rootDir, 'public');

const brochureSources = [
  join(rootDir, 'src', 'assets', 'Scanbit_broucher.pdf'),
  join(rootDir, 'src', 'assets', 'ScanBit_broucher.pdf'),
  join(rootDir, 'src', 'assets', 'ScanBit_Brochure.pdf'),
  join(rootDir, 'Scanbit_broucher.pdf'),
  join(rootDir, 'ScanBit_Brochure.pdf'),
];
const brochureDest = join(publicDir, 'brochure.pdf');

for (const src of brochureSources) {
  if (existsSync(src)) {
    try {
      copyFileSync(src, brochureDest);
      process.exit(0);
    } catch (_e) {}
  }
}
process.exit(0);
