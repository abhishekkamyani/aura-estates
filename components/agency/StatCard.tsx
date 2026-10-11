import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  accent?: boolean;
}

export function StatCard({ label, value, hint, icon: Icon, accent }: StatCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-stone-200/60",
        accent ? "border-graphite bg-graphite text-white" : "border-stone-200/80 bg-white",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p
          className={cn(
            "text-[0.68rem] font-semibold tracking-[0.18em] uppercase",
            accent ? "text-white/60" : "text-slate-500",
          )}
        >
          {label}
        </p>
        <span
          className={cn(
            "grid size-9 place-items-center rounded-xl",
            accent ? "bg-white/10 text-gold" : "bg-gold-soft text-gold-deep",
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      <p className={cn("mt-3 font-serif text-[2.1rem] leading-none font-semibold", accent ? "text-white" : "text-graphite")}>
        {value}
      </p>
      {hint && <p className={cn("mt-2 text-xs", accent ? "text-white/60" : "text-slate-500")}>{hint}</p>}
    </div>
  );
}
