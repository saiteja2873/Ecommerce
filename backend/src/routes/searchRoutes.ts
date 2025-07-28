// src/app/api/routes/searchRoutes.ts (or wherever you placed it)

import { Hono } from 'hono';
import { PrismaClient } from '../generated/prisma'; // Adjust path

const searchRoute = new Hono();
const prisma = new PrismaClient();

searchRoute.get('/', async (c) => {
  const query = c.req.query('query') || '';

  if (!query) {
    return c.json({ products: [] }, 200);
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { brand: { contains: query, mode: 'insensitive' } },
          // { tags: { has: query.toLowerCase() } }, // Uncomment if 'tags' is in your schema
        ],
        isActive: true, // Only search active products
        isDeleted: false, // Don't show deleted products
      },
      select: {
        id: true,
        name: true,
        thumbnail: true,
        price: true, // ✅ IMPORTANT for search results
        slug: true,  // ✅ IMPORTANT for search results linking
        description: true, // ✅ Often useful for search results cards
      },
      take: 20, // ✅ Take more products for a search results page
      orderBy: { createdAt: 'desc' },
    });

    const transformedProducts = products.map(p => ({
      ...p,
      image: `http://localhost:3001${p.thumbnail}`, // ✅ Transform thumbnail to 'image' for frontend Product type
    }));

    return c.json({ products: transformedProducts }, 200);
  } catch (err) {
    console.error("Error fetching products for general search:", err);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

export default searchRoute;