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
  addToCart: (item: CartItem) => void;
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

  const addToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existing = prev.find((p) => p.id === item.id); // id already includes variant

      if (existing) {
        const updatedQty = existing.quantity + item.quantity;

        if (updatedQty > item.stock) {
          toast.error(`Cannot add more than available stock (${item.stock}).`);
          return prev;
        }

        return prev.map((p) =>
          p.id === item.id ? { ...p, quantity: updatedQty } : p
        );
      }

      if (item.quantity > item.stock) {
        toast.error(`Cannot add more than available stock (${item.stock}).`);
        return prev;
      }

      return [...prev, item];
    });
  };

  const updateCartItemQuantity = (
    id: string,
    variant: string | undefined,
    delta: number
  ) => {
    setCartItems((prev) => {
      let changed = false;
      const updatedCart = prev.map((item) => {
        if (item.id === id) {
          const newQuantity = item.quantity + delta;

          if (newQuantity > item.stock) {
            toast.error(`Only ${item.stock} items in stock.`);
            return item;
          }

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
