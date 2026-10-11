import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js config shared by `auth.ts` and `proxy.ts`.
 * It must not import Mongoose or bcrypt, so providers are attached in `auth.ts`.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8, // 8 hours
  },
  trustHost: true,
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user);
      if (nextUrl.pathname.startsWith("/agency")) {
        // Returning false redirects to `pages.signIn` with a callbackUrl.
        return isLoggedIn;
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "agent";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? token.sub ?? "";
        session.user.role = (token.role as "admin" | "agent") ?? "agent";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
