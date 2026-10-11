import { JsonLd } from "@/components/seo/JsonLd";
import { absoluteImageUrl, absoluteUrl, siteConfig } from "@/lib/site";

/** Agency + WebSite structured data for the home page. */
export function OrganizationJsonLd({ areasServed }: { areasServed: string[] }) {
  return (
    <JsonLd
      id="jsonld-organization"
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "RealEstateAgent",
            "@id": `${siteConfig.url}#organization`,
            name: siteConfig.name,
            url: siteConfig.url,
            logo: absoluteUrl("/icon.svg"),
            image: absoluteImageUrl(siteConfig.heroImage),
            description: siteConfig.description,
            email: siteConfig.email,
            telephone: siteConfig.phone,
            priceRange: "$$$$",
            address: {
              "@type": "PostalAddress",
              streetAddress: siteConfig.address.street,
              addressLocality: siteConfig.address.city,
              addressRegion: siteConfig.address.region,
              postalCode: siteConfig.address.postalCode,
              addressCountry: siteConfig.address.country,
            },
            areaServed: areasServed.map((city) => ({ "@type": "City", name: city })),
          },
          {
            "@type": "WebSite",
            "@id": `${siteConfig.url}#website`,
            url: siteConfig.url,
            name: siteConfig.name,
            publisher: { "@id": `${siteConfig.url}#organization` },
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: `${absoluteUrl("/properties")}?city={search_term_string}`,
              },
              "query-input": "required name=search_term_string",
            },
          },
        ],
      }}
    />
  );
}
