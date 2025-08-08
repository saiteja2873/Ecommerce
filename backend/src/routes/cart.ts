import { Hono } from "hono";
import { z } from "zod";
import { db } from "../lib/db";
import { authMiddleware } from "../lib/authMiddleware";

const cartRoute = new Hono();

cartRoute.use("*", authMiddleware);

const bodySchema = z.object({
  productId: z.string(),
  variantLabel: z.string().optional(),
  quantity: z.number().min(1),
});

// 🛒 GET CART
cartRoute.get("/", async (c) => {
  const user = c.get("user");
  if (!user?.id) return c.json({ error: "Unauthorized" }, 401);

  const cart = await db.cart.findFirst({
    where: { userId: user.id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!cart) return c.json({ items: [] });

  const cartItems = cart.items.map((item) => ({
    id: item.productId, // Used for local matching
    name: item.product?.name ?? "Unknown Product",
    price: item.product?.price ?? 0,
    imageUrl: item.product?.thumbnail ?? "",
    quantity: item.quantity,
    variant: item.variantLabel ?? undefined,
  }));
  console.log(cartItems);
  return c.json({ items: cartItems });
});

// ➕ ADD or INCREMENT ITEM
cartRoute.post("/", async (c) => {
  const user = c.get("user");
  console.log(user);
  if (!user?.id) return c.json({ error: "Unauthorized" }, 401);

  const body = await c.req.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return c.json({ error: "Invalid input" }, 400);

  const { productId, variantLabel, quantity } = parsed.data;

  let cart = await db.cart.findFirst({ where: { userId: user.id } });
  if (!cart) {
    cart = await db.cart.create({ data: { userId: user.id } });
  }

  const existing = await db.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId,
      variantLabel: variantLabel ?? null,
    },
  });

  const cartItem = existing
    ? await db.cartItem.update({
        where: { id: existing.id },
        data: { quantity: { increment: quantity } },
      })
    : await db.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantLabel: variantLabel ?? null,
          quantity,
        },
      });

  return c.json(cartItem);
});

// 🔄 UPDATE ITEM QUANTITY
cartRoute.patch("/", async (c) => {
  const user = c.get("user");
  // console.log(user)
  if (!user?.id) return c.json({ error: "Unauthorized" }, 401);

  const body = await c.req.json();
  const { productId, variantLabel, quantity } = body;
  console.log(body);

  if (!productId || typeof quantity !== "number") {
    return c.json({ error: "Missing productId or quantity" }, 400);
  }

  // Fetch the user's cart
  const cart = await db.cart.findFirst({ where: { userId: user.id } });
  if (!cart) return c.json({ error: "Cart not found" }, 404);

  // Find matching cart item by variant label (optional)
  // const 
  const item = await db.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId,
      variantLabel: variantLabel ?? null, // null if no variant
    },
  });

  if (!item) return c.json({ error: "Item not found in cart" }, 404);

  // Optional: stock validation (optional server-side check)
  if (item.variantId) {
    const variant = await db.variantStock.findUnique({
      where: { id: item.variantId },
    });
    if (variant && quantity > variant.quantity) {
      return c.json({ error: `Only ${variant.quantity} items in stock.` }, 400);
    }
  }

  // Update quantity
  const updatedItem = await db.cartItem.update({
    where: { id: item.id },
    data: { quantity },
  });

  return c.json(updatedItem);
});

// ❌ REMOVE ITEM
cartRoute.delete("/", async (c) => {
  const user = c.get("user");
  if (!user?.id) return c.json({ error: "Unauthorized" }, 401);

  const { productId, variantLabel } = await c.req.json();

  const cart = await db.cart.findFirst({ where: { userId: user.id } });
  if (!cart) return c.json({ error: "Cart not found" }, 404);

  const item = await db.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId,
      variantLabel: variantLabel ?? null,
    },
  });

  if (!item) return c.json({ error: "Item not found in your cart" }, 404);

  await db.cartItem.delete({ where: { id: item.id } });

  return c.json({ success: true });
});

// 🧹 CLEAR CART (optional, if called by frontend)
cartRoute.post("/clear", async (c) => {
  const user = c.get("user");
  if (!user?.id) return c.json({ error: "Unauthorized" }, 401);

  const cart = await db.cart.findFirst({ where: { userId: user.id } });
  if (!cart) return c.json({ success: true }); // already empty

  await db.cartItem.deleteMany({ where: { cartId: cart.id } });

  return c.json({ success: true });
});

export default cartRoute;
