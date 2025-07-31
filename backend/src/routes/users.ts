// backend/src/routes/users.ts
import { Hono } from "hono";
import { PrismaClient } from "../generated/prisma"; // ✅ Adjust the path if needed
import { authMiddleware } from "../lib/authMiddleware";

const userRoute = new Hono();
const prisma = new PrismaClient(); // ✅ Instantiate Prisma client

userRoute.post("/sync", async (c) => {
  const body = await c.req.json();
  const { email, name, image, role } = body;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });

    if (!existing) {
      await prisma.user.create({
        data: {
          email,
          name,
          image,
          role,
        },
      });
    }

    return c.json({ success: true });
  } catch (err) {
    console.error("User sync error:", err);
    return c.json({ success: false, error: "Internal Server Error" }, 500);
  }
});


userRoute.get("/profile", authMiddleware, async (c) => {
  const payload = c.get("jwtPayload"); // `authMiddleware` sets this
  if (!payload || !payload.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Add/remove fields you want to expose
      },
    });

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json({ user });
  } catch (err) {
    console.error("Fetch profile error:", err);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});


// 🔍 Fetch user by email (for Google login users)
userRoute.post("/by-email", async (c) => {
  const { email } = await c.req.json();

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json({ user });
  } catch (err) {
    console.error("Fetch by email error:", err);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

export default userRoute;
