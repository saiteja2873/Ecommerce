// src/components/layout/BackButton.tsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useLoaderStore } from "@/context/loaderStore";

export default function BackButton() {
  const router = useRouter();
  const { setLoading } = useLoaderStore();
  const pathName = usePathname();

  if(pathName === "/"){
    return null;
  }

  const handleBack = () => {
    setLoading(true, 500);
    router.back();
  };

  return (
    <button
      onClick={handleBack}
      className="fixed top-15 2xl:top-25 left-4 z-[9999] w-10 h-10 flex items-center justify-center rounded-full border border-white bg-black text-white hover:bg-white hover:text-black transition-all"
    >
      <ArrowLeft size={20} />
    </button>
  );
}
