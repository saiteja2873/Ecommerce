"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FiSearch } from "react-icons/fi";

interface Product {
  id: string;
  name: string;
  thumbnail: string;
}

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export default function SearchBar({
  placeholder = "Search Products",
  className = "",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.trim()) {
        fetch(
          `http://localhost:3001/api/search?query=${encodeURIComponent(query)}`
        )
          .then(async (res) => {
            if (!res.ok) {
              throw new Error(`Error ${res.status}: ${await res.text()}`);
            }
            return res.json();
          })
          .then((data) => setSuggestions(data.products || []))
          .catch((err) => {
            console.error("Search error:", err);
            setSuggestions([]);
          });
        setShowDropdown(true);
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!inputRef.current?.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-xl">
      <form
        onSubmit={(e) => e.preventDefault()}
        className={`flex items-center gap-2 bg-gray-100 dark:bg-neutral-800 rounded-full px-4 py-2 
        focus-within:ring-2 focus-within:ring-white ${className}`}
      >
        <FiSearch className="text-gray-500 dark:text-gray-400" size={18} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
        />
      </form>

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-neutral-900 border rounded-lg shadow-lg max-h-80 overflow-auto">
          {suggestions.map((product) => (
            <div
              key={product.id}
              onMouseDown={() => {
                router.push(`/products/${product.id}`);
                setShowDropdown(false);
              }}
              className="cursor-pointer flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
            >
              <img
                src={`http://localhost:3001${product.thumbnail}`}
                alt={product.name}
                className="w-10 h-10 object-cover object-top rounded"
              />
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
