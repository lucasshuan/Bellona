"use client";

import { useState, useTransition } from "react";

import { LogIn } from "lucide-react";
import type { VariantProps } from "class-variance-authority";

import { Button, buttonVariants } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/auth-modal";
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleOpenModal = () => {
    if (!disabled) {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <Button
        size={size}
        intent={intent}
        disabled={disabled || isPending}
        onClick={handleOpenModal}
        className={cn("w-full sm:w-auto", className)}
      >
        <LogIn className="mr-2 size-4" />
        {label}
      </Button>
      <AuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isPending={isPending}
      />
    </>
  );
}
