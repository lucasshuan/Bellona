import NextAuth from "next-auth";

import { authOptions } from "@/server/auth/config";

export const runtime = "nodejs";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
