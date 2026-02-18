/**
 * MIME type mapping for static assets
 * Ensures correct Content-Type to avoid "Wrong MIME type" errors in browsers
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types
 */

const MIME_TYPES = {
  // JavaScript (critical - wrong type causes "Expected JavaScript" errors)
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.cjs': 'application/javascript; charset=utf-8',

  // WebAssembly
  '.wasm': 'application/wasm',

  // Stylesheets
  '.css': 'text/css; charset=utf-8',

  // HTML
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',

  // Data
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',

  // Images
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',

  // Fonts
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.eot': 'application/vnd.ms-fontobject',

  // Manifest & config
  '.webmanifest': 'application/manifest+json',

  // Text
  '.txt': 'text/plain; charset=utf-8',

  // Source maps (served for debugging)
  '.map': 'application/json; charset=utf-8',
};

// Fallback for unknown extensions - avoid defaulting to application/octet-stream for text-like files
const TEXT_EXTENSIONS = ['.md', '.log', '.env'];

/**
 * Get MIME type for a file path
 * @param {string} filePath - File path or URL path
 * @returns {string|null} MIME type or null if unknown
 */
export function getMimeType(filePath) {
  if (!filePath || typeof filePath !== 'string') return null;
  const path = filePath.replace(/[?#].*$/, '').toLowerCase();
  // Web app manifest - W3C recommends application/manifest+json
  if (path.endsWith('manifest.json') || path.endsWith('.webmanifest')) {
    return 'application/manifest+json; charset=utf-8';
  }
  const ext = path.match(/\.[a-z0-9]+$/)?.[0];
  if (ext && MIME_TYPES[ext]) return MIME_TYPES[ext];
  if (ext && TEXT_EXTENSIONS.includes(ext)) return 'text/plain; charset=utf-8';
  return null;
}

/**
 * Set Content-Type header for a response based on file path
 * @param {object} res - Express response
 * @param {string} filePath - File path
 * @returns {boolean} true if header was set
 */
export function setContentType(res, filePath) {
  const mime = getMimeType(filePath);
  if (mime) {
    res.setHeader('Content-Type', mime);
    return true;
  }
  return false;
}

export default MIME_TYPES;
