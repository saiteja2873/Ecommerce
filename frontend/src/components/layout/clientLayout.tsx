// src/components/layout/clientLayout.tsx
"use client";

import { Toaster } from "react-hot-toast";
import Header from "@/components/layout/header";
// import Footer from "@/components/layout/footer";
import BottomNav from "@/components/layout/bottomNav";
import { CartProvider } from "@/context/cartContext";
import { SessionProvider } from "next-auth/react";
import GlobalLoader from "@/components/layout/globalLoader";
import { AuthProvider } from "@/context/authContext"; // ✅ Import AuthProvider

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider> {/* ✅ Wrap children with AuthProvider */}
        <CartProvider>
          <Toaster position="top-right" />
          <Header />
          <GlobalLoader />
          <main className="mb-10 md:mb-0">{children}</main>
          <BottomNav />
        </CartProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
