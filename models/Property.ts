import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const PROPERTY_STATUSES = ["active", "pending", "sold"] as const;
export type PropertyStatus = (typeof PROPERTY_STATUSES)[number];

const PropertySchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true, index: true },
    bedrooms: { type: Number, required: true, min: 0 },
    bathrooms: { type: Number, required: true, min: 0 },
    sqft: { type: Number, required: true, min: 0 },
    lat: { type: Number, required: true, min: -90, max: 90 },
    lng: { type: Number, required: true, min: -180, max: 180 },
    imageUrls: { type: [String], default: [] },
    featured: { type: Boolean, default: false, index: true },
    status: { type: String, enum: PROPERTY_STATUSES, default: "active", index: true },
    agentId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

PropertySchema.index({ price: 1 });
PropertySchema.index({ bedrooms: 1 });

export type PropertyDoc = InferSchemaType<typeof PropertySchema>;

export const Property: Model<PropertyDoc> =
  (models.Property as Model<PropertyDoc>) || model<PropertyDoc>("Property", PropertySchema);

export default Property;
