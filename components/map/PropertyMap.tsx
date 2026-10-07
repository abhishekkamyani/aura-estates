"use client";

import "leaflet/dist/leaflet.css";
import Image from "next/image";
import Link from "next/link";
import L from "leaflet";
import { useEffect, useMemo, useRef } from "react";
import { MapContainer, Marker, Popup, TileLayer, ZoomControl, useMap } from "react-leaflet";
import { ArrowUpRight } from "lucide-react";
import { TILE_ATTRIBUTION, TILE_CLASS_NAME, TILE_URL } from "@/components/map/tiles";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { formatNumber, formatPrice, formatPriceCompact } from "@/lib/format";
import type { PropertyDTO } from "@/types/property";

export interface PropertyMapProps {
  properties: PropertyDTO[];
  activeId?: string | null;
  onMarkerHover?: (id: string | null) => void;
  onMarkerSelect?: (id: string) => void;
}

const US_CENTER: L.LatLngTuple = [37.8, -96];

function createPriceIcon(price: number) {
  return L.divIcon({
    className: "aura-marker",
    html: `<span class="aura-marker__pill"><span class="aura-marker__dot"></span>${formatPriceCompact(price)}</span>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -44],
  });
}

/** Re-frames the map whenever the result set changes. */
function FitToResults({ properties }: { properties: PropertyDTO[] }) {
  const map = useMap();
  const signature = properties.map((p) => p.id).join(",");

  useEffect(() => {
    if (properties.length === 0) return;
    if (properties.length === 1) {
      map.flyTo([properties[0].lat, properties[0].lng], 12, { duration: 0.8 });
      return;
    }
    const bounds = L.latLngBounds(properties.map((p) => [p.lat, p.lng] as L.LatLngTuple));
    map.flyToBounds(bounds, { padding: [70, 70], maxZoom: 12, duration: 0.8 });
    // Only re-run when the set of listings changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, signature]);

  return null;
}

/** Keeps Leaflet's internal size in sync when the container is shown/resized. */
function AutoResize() {
  const map = useMap();
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize({ animate: false }));
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}

function PriceMarker({
  property,
  active,
  onHover,
  onSelect,
}: {
  property: PropertyDTO;
  active: boolean;
  onHover?: (id: string | null) => void;
  onSelect?: (id: string) => void;
}) {
  const markerRef = useRef<L.Marker>(null);
  const icon = useMemo(() => createPriceIcon(property.price), [property.price]);

  // Toggle the highlight class in place so the CSS transition animates smoothly.
  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;
    marker.getElement()?.classList.toggle("is-active", active);
    marker.setZIndexOffset(active ? 1000 : 0);
  }, [active]);

  const eventHandlers = useMemo<L.LeafletEventHandlerFnMap>(
    () => ({
      mouseover: () => onHover?.(property.id),
      mouseout: () => onHover?.(null),
      click: () => onSelect?.(property.id),
      add: (e) => {
        (e.target as L.Marker).getElement()?.classList.toggle("is-active", active);
      },
    }),
    // `active` is read at mount time only; later changes go through the effect above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onHover, onSelect, property.id],
  );

  return (
    <Marker
      ref={markerRef}
      position={[property.lat, property.lng]}
      icon={icon}
      keyboard
      title={`${property.title} — ${formatPrice(property.price)}`}
      alt={`${property.title} — ${formatPrice(property.price)}`}
      eventHandlers={eventHandlers}
    >
      <Popup autoPanPadding={[48, 48]} minWidth={240} maxWidth={240}>
        <div className="font-sans">
          <div className="relative h-36 w-full bg-stone-100">
            <Image
              src={property.imageUrls[0] ?? PLACEHOLDER_IMAGE}
              alt={property.title}
              fill
              sizes="240px"
              className="object-cover"
            />
          </div>
          <div className="space-y-1.5 p-3.5">
            <p className="text-[0.62rem] font-semibold tracking-[0.24em] text-gold-deep uppercase">
              {property.city}
            </p>
            <p className="font-serif text-lg leading-tight font-semibold text-graphite">{property.title}</p>
            <p className="text-xs text-slate-500">
              {property.bedrooms} bd · {property.bathrooms} ba · {formatNumber(property.sqft)} sq ft
            </p>
            <div className="flex items-center justify-between pt-1.5">
              <span className="text-sm font-bold text-graphite">{formatPrice(property.price)}</span>
              <Link
                href={`/properties/${property.id}`}
                className="inline-flex items-center gap-1 text-xs font-semibold !text-gold-deep hover:underline"
              >
                View <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

export default function PropertyMap({ properties, activeId, onMarkerHover, onMarkerSelect }: PropertyMapProps) {
  const initialCenter: L.LatLngTuple = properties[0] ? [properties[0].lat, properties[0].lng] : US_CENTER;

  return (
    <MapContainer
      center={initialCenter}
      zoom={properties.length ? 5 : 4}
      minZoom={3}
      zoomControl={false}
      scrollWheelZoom
      worldCopyJump
      className="h-full w-full rounded-[inherit]"
      aria-label="Map of listed residences"
    >
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} className={TILE_CLASS_NAME} maxZoom={19} />
      <ZoomControl position="bottomright" />
      <AutoResize />
      <FitToResults properties={properties} />
      {properties.map((property) => (
        <PriceMarker
          key={property.id}
          property={property}
          active={activeId === property.id}
          onHover={onMarkerHover}
          onSelect={onMarkerSelect}
        />
      ))}
    </MapContainer>
  );
}
