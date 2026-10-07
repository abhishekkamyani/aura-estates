import { DestinationsSection } from "@/components/home/DestinationsSection";
import { EditorialSection } from "@/components/home/EditorialSection";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { Hero } from "@/components/home/Hero";
import { PrivateOfficeSection } from "@/components/home/PrivateOfficeSection";
import { OrganizationJsonLd } from "@/components/seo/OrganizationJsonLd";
import {
  getCities,
  getDestinations,
  getFeaturedProperties,
  getPortfolioStats,
} from "@/lib/properties";

// Inventory changes from the agency dashboard must appear immediately,
// and builds must not require a database connection.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, destinations, stats, cities] = await Promise.all([
    getFeaturedProperties(6),
    getDestinations(),
    getPortfolioStats(),
    getCities(),
  ]);

  return (
    <>
      <OrganizationJsonLd areasServed={cities} />
      <Hero cities={cities} stats={stats} spotlight={featured[0] ?? null} />
      <FeaturedSection properties={featured} />
      <EditorialSection />
      <DestinationsSection destinations={destinations} />
      <PrivateOfficeSection />
    </>
  );
}
