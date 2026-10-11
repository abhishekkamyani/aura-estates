"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BEDROOM_OPTIONS, PRICE_OPTIONS, SORT_OPTIONS } from "@/lib/constants";
import { formatPriceCompact } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PropertyFilters as Filters } from "@/types/property";

export const ANY = "any";
export type FilterKey = "city" | "minPrice" | "maxPrice" | "beds" | "sort";
export type FilterPatch = Partial<Record<FilterKey, string>>;

interface PropertyFiltersProps {
  cities: string[];
  filters: Filters;
  resultCount: number;
  pending?: boolean;
  onChange: (patch: FilterPatch) => void;
  onReset: () => void;
}

function FilterSelect({
  id,
  label,
  value,
  onValueChange,
  options,
  className,
  compact,
}: {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
  compact?: boolean;
}) {
  const active = value !== ANY && value !== "newest";
  return (
    <div className={cn(compact ? "" : "space-y-2", className)}>
      <label htmlFor={id} className={cn(compact ? "sr-only" : "eyebrow block text-[0.62rem] text-slate-500")}>
        {label}
      </label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          id={id}
          className={cn(
            "w-full rounded-full border-stone-200/90 bg-white px-4 text-[0.82rem] font-medium shadow-xs transition-colors hover:border-stone-300 data-[size=default]:h-10",
            active && "border-graphite/70 bg-graphite text-white [&>svg]:!text-white/70 hover:border-graphite",
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper" className="rounded-xl border-stone-200/80">
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function PropertyFilters({ cities, filters, resultCount, pending, onChange, onReset }: PropertyFiltersProps) {
  const cityOptions = [{ value: ANY, label: "All destinations" }, ...cities.map((c) => ({ value: c, label: c }))];
  const minOptions = [
    { value: ANY, label: "Min price" },
    ...PRICE_OPTIONS.map((p) => ({ value: String(p), label: `${formatPriceCompact(p)}+` })),
  ];
  const maxOptions = [
    { value: ANY, label: "Max price" },
    ...PRICE_OPTIONS.map((p) => ({ value: String(p), label: `Up to ${formatPriceCompact(p)}` })),
  ];
  const bedOptions = [
    { value: ANY, label: "Bedrooms" },
    ...BEDROOM_OPTIONS.map((b) => ({ value: String(b), label: `${b}+ beds` })),
  ];
  const sortOptions = SORT_OPTIONS.map((s) => ({ value: s.value, label: s.label }));

  const values = {
    city: filters.city ?? ANY,
    minPrice: filters.minPrice ? String(filters.minPrice) : ANY,
    maxPrice: filters.maxPrice ? String(filters.maxPrice) : ANY,
    beds: filters.beds ? String(filters.beds) : ANY,
    sort: filters.sort ?? "newest",
  };
  // Keep a non-listed city (e.g. from a shared URL) selectable.
  if (filters.city && !cities.includes(filters.city)) {
    cityOptions.push({ value: filters.city, label: filters.city });
  }

  const activeCount = [filters.city, filters.minPrice, filters.maxPrice, filters.beds].filter(Boolean).length;

  const fields = (compact: boolean) => (
    <>
      <FilterSelect
        compact={compact}
        id={`${compact ? "d" : "m"}-city`}
        label="Destination"
        value={values.city}
        onValueChange={(v) => onChange({ city: v })}
        options={cityOptions}
        className={compact ? "w-44" : undefined}
      />
      <FilterSelect
        compact={compact}
        id={`${compact ? "d" : "m"}-min`}
        label="Minimum price"
        value={values.minPrice}
        onValueChange={(v) => onChange({ minPrice: v })}
        options={minOptions}
        className={compact ? "w-32" : undefined}
      />
      <FilterSelect
        compact={compact}
        id={`${compact ? "d" : "m"}-max`}
        label="Maximum price"
        value={values.maxPrice}
        onValueChange={(v) => onChange({ maxPrice: v })}
        options={maxOptions}
        className={compact ? "w-36" : undefined}
      />
      <FilterSelect
        compact={compact}
        id={`${compact ? "d" : "m"}-beds`}
        label="Bedrooms"
        value={values.beds}
        onValueChange={(v) => onChange({ beds: v })}
        options={bedOptions}
        className={compact ? "w-32" : undefined}
      />
    </>
  );

  return (
    <div className="flex h-16 items-center justify-between gap-3">
      {/* Desktop / tablet inline filters */}
      <div className="hidden items-center gap-2.5 lg:flex">
        {fields(true)}
        {activeCount > 0 && (
          <Button
            variant="ghost"
            onClick={onReset}
            className="h-10 rounded-full px-3 text-[0.8rem] text-slate-500 hover:text-graphite"
          >
            <X className="size-3.5" />
            Clear
          </Button>
        )}
      </div>

      {/* Mobile filter drawer */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="h-10 rounded-full border-stone-200/90 bg-white px-4 text-[0.82rem] font-semibold lg:hidden"
          >
            <SlidersHorizontal className="size-4" />
            Filters
            {activeCount > 0 && (
              <span className="grid size-5 place-items-center rounded-full bg-graphite text-[0.65rem] text-white">
                {activeCount}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="max-h-[85dvh] rounded-t-[1.75rem] border-stone-200/80 bg-white p-0">
          <SheetHeader className="border-b border-stone-200/80 px-6 py-5 text-left">
            <SheetTitle className="font-serif text-2xl">Refine residences</SheetTitle>
            <SheetDescription>Filters apply instantly.</SheetDescription>
          </SheetHeader>
          <div className="grid gap-5 overflow-y-auto px-6 py-6">
            {fields(false)}
            <FilterSelect
              id="m-sort"
              label="Sort by"
              value={values.sort}
              onValueChange={(v) => onChange({ sort: v })}
              options={sortOptions}
            />
          </div>
          <SheetFooter className="flex-row gap-3 border-t border-stone-200/80 px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <Button variant="outline" onClick={onReset} className="h-12 flex-1 rounded-full">
              Reset
            </Button>
            <SheetClose asChild>
              <Button className="h-12 flex-[2] rounded-full bg-graphite text-white">
                Show {resultCount} {resultCount === 1 ? "residence" : "residences"}
              </Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <div className="flex items-center gap-3">
        <p className="hidden text-sm text-slate-500 lg:block xl:hidden 2xl:block" aria-live="polite">
          {pending ? "Updating…" : `${resultCount} ${resultCount === 1 ? "residence" : "residences"}`}
        </p>
        <FilterSelect
          compact
          id="sort"
          label="Sort by"
          value={values.sort}
          onValueChange={(v) => onChange({ sort: v })}
          options={sortOptions}
          className="w-44"
        />
      </div>
    </div>
  );
}
