// routes/upload.ts

import { Hono } from "hono";
import { randomUUID } from "crypto";

export const uploadRoute = new Hono();

uploadRoute.post("/upload", async (c) => {
  const formData = await c.req.formData();
  const file = formData.get("image");

  if (!(file instanceof File)) {
    return c.json({ error: "Invalid file" }, 400);
  }

  const ext = file.name.split(".").pop();
  const filename = `${randomUUID()}.${ext}`;
  const fileBytes = await file.arrayBuffer();

  await Bun.write(`public/uploads/${filename}`, new Uint8Array(fileBytes));

  return c.json({
    success: true,
    url: `/uploads/${filename}`, // Save this in MongoDB
  });
});
