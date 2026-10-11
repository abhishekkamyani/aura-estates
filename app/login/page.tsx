import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/LoginForm";
import { Logo } from "@/components/layout/Logo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Agent Sign In",
  robots: { index: false, follow: false },
};

function safeCallback(value: string | string[] | undefined) {
  const url = Array.isArray(value) ? value[0] : value;
  if (!url) return "/agency";
  try {
    // Auth.js passes an absolute callbackUrl; keep only same-origin paths.
    const parsed = new URL(url, siteConfig.url);
    const path = `${parsed.pathname}${parsed.search}`;
    return path.startsWith("/") && !path.startsWith("//") ? path : "/agency";
  } catch {
    return "/agency";
  }
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const callbackUrl = safeCallback(params.callbackUrl);
  const session = await auth();
  if (session?.user) redirect(callbackUrl);

  return (
    <main className="grid min-h-dvh bg-alabaster lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden overflow-hidden lg:block" aria-label="Aura Estates">
        <Image
          src={siteConfig.agencyImage}
          alt="A low white villa with a turquoise pool beside the sea"
          fill
          loading="eager"
          sizes="50vw"
          className="object-cover object-[76%_50%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-12 xl:p-16">
          <p className="text-[0.7rem] font-semibold tracking-[0.28em] text-gold-light uppercase">Agency CRM</p>
          <p className="mt-4 max-w-lg font-serif text-4xl leading-tight text-white xl:text-5xl">
            &ldquo;Every introduction is an act of trust. We treat it accordingly.&rdquo;
          </p>
        </div>
      </section>

      <section className="flex flex-col px-6 py-8 sm:px-12 lg:px-16 xl:px-24">
        <div className="flex items-center justify-between">
          <Logo />
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-graphite">
            <ArrowLeft className="size-4" />
            Back to site
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-16">
          <p className="eyebrow">Agent Portal</p>
          <h1 className="mt-3 text-5xl font-medium">Welcome back</h1>
          <p className="mt-3 text-slate-600">Sign in to manage listings and private viewing requests.</p>

          <div className="mt-10 rounded-[1.75rem] border border-stone-200/80 bg-white p-6 shadow-xl shadow-stone-200/50 sm:p-8">
            <LoginForm callbackUrl={callbackUrl} />
          </div>
        </div>
      </section>
    </main>
  );
}
