// src/components/layout/clientLayout.tsx
"use client";

import { Toaster } from "react-hot-toast";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottomNav";
import { CartProvider } from "@/context/cartContext";
import { SessionProvider } from "next-auth/react";
import GlobalLoader from "@/components/layout/globalLoader";
import { AuthProvider } from "@/context/authContext";
import TokenSync from "@/components/tokenSync";
import { PaymentProvider } from "@/context/paymentContext"; // ✅ Import PaymentProvider

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <CartProvider>
          <PaymentProvider> {/* ✅ Wrap inside PaymentProvider */}
            <Toaster position="top-right" />
            <TokenSync />
            <Header />
            <GlobalLoader />
            <main className="mb-10 md:mb-0">{children}</main>
            <BottomNav />
          </PaymentProvider>
        </CartProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
