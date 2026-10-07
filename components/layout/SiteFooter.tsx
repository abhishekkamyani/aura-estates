import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { siteConfig } from "@/lib/site";

const DESTINATIONS = ["Beverly Hills", "Malibu", "Miami Beach", "New York", "Aspen", "East Hampton"];

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-stone-200/80 bg-white">
      <div className="container-luxe grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div className="max-w-sm space-y-5">
          <Logo />
          <p className="text-sm leading-relaxed text-slate-600">{siteConfig.description}</p>
          <div className="gold-rule" />
        </div>

        <nav aria-label="Destinations" className="space-y-4">
          <h2 className="eyebrow font-sans">Destinations</h2>
          <ul className="space-y-2.5 text-sm">
            {DESTINATIONS.map((city) => (
              <li key={city}>
                <Link
                  href={`/properties?city=${encodeURIComponent(city)}`}
                  className="text-slate-600 transition-colors hover:text-graphite"
                >
                  {city}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Company" className="space-y-4">
          <h2 className="eyebrow font-sans">The Agency</h2>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="/properties" className="text-slate-600 transition-colors hover:text-graphite">
                All Residences
              </Link>
            </li>
            <li>
              <Link href="/#featured" className="text-slate-600 transition-colors hover:text-graphite">
                Featured Collection
              </Link>
            </li>
            <li>
              <Link href="/#private-office" className="text-slate-600 transition-colors hover:text-graphite">
                Private Office
              </Link>
            </li>
            <li>
              <Link href="/agency" className="text-slate-600 transition-colors hover:text-graphite">
                Agent Portal
              </Link>
            </li>
          </ul>
        </nav>

        <address className="space-y-4 text-sm not-italic">
          <h2 className="eyebrow font-sans">Head Office</h2>
          <p className="leading-relaxed text-slate-600">
            {siteConfig.address.street}
            <br />
            {siteConfig.address.city}, {siteConfig.address.region} {siteConfig.address.postalCode}
          </p>
          <p>
            <a
              href={`tel:${siteConfig.phone.replace(/[^+\d]/g, "")}`}
              className="font-semibold text-graphite"
            >
              {siteConfig.phone}
            </a>
            <br />
            <a href={`mailto:${siteConfig.email}`} className="text-slate-600 hover:text-graphite">
              {siteConfig.email}
            </a>
          </p>
        </address>
      </div>
      <div className="border-t border-stone-200/80">
        <div className="container-luxe flex flex-col gap-2 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.name}. All rights reserved. Equal Housing Opportunity.
          </p>
          <p>Information deemed reliable but not guaranteed.</p>
        </div>
      </div>
    </footer>
  );
}
