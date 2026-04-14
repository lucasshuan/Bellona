import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      isAdmin: boolean;
      permissions: string[];
      accessToken?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    username: string;
    isAdmin: boolean;
    permissions?: string[];
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    isAdmin: boolean;
    permissions?: string[];
    accessToken?: string;
  }
}
