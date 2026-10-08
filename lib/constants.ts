import type { PropertySort } from "@/types/property";

export const PRICE_OPTIONS = [
  1_000_000, 2_500_000, 5_000_000, 10_000_000, 15_000_000, 20_000_000, 30_000_000,
] as const;

export const BEDROOM_OPTIONS = [1, 2, 3, 4, 5, 6] as const;

export const SORT_OPTIONS: { value: PropertySort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "size-desc", label: "Largest Interior" },
];

/** Hosts allowed for listing imagery (must match next.config.ts remotePatterns). */
export const ALLOWED_IMAGE_HOSTS = ["utfs.io"] as const;
export const ALLOWED_IMAGE_HOST_SUFFIXES = [".ufs.sh"] as const;

export function isAllowedImageUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    return (
      (ALLOWED_IMAGE_HOSTS as readonly string[]).includes(url.hostname) ||
      ALLOWED_IMAGE_HOST_SUFFIXES.some((suffix) => url.hostname.endsWith(suffix))
    );
  } catch {
    return false;
  }
}

export const PLACEHOLDER_IMAGE = "https://gbxt70nat9.ufs.sh/f/q3qRD927C251j6iYNSXDopEICx8TejBlrUFS4QMZzGhugOKX";
