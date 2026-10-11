import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-2.5 text-graphite", className)}
      aria-label="Astrelle Estates — home"
    >
      <span className="relative grid size-9 place-items-center rounded-xl bg-graphite text-gold shadow-sm shadow-stone-300/60 transition-transform duration-500 ease-luxe group-hover:rotate-[8deg]">
        <svg viewBox="0 0 64 64" className="size-5" aria-hidden="true">
          <path
            d="M32 13 17 51h6.2l3.3-8.9h11l3.3 8.9H47L32 13Zm-3.6 23.6L32 26.4l3.6 10.2h-7.2Z"
            fill="currentColor"
          />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-serif text-[1.35rem] font-semibold tracking-[0.02em]">Astrelle</span>
        <span className="text-[0.55rem] font-semibold tracking-[0.42em] text-gold-deep uppercase">
          Estates
        </span>
      </span>
    </Link>
  );
}
