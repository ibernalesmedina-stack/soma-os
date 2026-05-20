import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useAutomations } from "@/lib/hooks";
import { toggleAutomation, listEmailLogs } from "@/lib/storage";
import type { EmailLog } from "@/lib/storage";
import { PageHeader } from "@/components/PageHeader";
import { Switch } from "@/components/ui/switch";
import { PLAN_FEATURES } from "@/lib/plans";
import { PlanLocked } from "@/components/PlanLocked";
import { Mail, MessageCircle, CheckCircle2, XCircle, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const TEMPLATE_LABELS: Record<string, { label: string; color: string }> = {
  confirmacion:     { label: "Confirmación",    color: "bg-primary/10 text-primary" },
  recordatorio_24h: { label: "Recordatorio 24h", color: "bg-sky-500/10 text-sky-600" },
  review_15d:       { label: "Review 15 días",   color: "bg-amber-500/10 text-amber-600" },
  prueba:           { label: "Prueba",            color: "bg-muted text-muted-foreground" },
};

export default function Automatizaciones() {
  const { user } = useAuth();
  const { data: items, refetch } = useAutomations();
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user) return;
    listEmailLogs(user.id).then((l) => { setLogs(l); setLoadingLogs(false); });
  }, [user]);

  const reload = async () => {
    if (!user) return;
    setRefreshing(true);
    const l = await listEmailLogs(user.id);
    setLogs(l);
    setRefreshing(false);
  };

  if (user && !PLAN_FEATURES[user.plan].automations) return <PlanLocked plan="Pro" feature="Automatizaciones" />;

  const onToggle = async (id: string) => { await toggleAutomation(id); refetch(); };

  const sentToday = logs.filter(l => new Date(l.createdAt).toDateString() === new Date().toDateString() && l.status === "sent").length;
  const failedTotal = logs.filter(l => l.status === "failed").length;

  return (
    <>
      <PageHeader title="Automatizaciones" description="Flujos automáticos de email y WhatsApp." />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="surface-card p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Enviados hoy</div>
          <div className="text-2xl font-semibold mt-1">{sentToday}</div>
        </div>
        <div className="surface-card p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Total en logs</div>
          <div className="text-2xl font-semibold mt-1">{logs.length}</div>
        </div>
        <div className="surface-card p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Fallidos</div>
          <div className={cn("text-2xl font-semibold mt-1", failedTotal > 0 && "text-destructive")}>{failedTotal}</div>
        </div>
      </div>

      {/* Flows */}
      <div className="space-y-3 mb-8">
        {items.map((a) => (
          <div key={a.id} className="surface-card p-5 flex items-center gap-4">
            <div className="size-10 rounded-md bg-primary/10 text-primary flex flex-col items-center justify-center gap-0.5 shrink-0">
              <MessageCircle className="h-3.5 w-3.5" />
              <Mail className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium">{a.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{a.description}</div>
            </div>
            <span className="text-[10px] uppercase tracking-wider mono text-muted-foreground hidden sm:block shrink-0">WhatsApp + Email</span>
            <Switch checked={a.enabled} onCheckedChange={() => onToggle(a.id)} />
          </div>
        ))}
      </div>

      {/* Email info box */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 mb-6 text-sm space-y-1">
        <div className="font-medium flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />Envío automático diario — 9:00 AM (Chile)</div>
        <ul className="text-xs text-muted-foreground space-y-0.5 pl-6 list-disc">
          <li><strong className="text-foreground">Recordatorio 24h:</strong> se envía a pacientes con cita en las próximas 24 horas</li>
          <li><strong className="text-foreground">Review 15 días:</strong> se envía a nuevos pacientes 15 días después de su primera sesión</li>
          <li><strong className="text-foreground">Confirmación:</strong> se envía en el momento en que se crea la reserva</li>
          <li>Configura tu email en <strong className="text-foreground">Integraciones → Email</strong> para que los envíos salgan desde tu dirección</li>
        </ul>
      </div>

      {/* Email logs */}
      <div className="surface-card overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-sm font-semibold">Registro de emails enviados</h3>
          <Button variant="ghost" size="sm" onClick={reload} disabled={refreshing}>
            <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", refreshing && "animate-spin")} />
            Actualizar
          </Button>
        </div>

        {loadingLogs ? (
          <div className="p-10 text-center text-sm text-muted-foreground animate-pulse">Cargando logs…</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="h-8 w-8 mx-auto text-muted-foreground mb-2 opacity-40" />
            <p className="text-sm font-medium">Sin emails aún</p>
            <p className="text-xs text-muted-foreground mt-1">Los emails enviados automáticamente aparecerán aquí.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[540px]">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-4 py-2.5">Tipo</th>
                  <th className="text-left font-medium px-4 py-2.5">Destinatario</th>
                  <th className="text-left font-medium px-4 py-2.5">Fecha</th>
                  <th className="text-center font-medium px-4 py-2.5">Estado</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const meta = TEMPLATE_LABELS[log.templateId] ?? { label: log.templateId, color: "bg-muted text-muted-foreground" };
                  return (
                    <tr key={log.id} className="border-t hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full", meta.color)}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{log.toEmail}</td>
                      <td className="px-4 py-3 mono text-xs">{formatDateTime(log.createdAt)}</td>
                      <td className="px-4 py-3 text-center">
                        {log.status === "sent" ? (
                          <CheckCircle2 className="h-4 w-4 text-success inline-block" />
                        ) : (
                          <span title={log.error ?? "Error desconocido"}>
                            <XCircle className="h-4 w-4 text-destructive inline-block" />
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
