/**
 * Seed the Aura Estates database.
 *
 *   npm run seed
 *
 * Upserts the admin account and replaces all properties and leads in the
 * database named in MONGODB_URI with demo data.
 *
 * Everything here is fictional: street names are invented, map pins are
 * approximate town-level points, lead names use the surname "Example", emails
 * use the reserved example.com domain, and phone numbers use the 555-01xx
 * range reserved for fiction. Photography is free-license Unsplash stock
 * imagery (generic architectural/interior shots, not tied to any listing's
 * actual address, with no identifiable people in frame) mirrored into the
 * project's own UploadThing bucket so listings don't depend on Unsplash at
 * runtime.
 */
import { loadEnvConfig } from "@next/env";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { Property } from "../models/Property";
import { Lead } from "../models/Lead";

loadEnvConfig(process.cwd());

const ADMIN = {
  name: "Aura Admin",
  email: "admin@auraestates.com",
  password: "password123",
  role: "admin" as const,
};

const PROPERTIES = [
  {
    title: "Villa Lumière",
    city: "Beverly Hills",
    address: "1 Lumiere Crest, Beverly Hills, CA 90210",
    price: 18_750_000,
    bedrooms: 6,
    bathrooms: 8,
    sqft: 11_200,
    lat: 34.09,
    lng: -118.41,
    featured: true,
    description:
      "Perched above the city, Villa Lumière is a study in light and proportion. Floor-to-ceiling glass dissolves the boundary between the double-height great room and an infinity-edge pool that appears to spill into the skyline.\n\nThe residence offers six en-suite bedrooms, a chef's kitchen with professional-grade appliances and a scullery, a temperature-controlled wine gallery for 1,200 bottles, a screening room, and a wellness level with spa, sauna and gym. A motor court and gated entry ensure absolute privacy.",
    imageUrls: [
      "https://gbxt70nat9.ufs.sh/f/q3qRD927C251lGDkGiZCSjGIHumKPZcBgl2y19X36xaDkLUh",
      "https://gbxt70nat9.ufs.sh/f/q3qRD927C251ZeHOWydhHQPqFL37VdoyzCMA9jOSknxamIRl",
      "https://gbxt70nat9.ufs.sh/f/q3qRD927C251dujzuuN3FDfK7SGoXJsle0qHxvnWVMRBw4UY",
      "https://gbxt70nat9.ufs.sh/f/q3qRD927C251SSkgvXU0S96EpcGbjRsmKkYyNzQoPCv7edhr",
      "https://gbxt70nat9.ufs.sh/f/q3qRD927C251HQ9ZBApd0rA4tGUElz5IRnjoqewb2MZ9m6ks",
    ],
  },
  {
    title: "The Cypress Residence",
    city: "Malibu",
    address: "2 Cypress Bluff Walk, Malibu, CA 90265",
    price: 24_500_000,
    bedrooms: 5,
    bathrooms: 7,
    sqft: 8_900,
    lat: 34.04,
    lng: -118.78,
    featured: true,
    description:
      "A sculptural beach-modern sanctuary set on nearly an acre of bluff-top land with private stairs to the sand. Pale limestone, white oak and walls of retractable glass frame uninterrupted views along the coast.\n\nThe main level flows to a sunken lounge, a 70-foot pool terrace and a dining pavilion. Upstairs, the primary suite enjoys a wraparound balcony, dual dressing rooms and a stone-clad bath. Includes a two-bedroom guest house and a four-car gallery garage.",
    imageUrls: [
      "https://gbxt70nat9.ufs.sh/f/q3qRD927C251S32CBinU0S96EpcGbjRsmKkYyNzQoPCv7edh",
      "https://gbxt70nat9.ufs.sh/f/q3qRD927C251N8hz3TkPeFpykqGo3hl24YxiDa7KOwsguQBv",
      "https://gbxt70nat9.ufs.sh/f/q3qRD927C251c9PsIHRIfFgvEApUJ10Z42nCMyPbe8xB7lVm",
      "https://gbxt70nat9.ufs.sh/f/q3qRD927C2517wm0Di5kGFl31PpAJLOI9SiujZsBQMWw5n2V",
      "https://gbxt70nat9.ufs.sh/f/q3qRD927C251qn7XaD27C251gAo4tJbfNz30Z9XmEikjTlpP",
    ],
  },
  {
    title: "Oceanview Modern",
    city: "Miami Beach",
    address: "3 Coral Tide Court, Miami Beach, FL 33141",
    price: 12_900_000,
    bedrooms: 5,
    bathrooms: 6,
    sqft: 7_400,
    lat: 25.85,
    lng: -80.125,
    featured: false,
    description:
      "A crisp waterfront contemporary on a quiet bayfront street, with 100 feet of bay frontage and a private dock for a yacht of up to 80 feet. The interiors pair terrazzo floors with walnut millwork and bronze detailing.\n\nA floating staircase anchors the atrium, while the pool deck, summer kitchen and cabana are designed for effortless entertaining. Smart-home automation, impact glass and a full-house generator complete the offering.",
    imageUrls: [
      "https://gbxt70nat9.ufs.sh/f/q3qRD927C251NOBMNDPeFpykqGo3hl24YxiDa7KOwsguQBvj",
      "https://gbxt70nat9.ufs.sh/f/q3qRD927C251N5UyrRPeFpykqGo3hl24YxiDa7KOwsguQBvj",
      "https://gbxt70nat9.ufs.sh/f/q3qRD927C2514lhmbSw8YeWkuV27SdmEOLwyJazXxTRDjpvQ",
      "https://gbxt70nat9.ufs.sh/f/q3qRD927C251eJNVRr73CKDFbvBmrauY0eSAc74ngIZtdzx1",
      "https://gbxt70nat9.ufs.sh/f/q3qRD927C251g0Tg5isFGXEsT7Dpq5NSPrA6HiIfYMwdcvKU",
    ],
  },
  {
    title: "Tribeca Sky Loft",
    city: "New York",
    address: "4 Skyloft Row, Penthouse, New York, NY 10013",
    price: 16_250_000,
    bedrooms: 4,
    bathrooms: 4.5,
    sqft: 5_200,
    lat: 40.72,
    lng: -74.01,
    featured: false,
    description:
      "A full-floor penthouse crowning a converted loft building, reimagined with 14-foot ceilings, clerestory glazing and a 2,000-square-foot private roof terrace overlooking the river.\n\nThe loft-scaled living and dining room is warmed by a fireplace; the eat-in kitchen features honed marble and custom cabinetry. A keyed elevator opens directly into the residence, and the building offers a 24-hour doorman, fitness centre and private storage.",
    imageUrls: [
      "https://gbxt70nat9.ufs.sh/f/q3qRD927C251j1WJ1fXDopEICx8TejBlrUFS4QMZzGhugOKX",
      "https://gbxt70nat9.ufs.sh/f/q3qRD927C251SV1u1tU0S96EpcGbjRsmKkYyNzQoPCv7edhr",
      "https://gbxt70nat9.ufs.sh/f/q3qRD927C251Aff2svz145rNqxWYLRlVck3QaDuJKbhzwS7i",
      "https://gbxt70nat9.ufs.sh/f/q3qRD927C251lbGqWlZCSjGIHumKPZcBgl2y19X36xaDkLUh",
      "https://gbxt70nat9.ufs.sh/f/q3qRD927C251wUd1DbF5IDFdcjEvt1x9auy2bTrh4KpYHgm3",
    ],
  },
  {
    title: "Alpine Timber Lodge",
    city: "Aspen",
    address: "5 Timberglow Trail, Aspen, CO 81611",
    price: 21_000_000,
    bedrooms: 7,
    bathrooms: 8,
    sqft: 9_800,
    lat: 39.19,
    lng: -106.82,
    featured: true,
    description:
      "Set high above town with sweeping views of the surrounding peaks, this timber-and-stone lodge balances rustic grandeur with contemporary refinement. Reclaimed beams, hand-forged iron and a 30-foot stone fireplace define the great room.\n\nAmenities include a heated outdoor pool and spa, a ski room with boot warmers, a bunk room, a climate-controlled wine cellar and a heated driveway. Minutes from the centre of Aspen and the lifts.",
    imageUrls: [
      "https://gbxt70nat9.ufs.sh/f/q3qRD927C251VVey3Fl97SNE4x5FZJqkjVWfubAvrP6QnpIC",
      "https://gbxt70nat9.ufs.sh/f/q3qRD927C2514lFXSMo8YeWkuV27SdmEOLwyJazXxTRDjpvQ",
      "https://gbxt70nat9.ufs.sh/f/q3qRD927C251llTUdlZCSjGIHumKPZcBgl2y19X36xaDkLUh",
      "https://gbxt70nat9.ufs.sh/f/q3qRD927C251gFG9IxsFGXEsT7Dpq5NSPrA6HiIfYMwdcvKU",
      "https://gbxt70nat9.ufs.sh/f/q3qRD927C251Pt68ll47tJen9Ka5LrswQFZkiIfNcYzXSAou",
    ],
  },
  {
    title: "Georgica Pond Estate",
    city: "East Hampton",
    address: "6 Pondlight Lane, East Hampton, NY 11937",
    price: 14_750_000,
    bedrooms: 6,
    bathrooms: 7,
    sqft: 8_100,
    lat: 40.95,
    lng: -72.2,
    featured: false,
    description:
      "A classic shingle-style estate moments from the pond and the ocean beaches of East Hampton. Wide covered porches, a gambrel roofline and manicured privet hedges frame two acres of lawns, gardens and a gunite pool.\n\nInside, sun-filled reception rooms open to the terrace, and a farmhouse kitchen with a large island anchors family life. Six bedroom suites, a finished lower level with media room, and a pool house with outdoor shower complete this quintessential Hamptons retreat.",
    imageUrls: [
      "https://gbxt70nat9.ufs.sh/f/q3qRD927C251YVImp0dO9gQB2cUbLAoeim3hfW6Py70pKTsr",
      "https://gbxt70nat9.ufs.sh/f/q3qRD927C25106I5lHMwAetoE48cYpSiWGqDl3nd67kxrVXf",
      "https://gbxt70nat9.ufs.sh/f/q3qRD927C251MlMXQewNQX0SGPK1xetkjcdEfY3WaOCBLVgr",
      "https://gbxt70nat9.ufs.sh/f/q3qRD927C251w18P1HF5IDFdcjEvt1x9auy2bTrh4KpYHgm3",
      "https://gbxt70nat9.ufs.sh/f/q3qRD927C251bgefKXnFqze45fDG0odhnx21QZWVtwj6PYyC",
    ],
  },
];

