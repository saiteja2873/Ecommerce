// src/components/checkout/utils.ts
import { Address } from "./addressTypes";

export const getSavedAddresses = async (): Promise<Address[]> => {
  if (typeof window === "undefined") return [];

  const token = localStorage.getItem("token");
  if (!token) {
    console.warn("User not logged in. No token found.");
    return [];
  }

  try {
    const res = await fetch("https://ecommerce-j5j0.onrender.com/api/address/user/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || "Failed to fetch addresses");
    }

    return data.addresses || [];
  } catch (error) {
    console.error("Error fetching addresses from DB:", error);
    return [];
  }
};
