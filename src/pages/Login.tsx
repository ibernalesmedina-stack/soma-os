import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { ArrowRight, Calendar, CreditCard, Sparkles, CheckCircle2, Users, TrendingUp } from "lucide-react";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  if (user) return <Navigate to="/app" replace />;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = login(email, password);
    if (err) return setError(err);
    navigate("/app");
  };

  return <AuthShell title="Bienvenida de vuelta" subtitle="Accede a tu workspace SomaOS">
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@negocio.com" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Contraseña</Label>
        <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button type="submit" className="w-full">
        Empezar ahora <ArrowRight className="ml-1.5 h-4 w-4" />
      </Button>
      <Button type="button" variant="outline" className="w-full" onClick={() => navigate("/app")}>
        Ver demo
      </Button>
      <p className="text-xs text-center text-muted-foreground">
        ¿No tienes cuenta? <Link to="/signup" className="text-primary hover:underline">Crear cuenta</Link>
      </p>
    </form>
  </AuthShell>;
}

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr] bg-background">
      {/* LEFT — Hero */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 xl:p-16 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #5B3EFF 0%, #7B61FF 50%, #9F8CFF 100%)" }}
      >
        {/* Glow blobs */}
        <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-white/20 blur-3xl" />
        <div className="absolute bottom-[-10rem] right-[-6rem] w-[26rem] h-[26rem] rounded-full bg-[#3D1FCC]/40 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-white/10 blur-2xl" />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="size-9 rounded-xl bg-white/15 backdrop-blur-md grid place-items-center font-bold border border-white/20">S</div>
          <div className="font-semibold tracking-tight text-lg">SomaOS</div>
        </div>

        {/* Headline + product mockup */}
        <div className="relative z-10 grid gap-10 my-10">
          <div className="space-y-5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md">
              <Sparkles className="h-3 w-3" /> Automatización inteligente
            </div>
            <h1 className="text-5xl xl:text-6xl font-semibold tracking-tight leading-[1.05]">
              Tu negocio<br />funcionando solo
            </h1>
            <p className="text-base xl:text-lg text-white/75 max-w-md leading-relaxed">
              Automatiza reservas, pagos y clientas en una sola plataforma.
            </p>
            <ul className="grid gap-2 pt-2">
              {[
                "Agenda automática",
                "Recordatorios y pagos integrados",
                "Todo en un solo lugar",
              ].map((b) => (
                <li key={b} className="flex items-center gap-2.5 text-sm text-white/85">
                  <CheckCircle2 className="h-4 w-4 text-white" /> {b}
                </li>
              ))}
            </ul>
          </div>

          <ProductMockup />
        </div>

        <div className="relative z-10 text-xs text-white/55">© SomaOS · Operations Platform</div>
      </div>

      {/* RIGHT — Form */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 flex items-center gap-2">
            <div className="size-8 rounded-md bg-primary text-primary-foreground grid place-items-center font-bold">S</div>
            <div className="font-semibold tracking-tight">SomaOS</div>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-6">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

function ProductMockup() {
  const hours = ["09", "10", "11", "12", "13"];
  const events = [
    { row: 0, col: 0, span: 1, label: "Sofía · Corte", color: "bg-[#7B61FF]" },
    { row: 1, col: 1, span: 2, label: "Carla · Color", color: "bg-[#5B3EFF]" },
    { row: 0, col: 3, span: 1, label: "Ana · Manicure", color: "bg-[#9F8CFF]" },
    { row: 2, col: 2, span: 1, label: "María · Facial", color: "bg-[#6B4FFF]" },
  ];
  const clientas = [
    { n: "Sofía R.", t: "Corte · hoy 09:00", i: "SR" },
    { n: "Carla M.", t: "Color · hoy 10:00", i: "CM" },
    { n: "Ana P.", t: "Manicure · hoy 09:00", i: "AP" },
  ];

  return (
    <div className="relative max-w-2xl">
      {/* Glow behind */}
      <div className="absolute -inset-6 bg-white/10 blur-2xl rounded-3xl" />
      <div className="relative rounded-2xl bg-white/95 text-slate-900 shadow-2xl border border-white/40 p-4 backdrop-blur-xl">
        {/* Top bar */}
        <div className="flex items-center gap-1.5 pb-3 border-b border-slate-100">
          <span className="size-2.5 rounded-full bg-red-400/70" />
          <span className="size-2.5 rounded-full bg-amber-400/70" />
          <span className="size-2.5 rounded-full bg-emerald-400/70" />
          <div className="ml-3 text-[11px] text-slate-400 font-medium">somaos.app · dashboard</div>
        </div>

        <div className="grid grid-cols-5 gap-3 pt-3">
          {/* Calendar */}
          <div className="col-span-3 rounded-xl border border-slate-100 p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-[#5B3EFF]" /> Hoy
              </div>
              <div className="text-[10px] text-slate-400">May 2026</div>
            </div>
            <div className="grid grid-cols-[28px_repeat(4,1fr)] gap-1">
              <div />
              {["Lun", "Mar", "Mié", "Jue"].map((d) => (
                <div key={d} className="text-[9px] text-slate-400 text-center pb-1">{d}</div>
              ))}
              {hours.map((h, rIdx) => (
                <>
                  <div key={`h-${h}`} className="text-[9px] text-slate-400 pr-1 text-right pt-1">{h}</div>
                  {Array.from({ length: 4 }).map((_, cIdx) => {
                    const ev = events.find((e) => e.row === rIdx && e.col === cIdx);
                    return (
                      <div key={`${rIdx}-${cIdx}`} className="h-7 rounded-md bg-slate-50 relative">
                        {ev && (
                          <div className={`absolute inset-0.5 rounded-md ${ev.color} text-white text-[9px] font-medium flex items-center px-1.5 truncate shadow-sm`}>
                            {ev.label}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="col-span-2 space-y-3">
            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2">
              <Mini icon={Users} label="Clientas" value="148" />
              <Mini icon={TrendingUp} label="Ocupación" value="92%" />
            </div>
            {/* Client list */}
            <div className="rounded-xl border border-slate-100 p-3">
              <div className="text-xs font-semibold text-slate-700 mb-2">Próximas</div>
              <ul className="space-y-2">
                {clientas.map((c) => (
                  <li key={c.n} className="flex items-center gap-2">
                    <div className="size-7 rounded-full bg-gradient-to-br from-[#5B3EFF] to-[#9F8CFF] text-white text-[10px] font-semibold grid place-items-center">{c.i}</div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-medium text-slate-800 truncate">{c.n}</div>
                      <div className="text-[10px] text-slate-400 truncate">{c.t}</div>
                    </div>
                    <CreditCard className="h-3 w-3 text-emerald-500" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Mini({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 p-2.5">
      <div className="flex items-center justify-between">
        <div className="size-6 rounded-md bg-[#7B61FF]/10 text-[#5B3EFF] grid place-items-center"><Icon className="h-3 w-3" /></div>
      </div>
      <div className="text-[10px] text-slate-400 mt-1.5">{label}</div>
      <div className="text-base font-semibold tracking-tight text-slate-800">{value}</div>
    </div>
  );
}
