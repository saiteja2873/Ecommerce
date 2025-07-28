// src/components/layout/search/searchBar.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; // ✅ Import Image for thumbnails
import { FiSearch } from "react-icons/fi";

// ✅ MODIFIED: Interface for product suggestions (direct product data)
interface ProductSuggestion {
  id: string;
  name: string;
  thumbnail: string; // The URL for the product's image
}

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export default function SearchBar({
  placeholder = "Search Products",
  className = "",
}: SearchBarProps) {
  const [query, setQuery] = useState(""); // This state is used for the actual search query (value)
  const [inputValue, setInputValue] = useState(""); // This state controls what is displayed in the input field
  // ✅ Changed type to ProductSuggestion[]
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Effect to fetch product suggestions based on the inputValue with a debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (inputValue.trim()) {
        // ✅ CHANGE: Fetch from the /api/products/search endpoint for product suggestions
        // This endpoint should return products with id, name, and thumbnail
        fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products/search?query=${encodeURIComponent(inputValue)}`
        )
          .then(async (res) => {
            if (!res.ok) {
              const errorText = await res.text();
              console.error(`Product Search API Error ${String(res.status)}: ${errorText}`);
              throw new Error(`Error ${String(res.status)}: ${errorText}`);
            }
            return res.json();
          })
          .then((data) => {
            // Assuming backend returns { products: [...] }
            setSuggestions(data.products || []);
            setShowDropdown(true);
          })
          .catch((err) => {
            console.error("Failed to fetch product search suggestions:", err);
            setSuggestions([]);
            setShowDropdown(false);
          });
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [inputValue]);

  // Effect to hide dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current && !inputRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle form submission (e.g., pressing Enter)
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestions.length > 0) { // If there are suggestions, navigate to the first one's product page
      handleProductSuggestionClick(suggestions[0].id);
    } else if (inputValue.trim()) { // If no suggestions but query exists, navigate to a general search results page
      // If you still want a general search results page for arbitrary text, uncomment this:
      router.push(`/search?query=${encodeURIComponent(inputValue.trim())}`);
      setShowDropdown(false);
    }
  };

  // Handle clicking on a specific product suggestion
  const handleProductSuggestionClick = (productId: string) => {
    router.push(`/products/${productId}`); // Navigate directly to product details page
    setInputValue(""); // Clear input after selection
    setQuery(""); // Clear query state
    setShowDropdown(false); // Hide dropdown
  };

  return (
    <div className="relative w-full max-w-xl">
      <form
        onSubmit={handleFormSubmit}
        className={`flex items-center gap-2 bg-gray-100 dark:bg-neutral-800 rounded-full px-4 py-2 
        focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-white ${className}`}
      >
        <FiSearch className="text-gray-500 dark:text-gray-400" size={18} />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
          onFocus={() => inputValue.trim() && suggestions.length > 0 && setShowDropdown(true)}
        />
      </form>

      {showDropdown && suggestions.length > 0 && (
        <div ref={dropdownRef} className="absolute z-50 mt-1 w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-lg max-h-80 overflow-auto">
          {suggestions.map((product) => ( // Map over product suggestions
            <div
              key={product.id}
              onClick={() => handleProductSuggestionClick(product.id)} // Navigate to product details
              className="cursor-pointer flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
            >
              {/* Product Thumbnail */}
              <div className="relative w-10 h-10 flex-shrink-0">
                <Image
                  src={product.thumbnail} // Use product.thumbnail directly (it's a full URL from backend)
                  alt={product.name}
                  fill
                  sizes="40px"
                  className="object-cover rounded"
                />
              </div>
              {/* Product Name */}
              <span className="text-sm text-black dark:text-white">
                {product.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}