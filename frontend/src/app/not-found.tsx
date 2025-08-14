"use client";

import { Suspense } from "react";
import NotFoundClient from "@/components/not-found/notFoundClient";

export const dynamic = "force-dynamic"; // Prevent static prerender issues

export default function NotFoundPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotFoundClient />
    </Suspense>
  );
}
