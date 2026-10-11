import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/home/SectionHeading";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { FeaturedPropertyCard } from "@/components/property/FeaturedPropertyCard";
import type { PropertyDTO } from "@/types/property";

export function FeaturedSection({ properties }: { properties: PropertyDTO[] }) {
  return (
    <section id="featured" aria-labelledby="featured-title" className="scroll-mt-24 bg-white py-24 lg:py-32">
      <div className="container-luxe">
        <Reveal>
          <SectionHeading
            id="featured-title"
            eyebrow="The Featured Collection"
            title={
              <>
                Exceptional homes,
                <br className="hidden sm:block" /> <em className="text-gold-deep italic">personally</em> curated
              </>
            }
            description="Each residence is visited, photographed and vetted by our partners before it joins the collection."
            action={
              <Link
                href="/properties"
                className="group inline-flex items-center gap-2 self-start text-sm font-semibold text-graphite md:self-auto"
              >
                <span className="border-b border-graphite/20 pb-1 transition-colors group-hover:border-gold">
                  View all residences
                </span>
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            }
          />
        </Reveal>

        {properties.length === 0 ? (
          <p className="mt-14 rounded-3xl border border-dashed border-stone-300 bg-alabaster p-10 text-center text-slate-500">
            The featured collection is being refreshed. Explore{" "}
            <Link href="/properties" className="font-semibold text-graphite underline-offset-4 hover:underline">
              all residences
            </Link>
            .
          </p>
        ) : (
          <RevealGroup className="mt-14 grid gap-8 md:grid-cols-2 xl:grid-cols-3 xl:gap-10" stagger={0.15}>
            {properties.map((property, i) => (
              <RevealItem key={property.id} className="h-full">
                <FeaturedPropertyCard property={property} priority={i === 0} />
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </div>
    </section>
  );
}
