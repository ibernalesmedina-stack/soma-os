import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useBloqueos, useReservas } from "@/lib/hooks";
import { getIntegration, addBloqueo, deleteBloqueo, updateReserva, listFichas } from "@/lib/storage";
import type { Bloqueo, Reserva } from "@/lib/types";
import { BUSINESS_CONFIG } from "@/lib/business";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Lock, Plus, Calendar as CalIcon, CheckCircle2, AlertCircle, Loader2, RefreshCw, Bell, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { slugify } from "@/lib/format";
import { reservasParaRecordar, whatsappRecordatorioURL } from "@/lib/notifications";

const HOURS = Array.from({ length: 13 }).map((_, i) => i + 8); // 08:00 - 20:00

function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // Mon=0
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}

type GoogleEvent = { id: string; title: string; start: string; end: string; allDay: boolean };

export default function Calendario() {
  const { user } = useAuth();
  const cfg = user ? BUSINESS_CONFIG[user.tipoNegocio] : null;
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date()));
  const [syncing, setSyncing] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [googleEvents, setGoogleEvents] = useState<GoogleEvent[]>([]);
  const [editingReserva, setEditingReserva] = useState<Reserva | null>(null);
  const [searchParams] = useSearchParams();
  const { data: reservas, refetch: refetchReservas } = useReservas();
  const { data: bloqueos, refetch: refetchBloqueos } = useBloqueos();

  const checkGoogleStatus = useCallback(async () => {
    if (!user) return;
    const integration = await getIntegration(user.id);
    setIsGoogleConnected(integration?.calendar_status === "synced" && !!integration?.google_calendar_token);
  }, [user]);

  useEffect(() => { checkGoogleStatus(); }, [checkGoogleStatus]);

  const fetchGoogleEvents = useCallback(async () => {
    if (!user || !isGoogleConnected) return;
    const res = await fetch(`/api/google/events?userId=${user.id}&weekStart=${weekStart.toISOString()}`);
    if (!res.ok) return;
    const data = await res.json();
    setGoogleEvents(data.events || []);
  }, [user, isGoogleConnected, weekStart]);

  useEffect(() => { fetchGoogleEvents(); }, [fetchGoogleEvents]);

  // Detect OAuth redirect result
  useEffect(() => {
    const google = searchParams.get("google");
    if (google === "connected") {
      toast({ title: "Google Calendar conectado ✓", description: "Tus reservas se sincronizan automáticamente." });
      checkGoogleStatus();
    }
    if (google === "denied") toast({ title: "Acceso denegado", description: "No autorizaste el acceso a Google Calendar.", variant: "destructive" });
    if (google === "error") {
      const reason = searchParams.get("reason") || "Revisa tu configuración de Google.";
      toast({ title: "Error de conexión", description: reason, variant: "destructive" });
    }
  }, [searchParams]);

  const connectGoogle = () => {
    if (!user) return;
    window.location.href = `/api/google/auth?userId=${user.id}`;
  };

  const syncNow = async () => {
    if (!user) return;
    setSyncing(true);
    const [syncRes] = await Promise.all([
      fetch("/api/google/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      }),
      fetchGoogleEvents(),
    ]);
    const data = await syncRes.json();
    setSyncing(false);
    if (data.skipped) return toast({ title: "Google Calendar no conectado" });
    toast({ title: `Calendario sincronizado ✓` });
  };

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


  return (
    <>
      <PageHeader
        title="Calendario"
        description={`Vista semanal con sincronización a Google Calendar.`}
        actions={
          <div className="flex gap-2">
            {/* Recordatorios 24h — abre WhatsApp con mensaje pre-armado */}
            {(() => {
              const pendientes = reservasParaRecordar(reservas);
              if (!user?.phone || pendientes.length === 0) return null;
              return (
                <div className="relative">
                  <Button variant="outline" size="sm" asChild className="text-amber-600 border-amber-300 hover:bg-amber-50">
                    <a
                      href={whatsappRecordatorioURL(pendientes[0], user.phone, user.businessName)}
                      target="_blank" rel="noopener noreferrer"
                      title={`${pendientes.length} cita(s) mañana — enviar recordatorio`}
                    >
                      <Bell className="h-4 w-4 mr-1.5" />
                      {pendientes.length} recordatorio{pendientes.length > 1 ? "s" : ""}
                    </a>
                  </Button>
                </div>
              );
            })()}
            {isGoogleConnected ? (
              <>
                <Button variant="outline" size="sm" onClick={syncNow} disabled={syncing}>
                  {syncing ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-1.5" />}
                  Sincronizar
                </Button>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground px-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Google Calendar
                </div>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={connectGoogle}>
                <CalIcon className="h-4 w-4 mr-1.5" /> Conectar Google Calendar
              </Button>
            )}
            <BloqueoDialog onSave={async (b) => {
              await addBloqueo({ ...b, user_id: user.id });
              refetchBloqueos();
              toast({ title: "Horario bloqueado" });
              // Sync to Google Calendar if connected
              if (isGoogleConnected) {
                fetch("/api/google/sync", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ userId: user.id }),
                }).catch(() => {});
              }
            }} />
          </div>
        }
      />

      {/* Leyenda */}
      <div className="flex flex-wrap items-center gap-4 mb-3 text-xs">
        <Legend color="bg-[hsl(var(--success))]" label={`${cfg.clientLabel} nuevo`} />
        <Legend color="bg-primary" label={`${cfg.clientLabel} antiguo`} />
        <Legend color="bg-[hsl(var(--warning))]" label="Control" />
        <Legend color="bg-destructive" label="Horario bloqueado" />
        {isGoogleConnected && <Legend color="bg-blue-500" label="Google Calendar" />}
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

        {weekReservas.length === 0 && weekBloqueos.length === 0 && (
          <div className="text-center py-6 text-sm text-muted-foreground border-b">Sin citas ni bloqueos esta semana.</div>
        )}
          <div className="overflow-x-auto">
          <div className="grid grid-cols-[60px_repeat(7,minmax(120px,1fr))] min-w-[900px]">
            {/* Header fila */}
            <div className="border-b border-r bg-muted/30" />
            {days.map((d) => {
              const isToday = d.toDateString() === new Date().toDateString();
              return (
                <div key={d.toISOString()} className={cn("border-b border-r p-2 text-center", isToday && "bg-primary/5")}>
                  <div className="text-[11px] uppercase text-muted-foreground tracking-wider">{d.toLocaleDateString("es-CL", { weekday: "short" })}</div>
                  <div className={cn("text-sm font-semibold", isToday && "text-primary")}>{d.getDate()}</div>
                </div>
              );
            })}

            {/* Filas por hora */}
            {HOURS.map((h) => (
              <Row key={h} hour={h} days={days} weekReservas={weekReservas} weekBloqueos={weekBloqueos} googleEvents={googleEvents} allReservas={reservas} clientLabelNuevo={`${cfg.clientLabel} nuevo`} clientLabelAntiguo={`${cfg.clientLabel} antiguo`} onDeleteBloqueo={async (id) => { await deleteBloqueo(id); refetchBloqueos(); }} onEditReserva={setEditingReserva} />
            ))}
          </div>
        </div>
        </div>

      {editingReserva && (
        <EditReservaDialog
          reserva={editingReserva}
          userId={user?.id ?? ""}
          onClose={() => setEditingReserva(null)}
          onSaved={async (patch) => {
            await updateReserva(editingReserva.id, patch);
            if (isGoogleConnected && user) {
              fetch("/api/google/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id, reservaId: editingReserva.id }),
              }).catch(() => {});
            }
            setEditingReserva(null);
            refetchReservas();
            toast({ title: "Reserva actualizada ✓" });
          }}
        />
      )}

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
                <Button variant="ghost" size="sm" onClick={async () => { await deleteBloqueo(b.id); refetchBloqueos(); }}>Eliminar</Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

