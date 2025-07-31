import { Hono } from "hono";
import { randomUUID } from "crypto";
import { PrismaClient } from "../generated/prisma";
import slugify from "slugify";

const prisma = new PrismaClient();
export const productRoutes = new Hono();

// 🔧 Utility to generate unique SKU
function generateSku(name: string): string {
  const prefix = name
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, 3)
    .toUpperCase(); // e.g., "APP"
  const timestamp = Date.now().toString().slice(-5); // last 5 digits of timestamp
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0"); // e.g., "053"
  return `${prefix}-${timestamp}-${random}`; // e.g., "APP-58291-053"
}

productRoutes.post("/", async (c) => {
  try {
    const formData = await c.req.formData();

    // Extract fields
    const name = formData.get("name")?.toString().trim();
    const priceRaw = formData.get("price")?.toString();
    const price = parseFloat(priceRaw || "");
    const description = formData.get("description")?.toString().trim() || "";
    const categoryId = formData.get("categoryId")?.toString().trim();
    const brand = formData.get("brand")?.toString().trim() || "";
    const color = formData.get("color")?.toString().trim() || "";

    // ✅ Extract all images
    const imagesRaw = formData.getAll("images") as File[];

    // Validate fields
    if (!name || isNaN(price) || !categoryId || imagesRaw.length === 0) {
      return c.json({ error: "Missing or invalid fields" }, 400);
    }

    // ✅ Parse variant stock entries
    const variantRaw = formData.get("variants");
    let variantStock = [];

    if (variantRaw) {
      try {
        variantStock = JSON.parse(variantRaw.toString()).map((v: any) => ({
          label: v.label?.trim(),
          quantity: parseInt(v.quantity),
        }));
      } catch {
        return c.json(
          { error: "Invalid variants format. Expected JSON." },
          400
        );
      }
    }

    // Validate variants
    for (const variant of variantStock) {
      if (!variant.label || isNaN(variant.quantity)) {
        return c.json(
          { error: "Each variant must have valid label and quantity" },
          400
        );
      }
    }

    // ✅ Handle and validate images
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const imagePaths: string[] = [];

    for (const image of imagesRaw) {
      if (!(image instanceof File) || !allowedTypes.includes(image.type)) {
        return c.json(
          { error: "One or more files are not valid image types" },
          400
        );
      }

      const ext = image.name.split(".").pop();
      const filename = `${randomUUID()}.${ext}`;
      const imageBytes = await image.arrayBuffer();
      await Bun.write(`public/uploads/${filename}`, new Uint8Array(imageBytes));
      imagePaths.push(`/uploads/${filename}`);
    }

    // Generate unique slug
    let baseSlug = slugify(name, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    // Generate SKU
    const sku = generateSku(name);

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        sku,
        brand,
        color,
        price,
        description,
        categoryId,
        thumbnail: imagePaths[0], // ✅ First image as thumbnail
        images: imagePaths, // ✅ All images
        createdAt: new Date(),
        variantStock: {
          create: variantStock,
        },
      },
      include: {
        variantStock: true,
      },
    });

    return c.json({ success: true, product }, 201);
  } catch (err) {
    console.error("Error adding product:", err);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

// GET /api/products/new — Return recently added products (e.g., last 10)
productRoutes.get("/new", async (c) => {
  try {
    console.log("📥 Incoming request: /api/products/new");

    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        category: {
          select: { title: true, slug: true },
        },
      },
    });

    // console.log("✅ Products fetched from DB:", products);

    const transformedProducts = products.map((p) => {
      const fullImagePath = `http://localhost:3001${p.thumbnail}`;
      // console.log("🖼️ Processing product image:", {
      //   title: p.name,
      //   originalThumbnail: p.thumbnail,
      //   fullImagePath,
      // });
      return {
        ...p,
        image: fullImagePath,
      };
    });

    console.log(
      "🚀 Returning transformed products:",
      transformedProducts.length
    );

    return c.json({ success: true, products: transformedProducts });
  } catch (err) {
    console.error("❌ Error fetching new products:");
    console.error(err instanceof Error ? err.message : err);

    return c.json(
      {
        error:
          err instanceof Error
            ? err.message
            : typeof err === "object"
            ? JSON.stringify(err)
            : String(err),
      },
      500
    );
  }
});

