// src/app/search/page.tsx
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
// Removed Image and Link imports as ProductGrid/ProductCard will handle them
import toast from 'react-hot-toast';
import ProductGrid from '@/components/product/productGrid'; // ✅ Import ProductGrid

// ✅ Updated Product type to match ProductGrid's expected props
type Product = {
  id: string;
  name: string;
  price: number;
  image: string; // This will be the full URL (thumbnail)
  // Add other fields you select in your backend for search results display
  // e.g., slug: string; description?: string;
};

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!query) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`https://ecommerce-j5j0.onrender.com/api/products/search?query=${encodeURIComponent(query)}`);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to fetch products: ${res.status} - ${errorText}`);
      }

      const data = await res.json();
      // Ensure the 'image' property is correctly mapped from 'thumbnail' if needed by ProductGrid
      const transformedProducts = data.products.map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.thumbnail, // Map backend 'thumbnail' to 'image' for ProductGrid
        // ... map other fields if ProductGrid needs them
      }));
      setProducts(transformedProducts || []);
    } catch (err: any) {
      console.error("Error fetching search results:", err);
      setError("Failed to load search results. Please try again.");
      toast.error("Failed to load search results.");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="min-h-screen bg-zinc-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          Search Results for: <span className="text-blue-400">"{query}"</span>
        </h1>

        {loading && (
          <div className="text-center text-lg text-gray-400">Loading products...</div>
        )}

        {error && (
          <div className="text-center text-red-500 text-lg">{error}</div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="text-center text-gray-400 text-lg">No products found for "{query}".</div>
        )}

        {/* ✅ Use ProductGrid component here */}
        {!loading && !error && products.length > 0 && (
          <ProductGrid products={products} />
        )}
      </div>
    </div>
  );
}