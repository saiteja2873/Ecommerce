import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string; // required
      role: string; // required
      backendToken?: string; // optional
    } & DefaultSession["user"];
  }

  interface User {
    id: string; // required
    role: string; // required
    backendToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email?: string;
    name?: string;
    image?: string;
    role: string;
    backendToken?: string;
  }
}
