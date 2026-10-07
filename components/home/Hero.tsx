"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import { HeroSearch } from "@/components/home/HeroSearch";
import { AnimatedCounter } from "@/components/motion/AnimatedCounter";
import { Button } from "@/components/ui/button";
import { formatPrice, formatPriceCompact } from "@/lib/format";
import { siteConfig } from "@/lib/site";
import type { PropertyDTO } from "@/types/property";

const EASE = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
};

interface HeroProps {
  cities: string[];
  stats: { listings: number; totalValue: number; cities: number };
  spotlight: PropertyDTO | null;
}

export function Hero({ cities, stats, spotlight }: HeroProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  const counters = [
    { value: stats.totalValue, format: (v: number) => formatPriceCompact(v), label: "Portfolio value" },
    { value: stats.listings, format: (v: number) => `${Math.round(v)}`, label: "Private listings" },
    { value: stats.cities, format: (v: number) => `${Math.round(v)}`, label: "Destinations" },
  ];

  return (
    <section ref={ref} aria-labelledby="hero-title" className="relative overflow-hidden pb-16 lg:pb-24">
      {/* Ambient champagne glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-[-10%] h-[38rem] w-[38rem] rounded-full bg-gold-light/50 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 -left-40 h-[26rem] w-[26rem] rounded-full bg-white blur-3xl"
      />

      <div className="container-luxe relative grid items-center gap-12 pt-8 sm:pt-12 lg:grid-cols-12 lg:gap-10 lg:pt-14">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="lg:col-span-5 xl:col-span-5"
        >
          <motion.p variants={item} className="eyebrow inline-flex items-center gap-2.5">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-gold" />
            </span>
            The Private Collection · 2026
          </motion.p>

          <motion.h1
            id="hero-title"
            variants={item}
            className="mt-6 text-[3.1rem] leading-[0.95] font-medium sm:text-7xl xl:text-[5.6rem]"
          >
            Residences of <em className="font-serif text-gold-deep italic">rare</em> distinction
          </motion.h1>

          <motion.p variants={item} className="mt-7 max-w-md text-base leading-relaxed text-slate-600 sm:text-lg">
            From cliffside villas in Malibu to sky lofts above Tribeca, Aura Estates discreetly represents a
            portfolio of the world&apos;s most considered homes.
          </motion.p>

          <motion.div variants={item} className="mt-9 flex flex-wrap items-center gap-3">
            <Button
              asChild
              className="group/cta h-13 rounded-full bg-graphite px-7 text-sm font-semibold tracking-wide text-alabaster shadow-xl shadow-slate-900/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-2xl"
            >
              <Link href="/properties">
                Explore residences
                <ArrowRight className="size-4 transition-transform duration-300 group-hover/cta:translate-x-1" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-13 rounded-full border-stone-300/80 bg-white/70 px-7 text-sm font-semibold tracking-wide text-graphite backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-gold hover:bg-white"
            >
              <Link href="/#private-office">Private consultation</Link>
            </Button>
          </motion.div>

          <motion.dl variants={item} className="mt-12 flex flex-wrap gap-3">
            {counters.map((c) => (
              <div
                key={c.label}
                className="flex min-w-[8.5rem] flex-col rounded-2xl border border-stone-200/80 bg-white/80 px-4 py-3 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-md"
              >
                <dt className="order-2 text-[0.65rem] font-semibold tracking-[0.18em] text-slate-500 uppercase">
                  {c.label}
                </dt>
                <dd className="order-1 font-serif text-[1.9rem] leading-none font-semibold text-graphite">
                  <AnimatedCounter value={c.value} format={c.format} />
                </dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        <div className="relative lg:col-span-7 xl:col-span-7">
          <motion.div
            initial={{ clipPath: "inset(8% 8% 8% 8% round 2rem)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0% round 2rem)" }}
            transition={{ duration: 1.4, ease: EASE, delay: 0.1 }}
            className="relative aspect-[4/4.6] overflow-hidden rounded-[2rem] shadow-2xl shadow-stone-300/50 sm:aspect-[16/12] lg:aspect-[4/4.3]"
          >
            <motion.div style={{ y: imageY, scale: imageScale }} className="absolute inset-[-6%_0_-6%_0]">
              <Image
                src={siteConfig.heroImage}
                alt="White contemporary villa with an infinity pool and timber-clad terraces"
                fill
                preload
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="object-cover"
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/25 via-transparent to-transparent" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.9, delay: 0.9, ease: EASE }}
            className="absolute -top-3 right-4 hidden items-center gap-2 rounded-full border border-stone-200/80 bg-white/90 px-4 py-2 text-xs font-semibold text-graphite shadow-xl shadow-stone-300/40 backdrop-blur sm:flex lg:-right-3"
          >
            <Sparkles className="size-3.5 text-gold" aria-hidden="true" />
            Off-market access
          </motion.div>

          {spotlight && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 1.05, ease: EASE }}
              className="absolute bottom-5 left-5 right-5 sm:right-auto sm:bottom-8 sm:left-8 lg:-left-6"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <Link
                  href={`/properties/${spotlight.id}`}
                  className="group flex items-center gap-4 rounded-2xl border border-white/60 bg-white/85 p-3 pr-5 shadow-2xl shadow-slate-900/15 backdrop-blur-xl transition-colors hover:bg-white sm:max-w-sm"
                >
                  <span className="relative size-16 shrink-0 overflow-hidden rounded-xl">
                    <Image
                      src={spotlight.imageUrls[1] ?? spotlight.imageUrls[0]}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.62rem] font-semibold tracking-[0.22em] text-gold-deep uppercase">
                      Spotlight · {spotlight.city}
                    </span>
                    <span className="block truncate font-serif text-lg font-semibold text-graphite">
                      {spotlight.title}
                    </span>
                    <span className="block text-sm font-semibold text-slate-600">{formatPrice(spotlight.price)}</span>
                  </span>
                  <ArrowUpRight className="size-5 shrink-0 text-slate-400 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-graphite" />
                </Link>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="container-luxe relative z-10 mt-10 lg:mt-14">
        <div className="mx-auto max-w-5xl">
          <HeroSearch cities={cities} />
        </div>
      </div>
    </section>
  );
}
