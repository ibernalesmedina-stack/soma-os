import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CalendarCheck2, MessageCircle, CreditCard, ShieldCheck, Globe, Copy, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

export default function Configuracion() {
  const { user, update } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [businessName, setBusinessName] = useState(user?.businessName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [whatsappNumber, setWhatsappNumber] = useState(user?.whatsappNumber ?? "");
  const [domain, setDomain] = useState(user?.domain ?? "");

  if (!user) return null;
  const pm = user.paymentMethods ?? { webpay: true, transferencia: true };

  return (
    <>
      <PageHeader title="Configuración" description="Información personal, integraciones y medios de pago." />

      <div className="space-y-6 max-w-3xl">
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

        <section className="surface-card p-6">
          <h3 className="font-semibold flex items-center gap-2"><CalendarCheck2 className="h-4 w-4" />Integraciones</h3>
          <p className="text-xs text-muted-foreground mb-4">Conecta servicios externos.</p>
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <div className="text-sm font-medium">Google Calendar</div>
              <div className="text-xs text-muted-foreground">Sincroniza reservas y bloqueos automáticamente.</div>
            </div>
            <Button
              variant={user.googleCalendarConnected ? "outline" : "default"}
              onClick={() => {
                update({ googleCalendarConnected: !user.googleCalendarConnected });
                toast({ title: user.googleCalendarConnected ? "Desconectado" : "Conectado a Google Calendar" });
              }}
            >
              {user.googleCalendarConnected ? "Desconectar" : "Conectar"}
            </Button>
          </div>
        </section>

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

        <section className="surface-card p-6">
          <h3 className="font-semibold flex items-center gap-2"><MessageCircle className="h-4 w-4" />WhatsApp</h3>
          <p className="text-xs text-muted-foreground mb-4">Conecta tu número para enviar recordatorios.</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              className="flex-1"
              placeholder="+56 9 1234 5678"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
            />
            <Button
              onClick={() => {
                if (!whatsappNumber.trim()) return toast({ title: "Ingresa un número válido" });
                update({ whatsappNumber: whatsappNumber.trim() });
                toast({ title: "WhatsApp conectado", description: whatsappNumber.trim() });
              }}
            >
              {user.whatsappNumber ? "Actualizar número" : "Conectar"}
            </Button>
          </div>
          {user.whatsappNumber && (
            <p className="text-[11px] text-muted-foreground mono mt-2">Número activo: {user.whatsappNumber}</p>
          )}
        </section>

        <section className="surface-card p-6">
          <h3 className="font-semibold flex items-center gap-2"><Globe className="h-4 w-4" />Sitio público</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Tu página de servicios pública. Compártela con tus clientes — se actualiza automáticamente cuando editas tus servicios.
          </p>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Dominio personalizado</Label>
              <div className="flex gap-2">
                <Input
                  className="flex-1"
                  placeholder="tu-negocio.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                />
                <Button
                  onClick={async () => {
                    await update({ domain: domain.trim() });
                    toast({ title: "Dominio guardado" });
                  }}
                >
                  Guardar
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">Opcional — para cuando configures un dominio propio.</p>
            </div>

            <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tu sitio de servicios</div>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-background border rounded px-2 py-1.5 truncate">
                  {window.location.origin}/s/{user.id}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/s/${user.id}`);
                    toast({ title: "Link copiado" });
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" asChild>
                  <a href={`/s/${user.id}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Los servicios que actives en <Link to="/app/servicios" className="text-primary hover:underline">Servicios</Link> aparecen aquí en tiempo real.
              </p>
            </div>
          </div>
        </section>

        <section className="surface-card p-6">
          <h3 className="font-semibold flex items-center gap-2"><ShieldCheck className="h-4 w-4" />Modo demo</h3>
          <p className="text-xs text-muted-foreground mb-4">Acceso al panel de administración para la demo.</p>
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <div className="text-sm font-medium">Rol actual: <span className="mono">{user.role}</span></div>
              <div className="text-xs text-muted-foreground">Conviértete en admin para ver el panel /admin.</div>
            </div>
            <div className="flex gap-2">
              {user.role !== "admin" ? (
                <Button onClick={() => { update({ role: "admin" }); toast({ title: "Ahora eres admin" }); }}>
                  Hacerme admin
                </Button>
              ) : (
                <Button variant="outline" onClick={() => { update({ role: "user" }); toast({ title: "Rol restablecido" }); }}>
                  Quitar admin
                </Button>
              )}
              {user.role === "admin" && (
                <Button asChild><Link to="/admin">Ir al panel admin</Link></Button>
              )}
            </div>
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
