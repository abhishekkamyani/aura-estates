import { connectDB } from "@/lib/mongodb";
import { escapeRegex } from "@/lib/properties";
import { Lead } from "@/models/Lead";
import "@/models/Property";
import type { LeadDTO } from "@/types/property";

export type LeadRange = "all" | "today" | "7d" | "30d" | "custom";

export interface LeadQuery {
  range: LeadRange;
  from?: string;
  to?: string;
  q?: string;
}

type SearchParamsRecord = Record<string, string | string[] | undefined>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86_400_000;

export function parseLeadQuery(params: SearchParamsRecord): LeadQuery {
  const rawRange = first(params.range);
  const rawFrom = first(params.from);
  const rawTo = first(params.to);
  const q = first(params.q)?.trim();
  const from = rawFrom && DATE_RE.test(rawFrom) ? rawFrom : undefined;
  const to = rawTo && DATE_RE.test(rawTo) ? rawTo : undefined;
  const validRange = (["all", "today", "7d", "30d", "custom"] as const).find((r) => r === rawRange);
  return {
    range: validRange ?? (from || to ? "custom" : "all"),
    from,
    to,
    q: q ? q.slice(0, 100) : undefined,
  };
}

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function resolveLeadDateWindow(query: LeadQuery): { gte?: Date; lte?: Date } {
  const now = new Date();
  switch (query.range) {
    case "today":
      return { gte: startOfDay(now) };
    case "7d":
      return { gte: startOfDay(new Date(now.getTime() - 6 * DAY_MS)) };
    case "30d":
      return { gte: startOfDay(new Date(now.getTime() - 29 * DAY_MS)) };
    case "custom": {
      const window: { gte?: Date; lte?: Date } = {};
      if (query.from) window.gte = new Date(`${query.from}T00:00:00`);
      if (query.to) window.lte = new Date(`${query.to}T23:59:59.999`);
      return window;
    }
    default:
      return {};
  }
}

type PopulatedLead = {
  _id: { toString(): string };
  name: string;
  email: string;
  phone?: string;
  message?: string;
  preferredDate?: Date | null;
  propertyId: { _id: { toString(): string }; title: string; city: string } | null;
  createdAt: Date;
};

export async function getLeads(query: LeadQuery = { range: "all" }): Promise<LeadDTO[]> {
  await connectDB();
  const window = resolveLeadDateWindow(query);
  const filter: Record<string, unknown> = {};
  if (window.gte || window.lte) {
    filter.createdAt = {
      ...(window.gte ? { $gte: window.gte } : {}),
      ...(window.lte ? { $lte: window.lte } : {}),
    };
  }
  if (query.q) {
    const rx = new RegExp(escapeRegex(query.q), "i");
    filter.$or = [{ name: rx }, { email: rx }, { phone: rx }, { message: rx }];
  }

  const docs = await Lead.find(filter)
    .sort({ createdAt: -1 })
    .limit(500)
    .populate("propertyId", "title city")
    .lean<PopulatedLead[]>();

  return docs.map((d) => ({
    id: d._id.toString(),
    name: d.name,
    email: d.email,
    phone: d.phone ?? "",
    message: d.message ?? "",
    preferredDate: d.preferredDate ? new Date(d.preferredDate).toISOString() : null,
    propertyId: d.propertyId?._id.toString() ?? "",
    propertyTitle: d.propertyId?.title ?? null,
    propertyCity: d.propertyId?.city ?? null,
    createdAt: new Date(d.createdAt).toISOString(),
  }));
}

export async function getLeadStats() {
  await connectDB();
  const now = Date.now();
  const [total, last7, last30] = await Promise.all([
    Lead.countDocuments({}),
    Lead.countDocuments({ createdAt: { $gte: new Date(now - 7 * DAY_MS) } }),
    Lead.countDocuments({ createdAt: { $gte: new Date(now - 30 * DAY_MS) } }),
  ]);
  return { total, last7, last30 };
}
