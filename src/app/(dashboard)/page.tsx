"use client";

import { Suspense } from "react";
import HomePage from "@/features/posts/pages/HomePage";

export default function DashboardHomeRoute() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <HomePage />
    </Suspense>
  );
}
