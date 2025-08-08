// backend/src/routes/users.ts
import { Hono } from "hono";
import { PrismaClient } from "../generated/prisma"; // ✅ Adjust the path if needed
import { authMiddleware } from "../lib/authMiddleware";

const userRoute = new Hono();
const prisma = new PrismaClient(); // ✅ Instantiate Prisma client

import { sign } from "hono/jwt"; // or your preferred JWT lib

userRoute.post("/sync", async (c) => {
  const body = await c.req.json();
  const { email, name, image, role } = body;

  try {
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          image,
          role,
        },
      });
    }

    // Generate JWT token using user's ID + email
    const token = await sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || "your-secret-here" // Use a secure secret
    );

    return c.json({ success: true, token });
  } catch (err) {
    console.error("User sync error:", err);
    return c.json({ success: false, error: "Internal Server Error" }, 500);
  }
});


userRoute.get("/profile", authMiddleware, async (c) => {
  const user = c.get("user"); // `authMiddleware` sets this
  if (!user?.id || user.id.length !== 24) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
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

    return c.json({ user : dbUser });
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
