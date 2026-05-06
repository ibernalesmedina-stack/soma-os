import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { AuthShell } from "./Login";
import { PLAN_LABEL } from "@/lib/plans";
import { BUSINESS_CONFIG } from "@/lib/business";
import type { Plan, SubmoduloCosmetologa, TipoNegocio } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

const SUBMODULOS: { key: SubmoduloCosmetologa; label: string; desc: string }[] = [
  { key: "piel", label: "Piel", desc: "Diagnóstico y rutinas" },
  { key: "unas", label: "Uñas", desc: "Tipos y galería" },
  { key: "pestanas", label: "Pestañas", desc: "Estilos y vello" },
];

export default function Signup() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ email: "", password: "", name: "", businessName: "", phone: "" });
  const [tipoNegocio, setTipoNegocio] = useState<TipoNegocio>("psicologa");
  const [submodulos, setSubmodulos] = useState<SubmoduloCosmetologa[]>([]);
  const [plan, setPlan] = useState<Plan>("pro");
  const [error, setError] = useState<string | null>(null);

  if (user) return <Navigate to="/app" replace />;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  const totalSteps = tipoNegocio === "cosmetologa" ? 5 : 4;

  const canNext = () => {
    if (step === 1) return form.email.includes("@") && form.password.length >= 6;
    if (step === 2) return form.name.trim() && form.businessName.trim() && form.phone.trim().length >= 6;
    if (step === 3) return !!tipoNegocio;
    if (step === 4 && tipoNegocio === "cosmetologa") return submodulos.length > 0;
    return true;
  };

  const [submitting, setSubmitting] = useState(false);

  const handleNext = async () => {
    setError(null);
    if (step < totalSteps) { setStep(step + 1); return; }
    setSubmitting(true);
    const err = await register({
      email: form.email, password: form.password, name: form.name,
      businessName: form.businessName, phone: form.phone, plan, tipoNegocio,
      submodulos: tipoNegocio === "cosmetologa" ? submodulos : undefined,
    });
    setSubmitting(false);
    if (err) return setError(err);
    navigate("/app");
  };

  // Cosmetóloga inserts submodulos at step 4, plan at 5. Otherwise plan at 4.
  const renderStep = () => {
    if (step === 1) return (
      <div className="space-y-3">
        <div className="space-y-1.5"><Label>Email</Label><Input type="email" required value={form.email} onChange={set("email")} placeholder="tu@negocio.com" /></div>
        <div className="space-y-1.5"><Label>Contraseña</Label><Input type="password" required minLength={6} value={form.password} onChange={set("password")} placeholder="Mínimo 6 caracteres" /></div>
      </div>
    );
    if (step === 2) return (
      <div className="space-y-3">
        <div className="space-y-1.5"><Label>Nombre del negocio</Label><Input required value={form.businessName} onChange={set("businessName")} /></div>
        <div className="space-y-1.5"><Label>Tu nombre</Label><Input required value={form.name} onChange={set("name")} /></div>
        <div className="space-y-1.5"><Label>Teléfono de contacto <span className="text-destructive">*</span></Label><Input required value={form.phone} onChange={set("phone")} placeholder="+56 9 1234 5678" /></div>
      </div>
    );
    if (step === 3) return (
      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(BUSINESS_CONFIG) as TipoNegocio[]).map((t) => {
          const cfg = BUSINESS_CONFIG[t];
          const Icon = cfg.icon;
          return (
            <button type="button" key={t} onClick={() => setTipoNegocio(t)}
              className={cn("rounded-md border p-3 text-left transition-all flex items-start gap-2",
                tipoNegocio === t ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:border-foreground/20")}>
              <Icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-semibold">{cfg.label}</div>
                <div className="text-[11px] text-muted-foreground">{cfg.registrosLabel}</div>
              </div>
            </button>
          );
        })}
      </div>
    );
    if (step === 4 && tipoNegocio === "cosmetologa") return (
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Selecciona los submódulos que ofreces. Podrás cambiarlos después.</p>
        {SUBMODULOS.map((s) => {
          const active = submodulos.includes(s.key);
          return (
            <button type="button" key={s.key}
              onClick={() => setSubmodulos(active ? submodulos.filter(x => x !== s.key) : [...submodulos, s.key])}
              className={cn("w-full rounded-md border p-3 text-left flex items-center justify-between transition-all",
                active ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:border-foreground/20")}>
              <div>
                <div className="text-sm font-semibold">{s.label}</div>
                <div className="text-[11px] text-muted-foreground">{s.desc}</div>
              </div>
              {active && <Check className="h-4 w-4 text-primary" />}
            </button>
          );
        })}
      </div>
    );
    // Plan step (last)
    return (
      <div className="grid grid-cols-3 gap-2">
        {(["basic", "pro", "premium"] as Plan[]).map((p) => (
          <button type="button" key={p} onClick={() => setPlan(p)}
            className={cn("rounded-md border p-3 text-left transition-all",
              plan === p ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:border-foreground/20")}>
            <div className="text-xs font-semibold">{PLAN_LABEL[p]}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {p === "basic" && "Esenciales"}{p === "pro" && "+ Automatizaciones"}{p === "premium" && "+ Analítica"}
            </div>
          </button>
        ))}
      </div>
    );
  };

  const titles = ["Crea tu cuenta", "Sobre tu negocio", "Tipo de negocio", tipoNegocio === "cosmetologa" ? "Submódulos" : "Elige tu plan", "Elige tu plan"];
  const subtitles = [
    "Empieza en menos de 2 minutos",
    "Cuéntanos de ti y tu marca",
    "Personalizamos el dashboard a tu profesión",
    tipoNegocio === "cosmetologa" ? "Áreas que trabajas" : "Puedes cambiarlo cuando quieras",
    "Puedes cambiarlo cuando quieras",
  ];

  return (
    <AuthShell title={titles[step - 1]} subtitle={subtitles[step - 1]}>
      <div className="space-y-4">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={cn("h-1 flex-1 rounded-full transition-all", i < step ? "bg-primary" : "bg-muted")} />
          ))}
        </div>
        <div className="text-[11px] mono text-muted-foreground">Paso {step} de {totalSteps}</div>

        <form onSubmit={(e) => { e.preventDefault(); if (canNext()) handleNext(); }} className="space-y-4">
          {renderStep()}
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex items-center justify-between gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />Volver
            </Button>
            <Button type="submit" disabled={!canNext() || submitting}>
              {submitting ? "Creando…" : step < totalSteps ? <>Continuar <ArrowRight className="h-4 w-4 ml-1.5" /></> : "Crear cuenta"}
            </Button>
          </div>
        </form>

        <p className="text-xs text-center text-muted-foreground">
          ¿Ya tienes cuenta? <Link to="/login" className="text-primary hover:underline">Inicia sesión</Link>
        </p>
      </div>
    </AuthShell>
  );
}
