import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { SubmoduloCosmetologa, User } from "./types";
import { supabase } from "./supabase";
import { seedForUser, toUser, updateUserById } from "./storage";

interface Ctx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (data: {
    email: string; password: string; name: string;
    businessName: string; phone: string; plan: User["plan"];
    tipoNegocio: User["tipoNegocio"]; submodulos?: SubmoduloCosmetologa[];
  }) => Promise<string | null>;
  logout: () => Promise<void>;
  update: (patch: Partial<User>) => Promise<void>;
}

const AuthCtx = createContext<Ctx | null>(null);

async function fetchUser(id: string, email: string): Promise<User | null> {
  const { data } = await supabase.from("perfiles").select("*").eq("id", id).single();
  if (!data) return null;
  return toUser(data, email);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const u = await fetchUser(session.user.id, session.user.email ?? "");
        setUser(u);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const u = await fetchUser(session.user.id, session.user.email ?? "");
        setUser(u);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return error.message;
    return null;
  };

  const register = async (data: {
    email: string; password: string; name: string;
    businessName: string; phone: string; plan: User["plan"];
    tipoNegocio: User["tipoNegocio"]; submodulos?: SubmoduloCosmetologa[];
  }): Promise<string | null> => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });
    if (error) return error.message;
    if (!authData.user) return "No se pudo crear la cuenta";

    const userId = authData.user.id;
    const { error: profileError } = await supabase.from("perfiles").upsert({
      id: userId,
      name: data.name,
      business_name: data.businessName,
      phone: data.phone,
      plan: data.plan,
      tipo_negocio: data.tipoNegocio,
      submodulos: data.submodulos ?? [],
      role: "user",
    });
    if (profileError) return profileError.message;

    await seedForUser(userId);
    return null;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const update = async (patch: Partial<User>) => {
    if (!user) return;
    await updateUserById(user.id, patch);
    setUser((prev) => prev ? { ...prev, ...patch } : prev);
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout, update }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth outside provider");
  return ctx;
};
