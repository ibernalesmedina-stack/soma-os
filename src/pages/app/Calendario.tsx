import { useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { addBloqueo, deleteBloqueo, isClienteNuevo, listBloqueos, listReservas } from "@/lib/storage";
import { BUSINESS_CONFIG } from "@/lib/business";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Lock, Plus, Calendar as CalIcon, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { slugify } from "@/lib/format";

const HOURS = Array.from({ length: 13 }).map((_, i) => i + 8); // 08:00 - 20:00

function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // Mon=0
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}

export default function Calendario() {
  const { user, update } = useAuth();
  const cfg = user ? BUSINESS_CONFIG[user.tipoNegocio] : null;
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date()));
  const [version, setVersion] = useState(0);

  const reservas = useMemo(() => (user ? listReservas(user.id) : []), [user, version]);
  const bloqueos = useMemo(() => (user ? listBloqueos(user.id) : []), [user, version]);

  if (!user || !cfg) return null;

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const weekReservas = reservas.filter((r) => {
    const d = new Date(r.date);
    return d >= weekStart && d < weekEnd && r.status !== "cancelada";
  });
  const weekBloqueos = bloqueos.filter((b) => {
    const d = new Date(b.start);
    return d >= weekStart && d < weekEnd;
  });

  const fmtRange = (a: Date, b: Date) => {
    const last = new Date(b); last.setDate(last.getDate() - 1);
    return `${a.toLocaleDateString("es-CL", { day: "numeric", month: "short" })} – ${last.toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" })}`;
  };

  const connectGoogle = () => {
    update({ googleCalendarConnected: true });
    toast({ title: "Google Calendar conectado", description: "Las reservas se sincronizarán automáticamente." });
  };
  const disconnectGoogle = () => {
    update({ googleCalendarConnected: false });
    toast({ title: "Desconectado de Google Calendar" });
  };

  return (
    <>
      <PageHeader
        title="Calendario"
        description={`Vista semanal con sincronización a Google Calendar.`}
        actions={
          <div className="flex gap-2">
            {user.googleCalendarConnected ? (
              <Button variant="outline" onClick={disconnectGoogle}>
                <CheckCircle2 className="h-4 w-4 mr-1.5 text-success" /> Google Calendar
              </Button>
            ) : (
              <Button variant="outline" onClick={connectGoogle}>
                <CalIcon className="h-4 w-4 mr-1.5" /> Conectar Google Calendar
              </Button>
            )}
            <BloqueoDialog onSave={(b) => { addBloqueo({ ...b, user_id: user.id }); setVersion((v) => v + 1); toast({ title: "Horario bloqueado" }); }} />
          </div>
        }
      />

      {/* Leyenda */}
      <div className="flex flex-wrap items-center gap-4 mb-3 text-xs">
        <Legend color="bg-[hsl(var(--success))]" label={`${cfg.clientLabel} nuevo`} />
        <Legend color="bg-primary" label={`${cfg.clientLabel} antiguo`} />
        <Legend color="bg-[hsl(var(--warning))]" label="Control" />
        <Legend color="bg-destructive" label="Horario bloqueado" />
      </div>

      <div className="surface-card overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); }}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => setWeekStart(startOfWeek(new Date()))}>Hoy</Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); }}><ChevronRight className="h-4 w-4" /></Button>
          </div>
          <div className="text-sm font-medium">{fmtRange(weekStart, weekEnd)}</div>
          <div className="text-xs text-muted-foreground mono">
            {weekReservas.length} citas · {weekBloqueos.length} bloqueos
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="grid grid-cols-[60px_repeat(7,minmax(120px,1fr))] min-w-[900px]">
            {/* Header fila */}
            <div className="border-b border-r bg-muted/30" />
            {days.map((d) => {
              const isToday = d.toDateString() === new Date().toDateString();
              return (
                <div key={d.toISOString()} className={cn("border-b border-r p-2 text-center", isToday && "bg-primary/5")}>
                  <div className="text-[10px] uppercase text-muted-foreground tracking-wider">{d.toLocaleDateString("es-CL", { weekday: "short" })}</div>
                  <div className={cn("text-sm font-semibold", isToday && "text-primary")}>{d.getDate()}</div>
                </div>
              );
            })}

            {/* Filas por hora */}
            {HOURS.map((h) => (
              <Row key={h} hour={h} days={days} weekReservas={weekReservas} weekBloqueos={weekBloqueos} userId={user.id} clientLabelNuevo={`${cfg.clientLabel} nuevo`} clientLabelAntiguo={`${cfg.clientLabel} antiguo`} onDeleteBloqueo={(id) => { deleteBloqueo(id); setVersion((v) => v + 1); }} />
            ))}
          </div>
        </div>
      </div>

      {weekBloqueos.length > 0 && (
        <div className="surface-card mt-4 p-4">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Bloqueos de esta semana</h3>
          <ul className="divide-y text-sm">
            {weekBloqueos.map((b) => (
              <li key={b.id} className="py-2 flex items-center gap-3">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="font-medium">{b.motivo}</div>
                  <div className="text-xs text-muted-foreground mono">
                    {new Date(b.start).toLocaleString("es-CL", { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })} — {new Date(b.end).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { deleteBloqueo(b.id); setVersion((v) => v + 1); }}>Eliminar</Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

function Row({ hour, days, weekReservas, weekBloqueos, userId, clientLabelNuevo, clientLabelAntiguo, onDeleteBloqueo }: {
  hour: number; days: Date[];
  weekReservas: ReturnType<typeof listReservas>;
  weekBloqueos: ReturnType<typeof listBloqueos>;
  userId: string;
  clientLabelNuevo: string; clientLabelAntiguo: string;
  onDeleteBloqueo: (id: string) => void;
}) {
  return (
    <>
      <div className="border-b border-r p-1.5 text-[10px] mono text-muted-foreground text-right">
        {String(hour).padStart(2, "0")}:00
      </div>
      {days.map((d) => {
        const slotStart = new Date(d); slotStart.setHours(hour, 0, 0, 0);
        const slotEnd = new Date(d); slotEnd.setHours(hour + 1, 0, 0, 0);
        const reservasSlot = weekReservas.filter((r) => {
          const t = new Date(r.date).getTime();
          return t >= slotStart.getTime() && t < slotEnd.getTime();
        });
        const bloqueosSlot = weekBloqueos.filter((b) => {
          const bs = new Date(b.start).getTime();
          const be = new Date(b.end).getTime();
          return bs < slotEnd.getTime() && be > slotStart.getTime();
        });
        const isToday = d.toDateString() === new Date().toDateString();
        return (
          <div key={d.toISOString() + hour} className={cn("border-b border-r p-1 min-h-[52px] space-y-1", isToday && "bg-primary/[0.02]")}>
            {bloqueosSlot.map((b) => (
              <button
                key={b.id}
                onClick={() => onDeleteBloqueo(b.id)}
                className="w-full text-left rounded-md bg-destructive/10 border border-destructive/30 px-1.5 py-1 text-[10px] text-destructive hover:bg-destructive/20 transition-colors"
                title={`Bloqueo · clic para eliminar`}
              >
                <div className="flex items-center gap-1 font-medium"><Lock className="h-2.5 w-2.5" />{b.motivo}</div>
              </button>
            ))}
            {reservasSlot.map((r) => {
              const nuevo = isClienteNuevo(userId, slugify(r.clientName));
              const esControl = !!r.esControl;
              const tone = esControl
                ? "bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/40"
                : nuevo
                  ? "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/30"
                  : "bg-primary/10 text-primary border-primary/20";
              const tag = esControl ? "Control" : nuevo ? "Nuevo" : "Antiguo";
              return (
                <div
                  key={r.id}
                  className={cn("rounded-md px-1.5 py-1 text-[10px] border space-y-0.5", tone)}
                  title={`${tag} · ${r.tipoAtencion ?? "presencial"}`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-medium truncate">{r.clientName}</span>
                    <span className="text-[8px] uppercase tracking-wider mono opacity-80 shrink-0">{tag}</span>
                  </div>
                  <div className="flex items-center justify-between gap-1 opacity-80">
                    <span className="mono">{new Date(r.date).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}</span>
                    <span className="text-[8px] uppercase mono px-1 rounded bg-current/10">{r.tipoAtencion ?? "pres."}</span>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-1.5">
      <span className={cn("size-2.5 rounded-sm", color)} />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

function BloqueoDialog({ onSave }: { onSave: (b: { start: string; end: string; motivo: string }) => void }) {
  const [open, setOpen] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [start, setStart] = useState("12:00");
  const [end, setEnd] = useState("13:00");
  const [motivo, setMotivo] = useState("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4 mr-1.5" />Bloquear horario</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Bloquear horario</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label className="text-xs">Fecha</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label className="text-xs">Desde</Label>
              <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Hasta</Label>
              <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Motivo del bloqueo</Label>
            <Textarea rows={2} placeholder="Ej: feriado, vacaciones, almuerzo, capacitación…" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={() => {
            if (!motivo.trim()) return;
            const s = new Date(`${date}T${start}:00`).toISOString();
            const e = new Date(`${date}T${end}:00`).toISOString();
            onSave({ start: s, end: e, motivo: motivo.trim() });
            setOpen(false); setMotivo("");
          }}>Bloquear</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
