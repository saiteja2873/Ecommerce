// src/routes/address.ts
import { Hono } from "hono";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();
const addressRoute = new Hono();

// ✅ Add new address
addressRoute.post("/add", async (c) => {
  try {
    const data = await c.req.json();
    const address = await prisma.address.create({ data });
    return c.json({ success: true, address });
  } catch (error) {
    console.error("Add Address Error:", error);
    return c.json({ success: false, error: "Failed to add address" }, 500);
  }
});

// ✅ Get all addresses for a user
addressRoute.get("/user/:userId", async (c) => {
  const userId = c.req.param("userId");
  try {
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return c.json({ success: true, addresses });
  } catch (error) {
    console.error("Fetch Addresses Error:", error);
    return c.json({ success: false, error: "Failed to fetch addresses" }, 500);
  }
});

// ✅ Update address
addressRoute.put("/update/:id", async (c) => {
  const id = c.req.param("id");
  const data = await c.req.json();

  try {
    const updated = await prisma.address.update({
      where: { id },
      data,
    });
    return c.json({ success: true, address: updated });
  } catch (error) {
    console.error("Update Address Error:", error);
    return c.json({ success: false, error: "Failed to update address" }, 500);
  }
});

// ✅ Delete address
addressRoute.delete("/delete/:id", async (c) => {
  const id = c.req.param("id");

  try {
    await prisma.address.delete({ where: { id } });
    return c.json({ success: true, message: "Address deleted" });
  } catch (error) {
    console.error("Delete Address Error:", error);
    return c.json({ success: false, error: "Failed to delete address" }, 500);
  }
});

export default addressRoute;
