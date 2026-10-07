/**
 * Seed the Aura Estates database.
 *
 *   npm run seed
 *
 * Upserts the admin account and replaces all properties and leads in the
 * database named in MONGODB_URI with curated demo data.
 */
import { loadEnvConfig } from "@next/env";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { Property } from "../models/Property";
import { Lead } from "../models/Lead";

loadEnvConfig(process.cwd());

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1800&q=80`;

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
    address: "1180 Summit Ridge Drive, Beverly Hills, CA 90210",
    price: 18_750_000,
    bedrooms: 6,
    bathrooms: 8,
    sqft: 11_200,
    lat: 34.0965,
    lng: -118.4126,
    featured: true,
    description:
      "Perched above the Trousdale flats, Villa Lumière is a study in light and proportion. Floor-to-ceiling glass dissolves the boundary between the double-height great room and an infinity-edge pool that appears to spill into the city skyline.\n\nThe residence offers six en-suite bedrooms, a chef's kitchen with Gaggenau appliances and a scullery, a temperature-controlled wine gallery for 1,200 bottles, a screening room, and a wellness level with spa, sauna and gym. A motor court and gated entry ensure absolute privacy.",
    imageUrls: [
      img("1600596542815-ffad4c1539a9"),
      img("1600607687939-ce8a6c25118c"),
      img("1600585152220-90363fe7e115"),
      img("1616594039964-ae9021a400a0"),
      img("1600566752355-35792bedcfea"),
    ],
  },
  {
    title: "The Cypress Residence",
    city: "Malibu",
    address: "27450 Pacific Coast Highway, Malibu, CA 90265",
    price: 24_500_000,
    bedrooms: 5,
    bathrooms: 7,
    sqft: 8_900,
    lat: 34.0259,
    lng: -118.7798,
    featured: true,
    description:
      "A sculptural beach-modern sanctuary set on nearly an acre of bluff-top land with private stairs to the sand. Pale limestone, white oak and walls of retractable glass frame uninterrupted views from Point Dume to Catalina.\n\nThe main level flows to a sunken lounge, a 70-foot pool terrace and a dining pavilion. Upstairs, the primary suite enjoys a wraparound balcony, dual dressing rooms and a stone-clad bath. Includes a two-bedroom guest house and a four-car gallery garage.",
    imageUrls: [
      img("1613977257363-707ba9348227"),
      img("1613545325278-f24b0cae1224"),
      img("1613977257592-4871e5fcd7c4"),
      img("1512918728675-ed5a9ecdebfd"),
      img("1617806118233-18e1de247200"),
    ],
  },
  {
    title: "Oceanview Modern",
    city: "Miami Beach",
    address: "6420 North Bay Road, Miami Beach, FL 33141",
    price: 12_900_000,
    bedrooms: 5,
    bathrooms: 6,
    sqft: 7_400,
    lat: 25.8483,
    lng: -80.1312,
    featured: false,
    description:
      "A crisp waterfront contemporary on the coveted North Bay Road, with 100 feet of bay frontage and a private dock for a yacht of up to 80 feet. Interiors by an acclaimed Milanese studio pair terrazzo floors with walnut millwork and bronze detailing.\n\nA floating steel staircase anchors the atrium, while the pool deck, summer kitchen and cabana are designed for effortless entertaining. Smart-home automation, impact glass and a full-house generator complete the offering.",
    imageUrls: [
      img("1580587771525-78b9dba3b914"),
      img("1600566753086-00f18fb6b3ea"),
      img("1600573472550-8090b5e0745e"),
      img("1600607687644-c7171b42498f"),
      img("1600489000022-c2086d79f9d4"),
    ],
  },
  {
    title: "Tribeca Sky Loft",
    city: "New York",
    address: "88 Franklin Street, Penthouse, New York, NY 10013",
    price: 16_250_000,
    bedrooms: 4,
    bathrooms: 4.5,
    sqft: 5_200,
    lat: 40.7178,
    lng: -74.0049,
    featured: false,
    description:
      "A full-floor penthouse crowning a landmark cast-iron building, reimagined with 14-foot ceilings, clerestory glazing and a 2,000-square-foot private roof terrace overlooking the Hudson.\n\nThe loft-scaled living and dining room is warmed by a wood-burning fireplace; the eat-in kitchen features honed Calacatta and custom Boffi cabinetry. A keyed elevator opens directly into the residence, and the building offers a 24-hour doorman, fitness centre and private storage.",
    imageUrls: [
      img("1618221195710-dd6b41faaea6"),
      img("1522708323590-d24dbb6b0267"),
      img("1484154218962-a197022b5858"),
      img("1505691938895-1758d7feb511"),
      img("1545324418-cc1a3fa10c00"),
    ],
  },
  {
    title: "Alpine Timber Lodge",
    city: "Aspen",
    address: "455 Red Mountain Road, Aspen, CO 81611",
    price: 21_000_000,
    bedrooms: 7,
    bathrooms: 8,
    sqft: 9_800,
    lat: 39.2045,
    lng: -106.8121,
    featured: true,
    description:
      "Set high on Red Mountain with sweeping views of Aspen Mountain and the Elk Range, this timber-and-stone lodge balances rustic grandeur with contemporary refinement. Reclaimed beams, hand-forged iron and a 30-foot stone fireplace define the great room.\n\nAmenities include a heated outdoor pool and spa, a ski room with boot warmers, a bunk room, a climate-controlled wine cellar and a heated driveway. Minutes from downtown Aspen and the gondola.",
    imageUrls: [
      img("1568605114967-8130f3a36994"),
      img("1600210492486-724fe5c67fb0"),
      img("1600047508788-786f3865b4b9"),
      img("1600121848594-d8644e57abab"),
      img("1493809842364-78817add7ffb"),
    ],
  },
  {
    title: "Georgica Pond Estate",
    city: "East Hampton",
    address: "12 Further Lane, East Hampton, NY 11937",
    price: 14_750_000,
    bedrooms: 6,
    bathrooms: 7,
    sqft: 8_100,
    lat: 40.9502,
    lng: -72.2037,
    featured: false,
    description:
      "A classic shingle-style estate moments from Georgica Pond and the ocean beaches of East Hampton village. Wide covered porches, a gambrel roofline and manicured privet hedges frame two acres of lawns, gardens and a gunite pool.\n\nInside, sun-filled reception rooms open to the terrace, and a farmhouse kitchen with a large island anchors family life. Six bedroom suites, a finished lower level with media room, and a pool house with outdoor shower complete this quintessential Hamptons retreat.",
    imageUrls: [
      img("1570129477492-45c003edd2be"),
      img("1583608205776-bfd35f0d9f83"),
      img("1600566753190-17f0baa2a6c3"),
      img("1505691938895-1758d7feb511"),
      img("1600489000022-c2086d79f9d4"),
    ],
  },
];

const SAMPLE_LEADS = [
  { name: "Charlotte Whitmore", email: "charlotte.whitmore@example.com", phone: "+1 (212) 555-0186", daysAgo: 0, property: 0, message: "We're relocating from London in the spring and would love a private viewing of Villa Lumière." },
  { name: "Julian Ashford", email: "julian.ashford@example.com", phone: "+1 (310) 555-0127", daysAgo: 1, property: 1, message: "Is the guest house included in the sale? Interested in a weekend showing." },
  { name: "Isabella Marchetti", email: "i.marchetti@example.com", phone: "+39 02 5550 1934", daysAgo: 3, property: 2, message: "Please share dock specifications and HOA details before we visit." },
  { name: "Theodore Lang", email: "theo.lang@example.com", phone: "+1 (646) 555-0199", daysAgo: 5, property: 3, message: "Can we see the roof terrace at sunset?" },
  { name: "Amelia Hart", email: "amelia.hart@example.com", phone: "", daysAgo: 9, property: 4, message: "Looking for a ski-season home for 2027. Flexible on dates." },
  { name: "Sebastian Cole", email: "sebastian.cole@example.com", phone: "+1 (631) 555-0144", daysAgo: 14, property: 5, message: "Our family would like to tour the pool house and gardens." },
  { name: "Olivia Reyes", email: "olivia.reyes@example.com", phone: "+1 (305) 555-0175", daysAgo: 21, property: 2, message: "Represented buyer — please send disclosures." },
  { name: "Henry Beaumont", email: "henry.beaumont@example.com", phone: "+44 20 7946 0321", daysAgo: 38, property: 0, message: "Interested in a virtual walkthrough first." },
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
