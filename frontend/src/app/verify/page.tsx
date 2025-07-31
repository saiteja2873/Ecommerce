"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const triggeredRef = useRef(false);

  useEffect(() => {
    if (!token || triggeredRef.current) return;

    triggeredRef.current = true;

    const verifyEmail = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/verify/verify?token=${token}`, {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();

        console.log(data)

        if (res.ok) {
          // ✅ Store JWT token in localStorage
          if (data.token) {
            localStorage.setItem("token", data.token);
          }

          toast.success("Email verified successfully!");
          router.replace("/auth/login?success=verified");
        } else {
          toast.error(data.message || "Invalid or expired token.");
          router.replace("/auth/login?error=invalid_or_expired");
        }
      } catch (error) {
        toast.error("Something went wrong.");
        router.replace("/auth/login?error=invalid_or_expired");
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-medium">Verifying your email...</p>
      </div>
    );
  }

  return null;
}
