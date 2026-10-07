"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ShareButton({ title }: { title: string }) {
  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch (error) {
      if ((error as DOMException)?.name !== "AbortError") toast.error("Unable to share this residence.");
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={share}
      className="h-11 rounded-full border-stone-200/90 bg-white px-5 text-[0.82rem] font-semibold transition-all hover:-translate-y-0.5 hover:border-gold"
    >
      <Share2 className="size-4" />
      Share
    </Button>
  );
}
