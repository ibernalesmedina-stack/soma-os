import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { listAutomations, toggleAutomation } from "@/lib/storage";
import type { Automation } from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";
import { Switch } from "@/components/ui/switch";
import { PLAN_FEATURES } from "@/lib/plans";
import { PlanLocked } from "@/components/PlanLocked";
import { Mail, MessageCircle } from "lucide-react";

export default function Automatizaciones() {
  const { user } = useAuth();
  const [items, setItems] = useState<Automation[]>([]);
  useEffect(() => { if (user) setItems(listAutomations(user.id)); }, [user]);
  if (user && !PLAN_FEATURES[user.plan].automations) return <PlanLocked plan="Pro" feature="Automatizaciones" />;

  const onToggle = (id: string) => {
    toggleAutomation(id);
    if (user) setItems(listAutomations(user.id));
  };

  return (
    <>
      <PageHeader title="Automatizaciones" description="Activa flujos para que el negocio funcione solo." />
      <div className="space-y-3">
        {items.map((a) => (
          <div key={a.id} className="surface-card p-5 flex items-center gap-4">
            <div className="size-10 rounded-md bg-primary/10 text-primary grid place-items-center gap-0.5 flex">
              <MessageCircle className="h-3.5 w-3.5" />
              <Mail className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1">
              <div className="font-medium">{a.name}</div>
              <div className="text-xs text-muted-foreground">{a.description}</div>
            </div>
            <span className="text-[10px] uppercase tracking-wider mono text-muted-foreground">whatsapp + email</span>
            <Switch checked={a.enabled} onCheckedChange={() => onToggle(a.id)} />
          </div>
        ))}
      </div>
    </>
  );
}
