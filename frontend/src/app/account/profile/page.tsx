"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { signOut } from "next-auth/react";

// ✅ Define User type inline
type User = {
  id: string;
  name: string;
  email: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const { session, status, loginMethod } = useAuthStatus();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 1️⃣ Redirect unauthenticated users after status is resolved
  useEffect(() => {
    if (status === "loading") return;

    const token = localStorage.getItem("token");
    const isGoogle = status === "authenticated" && session?.user?.email;

    if (!token && !isGoogle) {
      router.replace("/account/login");
    }
  }, [status, session, router]);

  // 2️⃣ Fetch user once loginMethod is known
  useEffect(() => {
    if (status === "loading" || loginMethod === null) return;

    const fetchUser = async () => {
      try {
        if (loginMethod === "token") {
          const token = localStorage.getItem("token");
          const res = await fetch("http://localhost:3001/api/users/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          if (!res.ok) throw new Error("Unauthorized");
          const data = await res.json();
          setUser(data.user as User);
        } else if (loginMethod === "google" && session?.user?.email) {
          const res = await fetch("http://localhost:3001/api/users/by-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: session.user.email }),
          });
          if (!res.ok) throw new Error("User not found");
          const data = await res.json();
          setUser(data.user as User);
        }
      } catch (err) {
        router.replace("/account/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [loginMethod, status, session, router]);

  const handleLogout = () => {
    localStorage.removeItem("token");

    if (loginMethod === "google") {
      signOut({ callbackUrl: "/account/login" });
    } else {
      router.push("/account/login");
    }
  };

  if (loading || status === "loading")
    return <div className="p-6">Loading...</div>;
  if (!user) return null;

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
