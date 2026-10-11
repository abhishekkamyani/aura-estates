import Image from "next/image";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { siteConfig } from "@/lib/site";

const PILLARS = [
  {
    title: "Absolute discretion",
    body: "Off-market introductions, NDAs as standard, and viewings arranged entirely around your schedule.",
  },
  {
    title: "Verified provenance",
    body: "Architectural history, title and disclosures reviewed by our in-house counsel before a home is listed.",
  },
  {
    title: "White-glove concierge",
    body: "Private aviation, design consultants and relocation partners coordinated by a single advisor.",
  },
];

export function EditorialSection() {
  return (
    <section aria-labelledby="standard-title" className="relative overflow-hidden py-24 lg:py-32">
      <div className="container-luxe grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
        <Reveal className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-2xl shadow-stone-300/50">
            <Image
              src={siteConfig.editorialImage}
              alt="Sunlit living room with a sculptural sofa and warm timber wall"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -right-4 -bottom-8 hidden w-[46%] overflow-hidden rounded-[1.5rem] border-[6px] border-alabaster shadow-2xl shadow-stone-300/60 sm:block lg:-right-12">
            <div className="relative aspect-square">
              <Image
                src={siteConfig.editorialInsetImage}
                alt="Contemporary timber and glass residence beneath a mature tree"
                fill
                sizes="(min-width: 1024px) 20vw, 40vw"
                className="object-cover"
              />
            </div>
          </div>
          <div
            aria-hidden="true"
            className="absolute -top-6 -left-6 -z-10 h-40 w-40 rounded-[2rem] border border-gold/40"
          />
        </Reveal>

        <div>
          <Reveal>
            <p className="eyebrow flex items-center gap-3">
              <span className="gold-rule" aria-hidden="true" />
              The Aura Standard
            </p>
            <h2 id="standard-title" className="mt-4 text-4xl leading-[1.05] font-medium sm:text-5xl lg:text-[3.5rem]">
              Real estate, practised as a <em className="text-gold-deep italic">private</em> art
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              For over two decades our advisors have quietly guided families, founders and collectors through
              some of the most significant residential acquisitions in America.
            </p>
          </Reveal>

          <RevealGroup className="mt-12 space-y-2" stagger={0.14}>
            {PILLARS.map((pillar, i) => (
              <RevealItem key={pillar.title}>
                <div className="group flex gap-6 rounded-2xl border border-transparent p-5 transition-all duration-500 hover:border-stone-200/80 hover:bg-white hover:shadow-xl hover:shadow-stone-200/50">
                  <span className="font-serif text-3xl font-semibold text-gold">0{i + 1}</span>
                  <div>
                    <h3 className="font-sans text-lg font-semibold tracking-normal text-graphite">{pillar.title}</h3>
                    <p className="mt-1.5 leading-relaxed text-slate-600">{pillar.body}</p>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
