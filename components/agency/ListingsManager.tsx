"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useOptimistic, useState, useTransition } from "react";
import { ExternalLink, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteProperty, setPropertyFeatured, setPropertyStatus } from "@/app/actions/properties";
import { ListingFormDialog } from "@/components/agency/ListingFormDialog";
import { StatusBadge } from "@/components/property/StatusBadge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { formatDate, formatNumber, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PropertyDTO, PropertyStatus } from "@/types/property";

type StatusFilter = "all" | PropertyStatus;
type Patch = { id: string } & Partial<Pick<PropertyDTO, "featured" | "status">>;

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Available" },
  { value: "pending", label: "Under offer" },
  { value: "sold", label: "Sold" },
];

interface ListingsManagerProps {
  properties: PropertyDTO[];
  leadCounts: Record<string, number>;
  openNew?: boolean;
}

export function ListingsManager({ properties, leadCounts, openNew = false }: ListingsManagerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [dialog, setDialog] = useState<{ open: boolean; key: number; property: PropertyDTO | null }>({
    open: openNew,
    key: 0,
    property: null,
  });
  const [deleteTarget, setDeleteTarget] = useState<PropertyDTO | null>(null);

  const [optimistic, applyPatch] = useOptimistic(properties, (state: PropertyDTO[], patch: Patch) =>
    state.map((p) => (p.id === patch.id ? { ...p, ...patch } : p)),
  );

  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = { all: optimistic.length, active: 0, pending: 0, sold: 0 };
    optimistic.forEach((p) => c[p.status]++);
    return c;
  }, [optimistic]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return optimistic.filter(
      (p) =>
        (status === "all" || p.status === status) &&
        (!q || [p.title, p.city, p.address].some((v) => v.toLowerCase().includes(q))),
    );
  }, [optimistic, query, status]);

  function openDialog(property: PropertyDTO | null) {
    setDialog((d) => ({ open: true, key: d.key + 1, property }));
  }

  function handleDialogChange(open: boolean) {
    setDialog((d) => ({ ...d, open }));
    if (!open && openNew) router.replace(pathname, { scroll: false });
  }

  function toggleFeatured(property: PropertyDTO, featured: boolean) {
    startTransition(async () => {
      applyPatch({ id: property.id, featured });
      const res = await setPropertyFeatured(property.id, featured);
      if (res.ok) toast.success(featured ? `${property.title} is now featured` : `${property.title} removed from featured`);
      else toast.error(res.error);
    });
  }

  function changeStatus(property: PropertyDTO, next: PropertyStatus) {
    startTransition(async () => {
      applyPatch({ id: property.id, status: next });
      const res = await setPropertyStatus(property.id, next);
      if (res.ok) toast.success(`Status updated for ${property.title}`);
      else toast.error(res.error);
    });
  }

  function confirmDelete() {
    const target = deleteTarget;
    if (!target) return;
    setDeleteTarget(null);
    startTransition(async () => {
      const res = await deleteProperty(target.id);
      if (res.ok) toast.success(`${target.title} deleted`);
      else toast.error(res.error);
    });
  }

  const statusSelect = (p: PropertyDTO) => (
    <Select value={p.status} onValueChange={(v) => changeStatus(p, v as PropertyStatus)}>
      <SelectTrigger
        size="sm"
        aria-label={`Status for ${p.title}`}
        className="w-[8.5rem] rounded-full border-stone-200 bg-white text-xs"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectItem value="active">Available</SelectItem>
        <SelectItem value="pending">Under offer</SelectItem>
        <SelectItem value="sold">Sold</SelectItem>
      </SelectContent>
    </Select>
  );

  const actions = (p: PropertyDTO) => (
    <div className="flex items-center justify-end gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button asChild variant="ghost" size="icon-sm" className="rounded-full">
            <Link href={`/properties/${p.id}`} target="_blank" aria-label={`View ${p.title} on site`}>
              <ExternalLink className="size-3.5" />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>View on site</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-sm" className="rounded-full" onClick={() => openDialog(p)} aria-label={`Edit ${p.title}`}>
            <Pencil className="size-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Edit listing</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-full text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => setDeleteTarget(p)}
            aria-label={`Delete ${p.title}`}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Delete</TooltipContent>
      </Tooltip>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Inventory</p>
          <h1 className="mt-2 text-4xl font-medium sm:text-5xl">Listings</h1>
          <p className="mt-2 text-slate-600">
            {counts.active} available · {counts.pending} under offer · {counts.sold} sold
          </p>
        </div>
        <Button
          onClick={() => openDialog(null)}
          className="h-11 rounded-full bg-graphite px-5 text-white shadow-lg shadow-slate-900/10 transition-all hover:-translate-y-0.5"
        >
          <Plus className="size-4" /> Add New Listing
        </Button>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-stone-200/80 bg-white p-3 shadow-sm md:flex-row md:items-center md:justify-between">
        <div role="tablist" aria-label="Filter by status" className="no-scrollbar flex gap-1 overflow-x-auto">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={status === tab.value}
              onClick={() => setStatus(tab.value)}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors",
                status === tab.value ? "bg-graphite text-white" : "text-slate-600 hover:bg-stone-100",
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[0.62rem]",
                  status === tab.value ? "bg-white/15" : "bg-stone-100 text-slate-500",
                )}
              >
                {counts[tab.value]}
              </span>
            </button>
          ))}
        </div>
        <div className="relative md:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, city or address"
            aria-label="Search listings"
            className="h-10 rounded-full border-stone-200 pl-10 shadow-none"
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
          <p className="font-serif text-2xl text-graphite">No listings found</p>
          <p className="mt-2 text-sm text-slate-500">Adjust the filters or add a new residence.</p>
        </div>
      ) : (
        <>
          {/* Desktop: high-density table */}
          <div className="hidden overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm md:block">
            <Table>
              <TableHeader className="bg-alabaster">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-5 text-[0.68rem] font-semibold tracking-[0.14em] text-slate-500 uppercase">Residence</TableHead>
                  <TableHead className="text-[0.68rem] font-semibold tracking-[0.14em] text-slate-500 uppercase">Price</TableHead>
                  <TableHead className="hidden text-[0.68rem] font-semibold tracking-[0.14em] text-slate-500 uppercase xl:table-cell">Specs</TableHead>
                  <TableHead className="text-[0.68rem] font-semibold tracking-[0.14em] text-slate-500 uppercase">Status</TableHead>
                  <TableHead className="text-[0.68rem] font-semibold tracking-[0.14em] text-slate-500 uppercase">Featured</TableHead>
                  <TableHead className="text-center text-[0.68rem] font-semibold tracking-[0.14em] text-slate-500 uppercase">Leads</TableHead>
                  <TableHead className="hidden text-[0.68rem] font-semibold tracking-[0.14em] text-slate-500 uppercase lg:table-cell">Updated</TableHead>
                  <TableHead className="pr-5 text-right text-[0.68rem] font-semibold tracking-[0.14em] text-slate-500 uppercase">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((p) => (
                  <TableRow key={p.id} className="border-stone-200/70 hover:bg-alabaster/70">
                    <TableCell className="py-3 pl-5">
                      <div className="flex items-center gap-3.5">
                        <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                          <Image src={p.imageUrls[0] ?? PLACEHOLDER_IMAGE} alt="" fill sizes="64px" className="object-cover" />
                        </span>
                        <div className="min-w-0">
                          <p className="max-w-[16rem] truncate font-semibold text-graphite">{p.title}</p>
                          <p className="max-w-[16rem] truncate text-xs text-slate-500">{p.city} · {p.address}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-graphite">{formatPrice(p.price)}</TableCell>
                    <TableCell className="hidden text-xs text-slate-600 xl:table-cell">
                      {p.bedrooms} bd · {p.bathrooms} ba · {formatNumber(p.sqft)} sf
                    </TableCell>
                    <TableCell>{statusSelect(p)}</TableCell>
                    <TableCell>
                      <Switch
                        checked={p.featured}
                        onCheckedChange={(v) => toggleFeatured(p, v)}
                        aria-label={`Feature ${p.title} on the home page`}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Link
                        href="/agency/leads"
                        className={cn(
                          "inline-grid min-w-7 place-items-center rounded-full px-2 py-0.5 text-xs font-bold",
                          leadCounts[p.id] ? "bg-gold-soft text-gold-deep" : "text-slate-400",
                        )}
                      >
                        {leadCounts[p.id] ?? 0}
                      </Link>
                    </TableCell>
                    <TableCell suppressHydrationWarning className="hidden text-xs text-slate-500 lg:table-cell">{formatDate(p.updatedAt)}</TableCell>
                    <TableCell className="pr-5">{actions(p)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile: stacked cards */}
          <ul className="space-y-3 md:hidden">
            {visible.map((p) => (
              <li key={p.id} className="rounded-2xl border border-stone-200/80 bg-white p-3 shadow-sm">
                <div className="flex gap-3">
                  <span className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                    <Image src={p.imageUrls[0] ?? PLACEHOLDER_IMAGE} alt="" fill sizes="96px" className="object-cover" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate font-semibold text-graphite">{p.title}</p>
                      <StatusBadge status={p.status} className="shrink-0 px-2 py-0.5 text-[0.56rem]" />
                    </div>
                    <p className="truncate text-xs text-slate-500">{p.city}</p>
                    <p className="mt-1 font-serif text-lg font-semibold text-graphite">{formatPrice(p.price)}</p>
                    <p className="text-xs text-slate-500">
                      {p.bedrooms} bd · {p.bathrooms} ba · {leadCounts[p.id] ?? 0} leads
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-stone-200/70 pt-3">
                  <div className="flex items-center gap-2">
                    {statusSelect(p)}
                    <label className="flex items-center gap-1.5 text-xs text-slate-600">
                      <Switch checked={p.featured} onCheckedChange={(v) => toggleFeatured(p, v)} size="sm" />
                      Featured
                    </label>
                  </div>
                  {actions(p)}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <ListingFormDialog
        key={dialog.key}
        open={dialog.open}
        onOpenChange={handleDialogChange}
        property={dialog.property}
      />

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.title}?</AlertDialogTitle>
            <AlertDialogDescription>
              The listing will be removed from the portal immediately. Existing leads are kept for your records.
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="rounded-full bg-red-600 text-white hover:bg-red-700">
              Delete listing
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
