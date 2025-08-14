"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function NotFoundClient() {
  const searchParams = useSearchParams();
  const [errorCode, setErrorCode] = useState<string | null>(null);

  // Only read search params after the component mounts in the browser
  useEffect(() => {
    setErrorCode(searchParams.get("code"));
  }, [searchParams]);

  return (
    <div>
      <h1>Page Not Found</h1>
      {errorCode && <p>Error Code: {errorCode}</p>}
    </div>
  );
}
