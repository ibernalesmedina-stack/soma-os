import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { updateUserById } from "@/lib/storage";
import { useAdminUsers } from "@/lib/hooks";
import { metricsForUser, allReservas, allPagos } from "@/lib/admin";
import { BUSINESS_CONFIG } from "@/lib/business";
import { formatCLP, formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { ArrowLeft, DollarSign, Calendar, Activity as ActIcon, Users as UsersIcon } from "lucide-react";
import type { TipoNegocio, SubmoduloCosmetologa } from "@/lib/types";
import { toast } from "@/hooks/use-toast";

const TIPOS: TipoNegocio[] = ["nutricionista", "cosmetologa", "odontologa", "psicologa"];
const SUBMODS: SubmoduloCosmetologa[] = ["piel", "unas", "pestanas"];

export default function AdminClientaDetalle() {
  const { id = "" } = useParams();
  const [v, setV] = useState(0);
  const navigate = useNavigate();

  const { data: allUsers } = useAdminUsers();
  const user = allUsers.find(u => u.id === id);
  if (!user) return <div className="text-center py-16"><p className="text-sm">Clienta no encontrada</p><Link to="/admin/clientas" className="text-primary text-xs">Volver</Link></div>;
  const m = metricsForUser(user.id);
  const cfg = BUSINESS_CONFIG[user.tipoNegocio];

  const reservas = allReservas().filter(r => r.user_id === user.id).slice(-8).reverse();
  const pagos = allPagos().filter(p => p.user_id === user.id).slice(-6).reverse();

  const setTipo = (t: TipoNegocio) => { updateUserById(user.id, { tipoNegocio: t, submodulos: t === "cosmetologa" ? user.submodulos : undefined }); setV(v + 1); toast({ title: "Tipo de negocio actualizado" }); };
  const toggleSub = (s: SubmoduloCosmetologa) => {
    const cur = user.submodulos ?? [];
    const next = cur.includes(s) ? cur.filter(x => x !== s) : [...cur, s];
    updateUserById(user.id, { submodulos: next });
    setV(v + 1);
  };

  return (
    <>
      <Link to="/admin/clientas" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3"><ArrowLeft className="h-3.5 w-3.5" />Volver</Link>
      <PageHeader
        title={user.businessName}
        description={`${user.name} · ${user.email} · ${user.phone || "sin teléfono"}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { impersonate(user.id); window.location.href = "/app"; }}>Entrar como clienta</Button>
            <Button variant={user.active === false ? "default" : "outline"} onClick={() => { updateUserById(user.id, { active: user.active === false }); setV(v + 1); toast({ title: user.active === false ? "Activada" : "Desactivada" }); }}>
              {user.active === false ? "Activar" : "Desactivar"}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Card icon={UsersIcon} label="Pacientes totales" value={String(m.pacientes)} />
        <Card icon={Calendar} label="Reservas mes" value={String(m.reservasMes)} />
        <Card icon={DollarSign} label="Ingresos totales" value={formatCLP(m.ingresosTotal)} />
        <Card icon={ActIcon} label="Última actividad" value={m.ultimaActividad ? formatDateTime(m.ultimaActividad) : "—"} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <section className="surface-card p-5">
          <h3 className="text-sm font-semibold mb-3">Configuración del negocio</h3>
          <div className="space-y-3">
            <div>
              <div className="text-xs text-muted-foreground mb-1.5">Tipo de negocio</div>
              <div className="flex flex-wrap gap-1.5">
                {TIPOS.map(t => (
                  <button key={t} onClick={() => setTipo(t)}
                    className={`text-xs px-2.5 py-1 rounded-md border ${user.tipoNegocio === t ? "border-primary bg-primary/10 text-primary" : "hover:border-foreground/20"}`}>
                    {BUSINESS_CONFIG[t].label}
                  </button>
                ))}
              </div>
            </div>
            {user.tipoNegocio === "cosmetologa" && (
              <div>
                <div className="text-xs text-muted-foreground mb-1.5">Submódulos</div>
                <div className="flex gap-1.5">
                  {SUBMODS.map(s => {
                    const active = (user.submodulos ?? []).includes(s);
                    return (
                      <button key={s} onClick={() => toggleSub(s)}
                        className={`text-xs px-2.5 py-1 rounded-md border capitalize ${active ? "border-primary bg-primary/10 text-primary" : "hover:border-foreground/20"}`}>
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="text-[11px] text-muted-foreground mono">
              Tipo actual: {cfg.label} · Plan: {user.plan}
            </div>
          </div>
        </section>

        <section className="surface-card p-5">
          <h3 className="text-sm font-semibold mb-3">Actividad reciente</h3>
          {reservas.length === 0 ? <p className="text-sm text-muted-foreground py-4">Sin reservas.</p> : (
            <ul className="divide-y text-sm">
              {reservas.map(r => (
                <li key={r.id} className="py-2 flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-primary" />
                  <span className="flex-1 truncate">{r.clientName} · <span className="text-muted-foreground">{r.serviceName}</span></span>
                  <span className="text-[11px] mono text-muted-foreground">{formatDateTime(r.date)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="surface-card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold mb-3">Últimos pagos</h3>
          {pagos.length === 0 ? <p className="text-sm text-muted-foreground py-4">Sin pagos.</p> : (
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="text-left py-2">Fecha</th><th className="text-left py-2">Cliente</th><th className="text-left py-2">Método</th><th className="text-left py-2">Estado</th><th className="text-right py-2">Monto</th></tr>
              </thead>
              <tbody>
                {pagos.map(p => (
                  <tr key={p.id} className="border-t">
                    <td className="py-2 mono text-xs">{formatDateTime(p.date)}</td>
                    <td className="py-2">{p.clientName}</td>
                    <td className="py-2 text-xs text-muted-foreground">{p.method}</td>
                    <td className="py-2 text-xs capitalize">{p.status}</td>
                    <td className="py-2 text-right mono">{formatCLP(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
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
      <div className="text-base font-semibold tracking-tight mt-1">{value}</div>
    </div>
  );
}
