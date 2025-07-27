import { useCartContext } from "@/context/cartContext";

export const useCart = () => {
  return useCartContext();
};
