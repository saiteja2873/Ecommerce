// src/hooks/useAuthStatus.ts
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export function useAuthStatus() {
  const { data: session, status } = useSession(); // Google login
  const [authResolved, setAuthResolved] = useState(false);
  const [jwt, setJwt] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loginMethod, setLoginMethod] = useState<"manual" | "google" | null>(null);

  useEffect(() => {
    const resolveAuth = () => {
      const token = localStorage.getItem("token");
      const loginMethodStored = localStorage.getItem("loginMethod");

      if (token && loginMethodStored === "manual") {
        setJwt(token);
        setEmail(null);
        setLoginMethod("manual");
        setAuthResolved(true);
        return;
      }

      if (status === "authenticated" && session?.user?.email) {
        setJwt(token);
        setEmail(session.user.email);
        setLoginMethod("google");
        setAuthResolved(true);
        return;
      }

      // Default: not logged in
      setJwt(null);
      setEmail(null);
      setLoginMethod(null);
      setAuthResolved(true);
    };

    if (status !== "loading") {
      resolveAuth();
    }
  }, [status, session]);

  // ✅ ADDED: Derive isAuthenticated here
  const isAuthenticated = !!jwt || !!email;

  return { jwt, email, authResolved, loginMethod, isAuthenticated }; // ✅ Return isAuthenticated
}