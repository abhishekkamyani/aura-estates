"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";

function safeCallbackUrl(value: FormDataEntryValue | null) {
  const url = typeof value === "string" ? value : "";
  // Only allow same-origin relative paths to prevent open redirects.
  if (url.startsWith("/") && !url.startsWith("//") && !url.startsWith("/\\")) return url;
  return "/agency";
}

export type LoginState = { error: string; email: string } | undefined;

export async function authenticate(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  try {
    await signIn("credentials", {
      email,
      password: String(formData.get("password") ?? ""),
      redirectTo: safeCallbackUrl(formData.get("callbackUrl")),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      // Echo the email back so the field survives React's post-action form reset.
      return {
        email,
        error:
          error.type === "CredentialsSignin"
            ? "Invalid email or password."
            : "We couldn't sign you in. Please try again.",
      };
    }
    // Successful sign-in throws a redirect, which must be re-thrown.
    throw error;
  }
  return undefined;
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}
