import type { Metadata } from "next";
import Link from "next/link";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ExternalLink, LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { AgencyNav } from "@/components/agency/AgencyNav";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/auth-guard";
import { getLeadStats } from "@/lib/leads";

export const metadata: Metadata = {
  title: { default: "Agency Dashboard", template: "%s · Agency | Aura Estates" },
  robots: { index: false, follow: false },
};

export default async function AgencyLayout({ children }: LayoutProps<"/agency">) {
  const session = await requireSession();
  const leadStats = await getLeadStats();
  const user = session.user;
  const initials = (user.name || user.email || "A")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  return (
    <div className="min-h-dvh bg-alabaster">
      {/* Hydrates UploadThing's route config so the dropzone is ready instantly. */}
      <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />

      <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Logo href="/agency" />
            <span className="hidden rounded-full border border-gold/40 bg-gold-soft px-2.5 py-1 text-[0.62rem] font-bold tracking-[0.18em] text-gold-deep uppercase sm:inline">
              Agency
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button asChild variant="ghost" className="hidden h-9 rounded-full px-3 text-[0.8rem] text-slate-600 sm:inline-flex">
              <Link href="/" target="_blank" rel="noopener">
                View site <ExternalLink className="size-3.5" />
              </Link>
            </Button>
            <div className="flex items-center gap-2.5 rounded-full border border-stone-200/80 bg-white py-1 pr-1 pl-1 sm:pr-3">
              <span className="grid size-7 place-items-center rounded-full bg-graphite text-[0.7rem] font-bold text-gold">
                {initials}
              </span>
              <span className="hidden max-w-[12rem] truncate text-xs font-medium text-slate-600 sm:block">
                {user.email}
              </span>
            </div>
            <form action={logout}>
              <Button
                type="submit"
                variant="outline"
                size="icon-lg"
                className="rounded-full border-stone-200/80"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut className="size-4" />
              </Button>
            </form>
          </div>
        </div>
        <div className="mx-auto max-w-[1600px] px-2 sm:px-4 lg:px-6">
          <AgencyNav leadBadge={leadStats.last7} />
        </div>
      </header>

      <main id="main" className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {children}
      </main>
    </div>
  );
}
