"use client";

import Link from "next/link";
import { forwardRef } from "react";
import { MapPin } from "lucide-react";
import { ImageCarousel } from "@/components/property/ImageCarousel";
import { PropertySpecs } from "@/components/property/PropertySpecs";
import { FeaturedBadge, StatusBadge } from "@/components/property/StatusBadge";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PropertyDTO } from "@/types/property";

interface PropertyCardProps {
  property: PropertyDTO;
  active?: boolean;
  priority?: boolean;
  onHoverChange?: (id: string | null) => void;
}

/** Listing card used in the search grid; highlights in sync with its map marker. */
export const PropertyCard = forwardRef<HTMLElement, PropertyCardProps>(function PropertyCard(
  { property, active = false, priority = false, onHoverChange },
  ref,
) {
  const href = `/properties/${property.id}`;
  return (
    <article
      ref={ref}
      id={`property-${property.id}`}
      aria-label={property.title}
      onMouseEnter={() => onHoverChange?.(property.id)}
      onMouseLeave={() => onHoverChange?.(null)}
      onFocus={() => onHoverChange?.(property.id)}
      className={cn(
        "group relative flex scroll-mt-40 flex-col rounded-[1.5rem] border bg-white p-2 transition-all duration-500 ease-luxe",
        active
          ? "-translate-y-1 border-gold/60 shadow-xl shadow-gold/15 ring-1 ring-gold/40"
          : "border-stone-200/80 shadow-sm hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-200/60",
      )}
    >
      <ImageCarousel
        images={property.imageUrls}
        alt={`${property.title}, ${property.city}`}
        href={href}
        priority={priority}
        sizes="(min-width: 1536px) 22vw, (min-width: 1024px) 28vw, (min-width: 640px) 50vw, 100vw"
        className="aspect-[4/3] rounded-[1.1rem]"
        overlay={
          <div className="pointer-events-none absolute top-3 left-3 z-10 flex flex-wrap gap-2">
            {property.featured && <FeaturedBadge />}
            {property.status !== "active" && <StatusBadge status={property.status} />}
          </div>
        }
      />
      <div className="flex flex-1 flex-col px-3 pt-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <p className="font-serif text-[1.6rem] leading-none font-semibold text-graphite">
            {formatPrice(property.price)}
          </p>
          <span className="eyebrow mt-1 shrink-0 text-[0.62rem]">{property.city}</span>
        </div>
        <h3 className="mt-2.5 font-sans text-base leading-snug font-semibold tracking-normal text-graphite">
          <Link href={href} className="hover:text-gold-deep">
            {property.title}
          </Link>
        </h3>
        <p className="mt-1 flex items-start gap-1.5 text-[0.82rem] text-slate-500">
          <MapPin className="mt-0.5 size-3.5 shrink-0 text-slate-400" aria-hidden="true" />
          <span className="line-clamp-1">{property.address}</span>
        </p>
        <PropertySpecs property={property} className="mt-4 gap-x-4 border-t border-stone-200/80 pt-3.5 text-[0.82rem]" />
      </div>
    </article>
  );
});
