/**
 * Absolute origin used for canonical URLs, the sitemap, OpenGraph and JSON-LD.
 * NEXT_PUBLIC_SITE_URL wins; on Vercel the production domain is used as a
 * fallback so a missing (or left-at-localhost) variable can never publish
 * canonical URLs that point at localhost.
 */
function resolveSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  const vercelHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
  const isLocal = !explicit || /\/\/(localhost|127\.0\.0\.1)(:|$)/.test(explicit);
  if (isLocal && vercelHost) return `https://${vercelHost}`;
  return explicit || "http://localhost:3000";
}

export const siteConfig = {
  name: "Astrelle Estates",
  tagline: "Extraordinary Residences, Discreetly Represented",
  description:
    "Astrelle Estates is a private real estate agency representing the world's most distinguished residences — from Beverly Hills estates to Manhattan penthouses.",
  url: resolveSiteUrl(),
  // Placeholder contact details: the phone number is in the 555-01xx range
  // reserved for fiction and the street does not exist. Replace before launch.
  email: "concierge@astrelleestates.com",
  phone: "+1 (555) 555-0100",
  address: {
    street: "1 Astrelle Plaza, Suite 400",
    city: "Beverly Hills",
    region: "CA",
    postalCode: "90210",
    country: "US",
  },
  // Free-license stock photography (generic shots, not tied to any listing's address),
  // mirrored into the project's own UploadThing bucket.
  heroImage: "https://gbxt70nat9.ufs.sh/f/q3qRD927C251Q5bJXD5elt9nIHjFDo2OXeBxMyCfUS1c6kNd",
  editorialImage: "https://gbxt70nat9.ufs.sh/f/q3qRD927C251EI9HzyA7up2axqSnlNEtz1GHgeb3kB9IymcJ",
  editorialInsetImage: "https://gbxt70nat9.ufs.sh/f/q3qRD927C251Wh65cWYugPqnyJX0O8MVSwdADr1m2olCbvjh",
  agencyImage: "https://gbxt70nat9.ufs.sh/f/q3qRD927C2512ifq63CgCoXf9Nrw0UBVEjeuik7vH6YD4Ity",
} as const;

export function absoluteUrl(path = "/") {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}

/** All listing/site images are absolute UploadThing URLs already; this just guards against a future relative path. */
export function absoluteImageUrl(src: string) {
  return src.startsWith("/") ? absoluteUrl(src) : src;
}

/**
 * Share-card image for OpenGraph/Twitter: the photo resized to 1200px wide by
 * the built-in image optimizer, so previews stay small enough for every
 * messaging app instead of serving the multi-megapixel original.
 */
export function socialImageUrl(src: string) {
  return absoluteUrl(`/_next/image?url=${encodeURIComponent(src)}&w=1200&q=75`);
}
