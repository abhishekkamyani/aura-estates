import { Bath, BedDouble, Ruler } from "lucide-react";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PropertyDTO } from "@/types/property";

export function PropertySpecs({
  property,
  className,
}: {
  property: Pick<PropertyDTO, "bedrooms" | "bathrooms" | "sqft">;
  className?: string;
}) {
  const items = [
    { icon: BedDouble, value: property.bedrooms, label: property.bedrooms === 1 ? "Bed" : "Beds" },
    { icon: Bath, value: property.bathrooms, label: property.bathrooms === 1 ? "Bath" : "Baths" },
    { icon: Ruler, value: formatNumber(property.sqft), label: "Sq Ft" },
  ];
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600", className)}>
      {items.map(({ icon: Icon, value, label }) => (
        <li key={label} className="inline-flex items-center gap-1.5">
          <Icon className="size-4 text-gold-deep" aria-hidden="true" />
          <span className="font-semibold text-graphite">{value}</span>
          <span>{label}</span>
        </li>
      ))}
    </ul>
  );
}
