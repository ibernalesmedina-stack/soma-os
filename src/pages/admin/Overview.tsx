import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { globalMetrics, PLAN_PRICE } from "@/lib/admin";
import { ingresosUltimos12Meses, tasaRetencion } from "@/lib/admin-store";
import { formatCLP, formatDate } from "@/lib/format";
import { DollarSign, TrendingUp, UserCheck, Users, Percent } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PLAN_LABEL } from "@/lib/plans";
import { useAdminUsers } from "@/lib/hooks";

export default function AdminOverview() {
  const { data: allUsers, loading } = useAdminUsers();
  const users = allUsers.filter(u => u.role !== "admin");
  const m = globalMetrics(allUsers);
  const retencion = tasaRetencion(users);

  // Genera pagos sintéticos basados en plan × fecha de alta para el gráfico de ingresos
  const syntheticPagos = users
    .filter(u => u.active !== false)
    .map(u => ({
      date: u.createdAt,
      amount: PLAN_PRICE[u.plan] ?? PLAN_PRICE.basic,
      status: "pagado" as const,
    }));
  const series = ingresosUltimos12Meses(syntheticPagos);
  const ultimos = [...users].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  if (loading) return <div className="p-8 text-sm text-muted-foreground">Cargando…</div>;

  return (
    <>
      <PageHeader title="Resumen" description="Visión global de SOMA OS." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Card icon={Users} label="Total clientes" value={String(m.totalClientas)} />
        <Card icon={DollarSign} label="Ingresos este mes" value={formatCLP(m.mrr)} />
        <Card icon={TrendingUp} label="Nuevos este mes" value={`+${m.nuevasMes}`} />
        <Card icon={Percent} label="Tasa de retención" value={`${retencion}%`} />
      </div>

      <div className="surface-card p-5 mb-6">
        <h3 className="text-sm font-semibold mb-3">Ingresos últimos 12 meses</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => formatCLP(v)}
              />
              <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#grad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="surface-card overflow-hidden">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2"><UserCheck className="h-4 w-4" />Últimos 5 clientes agregados</h3>
          <Link to="/admin/clientes" className="text-xs text-primary hover:underline">Ver todos</Link>
        </div>
        {ultimos.length === 0 ? (
          <p className="p-8 text-sm text-muted-foreground text-center">Sin clientes aún.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-4 py-2.5">Negocio</th>
                <th className="text-left font-medium px-4 py-2.5">Email</th>
                <th className="text-left font-medium px-4 py-2.5">Plan</th>
                <th className="text-left font-medium px-4 py-2.5">Fecha alta</th>
              </tr>
            </thead>
            <tbody>
              {ultimos.map(u => (
                <tr key={u.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3"><Link to={`/admin/clientes/${u.id}`} className="font-medium hover:text-primary hover:underline">{u.businessName}</Link></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary">{PLAN_LABEL[u.plan]}</span></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
