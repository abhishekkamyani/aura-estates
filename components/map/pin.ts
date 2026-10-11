import L from "leaflet";

/** Graphite teardrop pin with a champagne-gold core. */
export function createPinIcon() {
  return L.divIcon({
    className: "aura-pin",
    html: '<span class="aura-pin__body"></span>',
    iconSize: [34, 34],
    iconAnchor: [17, 41],
  });
}
