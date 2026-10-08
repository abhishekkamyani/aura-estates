import { JsonLd } from "@/components/seo/JsonLd";
import { absoluteImageUrl, absoluteUrl, siteConfig } from "@/lib/site";
import type { PropertyDTO, PropertyStatus } from "@/types/property";

const AVAILABILITY: Record<PropertyStatus, string> = {
  active: "https://schema.org/InStock",
  pending: "https://schema.org/LimitedAvailability",
  sold: "https://schema.org/SoldOut",
};

/** Splits "6 Pondlight Lane, East Hampton, NY 11937" into PostalAddress parts. */
export function parseAddress(property: Pick<PropertyDTO, "address" | "city">) {
  const parts = property.address.split(",").map((p) => p.trim());
  const regionMatch = property.address.match(/\b([A-Z]{2})\s+(\d{5}(?:-\d{4})?)\b/);
  return {
    "@type": "PostalAddress",
    streetAddress: parts[0],
    addressLocality: property.city,
    ...(regionMatch ? { addressRegion: regionMatch[1], postalCode: regionMatch[2] } : {}),
    addressCountry: "US",
  };
}

interface PropertyJsonLdProps {
  property: PropertyDTO;
}

/**
 * Injects schema.org `RealEstateListing` structured data (with the offered
 * residence, price, address, rooms, geo coordinates and availability) plus a
 * matching `BreadcrumbList` for the property detail page.
 */
export function PropertyJsonLd({ property }: PropertyJsonLdProps) {
  const url = absoluteUrl(`/properties/${property.id}`);
  const residenceId = `${url}#residence`;

  const residence = {
    "@type": "SingleFamilyResidence",
    "@id": residenceId,
    name: property.title,
    description: property.description,
    address: parseAddress(property),
    geo: {
      "@type": "GeoCoordinates",
      latitude: property.lat,
      longitude: property.lng,
    },
    numberOfRooms: property.bedrooms + Math.ceil(property.bathrooms),
    numberOfBedrooms: property.bedrooms,
    numberOfBathroomsTotal: property.bathrooms,
    floorSize: {
      "@type": "QuantitativeValue",
      value: property.sqft,
      unitCode: "FTK",
      unitText: "sq ft",
    },
    image: property.imageUrls.map(absoluteImageUrl),
  };

  const listing = {
    "@type": "RealEstateListing",
    "@id": `${url}#listing`,
    url,
    name: property.title,
    description: property.description,
    image: property.imageUrls.map(absoluteImageUrl),
    datePosted: property.createdAt,
    dateModified: property.updatedAt,
    about: { "@id": residenceId },
    mainEntity: { "@id": residenceId },
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "USD",
      availability: AVAILABILITY[property.status],
      businessFunction: "http://purl.org/goodrelations/v1#Sell",
      url,
      itemOffered: { "@id": residenceId },
      seller: {
        "@type": "RealEstateAgent",
        name: siteConfig.name,
        url: siteConfig.url,
        telephone: siteConfig.phone,
        email: siteConfig.email,
      },
    },
  };

  const breadcrumbs = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Residences", item: absoluteUrl("/properties") },
      {
        "@type": "ListItem",
        position: 3,
        name: property.city,
        item: absoluteUrl(`/properties?city=${encodeURIComponent(property.city)}`),
      },
      { "@type": "ListItem", position: 4, name: property.title, item: url },
    ],
  };

  return (
    <JsonLd
      id={`jsonld-property-${property.id}`}
      data={{ "@context": "https://schema.org", "@graph": [listing, residence, breadcrumbs] }}
    />
  );
}

export default PropertyJsonLd;
