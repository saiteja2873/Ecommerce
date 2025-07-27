"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HiHome,
  HiUser,
  HiOutlineShoppingCart,
  HiClipboardList,
} from "react-icons/hi";
import { useCartContext } from "@/context/cartContext";

const navItems = [
  { name: "Home", href: "/", icon: HiHome },
  { name: "Orders", href: "/account/orders", icon: HiClipboardList },
  { name: "Cart", href: "/cart", icon: HiOutlineShoppingCart },
  { name: "Account", href: "/account/profile", icon: HiUser },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { cartItems } = useCartContext();

  const totalCartQuantity = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-700 shadow md:hidden z-50">
      <ul className="flex justify-around py-2">
        {navItems.map(({ name, href, icon: Icon }) => (
          <li key={name}>
            <Link
              href={href}
              className={`relative flex flex-col items-center text-xs ${
                pathname === href
                  ? "text-black dark:text-white"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              <Icon size={20} />
              {name}
              {name === "Cart" && totalCartQuantity > 0 && (
                <span className="absolute -top-1 -right-3 bg-red-500 text-white text-[9px] font-light rounded-full w-4 h-4 flex items-center justify-center">
                  {totalCartQuantity}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
