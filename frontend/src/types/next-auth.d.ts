import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role?: string;
      backendToken?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    role?: string;
    backendToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    email?: string;
    name?: string;
    image?: string;
    role?: string;
    backendToken?: string;
  }
}
