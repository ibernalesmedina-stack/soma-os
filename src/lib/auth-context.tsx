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
    // 1. Create auth user
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });
    if (error) return error.message;
    if (!authData.user) return "No se pudo crear la cuenta";

    // 2. Get a valid session — signUp may not return one if email confirm is on
    let session = authData.session;
    if (!session) {
      // Attempt immediate sign-in (works when email confirmation is disabled)
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (signInError) return "Cuenta creada. Confirma tu email para continuar.";
      session = signInData.session;
    }

    const userId = authData.user.id;
    const token = session?.access_token;

    // 3. Upsert profile (trigger may have already created the row)
    const { error: profileError } = await supabase.from("perfiles").upsert(
      {
        id: userId,
        name: data.name,
        business_name: data.businessName,
        phone: data.phone,
        plan: data.plan,
        tipo_negocio: data.tipoNegocio,
        submodulos: data.submodulos ?? [],
        role: "user",
      },
      { onConflict: "id" },
    );
    if (profileError) {
      console.error("Error creando perfil:", profileError);
      // Don't block registration — profile may have been created by trigger
    }

    // 4. Seed demo data (non-blocking — tables may not exist yet)
    try {
      await seedForUser(userId);
    } catch (e) {
      console.warn("Seed skipped (tables may not exist yet):", e);
    }

    // 5. Set user state with fresh token
    if (session) {
      const u = await fetchUser(userId, data.email, token);
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
