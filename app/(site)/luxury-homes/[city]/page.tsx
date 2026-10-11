import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ArrowRight, ChevronRight, Map } from "lucide-react";
import { PropertyCard } from "@/components/property/PropertyCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { formatNumber, formatPrice, formatPriceCompact } from "@/lib/format";
import { getCities, getCityBySlug, getProperties } from "@/lib/properties";
import { cityPath, citySearchPath, propertyPath, slugify } from "@/lib/routes";
import { absoluteUrl, siteConfig, socialImageUrl } from "@/lib/site";
import type { PropertyDTO } from "@/types/property";

export const dynamic = "force-dynamic";

/** Short editorial introductions for the launch destinations; other cities use the generic copy. */
const DESTINATION_NOTES: Record<string, string> = {
  "beverly-hills":
    "Gated estates and architectural villas set above the Los Angeles basin, minutes from Rodeo Drive and the studios.",
  malibu:
    "Bluff-top and beachfront residences along the Pacific coast, where indoor rooms open directly to the ocean air.",
  "miami-beach":
    "Waterfront contemporaries on the bay and the Atlantic, with private docks, pool terraces and year-round sun.",
  "new-york":
    "Full-floor lofts and penthouses in landmark buildings, with private terraces above the downtown skyline.",
  aspen:
    "Timber-and-stone lodges with ski access, heated terraces and uninterrupted views across the surrounding peaks.",
  "east-hampton":
    "Shingle-style estates on quiet lanes near the ocean beaches, with gardens, pool houses and room for family.",
};

function summarize(properties: PropertyDTO[]) {
  const prices = properties.map((p) => p.price);
  const beds = properties.map((p) => p.bedrooms);
  return {
    count: properties.length,
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    minBeds: Math.min(...beds),
    maxBeds: Math.max(...beds),
    maxSqft: Math.max(...properties.map((p) => p.sqft)),
  };
}

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

export async function generateMetadata({ params }: PageProps<"/luxury-homes/[city]">): Promise<Metadata> {
  const { city: slug } = await params;
  const city = await getCityBySlug(slug);
  const properties = city ? await getProperties({ city }) : [];
  if (!city || properties.length === 0) {
    return { title: "Destination not found", robots: { index: false, follow: true } };
  }

  const s = summarize(properties);
  const title = `Luxury Homes for Sale in ${city}`;
  const description = `${s.count} luxury ${plural(s.count, "residence", "residences")} for sale in ${city} from ${formatPriceCompact(s.minPrice)}. View photography, floor areas and map locations, then book a private viewing with ${siteConfig.name}.`;
  const url = cityPath(city);
  const cover = properties[0].imageUrls[0];
  const images = cover ? [{ url: socialImageUrl(cover), alt: `${properties[0].title}, ${city}` }] : undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, siteName: siteConfig.name, title: `${title} | ${siteConfig.name}`, description, images, locale: "en_US" },
    twitter: { card: "summary_large_image", title: `${title} | ${siteConfig.name}`, description, images: images?.map((i) => i.url) },
  };
}

