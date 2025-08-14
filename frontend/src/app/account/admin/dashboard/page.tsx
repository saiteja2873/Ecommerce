"use client";

import { Suspense } from "react";
import AdminDashboardContent from "./dashboardContent"; // move your current JSX here

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}
