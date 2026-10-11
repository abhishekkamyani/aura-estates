"use client";

import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";

function MapSkeleton() {
  return (
    <div className="skeleton-shimmer grid h-full w-full place-items-center rounded-[inherit]" role="status">
      <span className="inline-flex items-center gap-2 text-xs font-medium tracking-wide text-slate-400">
        <MapPin className="size-4" aria-hidden="true" />
        Loading map…
      </span>
    </div>
  );
}

// Leaflet accesses `window` at import time, so every map is client-only (ssr: false).
export const PropertyMap = dynamic(() => import("@/components/map/PropertyMap"), {
  ssr: false,
  loading: MapSkeleton,
});

export const LocationMap = dynamic(() => import("@/components/map/LocationMap"), {
  ssr: false,
  loading: MapSkeleton,
});

export const LocationPicker = dynamic(() => import("@/components/map/LocationPicker"), {
  ssr: false,
  loading: MapSkeleton,
});
