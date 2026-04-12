"use client";

import { useTransition } from "react";

import { LoaderCircle, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import type { VariantProps } from "class-variance-authority";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SignOutButtonProps = {
  callbackUrl?: string;
  label?: string;
  className?: string;
  size?: VariantProps<typeof buttonVariants>["size"];
  intent?: VariantProps<typeof buttonVariants>["intent"];
};

export function SignOutButton({
  callbackUrl = "/",
  label = "Sair",
  className,
  size = "md",
  intent = "ghost",
}: SignOutButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      intent={intent}
      size={size}
      onClick={() =>
        startTransition(async () => {
          await signOut({ callbackUrl });
        })
      }
      className={cn(className)}
    >
      {isPending ? (
        <LoaderCircle className="mr-2 size-4 animate-spin" />
      ) : (
        <LogOut className="mr-2 size-4" />
      )}
      {label}
    </Button>
  );
}
