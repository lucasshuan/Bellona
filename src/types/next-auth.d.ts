import type { DefaultSession } from "next-auth";
import type { PermissionKey } from "@/server/db/schema";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      username: string;
      name: string;
      bio: string | null;
      permissions: Array<{
        id: string;
        key: PermissionKey;
        name: string;
      }>;
    };
  }

  interface User {
    username: string;
  }
}
