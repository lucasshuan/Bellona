import type { ButtonHTMLAttributes } from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full border text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      intent: {
        primary:
          "border-primary/60 bg-primary text-slate-950 shadow-[0_14px_40px_rgba(108,226,255,0.22)] hover:bg-[#93ebff]",
        secondary:
          "border-white/14 bg-white/5 text-foreground hover:border-secondary/50 hover:bg-white/8",
        ghost:
          "border-white/10 bg-transparent text-foreground hover:border-primary/50 hover:bg-white/5",
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
