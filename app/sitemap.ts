import type { MetadataRoute } from "next";
import { getProperties } from "@/lib/properties";
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
    const cities = [...new Set(properties.map((p) => p.city))];
    return [
      ...staticRoutes,
      ...cities.map((city) => ({
        url: absoluteUrl(`/properties?city=${encodeURIComponent(city)}`),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
      ...properties.map((p) => ({
        url: absoluteUrl(`/properties/${p.id}`),
        lastModified: new Date(p.updatedAt),
        changeFrequency: "weekly" as const,
        priority: 0.8,
        images: p.imageUrls.slice(0, 5).map(absoluteImageUrl),
      })),
    ];
  } catch (error) {
    console.error("[sitemap] falling back to static routes", error);
    return staticRoutes;
  }
}
