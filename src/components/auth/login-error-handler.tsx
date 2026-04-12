"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export function LoginErrorHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get("error");

  useEffect(() => {
    if (error) {
      // Show alert with error message
      alert(`Login failed: ${error}. Please try again.`);

      // Redirect to home without the error param
      router.replace("/");
    }
  }, [error, router]);

  return null;
}
