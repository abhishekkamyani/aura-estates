import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Curated listing photography used by the seed data.
      { protocol: "https", hostname: "images.unsplash.com" },
      // UploadThing file hosts (legacy + current per-app subdomains).
      { protocol: "https", hostname: "utfs.io", pathname: "/f/**" },
      { protocol: "https", hostname: "*.ufs.sh", pathname: "/f/**" },
    ],
  },
};

export default nextConfig;
