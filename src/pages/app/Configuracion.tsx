import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CalendarCheck2, MessageCircle, CreditCard, Globe, Copy, ExternalLink, Eye, EyeOff, Loader2 } from "lucide-react";
import { Link } from "react-router-dom"; // used in sitio publico section
import { toast } from "@/hooks/use-toast";
import { getIntegration, upsertIntegration } from "@/lib/storage";
import type { ClientIntegration } from "@/lib/types";

const EMPTY: Omit<ClientIntegration, "id" | "user_id" | "created_at" | "updated_at"> = {
  whatsapp_number: "", whatsapp_token: "", google_calendar_token: "",
  webpay_merchant_code: "", dominio: "",
};

export default function Configuracion() {
  const { user, update } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [businessName, setBusinessName] = useState(user?.businessName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [integration, setIntegration] = useState(EMPTY);
  const [loadingInt, setLoadingInt] = useState(true);
  const [savingInt, setSavingInt] = useState(false);

  useEffect(() => {
    if (!user) return;
    getIntegration(user.id).then((d) => {
      if (d) setIntegration({
        whatsapp_number: d.whatsapp_number, whatsapp_token: d.whatsapp_token,
        google_calendar_token: d.google_calendar_token,
        webpay_merchant_code: d.webpay_merchant_code, dominio: d.dominio,
      });
      setLoadingInt(false);
    });
  }, [user]);

  if (!user) return null;
  const pm = user.paymentMethods ?? { webpay: true, transferencia: true };

  const setField = (k: keyof typeof integration) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setIntegration((p) => ({ ...p, [k]: e.target.value }));

  const saveIntegration = async () => {
    setSavingInt(true);
    try {
      await upsertIntegration(user.id, integration);
      // Sync whatsapp_number y dominio al perfil también
      await update({ whatsappNumber: integration.whatsapp_number, domain: integration.dominio });
      toast({ title: "Integraciones guardadas" });
    } catch {
      toast({ title: "Error al guardar", description: "Intenta de nuevo.", variant: "destructive" });
    } finally {
      setSavingInt(false);
    }
  };

  const publicUrl = `${window.location.origin}/s/${user.id}`;

  return (
    <>
      <PageHeader title="Configuración" description="Información personal, integraciones y medios de pago." />

      <div className="space-y-6 max-w-3xl">

        {/* Información personal */}
        <section className="surface-card p-6">
          <h3 className="font-semibold">Información personal</h3>
          <p className="text-xs text-muted-foreground mb-4">Datos visibles en tu workspace.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Nombre del negocio</Label><Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Tu nombre</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input value={user.email} disabled /></div>
            <div className="space-y-1.5"><Label>Teléfono de contacto</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+56 9 …" /></div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => { update({ name, businessName, phone }); toast({ title: "Perfil actualizado" }); }}>
              Guardar cambios
            </Button>
          </div>
        </section>

        {/* Integraciones (client_integrations) */}
        <section className="surface-card p-6">
          <h3 className="font-semibold flex items-center gap-2">
            <CalendarCheck2 className="h-4 w-4" /> Integraciones
          </h3>
          <p className="text-xs text-muted-foreground mb-5">
            Tokens y credenciales guardados cifrados en Supabase.
          </p>

          {loadingInt ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
            </div>
          ) : (
            <div className="space-y-5">
              {/* WhatsApp */}
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-[#25d366]" />
                  <span className="text-sm font-medium">WhatsApp</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Field label="Número de teléfono">
                    <Input placeholder="+56 9 1234 5678" value={integration.whatsapp_number} onChange={setField("whatsapp_number")} />
                  </Field>
                  <Field label="Token de API">
                    <SecretInput placeholder="whatsapp_token…" value={integration.whatsapp_token} onChange={setField("whatsapp_token")} />
                  </Field>
                </div>
              </div>

              {/* Google Calendar */}
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <CalendarCheck2 className="h-4 w-4 text-[#4285f4]" />
                  <span className="text-sm font-medium">Google Calendar</span>
                </div>
                <Field label="Token OAuth">
                  <SecretInput placeholder="ya29.xxxxx…" value={integration.google_calendar_token} onChange={setField("google_calendar_token")} />
                </Field>
              </div>

              {/* WebPay */}
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">WebPay (Transbank)</span>
                </div>
                <Field label="Código de comercio">
                  <SecretInput placeholder="597055555532…" value={integration.webpay_merchant_code} onChange={setField("webpay_merchant_code")} />
                </Field>
              </div>

              {/* Dominio */}
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span className="text-sm font-medium">Dominio personalizado</span>
                </div>
                <Field label="Dominio">
                  <Input placeholder="tu-negocio.com" value={integration.dominio} onChange={setField("dominio")} />
                </Field>
              </div>

              <div className="flex justify-end">
                <Button onClick={saveIntegration} disabled={savingInt}>
                  {savingInt && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Guardar integraciones
                </Button>
              </div>
            </div>
          )}
        </section>

        {/* Medios de pago */}
        <section className="surface-card p-6">
          <h3 className="font-semibold flex items-center gap-2"><CreditCard className="h-4 w-4" />Medios de pago</h3>
          <p className="text-xs text-muted-foreground mb-4">Métodos disponibles para tus clientes.</p>
          <div className="space-y-2">
            <Row label="WebPay" desc="Tarjetas de crédito y débito"
              checked={pm.webpay}
              onChange={(v) => { update({ paymentMethods: { ...pm, webpay: v } }); toast({ title: v ? "WebPay activado" : "WebPay desactivado" }); }}
            />
            <Row label="Transferencia bancaria" desc="Pago manual confirmado por ti"
              checked={pm.transferencia}
              onChange={(v) => { update({ paymentMethods: { ...pm, transferencia: v } }); toast({ title: v ? "Transferencia activada" : "Transferencia desactivada" }); }}
            />
          </div>
        </section>

        {/* Sitio público */}
        <section className="surface-card p-6">
          <h3 className="font-semibold flex items-center gap-2"><Globe className="h-4 w-4" />Sitio público</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Tu página de servicios pública — se actualiza en tiempo real cuando editas tus servicios.
          </p>
          <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tu URL de servicios</div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-background border rounded px-2 py-1.5 truncate">{publicUrl}</code>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"
                onClick={() => { navigator.clipboard.writeText(publicUrl); toast({ title: "Link copiado" }); }}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" asChild>
                <a href={`/s/${user.id}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Los servicios activos en <Link to="/app/servicios" className="text-primary hover:underline">Servicios</Link> aparecen aquí automáticamente.
            </p>
          </div>
        </section>

      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function SecretInput({ value, onChange, placeholder }: { value: string; onChange: React.ChangeEventHandler<HTMLInputElement>; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="pr-9"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        tabIndex={-1}
      >
        {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

function Row({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
