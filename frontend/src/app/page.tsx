"use client";
import React from "react";
import SlidingCards from "@/components/ui/slidingCards";
import CategoryGrid from "@/components/product/categoryGrid";
import ProductCarousel from "@/components/ui/productCarousel";
import Footer from "@/components/layout/footer";

// import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
    <div className="mt-16">
        <SlidingCards />
      </div>
      <div>
      <ProductCarousel />
      </div>
      <div className="mt-10">
        <CategoryGrid />
      </div>
    <div className="min-h-screen flex flex-col justify-between items-center px-6 sm:px-12 py-20 bg-white dark:bg-black text-black dark:text-white">
      {/* Hero Section */}
      <section className="text-center max-w-4xl space-y-6">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
          Welcome to <span className="text-primary">NextCommerce</span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300">
          Your one-stop shop for premium products, fast delivery, and the best prices.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
          <Link
            href="/products"
            className="rounded-full bg-black dark:bg-white text-white dark:text-black px-6 py-3 text-sm font-semibold hover:opacity-90 transition"
          >
            Shop Now
          </Link>
          <Link
            href="/about"
            className="rounded-full border border-gray-300 dark:border-gray-700 px-6 py-3 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-900 transition"
          >
            Learn More
          </Link>

        </div>
      </section>

      {/* Optional: Home page image */}
      {/* <div className="mt-16">
        <Image
          src="/hero-product.png"
          alt="Hero product image"
          width={800}
          height={500}
          className="rounded-xl shadow-xl max-w-full"
          priority
        />
      </div> */}

          {/* <SlidingCards/> */}
        {/* <CategoryGrid /> */}
    </div>
    <div>
          <Footer />      
        </div>
    </>
  );
}
