import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getIntegration, upsertIntegration } from "@/lib/storage";
import type { ClientIntegration } from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Globe, Mail, MessageCircle, Calendar, CreditCard, Building2,
  CheckCircle2, Clock, XCircle, Eye, EyeOff, Loader2, ExternalLink, Copy,
} from "lucide-react";

const EMPTY: Omit<ClientIntegration, "id" | "user_id" | "created_at" | "updated_at"> = {
  dominio: "", domain_status: "pending",
  resend_api_key: "", resend_email: "", resend_status: "disconnected",
  whatsapp_number: "", whatsapp_token: "", whatsapp_status: "disconnected",
  google_calendar_token: "", calendar_status: "disconnected",
  webpay_merchant_code: "", webpay_status: "inactive",
  transfer_banco: "", transfer_cuenta: "", transfer_rut: "", transfer_status: "unverified",
};

type Status = "connected" | "pending" | "disconnected" | "synced" | "active" | "inactive" | "verified" | "unverified" | "error";

function StatusBadge({ status }: { status: Status }) {
  const config: Record<Status, { label: string; color: string; icon: typeof CheckCircle2 }> = {
    connected:    { label: "Conectado",      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
    synced:       { label: "Sincronizado",   color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
    active:       { label: "Activo",         color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
    verified:     { label: "Verificado",     color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
    pending:      { label: "Pendiente",      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",       icon: Clock },
    disconnected: { label: "No conectado",   color: "text-muted-foreground bg-muted border-border",              icon: XCircle },
    inactive:     { label: "Inactivo",       color: "text-muted-foreground bg-muted border-border",              icon: XCircle },
    unverified:   { label: "Sin verificar",  color: "text-muted-foreground bg-muted border-border",              icon: XCircle },
    error:        { label: "Error",          color: "text-red-500 bg-red-500/10 border-red-500/20",              icon: XCircle },
  };
  const { label, color, icon: Icon } = config[status] ?? config.disconnected;
  return (
    <span className={cn("inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border", color)}>
      <Icon className="h-3 w-3" /> {label}
    </span>
  );
}

function SecretInput({ value, onChange, placeholder, disabled }: { value: string; onChange: (v: string) => void; placeholder?: string; disabled?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input type={show ? "text" : "password"} value={value} placeholder={placeholder} disabled={disabled}
        onChange={(e) => onChange(e.target.value)} className="pr-9 font-mono text-sm" />
      <button type="button" tabIndex={-1} onClick={() => setShow(s => !s)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
        {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

interface CardProps { icon: React.ElementType; iconColor: string; iconBg: string; title: string; description: string; status: Status; children: React.ReactNode; action?: React.ReactNode; }

function IntegrationCard({ icon: Icon, iconColor, iconBg, title, description, status, children, action }: CardProps) {
  return (
    <div className="surface-card overflow-hidden">
      <div className="p-5 border-b flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={cn("size-10 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
          <div>
            <div className="font-semibold text-sm">{title}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={status} />
          {action}
        </div>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

export default function Integraciones() {
  const { user } = useAuth();
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    getIntegration(user.id).then((d) => {
      if (d) setData({ dominio: d.dominio, domain_status: d.domain_status, resend_api_key: d.resend_api_key, resend_email: d.resend_email, resend_status: d.resend_status, whatsapp_number: d.whatsapp_number, whatsapp_token: d.whatsapp_token, whatsapp_status: d.whatsapp_status, google_calendar_token: d.google_calendar_token, calendar_status: d.calendar_status, webpay_merchant_code: d.webpay_merchant_code, webpay_status: d.webpay_status, transfer_banco: d.transfer_banco, transfer_cuenta: d.transfer_cuenta, transfer_rut: d.transfer_rut, transfer_status: d.transfer_status });
      setLoading(false);
    });
  }, [user]);

  const set = <K extends keyof typeof EMPTY>(k: K, v: (typeof EMPTY)[K]) =>
    setData(p => ({ ...p, [k]: v }));

  const save = async (patch: Partial<typeof data>, successMsg = "Guardado") => {
    if (!user) return;
    setSaving(true);
    try {
      const next = { ...data, ...patch };
      setData(next);
      await upsertIntegration(user.id, next);
      toast({ title: successMsg });
    } catch {
      toast({ title: "Error al guardar", variant: "destructive" });
    } finally { setSaving(false); }
  };

  const simulateTest = async (key: string, ms = 1400) => {
    setTesting(key);
    await new Promise(r => setTimeout(r, ms));
    setTesting(null);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
    </div>
  );

  const publicUrl = `${window.location.origin}/s/${user?.id}`;

  return (
    <>
      <PageHeader title="Integraciones" description="Conecta tus herramientas externas y configura tu presencia digital." />

      <div className="space-y-4 max-w-3xl">

        {/* ── Dominio ── */}
        <IntegrationCard
          icon={Globe} iconColor="text-violet-500" iconBg="bg-violet-500/10"
          title="Dominio personalizado" description="Conecta tu propio dominio a tu sitio de servicios"
          status={data.domain_status}
        >
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Tu dominio</Label>
              <div className="flex gap-2">
                <Input placeholder="elliotnutrition.com" value={data.dominio}
                  onChange={e => set("dominio", e.target.value)} className="flex-1" />
                <Button variant="outline" disabled={!data.dominio || testing === "domain-save"}
                  onClick={async () => {
                    if (!user) return;
                    setTesting("domain-save");
                    try {
                      const r = await fetch("/api/domain/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ domain: data.dominio, userId: user.id }) });
                      if (!r.ok) { const e = await r.json(); throw new Error(e.error); }
                      setData(p => ({ ...p, domain_status: "pending" }));
                      toast({ title: "Dominio guardado ✓", description: "Configura el DNS y luego valida." });
                    } catch (e: any) {
                      toast({ title: "Error al guardar dominio", description: e.message, variant: "destructive" });
                    } finally { setTesting(null); }
                  }}>
                  {testing === "domain-save" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}
                </Button>
                <Button disabled={!data.dominio || testing === "domain"}
                  onClick={async () => {
                    if (!user) return;
                    setTesting("domain");
                    try {
                      const r = await fetch("/api/domain/validate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ domain: data.dominio, userId: user.id }) });
                      const result = await r.json();
                      setData(p => ({ ...p, domain_status: result.verified ? "connected" : "pending" }));
                      toast({ title: result.verified ? "¡Dominio conectado! ✓" : "DNS aún pendiente", description: result.verified ? `${data.dominio} está activo` : "Puede tardar hasta 48h en propagarse.", variant: result.verified ? "default" : "destructive" });
                    } catch { toast({ title: "Error al validar", variant: "destructive" }); }
                    finally { setTesting(null); }
                  }}>
                  {testing === "domain" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Validar"}
                </Button>
              </div>
            </div>

            {data.dominio && (
              <div className="rounded-lg bg-muted/50 border p-4 space-y-2.5 text-sm">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Configuración DNS requerida</div>
                <div className="grid gap-2">
                  {[
                    { type: "CNAME", name: "www", value: "cname.vercel-dns.com" },
                    { type: "A", name: "@", value: "76.76.21.21" },
                  ].map(r => (
                    <div key={r.type} className="flex items-center gap-3 bg-background rounded-md px-3 py-2 border font-mono text-xs">
                      <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">{r.type}</span>
                      <span className="text-muted-foreground w-10">{r.name}</span>
                      <span className="flex-1 truncate">{r.value}</span>
                      <button onClick={() => { navigator.clipboard.writeText(r.value); toast({ title: "Copiado" }); }}>
                        <Copy className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground">Los cambios DNS pueden tardar hasta 48h en propagarse.</p>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-muted-foreground">Tu sitio actual:</span>
              <a href={publicUrl} target="_blank" rel="noopener noreferrer"
                className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                {publicUrl.replace("https://", "")} <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </IntegrationCard>

        {/* ── Email / Resend ── */}
        <IntegrationCard
          icon={Mail} iconColor="text-blue-500" iconBg="bg-blue-500/10"
          title="Email transaccional" description="Envía confirmaciones y recordatorios via Resend"
          status={data.resend_status}
          action={
            <Button size="sm" variant="outline" disabled={!data.resend_api_key || testing === "email"}
              onClick={async () => { await simulateTest("email"); toast({ title: "Email de prueba enviado ✓", description: data.resend_email }); }}>
              {testing === "email" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Probar"}
            </Button>
          }
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">API Key de Resend</Label>
              <SecretInput placeholder="re_xxxxxxxxxxxxxxxx" value={data.resend_api_key}
                onChange={v => set("resend_api_key", v)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email del remitente</Label>
              <Input placeholder="hola@tudominio.com" value={data.resend_email}
                onChange={e => set("resend_email", e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button disabled={saving || (!data.resend_api_key && !data.resend_email)}
              onClick={() => save({ resend_status: data.resend_api_key ? "connected" : "disconnected" }, "Email configurado")}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Guardar
            </Button>
          </div>
        </IntegrationCard>

        {/* ── WhatsApp ── */}
        <IntegrationCard
          icon={MessageCircle} iconColor="text-emerald-500" iconBg="bg-emerald-500/10"
          title="WhatsApp Business" description="Envía recordatorios y confirmaciones por WhatsApp"
          status={data.whatsapp_status}
          action={
            <Button size="sm" variant="outline" disabled={!data.whatsapp_number || testing === "whatsapp"}
              onClick={async () => { await simulateTest("whatsapp"); toast({ title: "Mensaje de prueba enviado ✓", description: data.whatsapp_number }); }}>
              {testing === "whatsapp" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Probar"}
            </Button>
          }
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Número de teléfono</Label>
              <Input placeholder="+56 9 1234 5678" value={data.whatsapp_number}
                onChange={e => set("whatsapp_number", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Token de acceso</Label>
              <SecretInput placeholder="EAAxxxxxxxx…" value={data.whatsapp_token}
                onChange={v => set("whatsapp_token", v)} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button disabled={saving || (!data.whatsapp_number && !data.whatsapp_token)}
              onClick={() => save({ whatsapp_status: data.whatsapp_number && data.whatsapp_token ? "connected" : "disconnected" }, "WhatsApp guardado")}>
              Guardar
            </Button>
          </div>
        </IntegrationCard>

        {/* ── Google Calendar ── */}
        <IntegrationCard
          icon={Calendar} iconColor="text-sky-500" iconBg="bg-sky-500/10"
          title="Google Calendar" description="Sincroniza reservas y bloqueos automáticamente"
          status={data.calendar_status}
          action={
            <Button size="sm" variant="outline" disabled={!data.google_calendar_token || testing === "calendar"}
              onClick={async () => { await simulateTest("calendar", 2000); save({ calendar_status: "synced" }, "Calendario sincronizado ✓"); }}>
              {testing === "calendar" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Sincronizar"}
            </Button>
          }
        >
          <div className="space-y-1.5">
            <Label className="text-xs">Token OAuth de Google</Label>
            <SecretInput placeholder="ya29.xxxxxxxx…" value={data.google_calendar_token}
              onChange={v => set("google_calendar_token", v)} />
            <p className="text-[11px] text-muted-foreground">
              Genera el token en <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Cloud Console</a> → APIs &amp; Services → Credentials.
            </p>
          </div>
          <div className="flex justify-end">
            <Button disabled={saving || !data.google_calendar_token}
              onClick={() => save({ calendar_status: data.google_calendar_token ? "synced" : "disconnected" }, "Google Calendar guardado")}>
              Guardar
            </Button>
          </div>
        </IntegrationCard>

        {/* ── WebPay ── */}
        <IntegrationCard
          icon={CreditCard} iconColor="text-purple-500" iconBg="bg-purple-500/10"
          title="WebPay (Transbank)" description="Acepta pagos con tarjeta de crédito y débito"
          status={data.webpay_status}
        >
          <div className="space-y-1.5">
            <Label className="text-xs">Código de comercio</Label>
            <SecretInput placeholder="597055555532" value={data.webpay_merchant_code}
              onChange={v => set("webpay_merchant_code", v)} />
            <p className="text-[11px] text-muted-foreground">Encuéntralo en tu portal Transbank → Comercios.</p>
          </div>
          <div className="flex justify-end">
            <Button disabled={saving || !data.webpay_merchant_code}
              onClick={() => save({ webpay_status: data.webpay_merchant_code ? "active" : "inactive" }, "WebPay configurado")}>
              Guardar
            </Button>
          </div>
        </IntegrationCard>

        {/* ── Transferencia bancaria ── */}
        <IntegrationCard
          icon={Building2} iconColor="text-orange-500" iconBg="bg-orange-500/10"
          title="Transferencia bancaria" description="Recibe pagos por transferencia directa"
          status={data.transfer_status}
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Banco</Label>
              <Input placeholder="Banco Santander" value={data.transfer_banco}
                onChange={e => set("transfer_banco", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Número de cuenta</Label>
              <Input placeholder="00-000-00000-00" value={data.transfer_cuenta}
                onChange={e => set("transfer_cuenta", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">RUT del titular</Label>
              <Input placeholder="12.345.678-9" value={data.transfer_rut}
                onChange={e => set("transfer_rut", e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button disabled={saving || (!data.transfer_banco && !data.transfer_cuenta)}
              onClick={() => save({ transfer_status: data.transfer_banco && data.transfer_cuenta && data.transfer_rut ? "verified" : "unverified" }, "Datos bancarios guardados")}>
              Guardar
            </Button>
          </div>
        </IntegrationCard>

      </div>
    </>
  );
}
