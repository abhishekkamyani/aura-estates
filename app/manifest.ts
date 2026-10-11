import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: "Aura",
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#fcfbf9",
    theme_color: "#fcfbf9",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
