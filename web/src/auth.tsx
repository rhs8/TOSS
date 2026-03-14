import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "./api";

interface User {
  id: string;
  email: string;
  display_name: string | null;
  commitment_ends_at: string | null;
  card_on_file: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  setToken: (t: string | null) => void;
  refreshUser: (tokenOverride?: string | null) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem("toss_token"));
  const [loading, setLoading] = useState(true);

  const setToken = (t: string | null) => {
    if (t) localStorage.setItem("toss_token", t);
    else localStorage.removeItem("toss_token");
    setTokenState(t);
  };

  const refreshUser = async (tokenOverride?: string | null): Promise<boolean> => {
    const t = tokenOverride !== undefined ? tokenOverride : token;
    if (!t) {
      setUser(null);
      setLoading(false);
      return false;
    }
    try {
      const data = await api.getMe(t);
      setUser(data.user);
      setLoading(false);
      return true;
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      setUser(null);
      if (status === 401) setToken(null);
      setLoading(false);
      return false;
    }
  };

  useEffect(() => {
    refreshUser();
    // If API never responds (wrong URL or backend down), stop loading so the app can render
    const t = setTimeout(() => setLoading(false), 5000);
    return () => clearTimeout(t);
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, loading, setToken, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