// productRoutes.get("/suggestions", async (c) => {
//   try {
//     const query = c.req.query("query") || "";
//     if (!query || query.trim().length < 2) {
//       return c.json({ suggestions: [] }, 200);
//     }

//     const lowerCaseQuery = query.toLowerCase();
//     const suggestions: { label: string; value: string }[] = [];

//     // CATEGORY SUGGESTIONS
//     const categories = await prisma.category.findMany({
//       where: {
//         title: {
//           contains: lowerCaseQuery,
//           mode: "insensitive",
//         },
//       },
//       select: { title: true, slug: true },
//       take: 3,
//     });
//     categories.forEach((cat) =>
//       suggestions.push({ label: `Category: ${cat.title}`, value: cat.slug })
//     );

//     // BRAND SUGGESTIONS — this is probably causing the error
//     try {
//       const brands = await prisma.product.findMany({
//         where: {
//           brand: {
//             contains: lowerCaseQuery,
//             mode: "insensitive",
//           },
//         },
//         distinct: ["brand"],
//         select: { brand: true },
//         take: 3,
//       });
//       brands.forEach((p) => {
//         if (p.brand && p.brand.trim() !== "") {
//           suggestions.push({ label: `Brand: ${p.brand}`, value: p.brand });
//         }
//       });
//     } catch (brandErr) {
//       console.warn("Brand search error:", brandErr);
//     }

//     // PRODUCT NAME SUGGESTIONS
//     const products = await prisma.product.findMany({
//       where: {
//         name: {
//           contains: lowerCaseQuery,
//           mode: "insensitive",
//         },
//       },
//       select: { name: true, slug: true },
//       take: 5,
//     });
//     products.forEach((p) => suggestions.push({ label: p.name, value: p.slug }));

//     // Deduplicate
//     const uniqueSuggestions = Array.from(
//       new Map(suggestions.map((item) => [item.value, item])).values()
//     );

//     return c.json({ suggestions: uniqueSuggestions.slice(0, 8) }, 200);
//   } catch (err) {
//     console.error("Suggestions route error:", err); // ⛳ THIS WILL NOW PRINT THE ACTUAL ERROR
//     return c.json({ error: "Internal Server Error" }, 500);
//   }
// });


// ✅ MODIFIED: GET /api/products/search (now serves the direct product suggestions)
productRoutes.get('/search', async (c) => {
  const query = c.req.query('query') || '';

  if (!query || query.trim().length < 1) { // Allow single character queries for direct product search
    return c.json({ products: [] }, 200);
  }

  const lowerCaseQuery = query.toLowerCase();

  // This route will now primarily search product names for the dropdown
  // It will directly search product name, description, brand, tags.
  let whereClause: any = {
    isActive: true, // Only search active products
    isDeleted: false, // Don't show deleted products
    OR: [
      { name: { contains: lowerCaseQuery, mode: 'insensitive' } },
      { description: { contains: lowerCaseQuery, mode: 'insensitive' } },
      { brand: { contains: lowerCaseQuery, mode: 'insensitive' } },
      // { tags: { has: lowerCaseQuery } }, // Uncomment if 'tags' is in your schema
    ],
  };

  try {
    const products = await prisma.product.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        thumbnail: true, // Crucial for dropdown image
        // Only select fields needed for the dropdown and direct product link
        // price: true, // Not needed for dropdown, but would be for full search page
        // slug: true, // Not strictly needed if linking by ID, but good for consistency
      },
      take: 8, // ✅ Limit to a reasonable number for dropdown suggestions (e.g., 8 products)
      orderBy: { name: 'asc' }, // Order suggestions alphabetically
    });

    const transformedProducts = products.map(p => ({
      ...p,
      thumbnail: `${process.env.BACKEND_URL || 'http://localhost:3001'}${p.thumbnail}`, // Ensure full URL
    }));

    return c.json({ products: transformedProducts }, 200);
  } catch (err) {
    console.error("Error fetching products for search:", err);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});


// GET /api/products/:id — Get a single product by ID
productRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: { title: true, slug: true },
        },
        variantStock: {
          select: {
            label: true,
            quantity: true,
          },
        },
      },
    });

    if (!product) {
      return c.json({ error: "Product not found" }, 404);
    }

    return c.json({
      success: true,
      product: {
        ...product,
        thumbnail: `http://localhost:3001${product.thumbnail}`,
      },
    });
  } catch (err) {
    console.error("Error fetching product:", err);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});
