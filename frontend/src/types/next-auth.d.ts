import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      token?: string; // ✅ Add this line
    };
  }

  interface User {
    id: string;
    role?: string;
    token?: string; // ✅ Optional if you also want to extend User
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    email?: string;
    name?: string;
    image?: string;
    role?: string;
    token?: string; // ✅ Add this line
  }
}