export default async function DestinationPage({ params }: PageProps<"/luxury-homes/[city]">) {
  const { city: slug } = await params;
  const city = await getCityBySlug(slug);
  if (!city) notFound();
  if (slug !== slugify(city)) permanentRedirect(cityPath(city));

  const [properties, cities] = await Promise.all([getProperties({ city, sort: "price-desc" }), getCities()]);
  if (properties.length === 0) notFound();

  const s = summarize(properties);
  const url = absoluteUrl(cityPath(city));
  const otherCities = cities.filter((c) => c !== city);
  const note = DESTINATION_NOTES[slugify(city)];
  const priceRange =
    s.minPrice === s.maxPrice ? formatPrice(s.minPrice) : `${formatPrice(s.minPrice)} to ${formatPrice(s.maxPrice)}`;
  const bedRange = s.minBeds === s.maxBeds ? `${s.minBeds}` : `${s.minBeds} to ${s.maxBeds}`;

  const facts = [
    { label: plural(s.count, "Residence", "Residences"), value: String(s.count) },
    { label: "Priced from", value: formatPriceCompact(s.minPrice) },
    { label: "Bedrooms", value: bedRange },
    { label: "Largest interior", value: `${formatNumber(s.maxSqft)} sq ft` },
  ];

  const questions = [
    {
      q: `How many luxury homes are for sale in ${city}?`,
      a: `${siteConfig.name} currently represents ${s.count} ${plural(s.count, "residence", "residences")} in ${city}. The collection changes as homes are introduced and placed under offer, and some are shown privately before they are listed here.`,
    },
    {
      q: `What do luxury homes in ${city} cost?`,
      a: `The ${plural(s.count, "residence", "residences")} in this collection ${plural(s.count, "is", "are")} offered at ${priceRange}, with ${bedRange} bedrooms and interiors of up to ${formatNumber(s.maxSqft)} square feet.`,
    },
    {
      q: `How do I arrange a viewing in ${city}?`,
      a: `Open any residence and use the private viewing form to request a date. An advisor from our private client desk confirms the appointment, or you can call ${siteConfig.phone}.`,
    },
  ];

  return (
    <>
      <JsonLd
        id="jsonld-destination"
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              "@id": `${url}#page`,
              url,
              name: `Luxury homes for sale in ${city}`,
              isPartOf: { "@id": `${siteConfig.url}#website` },
              about: { "@type": "City", name: city },
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
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
                { "@type": "ListItem", position: 2, name: "Residences", item: absoluteUrl("/properties") },
                { "@type": "ListItem", position: 3, name: city, item: url },
              ],
            },
            {
              "@type": "FAQPage",
              mainEntity: questions.map(({ q, a }) => ({
                "@type": "Question",
                name: q,
                acceptedAnswer: { "@type": "Answer", text: a },
              })),
            },
          ],
        }}
      />

      <section aria-labelledby="destination-title" className="border-b border-stone-200/80 bg-alabaster">
        <div className="container-luxe py-10 sm:py-14">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-500">
              <li>
                <Link href="/" className="hover:text-graphite">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="size-3" />
              </li>
              <li>
                <Link href="/properties" className="hover:text-graphite">
                  Residences
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="size-3" />
              </li>
              <li aria-current="page" className="text-graphite">
                {city}
              </li>
            </ol>
          </nav>

          <div className="mt-7 grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
            <div>
              <p className="eyebrow flex items-center gap-3">
                <span className="gold-rule" aria-hidden="true" />
                Destination
              </p>
              <h1 id="destination-title" className="mt-4 text-5xl leading-[1.02] font-medium sm:text-6xl">
                Luxury homes for sale in <em className="text-gold-deep italic">{city}</em>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                {note ? `${note} ` : ""}
                {siteConfig.name} represents {s.count} {plural(s.count, "residence", "residences")} in {city}, offered
                at {priceRange}. Each home is visited and vetted by our advisors before it joins the collection.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  asChild
                  className="h-12 rounded-full bg-graphite px-6 text-sm font-semibold text-alabaster shadow-lg shadow-slate-900/15 hover:bg-slate-800"
                >
                  <a href="#residences">
                    View {plural(s.count, "the residence", `all ${s.count} residences`)}
                    <ArrowRight className="size-4" />
                  </a>
                </Button>
                <Button asChild variant="outline" className="h-12 rounded-full border-stone-200 bg-white px-6 text-sm font-semibold">
                  <Link href={citySearchPath(city)}>
                    <Map className="size-4" aria-hidden="true" />
                    Explore on the map
                  </Link>
                </Button>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[1.5rem] border border-stone-200/80 bg-stone-200/80 shadow-sm">
              {facts.map((fact) => (
                <div key={fact.label} className="flex flex-col gap-1.5 bg-white p-5 sm:p-6">
                  <dt className="text-[0.65rem] font-semibold tracking-[0.2em] text-slate-500 uppercase">{fact.label}</dt>
                  <dd className="font-serif text-2xl font-semibold text-graphite sm:text-[1.7rem]">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section id="residences" aria-labelledby="residences-title" className="container-luxe scroll-mt-24 py-16 sm:py-20">
        <h2 id="residences-title" className="text-3xl font-medium sm:text-4xl">
          Residences in {city}
        </h2>
        <ul className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p, i) => (
            <li key={p.id}>
              <PropertyCard property={p} priority={i < 3} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="buying-title" className="border-y border-stone-200/80 bg-ivory/60 py-16 sm:py-20">
        <div className="container-luxe grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-16">
          <div>
            <p className="eyebrow flex items-center gap-3">
              <span className="gold-rule" aria-hidden="true" />
              Buying in {city}
            </p>
            <h2 id="buying-title" className="mt-4 text-4xl leading-[1.05] font-medium sm:text-5xl">
              Questions, <em className="text-gold-deep italic">answered</em>
            </h2>
          </div>
          <dl className="space-y-8">
            {questions.map(({ q, a }) => (
              <div key={q}>
                <dt className="font-serif text-2xl font-semibold text-graphite">{q}</dt>
                <dd className="mt-2.5 leading-relaxed text-slate-600">{a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {otherCities.length > 0 && (
        <nav aria-labelledby="more-destinations-title" className="container-luxe py-16 sm:py-20">
          <h2 id="more-destinations-title" className="text-3xl font-medium sm:text-4xl">
            More destinations
          </h2>
          <ul className="mt-7 flex flex-wrap gap-3">
            {otherCities.map((c) => (
              <li key={c}>
                <Link
                  href={cityPath(c)}
                  className="inline-flex h-11 items-center rounded-full border border-stone-200/80 bg-white px-5 text-sm font-semibold text-graphite shadow-sm transition-colors hover:border-gold hover:text-gold-deep"
                >
                  Luxury homes in {c}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </>
  );
}
