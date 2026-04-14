import type { DefaultSession } from "next-auth";
type PermissionKey = string;

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      username: string;
      name: string;
      bio: string | null;
      profileColor: string | null;
      isAdmin: boolean;
      permissions: Array<{
        id: string;
        key: PermissionKey;
        name: string;
      }>;
    };
  }

  interface User {
    username: string;
    isAdmin: boolean;
  }
}
