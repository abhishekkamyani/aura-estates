const CUSTOM_TILE_URL = process.env.NEXT_PUBLIC_MAP_TILE_URL;

/**
 * Basemap tiles. Defaults to keyless OpenStreetMap tiles rendered through a
 * muted, warm-grey CSS filter (see `.aura-tiles-muted` in globals.css) so the
 * map matches the light luxury palette. For high-traffic production use, set
 * NEXT_PUBLIC_MAP_TILE_URL (and _ATTRIBUTION) to a keyed provider such as
 * Stadia Maps, MapTiler or CARTO.
 */
export const TILE_URL = CUSTOM_TILE_URL ?? "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

export const TILE_ATTRIBUTION =
  process.env.NEXT_PUBLIC_MAP_TILE_ATTRIBUTION ??
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/** Only the default OSM style needs muting; custom light styles are used as-is. */
export const TILE_CLASS_NAME = CUSTOM_TILE_URL ? undefined : "aura-tiles-muted";
