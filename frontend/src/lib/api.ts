// lib/api.ts

export async function getProductsByCategory(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products?category=${slug}`, {
    cache: "no-store",
  });

  if (!res.ok) return [];

  const data = await res.json();
  return data.products;
}


// src/lib/api.ts (or anywhere suitable)
import { Product } from "@/types/product";

export const fetchNewProducts = async (): Promise<Product[]> => {
  const res = await fetch("/api/products/new", {
    method: "GET",
    cache: "no-store", // Optional: disables caching for freshness
  });

  if (!res.ok) {
    throw new Error("Failed to Fetch New Products");
  }

    const json = await res.json()
  return await json.products; // Returns Product[]
};


// ===========================
// ✅ USER PROFILE APIs (JWT-based)
// ===========================

import { User } from "@/types/user";

// Fetch user profile
export async function getProfile(token: string): Promise<User> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/profile`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch profile");
  }

  const data = await res.json();
  return data.user;
}

// Editable fields in profile
type EditableUserFields = {
  name?: string;
  phone?: string;
  image?: string; // only a URL string if image was uploaded separately
};

// Update user profile
export async function updateProfile(token: string, updates: EditableUserFields): Promise<User> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    throw new Error("Failed to update profile");
  }

  const data = await res.json();
  return data.user;
}

// Upload user profile image
export async function uploadProfileImage(token: string, file: File): Promise<string> {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://ecommerce-j5j0.onrender.com";

  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${BASE_URL}/api/users/profile/image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Failed to upload profile image");
  }

  const data = await res.json();
  return data.imageUrl; // ensure backend returns this key
}
