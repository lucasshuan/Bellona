"use client";

import { useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { LoaderCircle, X } from "lucide-react";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  isPending: boolean;
};

export function AuthModal({ isOpen, onClose, isPending }: AuthModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 backdrop:bg-black/50 backdrop:backdrop-blur-sm open:flex open:items-center open:justify-center"
    >
      <div className="glass-panel w-full max-w-sm rounded-[1.8rem] p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.04em]">
              Sign in or sign up
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-white/8 transition"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-3">
          <button
            onClick={() =>
              signIn("discord", { callbackUrl: "/" })
            }
            disabled={isPending}
            className="w-full flex items-center justify-center gap-3 rounded-full border border-white/10 bg-white/5 hover:border-primary/40 hover:bg-white/8 transition px-6 py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <LoaderCircle className="size-5 animate-spin" />
            ) : (
              <svg
                className="size-5"
                viewBox="0 0 127.14 96.36"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="currentColor"
                  d="M107.7,8.07A105.15,105.15,0,0,0,62.16,0h-.07a105.56,105.56,0,0,0-45.51,8.07A97.51,97.51,0,0,0,.8,77.65a104.56,104.56,0,0,0,16.25,12.7q4,2.7,8.06,5.36a48.38,48.38,0,0,0,5.03,3.79,104.82,104.82,0,0,0,8.88,2.23A85.85,85.85,0,0,0,62.16,96.36q26.66,0,42.16-13.38a93.1,93.1,0,0,0,26.2-29.9A108.57,108.57,0,0,0,127.14,8.07ZM42.89,65.69c-7.8,0-14-7.2-14-16s6.2-16,14-16c7.89,0,14.1,7.2,14,16S50.78,65.69,42.89,65.69Zm40.4,0c-7.8,0-14-7.2-14-16s6.2-16,14-16c7.89,0,14.1,7.2,14,16S91.17,65.69,83.29,65.69Z"
                  transform="translate(0 0)"
                />
              </svg>
            )}
            {isPending ? "Signing in..." : "Continue with Discord"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
