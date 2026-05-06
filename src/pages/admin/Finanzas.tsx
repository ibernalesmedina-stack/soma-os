import { PageHeader } from "@/components/PageHeader";
import { globalMetrics } from "@/lib/admin";
import { formatCLP } from "@/lib/format";
import { AlertCircle, DollarSign, TrendingUp, Users } from "lucide-react";

export default function AdminFinanzas() {
  const m = globalMetrics();
  return (
    <>
      <PageHeader title="Finanzas" description="Ingresos consolidados de la plataforma." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card icon={DollarSign} label="Ingresos totales" value={formatCLP(m.ingresosTotales)} />
        <Card icon={TrendingUp} label="MRR" value={formatCLP(m.mrr)} />
        <Card icon={Users} label="Promedio por clienta" value={formatCLP(m.promedioPorClienta)} />
        <Card icon={AlertCircle} label="Pagos fallidos / pendientes" value={String(m.pagosFallidos)} />
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
