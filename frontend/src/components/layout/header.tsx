"use client";

import Link from "next/link";
import SearchBar from "./search/searchBar";
import { HiHome, HiOutlineShoppingCart, HiUser } from "react-icons/hi";
import { useCartContext } from "@/context/cartContext";

const navItems = [
  { name: "Home", href: "/", icon: <HiHome size={20} /> },
  { name: "Cart", href: "/cart", icon: <HiOutlineShoppingCart size={20} /> },
  { name: "Profile", href: "/profile", icon: <HiUser size={20} /> },
];

export default function Header() {
  const { cartItems } = useCartContext();
  const totalCartQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="w-full px-4 sm:px-6 py-4 shadow-md bg-white dark:bg-neutral-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between md:justify-between gap-4 sm:gap-4 md:gap-0">
        {/* Logo */}
        <Link
          href="/"
          className="text-base sm:text-lg md:text-xl font-bold text-black dark:text-white whitespace-nowrap"
        >
          E-Shop
        </Link>

        {/* Search Bar */}
        <SearchBar />

        {/* Desktop Nav Icons (Only visible on md and up) */}
        <nav className="hidden md:flex space-x-6 items-center">
          {navItems.map((item) => (
            <div key={item.name} className="relative">
              <Link
                href={item.href}
                className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition"
                aria-label={item.name}
              >
                {item.icon}
              </Link>
              {item.name === "Cart" && totalCartQuantity > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalCartQuantity}
                </span>
              )}
            </div>
          ))}
        </nav>
      </div>
    </header>
  );
}
