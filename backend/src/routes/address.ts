// src/routes/address.ts
import { Hono } from "hono";
import { PrismaClient } from "../generated/prisma";
import { authMiddleware } from "../lib/authMiddleware";

const prisma = new PrismaClient();
const addressRoute = new Hono();

addressRoute.use("*", authMiddleware);
// ✅ Add new address
addressRoute.post("/add", async (c) => {
  try {
    const user = c.get("user");
    if (!user?.id)
      return c.json({ success: false, error: "Unauthorized" }, 401);

    const formData = await c.req.json();

    // Check if this address already exists for the user
    const existingAddress = await prisma.address.findFirst({
      where: {
        userId: user.id,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        country: formData.country,
      },
    });

    if (existingAddress) {
      return c.json({ success: false, error: "Address already exists" }, 400);
    }

    // Create new address
    const newAddress = await prisma.address.create({
      data: {
        ...formData,
        userId: user.id,
      },
    });

    return c.json({ success: true, address: newAddress });
  } catch (error) {
    console.error("Add Address Error:", error);
    return c.json({ success: false, error: "Failed to add address" }, 500);
  }
});

// ✅ Get all addresses for a user
addressRoute.get("/user/me", async (c) => {
  // const userId = c.req.param("user");
  // console.log("userId :",userId.id)
  try {
    const user = c.get("user");
    const userId = user.id;
    // console.log(userId)
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
addressRoute.put("/update/me", async (c) => {
  try {
    const user = c.get("user");
    const userId = user.id;

    const data = await c.req.json();
    const { id, ...updateData } = data;

    const existing = await prisma.address.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== userId) {
      return c.json({ success: false, error: "Unauthorized or address not found" }, 403);
    }

    const updated = await prisma.address.update({
      where: { id },
      data: updateData,
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
