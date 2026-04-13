import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface UserChipProps {
  user: {
    id: string;
    name?: string | null;
    image?: string | null;
    username?: string | null;
  };
  className?: string;
}

export function UserChip({ user, className }: UserChipProps) {
  const displayName = user.name ?? user.username ?? "Unknown Player";
  const profileHref = user.username ? `/profile/${user.username}` : `/profile/${user.id}`;

  return (
    <Link
      href={profileHref}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/5 p-1 pr-3 transition-all hover:bg-white/10 hover:border-white/10 hover:translate-y-0 group",
        className
      )}
    >
      <div className="relative size-6 overflow-hidden rounded-full bg-white/10">
        {user.image ? (
          <Image
            src={user.image}
            alt={displayName}
            fill
            className="object-cover transition-transform group-hover:scale-110"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-[10px] font-bold text-white/40">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>
      <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
        {displayName}
      </span>
    </Link>
  );
}
