import { Hono } from 'hono';
import { PrismaClient } from '../generated/prisma';

const searchRoute = new Hono();
const prisma = new PrismaClient();

searchRoute.get('/', async (c) => {
  const query = c.req.query('query') || '';

  if (!query) {
    return c.json({ products: [] }, 200);
  }

  const products = await prisma.product.findMany({
    where: {
      name: {
        contains: query,
        mode: 'insensitive',
      },
    },
    select: {
      id: true,
      name: true,
      thumbnail: true,
    },
    take: 6,
  });

  return c.json({ products });
});

export default searchRoute;
