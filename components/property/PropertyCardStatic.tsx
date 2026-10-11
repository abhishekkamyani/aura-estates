"use client";

import { FEATURED_CARD_SHELL, FeaturedCardContent } from "@/components/property/FeaturedCardContent";
import type { PropertyDTO } from "@/types/property";

/**
 * Server-rendered, non-3D version of the featured card. It is used as the
 * SSR/loading fallback for the 3D tilt card so crawlers and no-JS visitors
 * still receive complete, semantic listing markup.
 */
export function PropertyCardStatic({ property, priority }: { property: PropertyDTO; priority?: boolean }) {
  return (
    <article className={FEATURED_CARD_SHELL} aria-label={property.title}>
      <FeaturedCardContent property={property} priority={priority} />
    </article>
  );
}
