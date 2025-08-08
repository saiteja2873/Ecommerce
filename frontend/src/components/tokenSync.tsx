// components/TokenSync.tsx
"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

export default function TokenSync() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) {
      const token = (session.user as any).token;
      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("loginMethod", "google");
      }else{
        localStorage.setItem("loginMethod", "manual");
      }
    }
  }, [session]);

  return null;
}
