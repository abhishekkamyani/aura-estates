import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-alabaster px-6 text-center">
      <Logo />
      <p className="eyebrow mt-14">Error 404</p>
      <h1 className="mt-4 text-5xl font-medium sm:text-6xl">This address is unlisted</h1>
      <p className="mt-5 max-w-md text-slate-600">The page you were looking for doesn&apos;t exist or has moved.</p>
      <Button asChild className="mt-9 h-12 rounded-full bg-graphite px-7 text-white">
        <Link href="/">Return home</Link>
      </Button>
    </main>
  );
}
