"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ImageCarouselProps {
  images: string[];
  alt: string;
  href?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** Rendered above the slides (badges, glare, etc). */
  overlay?: React.ReactNode;
}

export function ImageCarousel({
  images,
  alt,
  href,
  sizes = "(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw",
  priority = false,
  className,
  overlay,
}: ImageCarouselProps) {
  const slides = images.length > 0 ? images : [PLACEHOLDER_IMAGE];
  const [index, setIndex] = useState(0);
  const touchStart = useRef<number | null>(null);
  const count = slides.length;

  const go = useCallback(
    (delta: number) => setIndex((i) => (i + delta + count) % count),
    [count],
  );

  const stop = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const slide = (
    <AnimatePresence initial={false} mode="sync">
      <motion.div
        key={slides[index]}
        className="absolute inset-0"
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <Image
          src={slides[index]}
          alt={count > 1 ? `${alt} — photo ${index + 1} of ${count}` : alt}
          fill
          sizes={sizes}
          loading={priority && index === 0 ? "eager" : "lazy"}
          className="object-cover transition-transform duration-[1.4s] ease-luxe group-hover:scale-[1.04]"
          draggable={false}
        />
      </motion.div>
    </AnimatePresence>
  );

  return (
    <div
      className={cn("group/carousel relative overflow-hidden bg-stone-100", className)}
      onTouchStart={(e) => {
        touchStart.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        if (touchStart.current === null || count < 2) return;
        const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStart.current;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        touchStart.current = null;
      }}
    >
      {href ? (
        <Link href={href} aria-label={alt} className="absolute inset-0 block" tabIndex={-1}>
          {slide}
        </Link>
      ) : (
        slide
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/35 to-transparent" />

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              stop(e);
              go(-1);
            }}
            aria-label="Previous photo"
            className="absolute top-1/2 left-3 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-graphite opacity-0 shadow-lg shadow-slate-900/10 backdrop-blur transition-all duration-300 group-hover/carousel:opacity-100 hover:scale-105 hover:bg-white focus-visible:opacity-100 [@media(hover:none)]:opacity-90"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              stop(e);
              go(1);
            }}
            aria-label="Next photo"
            className="absolute top-1/2 right-3 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-graphite opacity-0 shadow-lg shadow-slate-900/10 backdrop-blur transition-all duration-300 group-hover/carousel:opacity-100 hover:scale-105 hover:bg-white focus-visible:opacity-100 [@media(hover:none)]:opacity-90"
          >
            <ChevronRight className="size-4" />
          </button>
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
            {slides.map((src, i) => (
              <button
                key={`${src}-${i}`}
                type="button"
                onClick={(e) => {
                  stop(e);
                  setIndex(i);
                }}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === index}
                className={cn(
                  "h-1.5 rounded-full bg-white/60 transition-all duration-500 ease-luxe",
                  i === index ? "w-5 bg-white" : "w-1.5 hover:bg-white/90",
                )}
              />
            ))}
          </div>
        </>
      )}

      {overlay}
    </div>
  );
}
