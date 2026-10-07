"use client";

import dynamic from "next/dynamic";
import { createContext, useContext } from "react";
import { PropertyCardStatic } from "@/components/property/PropertyCardStatic";
import type { PropertyDTO } from "@/types/property";

type CardProps = { property: PropertyDTO; priority?: boolean };

// next/dynamic's `loading` component receives no props, so the card data is
// handed to the fallback through context. The fallback is what the server
// renders, which keeps the featured listings fully crawlable.
const FallbackContext = createContext<CardProps | null>(null);

function TiltCardFallback() {
  const props = useContext(FallbackContext);
  return props ? <PropertyCardStatic {...props} /> : null;
}

/** The 3D tilt card touches `window`-dependent pointer APIs, so it is client-only. */
const TiltPropertyCard3D = dynamic(() => import("@/components/property/TiltPropertyCard3D"), {
  ssr: false,
  loading: TiltCardFallback,
});

export function FeaturedPropertyCard(props: CardProps) {
  return (
    <FallbackContext.Provider value={props}>
      <TiltPropertyCard3D {...props} />
    </FallbackContext.Provider>
  );
}
