import { Link } from "react-router-dom";
import { usePagos } from "@/lib/hooks";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCLP, formatDateTime, slugify } from "@/lib/format";

export default function Pagos() {
  const { data: pagos } = usePagos();
  const total = pagos.filter((p) => p.status === "pagado").reduce((a, b) => a + b.amount, 0);
  const pendiente = pagos.filter((p) => p.status === "pendiente").reduce((a, b) => a + b.amount, 0);

  return (
    <>
      <PageHeader title="Pagos" description="Resumen de ingresos y transacciones." />
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Card label="Recibido" value={formatCLP(total)} accent="success" />
        <Card label="Pendiente" value={formatCLP(pendiente)} accent="warning" />
        <Card label="Transacciones" value={String(pagos.length)} />
      </div>
      <div className="surface-card overflow-hidden">
        {pagos.length === 0 ? (
          <div className="p-16 text-center text-sm text-muted-foreground">Sin transacciones aún.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-4 py-2.5">Cliente</th>
                <th className="text-left font-medium px-4 py-2.5">Fecha</th>
                <th className="text-left font-medium px-4 py-2.5">Método</th>
                <th className="text-left font-medium px-4 py-2.5">Estado</th>
                <th className="text-right font-medium px-4 py-2.5">Monto</th>
              </tr>
            </thead>
            <tbody>
              {pagos.map((p) => (
                <tr key={p.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">
                    <Link to={`/app/clientes/${slugify(p.clientName)}`} className="hover:text-primary hover:underline">
                      {p.clientName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 mono text-xs">{formatDateTime(p.date)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.method}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-right mono">{formatCLP(p.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function Card({ label, value, accent }: { label: string; value: string; accent?: "success" | "warning" }) {
  return (
    <div className="surface-card p-5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-2xl font-semibold tracking-tight mt-1 ${accent === "success" ? "text-success" : accent === "warning" ? "text-[hsl(var(--warning))]" : ""}`}>
        {value}
      </div>
    </div>
  );
}
