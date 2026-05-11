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
  resetPassword: (email: string) => Promise<string | null>;
}

const AuthCtx = createContext<Ctx | null>(null);

async function fetchUser(id: string, email: string, accessToken?: string): Promise<User | null> {
  // Set session explicitly so RLS auth.uid() resolves correctly
  if (accessToken) {
    await supabase.auth.setSession({ access_token: accessToken, refresh_token: "" });
  }

  const { data, error } = await supabase
    .from("perfiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.warn("fetchUser: perfil no encontrado, intentando upsert:", error?.message);
    // Try to create/fetch a minimal profile
    const { data: created } = await supabase
      .from("perfiles")
      .upsert({ id, role: "user" }, { onConflict: "id" })
      .select()
      .single();
    if (created) return toUser(created, email);

    // Fallback: return a minimal in-memory user so the app doesn't block
    console.warn("fetchUser: usando perfil en memoria (schema.sql puede no haberse ejecutado)");
    return {
      id, email, name: "", businessName: "", phone: "", role: "user",
      plan: "basic", tipoNegocio: "psicologa", active: true,
      createdAt: new Date().toISOString(),
    };
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
    // Use server-side API route — creates user with service role key,
    // no email sent, no rate limit, email auto-confirmed
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.email, password: data.password, name: data.name,
        businessName: data.businessName, phone: data.phone,
        plan: data.plan, tipoNegocio: data.tipoNegocio,
        submodulos: data.submodulos ?? [],
      }),
    });

    const result = await res.json();
    if (!res.ok) return result.error || "Error al crear la cuenta";

    // Set session from API response
    const { access_token, refresh_token, userId } = result;
    await supabase.auth.setSession({ access_token, refresh_token });

    // Seed demo data (non-blocking)
    try { await seedForUser(userId); } catch (e) { console.warn("Seed skipped:", e); }

    // Fetch and set user profile
    const u = await fetchUser(userId, data.email, access_token);
    setUser(u);

    return null;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const resetPassword = async (email: string): Promise<string | null> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return error ? error.message : null;
  };

  const update = async (patch: Partial<User>) => {
    if (!user) return;
    await updateUserById(user.id, patch);
    setUser((prev) => prev ? { ...prev, ...patch } : prev);
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout, update, resetPassword }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth outside provider");
  return ctx;
};
