"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

export default function SyncToken() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) {
      // You can customize what to store
      const tokenPayload = {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: (session.user as any).role,
      };

      localStorage.setItem("token", JSON.stringify(tokenPayload));
    }
  }, [session]);

  return null;
}
