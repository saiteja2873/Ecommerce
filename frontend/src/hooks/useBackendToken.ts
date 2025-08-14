import { useEffect } from "react";
import { useSession } from "next-auth/react";

export function useBackendToken() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const token = session.user.backendToken

      if (token) {
        localStorage.setItem("token", token);
      }
    }
  }, [session, status]);
}
