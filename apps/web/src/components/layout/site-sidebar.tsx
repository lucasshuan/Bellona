"use client";

import { useState, useEffect, useRef, useTransition, useMemo } from "react";
import { createPortal } from "react-dom";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import {
  Home,
  Gamepad2,
  Trophy,
  BarChart3,
  LayoutDashboard,
  User,
  Users,
  Medal,
  Swords,
  History,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  LogOut,
  LogIn,
  Shield,
  Check,
  Settings,
  Bell,
  Pencil,
  Palette,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter, routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { AuthModal } from "@/components/modals/auth/auth-modal";
import { EditProfileModal } from "@/components/modals/profile/edit-profile-modal";

// ─── Types ────────────────────────────────────────────────────────────────────

type SessionUser = {
  id: string;
  username: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  imageUrl?: string | null;
  isAdmin?: boolean;
};

type NavItemDef = {
  href: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  soon?: boolean;
};

type SectionDef = {
  titleKey: string;
  items: NavItemDef[];
};

// ─── Locale flags ─────────────────────────────────────────────────────────────

const LOCALE_FLAGS: Record<(typeof routing.locales)[number], string> = {
  en: "fi-us",
  pt: "fi-br",
};

const LOCALE_LABELS: Record<(typeof routing.locales)[number], string> = {
  en: "English",
  pt: "Português",
};

// ─── LocaleDropdown ────────────────────────────────────────────────────────────────────────

function LocaleDropdown({
  locale,
  isPending,
  collapsed,
  onSwitch,
}: {
  locale: string;
  isPending: boolean;
  collapsed: boolean;
  onSwitch: (l: (typeof routing.locales)[number]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const tLocale = useTranslations("LocaleSwitcher");

  // Calculate fixed position from button rect
  const updateCoords = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const minWidth = 160;
    const width = Math.max(rect.width, minWidth);
    const left = Math.max(
      8,
      Math.min(rect.left, window.innerWidth - width - 8),
    );
    setCoords({ top: rect.top, left, width });
  };

  useEffect(() => {
    if (!open) return;
    updateCoords();

    const handleClose = (e: MouseEvent) => {
      if (
        buttonRef.current?.contains(e.target as Node) ||
        dropdownRef.current?.contains(e.target as Node)
      )
        return;
      setOpen(false);
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("scroll", updateCoords, true);
    window.addEventListener("resize", updateCoords);
    document.addEventListener("mousedown", handleClose);
    document.addEventListener("keydown", escape);
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
      document.removeEventListener("mousedown", handleClose);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  const dropdown = open ? (
    <div
      ref={dropdownRef}
      role="listbox"
      aria-label={tLocale("label")}
      style={{ top: coords.top, left: coords.left, width: coords.width }}
      className="fixed z-9999 flex -translate-y-full flex-col gap-0.5 overflow-hidden rounded-xl border border-white/10 bg-[#0f0b12]/95 p-1 shadow-2xl backdrop-blur-xl"
    >
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          role="option"
          aria-selected={locale === l}
          onClick={() => {
            onSwitch(l);
            setOpen(false);
          }}
          className={cn(
            "no-lift flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-white/8",
            locale === l ? "bg-white/6 text-white" : "text-white/70",
          )}
        >
          <span
            className={cn("fi fis size-4 shrink-0 rounded-sm", LOCALE_FLAGS[l])}
          />
          <span className="flex-1 font-medium">{LOCALE_LABELS[l]}</span>
          {locale === l && <Check className="text-primary size-3 shrink-0" />}
        </button>
      ))}
    </div>
  ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        disabled={isPending}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`${tLocale("label")}: ${tLocale(locale as (typeof routing.locales)[number])}`}
        className={cn(
          "no-lift flex items-center text-sm",
          "text-white/70 transition-colors hover:bg-white/7 hover:text-white",
          "disabled:cursor-wait disabled:opacity-50",
          collapsed
            ? "mx-2 w-auto justify-center rounded-lg border-transparent bg-transparent py-1.5 hover:bg-white/5"
            : "h-12 w-full gap-3 rounded-full border border-white/8 px-5",
        )}
      >
        <span
          className={cn(
            "fi shrink-0",
            collapsed ? "fis size-5 rounded-md" : "size-4 rounded-xs",
            LOCALE_FLAGS[locale as keyof typeof LOCALE_FLAGS],
            isPending && "opacity-50",
          )}
        />
        {!collapsed && (
          <>
            <span className="flex-1 truncate text-left text-sm">
              {LOCALE_LABELS[locale as keyof typeof LOCALE_LABELS]}
            </span>
            <ChevronDown
              className={cn(
                "size-3.5 shrink-0 text-white/35 transition-transform",
                open && "rotate-180",
                isPending && "text-primary animate-pulse",
              )}
            />
          </>
        )}
      </button>

      {typeof document !== "undefined" && createPortal(dropdown, document.body)}
    </>
  );
}

// ─── NavItem ──────────────────────────────────────────────────────────────────

function NavItem({
  item,
  collapsed,
  t,
  onClose,
}: {
  item: NavItemDef;
  collapsed: boolean;
  t: ReturnType<typeof useTranslations<"Sidebar">>;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const Icon = item.icon;
  const isActive =
    item.href === "/"
      ? pathname === "/"
      : pathname === item.href || pathname.startsWith(item.href + "/");

  if (item.soon) {
    return (
      <div
        className={cn(
          "group/nav relative flex items-center rounded-lg py-1.5",
          "cursor-default select-none",
          "transition-all duration-300",
          collapsed ? "mx-2 justify-center" : "mx-1.5 gap-3 px-2.5",
        )}
      >
        <Icon className="size-3.5 shrink-0 text-white/20" />

        <span
          className={cn(
            "truncate text-[13px] font-light text-white/22 transition-all duration-300",
            collapsed ? "w-0 max-w-0 overflow-hidden opacity-0" : "flex-1",
          )}
        >
          {t(item.labelKey as Parameters<typeof t>[0])}
        </span>

        <span
          className={cn(
            "overflow-hidden rounded-md bg-white/5 text-[10px] leading-none font-medium text-white/22 transition-all duration-300",
            collapsed
              ? "w-0 max-w-0 px-0 py-0 opacity-0"
              : "px-1.5 py-0.5 opacity-100",
          )}
        >
          {t("soon")}
        </span>

        {/* Collapsed tooltip */}
        {collapsed && (
          <div className="pointer-events-none absolute top-1/2 left-full z-50 ml-3 -translate-y-1/2 opacity-0 transition-opacity duration-150 group-hover/nav:opacity-100">
            <div className="rounded-lg border border-white/8 bg-[#0e0e10] px-2.5 py-1.5 text-xs whitespace-nowrap text-white/40 shadow-2xl">
              {t(item.labelKey as Parameters<typeof t>[0])}
              <span className="ml-1.5 text-white/20">· {t("soon")}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="group/nav relative">
      <Link
        href={item.href}
        onClick={onClose}
        className={cn(
          "no-lift relative flex items-center rounded-lg py-1.5 text-[13px] font-light tracking-wide",
          "transition-all duration-300",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-white/50 hover:bg-white/5 hover:text-white",
          collapsed ? "mx-2 justify-center" : "mx-1.5 gap-3 px-2.5",
        )}
      >
        {isActive && !collapsed && (
          <span className="bg-primary absolute top-1/2 left-0 h-4 w-0.5 -translate-y-1/2 rounded-r-full" />
        )}
        <Icon
          className={cn(
            "size-3.5 shrink-0 transition-colors",
            isActive && "text-primary",
          )}
        />
        <span
          className={cn(
            "truncate transition-all duration-300",
            collapsed ? "w-0 overflow-hidden opacity-0" : "flex-1",
          )}
        >
          {t(item.labelKey as Parameters<typeof t>[0])}
        </span>
      </Link>

      {/* Collapsed tooltip */}
      {collapsed && (
        <div className="pointer-events-none absolute top-1/2 left-full z-50 ml-3 -translate-y-1/2 opacity-0 transition-opacity duration-150 group-hover/nav:opacity-100">
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-lg border border-white/8 bg-[#0e0e10] px-2.5 py-1.5 text-xs font-medium whitespace-nowrap shadow-2xl",
              isActive ? "text-primary" : "text-white",
            )}
          >
            {t(item.labelKey as Parameters<typeof t>[0])}
            {isActive && (
              <span className="bg-primary inline-block size-1 rounded-full" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── UserMenuDropdown ──────────────────────────────────────────────────────────

function UserMenuDropdown({
  user,
  avatarSrc,
  collapsed,
  onClose,
}: {
  user: SessionUser;
  avatarSrc: string | null;
  collapsed: boolean;
  onClose?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null,
  );
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("Sidebar");
  const tNavbar = useTranslations("Navbar");
  const pathname = usePathname();

  const updateCoords = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownWidth = 272;
    let left = rect.right + 8;
    let top = rect.top;
    if (left + dropdownWidth > window.innerWidth - 8) {
      left = rect.left - dropdownWidth - 8;
    }
    const maxTop = window.innerHeight - 380;
    if (top > maxTop) top = Math.max(8, maxTop);
    setCoords({ top, left });
  };

  useEffect(() => {
    if (!open) return;
    const handleClose = (e: MouseEvent) => {
      if (
        buttonRef.current?.contains(e.target as Node) ||
        dropdownRef.current?.contains(e.target as Node)
      )
        return;
      setOpen(false);
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("scroll", updateCoords, true);
    window.addEventListener("resize", updateCoords);
    document.addEventListener("mousedown", handleClose);
    document.addEventListener("keydown", escape);
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
      document.removeEventListener("mousedown", handleClose);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  const dropdown = open ? (
    <div
      ref={dropdownRef}
      style={{ top: coords?.top ?? 0, left: coords?.left ?? 0 }}
      className="animate-in fixed z-9999 w-68 origin-left overflow-hidden rounded-2xl border border-white/8 bg-[#0e0a13]/95 shadow-2xl backdrop-blur-xl"
    >
      {/* ── Header ─────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-white/6 p-4">
        <div className="from-primary/8 absolute inset-0 bg-linear-to-br via-transparent to-transparent" />
        <div className="relative flex items-center gap-3">
          <div className="relative shrink-0">
            {avatarSrc ? (
              <Image
                src={avatarSrc}
                alt={user.name ?? "Avatar"}
                width={44}
                height={44}
                className="size-11 rounded-full border-2 border-white/10 object-cover shadow-lg"
              />
            ) : (
              <div className="flex size-11 items-center justify-center rounded-full border-2 border-white/10 bg-white/8 shadow-lg">
                <User className="size-5 text-white/50" />
              </div>
            )}
            <span className="absolute -right-0.5 -bottom-0.5 flex size-4 items-center justify-center rounded-full bg-[#0e0a13]">
              <span className="size-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </span>
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-semibold text-white">
              {user.name ?? user.username ?? "User"}
            </span>
            <span className="truncate text-xs text-white/35">
              @{user.username}
            </span>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-medium text-emerald-400/80">
                {t("online")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick actions ──────────────────────────── */}
      <div className="p-1.5">
        <Link
          href={`/profile/${user.username}`}
          onClick={() => {
            setOpen(false);
            onClose?.();
          }}
          className="no-lift flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] text-white/70 transition-colors hover:bg-white/6 hover:text-white"
        >
          <User className="size-4 shrink-0 text-white/40" />
          <span>{tNavbar("viewProfile")}</span>
        </Link>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            onClose?.();
            setEditProfileOpen(true);
          }}
          className="no-lift flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] text-white/70 transition-colors hover:bg-white/6 hover:text-white"
        >
          <Pencil className="size-4 shrink-0 text-white/40" />
          <span>{tNavbar("editProfile")}</span>
        </button>
      </div>

      <div className="mx-3 h-px bg-white/6" />

      {/* ── Settings (soon) ────────────────────────── */}
      <div className="p-1.5">
        <div className="flex w-full cursor-default items-center gap-3 rounded-xl px-3 py-2 text-[13px] text-white/25 select-none">
          <Settings className="size-4 shrink-0" />
          <span className="flex-1">{tNavbar("editAccount")}</span>
          <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[9px] leading-none font-semibold tracking-wider uppercase">
            {t("soon")}
          </span>
        </div>
        <div className="flex w-full cursor-default items-center gap-3 rounded-xl px-3 py-2 text-[13px] text-white/25 select-none">
          <Bell className="size-4 shrink-0" />
          <span className="flex-1">{t("notifications")}</span>
          <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[9px] leading-none font-semibold tracking-wider uppercase">
            {t("soon")}
          </span>
        </div>
        <div className="flex w-full cursor-default items-center gap-3 rounded-xl px-3 py-2 text-[13px] text-white/25 select-none">
          <Palette className="size-4 shrink-0" />
          <span className="flex-1">{t("appearance")}</span>
          <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[9px] leading-none font-semibold tracking-wider uppercase">
            {t("soon")}
          </span>
        </div>
      </div>

      <div className="mx-3 h-px bg-white/6" />

      {/* ── Sign out ───────────────────────────────── */}
      <div className="p-1.5">
        <button
          onClick={() => signOut()}
          className="no-lift flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] text-red-400/70 transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="size-4 shrink-0" />
          <span>{tNavbar("logout")}</span>
        </button>
      </div>
    </div>
  ) : null;

  return (
    <div className="group/user relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          if (!open) updateCoords();
          setOpen((v) => !v);
        }}
        className={cn(
          "no-lift flex items-center rounded-lg transition-all duration-300 hover:bg-white/5",
          collapsed
            ? "mx-2 w-auto justify-center p-1.5"
            : "mx-1.5 w-[calc(100%-12px)] gap-3 px-2.5 py-2",
        )}
      >
        <div className="relative shrink-0">
          {avatarSrc ? (
            <Image
              src={avatarSrc}
              alt={user.name ?? "Avatar"}
              width={collapsed ? 24 : 32}
              height={collapsed ? 24 : 32}
              className={cn(
                "rounded-full border border-white/10 object-cover",
                collapsed ? "size-6" : "size-8",
              )}
            />
          ) : (
            <div
              className={cn(
                "flex items-center justify-center rounded-full border border-white/10 bg-white/8",
                collapsed ? "size-6" : "size-8",
              )}
            >
              <User
                className={cn(collapsed ? "size-3" : "size-4", "text-white/50")}
              />
            </div>
          )}
          <span
            className={cn(
              "absolute rounded-full bg-emerald-500",
              collapsed
                ? "ring-background -right-px -bottom-px size-2 ring-2"
                : "ring-background -right-0.5 -bottom-0.5 size-2.5 ring-2",
            )}
          />
        </div>

        {!collapsed && (
          <>
            <div className="flex min-w-0 flex-1 flex-col text-left">
              <span className="truncate text-[13px] leading-snug font-medium text-white">
                {user.name ?? user.username ?? "User"}
              </span>
              <span className="truncate text-[10px] leading-snug text-white/30">
                {user.email ?? ""}
              </span>
            </div>
            <ChevronRight
              className={cn(
                "size-3.5 shrink-0 text-white/25 transition-transform",
                open && "rotate-180",
              )}
            />
          </>
        )}
      </button>

      {/* Collapsed tooltip */}
      {collapsed && (
        <div className="pointer-events-none absolute top-1/2 left-full z-50 ml-3 -translate-y-1/2 opacity-0 transition-opacity duration-150 group-hover/user:opacity-100">
          <div className="rounded-lg border border-white/8 bg-[#0e0e10] px-2.5 py-1.5 text-xs whitespace-nowrap text-white shadow-2xl">
            {user.name ?? user.username}
          </div>
        </div>
      )}

      {typeof document !== "undefined" && createPortal(dropdown, document.body)}

      <EditProfileModal
        isOpen={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        user={{
          id: user.id,
          name: user.name,
          username: user.username,
          imageUrl: user.imageUrl ?? user.image,
        }}
      />
    </div>
  );
}

// ─── SidebarBody ──────────────────────────────────────────────────────────────

function SidebarBody({
  collapsed,
  onToggle,
  isMobile = false,
  onClose,
  ready = true,
}: {
  collapsed: boolean;
  onToggle?: () => void;
  isMobile?: boolean;
  onClose?: () => void;
  ready?: boolean;
}) {
  const { data: session, status } = useSession();
  const user = session?.user as SessionUser | undefined;
  const isLoading = status === "loading";

  const t = useTranslations("Sidebar");
  const tNavbar = useTranslations("Navbar");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const effective = isMobile ? false : collapsed;

  const sections = useMemo<SectionDef[]>(
    () => [
      {
        titleKey: "discover",
        items: [
          { href: "/games", labelKey: "games", icon: Gamepad2 },
          { href: "/events", labelKey: "events", icon: Trophy },
          {
            href: "/leaderboards",
            labelKey: "leaderboards",
            icon: BarChart3,
            soon: true,
          },
        ],
      },
      ...(user
        ? [
            {
              titleKey: "mySpace",
              items: [
                {
                  href: "/dashboard",
                  labelKey: "dashboard",
                  icon: LayoutDashboard,
                },

                {
                  href: "/teams",
                  labelKey: "myTeams",
                  icon: Users,
                  soon: true,
                },
                {
                  href: "/history",
                  labelKey: "matchHistory",
                  icon: History,
                  soon: true,
                },
              ],
            },
            {
              titleKey: "compete",
              items: [
                { href: "/leagues", labelKey: "activeLeagues", icon: Medal },
                {
                  href: "/tournaments",
                  labelKey: "tournaments",
                  icon: Swords,
                  soon: true,
                },
              ],
            },
            ...(user.isAdmin
              ? [
                  {
                    titleKey: "admin",
                    items: [
                      {
                        href: "/admin",
                        labelKey: "admin",
                        icon: Shield,
                        soon: true,
                      },
                    ],
                  },
                ]
              : []),
          ]
        : []),
    ],
    [user],
  );

  const switchLocale = (newLocale: (typeof routing.locales)[number]) => {
    if (newLocale === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: newLocale, scroll: false });
    });
  };

  const avatarSrc = user?.imageUrl ?? user?.image ?? null;

  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden border-r border-white/6",
        "bg-background backdrop-blur-xl",
        ready &&
          "transition-[width] duration-300 ease-in-out will-change-[width]",
        effective ? "w-12" : "w-60",
      )}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div
        className={cn(
          "flex h-14 shrink-0 items-center transition-all duration-300",
          effective ? "justify-center px-2" : "justify-between px-3",
        )}
      >
        <Link
          href="/"
          onClick={onClose}
          className={cn(
            "no-lift flex min-w-0 items-center gap-1 overflow-hidden transition-all duration-300",
            effective ? "w-0 opacity-0" : "w-auto opacity-100",
          )}
        >
          <div
            className="bg-primary shrink-0"
            style={{
              width: 14,
              height: 14,
              maskImage: "url(/icon.svg)",
              WebkitMaskImage: "url(/icon.svg)",
              maskSize: "contain",
              WebkitMaskSize: "contain",
              maskRepeat: "no-repeat",
              WebkitMaskRepeat: "no-repeat",
              maskPosition: "center",
              WebkitMaskPosition: "center",
            }}
            role="img"
            aria-label="Ares"
          />
          <span className="text-primary w-8 text-base font-bold -tracking-widest whitespace-nowrap">
            Ares
          </span>
        </Link>

        {isMobile ? (
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="no-lift flex size-8 shrink-0 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/6 hover:text-white"
          >
            <X className="size-4" />
          </button>
        ) : (
          <button
            onClick={onToggle}
            aria-label={effective ? t("expand") : t("collapse")}
            title={effective ? t("expand") : t("collapse")}
            className="no-lift flex size-8 shrink-0 items-center justify-center rounded-lg text-white/35 transition-colors hover:bg-white/6 hover:text-white"
          >
            {effective ? <Menu className="size-4" /> : <X className="size-4" />}
          </button>
        )}
      </div>

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav className="custom-scrollbar flex-1 overflow-x-hidden overflow-y-auto py-2">
        {/* User menu / Login / Loading skeleton */}
        {isLoading ? (
          <>
            <div
              className={cn(
                "flex items-center",
                effective
                  ? "mx-2 justify-center p-1.5"
                  : "mx-1.5 gap-3 px-2.5 py-2",
              )}
            >
              <div
                className={cn(
                  "shrink-0 animate-pulse rounded-full bg-white/8",
                  effective ? "size-6" : "size-8",
                )}
              />
              {!effective && (
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="h-3 w-24 animate-pulse rounded bg-white/8" />
                  <div className="h-2 w-16 animate-pulse rounded bg-white/5" />
                </div>
              )}
            </div>
            <div className="mx-3 my-2 h-px bg-white/4" />
          </>
        ) : user ? (
          <>
            <UserMenuDropdown
              user={user}
              avatarSrc={avatarSrc}
              collapsed={effective}
              onClose={onClose}
            />
            <div className="mx-3 my-2 h-px bg-white/4" />
          </>
        ) : null}

        {/* Home */}
        <div className="space-y-0.5">
          <NavItem
            item={{ href: "/", labelKey: "home", icon: Home }}
            collapsed={effective}
            t={t}
            onClose={onClose}
          />
        </div>

        <div className="mx-3 my-2 h-px bg-white/4" />
        {sections.map((section, i) => (
          <div key={section.titleKey} className={cn(i > 0 && "mt-2")}>
            {/* Category label */}
            <div
              className={cn(
                "overflow-hidden transition-all duration-300",
                effective
                  ? "mb-0 h-0 py-0 opacity-0"
                  : "h-6.5 px-4 pt-1 pb-1.5 opacity-100",
              )}
            >
              <span className="text-[10px] font-normal tracking-[0.18em] text-white/25 uppercase">
                {t(section.titleKey as Parameters<typeof t>[0])}
              </span>
            </div>

            {/* Items */}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  collapsed={effective}
                  t={t}
                  onClose={onClose}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <div className="shrink-0">
        {/* ── Divider ─────────────────────────────────────────────────────── */}
        <div className="mx-3 h-px shrink-0 bg-white/4" />

        <div
          className={cn(
            effective
              ? "flex flex-col gap-0.5 py-2"
              : "flex flex-col gap-2.5 p-3",
          )}
        >
          {/* Login button — only shown when logged out and expanded */}
          {isLoading && !effective ? (
            <div className="h-12 w-full animate-pulse rounded-full bg-white/8" />
          ) : !user && !effective ? (
            <>
              <button
                onClick={() => setAuthModalOpen(true)}
                title={tNavbar("login")}
                className={cn(
                  "no-lift flex items-center justify-center text-sm font-medium",
                  "bg-primary/90 hover:bg-primary text-white transition-colors",
                  effective
                    ? "mx-2 w-auto rounded-lg py-1.5"
                    : "h-12 w-full gap-3 rounded-full px-5",
                )}
              >
                <LogIn className="size-4 shrink-0" />
                {!effective && <span>{tNavbar("login")}</span>}
              </button>
              <AuthModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                isPending={false}
              />

              {/* ── Divider ─────────────────────────────────────────────────────── */}
              <div className="mx-3 h-px shrink-0 bg-white/4" />
            </>
          ) : null}

          {/* Locale switcher — dropdown opens to the right */}
          <LocaleDropdown
            locale={locale}
            isPending={isPending}
            collapsed={effective}
            onSwitch={switchLocale}
          />
        </div>
      </div>
    </div>
  );
}

// ─── SiteSidebar ──────────────────────────────────────────────────────────────

export function SiteSidebar() {
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const t = useTranslations("Sidebar");
  const pathname = usePathname();

  // Hydrate collapsed from localStorage (default: true/closed)
  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored !== null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCollapsed(stored === "true");
    }
    // Enable transitions only after restoring the correct value
    requestAnimationFrame(() => setReady(true));
  }, []);

  // Close mobile sidebar on navigation
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
  }, [pathname]);

  // Close on Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [mobileOpen]);

  // Lock body scroll when mobile open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  };

  if (pathname === "/") return null;

  return (
    <>
      {/* ── Mobile top bar ──────────────────────────────────────────────── */}
      <div className="fixed top-0 right-0 left-0 z-30 flex h-12 shrink-0 items-center gap-3 border-b border-white/6 bg-[#0b0b0e]/90 px-4 backdrop-blur-xl lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          aria-label={t("openMenu")}
          className="no-lift flex size-8 items-center justify-center rounded-lg text-white/55 transition-colors hover:bg-white/8 hover:text-white"
        >
          <Menu className="size-5" />
        </button>

        <Link href="/" className="flex items-center gap-2">
          <div
            className="bg-primary shrink-0"
            style={{
              width: 16,
              height: 16,
              maskImage: "url(/icon.svg)",
              WebkitMaskImage: "url(/icon.svg)",
              maskSize: "contain",
              WebkitMaskSize: "contain",
              maskRepeat: "no-repeat",
              WebkitMaskRepeat: "no-repeat",
              maskPosition: "center",
              WebkitMaskPosition: "center",
            }}
          />
          <span className="text-primary text-sm font-bold -tracking-widest">
            Ares
          </span>
        </Link>
      </div>

      {/* ── Mobile backdrop ─────────────────────────────────────────────── */}
      <div
        className={cn(
          "fixed inset-0 z-35 bg-black/60 backdrop-blur-sm lg:hidden",
          "transition-opacity duration-300",
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
        aria-hidden="true"
        onClick={() => setMobileOpen(false)}
      />

      {/* ── Mobile sidebar overlay ──────────────────────────────────────── */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 h-full lg:hidden",
          "transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarBody
          collapsed={false}
          isMobile
          onClose={() => setMobileOpen(false)}
        />
      </div>

      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <div className="sticky top-0 hidden h-screen shrink-0 lg:flex">
        <SidebarBody
          collapsed={collapsed}
          onToggle={toggleCollapsed}
          ready={ready}
        />
      </div>
    </>
  );
}
