"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useLoaderStore } from "@/context/loaderStore";

export default function GlobalLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { loading, setLoading } = useLoaderStore();

  useEffect(() => {
    if (loading) {
      // Delay hiding the loader for at least 500ms
      const timeout = setTimeout(() => {
        setLoading(false,500);
      },); // Adjust duration as needed

      return () => clearTimeout(timeout);
    }
  }, [pathname, searchParams]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black bg-opacity-90 text-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white" />
      {/* <span className="ml-4 text-lg">Redirecting...</span> */}
    </div>
  );
}
