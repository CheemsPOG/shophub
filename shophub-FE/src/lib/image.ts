const STOCK_IMAGE_HOSTS = /picsum\.photos|pravatar\.cc/i;

/** True when `src` is a real, usable image URL — not empty and not one of the
 * placeholder stock-photo services (Picsum, Pravatar) used by the original mock data. */
export function isRealImageUrl(src?: string | null): src is string {
  if (!src?.trim()) return false;
  return !STOCK_IMAGE_HOSTS.test(src);
}
