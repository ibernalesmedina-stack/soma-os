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

// Fetch profile using an explicit access token to avoid timing issues
async function fetchUser(id: string, email: string, accessToken?: string): Promise<User | null> {
  const client = accessToken
    ? supabase.auth.setSession({ access_token: accessToken, refresh_token: "" }).then(() => supabase)
    : Promise.resolve(supabase);

  const { data, error } = await (await client)
    .from("perfiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    // Profile might not exist yet — create a minimal one
    const { data: created } = await supabase
      .from("perfiles")
      .upsert({ id, role: "user" }, { onConflict: "id" })
      .select()
      .single();
    return created ? toUser(created, email) : null;
  }
  return toUser(data, email);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session on page load
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const u = await fetchUser(session.user.id, session.user.email ?? "", session.access_token);
        setUser(u);
      }
      setLoading(false);
    });

    // Keep session in sync (tab focus, token refresh, logout from another tab)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        return;
      }
      if (event === "TOKEN_REFRESHED" && session) {
        const u = await fetchUser(session.user.id, session.user.email ?? "", session.access_token);
        setUser(u);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<string | null> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return error.message;
    if (data.session && data.user) {
      // Fetch profile immediately using the fresh token — no timing race
      const u = await fetchUser(data.user.id, data.user.email ?? "", data.session.access_token);
      setUser(u);
    }
    return null;
  };

  const register = async (data: {
    email: string; password: string; name: string;
    businessName: string; phone: string; plan: User["plan"];
    tipoNegocio: User["tipoNegocio"]; submodulos?: SubmoduloCosmetologa[];
  }): Promise<string | null> => {
    const { data: authData, error } = await supabase.auth.signUp({ email: data.email, password: data.password });
    if (error) return error.message;
    if (!authData.user) return "No se pudo crear la cuenta";

    const userId = authData.user.id;
    const { error: profileError } = await supabase.from("perfiles").upsert({
      id: userId, name: data.name, business_name: data.businessName,
      phone: data.phone, plan: data.plan, tipo_negocio: data.tipoNegocio,
      submodulos: data.submodulos ?? [], role: "user",
    });
    if (profileError) return profileError.message;

    await seedForUser(userId);

    if (authData.session) {
      const u = await fetchUser(userId, data.email, authData.session.access_token);
      setUser(u);
    }
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
