"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import ProductGrid from "@/components/product/productGrid";

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
};

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query");

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
      const res = await fetch(
        `https://ecommerce-j5j0.onrender.com/api/products/search?query=${encodeURIComponent(
          query
        )}`
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          `Failed to fetch products: ${res.status} - ${errorText}`
        );
      }

      const data: { products: Array<Omit<Product, "image"> & { thumbnail: string }> } = await res.json();

      const transformedProducts: Product[] = data.products.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.thumbnail,
      }));

      setProducts(transformedProducts || []);
    } catch (err: unknown) {
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
          Search Results for:{" "}
          <span className="text-blue-400">&quot;{query}&quot;</span>
        </h1>

        {loading && (
          <div className="text-center text-lg text-gray-400">
            Loading products...
          </div>
        )}

        {error && (
          <div className="text-center text-red-500 text-lg">{error}</div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="text-center text-gray-400 text-lg">
            No products found for &quot;{query}&quot;.
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <ProductGrid products={products} />
        )}
      </div>
    </div>
  );
}
