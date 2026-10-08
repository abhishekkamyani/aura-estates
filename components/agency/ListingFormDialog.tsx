"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Crosshair, ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { saveProperty } from "@/app/actions/properties";
import { LocationPicker } from "@/components/map/lazy";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { UploadDropzone } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";
import type { PropertyDTO, PropertyStatus } from "@/types/property";

interface ListingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * When provided the dialog edits this listing; otherwise it creates one.
   * Parents should change the component `key` each time the dialog opens so
   * the form state is initialised fresh from this prop.
   */
  property?: PropertyDTO | null;
}

type FormState = {
  title: string;
  description: string;
  price: string;
  address: string;
  city: string;
  bedrooms: string;
  bathrooms: string;
  sqft: string;
  lat: number | null;
  lng: number | null;
  imageUrls: string[];
  featured: boolean;
  status: PropertyStatus;
};

const EMPTY: FormState = {
  title: "",
  description: "",
  price: "",
  address: "",
  city: "",
  bedrooms: "",
  bathrooms: "",
  sqft: "",
  lat: null,
  lng: null,
  imageUrls: [],
  featured: false,
  status: "active",
};

function fromProperty(p: PropertyDTO): FormState {
  return {
    title: p.title,
    description: p.description,
    price: String(p.price),
    address: p.address,
    city: p.city,
    bedrooms: String(p.bedrooms),
    bathrooms: String(p.bathrooms),
    sqft: String(p.sqft),
    lat: p.lat,
    lng: p.lng,
    imageUrls: [...p.imageUrls],
    featured: p.featured,
    status: p.status,
  };
}

const inputClass =
  "h-11 rounded-xl border-stone-200 bg-white px-3.5 shadow-none focus-visible:border-gold focus-visible:ring-gold/20";

