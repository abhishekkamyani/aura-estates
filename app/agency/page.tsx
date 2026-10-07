import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, CalendarClock, Inbox, Sparkles, Wallet } from "lucide-react";
import { StatCard } from "@/components/agency/StatCard";
import { StatusBadge } from "@/components/property/StatusBadge";
import { Button } from "@/components/ui/button";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { formatDateTime, formatPrice, formatPriceCompact } from "@/lib/format";
import { getLeadCountsByProperty, getLeads, getLeadStats } from "@/lib/leads";
import { getAllPropertiesForAgency } from "@/lib/properties";

export const dynamic = "force-dynamic";

export default async function AgencyOverviewPage() {
  const [properties, leadStats, recentLeads, leadCounts] = await Promise.all([
    getAllPropertiesForAgency(),
    getLeadStats(),
    getLeads({ range: "all" }),
    getLeadCountsByProperty(),
  ]);

  const active = properties.filter((p) => p.status === "active");
  const featured = properties.filter((p) => p.featured && p.status !== "sold");
  const portfolio = properties.filter((p) => p.status !== "sold").reduce((sum, p) => sum + p.price, 0);
  const topListings = [...properties]
    .sort((a, b) => (leadCounts[b.id] ?? 0) - (leadCounts[a.id] ?? 0))
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Overview</p>
          <h1 className="mt-2 text-4xl font-medium sm:text-5xl">Good day.</h1>
          <p className="mt-2 text-slate-600">Here is how the collection is performing.</p>
        </div>
        <Button asChild className="h-11 rounded-full bg-graphite px-5 text-white shadow-lg shadow-slate-900/10">
          <Link href="/agency/listings?new=1">
            <Sparkles className="size-4 text-gold" /> Add new listing
          </Link>
        </Button>
      </div>

      <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          accent
          icon={Wallet}
          label="Portfolio value"
          value={formatPriceCompact(portfolio)}
          hint={`${properties.length - properties.filter((p) => p.status === "sold").length} listings on market`}
        />
        <StatCard icon={Building2} label="Active listings" value={String(active.length)} hint={`${featured.length} featured on home page`} />
        <StatCard icon={Inbox} label="Leads · 7 days" value={String(leadStats.last7)} hint={`${leadStats.last30} in the last 30 days`} />
        <StatCard icon={CalendarClock} label="Total inquiries" value={String(leadStats.total)} hint="All-time viewing requests" />
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section aria-labelledby="recent-leads" className="min-w-0 rounded-2xl border border-stone-200/80 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-stone-200/80 px-5 py-4">
            <h2 id="recent-leads" className="font-sans text-base font-semibold tracking-normal">
              Recent viewing requests
            </h2>
            <Link href="/agency/leads" className="inline-flex items-center gap-1 text-xs font-semibold text-gold-deep hover:underline">
              All leads <ArrowRight className="size-3.5" />
            </Link>
          </div>
          {recentLeads.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-slate-500">No inquiries yet.</p>
          ) : (
            <ul className="divide-y divide-stone-200/70">
              {recentLeads.slice(0, 6).map((lead) => (
                <li key={lead.id} className="flex items-center gap-4 px-5 py-3.5">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gold-soft text-xs font-bold text-gold-deep">
                    {lead.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-graphite">{lead.name}</p>
                    <p className="truncate text-xs text-slate-500">
                      {lead.propertyTitle ?? "Removed listing"} · {lead.email}
                    </p>
                  </div>
                  <time dateTime={lead.createdAt} className="hidden shrink-0 text-xs text-slate-400 sm:block">
                    {formatDateTime(lead.createdAt)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="top-listings" className="min-w-0 rounded-2xl border border-stone-200/80 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-stone-200/80 px-5 py-4">
            <h2 id="top-listings" className="font-sans text-base font-semibold tracking-normal">
              Most requested
            </h2>
            <Link href="/agency/listings" className="inline-flex items-center gap-1 text-xs font-semibold text-gold-deep hover:underline">
              Manage <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <ul className="divide-y divide-stone-200/70">
            {topListings.map((p) => (
              <li key={p.id} className="flex items-center gap-3.5 px-5 py-3">
                <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                  <Image src={p.imageUrls[0] ?? PLACEHOLDER_IMAGE} alt="" fill sizes="48px" className="object-cover" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-graphite">{p.title}</p>
                  <p className="text-xs text-slate-500">
                    {p.city} · {formatPrice(p.price)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm font-bold text-graphite">{leadCounts[p.id] ?? 0}</span>
                  <StatusBadge status={p.status} className="px-2 py-0.5 text-[0.58rem]" />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
