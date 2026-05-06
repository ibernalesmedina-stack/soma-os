import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { listFacturas, addFactura, updateFactura, deleteFactura, getSettings } from "@/lib/admin-store";
import { getUsers } from "@/lib/storage";
import { formatCLP, formatDate } from "@/lib/format";
import { Plus, Printer, Trash2, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Factura } from "@/lib/admin-store";

export default function AdminFacturacion() {
  const [v, setV] = useState(0);
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState<"all" | Factura["status"]>("all");

  const facturas = useMemo(() => listFacturas().sort((a, b) => b.date.localeCompare(a.date)), [v]);
  const filtered = facturas.filter(f => {
    const matchQ = `${f.clientName} ${f.description}`.toLowerCase().includes(q.toLowerCase());
    const matchE = estado === "all" || f.status === estado;
    return matchQ && matchE;
  });

  const total = filtered.reduce((a, b) => a + b.amount, 0);

  const imprimir = (f: Factura) => {
    const s = getSettings();
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Factura ${f.id}</title>
      <style>body{font-family:system-ui;padding:40px;max-width:700px;margin:auto;color:#111}h1{margin:0 0 8px}small{color:#666}table{width:100%;margin-top:24px;border-collapse:collapse}td,th{padding:10px;border-bottom:1px solid #eee;text-align:left}.right{text-align:right}.brand{font-weight:700;font-size:20px;color:#5b3df5}</style>
      </head><body>
      <div class="brand">SOMA OS</div>
      <h1>Factura</h1>
      <small>N° ${f.id} · Emitida ${new Date(f.date).toLocaleDateString("es-CL")}</small>
      <table>
        <tr><th>Cliente</th><td>${f.clientName}</td></tr>
        <tr><th>Descripción</th><td>${f.description || "—"}</td></tr>
        <tr><th>Estado</th><td>${f.status}</td></tr>
        <tr><th>Monto</th><td class="right"><strong>${formatCLP(f.amount)}</strong></td></tr>
      </table>
      ${s.transferenciaBanco ? `<p style="margin-top:24px;color:#666;font-size:12px">Datos de transferencia: ${s.transferenciaBanco} · ${s.transferenciaCuenta} · ${s.transferenciaRut}</p>` : ""}
      <script>window.onload=()=>window.print()</script>
      </body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); }
  };

  return (
    <>
      <PageHeader
        title="Facturación"
        description={`${facturas.length} facturas · Total filtrado: ${formatCLP(total)}`}
        actions={<NuevaFacturaDialog onCreated={() => setV(v + 1)} />}
      />

      <div className="surface-card overflow-hidden">
        <div className="p-3 border-b flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar cliente o descripción…" className="pl-8 h-9" />
          </div>
          <select value={estado} onChange={e => setEstado(e.target.value as "all" | Factura["status"])} className="h-9 rounded-md border border-input bg-background px-2 text-sm">
            <option value="all">Todos los estados</option>
            <option value="pagada">Pagadas</option>
            <option value="pendiente">Pendientes</option>
            <option value="vencida">Vencidas</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-medium">Sin facturas</p>
            <p className="text-xs text-muted-foreground mt-1">Crea la primera factura manual.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-4 py-2.5">Cliente</th>
                <th className="text-left font-medium px-4 py-2.5">Descripción</th>
                <th className="text-left font-medium px-4 py-2.5">Fecha</th>
                <th className="text-left font-medium px-4 py-2.5">Estado</th>
                <th className="text-right font-medium px-4 py-2.5">Monto</th>
                <th className="text-right font-medium px-4 py-2.5">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => (
                <tr key={f.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{f.clientName}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{f.description || "—"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(f.date)}</td>
                  <td className="px-4 py-3">
                    <select value={f.status} onChange={e => { updateFactura(f.id, { status: e.target.value as Factura["status"] }); setV(v + 1); }}
                      className={`text-[11px] uppercase mono px-2 py-0.5 rounded-full bg-transparent border ${f.status === "pagada" ? "text-success border-success/30" : f.status === "vencida" ? "text-destructive border-destructive/30" : "text-warning border-warning/30"}`}>
                      <option value="pagada">pagada</option>
                      <option value="pendiente">pendiente</option>
                      <option value="vencida">vencida</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right mono">{formatCLP(f.amount)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => imprimir(f)} title="Imprimir / Descargar"><Printer className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => { if (confirm("¿Eliminar factura?")) { deleteFactura(f.id); setV(v + 1); } }}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function NuevaFacturaDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const users = useMemo(() => getUsers().filter(u => u.role !== "admin"), [open]);
  const [form, setForm] = useState({ clientUserId: "", amount: "", description: "" });

  const create = () => {
    const u = users.find(x => x.id === form.clientUserId);
    const amount = Number(form.amount);
    if (!u || !amount || amount <= 0) return toast({ title: "Datos incompletos" });
    addFactura({
      clientUserId: u.id,
      clientName: u.businessName,
      amount,
      description: form.description.trim(),
      date: new Date().toISOString(),
      status: "pendiente",
    });
    toast({ title: "Factura creada" });
    setOpen(false);
    setForm({ clientUserId: "", amount: "", description: "" });
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1.5" />Nueva factura</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Crear factura manual</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label className="text-xs">Cliente</Label>
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.clientUserId} onChange={e => setForm({ ...form, clientUserId: e.target.value })}>
              <option value="">Seleccionar…</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.businessName} · {u.email}</option>)}
            </select>
          </div>
          <div className="grid gap-1.5"><Label className="text-xs">Monto (CLP)</Label><Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></div>
          <div className="grid gap-1.5"><Label className="text-xs">Descripción</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Ej: Plan Clinic - Mayo 2026" /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={create}>Crear factura</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
