import { redirect } from "next/navigation";
import { auth } from "@/auth";

/**
 * Defense in depth: the proxy guards /agency/* routes, but Server Actions and
 * Server Components must verify the session themselves as well.
 */
export async function requireSession() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

export async function getSessionUserOrNull() {
  const session = await auth();
  return session?.user ?? null;
}
