// src/components/checkout/utils.ts
import { Address } from "./addressTypes";

const ADDRESSES_STORAGE_KEY = "savedAddresses";

export const getSavedAddresses = (): Address[] => {
  if (typeof window === "undefined") return []; // Ensure runs only on client
  const stored = localStorage.getItem(ADDRESSES_STORAGE_KEY);
  try {
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to parse addresses from localStorage:", e);
    localStorage.removeItem(ADDRESSES_STORAGE_KEY); // Clear corrupted data
    return [];
  }
};

export const saveAddresses = (addresses: Address[]): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(addresses));
  }
};