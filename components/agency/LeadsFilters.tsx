"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { CalendarRange, Loader2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { LeadQuery, LeadRange } from "@/lib/leads";
import { cn } from "@/lib/utils";

const PRESETS: { value: LeadRange; label: string }[] = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "custom", label: "Custom" },
];

export function LeadsFilters({ query }: { query: LeadQuery }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState(query.q ?? "");
  const [from, setFrom] = useState(query.from ?? "");
  const [to, setTo] = useState(query.to ?? "");
  const [range, setRange] = useState<LeadRange>(query.range);

  function apply(next: Partial<{ range: LeadRange; from: string; to: string; q: string }>) {
    const merged = { range, from, to, q: search, ...next };
    const params = new URLSearchParams();
    if (merged.range && merged.range !== "all") params.set("range", merged.range);
    if (merged.range === "custom") {
      if (merged.from) params.set("from", merged.from);
      if (merged.to) params.set("to", merged.to);
    }
    if (merged.q?.trim()) params.set("q", merged.q.trim());
    const qs = params.toString();
    startTransition(() => router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false }));
  }

  // Debounced free-text search.
  useEffect(() => {
    if ((query.q ?? "") === search) return;
    const t = window.setTimeout(() => apply({ q: search }), 350);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const hasFilters = range !== "all" || Boolean(search);

  return (
    <div className="space-y-3 rounded-2xl border border-stone-200/80 bg-white p-3 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label="Date range" className="no-scrollbar flex gap-1 overflow-x-auto">
          {PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              aria-pressed={range === preset.value}
              onClick={() => {
                setRange(preset.value);
                if (preset.value !== "custom") apply({ range: preset.value });
              }}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors",
                range === preset.value ? "bg-graphite text-white" : "text-slate-600 hover:bg-stone-100",
              )}
            >
              {preset.value === "custom" && <CalendarRange className="size-3.5" />}
              {preset.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {pending && <Loader2 className="size-4 animate-spin text-slate-400" aria-label="Updating" />}
          <div className="relative flex-1 lg:w-72 lg:flex-none">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, phone…"
              aria-label="Search leads"
              className="h-10 rounded-full border-stone-200 pl-10 shadow-none"
            />
          </div>
          {hasFilters && (
            <Button
              variant="ghost"
              className="h-10 rounded-full px-3 text-xs text-slate-500"
              onClick={() => {
                setRange("all");
                setSearch("");
                setFrom("");
                setTo("");
                startTransition(() => router.replace(pathname, { scroll: false }));
              }}
            >
              <X className="size-3.5" /> Reset
            </Button>
          )}
        </div>
      </div>

      {range === "custom" && (
        <form
          className="flex flex-col gap-3 border-t border-stone-200/70 pt-3 sm:flex-row sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            apply({ range: "custom" });
          }}
        >
          <label className="space-y-1">
            <span className="block text-[0.65rem] font-semibold tracking-[0.16em] text-slate-500 uppercase">From</span>
            <Input
              type="date"
              value={from}
              max={to || undefined}
              onChange={(e) => setFrom(e.target.value)}
              className="h-10 rounded-xl border-stone-200 shadow-none"
            />
          </label>
          <label className="space-y-1">
            <span className="block text-[0.65rem] font-semibold tracking-[0.16em] text-slate-500 uppercase">To</span>
            <Input
              type="date"
              value={to}
              min={from || undefined}
              onChange={(e) => setTo(e.target.value)}
              className="h-10 rounded-xl border-stone-200 shadow-none"
            />
          </label>
          <Button type="submit" className="h-10 rounded-full bg-graphite px-5 text-white" disabled={!from && !to}>
            Apply range
          </Button>
        </form>
      )}
    </div>
  );
}
