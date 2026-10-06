export const siteConfig = {
  name: "Aura Estates",
  tagline: "Extraordinary Residences, Discreetly Represented",
  description:
    "Aura Estates is a private real estate agency representing the world's most distinguished residences — from Beverly Hills estates to Manhattan penthouses.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  email: "concierge@auraestates.com",
  phone: "+1 (310) 555-0142",
  address: {
    street: "9500 Wilshire Boulevard, Suite 400",
    city: "Beverly Hills",
    region: "CA",
    postalCode: "90212",
    country: "US",
  },
  heroImage:
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=2400&q=80",
  editorialImage:
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=80",
} as const;

export function absoluteUrl(path = "/") {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}
