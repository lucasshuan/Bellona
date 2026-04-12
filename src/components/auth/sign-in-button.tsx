"use client";

import { useTransition } from "react";

import { LoaderCircle, LogIn } from "lucide-react";
import { signIn } from "next-auth/react";
import type { VariantProps } from "class-variance-authority";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SignInButtonProps = {
  disabled?: boolean;
  callbackUrl?: string;
  label?: string;
  className?: string;
  size?: VariantProps<typeof buttonVariants>["size"];
  intent?: VariantProps<typeof buttonVariants>["intent"];
};

export function SignInButton({
  disabled = false,
  callbackUrl = "/",
  label = "Login",
  className,
  size = "lg",
  intent = "primary",
}: SignInButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size={size}
      intent={intent}
      disabled={disabled || isPending}
      onClick={() =>
        startTransition(async () => {
          await signIn("discord", { callbackUrl });
        })
      }
      className={cn("w-full sm:w-auto", className)}
    >
      {isPending ? (
        <LoaderCircle className="mr-2 size-4 animate-spin" />
      ) : (
        <LogIn className="mr-2 size-4" />
      )}
      {label}
    </Button>
  );
}
