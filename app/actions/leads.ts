"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { leadSchema } from "@/lib/validations";
import { Lead } from "@/models/Lead";
import { Property } from "@/models/Property";

export type LeadField = "name" | "email" | "phone" | "message" | "preferredDate" | "propertyId";

export interface LeadFormState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<LeadField, string[]>>;
  /** Echoed back on error so the form keeps what the visitor typed. */
  values?: Partial<Record<LeadField, string>>;
}

export async function submitLead(_prev: LeadFormState, formData: FormData): Promise<LeadFormState> {
  // Honeypot: real visitors never see or fill this field.
  if (String(formData.get("company") ?? "").length > 0) {
    return { status: "success", message: "Thank you. Our concierge will be in touch shortly." };
  }

  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    message: String(formData.get("message") ?? ""),
    preferredDate: String(formData.get("preferredDate") ?? ""),
    propertyId: String(formData.get("propertyId") ?? ""),
  };

  const parsed = leadSchema.safeParse(values);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please review the highlighted fields.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }

  const { preferredDate, ...data } = parsed.data;
  let viewingDate: Date | undefined;
  if (preferredDate) {
    viewingDate = new Date(`${preferredDate}T12:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (viewingDate < today) {
      return {
        status: "error",
        message: "Please review the highlighted fields.",
        fieldErrors: { preferredDate: ["Please choose a date in the future."] },
        values,
      };
    }
  }

  try {
    await connectDB();
    const exists = await Property.exists({ _id: data.propertyId });
    if (!exists) {
      return { status: "error", message: "This residence is no longer available.", values };
    }
    await Lead.create({ ...data, preferredDate: viewingDate });
  } catch (error) {
    console.error("[submitLead]", error);
    return {
      status: "error",
      message: "We couldn't submit your request right now. Please try again in a moment.",
      values,
    };
  }

  revalidatePath("/agency", "layout");
  return {
    status: "success",
    message: `Thank you, ${data.name.split(" ")[0]}. A private client advisor will contact you within 24 hours to confirm your viewing.`,
  };
}