const SAMPLE_LEADS = [
  { name: "Alex Example", email: "alex@example.com", phone: "+1 (555) 555-0101", daysAgo: 0, property: 0, message: "We're relocating in the spring and would love a private viewing of Villa Lumière." },
  { name: "Blake Example", email: "blake@example.com", phone: "+1 (555) 555-0102", daysAgo: 1, property: 1, message: "Is the guest house included in the sale? Interested in a weekend showing." },
  { name: "Casey Example", email: "casey@example.com", phone: "+1 (555) 555-0103", daysAgo: 3, property: 2, message: "Please share dock specifications and HOA details before we visit." },
  { name: "Devon Example", email: "devon@example.com", phone: "+1 (555) 555-0104", daysAgo: 5, property: 3, message: "Can we see the roof terrace at sunset?" },
  { name: "Emery Example", email: "emery@example.com", phone: "", daysAgo: 9, property: 4, message: "Looking for a ski-season home for 2027. Flexible on dates." },
  { name: "Finley Example", email: "finley@example.com", phone: "+1 (555) 555-0106", daysAgo: 14, property: 5, message: "Our family would like to tour the pool house and gardens." },
  { name: "Gray Example", email: "gray@example.com", phone: "+1 (555) 555-0107", daysAgo: 21, property: 2, message: "Represented buyer — please send disclosures." },
  { name: "Harper Example", email: "harper@example.com", phone: "+1 (555) 555-0108", daysAgo: 38, property: 0, message: "Interested in a virtual walkthrough first." },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set. Add it to .env before seeding.");

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  console.log(`Connected to ${mongoose.connection.name}`);

  const passwordHash = await bcrypt.hash(ADMIN.password, 12);
  const admin = await User.findOneAndUpdate(
    { email: ADMIN.email },
    { name: ADMIN.name, email: ADMIN.email, password: passwordHash, role: ADMIN.role },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );
  console.log(`Admin ready: ${ADMIN.email}`);

  await Promise.all([Property.deleteMany({}), Lead.deleteMany({})]);

  const now = Date.now();
  const created = await Property.insertMany(
    PROPERTIES.map((p, i) => ({
      ...p,
      status: "active",
      agentId: admin._id,
      // Stagger creation dates so "newest" sorting is meaningful.
      createdAt: new Date(now - i * 3 * 86_400_000),
      updatedAt: new Date(now - i * 3 * 86_400_000),
    })),
    { timestamps: false },
  );
  console.log(`Inserted ${created.length} properties`);

  const leads = SAMPLE_LEADS.map((l) => {
    const createdAt = new Date(now - l.daysAgo * 86_400_000 - 2 * 3_600_000);
    return {
      name: l.name,
      email: l.email,
      phone: l.phone,
      message: l.message,
      propertyId: created[l.property]._id,
      preferredDate: new Date(createdAt.getTime() + 7 * 86_400_000),
      createdAt,
    };
  });
  await Lead.insertMany(leads);
  console.log(`Inserted ${leads.length} sample leads`);

  await mongoose.disconnect();
  console.log("Seed complete.");
}

main().catch(async (error) => {
  console.error("Seed failed:", error);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
