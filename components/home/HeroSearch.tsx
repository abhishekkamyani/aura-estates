"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { BedDouble, Loader2, MapPin, Search, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ANY = "any";

const PRICE_RANGES = [
  { value: ANY, label: "Any price" },
  { value: "1000000-5000000", label: "$1M – $5M" },
  { value: "5000000-10000000", label: "$5M – $10M" },
  { value: "10000000-20000000", label: "$10M – $20M" },
  { value: "20000000-", label: "$20M +" },
];

const BEDROOMS = [
  { value: ANY, label: "Any bedrooms" },
  ...[2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: `${n}+ bedrooms` })),
];

const triggerClass =
  "h-auto w-full border-0 bg-transparent p-0 text-[0.95rem] font-semibold text-graphite shadow-none focus-visible:ring-0 data-placeholder:text-graphite [&>svg]:text-slate-400";

export function HeroSearch({ cities }: { cities: string[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [city, setCity] = useState(ANY);
  const [price, setPrice] = useState(ANY);
  const [beds, setBeds] = useState(ANY);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city !== ANY) params.set("city", city);
    if (price !== ANY) {
      const [min, max] = price.split("-");
      if (min) params.set("minPrice", min);
      if (max) params.set("maxPrice", max);
    }
    if (beds !== ANY) params.set("beds", beds);
    const qs = params.toString();
    startTransition(() => router.push(`/properties${qs ? `?${qs}` : ""}`));
  }

  const fields = [
    {
      id: "hero-city",
      label: "Destination",
      icon: MapPin,
      value: city,
      onChange: setCity,
      options: [{ value: ANY, label: "All destinations" }, ...cities.map((c) => ({ value: c, label: c }))],
    },
    { id: "hero-price", label: "Price range", icon: Wallet, value: price, onChange: setPrice, options: PRICE_RANGES },
    { id: "hero-beds", label: "Bedrooms", icon: BedDouble, value: beds, onChange: setBeds, options: BEDROOMS },
  ];

  return (
    <motion.form
      role="search"
      aria-label="Search residences"
      onSubmit={onSubmit}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
      className="relative grid gap-1 rounded-[1.75rem] border border-stone-200/80 bg-white/95 p-2 shadow-2xl shadow-stone-300/40 backdrop-blur-xl md:grid-cols-[1fr_1fr_1fr_auto] md:items-center"
    >
      {fields.map(({ id, label, icon: Icon, value, onChange, options }, i) => (
        <div
          key={id}
          className="group relative flex items-center gap-3.5 rounded-[1.25rem] px-4 py-3 transition-colors hover:bg-alabaster md:px-5"
        >
          {i > 0 && (
            <span className="absolute top-1/2 left-0 hidden h-10 w-px -translate-y-1/2 bg-stone-200 md:block" />
          )}
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gold-soft text-gold-deep">
            <Icon className="size-[1.1rem]" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <label htmlFor={id} className="block text-[0.65rem] font-semibold tracking-[0.2em] text-slate-400 uppercase">
              {label}
            </label>
            <Select value={value} onValueChange={onChange}>
              <SelectTrigger id={id} className={triggerClass}>
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
        </div>
      ))}
      <Button
        type="submit"
        disabled={pending}
        className="group/search h-14 rounded-[1.25rem] bg-graphite px-8 text-sm font-semibold tracking-wide text-alabaster shadow-lg shadow-slate-900/15 transition-all duration-300 hover:bg-slate-800 hover:shadow-xl md:h-[4.25rem]"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4 transition-transform group-hover/search:scale-110" />}
        Search
      </Button>
    </motion.form>
  );
}
