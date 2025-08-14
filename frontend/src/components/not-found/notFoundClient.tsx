// components/NotFoundClient.tsx
"use client";

import { useSearchParams } from "next/navigation";

export default function NotFoundClient() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  return <div>Page not found. Error: {error}</div>;
}
