import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import BottomNav from "@/components/layout/bottomNav";
import { CartProvider } from "@/context/cartContext"; // ✅ Import this
import GlobalLoader from "@/components/layout/globalLoader";
import BackButton from "@/components/layout/backButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NextCommerce",
  description: "A full-featured modern e-commerce platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-black text-black dark:text-white`}
      >
        <Toaster position="top-right" />

        {/* ✅ Wrap everything in CartProvider */}
        <CartProvider>
          <Header />
          <GlobalLoader/>
          {/* <BackButton /> */}
          <main className="flex-grow pb-16">{children}</main>
          <BottomNav />
        </CartProvider>
      </body>
    </html>
  );
}
