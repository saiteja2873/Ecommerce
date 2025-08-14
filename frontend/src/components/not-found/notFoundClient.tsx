// app/components/not-found/notFoundClient.tsx
"use client";

import { useSearchParams } from "next/navigation";

export default function NotFoundClient() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("code");

  return (
    <div>
      <h1>Page Not Found</h1>
      {errorCode && <p>Error Code: {errorCode}</p>}
    </div>
  );
}
