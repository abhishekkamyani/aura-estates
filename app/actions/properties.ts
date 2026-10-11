"use server";

import { revalidatePath } from "next/cache";
import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { propertySchema, type PropertyInput } from "@/lib/validations";
import { Property } from "@/models/Property";
import type { PropertyStatus } from "@/types/property";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> };

async function requireAgent() {
  const session = await auth();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  return session.user;
}

function revalidateListing(id?: string) {
  revalidatePath("/");
  revalidatePath("/properties");
  if (id) revalidatePath(`/properties/${id}`);
  revalidatePath("/agency", "layout");
  revalidatePath("/sitemap.xml");
}

function unauthorized(): ActionResult<never> {
  return { ok: false, error: "Your session has expired. Please sign in again." };
}

export async function saveProperty(
  input: PropertyInput,
  id?: string,
): Promise<ActionResult<{ id: string }>> {
  let user;
  try {
    user = await requireAgent();
  } catch {
    return unauthorized();
  }

  const parsed = propertySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please review the highlighted fields.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  try {
    await connectDB();
    if (id) {
      if (!isValidObjectId(id)) return { ok: false, error: "Unknown listing." };
      const updated = await Property.findByIdAndUpdate(id, parsed.data, {
        returnDocument: "after",
        runValidators: true,
      });
      if (!updated) return { ok: false, error: "This listing no longer exists." };
      revalidateListing(id);
      return { ok: true, data: { id } };
    }

    const created = await Property.create({ ...parsed.data, agentId: user.id || undefined });
    const newId = created._id.toString();
    revalidateListing(newId);
    return { ok: true, data: { id: newId } };
  } catch (error) {
    console.error("[saveProperty]", error);
    return { ok: false, error: "The listing could not be saved. Please try again." };
  }
}

export async function deleteProperty(id: string): Promise<ActionResult> {
  try {
    await requireAgent();
  } catch {
    return unauthorized();
  }
  if (!isValidObjectId(id)) return { ok: false, error: "Unknown listing." };

  try {
    await connectDB();
    const deleted = await Property.findByIdAndDelete(id);
    if (!deleted) return { ok: false, error: "This listing no longer exists." };
    revalidateListing(id);
    return { ok: true };
  } catch (error) {
    console.error("[deleteProperty]", error);
    return { ok: false, error: "The listing could not be deleted." };
  }
}

export async function setPropertyFeatured(id: string, featured: boolean): Promise<ActionResult> {
  try {
    await requireAgent();
  } catch {
    return unauthorized();
  }
  if (!isValidObjectId(id)) return { ok: false, error: "Unknown listing." };

  try {
    await connectDB();
    await Property.findByIdAndUpdate(id, { featured: Boolean(featured) });
    revalidateListing(id);
    return { ok: true };
  } catch (error) {
    console.error("[setPropertyFeatured]", error);
    return { ok: false, error: "Could not update the listing." };
  }
}

const statusSchema = z.enum(["active", "pending", "sold"]);

export async function setPropertyStatus(id: string, status: PropertyStatus): Promise<ActionResult> {
  try {
    await requireAgent();
  } catch {
    return unauthorized();
  }
  const parsed = statusSchema.safeParse(status);
  if (!parsed.success || !isValidObjectId(id)) return { ok: false, error: "Invalid update." };

  try {
    await connectDB();
    await Property.findByIdAndUpdate(id, { status: parsed.data }, { runValidators: true });
    revalidateListing(id);
    return { ok: true };
  } catch (error) {
    console.error("[setPropertyStatus]", error);
    return { ok: false, error: "Could not update the listing status." };
  }
}
