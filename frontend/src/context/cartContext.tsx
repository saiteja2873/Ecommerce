"use client";

import toast from "react-hot-toast";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuthStatus } from "@/hooks/useAuthStatus";

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
  const { jwt } = useAuthStatus();

  // ✅ Fetch cart only if JWT exists
  useEffect(() => {
    if (!jwt) return;

    const fetchCart = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/cart", {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to fetch cart");
        }

        const data = await res.json();
        setCartItems(data.items);
      } catch (err: any) {
        console.error("Failed to fetch cart:", err);
        toast.error("Could not load cart");
      }
    };

    fetchCart();
  }, [jwt]);

  const addToCart = (item: CartItem): boolean => {
    if (!jwt) {
      toast.error("You must be logged in to add to cart.");
      return false;
    }

    if (item.quantity <= 0) {
      toast.error("Invalid quantity.");
      return false;
    }

    const existing = cartItems.find((p) => p.id === item.id);

    const newQuantity = existing
      ? existing.quantity + item.quantity
      : item.quantity;

    if (newQuantity > item.stock) {
      toast.error(`Only ${item.stock} items in stock.`);
      return false;
    }

    const [productId, variantLabel] = item.id.split("-");

    fetch("http://localhost:3001/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        productId,
        variantLabel,
        quantity: item.quantity,
        thumbnail: item.imageUrl,
      }),
    }).catch((err) => {
      console.error("Add to cart failed:", err);
      toast.error("Failed to add item to cart.");
    });

    setCartItems((prev) => {
      if (existing) {
        return prev.map((p) =>
          p.id === item.id ? { ...p, quantity: newQuantity } : p
        );
      }
      return [...prev, item];
    });

    return true;
  };

  const updateCartItemQuantity = (
    id: string,
    variant: string | undefined,
    delta: number
  ) => {
    if (!jwt) return; // ✅ Guard against sync when logged out

    setCartItems((prev) => {
      let changed = false;

      const updatedCart = prev.map((item) => {
        if (item.id === id && item.variant === variant) {
          const newQuantity = item.quantity + delta;

          if (delta > 0 && newQuantity > item.stock) {
            toast.error(`Only ${item.stock} items in stock.`);
            return item;
          }

          if (newQuantity < 1) {
            toast.error("Quantity must be at least 1.");
            return item;
          }

          changed = true;

          fetch("http://localhost:3001/api/cart", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${jwt}`,
            },
            body: JSON.stringify({
              productId: id,
              variantLabel: variant,
              quantity: newQuantity,
            }),
          }).catch((err) => console.error("Failed to update cart item:", err));

          return { ...item, quantity: newQuantity };
        }
        return item;
      });

      return changed ? updatedCart : prev;
    });
  };

  const removeFromCart = (id: string, variant?: string) => {
    if (!jwt) return;

    fetch("http://localhost:3001/api/cart", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        productId: id,
        variantLabel: variant,
      }),
    }).catch((err) => console.error("Failed to remove item:", err));

    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    if (!jwt) return;

    fetch("http://localhost:3001/api/cart/clear", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    }).catch((err) => console.error("Failed to clear cart:", err));

    setCartItems([]); // Only affects local UI — not dangerous
  };

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
