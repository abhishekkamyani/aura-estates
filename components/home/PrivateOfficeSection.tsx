import Link from "next/link";
import { ArrowRight, Mail, Phone } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

export function PrivateOfficeSection() {
  const tel = siteConfig.phone.replace(/[^+\d]/g, "");
  return (
    <section id="private-office" aria-labelledby="private-office-title" className="scroll-mt-24 py-24 lg:py-32">
      <div className="container-luxe">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.25rem] border border-stone-200/80 bg-white px-6 py-16 shadow-2xl shadow-stone-200/60 sm:px-12 lg:px-20 lg:py-20">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-gold-light/60 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-ivory blur-3xl"
            />
            <div className="relative grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:items-center">
              <div>
                <p className="eyebrow flex items-center gap-3">
                  <span className="gold-rule" aria-hidden="true" />
                  The Private Office
                </p>
                <h2
                  id="private-office-title"
                  className="mt-4 text-4xl leading-[1.05] font-medium sm:text-5xl lg:text-[3.4rem]"
                >
                  Begin a confidential <em className="text-gold-deep italic">conversation</em>
                </h2>
                <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                  Whether you are acquiring, selling or simply exploring the market, a senior advisor will
                  respond personally within the day.
                </p>
                <Button
                  asChild
                  className="group/cta mt-9 h-13 rounded-full bg-graphite px-7 text-sm font-semibold tracking-wide text-alabaster shadow-xl shadow-slate-900/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  <Link href="/properties">
                    Find a residence to view
                    <ArrowRight className="size-4 transition-transform group-hover/cta:translate-x-1" />
                  </Link>
                </Button>
              </div>

              <div className="space-y-4">
                <a
                  href={`tel:${tel}`}
                  className="group flex items-center gap-5 rounded-2xl border border-stone-200/80 bg-alabaster p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/50 hover:bg-white hover:shadow-lg hover:shadow-stone-200/60"
                >
                  <span className="grid size-12 place-items-center rounded-full bg-graphite text-gold">
                    <Phone className="size-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-[0.65rem] font-semibold tracking-[0.2em] text-slate-500 uppercase">
                      Call the desk
                    </span>
                    <span className="block text-lg font-semibold text-graphite">{siteConfig.phone}</span>
                  </span>
                </a>
                <a
                  href={`mailto:${siteConfig.email}?subject=${encodeURIComponent("Private consultation request")}`}
                  className="group flex items-center gap-5 rounded-2xl border border-stone-200/80 bg-alabaster p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/50 hover:bg-white hover:shadow-lg hover:shadow-stone-200/60"
                >
                  <span className="grid size-12 place-items-center rounded-full bg-graphite text-gold">
                    <Mail className="size-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.65rem] font-semibold tracking-[0.2em] text-slate-500 uppercase">
                      Write to us
                    </span>
                    <span className="block truncate text-lg font-semibold text-graphite">{siteConfig.email}</span>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
