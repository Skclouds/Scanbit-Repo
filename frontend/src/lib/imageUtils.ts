/**
 * Safe image URL for API-sourced images (menu items, categories, logos, etc.).
 * Relative or invalid paths (e.g. /2823418.png) cause requests to app origin and
 * ERR_CONNECTION_REFUSED. Use this so we only use full URLs or a placeholder.
 */

export const IMAGE_PLACEHOLDER = "/placeholder.svg";

export function safeImageSrc(url: string | null | undefined): string {
  if (!url || typeof url !== "string") return IMAGE_PLACEHOLDER;
  const t = url.trim();
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  return IMAGE_PLACEHOLDER;
}

export function isAbsoluteImageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  const t = url.trim();
  return t.startsWith("http://") || t.startsWith("https://");
}
