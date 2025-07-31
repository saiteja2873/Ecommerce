// src/lib/mail.ts
import nodemailer from "nodemailer";

export async function sendVerificationEmail(email: string, otp: string) {
  console.log("📧 Sending OTP to:", email);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: email,
    subject: "Your One-Time Password (OTP)",
    html: `
      <h2>Verify Your Email</h2>
      <p>Your OTP is:</p>
      <div style="font-size: 24px; font-weight: bold; margin: 10px 0;">${otp}</div>
      <p>This otp will expire in 10 minutes.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ OTP sent successfully.");
  } catch (err) {
    console.error("❌ Failed to send OTP :", err);
  }
}
