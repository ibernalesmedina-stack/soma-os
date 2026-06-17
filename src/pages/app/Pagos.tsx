import { useState } from "react";
import { Link } from "react-router-dom";
import { usePagos } from "@/lib/hooks";
import { updatePago } from "@/lib/storage";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { formatCLP, formatDateTime, slugify } from "@/lib/format";
import { toast } from "@/hooks/use-toast";
import { CheckCircle2 } from "lucide-react";
import type { Pago } from "@/lib/types";

export default function Pagos() {
  const { data: pagos, refetch } = usePagos();
  const [editing, setEditing] = useState<Pago | null>(null);

  const total = pagos.filter((p) => p.status === "pagado").reduce((a, b) => a + b.amount, 0);
  const pendiente = pagos.filter((p) => p.status === "pendiente").reduce((a, b) => a + b.amount, 0);
  const pendienteList = pagos.filter((p) => p.status === "pendiente");

  return (
    <>
      <PageHeader title="Pagos" description="Resumen de ingresos y transacciones." />

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Card label="Recibido" value={formatCLP(total)} accent="success" />
        <Card label="Pendiente de cobro" value={formatCLP(pendiente)} accent="warning"
          sub={pendienteList.length > 0 ? `${pendienteList.length} pago${pendienteList.length > 1 ? "s" : ""} sin cobrar` : undefined} />
        <Card label="Transacciones" value={String(pagos.length)} />
      </div>

      {pendienteList.length > 0 && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-center justify-between gap-4">
          <div className="text-sm text-amber-800">
            <span className="font-semibold">{pendienteList.length} pago{pendienteList.length > 1 ? "s" : ""} pendiente{pendienteList.length > 1 ? "s" : ""}</span>
            {" — "}total por cobrar: <span className="font-semibold">{formatCLP(pendiente)}</span>
          </div>
          <div className="text-xs text-amber-600">Haz click en un pago para marcarlo como cobrado</div>
        </div>
      )}

      <div className="surface-card overflow-hidden">
        {pagos.length === 0 ? (
          <div className="p-16 text-center text-sm text-muted-foreground">Sin transacciones aún.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[540px]">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-4 py-2.5">Cliente</th>
                  <th className="text-left font-medium px-4 py-2.5">Fecha</th>
                  <th className="text-left font-medium px-4 py-2.5">Método</th>
                  <th className="text-left font-medium px-4 py-2.5">Estado</th>
                  <th className="text-right font-medium px-4 py-2.5">Monto</th>
                  <th className="px-4 py-2.5" />
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
                    <td className="px-4 py-3 text-muted-foreground">{p.method || "—"}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3 text-right mono">{formatCLP(p.amount)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditing(p)}>
                        Editar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <EditPagoDialog
          pago={editing}
          onClose={() => setEditing(null)}
          onSaved={async (patch) => {
            await updatePago(editing.id, patch);
            setEditing(null);
            refetch();
            toast({ title: "Pago actualizado ✓" });
          }}
        />
      )}
    </>
  );
}

function EditPagoDialog({ pago, onClose, onSaved }: {
  pago: Pago;
  onClose: () => void;
  onSaved: (patch: { status?: string; method?: string; amount?: number }) => Promise<void>;
}) {
  const [status, setStatus] = useState(pago.status);
  const [method, setMethod] = useState(pago.method || "");
  const [amount, setAmount] = useState(pago.amount);
  const [saving, setSaving] = useState(false);

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar pago · {pago.clientName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="rounded-lg bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            {pago.method ? `${pago.method} · ` : ""}{formatDateTime(pago.date)}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Estado</Label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="pendiente">Pendiente</option>
              <option value="pagado">Pagado</option>
              <option value="fallido">Fallido</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Método de pago</Label>
            <select value={method} onChange={(e) => setMethod(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">Sin especificar</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="WebPay">WebPay</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Monto (CLP)</Label>
            <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>

          {status === "pagado" && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Se marcará como cobrado
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={async () => { setSaving(true); await onSaved({ status, method: method || undefined, amount }); setSaving(false); }} disabled={saving}>
            {saving ? "Guardando…" : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Card({ label, value, accent, sub }: { label: string; value: string; accent?: "success" | "warning"; sub?: string }) {
  return (
    <div className="surface-card p-5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-2xl font-semibold tracking-tight mt-1 ${accent === "success" ? "text-success" : accent === "warning" ? "text-[hsl(var(--warning))]" : ""}`}>
        {value}
      </div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}
