// components/CategoryCard.tsx
"use client"; // Keep this if you have hover effects or other client-side logic

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react"; // Import useState, useEffect for screen size detection

type CategoryCardProps = {
  title: string;
  slug: string;
  image: string;
};

export default function CategoryCard({ title, slug, image }: CategoryCardProps) {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      // Define your breakpoint for "small screens" (e.g., md breakpoint at 768px)
      // This will control when the card switches to the mobile-friendly style
      setIsSmallScreen(window.innerWidth < 768);
    };

    checkScreenSize(); // Set initial state
    window.addEventListener('resize', checkScreenSize); // Listen for resize events

    return () => window.removeEventListener('resize', checkScreenSize); // Cleanup
  }, []); // Empty dependency array means this runs once on mount

  if (isSmallScreen) {
    // --- MOBILE/SMALL SCREEN VERSION (Rounded image, text below, no animation) ---
    return (
      <Link href={`/categories/${slug}`} className="flex flex-col items-center text-center group w-full">
        {/* Image Container - Always rounded-full on small screens */}
        <div className="relative w-full aspect-square overflow-hidden rounded-full transition-transform duration-300 "> {/* Keep hover scale on image */}
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover object-top rounded-full" // Image itself is rounded
            sizes="70px" // Optimize image size for small mobile cards
          />
        </div>
        {/* Title - Always visible below the image */}
        <h3 className="mt-2 text-xs font-medium text-black group-hover:text-white transition-colors duration-300">{title}</h3>
      </Link>
    );
  } else {
    // --- DESKTOP/LARGER SCREEN VERSION (Original animated card) ---
    return (
      <Link href={`/categories/${slug}`}>
        <div className="group rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition duration-300">
          <div className="relative h-52 sm:h-60 lg:h-70 w-full overflow-hidden">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover object-top transform transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw" // Adjusted sizes for better optimization
            />
            {/* Animated Title Overlay - Only for larger screens */}
            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent text-white py-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out text-center">
              <h3 className="text-lg font-semibold">{title}</h3>
            </div>
          </div>
        </div>
      </Link>
    );
  }
}