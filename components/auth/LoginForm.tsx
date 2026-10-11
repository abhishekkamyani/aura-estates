"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, Loader2, LockKeyhole, Mail } from "lucide-react";
import { authenticate } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const inputClass =
  "h-12 rounded-xl border-stone-200 bg-white pl-11 text-[0.92rem] shadow-none focus-visible:border-gold focus-visible:ring-gold/20";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, formAction, pending] = useActionState(authenticate, undefined);
  const error = state?.error;
  const [showPassword, setShowPassword] = useState(false);

  return (
    // Autofill is discouraged so the fields start empty: browsers key saved logins by
    // origin, so on localhost they offer credentials saved for other projects.
    <form action={formAction} className="space-y-5" autoComplete="off">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs font-semibold text-slate-600">
          Work email
        </Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="off"
            required
            defaultValue={state?.email}
            placeholder="you@astrelleestates.com"
            className={inputClass}
            aria-invalid={Boolean(error)}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-xs font-semibold text-slate-600">
          Password
        </Label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={6}
            placeholder="Enter your password"
            className={`${inputClass} pr-12`}
            aria-invalid={Boolean(error)}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute top-1/2 right-3 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-stone-100 hover:text-graphite"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="h-13 w-full rounded-full bg-graphite text-sm font-semibold tracking-wide text-alabaster shadow-xl shadow-slate-900/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800"
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Signing in…
          </>
        ) : (
          "Sign in to the Agency"
        )}
      </Button>
    </form>
  );
}
