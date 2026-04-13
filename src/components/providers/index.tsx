"use client";

import { createContext, useContext, ReactNode } from "react";
import { type Session } from "next-auth";
import { SessionProvider as NextAuthSessionProvider, useSession } from "next-auth/react";
import { Toaster } from "sonner";

type UserContextType = {
  user: Session["user"] | null;
  isLoading: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  return (
    <UserContext.Provider
      value={{
        user: session?.user ?? null,
        isLoading: status === "loading",
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
