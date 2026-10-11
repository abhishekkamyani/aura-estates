import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ArrowRight, ChevronRight, MapPin, Phone } from "lucide-react";
import { LocationMap } from "@/components/map/lazy";
import { Reveal } from "@/components/motion/Reveal";
import { LeadForm } from "@/components/property/LeadForm";
import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertyGallery } from "@/components/property/PropertyGallery";
import { ShareButton } from "@/components/property/ShareButton";
import { FeaturedBadge, StatusBadge } from "@/components/property/StatusBadge";
import { PropertyJsonLd } from "@/components/seo/PropertyJsonLd";
import { Button } from "@/components/ui/button";
import { formatDate, formatNumber, formatPrice } from "@/lib/format";
import { getPropertyById, getSimilarProperties } from "@/lib/properties";
import { cityPath, propertyIdFromParam, propertyPath } from "@/lib/routes";
import { siteConfig, socialImageUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

/** The segment is "<slug>-<id>"; only the trailing id identifies the listing. */
async function loadProperty(segment: string) {
  const id = propertyIdFromParam(segment);
  return id ? getPropertyById(id) : null;
}

export async function generateMetadata({ params }: PageProps<"/properties/[id]">): Promise<Metadata> {
  const { id } = await params;
  const property = await loadProperty(id);
  if (!property) {
    return { title: "Residence not found", robots: { index: false, follow: true } };
  }

  const title = `${property.title}, ${property.city} — ${formatPrice(property.price)}`;
  const summary = `${property.bedrooms} bed · ${property.bathrooms} bath · ${formatNumber(property.sqft)} sq ft luxury residence for sale in ${property.city}.`;
  const firstParagraph = property.description.split(/\n+/)[0] ?? "";
  const description = `${summary} ${firstParagraph}`.slice(0, 158).replace(/\s+\S*$/, "") + "…";
  const url = propertyPath(property);
  const images = property.imageUrls.slice(0, 4).map((src, i) => ({
    url: socialImageUrl(src),
    alt: `${property.title} in ${property.city} — photo ${i + 1}`,
  }));

  return {
    title,
    description,
    alternates: { canonical: url },
    // Sold homes stay reachable for buyers with the link but leave the index.
    ...(property.status === "sold" ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type: "website",
      url,
      siteName: siteConfig.name,
      title: `${title} | ${siteConfig.name}`,
      description,
      images,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteConfig.name}`,
      description,
      images: images.slice(0, 1).map((i) => i.url),
    },
    other: {
      "product:price:amount": String(property.price),
      "product:price:currency": "USD",
    },
  };
}

function tomorrowISO() {
  const d = new Date(Date.now() + 86_400_000);
  return d.toISOString().slice(0, 10);
}

export default async function PropertyPage({ params }: PageProps<"/properties/[id]">) {
  const { id } = await params;
  const property = await loadProperty(id);
  if (!property) notFound();
  // One indexable URL per listing: bare ids and outdated slugs redirect permanently.
  if (decodeURIComponent(id) !== propertyPath(property).split("/").pop()) {
    permanentRedirect(propertyPath(property));
  }

  const similar = await getSimilarProperties(property, 3);
  const pricePerSqft = property.sqft > 0 ? Math.round(property.price / property.sqft) : null;
  const paragraphs = property.description.split(/\n{2,}|\r\n\r\n/).filter(Boolean);
  const tel = siteConfig.phone.replace(/[^+\d]/g, "");

  const facts = [
    { label: "Bedrooms", value: property.bedrooms },
    { label: "Bathrooms", value: property.bathrooms },
    { label: "Interior", value: `${formatNumber(property.sqft)} sq ft` },
    { label: "Price / sq ft", value: pricePerSqft ? formatPrice(pricePerSqft) : "—" },
    { label: "Destination", value: property.city },
    { label: "Listed", value: formatDate(property.createdAt, { month: "long" }) },
  ];

  return (
    <>
      <PropertyJsonLd property={property} />

      <article aria-labelledby="property-title" className="pb-24">
        <header className="container-luxe pt-8 sm:pt-10">
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
              <li>
                <Link href={cityPath(property.city)} className="hover:text-graphite">
                  {property.city}
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="size-3" />
              </li>
              <li aria-current="page" className="text-graphite">
                {property.title}
              </li>
            </ol>
          </nav>

          <Reveal y={18} className="mt-7 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                {property.featured && <FeaturedBadge />}
                <StatusBadge status={property.status} />
              </div>
              <h1 id="property-title" className="mt-5 text-5xl leading-[0.98] font-medium sm:text-6xl lg:text-7xl">
                {property.title}
              </h1>
              <p className="mt-4 flex items-start gap-2 text-base text-slate-600">
                <MapPin className="mt-1 size-4 shrink-0 text-gold-deep" aria-hidden="true" />
                {property.address}
              </p>
            </div>
            <div className="flex flex-col gap-4 lg:items-end">
              <div className="lg:text-right">
                <p className="text-[0.68rem] font-semibold tracking-[0.22em] text-slate-500 uppercase">Offered at</p>
                <p className="font-serif text-4xl font-semibold text-graphite sm:text-5xl">
                  {formatPrice(property.price)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <ShareButton title={property.title} />
                {property.status !== "sold" && (
                  <Button
                    asChild
                    className="h-11 rounded-full bg-graphite px-6 text-[0.82rem] font-semibold text-alabaster shadow-lg shadow-slate-900/15 transition-all hover:-translate-y-0.5 hover:bg-slate-800"
                  >
                    <a href="#viewing">Book a viewing</a>
                  </Button>
                )}
              </div>
            </div>
          </Reveal>
        </header>

        <div className="container-luxe mt-8">
          <PropertyGallery images={property.imageUrls} title={property.title} />
        </div>

        <div className="container-luxe mt-14 grid gap-14 lg:grid-cols-[minmax(0,1fr)_25rem] lg:gap-16 xl:grid-cols-[minmax(0,1fr)_27rem]">
          <div className="min-w-0 space-y-16">
            <Reveal>
              <section aria-labelledby="overview-title">
                <h2 id="overview-title" className="text-3xl font-medium sm:text-4xl">
                  Residence at a glance
                </h2>
                <dl className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-[1.5rem] border border-stone-200/80 bg-stone-200/80 shadow-sm sm:grid-cols-3">
                  {facts.map((fact) => (
                    <div key={fact.label} className="flex flex-col gap-1.5 bg-white p-5 sm:p-6">
                      <dt className="text-[0.65rem] font-semibold tracking-[0.2em] text-slate-500 uppercase">
                        {fact.label}
                      </dt>
                      <dd className="font-serif text-2xl font-semibold text-graphite sm:text-[1.7rem]">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            </Reveal>

            <Reveal>
              <section aria-labelledby="about-title">
                <h2 id="about-title" className="text-3xl font-medium sm:text-4xl">
                  About the residence
                </h2>
                <div className="mt-6 space-y-5 text-[1.05rem] leading-[1.85] text-slate-600">
                  {paragraphs.map((p, i) => (
                    <p key={i} className={i === 0 ? "first-letter:float-left first-letter:mr-3 first-letter:font-serif first-letter:text-6xl first-letter:leading-[0.85] first-letter:text-gold-deep" : undefined}>
                      {p}
                    </p>
                  ))}
                </div>
              </section>
            </Reveal>

            <Reveal>
              <section aria-labelledby="location-title">
                <h2 id="location-title" className="text-3xl font-medium sm:text-4xl">
                  Location
                </h2>
                <p className="mt-3 flex items-start gap-2 text-slate-600">
                  <MapPin className="mt-1 size-4 shrink-0 text-gold-deep" aria-hidden="true" />
                  {property.address}
                </p>
                <div className="mt-6 h-[20rem] overflow-hidden rounded-[1.5rem] border border-stone-200/80 shadow-xl shadow-stone-200/50 sm:h-[24rem]">
                  <LocationMap lat={property.lat} lng={property.lng} label={property.title} />
                </div>
              </section>
            </Reveal>
          </div>

          <aside
            id="viewing"
            aria-labelledby="viewing-title"
            className="scroll-mt-28 lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:self-start"
          >
            <div className="relative overflow-hidden rounded-[1.75rem] border border-stone-200/80 bg-white p-6 shadow-xl shadow-stone-200/50 sm:p-8">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gold-light/60 blur-2xl"
              />
              <p className="eyebrow relative">Private Viewing</p>
              <h2 id="viewing-title" className="relative mt-2 text-3xl font-medium">
                {property.status === "sold" ? "This residence has sold" : "Book a private viewing"}
              </h2>

              <div className="relative mt-5 flex items-center gap-3.5 rounded-2xl border border-stone-200/80 bg-alabaster p-3.5">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-graphite font-serif text-lg font-semibold text-gold">
                  A
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-graphite">Private Client Desk</p>
                  <a href={`tel:${tel}`} className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-graphite">
                    <Phone className="size-3" aria-hidden="true" />
                    {siteConfig.phone}
                  </a>
                </div>
              </div>

              <div className="relative mt-6">
                {property.status === "sold" ? (
                  <div className="space-y-4 text-sm text-slate-600">
                    <p>Our advisors can introduce you to comparable residences, including off-market opportunities.</p>
                    <Button asChild className="h-12 w-full rounded-full bg-graphite text-white">
                      <Link href={cityPath(property.city)}>
                        Explore {property.city}
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <LeadForm propertyId={property.id} propertyTitle={property.title} minDate={tomorrowISO()} />
                )}
              </div>
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <section aria-labelledby="similar-title" className="container-luxe mt-28">
            <Reveal>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="eyebrow flex items-center gap-3">
                    <span className="gold-rule" aria-hidden="true" />
                    Continue exploring
                  </p>
                  <h2 id="similar-title" className="mt-3 text-4xl font-medium sm:text-5xl">
                    You may also <em className="text-gold-deep italic">consider</em>
                  </h2>
                </div>
                <Link href="/properties" className="group inline-flex items-center gap-2 text-sm font-semibold text-graphite">
                  All residences
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </Reveal>
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((p) => (
                <li key={p.id}>
                  <PropertyCard property={p} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </>
  );
}
