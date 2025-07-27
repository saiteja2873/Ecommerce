// types/cart.d.ts

export type CartItem = {
  id: string;         // ✅ Add this
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
};
