// backend/src/auth.ts
import { Hono } from "hono";
import { z } from "zod";
import { PrismaClient } from "../generated/prisma";
import { sign } from "hono/jwt";
import bcrypt from "bcryptjs";
import { db } from "../lib/db";

const authRoute = new Hono();
const prisma = new PrismaClient();

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

authRoute.post("/login", async (c) => {
  const body = await c.req.json();
  const parse = loginSchema.safeParse(body);

  if (!parse.success) {
    return c.json(
      { message: "Invalid input", details: z.treeifyError(parse.error) },
      400
    );
  }

  const { email, password } = parse.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      return c.json({ message: "Invalid Email or Password" }, 401);
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return c.json({ message: "Invalid Email or Password" }, 401);
    }

    const now = Math.floor(Date.now() / 1000); // current time in seconds
    const expiresIn = 60 * 60 * 24 * 7; // 7 days

    const token = await sign(
      {
        id: user.id,
        role: user.role,
        email: user.email,
        exp: now + expiresIn, // ⏳ expires in 7 days
      },
      process.env.JWT_SECRET || "your-secret"
    );

    return c.json({
      token,
      id: user.id,
      name: user.name || null,
      email: user.email,
      image: user.image || null,
      role: user.role.toString(),
      loginMethod: "manual", // ✅ added this field
    });
  } catch (err) {
    console.error("Login error:", err);
    return c.json({ message: "Internal Server Error" }, 500);
  }
});





// Register 
import { sendVerificationEmail } from "../lib/mail";

authRoute.post("/register", async (c) => {
  const body = await c.req.json();

  const schema = z.object({
    email: z.email(),
    password: z.string().min(8),
    firstName: z.string(),
    lastName: z.string(),
  });

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return c.json({ message: "Invalid input" }, 400);
  }

  const { email, password, firstName, lastName } = parsed.data;

  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    return c.json({ message: "User already exists" }, 409);
  }

  // Remove any old token if present
  const existingToken = await db.verificationToken.findFirst({ where: { email } });
  if (existingToken) {
    await db.verificationToken.delete({ where: { id: existingToken.id } });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // 🔢 Generate a 6-digit OTP (e.g. 348271)
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 1000 * 60 * 10); // expires in 10 minutes

  await db.verificationToken.create({
    data: {
      email,
      otp: otp,
      expiresAt: expires,
      ipAddress: c.req.header("x-forwarded-for") || "",
      userAgent: c.req.header("user-agent") || "",
      type: "otp_verification",
      meta: {
        password: hashedPassword,
        name: `${firstName} ${lastName}`,
        role: "USER",
      },
    },
  });

  await sendVerificationEmail(email, otp); // ✉️ Send numeric OTP

  return c.json({ message: "OTP sent to your email." });
});

export default authRoute
