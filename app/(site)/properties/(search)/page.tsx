import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PropertiesExplorer } from "@/components/property/PropertiesExplorer";
import { JsonLd } from "@/components/seo/JsonLd";
import { formatPriceCompact } from "@/lib/format";
import { getCities, getProperties, parsePropertyFilters } from "@/lib/properties";
import { cityPath, propertyPath } from "@/lib/routes";
import { absoluteUrl, siteConfig, socialImageUrl } from "@/lib/site";
import type { PropertyFilters } from "@/types/property";

export const dynamic = "force-dynamic";

function describe(filters: PropertyFilters) {
  const parts: string[] = [];
  if (filters.beds) parts.push(`${filters.beds}+ bedroom`);
  if (filters.minPrice && filters.maxPrice) {
    parts.push(`${formatPriceCompact(filters.minPrice)}–${formatPriceCompact(filters.maxPrice)}`);
  } else if (filters.minPrice) {
    parts.push(`over ${formatPriceCompact(filters.minPrice)}`);
  } else if (filters.maxPrice) {
    parts.push(`under ${formatPriceCompact(filters.maxPrice)}`);
  }
  return parts.join(" · ");
}

export async function generateMetadata({ searchParams }: PageProps<"/properties">): Promise<Metadata> {
  const filters = parsePropertyFilters(await searchParams);
  const place = filters.city ? ` in ${filters.city}` : "";
  const title = `Luxury Homes for Sale${place}`;
  const description = filters.city
    ? `Browse exclusive luxury residences for sale in ${filters.city}, represented privately by ${siteConfig.name}. View photography, floor areas and book a private viewing.`
    : `Explore estates, villas and penthouses for sale across America's most coveted destinations. Interactive map, full specifications and private viewings.`;
  // A city filter is the map view of that destination's landing page, which is
  // the URL that should rank; an unknown city has nothing to canonicalise to.
  const knownCity = filters.city
    ? (await getCities()).find((c) => c.toLowerCase() === filters.city!.toLowerCase())
    : undefined;
  const canonical = knownCity ? cityPath(knownCity) : "/properties";
  const shareImage = socialImageUrl(siteConfig.heroImage);
  // Price/bedroom/sort permutations and unknown cities stay out of the index.
  // (A known city is not noindexed: its canonical already hands the signal on.)
  const isPermutation = Boolean(
    filters.minPrice || filters.maxPrice || filters.beds || filters.sort || (filters.city && !knownCity),
  );

  return {
    title,
    description,
    alternates: { canonical },
    // Omitted (not undefined) when indexable, so the site-wide robots directives still apply.
    ...(isPermutation ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      url: canonical,
      type: "website",
      siteName: siteConfig.name,
      images: [{ url: shareImage, alt: "Luxury residences represented by Astrelle Estates" }],
    },
    twitter: { card: "summary_large_image", title: `${title} | ${siteConfig.name}`, description, images: [shareImage] },
  };
}

export default async function PropertiesPage({ searchParams }: PageProps<"/properties">) {
  const filters = parsePropertyFilters(await searchParams);
  const [properties, cities] = await Promise.all([getProperties(filters), getCities()]);
  const summary = describe(filters);

  return (
    <>
      <JsonLd
        id="jsonld-search-results"
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `Luxury homes for sale${filters.city ? ` in ${filters.city}` : ""}`,
          url: absoluteUrl("/properties"),
          isPartOf: { "@id": `${siteConfig.url}#website` },
          breadcrumb: {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
              { "@type": "ListItem", position: 2, name: "Residences", item: absoluteUrl("/properties") },
            ],
          },
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: properties.length,
            itemListElement: properties.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: absoluteUrl(propertyPath(p)),
              name: p.title,
            })),
          },
        }}
      />

      <section aria-labelledby="properties-title" className="border-b border-stone-200/80 bg-alabaster">
        <div className="container-luxe max-w-none py-8 sm:py-10 lg:px-12">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <li>
                <Link href="/" className="hover:text-graphite">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="size-3" />
              </li>
              <li aria-current={filters.city ? undefined : "page"} className={filters.city ? "" : "text-graphite"}>
                {filters.city ? (
                  <Link href="/properties" className="hover:text-graphite">
                    Residences
                  </Link>
                ) : (
                  "Residences"
                )}
              </li>
              {filters.city && (
                <>
                  <li aria-hidden="true">
                    <ChevronRight className="size-3" />
                  </li>
                  <li aria-current="page" className="text-graphite">
                    {filters.city}
                  </li>
                </>
              )}
            </ol>
          </nav>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h1 id="properties-title" className="text-4xl font-medium sm:text-5xl">
              {filters.city ? (
                <>
                  Residences in <em className="text-gold-deep italic">{filters.city}</em>
                </>
              ) : (
                <>
                  Residences <em className="text-gold-deep italic">for sale</em>
                </>
              )}
            </h1>
            <p className="text-sm text-slate-500">
              <span className="font-semibold text-graphite">{properties.length}</span>{" "}
              {properties.length === 1 ? "residence" : "residences"}
              {summary ? ` · ${summary}` : ""}
            </p>
          </div>
        </div>
      </section>

      <PropertiesExplorer properties={properties} cities={cities} filters={filters} />
    </>
  );
}
