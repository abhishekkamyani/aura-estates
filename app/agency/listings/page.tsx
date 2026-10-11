import type { Metadata } from "next";
import { ListingsManager } from "@/components/agency/ListingsManager";
import { getLeadCountsByProperty } from "@/lib/leads";
import { getAllPropertiesForAgency } from "@/lib/properties";

export const metadata: Metadata = { title: "Listings" };
export const dynamic = "force-dynamic";

export default async function AgencyListingsPage({ searchParams }: PageProps<"/agency/listings">) {
  const params = await searchParams;
  const [properties, leadCounts] = await Promise.all([getAllPropertiesForAgency(), getLeadCountsByProperty()]);
  return <ListingsManager properties={properties} leadCounts={leadCounts} openNew={params.new === "1"} />;
}
