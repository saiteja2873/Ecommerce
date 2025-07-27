"use client";

import Link from "next/link";
import { FaTwitter, FaInstagram, FaLinkedin, FaBoxOpen, FaPhone, FaInfoCircle } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-zinc-900 py-6 border-t border-gray-200 dark:border-zinc-700 text-sm text-gray-700 dark:text-gray-300">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-6">
        {/* Brand */}
        <div className="text-center sm:text-left">
          <h2 className="text-lg font-semibold text-black dark:text-white">NextCommerce</h2>
          <p className="text-xs text-gray-600 dark:text-gray-400">Modern shopping simplified.</p>
        </div>

        {/* Quick Links */}
        <div className="flex items-center gap-6 text-xs">
          <Link href="/products" className="flex items-center gap-1 hover:underline">
            <FaBoxOpen /> Products
          </Link>
          <Link href="/about" className="flex items-center gap-1 hover:underline">
            <FaInfoCircle /> About
          </Link>
          <Link href="/contact" className="flex items-center gap-1 hover:underline">
            <FaPhone /> Contact
          </Link>
        </div>

        {/* Social Icons */}
        <div className="flex gap-4">
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition">
            <FaTwitter size={18} />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 transition">
            <FaInstagram size={18} />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 transition">
            <FaLinkedin size={18} />
          </a>
        </div>
      </div>

      {/* Bottom Note */}
      <div className="text-center mt-4 text-xs text-gray-500 dark:text-gray-500">
        &copy; {new Date().getFullYear()} NextCommerce. All rights reserved.
      </div>
    </footer>
  );
}
