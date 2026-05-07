import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Globe, Copy, ExternalLink, CreditCard, Plug } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Configuracion() {
  const { user, update } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [businessName, setBusinessName] = useState(user?.businessName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");

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

        {/* Integraciones — link a página dedicada */}
        <section className="surface-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <Plug className="h-4 w-4" /> Integraciones
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                WhatsApp, Google Calendar, WebPay, Email y dominio personalizado.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/app/integraciones">Configurar →</Link>
            </Button>
          </div>
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
