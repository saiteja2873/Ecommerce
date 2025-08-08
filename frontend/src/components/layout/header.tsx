"use client";

import Link from "next/link";
import SearchBar from "./search/searchBar";
import { HiHome, HiOutlineShoppingCart, HiUser } from "react-icons/hi";
import { useCartContext } from "@/context/cartContext";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useEffect, useState } from "react";

export default function Header() {
  const { cartItems } = useCartContext();
  const totalCartQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);

  const { loginMethod } = useAuthStatus();

  const [hasGuestCart, setHasGuestCart] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const localCart = localStorage.getItem("cart");
      try {
        const parsed = JSON.parse(localCart || "[]");
        setHasGuestCart(Array.isArray(parsed) && parsed.length > 0);
      } catch {
        setHasGuestCart(false);
      }
    }
  }, [cartItems]); // update if cart changes

  const showCartBadge =
    totalCartQuantity > 0 &&
    (loginMethod === "manual" || loginMethod === "google" || hasGuestCart);

  const navItems = [
    { name: "Home", href: "/", icon: <HiHome size={20} /> },
    { name: "Cart", href: "/cart", icon: <HiOutlineShoppingCart size={20} /> },
    {
      name: "Profile",
      href: "/account/profile",
      icon: <HiUser size={20} />,
    },
  ];

  return (
    <header className="w-full px-4 sm:px-6 py-4 shadow-md bg-white dark:bg-neutral-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-black dark:text-white">
          E-Shop
        </Link>

        <SearchBar />

        <nav className="hidden md:flex space-x-6 items-center">
          {navItems.map((item) => (
            <div key={item.name} className="relative">
              <Link
                href={item.href}
                className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition"
              >
                {item.icon}
              </Link>
              {item.name === "Cart" && showCartBadge && (
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
