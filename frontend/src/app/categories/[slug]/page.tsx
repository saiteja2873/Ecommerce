// src/app/categories/[slug]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProductCard from "@/components/product/productCard";
import { motion } from "framer-motion";
// import { ArrowLeft } from "lucide-react";
import { useLoaderStore } from "@/context/loaderStore";

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
};

export default function CategoryPage() {
  const { slug } = useParams();
  // const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const { setLoading } = useLoaderStore();

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true, 0);
        const res = await fetch(`/api/categories/${slug}`);
        const data = await res.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error("Failed to fetch category products", error);
      } finally {
        setLoading(false, 500);
      }
    }

    if (slug) fetchProducts();
  }, [slug, setLoading]);

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto">
      {/* Back Button */}
      {/* <div className="fixed mb-4 z-[110]">
        <button
          onClick={() => {
            router.back();
            setLoading(true, 500);
          }}
          className="w-10 h-10 flex items-center justify-center rounded-full border border-white text-white hover:bg-white hover:text-black transition"
        >
          <ArrowLeft size={20} />
        </button>
      </div> */}

      {/* Heading */}
      <motion.h1
        className="text-2xl sm:text-3xl font-bold capitalize mb-6 sm:mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {slug} Products
      </motion.h1>

      {/* Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 px-12"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
      >
        {products.map((product) => (
          <div key={product.id} className="overflow-hidden">
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="will-change-transform origin-center"
            >
              <ProductCard
                id={product.id}
                name={product.name}
                price={product.price}
                image={product.image}
              />
            </motion.div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
