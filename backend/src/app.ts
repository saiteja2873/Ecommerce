// app.ts
import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { cors } from 'hono/cors'; // ✅ Import CORS
import categoryRoutes from './routes/categoryRoutes';
import { productRoutes } from './routes/productRoutes';
import searchRoute from './routes/searchRoutes';

const app = new Hono();

// ✅ Enable CORS
app.use(
  '*',
  cors({
    origin: 'http://localhost:3000', // your frontend origin
    credentials: true, // if you use cookies or Authorization
  })
);

app.use('/uploads/*', serveStatic({ root: './public' }));
app.route('/api/products', productRoutes);
app.route('/api/categories', categoryRoutes);
app.route('/api/search', searchRoute)

export default app;
