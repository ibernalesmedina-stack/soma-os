import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { AuthShell } from "./Login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from "lucide-react";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);
  const [vencido, setVencido] = useState(false);

  useEffect(() => {
    let marca: string | null = null;
    try { marca = sessionStorage.getItem("soma_recovery"); } catch { /* sin storage */ }
    if (marca === "expired" || /error_code=otp_expired|error=access_denied/.test(window.location.hash)) {
      setVencido(true);
      return;
    }
    // Supabase embeds the token in the URL hash — onAuthStateChange picks it up
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    // El evento puede haber ocurrido antes de montar esta página: si ya hay sesión de recuperación, seguir
    supabase.auth.getSession().then(({ data }) => {
      if (data.session && marca === "1") setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres");
    if (password !== confirm) return setError("Las contraseñas no coinciden");
    setSubmitting(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (err) return setError(err.message);
    try { sessionStorage.removeItem("soma_recovery"); } catch { /* sin storage */ }
    setDone(true);
    setTimeout(() => navigate("/login"), 3000);
  };

  if (done) {
    return (
      <AuthShell title="Contraseña actualizada" subtitle="Ya puedes entrar con tu nueva contraseña.">
        <div className="text-center space-y-4">
          <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Redirigiendo al inicio de sesión…</p>
        </div>
      </AuthShell>
    );
  }

  if (vencido) {
    return (
      <AuthShell title="El enlace venció" subtitle="Los enlaces para cambiar la contraseña se pueden usar una sola vez y duran poco tiempo.">
        <div className="space-y-3 text-center">
          <p className="text-sm text-muted-foreground">Pide uno nuevo y ábrelo apenas te llegue.</p>
          <Button className="w-full" onClick={() => { try { sessionStorage.removeItem("soma_recovery"); } catch { /* sin storage */ } navigate("/login"); }}>Volver al inicio de sesión</Button>
        </div>
      </AuthShell>
    );
  }

  if (!ready) {
    return (
      <AuthShell title="Verificando enlace…" subtitle="Por favor espera un momento.">
        <p className="text-sm text-center text-muted-foreground">Si llegaste aquí por error, <button onClick={() => navigate("/login")} className="text-primary hover:underline">vuelve al login</button>.</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Nueva contraseña" subtitle="Elige una contraseña segura para tu cuenta.">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="pw">Nueva contraseña</Label>
          <Input id="pw" type="password" required autoFocus minLength={6}
            value={password} onChange={(e) => { setPassword(e.target.value); setError(null); }} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pw2">Confirmar contraseña</Label>
          <Input id="pw2" type="password" required minLength={6}
            value={confirm} onChange={(e) => { setConfirm(e.target.value); setError(null); }} />
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Guardando…" : "Actualizar contraseña"}
        </Button>
      </form>
    </AuthShell>
  );
}
