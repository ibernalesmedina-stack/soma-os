import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Lock } from "lucide-react";

export default function AdminLogin() {
  const { user, loading: authLoading, login, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already authenticated as admin → go straight to dashboard
  if (user?.role === "admin") return <Navigate to="/admin" replace />;

  // Authenticated but not admin → show access denied
  if (!authLoading && user && user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#0d0d14] flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm">
          <h1 className="text-xl font-semibold text-white">Sin acceso de administrador</h1>
          <p className="text-sm text-white/40">La cuenta <span className="text-white/60">{user.email}</span> no tiene permisos admin.</p>
          <Button variant="outline" className="border-white/10 text-white/70 hover:text-white hover:bg-white/5"
            onClick={() => logout()}>Cerrar sesión</Button>
        </div>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const err = await login(email, password);
    if (err) { setError(err); setSubmitting(false); return; }
    // Don't navigate manually — onAuthStateChange will update user,
    // triggering the `if (user?.role === "admin") return <Navigate>` above.
    // Keep submitting=true while waiting for auth state to resolve.
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[1fr_1fr] bg-[#0a0a0f]">
      {/* LEFT — branding */}
      <div className="hidden lg:flex flex-col justify-between p-12 xl:p-16 relative overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1040] via-[#0a0a0f] to-[#0a0a0f]" />
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-[#5B3EFF]/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-[#5B3EFF]/5 blur-3xl" />

        <div className="relative z-10 flex items-center gap-2.5">
          <div className="size-8 rounded-md bg-[#5B3EFF] grid place-items-center">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          <div className="text-white font-semibold tracking-tight">SomaOS Admin</div>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">
            <Lock className="h-3 w-3" /> Acceso restringido
          </div>
          <h1 className="text-4xl xl:text-5xl font-semibold text-white tracking-tight leading-tight">
            Panel de<br />control central
          </h1>
          <p className="text-sm text-white/40 max-w-xs">
            Gestiona clientes, facturación, finanzas y configuración de la plataforma.
          </p>
          <ul className="space-y-2 pt-2">
            {["Gestión de clientes", "Facturación y finanzas", "Reportes globales", "Configuración del sistema"].map((item) => (
              <li key={item} className="text-xs text-white/50 flex items-center gap-2">
                <span className="size-1 rounded-full bg-[#5B3EFF]" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 text-[11px] text-white/20">
          SomaOS · Admin Console · Acceso solo para personal autorizado
        </div>
      </div>

      {/* RIGHT — form */}
      <div className="flex items-center justify-center p-6 lg:p-12 bg-[#0d0d14]">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <div className="lg:hidden mb-8 flex items-center gap-2">
            <div className="size-7 rounded-md bg-[#5B3EFF] grid place-items-center">
              <ShieldCheck className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="text-white font-semibold text-sm tracking-tight">SomaOS Admin</div>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight text-white">Acceso de administrador</h2>
          <p className="text-sm text-white/40 mt-1 mb-8">Solo cuentas con rol admin pueden entrar.</p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-white/70 text-xs">Email</Label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@somaos.app"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#5B3EFF]/60"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-white/70 text-xs">Contraseña</Label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#5B3EFF]/60"
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#5B3EFF] hover:bg-[#4D35E0] text-white"
            >
              {submitting ? "Entrando…" : "Entrar al panel"}
            </Button>
          </form>

          <p className="text-center text-[11px] text-white/20 mt-8">
            ¿Eres cliente?{" "}
            <a href="/login" className="text-[#7B61FF] hover:text-[#9F8CFF]">
              Ir al login de clientes
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
