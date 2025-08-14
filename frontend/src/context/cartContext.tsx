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
        const res = await fetch("https://ecommerce-j5j0.onrender.com/api/cart", {
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

  const [disabledItems, setDisabledItems] = useState<string[]>([]);

  const addToCart = (item: CartItem): boolean => {
    if (!jwt) {
      toast.error("You must be logged in to add to cart.");
      return false;
    }

    if (item.quantity <= 0) {
      toast.error("Invalid quantity.");
      return false;
    }

    const normalizeId = (id: string) =>
      id.includes("-") ? id.split("-")[0] : id;

    const existing = cartItems.find(
      (p) =>
        normalizeId(p.id) === normalizeId(item.id) && p.variant === item.variant
    );

    const newQuantity = existing
      ? existing.quantity + item.quantity
      : item.quantity;

    if (newQuantity > item.stock) {
      toast.error(`Only ${item.stock} items in stock.`);
      return false; // Button will already be disabled because of `isMaxedOutInCart`
    }

    const [productId, variantLabel] = item.id.split("-");

    fetch("https://ecommerce-j5j0.onrender.com/api/cart", {
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
          normalizeId(p.id) === normalizeId(item.id) &&
          p.variant === item.variant
            ? { ...p, quantity: newQuantity }
            : p
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

          fetch("https://ecommerce-j5j0.onrender.com/api/cart", {
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

    // Build the correct key
    const key = id.includes("-") ? id : `${id}-${variant ?? "default"}`;

    // Remove from selectedItems in localStorage
    const storedSelected = JSON.parse(
      localStorage.getItem("selectedItems") || "[]"
    );
    const updatedSelected = storedSelected.filter(
      (itemKey: string) => itemKey !== key
    );
    localStorage.setItem("selectedItems", JSON.stringify(updatedSelected));

    // Remove from cartItems in localStorage
    const storedCart = JSON.parse(localStorage.getItem("cartItems") || "[]");
    const updatedCart = storedCart.filter(
      (item: any) => !(item.id === id && item.variant === variant)
    );
    localStorage.setItem("cartItems", JSON.stringify(updatedCart));

    // Update frontend state
    setCartItems((prev) =>
      prev.filter((item) => !(item.id === id && item.variant === variant))
    );

    // Backend delete request
    fetch("https://ecommerce-j5j0.onrender.com/api/cart", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        key: id,
        variant: variant ?? "default",
      }),
    });
  };

  const clearCart = () => {
    if (!jwt) return;

    fetch("https://ecommerce-j5j0.onrender.com/api/cart/clear", {
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
