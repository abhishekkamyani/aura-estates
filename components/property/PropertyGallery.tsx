"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Grid2x2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface PropertyGalleryProps {
  images: string[];
  title: string;
}

/** Editorial mosaic with a full-screen lightbox (keyboard + swipe navigable). */
export function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const photos = images.length ? images : [PLACEHOLDER_IMAGE];
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const count = photos.length;

  const openAt = (i: number) => {
    setIndex(i);
    setOpen(true);
  };
  const go = useCallback(
    (delta: number) => {
      setDirection(delta);
      setIndex((i) => (i + delta + count) % count);
    },
    [count],
  );

  const side = photos.slice(1, 5);
  const mosaic = count >= 5;

  const tileClass =
    "group relative block overflow-hidden bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";

  return (
    <>
      <div
        className={cn(
          "grid gap-2 sm:gap-3",
          count === 1 && "grid-cols-1",
          count > 1 && !mosaic && "md:h-[32rem] md:grid-cols-4 md:grid-rows-2",
          mosaic && "md:h-[34rem] md:grid-cols-4 md:grid-rows-2 lg:h-[38rem]",
        )}
      >
        <button
          type="button"
          onClick={() => openAt(0)}
          className={cn(
            tileClass,
            "aspect-[4/3] rounded-[1.5rem] md:aspect-auto",
            count === 1 && "md:aspect-[16/8]",
            count > 1 && !mosaic && "md:col-span-3 md:row-span-2 md:rounded-r-lg",
            mosaic && "md:col-span-2 md:row-span-2 md:rounded-r-lg",
          )}
          aria-label={`Open gallery — ${title}, image 1 of ${count}`}
        >
          <Image
            src={photos[0]}
            alt={`${title} — main image`}
            fill
            preload
            sizes="(min-width: 768px) 60vw, 100vw"
            className="object-cover transition-transform duration-[1.4s] ease-luxe group-hover:scale-[1.03]"
          />
          <span className="absolute right-4 bottom-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-graphite shadow-lg backdrop-blur md:hidden">
            <Grid2x2 className="size-3.5" /> {count} images
          </span>
        </button>

        {(mosaic ? side : side.slice(0, 2)).map((src, i) => {
          const position = i + 1;
          const isLast = mosaic ? i === side.length - 1 : i === Math.min(side.length, 2) - 1;
          const rounded = mosaic
            ? cn("md:rounded-lg", i === 1 && "md:rounded-tr-[1.5rem]", i === 3 && "md:rounded-br-[1.5rem]")
            : cn(
                "md:rounded-lg",
                i === 0 && "md:rounded-tr-[1.5rem]",
                isLast && "md:rounded-br-[1.5rem]",
                side.length === 1 && "md:row-span-2",
              );
          return (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => openAt(position)}
              className={cn(tileClass, "hidden md:block", rounded)}
              aria-label={`Open gallery — image ${position + 1} of ${count}`}
            >
              <Image
                src={src}
                alt={`${title} — image ${position + 1}`}
                fill
                loading="eager"
                sizes="25vw"
                className="object-cover transition-transform duration-[1.4s] ease-luxe group-hover:scale-[1.05]"
              />
              {isLast && count > 1 && (
                <span className="absolute right-4 bottom-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-graphite shadow-lg backdrop-blur transition-transform group-hover:-translate-y-0.5">
                  <Grid2x2 className="size-3.5" /> View all {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="w-[calc(100%-1.5rem)] max-w-6xl gap-0 overflow-hidden rounded-[1.5rem] border-0 bg-white p-0 sm:max-w-6xl"
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") go(1);
            if (e.key === "ArrowLeft") go(-1);
          }}
        >
          <DialogTitle className="sr-only">{title} — image gallery</DialogTitle>
          <DialogDescription className="sr-only">
            Use the arrow keys or the previous and next buttons to browse the images.
          </DialogDescription>
          <div
            className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100 sm:aspect-[16/10]"
            onTouchStart={(e) => {
              (e.currentTarget as HTMLElement).dataset.x = String(e.touches[0]?.clientX ?? 0);
            }}
            onTouchEnd={(e) => {
              const start = Number((e.currentTarget as HTMLElement).dataset.x ?? 0);
              const dx = (e.changedTouches[0]?.clientX ?? 0) - start;
              if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
            }}
          >
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={index}
                custom={direction}
                className="absolute inset-0"
                initial={{ opacity: 0, x: direction * 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -60 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <Image
                  src={photos[index]}
                  alt={`${title} — image ${index + 1} of ${count}`}
                  fill
                  sizes="(min-width: 1152px) 1152px, 100vw"
                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>
            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  className="absolute top-1/2 left-4 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-graphite shadow-xl backdrop-blur transition hover:scale-105"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  className="absolute top-1/2 right-4 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-graphite shadow-xl backdrop-blur transition hover:scale-105"
                  aria-label="Next image"
                >
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}
            <span className="absolute bottom-4 left-4 z-10 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-graphite backdrop-blur">
              {index + 1} / {count}
            </span>
          </div>
          {count > 1 && (
            <div className="no-scrollbar flex gap-2 overflow-x-auto p-3">
              {photos.map((src, i) => (
                <button
                  key={`${src}-thumb-${i}`}
                  type="button"
                  onClick={() => {
                    setDirection(i > index ? 1 : -1);
                    setIndex(i);
                  }}
                  aria-label={`Show image ${i + 1}`}
                  aria-current={i === index}
                  className={cn(
                    "relative h-16 w-24 shrink-0 overflow-hidden rounded-lg transition-all",
                    i === index ? "ring-2 ring-gold ring-offset-2" : "opacity-60 hover:opacity-100",
                  )}
                >
                  <Image src={src} alt="" fill sizes="96px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
