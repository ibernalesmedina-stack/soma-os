import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Eye, Pencil, Trash2, ArrowRightLeft } from "lucide-react";
import { getUsers, updateUserById, saveUsers } from "@/lib/storage";
import { estadoPagoClienta } from "@/lib/admin-store";
import { formatDate } from "@/lib/format";
import { toast } from "@/hooks/use-toast";
import type { Plan, TipoNegocio, User } from "@/lib/types";
import { PLAN_LABEL } from "@/lib/plans";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const PLANES_ADMIN: Plan[] = ["basic", "clinic"];

export default function AdminClientes() {
  const [v, setV] = useState(0);
  const [q, setQ] = useState("");
  const [planFilter, setPlanFilter] = useState<"all" | Plan>("all");
  const [pagoFilter, setPagoFilter] = useState<"all" | "pagado" | "pendiente">("all");
  const navigate = useNavigate();

  const users = useMemo(() => getUsers().filter(u => u.role !== "admin"), [v]);
  const filtered = users.filter(u => {
    const matchQ = `${u.businessName} ${u.email} ${u.name}`.toLowerCase().includes(q.toLowerCase());
    const matchPlan = planFilter === "all" || u.plan === planFilter;
    const estado = estadoPagoClienta(u.id);
    const matchPago = pagoFilter === "all" || estado === pagoFilter;
    return matchQ && matchPlan && matchPago;
  });

  const handleDelete = (u: User) => {
    if (!confirm(`¿Eliminar ${u.businessName}? Esta acción no se puede deshacer.`)) return;
    saveUsers(getUsers().filter(x => x.id !== u.id));
    setV(v + 1);
    toast({ title: "Cliente eliminado" });
  };

  const handleChangePlan = (u: User) => {
    const next: Plan = u.plan === "clinic" ? "basic" : "clinic";
    updateUserById(u.id, { plan: next });
    setV(v + 1);
    toast({ title: `Plan cambiado a ${PLAN_LABEL[next]}` });
  };

  return (
    <>
      <PageHeader
        title="Gestión de clientes"
        description="Todos los clientes de la plataforma."
        actions={<NuevoClienteDialog onCreated={() => setV(v + 1)} />}
      />

      <div className="surface-card overflow-hidden">
        <div className="p-3 border-b flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar nombre o email…" className="pl-8 h-9" />
          </div>
          <select value={planFilter} onChange={e => setPlanFilter(e.target.value as "all" | Plan)} className="h-9 rounded-md border border-input bg-background px-2 text-sm">
            <option value="all">Todos los planes</option>
            {PLANES_ADMIN.map(p => <option key={p} value={p}>{PLAN_LABEL[p]}</option>)}
          </select>
          <select value={pagoFilter} onChange={e => setPagoFilter(e.target.value as "all" | "pagado" | "pendiente")} className="h-9 rounded-md border border-input bg-background px-2 text-sm">
            <option value="all">Todos los pagos</option>
            <option value="pagado">Pagado</option>
            <option value="pendiente">Pendiente</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-medium">Sin clientes</p>
            <p className="text-xs text-muted-foreground mt-1">No hay clientes que coincidan con tu búsqueda.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-4 py-2.5">Nombre</th>
                <th className="text-left font-medium px-4 py-2.5">Email</th>
                <th className="text-left font-medium px-4 py-2.5">Plan</th>
                <th className="text-left font-medium px-4 py-2.5">Fecha inicio</th>
                <th className="text-left font-medium px-4 py-2.5">Estado pago</th>
                <th className="text-right font-medium px-4 py-2.5">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const estado = estadoPagoClienta(u.id);
                return (
                  <tr key={u.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link to={`/admin/clientes/${u.id}`} className="font-medium hover:text-primary hover:underline">{u.businessName}</Link>
                      <div className="text-[11px] text-muted-foreground">{u.name}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-md ${u.plan === "clinic" ? "bg-primary/10 text-primary" : "bg-muted text-foreground"}`}>{PLAN_LABEL[u.plan]}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] uppercase mono px-2 py-0.5 rounded-full ${estado === "pendiente" ? "bg-warning/10 text-warning" : "bg-success/10 text-success"}`}>
                        {estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/clientes/${u.id}`)} title="Ver detalles"><Eye className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/clientes/${u.id}?edit=1`)} title="Editar"><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleChangePlan(u)} title={`Cambiar a ${u.plan === "clinic" ? "Basic" : "Clinic"}`}><ArrowRightLeft className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(u)} title="Eliminar"><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function NuevoClienteDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ email: "", businessName: "", name: "", phone: "", plan: "basic" as Plan });

  const create = () => {
    if (!form.email.includes("@") || !form.businessName.trim()) return toast({ title: "Datos incompletos" });
    const users = getUsers();
    if (users.some(u => u.email.toLowerCase() === form.email.toLowerCase())) return toast({ title: "Email ya registrado" });
    const newUser: User = {
      id: Math.random().toString(36).slice(2, 10),
      email: form.email,
      name: form.name || form.businessName,
      businessName: form.businessName,
      phone: form.phone,
      role: "user",
      plan: form.plan,
      tipoNegocio: "psicologa" as TipoNegocio,
      active: true,
      paymentMethods: { webpay: true, transferencia: true },
      createdAt: new Date().toISOString(),
    };
    (newUser as User & { _pw?: string })._pw = "soma123";
    saveUsers([...users, newUser]);
    toast({ title: "Cliente creado", description: "Contraseña temporal: soma123" });
    setOpen(false);
    setForm({ email: "", businessName: "", name: "", phone: "", plan: "basic" });
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1.5" />Nuevo cliente</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Crear cliente</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5"><Label className="text-xs">Negocio</Label><Input value={form.businessName} onChange={e => setForm({ ...form, businessName: e.target.value })} /></div>
          <div className="grid gap-1.5"><Label className="text-xs">Nombre contacto</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div className="grid gap-1.5"><Label className="text-xs">Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
          <div className="grid gap-1.5"><Label className="text-xs">Teléfono</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Plan</Label>
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value as Plan })}>
              {PLANES_ADMIN.map(p => <option key={p} value={p}>{PLAN_LABEL[p]}</option>)}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={create}>Crear</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
