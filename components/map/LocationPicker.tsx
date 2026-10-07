"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo } from "react";
import { MapContainer, Marker, TileLayer, ZoomControl, useMap, useMapEvents } from "react-leaflet";
import { createPinIcon } from "@/components/map/pin";
import { TILE_ATTRIBUTION, TILE_CLASS_NAME, TILE_URL } from "@/components/map/tiles";

export interface LocationPickerProps {
  lat: number | null;
  lng: number | null;
  onChange: (coords: { lat: number; lng: number }) => void;
}

const DEFAULT_CENTER: L.LatLngTuple = [37.8, -96];

function ClickToPlace({ onChange }: Pick<LocationPickerProps, "onChange">) {
  useMapEvents({
    click(e) {
      onChange({ lat: round(e.latlng.lat), lng: round(e.latlng.lng) });
    },
  });
  return null;
}

/** Pans to externally-updated coordinates (e.g. typed in or geocoded). */
function FollowCoords({ lat, lng }: { lat: number | null; lng: number | null }) {
  const map = useMap();
  useEffect(() => {
    if (lat === null || lng === null) return;
    const target = L.latLng(lat, lng);
    if (!map.getBounds().pad(-0.2).contains(target)) {
      map.flyTo(target, Math.max(map.getZoom(), 12), { duration: 0.6 });
    }
  }, [lat, lng, map]);

  useEffect(() => {
    // The picker lives inside a dialog that animates in; recompute size once visible.
    const t = window.setTimeout(() => map.invalidateSize(), 250);
    return () => window.clearTimeout(t);
  }, [map]);
  return null;
}

function round(n: number) {
  return Math.round(n * 1e6) / 1e6;
}

/** Click (or drag the pin) to set a listing's coordinates. */
export default function LocationPicker({ lat, lng, onChange }: LocationPickerProps) {
  const icon = useMemo(() => createPinIcon(), []);
  const hasPoint = lat !== null && lng !== null;

  return (
    <MapContainer
      center={hasPoint ? [lat, lng] : DEFAULT_CENTER}
      zoom={hasPoint ? 12 : 3}
      zoomControl={false}
      scrollWheelZoom
      className="h-full w-full rounded-[inherit]"
      aria-label="Pick the property location"
    >
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} className={TILE_CLASS_NAME} maxZoom={19} />
      <ZoomControl position="bottomright" />
      <ClickToPlace onChange={onChange} />
      <FollowCoords lat={lat} lng={lng} />
      {hasPoint && (
        <Marker
          position={[lat, lng]}
          icon={icon}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const p = (e.target as L.Marker).getLatLng();
              onChange({ lat: round(p.lat), lng: round(p.lng) });
            },
          }}
        />
      )}
    </MapContainer>
  );
}
