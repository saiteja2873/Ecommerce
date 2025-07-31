// // lib/token.ts
// import { db } from "../lib/db"; // Your Prisma client
// import crypto from "crypto";

// export async function generateVerificationToken(email: string, ip: string, userAgent: string) {
//   const token = crypto.randomUUID(); // Or use a crypto-safe token generator
//   const expires = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes

//   await db.verificationToken.create({
//     data: {
//       email,
//       token,
//       expiresAt: expires,
//       ipAddress: ip,
//       userAgent: userAgent,
//       type: "email_verification"
//     }
//   });

//   return {token, expires};
// }
