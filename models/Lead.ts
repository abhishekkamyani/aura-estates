import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const LeadSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
  phone: { type: String, trim: true, default: "", maxlength: 40 },
  message: { type: String, trim: true, default: "", maxlength: 2000 },
  preferredDate: { type: Date },
  propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true, index: true },
  createdAt: { type: Date, default: Date.now, index: true },
});

export type LeadDoc = InferSchemaType<typeof LeadSchema>;

export const Lead: Model<LeadDoc> =
  (models.Lead as Model<LeadDoc>) || model<LeadDoc>("Lead", LeadSchema);

export default Lead;
