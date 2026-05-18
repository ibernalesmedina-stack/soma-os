import { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Mail, Trash2, Download, Eye, Pencil, XCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type RequestType = "acceso" | "rectificacion" | "borrado" | "portabilidad" | "oposicion" | "otro";

const REQUEST_TYPES: { value: RequestType; label: string; icon: React.ComponentType<{className?: string}>; desc: string }[] = [
  { value: "acceso", label: "Acceso a mis datos", icon: Eye, desc: "Quiero saber qué datos personales tiene SomaOS sobre mí." },
  { value: "rectificacion", label: "Rectificación", icon: Pencil, desc: "Quiero corregir datos incorrectos o incompletos." },
  { value: "borrado", label: "Derecho al olvido", icon: Trash2, desc: "Quiero que se eliminen mis datos personales (art. 12 Ley 19.628)." },
  { value: "portabilidad", label: "Portabilidad", icon: Download, desc: "Quiero recibir mis datos en formato portable (JSON/CSV)." },
  { value: "oposicion", label: "Oposición", icon: XCircle, desc: "Quiero oponerme al tratamiento de mis datos para determinados fines." },
  { value: "otro", label: "Otra consulta", icon: Mail, desc: "Tengo otra consulta relacionada con privacidad o protección de datos." },
];

export default function Dpo() {
  const [type, setType] = useState<RequestType | null>(null);
  const [form, setForm] = useState({ name: "", email: "", detail: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !form.name.trim() || !form.email.includes("@")) return;
    setSending(true);
    // Send via mailto as fallback (no backend needed for DPO form)
    const subject = encodeURIComponent(`[SomaOS DPO] Solicitud: ${REQUEST_TYPES.find(r => r.value === type)?.label}`);
    const body = encodeURIComponent(
      `Nombre: ${form.name}\nEmail: ${form.email}\nTipo de solicitud: ${type}\nFecha: ${new Date().toLocaleDateString("es-CL")}\n\nDetalle:\n${form.detail}`
    );
    window.location.href = `mailto:privacidad@somaos.app?subject=${subject}&body=${body}`;
    setTimeout(() => { setSent(true); setSending(false); }, 800);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-8">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Volver a SomaOS</Link>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Delegado de Protección de Datos</h1>
            <p className="text-sm text-muted-foreground">Ejercicio de derechos ARCO y consultas de privacidad</p>
          </div>
        </div>

        <div className="rounded-xl border bg-muted/30 p-4 mb-8 text-sm text-muted-foreground space-y-1">
          <p>Puedes ejercer tus derechos de <strong className="text-foreground">Acceso, Rectificación, Cancelación y Oposición (ARCO)</strong> conforme a la Ley N° 19.628 de Chile.</p>
          <p>Tiempo de respuesta máximo: <strong className="text-foreground">30 días hábiles</strong>. Para solicitudes urgentes indica "URGENTE" en el detalle.</p>
          <p>Email directo: <a href="mailto:privacidad@somaos.app" className="text-primary hover:underline">privacidad@somaos.app</a></p>
        </div>

        {sent ? (
          <div className="text-center py-12 space-y-4">
            <CheckCircle2 className="h-12 w-12 text-success mx-auto" />
            <h2 className="text-lg font-semibold">Solicitud enviada</h2>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Hemos recibido tu solicitud. Te responderemos a <strong>{form.email}</strong> en un plazo máximo de 30 días hábiles. Guarda este email como constancia.
            </p>
            <Button variant="outline" onClick={() => { setSent(false); setType(null); setForm({ name: "", email: "", detail: "" }); }}>
              Nueva solicitud
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Tipo de solicitud */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tipo de solicitud <span className="text-destructive">*</span></Label>
              <div className="grid sm:grid-cols-2 gap-2">
                {REQUEST_TYPES.map((r) => {
                  const Icon = r.icon;
                  const active = type === r.value;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setType(r.value)}
                      className={`rounded-lg border p-3 text-left transition-all ${active ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:border-foreground/30"}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                        <span className="text-sm font-medium">{r.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{r.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Datos de contacto */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Nombre completo <span className="text-destructive">*</span></Label>
                <Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Tu nombre y apellido" />
              </div>
              <div className="space-y-1.5">
                <Label>Email <span className="text-destructive">*</span></Label>
                <Input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="tu@email.com" />
              </div>
            </div>

            {/* Detalle */}
            <div className="space-y-1.5">
              <Label>Detalle de tu solicitud</Label>
              <Textarea
                rows={4}
                value={form.detail}
                onChange={e => setForm({ ...form, detail: e.target.value })}
                placeholder={type === "borrado"
                  ? "Indica si eres Cliente (profesional) o si tus datos fueron ingresados por un profesional de salud que usa SomaOS. Incluye tu email de cuenta si aplica."
                  : "Describe con detalle lo que necesitas..."}
              />
            </div>

            {/* Aviso datos de salud */}
            {type === "borrado" && (
              <div className="rounded-lg border border-warning/30 bg-warning/5 p-3 text-xs text-muted-foreground">
                <strong className="text-foreground">Si eres paciente de un profesional que usa SomaOS:</strong> Los datos clínicos son responsabilidad del profesional de salud que los ingresó. Para solicitar el borrado de tu ficha médica, debes contactar directamente al profesional. SomaOS puede actuar como intermediario técnico bajo solicitud verificada.
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={!type || !form.name.trim() || !form.email.includes("@") || sending}
            >
              {sending ? "Enviando…" : "Enviar solicitud"}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Al enviar esta solicitud, aceptas que SomaOS procese los datos proporcionados exclusivamente para responder a tu solicitud, conforme a nuestra{" "}
              <Link to="/privacidad" className="text-primary hover:underline">Política de Privacidad</Link>.
            </p>
          </form>
        )}

        {/* Info adicional */}
        <div className="mt-12 pt-8 border-t space-y-4 text-xs text-muted-foreground">
          <h3 className="text-sm font-semibold text-foreground">Información adicional</h3>
          <p><strong className="text-foreground">Verificación de identidad:</strong> Para proteger tus datos, podemos solicitarte verificación de identidad (por ejemplo, confirmar el email de tu cuenta) antes de procesar la solicitud.</p>
          <p><strong className="text-foreground">Gratuidad:</strong> El ejercicio de derechos ARCO es gratuito. Solo podemos cobrar una tarifa razonable por solicitudes manifiestamente infundadas o excesivas.</p>
          <p><strong className="text-foreground">Recursos:</strong> Si no estás satisfecho con nuestra respuesta, puedes presentar una reclamación ante el <strong className="text-foreground">SERNAC</strong> (Chile) o la autoridad de protección de datos de tu país de residencia.</p>
        </div>

      </div>
    </div>
  );
}
