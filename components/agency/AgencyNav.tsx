"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Building2, Inbox, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/agency", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/agency/listings", label: "Listings", icon: Building2 },
  { href: "/agency/leads", label: "Leads", icon: Inbox },
];

export function AgencyNav({ leadBadge }: { leadBadge?: number }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Agency sections" className="no-scrollbar -mb-px flex gap-1 overflow-x-auto">
      {TABS.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative inline-flex shrink-0 items-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors",
              active ? "text-graphite" : "text-slate-500 hover:text-graphite",
            )}
          >
            <Icon className={cn("size-4", active ? "text-gold-deep" : "text-slate-400")} aria-hidden="true" />
            {label}
            {label === "Leads" && leadBadge ? (
              <span className="rounded-full bg-gold px-1.5 py-0.5 text-[0.62rem] leading-none font-bold text-white">
                {leadBadge}
              </span>
            ) : null}
            {active && (
              <motion.span
                layoutId="agency-tab"
                className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-graphite"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
