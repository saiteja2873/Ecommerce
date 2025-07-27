"use client";

import { useEffect, useState } from "react";
import { fetchNewProducts } from "@/lib/api";
import { Product } from "@/types/product";
import ProductCard from "../product/productCard";
import { useLoaderStore } from "@/context/loaderStore";

export default function NewProductSlider() {
  const [products, setProducts] = useState<Product[]>([]);
  const {setLoading} = useLoaderStore();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true, 0);
        const data = await fetchNewProducts();
        setProducts(data.slice(0, 6)); // Show latest 10
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false, 500);
      }
    };

    loadProducts();
  }, []);

  if (products.length === 0)
    return null;

  return (
    <section className="px-6 sm:px-16 py-6">
      <h2 className="text-2xl font-bold mb-4 text-white">New Arrivals</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
        {products.map((product) => (
          <div key={product.id}>
            {" "}
            {/* ⬅️ Set desired height here */}
            <ProductCard
              id={product.id}
              name={product.name}
              price={product.price}
              image={product.image}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
