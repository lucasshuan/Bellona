import "server-only";

import { cache } from "react";

import { getServerSession } from "next-auth";

import { authOptions } from "@/server/auth/config";

export const getServerAuthSession = cache(async () => {
  return await getServerSession(authOptions);
});
