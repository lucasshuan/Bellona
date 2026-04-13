"use client";

import { createContext, useContext, ReactNode } from "react";
import { type Session } from "next-auth";
import {
  SessionProvider as NextAuthSessionProvider,
  useSession,
} from "next-auth/react";
import { Toaster } from "sonner";

import {
  canManageGames,
  canManagePlayers,
  canManageRankings,
  canEditGame as libCanEditGame,
} from "@/lib/permissions";

type UserContextType = {
  user: Session["user"] | null;
  isLoading: boolean;
  isAdmin: boolean;
  canManageGames: boolean;
  canManagePlayers: boolean;
  canManageRankings: boolean;
  canEditGame: (authorId: string | null | undefined) => boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  const user = session?.user ?? null;
  const isLoading = status === "loading";

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        isAdmin: !!user?.isAdmin,
        canManageGames: canManageGames(session),
        canManagePlayers: canManagePlayers(session),
        canManageRankings: canManageRankings(session),
        canEditGame: (authorId) => libCanEditGame(session, authorId),
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <UserProvider>
        {children}
        <Toaster theme="dark" position="top-center" richColors closeButton />
      </UserProvider>
    </NextAuthSessionProvider>
  );
}
