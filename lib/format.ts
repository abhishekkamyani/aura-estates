const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const number = new Intl.NumberFormat("en-US");

export function formatPrice(value: number) {
  return usd.format(value);
}

/**
 * Compact USD (e.g. $18.8M). Implemented by hand rather than with Intl's
 * compact notation because Node and browser ICU builds disagree on edge cases
 * (such as "$0" vs "$0.0"), which would cause hydration mismatches.
 */
export function formatPriceCompact(value: number) {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  const scaled = (n: number, suffix: string) => {
    const rounded = Math.round(n * 10) / 10;
    return `${sign}$${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}${suffix}`;
  };
  if (abs >= 1e9) return scaled(abs / 1e9, "B");
  if (abs >= 1e6) return scaled(abs / 1e6, "M");
  if (abs >= 1e3) return scaled(abs / 1e3, "K");
  return `${sign}$${Math.round(abs)}`;
}

export function formatNumber(value: number) {
  return number.format(value);
}

export function formatDate(value: string | Date, opts?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...opts,
  }).format(new Date(value));
}

export function formatDateTime(value: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

/** Resize an Unsplash URL; other hosts are returned untouched. */
export function sizedImage(url: string, width: number) {
  if (!url.includes("images.unsplash.com")) return url;
  try {
    const u = new URL(url);
    u.searchParams.set("w", String(width));
    u.searchParams.set("auto", "format");
    u.searchParams.set("fit", "crop");
    u.searchParams.set("q", "80");
    return u.toString();
  } catch {
    return url;
  }
}
