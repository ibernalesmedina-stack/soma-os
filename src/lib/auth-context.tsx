import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { SubmoduloCosmetologa, User } from "./types";
import { currentUser, signIn as doSignIn, signOut as doSignOut, signUp as doSignUp, updateUser as doUpdate } from "./storage";

interface Ctx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => string | null;
  register: (data: { email: string; password: string; name: string; businessName: string; phone: string; plan: User["plan"]; tipoNegocio: User["tipoNegocio"]; submodulos?: SubmoduloCosmetologa[] }) => string | null;
  logout: () => void;
  update: (patch: Partial<User>) => void;
}

const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(currentUser());
    setLoading(false);
  }, []);

  const login = (email: string, password: string) => {
    const u = doSignIn(email, password);
    if (!u) return "Credenciales inválidas";
    setUser(u);
    return null;
  };
  const register: Ctx["register"] = (data) => {
    const res = doSignUp(data);
    if ("error" in res) return res.error;
    setUser(res.user);
    return null;
  };
  const logout = () => { doSignOut(); setUser(null); };
  const update = (patch: Partial<User>) => { doUpdate(patch); setUser(currentUser()); };

  return <AuthCtx.Provider value={{ user, loading, login, register, logout, update }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth outside provider");
  return ctx;
};
