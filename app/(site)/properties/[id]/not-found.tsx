import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PropertyNotFound() {
  return (
    <section className="container-luxe flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="eyebrow">Residence unavailable</p>
      <h1 className="mt-4 text-5xl font-medium sm:text-6xl">This home is no longer listed</h1>
      <p className="mt-5 max-w-md text-slate-600">
        It may have been withdrawn from the market or moved to our private, off-market collection.
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <Button asChild className="h-12 rounded-full bg-graphite px-7 text-white">
          <Link href="/properties">Browse residences</Link>
        </Button>
        <Button asChild variant="outline" className="h-12 rounded-full px-7">
          <Link href="/#private-office">Speak to an advisor</Link>
        </Button>
      </div>
    </section>
  );
}
