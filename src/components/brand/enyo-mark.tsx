import { cn } from "@/lib/utils";

type EnyoMarkProps = {
  className?: string;
};

export function EnyoMark({ className }: EnyoMarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={cn("size-9", className)}
      fill="none"
    >
      <path
        d="M32 6C20.8 10.7 15 18.7 15 30.8c0 13.3 7.3 22.7 17 27.2 9.7-4.5 17-13.9 17-27.2C49 18.7 43.2 10.7 32 6Z"
        className="fill-primary/20 stroke-primary"
        strokeWidth="3"
      />
      <path
        d="M24 27.5c0-5.8 3.6-10.5 8-10.5s8 4.7 8 10.5"
        className="stroke-secondary"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M21 30h22v5.5c0 9-5 14.4-11 17-6-2.6-11-8-11-17V30Z"
        className="fill-card-strong stroke-primary"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M27 37h10"
        className="stroke-secondary"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M24 22l-7 4M40 22l7 4"
        className="stroke-primary"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
