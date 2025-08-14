// src/routes/categoryRoutes.ts
import { Hono } from 'hono';
import {
  getAllCategories,
  createCategory,
  getCategoryWithProducts,
} from '../controllers/categoryController';

const categoryRoutes = new Hono();

// GET all categories
categoryRoutes.get('/', async (c) => {
  const categories = await getAllCategories();
  return c.json(categories);
});

// ✅ NEW: GET products by category slug (e.g. /api/categories/men)
categoryRoutes.get('/:slug', async (c) => {
  const { slug } = c.req.param();

  const category = await getCategoryWithProducts(slug);

  if (!category) {
    return c.json({ error: 'Category not found' }, 404);
  }

  return c.json({ 
    products: category.products.map((p) => ({
    ...p,
    image: `https://ecommerce-j5j0.onrender.com${p.thumbnail}`,
  })), // ✅ Return in object
});
});


// POST a new category
categoryRoutes.post('/', async (c) => {
  const data = await c.req.json();

  if (
    typeof data.title !== 'string' ||
    typeof data.slug !== 'string'
  ) {
    return c.json({ error: 'Invalid input.' }, 400);
  }

  const result = await createCategory(data);
  return c.json(result);
});


export default categoryRoutes;
