import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/home/SectionHeading";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { formatPriceCompact, sizedImage } from "@/lib/format";
import { cityPath } from "@/lib/routes";
import type { DestinationSummary } from "@/lib/properties";

export function DestinationsSection({ destinations }: { destinations: DestinationSummary[] }) {
  if (destinations.length === 0) return null;
  return (
    <section
      id="destinations"
      aria-labelledby="destinations-title"
      className="scroll-mt-24 border-y border-stone-200/80 bg-ivory/60 py-24 lg:py-32"
    >
      <div className="container-luxe">
        <Reveal>
          <SectionHeading
            id="destinations-title"
            eyebrow="Destinations"
            title={
              <>
                Where our clients <em className="text-gold-deep italic">live</em>
              </>
            }
            description="From the Pacific bluffs to the Rocky Mountains, explore residences by destination."
          />
        </Reveal>

        <RevealGroup
          stagger={0.08}
          className="no-scrollbar -mx-5 mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3"
        >
          {destinations.map((d) => (
            <RevealItem key={d.city} className="w-[78vw] shrink-0 snap-start sm:w-auto">
              <Link
                href={cityPath(d.city)}
                className="group relative block aspect-[4/3.2] overflow-hidden rounded-[1.75rem] shadow-lg shadow-stone-300/40"
              >
                <Image
                  src={sizedImage(d.image ?? PLACEHOLDER_IMAGE, 1200)}
                  alt={`Luxury residences in ${d.city}`}
                  fill
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 78vw"
                  className="object-cover transition-transform duration-[1.6s] ease-luxe group-hover:scale-[1.07]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
                  <div>
                    <h3 className="font-serif text-3xl font-medium text-white">{d.city}</h3>
                    <p className="mt-1 text-sm text-white/80">
                      {d.count} {d.count === 1 ? "residence" : "residences"} · from {formatPriceCompact(d.fromPrice)}
                    </p>
                  </div>
                  <span className="grid size-11 place-items-center rounded-full bg-white/90 text-graphite backdrop-blur transition-all duration-500 ease-luxe group-hover:rotate-45 group-hover:bg-gold group-hover:text-white">
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