function Field({
  label,
  htmlFor,
  error,
  children,
  className,
  hint,
}: {
  label: string;
  htmlFor: string;
  error?: string[];
  children: React.ReactNode;
  className?: string;
  hint?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor} className="text-xs font-semibold text-slate-600">
        {label}
      </Label>
      {children}
      {error?.length ? (
        <p className="text-xs font-medium text-destructive">{error[0]}</p>
      ) : hint ? (
        <p className="text-xs text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}

function SectionTitle({ step, title, description }: { step: string; title: string; description?: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-graphite text-[0.65rem] font-bold text-gold">
        {step}
      </span>
      <div>
        <h3 className="font-sans text-sm font-semibold tracking-normal text-graphite">{title}</h3>
        {description && <p className="text-xs text-slate-500">{description}</p>}
      </div>
    </div>
  );
}

export function ListingFormDialog({ open, onOpenChange, property }: ListingFormDialogProps) {
  const isEdit = Boolean(property);
  const [form, setForm] = useState<FormState>(property ? fromProperty(property) : EMPTY);
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [uploading, setUploading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  async function locateAddress() {
    const query = [form.address, form.city].filter(Boolean).join(", ");
    if (!query) {
      toast.error("Enter an address first.");
      return;
    }
    setLocating(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
        { headers: { Accept: "application/json" } },
      );
      const results = (await res.json()) as { lat: string; lon: string }[];
      if (!results.length) {
        toast.error("Address not found — click the map to place the pin instead.");
        return;
      }
      setForm((f) => ({ ...f, lat: Number(results[0].lat), lng: Number(results[0].lon) }));
      setErrors((e) => ({ ...e, lat: undefined }));
      toast.success("Location found. Drag the pin to fine-tune.");
    } catch {
      toast.error("Geocoding is unavailable — click the map to place the pin.");
    } finally {
      setLocating(false);
    }
  }

  function moveToCover(index: number) {
    setForm((f) => {
      const next = [...f.imageUrls];
      const [img] = next.splice(index, 1);
      return { ...f, imageUrls: [img, ...next] };
    });
  }

  function removeImage(index: number) {
    setForm((f) => ({ ...f, imageUrls: f.imageUrls.filter((_, i) => i !== index) }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await saveProperty(
        {
          title: form.title,
          description: form.description,
          price: form.price,
          address: form.address,
          city: form.city,
          bedrooms: form.bedrooms,
          bathrooms: form.bathrooms,
          sqft: form.sqft,
          lat: form.lat ?? 0,
          lng: form.lng ?? 0,
          imageUrls: form.imageUrls,
          featured: form.featured,
          status: form.status,
        },
        property?.id,
      );
      if (result.ok) {
        toast.success(isEdit ? "Listing updated" : "Listing published", {
          description: `${form.title} is ${form.status === "active" ? "now live on the portal" : `marked as ${form.status}`}.`,
        });
        onOpenChange(false);
      } else {
        setErrors(result.fieldErrors ?? {});
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !pending && onOpenChange(o)}>
      <DialogContent className="flex max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-3xl flex-col gap-0 overflow-hidden rounded-[1.5rem] border-0 bg-white p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-stone-200/80 px-6 py-5 text-left">
          <DialogTitle className="font-serif text-3xl font-medium">
            {isEdit ? "Edit listing" : "Add new listing"}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? "Update details, photography and visibility." : "Publish a residence to the Aura portal."}
          </DialogDescription>
        </DialogHeader>

        <form id="listing-form" onSubmit={handleSubmit} className="flex-1 space-y-9 overflow-y-auto px-6 py-6">
          {/* 1 — Photography */}
          <section className="space-y-4">
            <SectionTitle step="1" title="Photography" description="The first image is used as the cover. JPG/PNG/WebP up to 8MB." />
            <UploadDropzone
              endpoint="propertyImages"
              config={{ mode: "auto", cn }}
              onUploadBegin={() => setUploading(true)}
              onClientUploadComplete={(files) => {
                setUploading(false);
                const urls = files.map((f) => f.ufsUrl);
                setForm((f) => ({ ...f, imageUrls: [...f.imageUrls, ...urls] }));
                setErrors((e) => ({ ...e, imageUrls: undefined }));
                toast.success(`${urls.length} ${urls.length === 1 ? "photo" : "photos"} uploaded`);
              }}
              onUploadError={(error) => {
                setUploading(false);
                toast.error(error.message || "Upload failed.");
              }}
              appearance={{
                container: ({ isDragActive }) =>
                  cn(
                    "mt-0 cursor-pointer rounded-2xl border-2 border-dashed border-stone-300 bg-alabaster px-6 py-8 transition-colors hover:border-gold hover:bg-gold-soft/40",
                    isDragActive && "border-gold bg-gold-soft/60",
                  ),
                uploadIcon: "size-10 text-gold",
                label: "mt-3 text-sm font-semibold text-graphite hover:text-gold-deep",
                allowedContent: "mt-1 text-xs text-slate-500",
                button:
                  "mt-4 h-10 rounded-full bg-graphite px-5 text-xs font-semibold text-white data-[state=ready]:bg-graphite data-[state=readying]:bg-graphite/60 data-[state=disabled]:bg-graphite/40 data-[state=uploading]:cursor-not-allowed data-[state=uploading]:bg-graphite/70 data-[state=uploading]:after:bg-gold",
              }}
              content={{
                uploadIcon: <ImagePlus className="size-10 text-gold" aria-hidden="true" />,
                label: ({ isDragActive }) =>
                  isDragActive ? "Release to upload" : "Drag & drop photography, or click to browse",
                allowedContent: "Up to 12 images per batch · 8MB each",
                button: ({ isUploading, uploadProgress }) =>
                  isUploading ? `Uploading ${uploadProgress}%` : "Select images",
              }}
            />
            {errors.imageUrls?.length ? (
              <p className="text-xs font-medium text-destructive">{errors.imageUrls[0]}</p>
            ) : null}

            {form.imageUrls.length > 0 && (
              <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                <AnimatePresence initial={false}>
                  {form.imageUrls.map((url, i) => (
                    <motion.li
                      key={url}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={cn(
                        "group relative aspect-square overflow-hidden rounded-xl border bg-stone-100",
                        i === 0 ? "border-gold ring-2 ring-gold/30" : "border-stone-200",
                      )}
                    >
                      <Image src={url} alt={`Listing photo ${i + 1}`} fill sizes="160px" className="object-cover" />
                      {i === 0 && (
                        <span className="absolute top-1.5 left-1.5 rounded-full bg-gold px-2 py-0.5 text-[0.58rem] font-bold tracking-wider text-white uppercase">
                          Cover
                        </span>
                      )}
                      <div className="absolute inset-x-1.5 bottom-1.5 flex justify-end gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
                        {i !== 0 && (
                          <button
                            type="button"
                            onClick={() => moveToCover(i)}
                            className="grid size-7 place-items-center rounded-full bg-white/95 text-graphite shadow"
                            aria-label={`Use photo ${i + 1} as cover`}
                            title="Use as cover"
                          >
                            <Star className="size-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="grid size-7 place-items-center rounded-full bg-white/95 text-red-600 shadow"
                          aria-label={`Remove photo ${i + 1}`}
                          title="Remove"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </section>

          {/* 2 — Details */}
          <section className="space-y-4">
            <SectionTitle step="2" title="Residence details" />
            <Field label="Listing title" htmlFor="lf-title" error={errors.title}>
              <Input
                id="lf-title"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Villa Lumière"
                className={inputClass}
                aria-invalid={Boolean(errors.title)}
              />
            </Field>
            <Field label="Description" htmlFor="lf-description" error={errors.description} hint="Separate paragraphs with a blank line.">
              <Textarea
                id="lf-description"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={5}
                placeholder="Describe the architecture, interiors, grounds and amenities…"
                className={cn(inputClass, "h-auto min-h-32 py-3 leading-relaxed")}
                aria-invalid={Boolean(errors.description)}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-4">
              <Field label="Price (USD)" htmlFor="lf-price" error={errors.price} className="sm:col-span-4 md:col-span-1">
                <Input
                  id="lf-price"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1000}
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                  placeholder="12500000"
                  className={inputClass}
                  aria-invalid={Boolean(errors.price)}
                />
              </Field>
              <Field label="Bedrooms" htmlFor="lf-beds" error={errors.bedrooms}>
                <Input
                  id="lf-beds"
                  type="number"
                  min={0}
                  value={form.bedrooms}
                  onChange={(e) => set("bedrooms", e.target.value)}
                  className={inputClass}
                  aria-invalid={Boolean(errors.bedrooms)}
                />
              </Field>
              <Field label="Bathrooms" htmlFor="lf-baths" error={errors.bathrooms}>
                <Input
                  id="lf-baths"
                  type="number"
                  min={0}
                  step={0.5}
                  value={form.bathrooms}
                  onChange={(e) => set("bathrooms", e.target.value)}
                  className={inputClass}
                  aria-invalid={Boolean(errors.bathrooms)}
                />
              </Field>
              <Field label="Interior (sq ft)" htmlFor="lf-sqft" error={errors.sqft}>
                <Input
                  id="lf-sqft"
                  type="number"
                  min={0}
                  value={form.sqft}
                  onChange={(e) => set("sqft", e.target.value)}
                  className={inputClass}
                  aria-invalid={Boolean(errors.sqft)}
                />
              </Field>
            </div>
          </section>

          {/* 3 — Location */}
          <section className="space-y-4">
            <SectionTitle step="3" title="Location" description="Click the map or drag the pin to set exact coordinates." />
            <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
              <Field label="Street address" htmlFor="lf-address" error={errors.address}>
                <Input
                  id="lf-address"
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  placeholder="Street address, City, ST 00000"
                  className={inputClass}
                  aria-invalid={Boolean(errors.address)}
                />
              </Field>
              <Field label="City" htmlFor="lf-city" error={errors.city}>
                <Input
                  id="lf-city"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  placeholder="Beverly Hills"
                  className={inputClass}
                  aria-invalid={Boolean(errors.city)}
                />
              </Field>
            </div>
            <div className="relative h-64 overflow-hidden rounded-2xl border border-stone-200/80 sm:h-72">
              <LocationPicker
                lat={form.lat}
                lng={form.lng}
                onChange={({ lat, lng }) => {
                  setForm((f) => ({ ...f, lat, lng }));
                  setErrors((e) => ({ ...e, lat: undefined, lng: undefined }));
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={locateAddress}
                disabled={locating}
                className="absolute top-3 left-3 z-[500] h-9 rounded-full border-stone-200 bg-white/95 px-3.5 text-xs font-semibold shadow-lg backdrop-blur"
              >
                {locating ? <Loader2 className="size-3.5 animate-spin" /> : <Crosshair className="size-3.5" />}
                Locate address
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Latitude" htmlFor="lf-lat" error={errors.lat}>
                <Input
                  id="lf-lat"
                  type="number"
                  step="any"
                  value={form.lat ?? ""}
                  onChange={(e) => set("lat", e.target.value === "" ? null : Number(e.target.value))}
                  className={inputClass}
                  aria-invalid={Boolean(errors.lat)}
                />
              </Field>
              <Field label="Longitude" htmlFor="lf-lng" error={errors.lng}>
                <Input
                  id="lf-lng"
                  type="number"
                  step="any"
                  value={form.lng ?? ""}
                  onChange={(e) => set("lng", e.target.value === "" ? null : Number(e.target.value))}
                  className={inputClass}
                  aria-invalid={Boolean(errors.lng)}
                />
              </Field>
            </div>
          </section>

          {/* 4 — Visibility */}
          <section className="space-y-4">
            <SectionTitle step="4" title="Visibility" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Status" htmlFor="lf-status">
                <Select value={form.status} onValueChange={(v) => set("status", v as PropertyStatus)}>
                  <SelectTrigger id="lf-status" className="w-full rounded-xl border-stone-200 data-[size=default]:h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="active">Available</SelectItem>
                    <SelectItem value="pending">Under offer</SelectItem>
                    <SelectItem value="sold">Sold (hidden from portal)</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <label
                htmlFor="lf-featured"
                className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-stone-200 bg-alabaster px-4 py-3 sm:mt-[1.375rem]"
              >
                <span>
                  <span className="block text-sm font-semibold text-graphite">Feature on home page</span>
                  <span className="block text-xs text-slate-500">Shown with the 3D showcase cards</span>
                </span>
                <Switch id="lf-featured" checked={form.featured} onCheckedChange={(v) => set("featured", v)} />
              </label>
            </div>
          </section>
        </form>

        <DialogFooter className="flex-row items-center justify-end gap-2 border-t border-stone-200/80 bg-alabaster px-6 py-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={pending}
            className="h-11 rounded-full px-5"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="listing-form"
            disabled={pending || uploading}
            className="h-11 rounded-full bg-graphite px-6 text-white shadow-lg shadow-slate-900/10"
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            {uploading ? "Waiting for uploads…" : isEdit ? "Save changes" : "Publish listing"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
