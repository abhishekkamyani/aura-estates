"use client";

import Link from "next/link";
import { CalendarDays, Download, Mail, MessageSquareText, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDate, formatDateTime } from "@/lib/format";
import type { LeadDTO } from "@/types/property";

function mailtoHref(lead: LeadDTO) {
  const subject = `Your private viewing request${lead.propertyTitle ? ` — ${lead.propertyTitle}` : ""}`;
  const body = `Dear ${lead.name.split(" ")[0]},\n\nThank you for your interest${
    lead.propertyTitle ? ` in ${lead.propertyTitle}` : ""
  }. I would be delighted to arrange a private viewing${
    lead.preferredDate ? ` on ${formatDate(lead.preferredDate, { weekday: "long", month: "long" })}` : ""
  }.\n\nWarm regards,\nAstrelle Estates`;
  return `mailto:${lead.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function telHref(phone: string) {
  return `tel:${phone.replace(/[^+\d]/g, "")}`;
}

function toCsv(leads: LeadDTO[]) {
  const header = ["Received", "Name", "Email", "Phone", "Residence", "City", "Preferred date", "Message"];
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const rows = leads.map((l) =>
    [
      l.createdAt,
      l.name,
      l.email,
      l.phone,
      l.propertyTitle ?? "",
      l.propertyCity ?? "",
      l.preferredDate ? l.preferredDate.slice(0, 10) : "",
      l.message,
    ]
      .map((v) => escape(String(v)))
      .join(","),
  );
  return [header.join(","), ...rows].join("\r\n");
}

function ContactActions({ lead }: { lead: LeadDTO }) {
  return (
    <div className="flex items-center gap-1.5">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button asChild size="sm" className="h-8 rounded-full bg-graphite px-3 text-xs text-white hover:bg-slate-800">
            <a href={mailtoHref(lead)} aria-label={`Email ${lead.name}`}>
              <Mail className="size-3.5" /> Email
            </a>
          </Button>
        </TooltipTrigger>
        <TooltipContent>{lead.email}</TooltipContent>
      </Tooltip>
      {lead.phone ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button asChild size="sm" variant="outline" className="h-8 rounded-full border-stone-200 px-3 text-xs">
              <a href={telHref(lead.phone)} aria-label={`Call ${lead.name}`}>
                <Phone className="size-3.5" /> Call
              </a>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{lead.phone}</TooltipContent>
        </Tooltip>
      ) : null}
    </div>
  );
}

export function LeadsTable({ leads }: { leads: LeadDTO[] }) {
  function exportCsv() {
    const blob = new Blob([String.fromCharCode(0xfeff) + toCsv(leads)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `astrelle-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (leads.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
        <MessageSquareText className="mx-auto size-8 text-gold" aria-hidden="true" />
        <p className="mt-4 font-serif text-2xl text-graphite">No inquiries in this period</p>
        <p className="mt-2 text-sm text-slate-500">Try a wider date range or clear your search.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          <span className="font-semibold text-graphite">{leads.length}</span> {leads.length === 1 ? "inquiry" : "inquiries"}
        </p>
        <Button variant="outline" onClick={exportCsv} className="h-9 rounded-full border-stone-200 px-4 text-xs font-semibold">
          <Download className="size-3.5" /> Export CSV
        </Button>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm lg:block">
        <Table>
          <TableHeader className="bg-alabaster">
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-5 text-[0.68rem] font-semibold tracking-[0.14em] text-slate-500 uppercase">Received</TableHead>
              <TableHead className="text-[0.68rem] font-semibold tracking-[0.14em] text-slate-500 uppercase">Client</TableHead>
              <TableHead className="text-[0.68rem] font-semibold tracking-[0.14em] text-slate-500 uppercase">Residence</TableHead>
              <TableHead className="text-[0.68rem] font-semibold tracking-[0.14em] text-slate-500 uppercase">Viewing</TableHead>
              <TableHead className="text-[0.68rem] font-semibold tracking-[0.14em] text-slate-500 uppercase">Message</TableHead>
              <TableHead className="pr-5 text-right text-[0.68rem] font-semibold tracking-[0.14em] text-slate-500 uppercase">Contact</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id} className="border-stone-200/70 align-top hover:bg-alabaster/70">
                <TableCell className="py-3.5 pl-5 text-xs whitespace-nowrap text-slate-500">
                  <time suppressHydrationWarning dateTime={lead.createdAt}>{formatDateTime(lead.createdAt)}</time>
                </TableCell>
                <TableCell className="py-3.5">
                  <p className="font-semibold text-graphite">{lead.name}</p>
                  <a href={mailtoHref(lead)} className="block text-xs text-slate-500 hover:text-gold-deep">
                    {lead.email}
                  </a>
                  {lead.phone && (
                    <a href={telHref(lead.phone)} className="block text-xs text-slate-500 hover:text-gold-deep">
                      {lead.phone}
                    </a>
                  )}
                </TableCell>
                <TableCell className="py-3.5">
                  {lead.propertyTitle ? (
                    <Link href={`/properties/${lead.propertyId}`} target="_blank" className="font-medium text-graphite hover:text-gold-deep">
                      {lead.propertyTitle}
                      <span className="block text-xs font-normal text-slate-500">{lead.propertyCity}</span>
                    </Link>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Listing removed</span>
                  )}
                </TableCell>
                <TableCell className="py-3.5 text-xs whitespace-nowrap text-slate-600">
                  {lead.preferredDate ? (
                    <span suppressHydrationWarning className="inline-flex items-center gap-1.5 rounded-full bg-gold-soft px-2.5 py-1 font-semibold text-gold-deep">
                      <CalendarDays className="size-3" />
                      {formatDate(lead.preferredDate)}
                    </span>
                  ) : (
                    <span className="text-slate-400">Flexible</span>
                  )}
                </TableCell>
                <TableCell className="max-w-xs py-3.5 text-xs leading-relaxed whitespace-normal text-slate-600">
                  <p className="line-clamp-2" title={lead.message}>
                    {lead.message || <span className="text-slate-400">—</span>}
                  </p>
                </TableCell>
                <TableCell className="py-3.5 pr-5">
                  <div className="flex justify-end">
                    <ContactActions lead={lead} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile / tablet cards */}
      <ul className="grid gap-3 sm:grid-cols-2 lg:hidden">
        {leads.map((lead) => (
          <li key={lead.id} className="flex flex-col rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-graphite">{lead.name}</p>
                <p className="truncate text-xs text-slate-500">{lead.email}</p>
              </div>
              <time suppressHydrationWarning dateTime={lead.createdAt} className="shrink-0 text-[0.68rem] text-slate-400">
                {formatDate(lead.createdAt)}
              </time>
            </div>
            <p suppressHydrationWarning className="mt-2 text-xs font-medium text-gold-deep">
              {lead.propertyTitle ?? "Listing removed"}
              {lead.preferredDate ? ` · viewing ${formatDate(lead.preferredDate)}` : ""}
            </p>
            {lead.message && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">{lead.message}</p>}
            <div className="mt-auto pt-4">
              <ContactActions lead={lead} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
