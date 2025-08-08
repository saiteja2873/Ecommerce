import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";

// Define authOptions before using it
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
          const res = await fetch("http://localhost:3001/api/users/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              image: user.image,
              role: "USER",
            }),
          });

          const data = await res.json();
          if (data.success && data.token) {
            token.backendToken = data.token; // ✅ store backend JWT
          }
        } catch (error) {
          console.error("User sync failed", error);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string | null | undefined;
        session.user.name = token.name as string | null | undefined;
        session.user.image = token.image as string | null | undefined;
        (session.user as any).role = token.role; // if you extended user type with 'role'
        (session.user as any).token = token.backendToken;
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
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

// No top-level await — define below
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
