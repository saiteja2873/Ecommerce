// app/not-found.tsx
import { Suspense } from "react";
import NotFoundClient from "@/components/not-found/notFoundClient";

export default function NotFoundPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotFoundClient />
    </Suspense>
  );
}
