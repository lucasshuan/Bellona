import type { DefaultSession } from "next-auth";
import type { PermissionKey } from "@/server/db/schema";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      username: string | null;
      permissions: Array<{
        id: string;
        gameId: string;
        key: PermissionKey;
        name: string;
      }>;
    };
  }

  interface User {
    username: string | null;
  }
}
