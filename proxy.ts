import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

/**
 * Route protection for the agency CRM.
 *
 * Next.js 16 renamed the `middleware.ts` convention to `proxy.ts`; behaviour is
 * identical. Unauthenticated requests to /agency/* are redirected to /login
 * by the `authorized` callback in auth.config.ts.
 */
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: ["/agency/:path*"],
};
