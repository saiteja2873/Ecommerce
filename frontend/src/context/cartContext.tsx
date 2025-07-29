// src/context/cartContext.tsx
"use client";
import toast from "react-hot-toast";

import { createContext, useContext, useEffect, useState } from "react";

type CartItem = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  variant?: string;
  stock: number;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => boolean;
  removeFromCart: (productId: string, variant?: string) => void;
  clearCart: () => void;
  setCartItems: (items: CartItem[]) => void;
  updateCartItemQuantity: (
    id: string,
    variant: string | undefined,
    delta: number
  ) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      try {
        setCartItems(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse cart from localStorage:", e);
        localStorage.removeItem("cart");
      }
    }
  }, []);

  useEffect(() => {
    if (
      cartItems.length > 0 ||
      localStorage.getItem("cart") !== JSON.stringify([])
    ) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems]);

const addToCart = (item: CartItem): boolean => {
  let success = false;

  if (item.quantity <= 0) {
    // ❌ Skip adding items with invalid quantity
    toast.error("Invalid quantity to add.");
    return false;
  }

  setCartItems((prev) => {
    const existing = prev.find((p) => p.id === item.id);

    if (existing) {
      const updatedQty = existing.quantity + item.quantity;

      // ✅ Don't exceed stock
      if (updatedQty > item.stock) {
        toast.error(`Cannot add more than available stock (${item.stock}).`);
        return prev;
      }

      success = true;
      return prev.map((p) =>
        p.id === item.id ? { ...p, quantity: updatedQty } : p
      );
    }

    // ✅ Check stock for new item
    if (item.quantity > item.stock) {
      toast.error(`Cannot add more than available stock (${item.stock}).`);
      return prev;
    }

    success = true;
    return [...prev, item];
  });

  return success;
};

  const updateCartItemQuantity = (
    id: string,
    variant: string | undefined, // can ignore if variant is embedded in id
    delta: number
  ) => {
    setCartItems((prev) => {
      let changed = false;

      const updatedCart = prev.map((item) => {
        if (item.id === id) {
          const newQuantity = item.quantity + delta;

          // ✅ Only show stock error when increasing
          if (delta > 0 && newQuantity > item.stock) {
            toast.error(`Only ${item.stock} items in stock.`);
            return item;
          }

          // ✅ Prevent quantity from going below 1
          if (newQuantity < 1) {
            toast.error("Quantity must be at least 1.");
            return item;
          }

          changed = true;
          return { ...item, quantity: newQuantity };
        }
        return item;
      });

      return changed ? updatedCart : prev;
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        setCartItems,
        updateCartItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext must be used within CartProvider");
  }
  return context;
};
