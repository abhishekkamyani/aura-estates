"use client";

import "leaflet/dist/leaflet.css";
import { useMemo } from "react";
import { MapContainer, Marker, TileLayer, ZoomControl } from "react-leaflet";
import { createPinIcon } from "@/components/map/pin";
import { TILE_ATTRIBUTION, TILE_CLASS_NAME, TILE_URL } from "@/components/map/tiles";

export interface LocationMapProps {
  lat: number;
  lng: number;
  label: string;
  zoom?: number;
}

/** Static-feeling single-residence map for the property detail page. */
export default function LocationMap({ lat, lng, label, zoom = 13 }: LocationMapProps) {
  const icon = useMemo(() => createPinIcon(), []);
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={zoom}
      zoomControl={false}
      scrollWheelZoom={false}
      className="h-full w-full rounded-[inherit]"
      aria-label={`Map showing the location of ${label}`}
    >
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} className={TILE_CLASS_NAME} maxZoom={19} />
      <ZoomControl position="bottomright" />
      <Marker position={[lat, lng]} icon={icon} title={label} alt={label} keyboard={false} />
    </MapContainer>
  );
}
