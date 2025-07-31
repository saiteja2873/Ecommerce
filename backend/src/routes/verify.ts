import { Hono } from "hono";
// import { generateVerificationToken } from "../lib/token";
import { sendVerificationEmail } from "../lib/mail";
import { db } from "../lib/db";
import { Role } from "../generated/prisma";
import { sign } from "hono/jwt";

const verifyRouter = new Hono();

// verifyRouter.post("/verify-email", async (c) => {
//   const { email } = await c.req.json();
//   const ipAddress = c.req.header("x-forwarded-for") || "";
//   const userAgent = c.req.header("user-agent") || "";

//   if (!email) {
//     return c.json({ error: "Email is required" }, 400);
//   }

//   try {
//     const tokenData = await generateVerificationToken(
//       email,
//       ipAddress,
//       userAgent
//     );

//     await sendVerificationEmail(email, tokenData.token); // 👈 send email here

//     return c.json({ message: "Verification email sent" });
//   } catch (error) {
//     console.error("Token generation failed", error);
//     return c.json({ error: "Internal Server Error" }, 500);
//   }
// });

verifyRouter.get("/", async (c) => {
  const email = c.req.query("email");
  const otp = c.req.query("otp");

  if (!email || !otp) {
    return c.json({ message: "Email and OTP are required." }, 400);
  }

  console.log("email", email);
  console.log("otp", otp);

  try {
    const stored = await db.verificationToken.findFirst({
      where: {
        email,
        otp,
        type: "otp_verification",
      },
    });

    console.log(stored)

    if (!stored || stored.isUsed || new Date() > stored.expiresAt) {
      return c.json({ message: "Invalid or expired OTP." }, 400);
    }


    const { meta } = stored;

    let parsedMeta: { password: string; name: string; role: string };
    try {
      parsedMeta = typeof meta === "string" ? JSON.parse(meta) : meta;
    } catch {
      return c.json({ message: "Corrupted verification data." }, 400);
    }

    const { name, password, role } = parsedMeta;

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return c.json({ message: "User already exists." }, 409);
    }

    const createdUser = await db.user.create({
      data: {
        email,
        name,
        password,
        role: role as Role,
        emailVerified : true,
      },
    });

    await db.verificationToken.update({
      where: { id: stored.id },
      data: { isUsed: true },
    });

    const expires = 60 * 60 * 24 * 7; // 7 days

    const jwtToken = await sign(
      {
        id: createdUser.id,
        email: createdUser.email,
        role: createdUser.role,
        exp: Math.floor(Date.now() / 1000) + expires,
      },
      process.env.JWT_SECRET || "your_secret"
    );

    return c.json(
      {
        message: "OTP verified. Account created successfully.",
        token: jwtToken,
        user: {
          id: createdUser.id,
          email: createdUser.email,
          name: createdUser.name,
        },
      },
      200
    );
  } catch (err) {
    console.error("Verification error:", err);
    return c.json({ message: "Internal server error." }, 500);
  }
});

export default verifyRouter;
