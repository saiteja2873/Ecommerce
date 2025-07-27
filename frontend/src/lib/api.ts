// lib/api.ts

export async function getProductsByCategory(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products?category=${slug}`, {
    cache: "no-store",
  });

  if (!res.ok) return [];

  const data = await res.json();
  return data.products;
}


// src/lib/api.ts (or anywhere suitable)
import { Product } from "@/types/product";

export const fetchNewProducts = async (): Promise<Product[]> => {
  const res = await fetch("/api/products/new", {
    method: "GET",
    cache: "no-store", // Optional: disables caching for freshness
  });

  if (!res.ok) {
    throw new Error("Failed to Fetch New Products");
  }

    const json = await res.json()
  return await json.products; // Returns Product[]
};
