import { cn } from "@/lib/utils";
import type { PropertyStatus } from "@/types/property";

const STYLES: Record<PropertyStatus, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  pending: "bg-amber-50 text-amber-800 ring-amber-600/20",
  sold: "bg-slate-100 text-slate-600 ring-slate-500/15",
};

const LABELS: Record<PropertyStatus, string> = {
  active: "Available",
  pending: "Under Offer",
  sold: "Sold",
};

export function StatusBadge({ status, className }: { status: PropertyStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.68rem] font-semibold tracking-wide uppercase ring-1 ring-inset",
        STYLES[status],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />
      {LABELS[status]}
    </span>
  );
}

export function FeaturedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-[0.66rem] font-bold tracking-[0.18em] text-white uppercase shadow-md shadow-gold/30",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="size-3" aria-hidden="true" fill="currentColor">
        <path d="m12 2 2.9 6.9L22 9.6l-5.4 4.8L18.2 22 12 18.3 5.8 22l1.6-7.6L2 9.6l7.1-.7L12 2Z" />
      </svg>
      Featured
    </span>
  );
}
