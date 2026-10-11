"use client";

import { MotionConfig } from "framer-motion";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <TooltipProvider delayDuration={150}>
        {children}
        <Toaster
          theme="light"
          position="top-center"
          toastOptions={{
            classNames: {
              toast:
                "!rounded-2xl !border !border-stone-200/80 !bg-white !text-graphite !shadow-xl !shadow-stone-200/60 !font-sans",
              description: "!text-slate-500",
            },
          }}
        />
      </TooltipProvider>
    </MotionConfig>
  );
}
