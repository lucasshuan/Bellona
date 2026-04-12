import type { ButtonHTMLAttributes } from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full border text-sm font-medium transition cursor-pointer disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      intent: {
        primary:
          "border-primary/70 bg-primary text-white shadow-[0_14px_40px_rgba(186,17,47,0.28)] hover:bg-[#cf1d3e]",
        secondary:
          "border-white/10 bg-white/5 text-foreground hover:border-primary/40 hover:bg-white/8",
        ghost:
          "border-white/10 bg-transparent text-foreground hover:border-primary/50 hover:bg-primary/8",
      },
      size: {
        sm: "h-10 px-4",
        md: "h-11 px-5",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      intent: "primary",
      size: "md",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, intent, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ intent, size }), className)}
      {...props}
    />
  );
}
