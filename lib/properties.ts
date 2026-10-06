import { cache } from "react";
import { isValidObjectId, type SortOrder } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Property, type PropertyDoc } from "@/models/Property";
import type { PropertyDTO, PropertyFilters, PropertySort, PropertyStatus } from "@/types/property";

type LeanProperty = PropertyDoc & {
  _id: { toString(): string };
  createdAt?: Date;
  updatedAt?: Date;
};

export function toPropertyDTO(doc: LeanProperty): PropertyDTO {
  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    price: doc.price,
    address: doc.address,
    city: doc.city,
    bedrooms: doc.bedrooms,
    bathrooms: doc.bathrooms,
    sqft: doc.sqft,
    lat: doc.lat,
    lng: doc.lng,
    imageUrls: [...(doc.imageUrls ?? [])],
    featured: Boolean(doc.featured),
    status: (doc.status ?? "active") as PropertyStatus,
    agentId: doc.agentId ? doc.agentId.toString() : null,
    createdAt: (doc.createdAt ?? new Date()).toISOString(),
    updatedAt: (doc.updatedAt ?? new Date()).toISOString(),
  };
}

const SORTS: Record<PropertySort, Record<string, SortOrder>> = {
  newest: { createdAt: -1 },
  "price-asc": { price: 1 },
  "price-desc": { price: -1 },
  "size-desc": { sqft: -1 },
};

export function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

type SearchParamsRecord = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function positiveInt(value: string | undefined) {
  if (!value) return undefined;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

export function parsePropertyFilters(params: SearchParamsRecord): PropertyFilters {
  const sortParam = firstParam(params.sort);
  const sort = sortParam && sortParam in SORTS ? (sortParam as PropertySort) : undefined;
  const city = firstParam(params.city)?.trim();
  return {
    city: city ? city.slice(0, 80) : undefined,
    minPrice: positiveInt(firstParam(params.minPrice)),
    maxPrice: positiveInt(firstParam(params.maxPrice)),
    beds: positiveInt(firstParam(params.beds)),
    sort,
  };
}

/** Public listing search. Sold listings are hidden from the public portal. */
export async function getProperties(filters: PropertyFilters = {}): Promise<PropertyDTO[]> {
  await connectDB();
  const query: Record<string, unknown> = { status: { $ne: "sold" } };

  if (filters.city) query.city = new RegExp(`^${escapeRegex(filters.city)}$`, "i");
  if (filters.beds) query.bedrooms = { $gte: filters.beds };
  if (filters.minPrice || filters.maxPrice) {
    query.price = {
      ...(filters.minPrice ? { $gte: filters.minPrice } : {}),
      ...(filters.maxPrice ? { $lte: filters.maxPrice } : {}),
    };
  }

  const docs = await Property.find(query)
    .sort(SORTS[filters.sort ?? "newest"])
    .lean<LeanProperty[]>();
  return docs.map(toPropertyDTO);
}

export async function getFeaturedProperties(limit = 6): Promise<PropertyDTO[]> {
  await connectDB();
  const docs = await Property.find({ featured: true, status: { $ne: "sold" } })
    .sort({ price: -1 })
    .limit(limit)
    .lean<LeanProperty[]>();
  return docs.map(toPropertyDTO);
}

/** Cached per request so generateMetadata and the page share one query. */
export const getPropertyById = cache(async (id: string): Promise<PropertyDTO | null> => {
  if (!isValidObjectId(id)) return null;
  await connectDB();
  const doc = await Property.findById(id).lean<LeanProperty>();
  return doc ? toPropertyDTO(doc) : null;
});

export async function getSimilarProperties(property: PropertyDTO, limit = 3) {
  await connectDB();
  const docs = await Property.find({
    _id: { $ne: property.id },
    status: { $ne: "sold" },
  }).lean<LeanProperty[]>();
  return docs
    .map(toPropertyDTO)
    .sort((a, b) => {
      const cityScore = Number(b.city === property.city) - Number(a.city === property.city);
      if (cityScore !== 0) return cityScore;
      return Math.abs(a.price - property.price) - Math.abs(b.price - property.price);
    })
    .slice(0, limit);
}

export async function getCities(): Promise<string[]> {
  await connectDB();
  const cities = (await Property.distinct("city", { status: { $ne: "sold" } })) as string[];
  return cities.sort((a, b) => a.localeCompare(b));
}

export interface DestinationSummary {
  city: string;
  count: number;
  image: string | null;
  fromPrice: number;
}

export async function getDestinations(): Promise<DestinationSummary[]> {
  await connectDB();
  const rows = await Property.aggregate<{
    _id: string;
    count: number;
    image: string | null;
    fromPrice: number;
  }>([
    { $match: { status: { $ne: "sold" } } },
    { $sort: { price: -1 } },
    {
      $group: {
        _id: "$city",
        count: { $sum: 1 },
        image: { $first: { $arrayElemAt: ["$imageUrls", 0] } },
        fromPrice: { $min: "$price" },
      },
    },
    { $sort: { count: -1, _id: 1 } },
  ]);
  return rows.map((r) => ({ city: r._id, count: r.count, image: r.image, fromPrice: r.fromPrice }));
}

export async function getPortfolioStats() {
  await connectDB();
  const [summary] = await Property.aggregate<{
    listings: number;
    totalValue: number;
    cities: string[];
  }>([
    { $match: { status: { $ne: "sold" } } },
    {
      $group: {
        _id: null,
        listings: { $sum: 1 },
        totalValue: { $sum: "$price" },
        cities: { $addToSet: "$city" },
      },
    },
  ]);
  return {
    listings: summary?.listings ?? 0,
    totalValue: summary?.totalValue ?? 0,
    cities: summary?.cities.length ?? 0,
  };
}

/** Agency view: every listing, including pending and sold. */
export async function getAllPropertiesForAgency(): Promise<PropertyDTO[]> {
  await connectDB();
  const docs = await Property.find({}).sort({ createdAt: -1 }).lean<LeanProperty[]>();
  return docs.map(toPropertyDTO);
}
