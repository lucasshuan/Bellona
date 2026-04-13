"use client";

import { useTranslations } from "next-intl";
import { LogOut, Settings, User as UserIcon } from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { Link } from "@/i18n/routing";

type UserProps = {
  id: string;
  image?: string | null;
  name?: string | null;
  email?: string | null;
  username?: string | null;
};

export function UserMenu({ user }: { user: UserProps }) {
  const t = useTranslations("Header");

  return (
    <div className="group relative z-50">
      <button className="flex cursor-pointer items-center justify-center overflow-hidden rounded-full border border-white/10 transition-colors hover:border-white/20">
        {user?.image ? (
          <Image
            src={user.image}
            alt={user.name || "Avatar"}
            width={32}
            height={32}
            className="size-8 object-cover"
          />
        ) : (
          <div className="flex size-8 items-center justify-center bg-white/5">
            <UserIcon className="size-4 text-white/50" />
          </div>
        )}
      </button>

      <div className="invisible absolute top-full right-0 w-3xs pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
        <div className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a] shadow-xl">
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
            {user?.image ? (
              <Image
                src={user.image}
                alt={user.name ?? "Avatar"}
                width={36}
                height={36}
                className="size-9 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/5">
                <UserIcon className="size-5 text-white/50" />
              </div>
            )}
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium text-white leading-tight">
                {user.username ?? user.name ?? "User"}
              </span>
              <span className="truncate text-xs text-white/50">
                {user.email ?? ""}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-0.5 border-b border-white/10 p-1.5">
            <Link
              href={`/profile/${user.username ?? user.id}`}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              <UserIcon className="size-4 shrink-0 transition-colors group-hover:text-white" />
              <span className="leading-none">{t("viewProfile")}</span>
            </Link>
            <Link
              href="/profile/edit"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Settings className="size-4 shrink-0 transition-colors group-hover:text-white" />
              <span className="leading-none">{t("editAccount")}</span>
            </Link>
          </div>

          <div className="p-1.5">
            <button
              onClick={() => signOut()}
              className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-500/80 transition-colors hover:bg-red-500/10 hover:text-red-500"
            >
              <LogOut className="size-4 shrink-0" />
              <span className="leading-none">{t("logout")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
