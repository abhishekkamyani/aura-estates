import type { PropertyDTO } from "@/types/property";

/** "Villa Lumière" → "villa-lumiere". Safe for URLs; never returns leading/trailing dashes. */
export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Canonical listing URL: a readable slug followed by the database id, e.g.
 * /properties/villa-lumiere-beverly-hills-6ac5d4b6d43e3638fe0b2889.
 * The id is what resolves the listing, so the URL keeps working if the title changes.
 */
export function propertyPath(property: Pick<PropertyDTO, "id" | "title" | "city">) {
  const slug = slugify(`${property.title} ${property.city}`);
  return `/properties/${slug ? `${slug}-` : ""}${property.id}`;
}

/** Reads the trailing 24-character id out of a listing URL segment (with or without a slug). */
export function propertyIdFromParam(param: string) {
  const match = /(?:^|-)([a-f0-9]{24})$/i.exec(param);
  return match ? match[1].toLowerCase() : null;
}

/** Destination landing page, e.g. /luxury-homes/beverly-hills. */
export function cityPath(city: string) {
  return `/luxury-homes/${slugify(city)}`;
}

/** Map search pre-filtered to a destination. */
export function citySearchPath(city: string) {
  return `/properties?city=${encodeURIComponent(city)}`;
}
