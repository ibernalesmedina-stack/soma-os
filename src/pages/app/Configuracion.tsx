import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { getIntegration, saveClientEmail, saveWebPayConfig } from "@/lib/storage";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Globe, Copy, ExternalLink, CreditCard, Mail, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Configuracion() {
  const { user, update } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [businessName, setBusinessName] = useState(user?.businessName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [notifEmail, setNotifEmail] = useState("");
  const [emailSaved, setEmailSaved] = useState(false);
  const [emailSaving, setEmailSaving] = useState(false);
  const [wpCode, setWpCode] = useState("");
  const [wpSaved, setWpSaved] = useState(false);
  const [wpSaving, setWpSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    getIntegration(user.id).then((i) => {
      if (i?.resend_email) { setNotifEmail(i.resend_email); setEmailSaved(true); }
      if (i?.webpay_merchant_code) { setWpCode(i.webpay_merchant_code); setWpSaved(true); }
    });
  }, [user]);

  if (!user) return null;
  const pm = user.paymentMethods ?? { webpay: true, transferencia: true };
  const publicUrl = `${window.location.origin}/s/${user.id}`;

  return (
    <>
      <PageHeader title="Configuración" description="Perfil, medios de pago y sitio público." />

      <div className="space-y-6 max-w-3xl">

        {/* Información personal */}
        <section className="surface-card p-6">
          <h3 className="font-semibold">Información personal</h3>
          <p className="text-xs text-muted-foreground mb-4">Datos visibles en tu workspace.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Nombre del negocio</Label>
              <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Tu nombre</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={user.email} disabled />
            </div>
            <div className="space-y-1.5">
              <Label>Teléfono de contacto</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+56 9 …" />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => { update({ name, businessName, phone }); toast({ title: "Perfil actualizado" }); }}>
              Guardar cambios
            </Button>
          </div>
        </section>

        {/* Email de notificaciones */}
        <section className="surface-card p-6">
          <h3 className="font-semibold flex items-center gap-2">
            <Mail className="h-4 w-4" /> Email de notificaciones
          </h3>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Los recordatorios y confirmaciones a tus clientes se envían desde este email.
          </p>
          <div className="flex gap-3 items-end">
            <div className="flex-1 space-y-1.5">
              <Label>Tu email de negocio</Label>
              <div className="relative">
                <Input
                  type="email"
                  value={notifEmail}
                  onChange={(e) => { setNotifEmail(e.target.value); setEmailSaved(false); }}
                  placeholder="hola@tunegocio.com"
                />
                {emailSaved && (
                  <CheckCircle2 className="absolute right-2.5 top-2.5 h-4 w-4 text-emerald-500" />
                )}
              </div>
            </div>
            <Button
              disabled={emailSaving || !notifEmail.includes("@")}
              onClick={async () => {
                setEmailSaving(true);
                try {
                  await saveClientEmail(user.id, notifEmail.trim());
                  setEmailSaved(true);
                  toast({ title: "Email guardado ✓", description: "Tus notificaciones usarán este email." });
                } catch {
                  toast({ title: "Error al guardar", variant: "destructive" });
                } finally {
                  setEmailSaving(false);
                }
              }}
            >
              {emailSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}
            </Button>
          </div>
          {emailSaved && (
            <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Activo — los emails de tus clientes llegan desde {notifEmail}
            </p>
          )}
        </section>

        {/* WebPay */}
        <section className="surface-card p-6">
          <h3 className="font-semibold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> WebPay
          </h3>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Ingresa tus credenciales de Transbank. Los pagos de tus clientes van directo a tu cuenta.
          </p>
          <div className="flex gap-3 items-end">
            <div className="flex-1 space-y-1.5">
              <Label>Código de comercio Transbank</Label>
              <div className="relative">
                <Input
                  value={wpCode}
                  onChange={(e) => { setWpCode(e.target.value); setWpSaved(false); }}
                  placeholder="597055555532"
                  className="font-mono"
                />
                {wpSaved && <CheckCircle2 className="absolute right-2.5 top-2.5 h-4 w-4 text-emerald-500" />}
              </div>
            </div>
            <Button
              disabled={wpSaving || !wpCode.trim()}
              onClick={async () => {
                setWpSaving(true);
                try {
                  await saveWebPayConfig(user.id, wpCode.trim(), "");
                  setWpSaved(true);
                  toast({ title: "WebPay activado ✓", description: "Los pagos de tus clientes van directo a tu cuenta Transbank." });
                } catch {
                  toast({ title: "Error al guardar", variant: "destructive" });
                } finally {
                  setWpSaving(false);
                }
              }}
            >
              {wpSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}
            </Button>
          </div>
          {wpSaved ? (
            <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Activo — los pagos van directo a tu cuenta Transbank
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-2">
              Lo encuentras en el portal de Transbank → Mi cuenta → Código de comercio.
            </p>
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
            Tu página de servicios — se actualiza en tiempo real cuando editas tus servicios.
          </p>
          <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tu URL</div>
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
