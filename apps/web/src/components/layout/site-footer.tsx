import { useTranslations } from "next-intl";
import { FaGithub } from "react-icons/fa";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteFooter() {
  const t = useTranslations("SiteFooter");
  return (
    <footer className="bg-background-soft border-t border-white/6">
      <div className="text-muted mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-6 text-xs sm:px-10 lg:px-12">
        <span>{t("copyright")}</span>
        <a
          href="https://github.com/lucasshuan"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub de lucasshuan"
          className={cn(
            buttonVariants({ intent: "ghost", size: "sm" }),
            "size-10 shrink-0 px-0",
          )}
        >
          <FaGithub className="size-4" />
        </a>
      </div>
    </footer>
  );
}
