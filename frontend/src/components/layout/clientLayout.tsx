// src/components/layout/clientLayout.tsx
"use client";

import { Toaster } from "react-hot-toast";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottomNav";
import { CartProvider } from "@/context/cartContext";
import { SessionProvider } from "next-auth/react";
import GlobalLoader from "@/components/layout/globalLoader";
import { AuthProvider } from "@/context/authContext";
import TokenSync from "@/components/tokenSync"; // ✅ Add this import

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster position="top-right" />
          <TokenSync /> {/* ✅ This ensures token gets synced to localStorage */}
          <Header />
          <GlobalLoader />
          <main className="mb-10 md:mb-0">{children}</main>
          <BottomNav />
        </CartProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
