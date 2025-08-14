// src/app/cart/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link"; // Import Link for product links
import { useCartContext } from "@/context/cartContext";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  X,
  CheckCircle,
} from "lucide-react";

// Fancy BG gradients for glassy effects
// ✅ MODIFIED: Slightly adjusted colors for cooler tone
const gradientBg =
  "bg-gradient-to-br from-indigo-900/70 via-cyan-800/80 to-purple-900/60"; // Darker, more saturated base for glass

const Glass = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={
      `${gradientBg} rounded-2xl shadow-xl border border-cyan-500/30 backdrop-blur-lg ` + // ✅ backdrop-blur-lg for smoother blur
      className
    }
    style={{
      backgroundBlendMode: "screen",
    }}
  >
    {children}
  </div>
);

export default function CartPage() {
  const { cartItems, removeFromCart, clearCart, updateCartItemQuantity } =
    useCartContext();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const router = useRouter();

  // Load saved selections when component mounts
  useEffect(() => {
    const storedSelection = localStorage.getItem("selectedItems");
    if (storedSelection) {
      setSelectedItems(JSON.parse(storedSelection));
    }
  }, []);

  // Whenever cart changes, merge in any new items immediately
  useEffect(() => {
    setSelectedItems((prev) => {
      const prevSet = new Set(prev);
      let updated = false;

      cartItems.forEach((item) => {
        const key = item.id.includes("-")
          ? item.id
          : `${item.id}-${item.variant ?? "default"}`;
        if (!prevSet.has(key)) {
          prevSet.add(key);
          updated = true;
        }
      });

      return updated ? Array.from(prevSet) : prev;
    });
  }, [cartItems]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("selectedItems", JSON.stringify(selectedItems));
  }, [selectedItems]);

  const toggleSelection = (id: string, variant: string | undefined) => {
    const key = id.includes("-") ? id : `${id}-${variant ?? "default"}`;
    setSelectedItems((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleUpdateQuantity = (
    id: string,
    variant: string | undefined,
    delta: number
  ) => {
    updateCartItemQuantity(id, variant, delta);
  };

const normalizeId = (id: string, variant?: string) =>
  id.includes("-") ? id : `${id}-${variant ?? "default"}`;

const totalAmount = cartItems
  .filter((item) =>
    selectedItems.includes(normalizeId(item.id, item.variant))
  )
  .reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 60, scale: 0.92 },
    visible: {
      opacity: 1,
      y: 0,


























































































































































































































































































































































































      
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    }, // ✅ Smoother spring transition
    exit: { opacity: 0, x: 100, scale: 0.7, transition: { duration: 0.29 } },
  };

  return (
    <main className="min-h-screen py-12 px-2 sm:px-6 md:px-10 relative overflow-x-clip bg-black">
      {" "}
      {/* Added bg-zinc-900 for solid dark background */}
      {/* BG Gradient Animation - MODIFIED FOR PERFORMANCE */}
      <motion.div
        initial={{ scale: 1.05, opacity: 0.3 }} // Slightly less initial scale
        animate={{ scale: 1, opacity: 0.6 }} // Slightly less final opacity
        transition={{
          // ✅ MODIFIED: Slower, less frequent animation
          repeat: Infinity,
          duration: 25, // Longer duration
          ease: "linear", // Smooth linear transition
          repeatType: "reverse", // Goes back and forth
        }}
        className="pointer-events-none z-0 fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 150% 100% at 80% 5%, var(--tw-gradient-from-rgb) 0%, var(--tw-gradient-via-rgb) 20%, transparent 100%)",
          filter: "blur(70px)", // Slightly less blur
          // Defined colors via --tw-gradient-from-rgb etc. for Tailwind JIT
          //   '--tw-gradient-from-rgb': '168, 85, 247, 0.6', /* purple-500 */
          //   '--tw-gradient-via-rgb': '6, 182, 212, 0.7',  /* cyan-500 */
        }}
      />
      <section className="relative z-10 max-w-5xl mx-auto space-y-12">
        <motion.h1
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="font-extrabold text-3xl sm:text-5xl text-center mb-4 flex items-center justify-center gap-4 bg-gradient-to-br from-cyan-400 via-fuchsia-500 to-indigo-400 text-transparent bg-clip-text drop-shadow-[0_3px_8px_rgba(80,220,255,0.25)]"
        >
          <motion.span
            animate={{ rotate: [0, 18, -8, 0], scale: [1, 1.1, 1.05, 1] }} // Slightly reduced scale bounce
            transition={{
              repeat: Infinity,
              duration: 3.8, // Slightly longer duration
              repeatDelay: 2.5, // Longer delay between repeats
              ease: "easeInOut", // Smoother ease
            }}
          >
            <ShoppingCart className="w-9 h-9 text-cyan-400 filter drop-shadow" />
          </motion.span>
          Your Cart
        </motion.h1>
        <AnimatePresence>
          {cartItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 40 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="flex flex-col items-center justify-center py-14 px-4"
            >
              <Glass className="text-center py-12 px-6 w-full max-w-md">
                <X className="mx-auto text-red-400 w-14 h-14 mb-4 animate-pulse" />
                <span className="text-xl font-semibold text-gray-200">
                  Your cart is empty. <br />
                </span>
                <span className="text-cyan-300">
                  Add some items and come back!
                </span>
              </Glass>
            </motion.div>
          ) : (
            <motion.section
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="z-20"
            >
              {/* CART LIST */}
              <motion.ul variants={containerVariants} className="space-y-8">
                <AnimatePresence>
                  {cartItems.map((item, i) => {
                    // Always generate a consistent unique key
                    const productId = item.id?.split("-")[0] ?? "unknown";

                    // Ensure variant is always defined
                    const variantId = item.variant ?? "default";

                    // Unique key: productId + variantId + index
                    const key = `${productId}-${variantId}`;

                    // Selection check
                    const selected = selectedItems.includes(
                      `${productId}-${variantId}`
                    );
                    return (
                      <motion.li
                        layout="position" // ✅ Optimized layout prop
                        key={key}
                        // variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className={`
                          relative group flex flex-col md:flex-row items-center rounded-2xl
                          border-2 ${
                            selected ? "border-emerald-200" : "border-zinc-800"
                          }
                          bg-gradient-to-br from-blue-950  to-black
                          shadow-[0_6px_26px_rgba(80,220,255,0.25)]
                          ring-1 ring-cyan-500/10
                          p-5 gap-6 justify-stretch
                          overflow-hidden
                          hover:scale-[1.012] hover:ring-2 hover:ring-fuchsia-400/60
                          transition-all duration-200 ease-in-out
                          will-change-transform opacity-100
                        `}
                      >
                        <motion.div
                          layout="position"
                          className="flex items-center gap-4 flex-shrink-0"
                        >
                          <Link
                            href={`/products/${productId}`}
                            className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-cyan-800 bg-blend-multiply group-hover:ring-2 hover:ring-cyan-300 transition"
                          >
                            <Image
                              src={
                                item.imageUrl?.startsWith("http")
                                  ? item.imageUrl
                                  : item.imageUrl
                                  ? `https://ecommerce-j5j0.onrender.com${item.imageUrl}`
                                  : "/placeholder.jpg" // fallback image if null or undefined
                              }
                              alt={item.name || "Product image"}
                              fill
                              className="object-cover object-top group-hover:scale-105 transition-transform"
                              sizes="(max-width: 768px) 96px, 112px"
                            />

                            {/* ✅ Checkbox for small devices inside image with click propagation stopped */}
                            <input
                              type="checkbox"
                              checked={selected}
                              onClick={(e) => e.stopPropagation()} // 🛑 Prevents navigation
                              onChange={() =>
                                toggleSelection(item.id, item.variant)
                              }
                              className="absolute top-1 left-1 w-5 h-5 accent-cyan-500 border-2 border-cyan-400 rounded-md transition-all md:hidden"
                              aria-label="Select item"
                            />
                          </Link>

                          {/* ✅ Checkbox for larger screens outside the image */}
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() =>
                              toggleSelection(item.id, item.variant)
                            }
                            className="w-5 h-5 accent-cyan-500 border-2 border-cyan-400 rounded-md transition-all hidden md:block"
                            aria-label="Select item"
                          />
                        </motion.div>

                        {/* Product Info */}
                        <div className="flex-1 flex flex-col md:flex-row justify-between md:items-center gap-3 w-full">
                          <div className="flex-grow">
                            <Link href={`/products/${productId}`}>
                              <motion.h3
                                whileHover={{ scale: 1.03, color: "#5eead4" }}
                                className="text-sm sm:text-xl font-bold text-white"
                                transition={{
                                  type: "spring",
                                  stiffness: 180,
                                  damping: 14,
                                }}
                              >
                                {item.name}
                              </motion.h3>
                            </Link>
                            {item.variant && (
                              <p className="text-xs sm:text-sm text-cyan-300">
                                Variant:{" "}
                                <span className="ml-1 font-medium text-fuchsia-400/95">
                                  {item.variant}
                                </span>
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <motion.span
                                layout="position" // ✅ Optimized layout prop
                                animate={{
                                  scale: selected ? 1.11 : 1,
                                  color: selected ? "#4ade80" : "#fff",
                                }}
                                className="text-lg font-base sm:font-bold text-emerald-400"
                                aria-label="Price"
                              >
                                ₹{item.price.toFixed(2)}
                              </motion.span>
                              <span className="text-xs text-emerald-300">
                                &times; {item.quantity}
                              </span>
                            </div>
                            {/* <span className="hidden md:inline-block text-xs tracking-wider text-cyan-400/60">
                              In stock: {item.stock}
                            </span> */}
                          </div>

                          {/* Quantity controls, responsive */}
                          <div className="flex items-center gap-1 text-white mx-auto sm:mx-0">
                            <motion.button
                              whileTap={{
                                scale: 0.9,
                                backgroundColor: "#c026d3",
                              }}
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.variant, -1)
                              }
                              className="p-2 bg-gradient-to-br from-fuchsia-700 via-zinc-700 to-indigo-800 rounded-lg hover:bg-cyan-600
                              disabled:opacity-40 disabled:cursor-not-allowed border border-cyan-600/40"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
                            </motion.button>
                            <span className="px-3 text-lg font-bold select-none">
                              {item.quantity}
                            </span>
                            <motion.button
                              whileTap={{
                                scale: 0.92,
                                backgroundColor: "#0ea5e9",
                              }}
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.variant, 1)
                              }
                              className="p-2 bg-gradient-to-br from-cyan-700 via-zinc-700 to-cyan-900 rounded-lg hover:bg-emerald-600
                              disabled:opacity-40 disabled:cursor-not-allowed border border-cyan-600/40"
                              disabled={item.quantity >= item.stock}
                            >
                              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                            </motion.button>
                          </div>
                        </div>
                        {/* REMOVE BUTTON */}
                        <motion.button
                          whileTap={{ scale: 0.97, rotate: 2 }}
                          whileHover={{
                            scale: 1.08,
                            backgroundColor: "#dc2626",
                          }}
                          onClick={() =>
                            removeFromCart(item.id, item.variant ?? "default")
                          }
                          className="mx-auto flex-shrink-0 
             px-3 py-1.5 text-[12px] sm:px-4 sm:py-2 sm:text-xs 
             bg-red-600 hover:bg-red-700 text-white font-semibold 
             rounded-lg transition-all duration-200 border border-red-700/70 
             shadow-lg flex gap-2 items-center"
                        >
                          <Trash2 className="inline-block w-3 h-3 sm:w-4 sm:h-4" />{" "}
                          Remove
                        </motion.button>

                        {/* Selection highlight anim */}
                        {selected && (
                          <motion.span
                            layoutId="cartSelected"
                            className="absolute -z-10 inset-0 rounded-2xl pointer-events-none
                            bg-gradient-to-br from-cyan-700/30 via-emerald-400/10 to-cyan-100/5"
                            animate={{ opacity: [0.67, 0.97, 0.9, 0.85] }}
                            transition={{
                              duration: 0.6,
                              repeat: 0,
                            }}
                          />
                        )}
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </motion.ul>
              {/* BOTTOM BAR */}
              <motion.div
                initial={{ opacity: 0, y: 70, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.33, duration: 0.55, type: "spring" }}
                className="sticky bottom-5 left-0 right-0 z-20 mt-11 mx-auto max-w-2xl"
              >
                <Glass className="flex flex-col sm:flex-row justify-between items-center gap-1 py-5 px-6 sm:gap-10 w-full drop-shadow-2xl border border-cyan-500/80">
                  <motion.div
                    layout="position"
                    className="mb-4 sm:mb-0"
                    animate={{
                      scale: [1, 1.08, 1.03, 1],
                      // shimmer amount increases on total change
                    }}
                  >
                    <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      Total:{" "}
                      <span className="text-cyan-300">
                        ₹{totalAmount.toFixed(2)}
                      </span>
                    </span>
                    <div className="text-xs text-cyan-200/80">
                      Only{" "}
                      <span className="font-bold text-indigo-400">
                        selected
                      </span>{" "}
                      items included.
                    </div>
                  </motion.div>
                  <div className="flex flex-col xs:flex-row gap-4 w-full sm:w-auto">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.04, backgroundColor: "#ef4444" }}
                      onClick={clearCart}
                      className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 shadow-lg"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      Clear Cart
                    </motion.button>
                    <motion.button
                      onClick={() => router.push("/checkout")}
                      whileTap={{ scale: 0.97, backgroundColor: "#059669" }}
                      whileHover={{
                        scale: 1.07,
                        backgroundImage:
                          "linear-gradient(90deg,#34d399 10%,#a21caf 80%)",
                      }}
                      className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-lg"
                    >
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Proceed to</span>{" "}
                      Checkout
                    </motion.button>
                  </div>
                </Glass>
              </motion.div>
            </motion.section>
          )}
        </AnimatePresence>
      </section>
      {/* Decorative nebula swirl */}
      <motion.div
        className="pointer-events-none fixed -bottom-28 -right-32 w-[430px] h-[330px] -z-10"
        animate={{
          rotate: [0, 14, -12, 0],
          opacity: [0.64, 0.93, 0.66, 0.82],
          scale: [1.06, 0.99, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        style={{
          background:
            "radial-gradient(circle farthest-side, #f0abfc60 0%, #06b6d450 60%, transparent 100%)",
          filter: "blur(60px)",
        }}
      />
    </main>
  );
}
