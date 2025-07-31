import { MiddlewareHandler } from "hono";
import { verify } from "hono/jwt";
import { PrismaClient } from "../generated/prisma"; // adjust if needed

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET!;

interface JWTPayload {
  id: string;
  iat?: number;
  exp?: number;
}

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = await verify(token, JWT_SECRET) as unknown as JWTPayload;
    c.set("jwtPayload", payload);
    console.log(payload)
    console.log(payload.id)

    if (!payload.id) {
      return c.json({ error: "Invalid token payload" }, 400);
    }

    const user = await prisma.user.findUnique({
      where: {
        id: payload.id,
      },
    });

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    // c.set("user", user); // You can access this later in routes using `c.get("user")`
    await next();
  } catch (err) {
    console.error("JWT Verify Error:", err);
    return c.json({ error: "Invalid token" }, 403);
  }
};
