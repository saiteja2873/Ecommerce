"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { verifyTokenClient } from "@/utils/jwt";

const AuthContext = createContext<{ userId: string | null }>({ userId: null });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const payload = token ? verifyTokenClient(token) : null;
    if (payload?.id) {
      setUserId(payload.id);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ userId }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
