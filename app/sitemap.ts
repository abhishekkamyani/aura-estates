import type { MetadataRoute } from "next";
import { getProperties } from "@/lib/properties";
import { cityPath, propertyPath } from "@/lib/routes";
import { absoluteImageUrl, absoluteUrl } from "@/lib/site";

// Always reflect the live inventory (and never require a database at build time).
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/properties"), changeFrequency: "daily", priority: 0.9 },
  ];

  try {
    const properties = await getProperties();
    const latest = (items: typeof properties) =>
      items.length ? new Date(Math.max(...items.map((p) => Date.parse(p.updatedAt)))) : undefined;
    const cities = [...new Set(properties.map((p) => p.city))];

    return [
      ...staticRoutes.map((route) => ({ ...route, lastModified: latest(properties) })),
      // Destination landing pages (the ?city= map view canonicalises to these).
      ...cities.map((city) => ({
        url: absoluteUrl(cityPath(city)),
        lastModified: latest(properties.filter((p) => p.city === city)),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...properties.map((p) => ({
        url: absoluteUrl(propertyPath(p)),
        lastModified: new Date(p.updatedAt),
        changeFrequency: "weekly" as const,
        priority: 0.7,
        images: p.imageUrls.slice(0, 5).map(absoluteImageUrl),
      })),
    ];
  } catch (error) {
    console.error("[sitemap] falling back to static routes", error);
    return staticRoutes;
  }
}
