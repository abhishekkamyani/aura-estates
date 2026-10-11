"use client";

import { useActionState, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Check, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { submitLead, type LeadField, type LeadFormState } from "@/app/actions/leads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface LeadFormProps {
  propertyId: string;
  propertyTitle: string;
  /** Earliest selectable viewing date (YYYY-MM-DD), computed on the server. */
  minDate: string;
}

const initialState: LeadFormState = { status: "idle" };

function FieldError({ id, errors }: { id: string; errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p id={id} className="text-xs font-medium text-destructive">
      {errors[0]}
    </p>
  );
}

const inputClass =
  "h-12 rounded-xl border-stone-200 bg-alabaster/70 px-4 text-[0.92rem] shadow-none transition-colors placeholder:text-slate-400 focus-visible:border-gold focus-visible:bg-white focus-visible:ring-gold/20";

function LeadFormInner({ propertyId, propertyTitle, minDate, onReset }: LeadFormProps & { onReset: () => void }) {
  const [state, formAction, pending] = useActionState(submitLead, initialState);
  const errors = state.fieldErrors ?? {};
  const value = (field: LeadField, fallback = "") => state.values?.[field] ?? fallback;

  useEffect(() => {
    if (state.status === "success") {
      toast.success("Viewing request received", { description: state.message });
    } else if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  const describedBy = (field: LeadField) => (errors[field] ? `${field}-error` : undefined);

  return (
    <AnimatePresence mode="wait" initial={false}>
      {state.status === "success" ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center py-8 text-center"
          role="status"
        >
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
            className="grid size-16 place-items-center rounded-full bg-gold text-white shadow-lg shadow-gold/30"
          >
            <Check className="size-7" strokeWidth={2.5} />
          </motion.span>
          <h3 className="mt-6 text-3xl font-medium">Request received</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{state.message}</p>
          <Button variant="outline" onClick={onReset} className="mt-7 h-11 rounded-full px-6">
            Request another viewing
          </Button>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          action={formAction}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-4"
          noValidate
        >
          <input type="hidden" name="propertyId" value={propertyId} />
          {/* Honeypot field — hidden from people, tempting for bots */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label htmlFor="company">Company</label>
            <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-semibold text-slate-600">
              Full name
            </Label>
            <Input
              id="name"
              name="name"
              autoComplete="name"
              required
              defaultValue={value("name")}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={describedBy("name")}
              placeholder="Your full name"
              className={inputClass}
            />
            <FieldError id="name-error" errors={errors.name} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-slate-600">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                required
                defaultValue={value("email")}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={describedBy("email")}
                placeholder="you@example.com"
                className={inputClass}
              />
              <FieldError id="email-error" errors={errors.email} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-semibold text-slate-600">
                Phone <span className="font-normal text-slate-400">(optional)</span>
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                defaultValue={value("phone")}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={describedBy("phone")}
                placeholder="+1 (555) 000-0000"
                className={inputClass}
              />
              <FieldError id="phone-error" errors={errors.phone} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="preferredDate" className="text-xs font-semibold text-slate-600">
              Preferred viewing date
            </Label>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-gold-deep" />
              <Input
                id="preferredDate"
                name="preferredDate"
                type="date"
                min={minDate}
                defaultValue={value("preferredDate")}
                aria-invalid={Boolean(errors.preferredDate)}
                aria-describedby={describedBy("preferredDate")}
                className={cn(inputClass, "pl-11")}
              />
            </div>
            <FieldError id="preferredDate-error" errors={errors.preferredDate} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="message" className="text-xs font-semibold text-slate-600">
              Message
            </Label>
            <Textarea
              id="message"
              name="message"
              rows={4}
              defaultValue={value("message", `I would like to arrange a private viewing of ${propertyTitle}.`)}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={describedBy("message")}
              className={cn(inputClass, "h-auto min-h-28 py-3 leading-relaxed")}
            />
            <FieldError id="message-error" errors={errors.message} />
          </div>

          <Button
            type="submit"
            disabled={pending}
            className="group/submit h-13 w-full rounded-full bg-graphite text-sm font-semibold tracking-wide text-alabaster shadow-xl shadow-slate-900/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-2xl"
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Sending request…
              </>
            ) : (
              "Book Private Viewing"
            )}
          </Button>
          <p className="flex items-center justify-center gap-1.5 text-center text-[0.72rem] text-slate-500">
            <Lock className="size-3" aria-hidden="true" />
            Your details are shared only with your Aura advisor.
          </p>
        </motion.form>
      )}
    </AnimatePresence>
  );
}

/** "Book Private Viewing" lead capture form (Server Action powered). */
export function LeadForm(props: LeadFormProps) {
  const [key, setKey] = useState(0);
  return <LeadFormInner key={key} {...props} onReset={() => setKey((k) => k + 1)} />;
}
