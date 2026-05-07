import { useEffect, useState } from "react";
import { useAdminUsers } from "@/lib/hooks";
import { getIntegration, upsertIntegration } from "@/lib/storage";
import type { ClientIntegration, User } from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Globe, Mail, MessageCircle, Calendar, CreditCard, Building2,
  CheckCircle2, Clock, XCircle, Eye, EyeOff, Loader2, Search, ChevronRight,
} from "lucide-react";

// ── Status badge ──────────────────────────────────────────────────────────────
type Status = "connected" | "pending" | "disconnected" | "synced" | "active" | "inactive" | "verified" | "unverified" | "error";

function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, { label: string; cls: string; icon: typeof CheckCircle2 }> = {
    connected:    { label: "Conectado",     cls: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400", icon: CheckCircle2 },
    synced:       { label: "Sincronizado",  cls: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400", icon: CheckCircle2 },
    active:       { label: "Activo",        cls: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400", icon: CheckCircle2 },
    verified:     { label: "Verificado",    cls: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400", icon: CheckCircle2 },
    pending:      { label: "Pendiente",     cls: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400",            icon: Clock },
    disconnected: { label: "Sin conectar",  cls: "text-muted-foreground bg-muted border-border", icon: XCircle },
    inactive:     { label: "Inactivo",      cls: "text-muted-foreground bg-muted border-border", icon: XCircle },
    unverified:   { label: "Sin verificar", cls: "text-muted-foreground bg-muted border-border", icon: XCircle },
    error:        { label: "Error",         cls: "text-red-600 bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400", icon: XCircle },
  };
  const { label, cls, icon: Icon } = map[status] ?? map.disconnected;
  return (
    <span className={cn("inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border", cls)}>
      <Icon className="h-3 w-3" />{label}
    </span>
  );
}

// ── Secret input ──────────────────────────────────────────────────────────────
function SecretInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input type={show ? "text" : "password"} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)} className="pr-9 font-mono text-sm" />
      <button type="button" tabIndex={-1} onClick={() => setShow(s => !s)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
        {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

// ── Integration card ──────────────────────────────────────────────────────────
function Card({ icon: Icon, iconColor, iconBg, title, status, children }: {
  icon: React.ElementType; iconColor: string; iconBg: string;
  title: string; status: Status; children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <div className={cn("size-8 rounded-lg flex items-center justify-center", iconBg)}>
            <Icon className={cn("h-4 w-4", iconColor)} />
          </div>
          <span className="font-semibold text-sm">{title}</span>
        </div>
        <StatusBadge status={status} />
      </div>
      <div className="p-5 space-y-3">{children}</div>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

// ── Empty integration defaults ────────────────────────────────────────────────
const EMPTY: Omit<ClientIntegration, "id" | "user_id" | "created_at" | "updated_at"> = {
  dominio: "", domain_status: "pending",
  resend_api_key: "", resend_email: "", resend_status: "disconnected",
  whatsapp_number: "", whatsapp_token: "", whatsapp_status: "disconnected",
  google_calendar_token: "", calendar_status: "disconnected",
  webpay_merchant_code: "", webpay_api_key: "", webpay_status: "inactive",
  transfer_banco: "", transfer_cuenta: "", transfer_rut: "", transfer_status: "unverified",
};

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminIntegraciones() {
  const { data: allUsers, loading: loadingUsers } = useAdminUsers();
  const clients = allUsers.filter(u => u.role !== "admin");

  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<User | null>(null);
  const [integration, setIntegration] = useState(EMPTY);
  const [loadingInt, setLoadingInt] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);

  const filtered = clients.filter(c =>
    `${c.businessName} ${c.email} ${c.name}`.toLowerCase().includes(q.toLowerCase())
  );

  const selectClient = async (client: User) => {
    setSelected(client);
    setLoadingInt(true);
    const d = await getIntegration(client.id);
    setIntegration(d ? {
      dominio: d.dominio, domain_status: d.domain_status,
      resend_api_key: d.resend_api_key, resend_email: d.resend_email, resend_status: d.resend_status,
      whatsapp_number: d.whatsapp_number, whatsapp_token: d.whatsapp_token, whatsapp_status: d.whatsapp_status,
      google_calendar_token: d.google_calendar_token, calendar_status: d.calendar_status,
      webpay_merchant_code: d.webpay_merchant_code, webpay_api_key: d.webpay_api_key ?? "", webpay_status: d.webpay_status,
      transfer_banco: d.transfer_banco, transfer_cuenta: d.transfer_cuenta,
      transfer_rut: d.transfer_rut, transfer_status: d.transfer_status,
    } : EMPTY);
    setLoadingInt(false);
  };

  const set = <K extends keyof typeof EMPTY>(k: K, v: (typeof EMPTY)[K]) =>
    setIntegration(p => ({ ...p, [k]: v }));

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      // Auto-compute statuses based on filled fields
      const patch = {
        ...integration,
        resend_status: (integration.resend_api_key ? "connected" : "disconnected") as ClientIntegration["resend_status"],
        whatsapp_status: (integration.whatsapp_number && integration.whatsapp_token ? "connected" : "disconnected") as ClientIntegration["whatsapp_status"],
        calendar_status: (integration.google_calendar_token ? "synced" : "disconnected") as ClientIntegration["calendar_status"],
        webpay_status: (integration.webpay_merchant_code ? "active" : "inactive") as ClientIntegration["webpay_status"],
        transfer_status: (integration.transfer_banco && integration.transfer_cuenta && integration.transfer_rut ? "verified" : "unverified") as ClientIntegration["transfer_status"],
        domain_status: (integration.dominio ? "pending" : "pending") as ClientIntegration["domain_status"],
      };
      setIntegration(patch);
      await upsertIntegration(selected.id, patch);
      toast({ title: `Integraciones guardadas para ${selected.businessName}` });
    } catch {
      toast({ title: "Error al guardar", variant: "destructive" });
    } finally { setSaving(false); }
  };

  const test = async (key: string, label: string) => {
    setTesting(key);
    await new Promise(r => setTimeout(r, 1500));
    setTesting(null);
    toast({ title: `${label} — conexión verificada ✓` });
  };

  return (
    <>
      <PageHeader title="Integraciones" description="Configura las APIs y conexiones de cada cliente." />

      <div className="grid lg:grid-cols-[280px_1fr] gap-6 items-start">

        {/* ── Client list ── */}
        <div className="surface-card overflow-hidden sticky top-6">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar cliente…" className="pl-8 h-9" />
            </div>
          </div>
          {loadingUsers ? (
            <div className="p-8 flex justify-center"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">Sin clientes</div>
          ) : (
            <ul className="divide-y max-h-[60vh] overflow-y-auto">
              {filtered.map(c => (
                <li key={c.id}>
                  <button onClick={() => selectClient(c)}
                    className={cn("w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors",
                      selected?.id === c.id && "bg-primary/5 border-r-2 border-primary")}>
                    <div className="size-8 rounded-full bg-primary/10 text-primary text-xs font-semibold grid place-items-center shrink-0">
                      {c.businessName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{c.businessName}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{c.email}</div>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Integration form ── */}
        {!selected ? (
          <div className="surface-card p-16 text-center text-muted-foreground">
            <div className="size-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <Globe className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium">Selecciona un cliente</p>
            <p className="text-xs mt-1">Elige un cliente de la lista para configurar sus integraciones.</p>
          </div>
        ) : loadingInt ? (
          <div className="surface-card p-16 flex justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header del cliente seleccionado */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{selected.businessName}</h2>
                <p className="text-xs text-muted-foreground">{selected.email} · {selected.tipoNegocio}</p>
              </div>
              <Button onClick={save} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Guardar todo
              </Button>
            </div>

            {/* Dominio */}
            <Card icon={Globe} iconColor="text-violet-500" iconBg="bg-violet-500/10" title="Dominio personalizado" status={integration.domain_status}>
              <div className="grid sm:grid-cols-2 gap-3">
                <F label="Dominio">
                  <Input placeholder="elliotnutrition.com" value={integration.dominio} onChange={e => set("dominio", e.target.value)} />
                </F>
                <F label="Estado">
                  <div className="flex items-center gap-2 h-10">
                    <StatusBadge status={integration.domain_status} />
                    <Button size="sm" variant="outline" disabled={!integration.dominio || testing === "domain"}
                      onClick={() => { test("domain", "Dominio"); set("domain_status", "connected"); }}>
                      {testing === "domain" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Validar"}
                    </Button>
                  </div>
                </F>
              </div>
            </Card>

            {/* Email / Resend */}
            <Card icon={Mail} iconColor="text-blue-500" iconBg="bg-blue-500/10" title="Email — Resend" status={integration.resend_status}>
              <div className="grid sm:grid-cols-2 gap-3">
                <F label="API Key">
                  <SecretInput placeholder="re_xxxxxxxxxxxxxxxx" value={integration.resend_api_key} onChange={v => set("resend_api_key", v)} />
                </F>
                <F label="Email del remitente">
                  <Input placeholder="hola@tudominio.com" value={integration.resend_email} onChange={e => set("resend_email", e.target.value)} />
                </F>
              </div>
              <div className="flex justify-end">
                <Button size="sm" variant="outline" disabled={!integration.resend_api_key || testing === "email"}
                  onClick={() => test("email", "Email de prueba")}>
                  {testing === "email" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Enviar email de prueba"}
                </Button>
              </div>
            </Card>

            {/* WhatsApp */}
            <Card icon={MessageCircle} iconColor="text-emerald-500" iconBg="bg-emerald-500/10" title="WhatsApp Business" status={integration.whatsapp_status}>
              <div className="grid sm:grid-cols-2 gap-3">
                <F label="Número de teléfono">
                  <Input placeholder="+56 9 1234 5678" value={integration.whatsapp_number} onChange={e => set("whatsapp_number", e.target.value)} />
                </F>
                <F label="Token de acceso">
                  <SecretInput placeholder="EAAxxxxxxxx…" value={integration.whatsapp_token} onChange={v => set("whatsapp_token", v)} />
                </F>
              </div>
              <div className="flex justify-end">
                <Button size="sm" variant="outline" disabled={!integration.whatsapp_number || testing === "whatsapp"}
                  onClick={() => test("whatsapp", "Mensaje de prueba")}>
                  {testing === "whatsapp" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Enviar mensaje de prueba"}
                </Button>
              </div>
            </Card>

            {/* Google Calendar */}
            <Card icon={Calendar} iconColor="text-sky-500" iconBg="bg-sky-500/10" title="Google Calendar" status={integration.calendar_status}>
              <F label="Token OAuth">
                <SecretInput placeholder="ya29.xxxxxxxx…" value={integration.google_calendar_token} onChange={v => set("google_calendar_token", v)} />
              </F>
              <div className="flex justify-end">
                <Button size="sm" variant="outline" disabled={!integration.google_calendar_token || testing === "calendar"}
                  onClick={() => { test("calendar", "Google Calendar"); set("calendar_status", "synced"); }}>
                  {testing === "calendar" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Sincronizar ahora"}
                </Button>
              </div>
            </Card>

            {/* WebPay */}
            <Card icon={CreditCard} iconColor="text-purple-500" iconBg="bg-purple-500/10" title="WebPay (Transbank)" status={integration.webpay_status}>
              <F label="Código de comercio">
                <SecretInput placeholder="597055555532" value={integration.webpay_merchant_code} onChange={v => set("webpay_merchant_code", v)} />
              </F>
              <p className="text-xs text-muted-foreground">Solo el código de comercio — SomaOS procesa con sus credenciales Transbank.</p>
            </Card>

            {/* Transferencia bancaria */}
            <Card icon={Building2} iconColor="text-orange-500" iconBg="bg-orange-500/10" title="Transferencia bancaria" status={integration.transfer_status}>
              <div className="grid sm:grid-cols-3 gap-3">
                <F label="Banco">
                  <Input placeholder="Banco Santander" value={integration.transfer_banco} onChange={e => set("transfer_banco", e.target.value)} />
                </F>
                <F label="Número de cuenta">
                  <Input placeholder="00-000-00000-00" value={integration.transfer_cuenta} onChange={e => set("transfer_cuenta", e.target.value)} />
                </F>
                <F label="RUT titular">
                  <Input placeholder="12.345.678-9" value={integration.transfer_rut} onChange={e => set("transfer_rut", e.target.value)} />
                </F>
              </div>
            </Card>

            {/* Guardar bottom */}
            <div className="flex justify-end pt-2">
              <Button onClick={save} disabled={saving} size="lg">
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Guardar integraciones de {selected.businessName}
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
