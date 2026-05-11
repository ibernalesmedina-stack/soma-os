import { useState } from "react";
import { Link } from "react-router-dom";
import { useReservas, useServicios } from "@/lib/hooks";
import type { Reserva } from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/StatusBadge";
import { AtencionBadge } from "@/components/AtencionBadge";
import { formatCLP, formatDateTime, slugify } from "@/lib/format";
import { Calendar, LayoutList, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { addReserva } from "@/lib/storage";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";

function NuevaReservaDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const { user } = useAuth();
  const { data: servicios } = useServicios();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const nowTime = new Date().toTimeString().slice(0, 5);

  const [form, setForm] = useState({
    clientName: "",
    serviceId: "",
    date: today,
    time: "09:00",
    tipoAtencion: "presencial" as "presencial" | "online",
    status: "confirmada" as Reserva["status"],
    amount: 0,
    esControl: false,
  });

  const set = (k: string, v: unknown) => setForm(prev => ({ ...prev, [k]: v }));

  const handleServiceChange = (id: string) => {
    const s = servicios.find(s => s.id === id);
    set("serviceId", id);
    if (s) set("amount", form.tipoAtencion === "online" && s.priceOnline ? s.priceOnline : s.price);
  };

  const handleTipoChange = (tipo: "presencial" | "online") => {
    set("tipoAtencion", tipo);
    const s = servicios.find(s => s.id === form.serviceId);
    if (s) set("amount", tipo === "online" && s.priceOnline ? s.priceOnline : s.price);
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!form.clientName.trim()) return toast({ title: "Ingresa el nombre del cliente", variant: "destructive" });
    if (!form.serviceId) return toast({ title: "Selecciona un servicio", variant: "destructive" });
    if (!form.date) return toast({ title: "Selecciona una fecha", variant: "destructive" });

    setSaving(true);
    try {
      const servicio = servicios.find(s => s.id === form.serviceId)!;
      const dateISO = `${form.date}T${form.time}:00`;
      await addReserva({
        user_id: user.id,
        client_id: slugify(form.clientName),
        clientName: form.clientName.trim(),
        date: dateISO,
        serviceId: form.serviceId,
        serviceName: servicio.name,
        status: form.status,
        amount: form.amount,
        tipoAtencion: form.tipoAtencion,
        esControl: form.esControl,
      });
      toast({ title: "Reserva creada ✓" });
      onCreated();
      onClose();
      setForm({ clientName: "", serviceId: "", date: today, time: "09:00", tipoAtencion: "presencial", status: "confirmada", amount: 0, esControl: false });
    } catch (e) {
      toast({ title: "Error al crear la reserva", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Nueva reserva</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-2">
          {/* Cliente */}
          <div className="grid gap-1.5">
            <Label>Cliente</Label>
            <Input placeholder="Nombre del cliente" value={form.clientName} onChange={e => set("clientName", e.target.value)} />
          </div>

          {/* Servicio */}
          <div className="grid gap-1.5">
            <Label>Servicio</Label>
            <Select value={form.serviceId} onValueChange={handleServiceChange}>
              <SelectTrigger><SelectValue placeholder="Seleccionar servicio" /></SelectTrigger>
              <SelectContent>
                {servicios.filter(s => s.active !== false).map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name} — {formatCLP(s.price)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fecha y hora */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Fecha</Label>
              <Input type="date" value={form.date} onChange={e => set("date", e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Hora</Label>
              <Input type="time" value={form.time} onChange={e => set("time", e.target.value)} />
            </div>
          </div>

          {/* Tipo + Estado */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Modalidad</Label>
              <Select value={form.tipoAtencion} onValueChange={v => handleTipoChange(v as "presencial" | "online")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="presencial">Presencial</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Estado</Label>
              <Select value={form.status} onValueChange={v => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmada">Confirmada</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Monto */}
          <div className="grid gap-1.5">
            <Label>Monto (CLP)</Label>
            <Input type="number" value={form.amount} onChange={e => set("amount", Number(e.target.value))} min={0} step={1000} />
          </div>

          {/* Control */}
          <div className="flex items-center gap-2">
            <Checkbox id="control" checked={form.esControl} onCheckedChange={v => set("esControl", !!v)} />
            <Label htmlFor="control" className="font-normal text-sm cursor-pointer">Es sesión de control (30 min)</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={saving}>{saving ? "Guardando…" : "Crear reserva"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Reservas() {
  const { data: all, refetch } = useReservas();
  const [view, setView] = useState<"list" | "calendar">("list");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [showNew, setShowNew] = useState(false);

  const filtered = all.filter((r) => {
    if (status !== "all" && r.status !== status) return false;
    if (q && !`${r.clientName} ${r.serviceName}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <NuevaReservaDialog open={showNew} onClose={() => setShowNew(false)} onCreated={refetch} />
      <PageHeader
        title="Reservas"
        description="Gestiona todas las citas de tus clientes."
        actions={<Button onClick={() => setShowNew(true)}><Plus className="h-4 w-4 mr-1.5" />Nueva reserva</Button>}
      />

      <div className="surface-card overflow-hidden">
        <div className="p-3 flex flex-wrap items-center gap-2 border-b">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar cliente o servicio…" className="pl-8 h-9" />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[160px] h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="confirmada">Confirmada</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="completada">Completada</SelectItem>
              <SelectItem value="cancelada">Cancelada</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex border rounded-md p-0.5">
            <ToggleBtn active={view === "list"} onClick={() => setView("list")}><LayoutList className="h-3.5 w-3.5" />Lista</ToggleBtn>
            <ToggleBtn active={view === "calendar"} onClick={() => setView("calendar")}><Calendar className="h-3.5 w-3.5" />Calendario</ToggleBtn>
          </div>
        </div>

        {view === "list" ? (
          filtered.length === 0 ? (
            <div className="p-16 text-center">
              <p className="text-sm font-medium">Sin reservas</p>
              <p className="text-xs text-muted-foreground mt-1">Cuando tengas reservas aparecerán aquí.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-4 py-2.5">Cliente</th>
                  <th className="text-left font-medium px-4 py-2.5">Servicio</th>
                  <th className="text-left font-medium px-4 py-2.5">Fecha</th>
                  <th className="text-left font-medium px-4 py-2.5">Tipo</th>
                  <th className="text-left font-medium px-4 py-2.5">Estado</th>
                  <th className="text-right font-medium px-4 py-2.5">Monto</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">
                      <Link to={`/app/clientes/${slugify(r.clientName)}`} className="hover:text-primary hover:underline">
                        {r.clientName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{r.serviceName}</td>
                    <td className="px-4 py-3 mono text-xs">{formatDateTime(r.date)}</td>
                    <td className="px-4 py-3"><AtencionBadge tipo={r.tipoAtencion} /></td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3 text-right mono">{formatCLP(r.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : (
          <CalendarView reservas={filtered} />
        )}
      </div>
    </>
  );
}

function ToggleBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-8 px-2.5 rounded text-xs font-medium inline-flex items-center gap-1.5 transition-colors",
        active ? "bg-background shadow-sm border" : "text-muted-foreground hover:text-foreground",
      )}
    >{children}</button>
  );
}

function CalendarView({ reservas }: { reservas: Reserva[] }) {
  const today = new Date();
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i - 3);
    return d;
  });
  return (
    <div className="grid grid-cols-7 divide-x">
      {days.map((d) => {
        const dayRes = reservas.filter((r) => new Date(r.date).toDateString() === d.toDateString());
        const isToday = d.toDateString() === today.toDateString();
        return (
          <div key={d.toISOString()} className="min-h-[280px] p-2">
            <div className={cn("text-[10px] uppercase tracking-wider mb-2", isToday ? "text-primary font-semibold" : "text-muted-foreground")}>
              {d.toLocaleDateString("es-CL", { weekday: "short" })} {d.getDate()}
            </div>
            <div className="space-y-1.5">
              {dayRes.map((r) => (
                <div key={r.id} className="rounded-md bg-primary/10 text-primary border border-primary/15 p-1.5 text-[11px]">
                  <div className="font-medium truncate">{r.clientName}</div>
                  <div className="opacity-70 mono">{new Date(r.date).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
