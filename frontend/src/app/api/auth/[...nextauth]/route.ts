import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user && account?.provider === "google") {
        token.id = profile?.sub ?? user.id;
        token.email = user.email ?? undefined;
        token.name = user.name ?? undefined;
        token.image = user.image ?? undefined;
        token.role = "USER";

        try {
          const res = await fetch(
            "https://ecommerce-j5j0.onrender.com/api/users/sync",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: user.email,
                name: user.name,
                image: user.image,
                role: "USER",
              }),
            }
          );

          const data = await res.json();
          if (data.success && data.token) {
            token.backendToken = data.token;
          }
        } catch (error) {
          console.error("User sync failed", error);
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        session.user.email = token.email ?? null;
        session.user.name = token.name ?? null;
        session.user.image = token.image ?? null;
        (session.user as any).role = token.role;
        (session.user as any).backendToken = token.backendToken;
      }
      return session;
    },

    async redirect({ baseUrl }) {
      return baseUrl;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
  },
};

// ✅ Wrap in request handlers for App Router
const handler = NextAuth(authOptions);
export const GET = handler;
export const POST = handler;
