"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Menu, Phone } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { PUBLIC_NAV } from "@/components/layout/nav";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href.startsWith("/#") ? false : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "sticky top-0 z-50 h-(--header-height) border-b transition-[background-color,border-color,box-shadow] duration-500",
        scrolled
          ? "border-stone-200/80 bg-white/75 shadow-sm shadow-stone-200/40 backdrop-blur-xl backdrop-saturate-150"
          : "border-transparent bg-alabaster/60 backdrop-blur-md",
      )}
    >
      <div className="container-luxe flex h-full items-center justify-between gap-6">
        <Logo />

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {PUBLIC_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-graphite",
                isActive(item.href) && "text-graphite",
              )}
            >
              {item.label}
              <span
                className={cn(
                  "absolute inset-x-4 -bottom-0.5 h-px origin-left scale-x-0 bg-gold transition-transform duration-500 ease-luxe group-hover:scale-x-100",
                  isActive(item.href) && "scale-x-100",
                )}
              />
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={`tel:${siteConfig.phone.replace(/[^+\d]/g, "")}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-graphite"
          >
            <Phone className="size-4 text-gold-deep" aria-hidden="true" />
            {siteConfig.phone}
          </a>
          <Button
            asChild
            className="h-10 rounded-full bg-graphite px-5 text-[0.8rem] font-semibold tracking-wide text-alabaster shadow-lg shadow-slate-900/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-graphite hover:shadow-xl hover:shadow-slate-900/20"
          >
            <Link href="/agency">
              Agent Portal
              <ArrowUpRight className="size-4 transition-transform duration-300 group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5" />
            </Link>
          </Button>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon-lg"
              className="rounded-full border-stone-200/80 bg-white/80 lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[88vw] max-w-sm border-l-stone-200/80 bg-alabaster p-0 sm:max-w-sm"
          >
            <SheetHeader className="border-b border-stone-200/80 px-6 py-5">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <SheetDescription className="sr-only">
                Browse Aura Estates residences and services
              </SheetDescription>
              <Logo />
            </SheetHeader>
            <nav aria-label="Mobile" className="flex flex-col px-3 py-4">
              {PUBLIC_NAV.map((item, i) => (
                <SheetClose asChild key={item.href}>
                  <Link
                    href={item.href}
                    className="group flex items-center justify-between rounded-2xl px-4 py-4 font-serif text-2xl text-graphite transition-colors hover:bg-white"
                  >
                    <span>
                      <span className="mr-3 font-sans text-xs font-semibold text-gold-deep">
                        0{i + 1}
                      </span>
                      {item.label}
                    </span>
                    <ArrowUpRight className="size-5 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-gold-deep" />
                  </Link>
                </SheetClose>
              ))}
            </nav>
            <div className="mt-auto space-y-4 border-t border-stone-200/80 px-6 py-6">
              <p className="eyebrow">Private Client Desk</p>
              <a
                href={`tel:${siteConfig.phone.replace(/[^+\d]/g, "")}`}
                className="block text-lg font-semibold text-graphite"
              >
                {siteConfig.phone}
              </a>
              <a href={`mailto:${siteConfig.email}`} className="block text-sm text-slate-600">
                {siteConfig.email}
              </a>
              <SheetClose asChild>
                <Button asChild className="h-12 w-full rounded-full bg-graphite text-alabaster">
                  <Link href="/agency">Agent Portal</Link>
                </Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </motion.header>
  );
}
