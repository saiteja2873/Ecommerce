// backend/src/types/hono.d.ts (or backend/types/global.d.ts)

import type { User } from "../generated/prisma";

declare module "hono" {
  interface ContextVariableMap {
    user: User;
    jwtPayload: {
      id: string;
      iat?: number;
      exp?: number;
    };
  }
}
