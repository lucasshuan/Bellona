import "server-only";

import { cache } from "react";

import { getServerSession } from "next-auth";

import { authOptions } from "@/server/auth/config";
import { isDatabaseConnectionError } from "@/server/db/errors";

export const getServerAuthSession = cache(async () => {
  try {
    return await getServerSession(authOptions);
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return null;
    }

    throw error;
  }
});