function isNuevoLocal(allReservas: Reserva[], clientKey: string): boolean {
  const clientReservas = allReservas.filter(r => slugify(r.clientName) === clientKey);
  if (clientReservas.length === 0) return true;
  const completedOrPast = clientReservas.filter(r => r.status === "completada" || new Date(r.date) < new Date());
  return completedOrPast.length <= 1;
}

function Row({ hour, days, weekReservas, weekBloqueos, googleEvents, allReservas, clientLabelNuevo, clientLabelAntiguo, onDeleteBloqueo, onEditReserva }: {
  hour: number; days: Date[];
  weekReservas: Reserva[];
  weekBloqueos: Bloqueo[];
  googleEvents: GoogleEvent[];
  allReservas: Reserva[];
  clientLabelNuevo: string; clientLabelAntiguo: string;
  onDeleteBloqueo: (id: string) => void;
  onEditReserva: (r: Reserva) => void;
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
        const googleSlot = googleEvents.filter((e) => {
          if (e.allDay) return false;
          const es = new Date(e.start).getTime();
          const ee = new Date(e.end).getTime();
          return es < slotEnd.getTime() && ee > slotStart.getTime();
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
              const nuevo = isNuevoLocal(allReservas, slugify(r.clientName));
              const esControl = !!r.esControl;
              const tone = esControl
                ? "bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/40"
                : nuevo
                  ? "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/30"
                  : "bg-primary/10 text-primary border-primary/20";
              const tag = esControl ? "Control" : nuevo ? "Nuevo" : "Antiguo";
              return (
                <button
                  key={r.id}
                  onClick={() => onEditReserva(r)}
                  className={cn("w-full text-left rounded-md px-1.5 py-1 text-[10px] border space-y-0.5 hover:brightness-95 transition-all group", tone)}
                  title="Clic para editar"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-medium truncate">{r.clientName}</span>
                    <span className="flex items-center gap-0.5">
                      <Pencil className="h-2 w-2 opacity-0 group-hover:opacity-60 transition-opacity" />
                      <span className="text-[8px] uppercase tracking-wider mono opacity-80 shrink-0">{tag}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-1 opacity-80">
                    <span className="mono">{new Date(r.date).toLocaleTimeString("es-CL", { timeZone: "America/Santiago", hour: "2-digit", minute: "2-digit" })}</span>
                    <span className="text-[8px] uppercase mono px-1 rounded bg-current/10">{r.tipoAtencion ?? "pres."}</span>
                  </div>
                </button>
              );
            })}
            {googleSlot.map((e) => (
              <div
                key={e.id}
                className="rounded-md px-1.5 py-1 text-[10px] border space-y-0.5 bg-blue-500/10 text-blue-600 border-blue-400/30"
                title={`Google Calendar: ${e.title}`}
              >
                <div className="flex items-center gap-1 font-medium">
                  <CalIcon className="h-2.5 w-2.5 shrink-0" />
                  <span className="truncate">{e.title}</span>
                </div>
                <div className="mono opacity-80">
                  {new Date(e.start).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            ))}
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

function EditReservaDialog({ reserva, userId, onClose, onSaved }: {
  reserva: Reserva;
  userId: string;
  onClose: () => void;
  onSaved: (patch: Partial<Reserva>) => Promise<void>;
}) {
  const [ficha, setFicha] = useState<{ email?: string; phone?: string; rut?: string } | null>(null);

  useEffect(() => {
    if (!userId) return;
    listFichas(userId).then(fichas => {
      const f = fichas.find(f => f.clientKey === reserva.client_id || f.clientKey === slugify(reserva.clientName));
      if (f) setFicha({ email: f.email, phone: f.phone, rut: f.rut });
    }).catch(() => {});
  }, [userId, reserva.client_id, reserva.clientName]);

  const dt = new Date(reserva.date);
  const toLocalDate = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const santiago = new Date(d.toLocaleString("en-US", { timeZone: "America/Santiago" }));
    return `${santiago.getFullYear()}-${pad(santiago.getMonth() + 1)}-${pad(santiago.getDate())}`;
  };
  const toLocalTime = (d: Date) => {
    const santiago = new Date(d.toLocaleString("en-US", { timeZone: "America/Santiago" }));
    return `${String(santiago.getHours()).padStart(2, "0")}:${String(santiago.getMinutes()).padStart(2, "0")}`;
  };

  const [date, setDate] = useState(toLocalDate(dt));
  const [time, setTime] = useState(toLocalTime(dt));
  const [status, setStatus] = useState(reserva.status);
  const [tipoAtencion, setTipoAtencion] = useState(reserva.tipoAtencion ?? "presencial");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Convert Santiago local time to UTC
    const noonUTC = new Date(`${date}T12:00:00Z`);
    const santiagoNoonHour = parseInt(
      new Intl.DateTimeFormat("en", { timeZone: "America/Santiago", hour: "numeric", hour12: false }).format(noonUTC)
    );
    const offsetMin = (santiagoNoonHour - 12) * 60;
    const localDt = new Date(`${date}T${time}:00Z`);
    localDt.setMinutes(localDt.getMinutes() - offsetMin);
    await onSaved({ date: localDt.toISOString(), status, tipoAtencion });
    setSaving(false);
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar reserva · {reserva.clientName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="text-sm text-muted-foreground">{reserva.serviceName}</div>
          {(ficha?.email || ficha?.phone || ficha?.rut) && (
            <div className="rounded-lg bg-muted/40 px-3 py-2.5 text-xs space-y-1">
              {ficha.email && <div><span className="text-muted-foreground">Email: </span>{ficha.email}</div>}
              {ficha.phone && <div><span className="text-muted-foreground">Teléfono: </span>{ficha.phone}</div>}
              {ficha.rut && <div><span className="text-muted-foreground">RUT: </span>{ficha.rut}</div>}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Fecha</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Hora</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Estado</Label>
            <select value={status} onChange={(e) => setStatus(e.target.value as Reserva["status"])}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="confirmada">Confirmada</option>
              <option value="pendiente">Pendiente</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Modalidad</Label>
            <select value={tipoAtencion} onChange={(e) => setTipoAtencion(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="presencial">Presencial</option>
              <option value="online">Online</option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Guardando…" : "Guardar cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
