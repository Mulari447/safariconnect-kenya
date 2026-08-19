// src/hooks/useAuth.tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, getToken, setToken } from "@/lib/api";

type Profile = {
  fullName: string | null;
  nationality: string | null;
  country: string | null;
  phone: string | null;
  preferredLanguage: string;
} | null;

type User = {
  id: string;
  email: string;
  roles: string[];
  profile?: Profile;
};

type AuthState = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  verifyEmail: (token: string) => Promise<any>; // Updated return type
};

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  refresh: async () => {},
  verifyEmail: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMe = async () => {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await api.get<User>("/api/auth/me");
      setUser(me);
    } catch {
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const res = await api.post<{ token: string; user: User }>("/api/auth/login", {
      email,
      password,
    });
    setToken(res.token);
    setUser(res.user);
    await loadMe();
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    await api.post<{ message: string; email: string }>("/api/auth/register", {
      email,
      password,
      fullName,
    });
  };

  const verifyEmail = async (token: string) => {
    const res = await api.post<{ token: string; user: User }>("/api/auth/verify-email", { token });
    setToken(res.token);
    setUser(res.user);
    await loadMe();
    return res; // CRITICAL: Returns the full verification response object with roles
  };

  const signOut = async () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, refresh: loadMe, verifyEmail }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}