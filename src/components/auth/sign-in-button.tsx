"use client";

import { useTransition } from "react";

import { LoaderCircle, LogIn } from "lucide-react";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";

type SignInButtonProps = {
  disabled?: boolean;
};

export function SignInButton({ disabled = false }: SignInButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="lg"
      disabled={disabled || isPending}
      onClick={() =>
        startTransition(async () => {
          await signIn("discord", { callbackUrl: "/dashboard" });
        })
      }
      className="w-full sm:w-auto"
    >
      {isPending ? (
        <LoaderCircle className="mr-2 size-4 animate-spin" />
      ) : (
        <LogIn className="mr-2 size-4" />
      )}
      Entrar com Discord
    </Button>
  );
}
