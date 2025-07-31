// hooks/useAuthStatus.ts
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export function useAuthStatus() {
  const { data: session, status } = useSession();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"token" | "google" | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setIsLoggedIn(true);
      setLoginMethod("token");
    } else if (status === "authenticated" && session?.user?.email) {
      setIsLoggedIn(true);
      setLoginMethod("google");
    } else {
      setIsLoggedIn(false);
      setLoginMethod(null);
    }
  }, [session, status]);

  return { isLoggedIn, loginMethod, session, status };
}
