import Image from "next/image";
import Link from "next/link";

import { SignInButton } from "@/components/auth/sign-in-button";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { buttonVariants } from "@/components/ui/button";
import { getServerAuthSession } from "@/server/auth";
import { hasDiscordAuth } from "@/server/auth/config";

export async function SiteHeader() {
  const session = await getServerAuthSession();

  return (
    <header className="sticky top-0 z-30 border-b border-white/6 bg-background/88 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 sm:px-10 lg:px-12">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/icon.svg"
            alt="Enyo"
            width={30}
            height={30}
            className="brightness-0 saturate-100"
            style={{ filter: "brightness(0) saturate(100%) invert(16%) sepia(92%) saturate(4203%) hue-rotate(340deg) brightness(87%) contrast(97%)" }}
            priority
          />
          <p className="text-xl font-semibold tracking-[-0.04em] text-primary">
            Enyo
          </p>
        </Link>

        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              <Link
                href="/dashboard"
                className={buttonVariants({ intent: "secondary", size: "sm" })}
              >
                Dashboard
              </Link>
              <SignOutButton size="sm" />
            </>
          ) : (
            <SignInButton
              size="sm"
              label="Login"
              callbackUrl="/"
              disabled={!hasDiscordAuth}
              className="min-w-24"
            />
          )}
        </div>
      </div>
    </header>
  );
}
