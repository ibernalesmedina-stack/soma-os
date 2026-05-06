import { useMemo } from "react";
import { ArrowUpRight, Calendar, CreditCard, Plus, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { listPagos, listReservas } from "@/lib/storage";
import { formatCLP, formatDateTime } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { user } = useAuth();
  const reservas = useMemo(() => (user ? listReservas(user.id) : []), [user]);
  const pagos = useMemo(() => (user ? listPagos(user.id) : []), [user]);

  const ingresos = pagos.filter((p) => p.status === "pagado").reduce((a, b) => a + b.amount, 0);
  const upcoming = reservas.filter((r) => new Date(r.date) >= new Date() && r.status !== "cancelada")
    .sort((a, b) => +new Date(a.date) - +new Date(b.date));
  const recent = [...reservas].sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, 5);

  return (
    <>
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mono">Resumen</p>
          <h1 className="text-2xl font-semibold tracking-tight mt-1">Hola, {user?.name?.split(" ")[0]}</h1>
          <p className="text-sm text-muted-foreground">Aquí tienes el estado actual de tu negocio.</p>
        </div>
        <Button asChild><Link to="/app/reservas"><Plus className="h-4 w-4 mr-1.5" />Nueva reserva</Link></Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Metric icon={Calendar} label="Total reservas" value={String(reservas.length)} delta="+12%" />
        <Metric icon={CreditCard} label="Ingresos" value={formatCLP(ingresos)} delta="+8.4%" />
        <Metric icon={Users} label="Clientes activos" value={String(new Set(reservas.map((r) => r.client_id)).size)} delta="+3" />
        <Metric icon={TrendingUp} label="Próximas citas" value={String(upcoming.length)} delta="hoy" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="surface-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Actividad reciente</h3>
            <Link to="/app/reservas" className="text-xs text-primary hover:underline inline-flex items-center">
              Ver todo <ArrowUpRight className="h-3 w-3 ml-0.5" />
            </Link>
          </div>
          {recent.length === 0 ? (
            <EmptyState message="Sin actividad aún" />
          ) : (
            <ul className="divide-y">
              {recent.map((r) => (
                <li key={r.id} className="py-3 flex items-center gap-3">
                  <div className="size-8 rounded-full bg-primary/10 text-primary text-[11px] font-semibold grid place-items-center">
                    {r.clientName.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{r.clientName}</div>
                    <div className="text-xs text-muted-foreground">{r.serviceName} · {formatDateTime(r.date)}</div>
                  </div>
                  <StatusBadge status={r.status} />
                  <div className="mono text-xs text-muted-foreground hidden sm:block">{formatCLP(r.amount)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="surface-card p-5">
          <h3 className="text-sm font-semibold mb-4">Próximas citas</h3>
          {upcoming.length === 0 ? (
            <EmptyState message="No hay citas programadas" />
          ) : (
            <ul className="space-y-3">
              {upcoming.slice(0, 5).map((r) => (
                <li key={r.id} className="flex items-start gap-3">
                  <div className="text-center w-10 shrink-0">
                    <div className="text-[10px] uppercase text-muted-foreground">{new Date(r.date).toLocaleString("es-CL", { month: "short" })}</div>
                    <div className="text-lg font-semibold leading-none">{new Date(r.date).getDate()}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{r.clientName}</div>
                    <div className="text-xs text-muted-foreground">{r.serviceName}</div>
                    <div className="text-xs text-muted-foreground mono mt-0.5">
                      {new Date(r.date).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t mt-4 pt-4 space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Acciones rápidas</h4>
            <Quick to="/app/reservas" label="Crear reserva" />
            <Quick to="/app/servicios" label="Añadir servicio" />
            <Quick to="/app/pagos" label="Registrar pago" />
          </div>
        </div>
      </div>
    </>
  );
}

function Metric({ icon: Icon, label, value, delta }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; delta: string }) {
  return (
    <div className="stat-tile">
      <div className="flex items-center justify-between">
        <div className="size-8 rounded-md bg-primary/10 text-primary grid place-items-center"><Icon className="h-4 w-4" /></div>
        <span className="text-[11px] mono text-success">{delta}</span>
      </div>
      <div className="mt-3 text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold tracking-tight mt-0.5">{value}</div>
    </div>
  );
}

function Quick({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="flex items-center justify-between text-sm py-2 px-2.5 -mx-2.5 rounded-md hover:bg-muted">
      <span>{label}</span>
      <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
    </Link>
  );
}

function EmptyState({ message }: { message: string }) {
  return <div className="text-center py-10 text-sm text-muted-foreground">{message}</div>;
}
