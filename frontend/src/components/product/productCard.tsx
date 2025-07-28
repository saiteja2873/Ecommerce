// src/components/product/productCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";

type ProductCardProps = {
  id: string;
  name: string;
  price: number;
  image: string;
};

export default function ProductCard({ id, name, price, image }: ProductCardProps) {
  return (
    <Link href={`/products/${id}`}>
      <div className="group rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 flex flex-col h-[320px] sm:h-[380px] bg-white">
        
        {/* Image Section */}
        <div className="relative h-52 sm:h-72 w-full overflow-hidden">
          <Image
            src={image}
            alt={name}
            fill
            priority={true}
            // ✅ ADDED: SIZES PROP ONLY
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-top transition-transform duration-500 will-change-transform group-hover:scale-105"
          />
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col justify-between p-4">
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">{name}</h3>
          <p className="text-sm text-gray-600 mt-2">₹{price.toFixed(2)}</p>
        </div>
      </div>
    </Link>
  );
}