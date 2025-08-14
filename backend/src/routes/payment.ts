// routes/payment.ts
import { Hono } from "hono";
import Razorpay from "razorpay";

export const payment = new Hono();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

payment.post("/create-order", async (c) => {
  try {
    const { amount } = await c.req.json<{ amount: number }>();

    // Validate amount is positive and within reasonable limits (say max 1 lakh)
    if (!amount || amount <= 0 || amount > 100000) {
      return c.json({ error: "Invalid amount" }, 400);
    }

    // Check if keys are set
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return c.json({ error: "Payment gateway keys not configured" }, 500);
    }

    const options = {
      amount: amount * 100, // paise
      currency: "INR",
      receipt: `order_rcptid_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return c.json({
      order,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err: any) {
    console.error("Razorpay order creation failed:", err);
    return c.json({ error: err.message || "Internal Server Error" }, 500);
  }
});


import crypto from "crypto";

payment.post("/verify", async (c) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await c.req.json();

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature === razorpay_signature) {
      return c.json({ status: "success" });
    } else {
      return c.json({ status: "failure", message: "Invalid signature" }, 400);
    }
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});
