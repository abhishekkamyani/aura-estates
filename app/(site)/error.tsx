"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="container-luxe flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="eyebrow">A brief interruption</p>
      <h1 className="mt-4 text-5xl font-medium">We couldn&apos;t load this page</h1>
      <p className="mt-5 max-w-md text-slate-600">
        Our listings service is momentarily unavailable. Please try again — your search will be waiting.
      </p>
      <Button onClick={reset} className="mt-9 h-12 rounded-full bg-graphite px-7 text-white">
        Try again
      </Button>
    </section>
  );
}
