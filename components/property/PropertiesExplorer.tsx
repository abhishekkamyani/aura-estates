"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { List, Map as MapIcon, SearchX } from "lucide-react";
import { PropertyMap } from "@/components/map/lazy";
import { PropertyCard } from "@/components/property/PropertyCard";
import { ANY, PropertyFilters, type FilterPatch } from "@/components/property/PropertyFilters";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import type { PropertyDTO, PropertyFilters as Filters } from "@/types/property";

interface PropertiesExplorerProps {
  properties: PropertyDTO[];
  cities: string[];
  filters: Filters;
}

/**
 * Split-screen search: results grid on the left and a sticky Leaflet map on
 * the right (desktop). On mobile the map becomes a toggleable full view.
 * Card hover ⇄ marker highlight are kept in sync through `activeId`.
 */
export function PropertiesExplorer({ properties, cities, filters }: PropertiesExplorerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "map">("list");
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const showMap = isDesktop || view === "map";

  const navigate = useCallback(
    (params: URLSearchParams) => {
      const qs = params.toString();
      startTransition(() => router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false }));
    },
    [pathname, router],
  );

  const handleChange = useCallback(
    (patch: FilterPatch) => {
      const next: Record<string, string | undefined> = {
        city: filters.city,
        minPrice: filters.minPrice?.toString(),
        maxPrice: filters.maxPrice?.toString(),
        beds: filters.beds?.toString(),
        sort: filters.sort,
        ...patch,
      };
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(next)) {
        if (value && value !== ANY && !(key === "sort" && value === "newest")) params.set(key, value);
      }
      navigate(params);
    },
    [filters, navigate],
  );

  const handleReset = useCallback(() => navigate(new URLSearchParams()), [navigate]);

  const handleMarkerSelect = useCallback(
    (id: string) => {
      setActiveId(id);
      if (isDesktop) {
        document.getElementById(`property-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    },
    [isDesktop],
  );

  return (
    <div className="relative">
      <div className="sticky top-(--header-height) z-30 border-b border-stone-200/80 bg-white/80 backdrop-blur-xl backdrop-saturate-150">
        <div className="container-luxe max-w-none">
          <PropertyFilters
            cities={cities}
            filters={filters}
            resultCount={properties.length}
            pending={pending}
            onChange={handleChange}
            onReset={handleReset}
          />
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(26rem,40%)] 2xl:grid-cols-[minmax(0,1fr)_minmax(32rem,44%)]">
        <section
          aria-label="Search results"
          aria-busy={pending}
          className={cn(
            "px-5 py-8 transition-opacity duration-300 sm:px-8 lg:py-10 lg:pr-6 lg:pl-12",
            pending && "pointer-events-none opacity-55",
            view === "map" && "hidden lg:block",
          )}
        >
          {properties.length === 0 ? (
            <div className="flex flex-col items-center rounded-[1.75rem] border border-dashed border-stone-300 bg-white px-6 py-20 text-center">
              <span className="grid size-14 place-items-center rounded-full bg-gold-soft text-gold-deep">
                <SearchX className="size-6" aria-hidden="true" />
              </span>
              <h2 className="mt-6 text-3xl font-medium">No residences match these criteria</h2>
              <p className="mt-3 max-w-md text-slate-600">
                Try widening your price range or exploring another destination. Our advisors also have access to
                off-market homes.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button onClick={handleReset} className="h-11 rounded-full bg-graphite px-6 text-white">
                  Clear all filters
                </Button>
                <Button asChild variant="outline" className="h-11 rounded-full px-6">
                  <Link href="/#private-office">Ask an advisor</Link>
                </Button>
              </div>
            </div>
          ) : (
            <motion.ul
              layout
              className="grid gap-6 sm:grid-cols-2 xl:gap-7 2xl:grid-cols-3"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
            >
              <AnimatePresence mode="popLayout">
                {properties.map((property, i) => (
                  <motion.li
                    key={property.id}
                    layout
                    variants={{
                      hidden: { opacity: 0, y: 24 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
                    }}
                    exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
                  >
                    <PropertyCard
                      property={property}
                      priority={i < 2}
                      active={activeId === property.id}
                      onHoverChange={setActiveId}
                    />
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          )}
        </section>

        <aside
          aria-label="Map of search results"
          className={cn(
            "lg:sticky lg:top-[calc(var(--header-height)+4rem)] lg:block lg:h-[calc(100dvh-var(--header-height)-4rem)] lg:py-4 lg:pr-4",
            view === "map" ? "block h-[calc(100dvh-var(--header-height)-4rem)] p-3" : "hidden",
          )}
        >
          <div className="relative isolate h-full overflow-hidden rounded-[1.5rem] border border-stone-200/80 bg-stone-100 shadow-xl shadow-stone-200/50">
            {showMap && (
              <PropertyMap
                properties={properties}
                activeId={activeId}
                onMarkerHover={setActiveId}
                onMarkerSelect={handleMarkerSelect}
              />
            )}
          </div>
        </aside>
      </div>

      {/* Mobile list ⇄ map toggle */}
      <div className="pointer-events-none fixed inset-x-0 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-40 flex justify-center lg:hidden">
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setView((v) => (v === "list" ? "map" : "list"));
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="pointer-events-auto inline-flex h-12 items-center gap-2 rounded-full bg-graphite px-6 text-sm font-semibold text-white shadow-2xl shadow-slate-900/30"
          aria-pressed={view === "map"}
        >
          {view === "list" ? <MapIcon className="size-4" /> : <List className="size-4" />}
          {view === "list" ? "Show map" : "Show list"}
        </motion.button>
      </div>
    </div>
  );
}
