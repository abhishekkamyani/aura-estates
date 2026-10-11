import { z } from "zod";
import { isAllowedImageUrl } from "@/lib/constants";

export const leadSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(120),
  email: z.string().trim().toLowerCase().pipe(z.email("Please enter a valid email address.")),
  phone: z
    .string()
    .trim()
    .max(40)
    .regex(/^[0-9+().\-\s]*$/, "Please enter a valid phone number.")
    .optional()
    .default(""),
  message: z.string().trim().max(2000).optional().default(""),
  preferredDate: z
    .string()
    .trim()
    .regex(/^(\d{4}-\d{2}-\d{2})?$/, "Please choose a valid date.")
    .optional()
    .default(""),
  propertyId: z.string().regex(/^[a-f0-9]{24}$/i, "Unknown property."),
});

export type LeadInput = z.input<typeof leadSchema>;

export const propertySchema = z
  .object({
    title: z.string().trim().min(4, "Title is too short.").max(140),
    description: z.string().trim().min(20, "Add at least a short description (20+ characters).").max(6000),
    price: z.coerce.number().int().positive("Price must be greater than zero.").max(1_000_000_000),
    address: z.string().trim().min(4, "Address is required.").max(200),
    city: z.string().trim().min(2, "City is required.").max(80),
    bedrooms: z.coerce.number().int().min(0).max(50),
    bathrooms: z.coerce.number().min(0).max(50),
    sqft: z.coerce.number().int().positive("Interior size is required.").max(500_000),
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
    imageUrls: z
      .array(z.string().refine(isAllowedImageUrl, "Images must be uploaded through UploadThing."))
      .min(1, "Upload at least one photograph.")
      .max(24),
    featured: z.boolean().default(false),
    status: z.enum(["active", "pending", "sold"]).default("active"),
  })
  .refine((v) => !(v.lat === 0 && v.lng === 0), {
    message: "Set the property location on the map.",
    path: ["lat"],
  });

export type PropertyInput = z.input<typeof propertySchema>;
