import Image from "next/image";
import { Link } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { User as UserIcon, Medal, Gamepad2, Calendar } from "lucide-react";
import { GET_USER } from "@/lib/apollo/queries/user";
import { GetUserQuery } from "@/lib/apollo/generated/graphql";
import { getServerAuthSession } from "@/auth";
import { getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button";
import { ProfileManageActions } from "@/components/triggers/profile/profile-manage-actions";
import { ProfileTabs } from "@/components/ui/tabs";
import { Metadata } from "next";
import { safeServerQuery } from "@/lib/apollo/safe-server-query";

type ProfilePageProps = {
  params: Promise<{
    username: string;
    locale: string;
  }>;
};

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const t = await getTranslations("ProfilePage");
  const { username } = await params;

  const data = await safeServerQuery<GetUserQuery>({
    query: GET_USER,
    variables: { username },
  });

  const targetUser = data?.user;

  if (!targetUser) return { title: "User not found" };

  return {
    title: `${targetUser.name ?? targetUser.username} | ${t("headerTitle")}`,
  };
}

export default async function UserProfilePage({ params }: ProfilePageProps) {
  const session = await getServerAuthSession();
  const t = await getTranslations("ProfilePage");
  const { username, locale } = await params;

  const data = await safeServerQuery<GetUserQuery>({
    query: GET_USER,
    variables: { username },
  });

  const targetUser = data?.user;

  if (!targetUser) {
    notFound();
  }

  const isOwnProfile = session?.user?.id === targetUser.id;
  const calculatedPositions: never[] = [];
  const finalProfileColor = targetUser.profileColor || "#c00b3b";

  return (
    <main
      className="relative min-h-screen overflow-hidden"
      style={
        {
          "--primary": finalProfileColor,
          "--primary-strong": `color-mix(in srgb, ${finalProfileColor}, black 35%)`,
          "--primary-light": `color-mix(in srgb, ${finalProfileColor}, white 10%)`,
          "--color-primary": finalProfileColor,
          "--color-primary-strong": `color-mix(in srgb, ${finalProfileColor}, black 35%)`,
          "--border": `color-mix(in srgb, ${finalProfileColor} 18%, transparent)`,
          "--color-border": `color-mix(in srgb, ${finalProfileColor} 18%, transparent)`,
        } as React.CSSProperties
      }
    >
      {/* Background Glows & Floating Blobs */}
      {/* Background Glows & Floating Blobs Removed */}

      {/* Profile Header Background */}
      <div
        className="pointer-events-none absolute top-0 right-0 left-0 z-0 h-40 overflow-hidden"
        style={{ backgroundColor: "var(--primary-strong)" }}
      ></div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col-reverse gap-8 px-6 pt-16 pb-12 sm:px-10 lg:flex-row lg:gap-8 lg:px-12">
        {/* Sidebar */}
        <aside className="w-full shrink-0 lg:w-[320px] xl:w-90">
          <div className="sticky top-28 flex flex-col gap-4">
            <div>
              <div
                className={`glass-panel overflow-hidden rounded-4xl ${isOwnProfile ? "rounded-br-none" : ""}`}
              >
                {/* Subtle decorations removed */}

                <div className="relative z-10 flex flex-col items-center p-8 text-center">
                  {targetUser.imageUrl ? (
                    <Image
                      src={targetUser.imageUrl}
                      alt={targetUser.name ?? targetUser.username ?? "Avatar"}
                      width={140}
                      height={140}
                      className="size-32 rounded-full object-cover shadow-xl"
                    />
                  ) : (
                    <div className="flex size-32 items-center justify-center rounded-full bg-white/5 shadow-xl">
                      <UserIcon className="size-14 text-white/50" />
                    </div>
                  )}

                  <h1 className="mt-6 text-2xl font-bold tracking-tight">
                    {targetUser.name ??
                      targetUser.username ??
                      t("fallbackUser")}
                  </h1>

                  {targetUser.bio ? (
                    <p className="mt-6 max-w-70 text-sm leading-relaxed text-white/60">
                      {targetUser.bio}
                    </p>
                  ) : isOwnProfile ? (
                    <p className="mt-6 text-xs text-white/30 italic">
                      {t("noBio")}
                    </p>
                  ) : null}

                  <div className="mt-6 flex items-center gap-2 text-xs font-medium text-white/40">
                    <Calendar className="size-3.5" />
                    <span>
                      {t("joined")}{" "}
                      {new Intl.DateTimeFormat(locale, {
                        month: "long",
                        year: "numeric",
                      }).format(new Date(targetUser.createdAt))}
                    </span>
                  </div>
                </div>
              </div>
              {isOwnProfile && (
                <div className="-mt-px flex w-full justify-end">
                  <ProfileManageActions user={targetUser} />
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="mt-16 min-w-0 flex-1 space-y-6 lg:mt-24">
          <div className="space-y-4">
            <ProfileTabs
              tabs={[
                {
                  id: "games",
                  label: t("playedGamesTab"),
                  icon: Gamepad2,
                  active: true,
                },
              ]}
            />

            <section className="flex flex-col gap-6">
              {calculatedPositions.length === 0 ? (
                <div className="glass-panel mt-6 flex flex-col items-center justify-center gap-4 rounded-4xl p-12 text-center">
                  <Medal className="size-12 text-white" />
                  <div>
                    <h3 className="text-xl font-medium">
                      {isOwnProfile ? t("noGames") : t("noGamesOther")}
                    </h3>
                    <p className="text-muted mt-2 max-w-md text-sm">
                      {isOwnProfile
                        ? t("noGamesDescription")
                        : t("noGamesDescriptionOther")}
                    </p>
                  </div>
                  {isOwnProfile && (
                    <Link
                      href="/games"
                      className={buttonVariants({
                        intent: "primary",
                        className: "mt-4",
                      })}
                    >
                      {t("viewGames")}
                    </Link>
                  )}
                </div>
              ) : null}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
