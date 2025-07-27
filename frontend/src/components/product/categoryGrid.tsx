// components/CategoryGrid.tsx
import CategoryCard from "./categoryCard";
import { categories } from "@/constants/categories"; // Assuming categories data is here

export default function CategoryGrid() {
  return (
    <section className="px-2 py-6 sm:px-4 md:px-8 lg:px-16">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 text-center text-white"> {/* Added text-black */}
        Shop by Category
      </h2>

      {/* Grid container:
          - grid-cols-4 for all small screens (mobile, even smaller)
          - md:grid-cols-2 for medium screens (e.g., tablets in portrait)
          - lg:grid-cols-4 for large screens (desktops)
          - Gap adjusted for responsiveness
      */}
      <div className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 justify-items-center">
        {categories.map((category) => (
          <div
            key={category.slug}
            // The CategoryCard itself will handle its sizing and rounding based on screen width
            // We just need to ensure this div allows it to fill its grid cell
            className="w-full" // Let CategoryCard handle its internal sizing
          >
            <CategoryCard
              title={category.title}
              slug={category.slug}
              image={category.image}
            />
          </div>
        ))}
      </div>
    </section>
  );
}