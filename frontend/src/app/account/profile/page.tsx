"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { signOut } from "next-auth/react";
import { useCartContext } from "@/context/cartContext";


type User = {
  id: string;
  name: string;
  email: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const { jwt, email, authResolved, loginMethod } = useAuthStatus();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Redirect if unauthenticated — only after auth is resolved
  useEffect(() => {
    if (!authResolved) return;

    const isNotAuthenticated =
      (loginMethod === "manual" && !jwt) ||
      (loginMethod === "google" && !email) ||
      !loginMethod;

    if (isNotAuthenticated) {
      router.replace("/account/login");
    }
  }, [authResolved, jwt, email, loginMethod, router]);

  // ✅ Fetch user data once auth is valid and resolved
  useEffect(() => {
    if (!authResolved) return;

    const fetchUser = async () => {
      try {
        let res: Response;

        if (loginMethod === "manual" && jwt) {
          res = await fetch("http://localhost:3001/api/users/profile", {
            headers: {
              Authorization: `Bearer ${jwt}`,
              "Content-Type": "application/json",
            },
          });
        } else if (loginMethod === "google" && email) {
          res = await fetch("http://localhost:3001/api/users/by-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
        } else {
          return; // Not ready to fetch
        }

        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();
        setUser(data.user as User);
      } catch (err) {
        console.error("User fetch failed:", err);
        router.replace("/account/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [authResolved, loginMethod, jwt, email, router]);

  // ✅ Logout handler
  const { clearCart } = useCartContext(); // ⬅️ add this at the top of the component

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loginMethod");
    localStorage.removeItem("cart");
    // clearCart(); // 🧹 clear cart from context state immediately

    if (loginMethod === "google") {
      signOut({ callbackUrl: "/account/login" }); // next-auth logout
    } else {
      router.push("/account/login"); // manual logout
    }
  };

  // ✅ Show loading while resolving auth or fetching user
  if (!authResolved || loading) {
    return <div className="p-6">Loading...</div>;
  }

  // ✅ Show nothing if user data not fetched
  if (!user) return null;

  // ✅ Profile page UI
  return (
    <div className="max-w-xl mx-auto p-6 mt-10 bg-white dark:bg-neutral-900 shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
        My Profile
      </h2>
      <div className="space-y-2">
        <p className="text-gray-700 dark:text-gray-300">
          <strong>Name:</strong> {user.name}
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          <strong>Email:</strong> {user.email}
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          <strong>User ID:</strong> {user.id}
        </p>
      </div>
      <button
        onClick={handleLogout}
        className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  );
}
