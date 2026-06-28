"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react";
import { demoAccounts } from "@/data/users";
import { DEMO_SESSION_STORAGE_KEY, sanitizeDemoUser } from "@/lib/demo-auth";
import type { AuthUser } from "@/types/auth";

interface LoginInput {
  email: string;
  password: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (input: LoginInput) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AppSessionProvider({
  children
}: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = window.localStorage.getItem(DEMO_SESSION_STORAGE_KEY);

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser) as AuthUser);
      } catch {
        window.localStorage.removeItem(DEMO_SESSION_STORAGE_KEY);
      }
    }

    setIsLoading(false);
  }, []);

  async function login({ email, password }: LoginInput) {
    const account = demoAccounts.find(
      (item) => item.email === email.trim().toLowerCase() && item.password === password
    );

    if (!account) {
      setError("Invalid demo credentials. Try one of the accounts listed below.");
      return false;
    }

    const safeUser = sanitizeDemoUser(account);
    window.localStorage.setItem(DEMO_SESSION_STORAGE_KEY, JSON.stringify(safeUser));
    setUser(safeUser);
    setError(null);
    return true;
  }

  function logout() {
    window.localStorage.removeItem(DEMO_SESSION_STORAGE_KEY);
    setUser(null);
  }

  function clearError() {
    setError(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        error,
        login,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuthContext must be used within AppSessionProvider.");
  }

  return value;
}
