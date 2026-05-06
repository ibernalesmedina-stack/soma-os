import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { getUsers, updateUserById, impersonate, saveUsers } from "@/lib/storage";
import { metricsForUser } from "@/lib/admin";
import { BUSINESS_CONFIG } from "@/lib/business";
import { formatCLP, formatDate } from "@/lib/format";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import type { TipoNegocio, User } from "@/lib/types";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Download } from "lucide-react";
import { allPagos, allReservas } from "@/lib/admin";

const downloadInformeClienta = (u: User) => {
  const m = metricsForUser(u.id);
  const reservas = allReservas().filter(r => r.user_id === u.id);
  const pagos = allPagos().filter(p => p.user_id === u.id);
  const lines: string[] = [];
  lines.push(`Informe: ${u.businessName}`);
  lines.push(`Contacto,${u.name},${u.email},${u.phone || ""}`);
  lines.push(`Tipo,${u.tipoNegocio}`);
  lines.push(`Submódulos,"${(u.submodulos || []).join(", ")}"`);
  lines.push(`Estado,${u.active === false ? "Inactiva" : "Activa"}`);
  lines.push(`Registro,${u.createdAt}`);
  lines.push("");
  lines.push("Métrica,Valor");
  lines.push(`Pacientes totales,${m.pacientes}`);
  lines.push(`Reservas mes,${m.reservasMes}`);
  lines.push(`Ingresos mes,${m.ingresosMes}`);
  lines.push(`Ingresos totales,${m.ingresosTotal}`);
  lines.push(`Última actividad,${m.ultimaActividad || ""}`);
  lines.push("");
  lines.push("Reservas (últimas 50)");
  lines.push("Fecha,Cliente,Servicio,Estado");
  reservas.slice(-50).forEach(r => lines.push(`${r.date},"${r.clientName}","${r.serviceName}",${r.status}`));
  lines.push("");
  lines.push("Pagos (últimos 50)");
  lines.push("Fecha,Cliente,Método,Estado,Monto");
  pagos.slice(-50).forEach(p => lines.push(`${p.date},"${p.clientName}",${p.method},${p.status},${p.amount}`));
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `informe-${u.businessName.replace(/\s+/g, "-").toLowerCase()}.csv`;
  a.click(); URL.revokeObjectURL(url);
};

const TIPOS: TipoNegocio[] = ["nutricionista", "cosmetologa", "odontologa", "psicologa"];

export default function AdminClientas() {
  const [v, setV] = useState(0);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const users = useMemo(() => getUsers().filter(u => u.role !== "admin"), [v]);
  const filtered = users.filter(u => `${u.businessName} ${u.email} ${u.name}`.toLowerCase().includes(q.toLowerCase()));

  const handleImpersonate = (u: User) => {
    impersonate(u.id);
    toast({ title: `Sesión como ${u.businessName}` });
    window.location.href = "/app";
  };

  const handleToggleActive = (u: User) => {
    updateUserById(u.id, { active: u.active === false });
    setV(v + 1);
    toast({ title: u.active === false ? "Activada" : "Desactivada" });
  };

  return (
    <>
      <PageHeader
        title="Clientas"
        description="Todas las cuentas activas en la plataforma."
        actions={<NuevaClientaDialog onCreated={() => setV(v + 1)} />}
      />

      <div className="surface-card overflow-hidden">
        <div className="p-3 border-b">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar negocio o email…" className="pl-8 h-9" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-medium">Sin clientas</p>
            <p className="text-xs text-muted-foreground mt-1">Aún no hay cuentas registradas.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-4 py-2.5">Negocio</th>
                <th className="text-left font-medium px-4 py-2.5">Email</th>
                <th className="text-left font-medium px-4 py-2.5">Tipo</th>
                <th className="text-left font-medium px-4 py-2.5">Estado</th>
                <th className="text-right font-medium px-4 py-2.5">Pacientes</th>
                <th className="text-right font-medium px-4 py-2.5">Reservas mes</th>
                <th className="text-right font-medium px-4 py-2.5">Ingresos</th>
                <th className="text-left font-medium px-4 py-2.5">Última act.</th>
                <th className="text-right font-medium px-4 py-2.5">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const m = metricsForUser(u.id);
                const cfg = BUSINESS_CONFIG[u.tipoNegocio];
                return (
                  <tr key={u.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link to={`/admin/clientas/${u.id}`} className="font-medium hover:text-primary hover:underline">{u.businessName}</Link>
                      <div className="text-[11px] text-muted-foreground">{u.name}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{u.email}</td>
                    <td className="px-4 py-3"><span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary">{cfg.label}</span></td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] uppercase mono px-2 py-0.5 rounded-full ${u.active === false ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}`}>
                        {u.active === false ? "Inactiva" : "Activa"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right mono text-xs">{m.pacientes}</td>
                    <td className="px-4 py-3 text-right mono text-xs">{m.reservasMes}</td>
                    <td className="px-4 py-3 text-right mono text-xs">{formatCLP(m.ingresosTotal)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{m.ultimaActividad ? formatDate(m.ultimaActividad) : "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/clientas/${u.id}`)}>Ver</Button>
                        <Button variant="ghost" size="sm" onClick={() => handleImpersonate(u)}>Entrar</Button>
                        <Button variant="ghost" size="sm" onClick={() => downloadInformeClienta(u)} title="Descargar informe"><Download className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleToggleActive(u)}>{u.active === false ? "Activar" : "Desactivar"}</Button>
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

function NuevaClientaDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ email: "", businessName: "", name: "", phone: "", tipoNegocio: "psicologa" as TipoNegocio });

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
      plan: "pro",
      tipoNegocio: form.tipoNegocio,
      active: true,
      paymentMethods: { webpay: true, transferencia: true },
      createdAt: new Date().toISOString(),
    };
    (newUser as User & { _pw?: string })._pw = "soma123";
    saveUsers([...users, newUser]);
    toast({ title: "Clienta creada", description: `Contraseña temporal: soma123` });
    setOpen(false);
    setForm({ email: "", businessName: "", name: "", phone: "", tipoNegocio: "psicologa" });
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1.5" />Nueva clienta</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Crear clienta</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5"><Label className="text-xs">Negocio</Label><Input value={form.businessName} onChange={e => setForm({ ...form, businessName: e.target.value })} /></div>
          <div className="grid gap-1.5"><Label className="text-xs">Nombre contacto</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div className="grid gap-1.5"><Label className="text-xs">Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
          <div className="grid gap-1.5"><Label className="text-xs">Teléfono</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Tipo de negocio</Label>
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.tipoNegocio} onChange={e => setForm({ ...form, tipoNegocio: e.target.value as TipoNegocio })}>
              {TIPOS.map(t => <option key={t} value={t}>{BUSINESS_CONFIG[t].label}</option>)}
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
