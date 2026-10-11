# Astrelle Estates

A light-mode luxury real estate portal with an agency CRM, built on Next.js 16 (App Router), Tailwind CSS v4, shadcn/ui, MongoDB (Mongoose), Auth.js v5, UploadThing, React-Leaflet and Framer Motion.

## Quick start

```bash
npm install
cp .env.example .env        # then fill in the values (see below)
npm run db:up               # optional: MongoDB via Docker (skip if MongoDB runs locally)
npm run seed                # admin account, 6 listings, sample leads
npm run dev                 # http://localhost:3000
```

Agent portal: <http://localhost:3000/agency>. The seeded account is `admin@astrelleestates.com` with password `password123`.

## Demo data

Everything `npm run seed` loads is fictional, so nothing in the demo belongs to a real person or property:

- **Leads** use the surname "Example", `example.com` email addresses, and phone numbers in the `555-01xx` range reserved for fiction.
- **Listings** use invented street names, and their map pins are approximate town-level points rather than real addresses.
- **Images** are free-license stock photography (generic architecture/interior shots, not tied to any specific address or seller, with no identifiable people in frame), mirrored into this project's own UploadThing bucket so the site never depends on Unsplash at runtime.
- **Agency contact details** in [lib/site.ts](lib/site.ts) (phone, office address, email) are placeholders. Replace them before launch.

Real listing photos are added by agents through the upload box in the agent portal.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | yes | e.g. `mongodb://127.0.0.1:27017/aura-estates` |
| `AUTH_SECRET` | yes | Session encryption key. Generate with `npx auth secret` |
| `AUTH_TRUST_HOST` | yes (non-Vercel) | `true` |
| `UPLOADTHING_TOKEN` | yes | UploadThing dashboard → API Keys (v7 token) |
| `NEXT_PUBLIC_SITE_URL` | yes | Absolute origin for canonical URLs, sitemap, OpenGraph and JSON-LD |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | no | Google Search Console ownership tag (also `NEXT_PUBLIC_BING_SITE_VERIFICATION` for Bing) |
| `NEXT_PUBLIC_MAP_TILE_URL` | no | Custom tile server. Defaults to OpenStreetMap with a muted filter |
| `NEXT_PUBLIC_MAP_TILE_ATTRIBUTION` | no | Attribution for a custom tile server |

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js development, production build, production server |
| `npm run seed` | Upserts the admin and **replaces** all properties and leads in the configured database |
| `npm run typecheck` | Generates route types and runs `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run db:up` / `db:down` | Start or stop the MongoDB container from `docker-compose.yml` |

If a local MongoDB service already listens on port 27017, change the host port in `docker-compose.yml` (for example `27018:27017`) and update `MONGODB_URI`.

## Structure

```
app/
  (site)/              public portal: home, /properties, /properties/[id]
  agency/              CRM: overview, listings, leads (protected)
  login/               credentials sign-in
  actions/             server actions (leads, listings, auth)
  api/auth/            Auth.js route handler
  api/uploadthing/     UploadThing file router (core.ts) + route handler
  sitemap.ts robots.ts manifest.ts
auth.ts / auth.config.ts   Auth.js (Credentials + bcrypt) and edge-safe shared config
proxy.ts               protects /agency/* (Next.js 16 name for middleware.ts)
components/
  seo/PropertyJsonLd.tsx   schema.org RealEstateListing + BreadcrumbList
  property/            3D tilt card, carousel, gallery, lead form, search explorer
  map/                 Leaflet maps, loaded client-only via next/dynamic (ssr: false)
lib/                   mongodb connection cache, data access, validation, formatting
models/                User, Property, Lead (Mongoose)
scripts/seed.ts        demo data
```

## Notes

- **Light mode only.** There are no dark variants or theme toggles, and `color-scheme` is pinned to `light`.
- **Route protection.** Next.js 16 renamed `middleware.ts` to `proxy.ts`. The agency layout and every server action also verify the session.
- **Uploads.** Listing photos go to your UploadThing bucket. Only signed-in agents can upload.
- **Maps.** OpenStreetMap's public tiles suit development and light traffic. For production, set `NEXT_PUBLIC_MAP_TILE_URL` to a keyed provider such as Stadia Maps or MapTiler.

## Developer

Built and maintained by **Abhishek Kamyani**, a Full Stack Developer from
Pakistan with 2+ years of experience building web products with React, Next.js
and Node.js.

- **Currently:** Full Stack Developer (Next.js) at AlFactor Inc., plus freelance work
- **Education:** BS Computer Science, Sukkur IBA University
- **Skills:** React, Next.js, TypeScript, Tailwind CSS, Node.js, Express, MongoDB, REST APIs, Jest, Playwright, Docker, CI/CD
- **Other projects:** Sareer Publication Admin Panel (MERN), Tone Shift AI, AI Chef Mate (React Native)

**Contact**

- Portfolio: https://abhishekkamyani.vercel.app/
- Email: abhishekkamyani@gmail.com
- LinkedIn: https://linkedin.com/in/abhishekkamyani
