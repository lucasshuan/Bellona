"use client";

import { useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      router.replace("/?error=Callback");
      return;
    }

    void (async () => {
      const result = await signIn("credentials", {
        token,
        redirect: false,
      });

      if (result?.ok) {
        router.replace("/profile");
        return;
      }

      router.replace("/?error=Callback");
    })();
  }, [router, searchParams]);

  return null;
}
