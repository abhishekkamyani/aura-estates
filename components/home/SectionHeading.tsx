import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  id?: string;
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  align?: "left" | "center";
  className?: string;
  action?: React.ReactNode;
}

export function SectionHeading({ id, eyebrow, title, description, align = "left", className, action }: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        align === "center" && "items-center text-center md:flex-col md:items-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        <p className={cn("eyebrow flex items-center gap-3", align === "center" && "justify-center")}>
          <span className="gold-rule" aria-hidden="true" />
          {eyebrow}
        </p>
        <h2 id={id} className="mt-4 text-4xl leading-[1.05] font-medium sm:text-5xl lg:text-[3.5rem]">
          {title}
        </h2>
        {description && <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg">{description}</p>}
      </div>
      {action}
    </div>
  );
}
