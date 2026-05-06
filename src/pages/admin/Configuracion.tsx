import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSettings, saveSettings, type AdminSettings } from "@/lib/admin-store";
import { CreditCard, MessageSquare, KeyRound, DollarSign, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function AdminConfiguracion() {
  const [s, setS] = useState<AdminSettings>(getSettings());

  const save = () => {
    saveSettings(s);
    toast({ title: "Configuración guardada" });
  };

  const set = <K extends keyof AdminSettings>(k: K, v: AdminSettings[K]) => setS({ ...s, [k]: v });

  return (
    <>
      <PageHeader
        title="Configuración"
        description="APIs, integraciones y precios de planes."
        actions={<Button onClick={save}><Save className="h-4 w-4 mr-1.5" />Guardar todo</Button>}
      />

      <div className="grid lg:grid-cols-2 gap-4">
        <Section icon={CreditCard} title="WebPay (Transbank)" desc="Credenciales para procesar pagos con WebPay Plus.">
          <Field label="API Key" value={s.webpayApiKey} onChange={v => set("webpayApiKey", v)} type="password" />
          <Field label="Código de comercio" value={s.webpayCommerceCode} onChange={v => set("webpayCommerceCode", v)} />
        </Section>

        <Section icon={CreditCard} title="Transferencia bancaria" desc="Datos que se muestran al cliente al pagar.">
          <Field label="Banco" value={s.transferenciaBanco} onChange={v => set("transferenciaBanco", v)} />
          <Field label="Cuenta" value={s.transferenciaCuenta} onChange={v => set("transferenciaCuenta", v)} />
          <Field label="RUT titular" value={s.transferenciaRut} onChange={v => set("transferenciaRut", v)} />
        </Section>

        <Section icon={MessageSquare} title="WhatsApp Cloud API" desc="Enviar recordatorios y confirmaciones automáticas.">
          <Field label="API Key / Access Token" value={s.whatsappApiKey} onChange={v => set("whatsappApiKey", v)} type="password" />
          <Field label="Phone Number ID" value={s.whatsappPhoneId} onChange={v => set("whatsappPhoneId", v)} />
        </Section>

        <Section icon={KeyRound} title="Meta App" desc="Credenciales de la aplicación de Meta para Business APIs.">
          <Field label="App ID" value={s.metaAppId} onChange={v => set("metaAppId", v)} />
          <Field label="App Secret" value={s.metaAppSecret} onChange={v => set("metaAppSecret", v)} type="password" />
        </Section>

        <Section icon={DollarSign} title="Planes y precios" desc="Edita los montos mensuales de los planes." className="lg:col-span-2">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Plan Basic (CLP / mes)" value={String(s.pricing.basic)} type="number" onChange={v => set("pricing", { ...s.pricing, basic: Number(v) || 0 })} />
            <Field label="Plan Clinic (CLP / mes)" value={String(s.pricing.clinic)} type="number" onChange={v => set("pricing", { ...s.pricing, clinic: Number(v) || 0 })} />
          </div>
        </Section>
      </div>
    </>
  );
}

function Section({ icon: Icon, title, desc, children, className }: { icon: React.ElementType; title: string; desc: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`surface-card p-5 ${className || ""}`}>
      <div className="flex items-start gap-3 mb-4">
        <div className="size-8 rounded-md bg-primary/10 text-primary grid place-items-center"><Icon className="h-4 w-4" /></div>
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs">{label}</Label>
      <Input type={type} value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}
