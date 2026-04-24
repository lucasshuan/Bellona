"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import {
  LayoutDashboard,
  Gamepad2,
  Trophy,
  BarChart3,
  User,
  Users,
  History,
  ChevronRight,
  Menu,
  X,
  LogOut,
  LogIn,
  Shield,
  Settings,
  Bell,
  Pencil,
  Palette,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
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
        <Icon className="text-secondary/20 size-3.5 shrink-0" />

        <span
          className={cn(
            "text-secondary/20 truncate text-[13px] font-light transition-all duration-300",
            collapsed ? "w-0 max-w-0 overflow-hidden opacity-0" : "flex-1",
          )}
        >
          {t(item.labelKey as Parameters<typeof t>[0])}
        </span>

        <span
          className={cn(
            "bg-secondary/5 text-secondary/20 overflow-hidden rounded-md text-[10px] leading-none font-medium transition-all duration-300",
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
            <div className="border-gold-dim/40 bg-background-soft text-secondary/35 rounded-lg border px-2.5 py-1.5 text-xs whitespace-nowrap shadow-2xl">
              {t(item.labelKey as Parameters<typeof t>[0])}
              <span className="text-secondary/20 ml-1.5">· {t("soon")}</span>
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
          "relative flex items-center rounded-lg py-1.5 text-[13px] tracking-wide",
          "transition-[background-color,color,opacity] duration-400 ease-in-out",
          isActive
            ? "bg-primary/50 font-medium text-white"
            : "text-secondary/45 hover:bg-primary/10 hover:text-secondary/90 font-light",
          collapsed ? "mx-2 justify-center" : "mx-1.5 gap-3 px-2.5",
        )}
      >
        <span
          className={cn(
            "bg-primary-strong absolute top-1/2 left-0 h-4 w-0.5 -translate-y-1/2 rounded-r-full transition-[opacity,transform] duration-400 ease-in-out",
            isActive && !collapsed
              ? "scale-y-100 opacity-100"
              : "scale-y-0 opacity-0",
          )}
        />
        <Icon
          className={cn(
            "size-3.5 shrink-0 transition-colors",
            isActive && "text-white",
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
              "border-gold-dim/40 bg-background-soft flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium whitespace-nowrap shadow-2xl",
              isActive ? "text-primary" : "text-secondary/90",
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
  const tUser = useTranslations("Sidebar.userMenu");
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
      className="animate-in border-gold-dim bg-card-strong/95 fixed z-9999 w-68 origin-left overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl"
    >
      {/* ── Header ─────────────────────────────────── */}
      <div className="border-border relative overflow-hidden border-b p-4">
        <div className="from-primary/8 absolute inset-0 bg-linear-to-br via-transparent to-transparent" />
        <div className="relative flex items-center gap-3">
          <div className="relative shrink-0">
            {avatarSrc ? (
              <Image
                src={avatarSrc}
                alt={user.name ?? "Avatar"}
                width={44}
                height={44}
                className="border-border size-11 rounded-full border-2 object-cover shadow-lg"
              />
            ) : (
              <div className="border-border bg-background/60 flex size-11 items-center justify-center rounded-full border-2 shadow-lg">
                <User className="text-muted size-5" />
              </div>
            )}
            <span className="bg-card-strong absolute -right-0.5 -bottom-0.5 flex size-4 items-center justify-center rounded-full">
              <span className="size-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </span>
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-foreground truncate text-sm font-semibold">
              {user.name ?? user.username ?? "User"}
            </span>
            <span className="text-muted truncate text-xs">
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
          className="text-muted hover:text-foreground flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] transition-colors hover:bg-[color-mix(in_srgb,var(--gold)_10%,transparent)]"
        >
          <User className="text-gold/75 size-4 shrink-0" />
          <span>{tUser("viewProfile")}</span>
        </Link>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            onClose?.();
            setEditProfileOpen(true);
          }}
          className="text-muted hover:text-foreground flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] transition-colors hover:bg-[color-mix(in_srgb,var(--gold)_10%,transparent)]"
        >
          <Pencil className="text-gold/75 size-4 shrink-0" />
          <span>{tUser("editProfile")}</span>
        </button>
      </div>

      <div className="bg-border mx-3 h-px" />

      {/* ── Settings (soon) ────────────────────────── */}
      <div className="p-1.5">
        <div className="text-muted/45 flex w-full cursor-default items-center gap-3 rounded-xl px-3 py-2 text-[13px] select-none">
          <Settings className="text-gold/45 size-4 shrink-0" />
          <span className="flex-1">{tUser("editAccount")}</span>
          <span className="bg-secondary/5 text-secondary/20 rounded-md px-1.5 py-0.5 text-[10px] leading-none font-medium">
            {t("soon")}
          </span>
        </div>
        <div className="text-muted/45 flex w-full cursor-default items-center gap-3 rounded-xl px-3 py-2 text-[13px] select-none">
          <Bell className="text-gold/45 size-4 shrink-0" />
          <span className="flex-1">{t("notifications")}</span>
          <span className="bg-secondary/5 text-secondary/20 rounded-md px-1.5 py-0.5 text-[10px] leading-none font-medium">
            {t("soon")}
          </span>
        </div>
        <div className="text-muted/45 flex w-full cursor-default items-center gap-3 rounded-xl px-3 py-2 text-[13px] select-none">
          <Palette className="text-gold/45 size-4 shrink-0" />
          <span className="flex-1">{t("appearance")}</span>
          <span className="bg-secondary/5 text-secondary/20 rounded-md px-1.5 py-0.5 text-[10px] leading-none font-medium">
            {t("soon")}
          </span>
        </div>
      </div>

      <div className="bg-border mx-3 h-px" />

      {/* ── Sign out ───────────────────────────────── */}
      <div className="p-1.5">
        <button
          onClick={() => signOut()}
          className="text-danger/80 hover:bg-danger/10 hover:text-danger flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] transition-colors"
        >
          <LogOut className="size-4 shrink-0" />
          <span>{tUser("logout")}</span>
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
          "hover:bg-primary/10 flex items-center rounded-lg transition-all duration-300",
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
                "border-gold-dim/40 rounded-full border object-cover",
                collapsed ? "size-6" : "size-8",
              )}
            />
          ) : (
            <div
              className={cn(
                "border-gold-dim/40 bg-secondary/8 flex items-center justify-center rounded-full border",
                collapsed ? "size-6" : "size-8",
              )}
            >
              <User
                className={cn(
                  collapsed ? "size-3" : "size-4",
                  "text-secondary/40",
                )}
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
              <span className="text-secondary/90 truncate text-[13px] leading-snug font-medium">
                {user.name ?? user.username ?? "User"}
              </span>
              <span className="text-secondary/30 truncate text-[10px] leading-snug">
                {user.email ?? ""}
              </span>
            </div>
            <ChevronRight
              className={cn(
                "text-secondary/25 size-3.5 shrink-0 transition-transform",
                open && "rotate-180",
              )}
            />
          </>
        )}
      </button>

      {/* Collapsed tooltip */}
      {collapsed && (
        <div className="pointer-events-none absolute top-1/2 left-full z-50 ml-3 -translate-y-1/2 opacity-0 transition-opacity duration-150 group-hover/user:opacity-100">
          <div className="border-border bg-card-strong text-foreground rounded-lg border px-2.5 py-1.5 text-xs whitespace-nowrap shadow-2xl">
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
  const tUser = useTranslations("Sidebar.userMenu");
  const pathname = usePathname();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const effective = isMobile ? false : collapsed;

  const sections = useMemo<SectionDef[]>(
    () => [
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
    ],
    [user],
  );

  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >({});

  const toggleSection = (key: string) => {
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const avatarSrc = user?.imageUrl ?? user?.image ?? null;

  return (
    <div
      className={cn(
        "border-gold-dim flex h-full flex-col overflow-hidden border-r",
        "bg-card backdrop-blur-xl",
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
            "flex min-w-0 items-center gap-1.5 overflow-hidden transition-all duration-300",
            effective ? "w-0 opacity-0" : "w-auto opacity-100",
          )}
        >
          <Image
            src="/logo.png"
            alt="Bellona"
            width={26}
            height={26}
            className="h-6.5 w-6.5 shrink-0 object-contain"
          />
          <div className="flex min-w-0 items-center leading-none">
            <span className="text-secondary font-display text-[11px] font-bold tracking-[0.22em] whitespace-nowrap uppercase">
              Bellona
            </span>
          </div>
        </Link>

        {isMobile ? (
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="text-secondary/40 hover:bg-primary/10 hover:text-secondary/90 flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors"
          >
            <X className="size-4" />
          </button>
        ) : (
          <button
            onClick={onToggle}
            aria-label={effective ? t("expand") : t("collapse")}
            title={effective ? t("expand") : t("collapse")}
            className="text-secondary/35 hover:bg-primary/10 hover:text-secondary/90 flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors"
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
                  "bg-secondary/8 shrink-0 animate-pulse rounded-full",
                  effective ? "size-6" : "size-8",
                )}
              />
              {!effective && (
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="bg-secondary/8 h-3 w-24 animate-pulse rounded" />
                  <div className="bg-secondary/5 h-2 w-16 animate-pulse rounded" />
                </div>
              )}
            </div>
            <div className="bg-gold-dim/25 mx-3 my-2 h-px" />
          </>
        ) : user ? (
          <>
            <UserMenuDropdown
              user={user}
              avatarSrc={avatarSrc}
              collapsed={effective}
              onClose={onClose}
            />
            <div className="bg-gold-dim/25 mx-3 my-2 h-px" />
          </>
        ) : !effective ? (
          <>
            <div className="px-3 pb-2">
              <button
                onClick={() => setAuthModalOpen(true)}
                title={tUser("login")}
                className={cn(
                  buttonVariants({ intent: "primary" }),
                  "w-full gap-3 rounded-2xl px-5 text-sm",
                )}
              >
                <LogIn className="size-4 shrink-0" />
                <span>{tUser("login")}</span>
              </button>
            </div>
            <div className="bg-gold-dim/25 mx-3 my-2 h-px" />
            <AuthModal
              isOpen={authModalOpen}
              onClose={() => setAuthModalOpen(false)}
              isPending={false}
            />
          </>
        ) : null}

        {sections.map((section, i) => {
          const isSectionCollapsed =
            !effective && !!collapsedSections[section.titleKey];
          return (
            <div key={section.titleKey} className={cn(i > 0 && "mt-2")}>
              {/* Category label — clickable when sidebar is expanded */}
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  effective ? "mb-0 h-0 py-0 opacity-0" : "h-6.5 opacity-100",
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleSection(section.titleKey)}
                  className="flex w-full items-center gap-1 px-4 pt-1 pb-1.5"
                >
                  <span className="text-gold/35 flex-1 text-left text-[10px] font-normal tracking-[0.18em] uppercase">
                    {t(section.titleKey as Parameters<typeof t>[0])}
                  </span>
                  <ChevronRight
                    className={cn(
                      "text-gold/25 size-2.5 shrink-0 transition-transform duration-200",
                      isSectionCollapsed ? "rotate-0" : "rotate-90",
                    )}
                  />
                </button>
              </div>

              {/* Items */}
              <div
                className={cn(
                  "space-y-0.5 overflow-hidden transition-all duration-200",
                  isSectionCollapsed ? "max-h-0" : "max-h-96",
                )}
              >
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
          );
        })}
      </nav>


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
      <div className="border-gold-dim bg-background/90 fixed top-0 right-0 left-0 z-30 flex h-12 shrink-0 items-center gap-3 border-b px-4 backdrop-blur-xl lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          aria-label={t("openMenu")}
          className="text-secondary/55 hover:bg-primary/10 hover:text-secondary/90 flex size-8 items-center justify-center rounded-lg transition-colors"
        >
          <Menu className="size-5" />
        </button>

        <Link href="/" className="flex items-center gap-1.5">
          <Image
            src="/logo.png"
            alt="Bellona"
            width={18}
            height={18}
            className="h-4.5 w-4.5 shrink-0 object-contain"
          />
          <span className="text-secondary font-display text-[11px] font-bold tracking-[0.22em] uppercase">
            Bellona
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
