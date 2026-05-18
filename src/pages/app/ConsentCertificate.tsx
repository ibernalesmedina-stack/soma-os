import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { Printer, ShieldCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PRIVACY_VERSION } from "@/pages/Privacidad";
import { TERMS_VERSION } from "@/pages/Terminos";

interface ConsentRecord {
  fecha: string;
  data: {
    privacy: boolean;
    terms: boolean;
    retention: boolean;
    ip?: string;
    version?: string;
    privacyVersion?: string;
    termsVersion?: string;
  };
}

export default function ConsentCertificate() {
  const { user } = useAuth();
  const [consent, setConsent] = useState<ConsentRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("registros")
      .select("fecha, data")
      .eq("user_id", user.id)
      .eq("tipo", "consentimiento")
      .like("titulo", "Consentimiento de alta%")
      .order("fecha", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setConsent(data as ConsentRecord);
        setLoading(false);
      });
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <style>{`@media print { .no-print { display: none !important; } body { background: white; } .print-border { border: 1px solid #e5e7eb !important; } }`}</style>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8 no-print">
          <Link to="/app/configuracion" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Volver
          </Link>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-1.5" /> Descargar PDF
          </Button>
        </div>

        <div className="rounded-xl border-2 border-primary/20 p-8 space-y-6 print-border">
          {/* Header */}
          <div className="text-center space-y-3 pb-6 border-b">
            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <ShieldCheck className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-xl font-semibold">Certificado de Consentimiento</h1>
            <p className="text-sm text-muted-foreground">SomaOS SpA · somaos.app</p>
          </div>

          {/* Datos del titular */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Titular</h2>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <Row label="Nombre" value={user.name || "—"} />
              <Row label="Email" value={user.email} />
              <Row label="Negocio" value={user.businessName || "—"} />
              <Row label="ID de cuenta" value={user.id.slice(0, 8) + "…"} />
            </div>
          </div>

          {/* Fecha y versión */}
          {loading ? (
            <div className="py-6 text-center text-sm text-muted-foreground animate-pulse">Cargando registro de consentimiento…</div>
          ) : consent ? (
            <>
              <div className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Registro de aceptación</h2>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <Row label="Fecha de aceptación" value={new Date(consent.fecha).toLocaleString("es-CL", { dateStyle: "long", timeStyle: "medium" })} />
                  <Row label="IP de registro" value={consent.data.ip || "No registrada"} />
                  <Row label="Versión Política Privacidad" value={`v${consent.data.privacyVersion || consent.data.version || PRIVACY_VERSION}`} />
                  <Row label="Versión Términos de Servicio" value={`v${consent.data.termsVersion || consent.data.version || TERMS_VERSION}`} />
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Documentos aceptados</h2>
                <div className="space-y-2">
                  <ConsentItem
                    label="Política de Privacidad"
                    accepted={consent.data.privacy}
                    detail={`Versión v${consent.data.privacyVersion || PRIVACY_VERSION} — Ley 19.628 (Chile) + GDPR`}
                  />
                  <ConsentItem
                    label="Términos de Servicio"
                    accepted={consent.data.terms}
                    detail={`Versión v${consent.data.termsVersion || TERMS_VERSION} — Jurisdicción Chile`}
                  />
                  <ConsentItem
                    label="Política de retención de datos (30 días post-cancelación)"
                    accepted={consent.data.retention}
                    detail="Aceptó conservación de datos 30 días tras cancelación"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-lg border border-warning/30 bg-warning/5 p-4 text-sm text-muted-foreground">
              <strong className="text-foreground">Sin registro de consentimiento digital.</strong> Si creaste tu cuenta antes de mayo de 2026, tu consentimiento fue implícito al usar el servicio. Para obtener un nuevo registro formal, <a href="mailto:privacidad@somaos.app" className="text-primary hover:underline">contáctanos</a>.
            </div>
          )}

          {/* Footer legal */}
          <div className="pt-6 border-t text-xs text-muted-foreground space-y-1">
            <p>Este certificado acredita la aceptación de los términos legales de SomaOS por parte del titular indicado.</p>
            <p>Emitido automáticamente por SomaOS SpA · {new Date().toLocaleDateString("es-CL")} · somaos.app/app/consentimiento</p>
            <p>Para verificación de autenticidad: <a href="mailto:privacidad@somaos.app" className="text-primary hover:underline">privacidad@somaos.app</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

function ConsentItem({ label, accepted, detail }: { label: string; accepted: boolean; detail: string }) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${accepted ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"}`}>
      <ShieldCheck className={`h-4 w-4 mt-0.5 shrink-0 ${accepted ? "text-success" : "text-destructive"}`} />
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{detail}</div>
      </div>
      <span className={`ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${accepted ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
        {accepted ? "Aceptado" : "No registrado"}
      </span>
    </div>
  );
}
