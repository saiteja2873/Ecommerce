// src/components/checkout/addressTypes.d.ts (or similar)
export type Address = {
  id: string; // Added for unique identification
  fullName: string;
  phone: string; // Added phone based on your form
  addressLine1: string;
  addressLine2?: string; // Optional
  city: string;
  state: string;
  pincode: string; // Changed from 'zipCode' to 'pincode' to match your form
  country: string;
};