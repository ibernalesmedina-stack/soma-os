import { PageHeader } from "@/components/PageHeader";
import { allReservas, globalMetrics, recentActivity } from "@/lib/admin";
import { formatDateTime } from "@/lib/format";
import { Activity, Calendar, MessageCircle, UserCheck, AlertTriangle } from "lucide-react";
import { getUsers } from "@/lib/storage";

export default function AdminActividad() {
  const m = globalMetrics();
  const events = recentActivity(20);
  // Mock: mensajes enviados ≈ reservas confirmadas; errores = pagos fallidos
  const mensajes = allReservas().filter(r => r.status === "confirmada").length;
  const usuariosConWhatsapp = getUsers().filter(u => u.whatsappNumber).length;

  return (
    <>
      <PageHeader title="Actividad" description="Uso de la plataforma." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Card icon={Calendar} label="Reservas totales" value={String(m.reservasTotales)} />
        <Card icon={MessageCircle} label="Mensajes enviados" value={String(mensajes)} />
        <Card icon={UserCheck} label="Usuarios activos" value={String(m.usuariosActivos)} />
        <Card icon={AlertTriangle} label="Errores / fallos" value={String(m.pagosFallidos)} />
      </div>

      <div className="surface-card p-5">
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><Activity className="h-4 w-4" />Últimos eventos</h3>
        <p className="text-[11px] text-muted-foreground mb-3 mono">{usuariosConWhatsapp} clientas con WhatsApp conectado</p>
        <ul className="divide-y">
          {events.map((e, i) => (
            <li key={i} className="py-2 flex items-center gap-3 text-sm">
              <span className={`size-2 rounded-full ${e.kind === "pago" ? "bg-success" : e.kind === "reserva" ? "bg-primary" : "bg-warning"}`} />
              <span className="flex-1">{e.text}</span>
              <span className="text-[11px] mono text-muted-foreground">{formatDateTime(e.ts)}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function Card({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="surface-card p-4">
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="text-xl font-semibold tracking-tight mt-1">{value}</div>
    </div>
  );
}
