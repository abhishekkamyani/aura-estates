import type { Metadata } from "next";
import { LeadsFilters } from "@/components/agency/LeadsFilters";
import { LeadsTable } from "@/components/agency/LeadsTable";
import { getLeads, parseLeadQuery } from "@/lib/leads";

export const metadata: Metadata = { title: "Leads" };
export const dynamic = "force-dynamic";

export default async function AgencyLeadsPage({ searchParams }: PageProps<"/agency/leads">) {
  const query = parseLeadQuery(await searchParams);
  const leads = await getLeads(query);

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Buyer inquiries</p>
        <h1 className="mt-2 text-4xl font-medium sm:text-5xl">Leads</h1>
        <p className="mt-2 text-slate-600">Private viewing requests submitted from listing pages.</p>
      </div>
      <LeadsFilters query={query} />
      <LeadsTable leads={leads} />
    </div>
  );
}
