"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ArrowUpRight, MapPin } from "lucide-react";
import { ImageCarousel } from "@/components/property/ImageCarousel";
import { PropertySpecs } from "@/components/property/PropertySpecs";
import { FeaturedBadge, StatusBadge } from "@/components/property/StatusBadge";
import { formatPrice } from "@/lib/format";
import type { PropertyDTO } from "@/types/property";

/** Shared card chrome for the featured card (static SSR fallback and 3D tilt version). */
export const FEATURED_CARD_SHELL =
  "group relative flex h-full flex-col rounded-[1.75rem] border border-stone-200/80 bg-white p-2.5 shadow-xl shadow-stone-200/50";

const layer = (z: number, enabled?: boolean): CSSProperties | undefined =>
  enabled ? { transform: `translateZ(${z}px)`, transformStyle: "preserve-3d" } : undefined;

interface FeaturedCardContentProps {
  property: PropertyDTO;
  priority?: boolean;
  /** When true, layers are lifted along the Z axis for the 3D tilt effect. */
  depth?: boolean;
  glare?: ReactNode;
}

export function FeaturedCardContent({ property, priority, depth, glare }: FeaturedCardContentProps) {
  const href = `/properties/${property.id}`;

  return (
    <>
      <div style={layer(36, depth)} className="relative">
        <ImageCarousel
          images={property.imageUrls}
          alt={`${property.title}, ${property.city}`}
          href={href}
          priority={priority}
          className="aspect-[4/3.1] rounded-[1.35rem]"
          overlay={
            <>
              <div className="pointer-events-none absolute top-4 left-4 z-10 flex flex-wrap gap-2">
                {property.featured && <FeaturedBadge />}
                {property.status !== "active" && <StatusBadge status={property.status} />}
              </div>
              {glare}
            </>
          }
        />
        <div
          style={layer(28, depth)}
          className="pointer-events-none absolute right-4 bottom-4 z-10 hidden rounded-full border border-white/40 bg-white/85 px-3 py-1.5 text-[0.72rem] font-semibold tracking-wide text-graphite shadow-lg shadow-slate-900/10 backdrop-blur-md sm:block"
        >
          {property.city}
        </div>
      </div>

      <div style={layer(22, depth)} className="flex flex-1 flex-col px-3.5 pt-5 pb-3">
        <p className="eyebrow">{property.city}</p>
        <h3 className="mt-2 font-serif text-[1.65rem] leading-tight font-semibold">
          <Link href={href} className="transition-colors hover:text-gold-deep focus-visible:outline-none">
            {property.title}
          </Link>
        </h3>
        <p className="mt-1.5 flex items-start gap-1.5 text-sm text-slate-500">
          <MapPin className="mt-0.5 size-3.5 shrink-0 text-slate-400" aria-hidden="true" />
          <span className="line-clamp-1">{property.address}</span>
        </p>

        <PropertySpecs property={property} className="mt-5 border-t border-stone-200/80 pt-4" />

        <div className="mt-auto flex items-end justify-between gap-4 pt-5">
          <div>
            <p className="text-[0.68rem] font-semibold tracking-[0.2em] text-slate-400 uppercase">
              Offered at
            </p>
            <p className="font-serif text-2xl font-semibold text-graphite">{formatPrice(property.price)}</p>
          </div>
          <Link
            href={href}
            aria-label={`View ${property.title}`}
            className="grid size-11 place-items-center rounded-full border border-stone-200 text-graphite transition-all duration-500 ease-luxe group-hover:border-graphite group-hover:bg-graphite group-hover:text-white"
          >
            <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:rotate-45" />
          </Link>
        </div>
      </div>
    </>
  );
}
