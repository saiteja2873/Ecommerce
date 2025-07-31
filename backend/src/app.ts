// app.ts
import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { cors } from 'hono/cors'; // ✅ Import CORS
import categoryRoutes from './routes/categoryRoutes';
import { productRoutes } from './routes/productRoutes';
import searchRoute from './routes/searchRoutes';
import userRoute from './routes/users';
import authRoute from './routes/auth';
import verifyRouter from './routes/verify';

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
app.route("/api/users", userRoute);
app.route("/api/auth", authRoute);
app.route("/api/verify", verifyRouter);

export default app;
