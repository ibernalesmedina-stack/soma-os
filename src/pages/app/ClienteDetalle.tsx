import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import {
  addNota, addProgreso, deleteNota, deleteProgreso, getOrCreateFicha,
  listFichas, listNotas, listPagos, listProgreso, listRegistros, listReservas, updateFicha,
} from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/StatusBadge";
import { AtencionBadge } from "@/components/AtencionBadge";
import { formatCLP, formatDate, formatDateTime, slugify } from "@/lib/format";
import type { ClienteFicha, ProgresoEntry, SesionNota } from "@/lib/types";
import { ArrowLeft, Plus, Save, Trash2, CalendarPlus, FileText, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { BUSINESS_CONFIG } from "@/lib/business";
import { cn } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function ClienteDetalle() {
  const { clientKey = "" } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const reservas = useMemo(() => user ? listReservas(user.id).filter(r => slugify(r.clientName) === clientKey) : [], [user, clientKey]);
  const pagos = useMemo(() => user ? listPagos(user.id).filter(p => slugify(p.clientName) === clientKey) : [], [user, clientKey]);
  const registros = useMemo(() => user ? listRegistros(user.id).filter(r => r.client_id === clientKey) : [], [user, clientKey]);

  const clientName = reservas[0]?.clientName ?? pagos[0]?.clientName ?? listFichas(user?.id ?? "").find(f => f.clientKey === clientKey)?.clientName;

  const [ficha, setFicha] = useState<ClienteFicha | null>(null);
  const [notas, setNotas] = useState<SesionNota[]>([]);
  const [progreso, setProgreso] = useState<ProgresoEntry[]>([]);

  useEffect(() => {
    if (!user || !clientName) return;
    const f = getOrCreateFicha(user.id, clientName);
    setFicha(f);
    setNotas(listNotas(user.id).filter(n => n.clientKey === clientKey).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setProgreso(listProgreso(user.id).filter(p => p.clientKey === clientKey).sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()));
  }, [user, clientName, clientKey]);

  if (!user) return null;
  if (!clientName || !ficha) {
    return (
      <div className="text-center py-16">
        <p className="text-sm font-medium">Ficha no encontrada</p>
        <Button variant="link" onClick={() => navigate("/app/clientes")}>Volver</Button>
      </div>
    );
  }

  const cfg = BUSINESS_CONFIG[user.tipoNegocio];
  const ultimaVisita = reservas.filter(r => r.status === "completada").sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date;
  const initials = clientName.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

  const onChange = (k: keyof ClienteFicha, v: string) => setFicha((f) => f ? { ...f, [k]: v } : f);
  const onSave = () => {
    if (!ficha) return;
    updateFicha(ficha.id, ficha);
    toast({ title: "Ficha guardada" });
  };

  const estadoLabel = ficha.estado ?? "activo";
  const estadoColor = estadoLabel === "alta" ? "bg-success/10 text-success" : estadoLabel === "pausa" ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary";

  return (
    <>
      <Link to="/app/clientes" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3">
        <ArrowLeft className="h-3.5 w-3.5" /> Volver
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-full bg-primary/10 text-primary text-base font-semibold grid place-items-center">{initials}</div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-semibold tracking-tight">{clientName}</h1>
              <span className={cn("text-[10px] uppercase mono px-2 py-0.5 rounded-full font-medium", estadoColor)}>{estadoLabel}</span>
              <AtencionBadge tipo={ficha.tipoAtencion} />
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
              <span>{cfg.clientLabel}</span>
              <span>· Última visita: {ultimaVisita ? formatDate(ultimaVisita) : "—"}</span>
              <span>· {reservas.length} sesiones</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            className="h-9 rounded-md border border-input bg-background px-2 text-xs"
            value={ficha.tipoAtencion ?? "presencial"}
            onChange={(e) => onChange("tipoAtencion", e.target.value)}
            title="Tipo de atención"
          >
            <option value="presencial">Presencial</option>
            <option value="online">Online</option>
          </select>
          <Button variant="outline" size="sm" onClick={() => navigate("/app/calendario")}><CalendarPlus className="h-4 w-4 mr-1.5" />Agendar</Button>
          <Button variant="outline" size="sm" onClick={() => navigate("/app/registros")}><FileText className="h-4 w-4 mr-1.5" />Nueva acción</Button>
          <Button size="sm" onClick={onSave}><Save className="h-4 w-4 mr-1.5" />Guardar</Button>
        </div>
      </div>

      {user.tipoNegocio === "nutricionista" && (
        <NutricionistaView ficha={ficha} onChange={onChange} progreso={progreso} setProgreso={setProgreso}
          notas={notas} setNotas={setNotas} reservas={reservas} userId={user.id} clientKey={clientKey} registros={registros} />
      )}
      {user.tipoNegocio === "psicologa" && (
        <PsicologaView ficha={ficha} onChange={onChange} notas={notas} setNotas={setNotas}
          reservas={reservas} userId={user.id} clientKey={clientKey} registros={registros} />
      )}
      {user.tipoNegocio === "cosmetologa" && (
        <CosmetologaView ficha={ficha} setFicha={setFicha} onChange={onChange} notas={notas} setNotas={setNotas}
          reservas={reservas} pagos={pagos} userId={user.id} clientKey={clientKey} registros={registros}
          submodulos={user.submodulos ?? []} />
      )}
      {user.tipoNegocio === "odontologa" && (
        <OdontologaView ficha={ficha} onChange={onChange} setFicha={setFicha} notas={notas} setNotas={setNotas}
          reservas={reservas} userId={user.id} clientKey={clientKey} registros={registros} />
      )}
    </>
  );
}

/* ---------------- Shared subcomponents ---------------- */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid gap-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="surface-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ msg }: { msg?: string }) {
  return <div className="text-center py-10 text-sm text-muted-foreground">{msg ?? "Aún no tienes registros"}</div>;
}

function MetricCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="surface-card p-4">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold tracking-tight mt-1">{value}</div>
      {hint && <div className="text-[11px] text-muted-foreground mt-0.5">{hint}</div>}
    </div>
  );
}

function NotasTab({ notas, setNotas, userId, clientKey, privado = false }: { notas: SesionNota[]; setNotas: (n: SesionNota[]) => void; userId: string; clientKey: string; privado?: boolean; }) {
  return (
    <Section title={privado ? "Notas privadas" : "Notas"} action={
      <NotaDialog onSave={(n) => {
        const created = addNota({ ...n, user_id: userId, clientKey });
        setNotas([created, ...notas]);
        toast({ title: "Nota agregada" });
      }} />
    }>
      {notas.length === 0 ? <EmptyState /> : (
        <ol className="relative border-l border-border ml-2 space-y-4">
          {notas.map((n) => (
            <li key={n.id} className="ml-4">
              <span className="absolute -left-[5px] mt-1.5 size-2.5 rounded-full bg-primary" />
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs mono text-muted-foreground">{formatDate(n.date)}</div>
                  <div className="text-sm font-medium mt-0.5">{n.title}</div>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { deleteNota(n.id); setNotas(notas.filter(x => x.id !== n.id)); }}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-1">{n.content}</p>
            </li>
          ))}
        </ol>
      )}
    </Section>
  );
}

function HistorialTab({ reservas }: { reservas: ReturnType<typeof listReservas> }) {
  return (
    <div className="surface-card overflow-hidden">
      {reservas.length === 0 ? <EmptyState /> : (
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-4 py-2.5">Fecha</th>
              <th className="text-left font-medium px-4 py-2.5">Servicio</th>
              <th className="text-left font-medium px-4 py-2.5">Tipo</th>
              <th className="text-left font-medium px-4 py-2.5">Estado</th>
              <th className="text-right font-medium px-4 py-2.5">Monto</th>
            </tr>
          </thead>
          <tbody>
            {[...reservas].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(r => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-3 mono text-xs">{formatDateTime(r.date)}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.serviceName}</td>
                <td className="px-4 py-3"><AtencionBadge tipo={r.tipoAtencion} /></td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-3 text-right mono">{formatCLP(r.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ---------------- NUTRICIONISTA ---------------- */

function NutricionistaView({ ficha, onChange, progreso, setProgreso, notas, setNotas, reservas, userId, clientKey, registros }: any) {
  const peso = parseFloat(ficha.pesoActual ?? "") || 0;
  const pesoIni = parseFloat(ficha.pesoInicial ?? "") || 0;
  const cambio = peso && pesoIni ? (peso - pesoIni).toFixed(1) : "—";

  return (
    <Tabs defaultValue="resumen">
      <TabsList>
        <TabsTrigger value="resumen">Resumen</TabsTrigger>
        <TabsTrigger value="progreso">Progreso ({progreso.length})</TabsTrigger>
        <TabsTrigger value="planes">Planes ({registros.length})</TabsTrigger>
        <TabsTrigger value="historial">Historial</TabsTrigger>
        <TabsTrigger value="notas">Notas</TabsTrigger>
      </TabsList>

      <TabsContent value="resumen" className="mt-4 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard label="Peso actual" value={ficha.pesoActual ? `${ficha.pesoActual} kg` : "—"} hint={`Inicial: ${ficha.pesoInicial ?? "—"} kg`} />
          <MetricCard label="% Grasa" value={ficha.porcGrasa ? `${ficha.porcGrasa}%` : "—"} />
          <MetricCard label="% Muscular" value={ficha.porcMuscular ? `${ficha.porcMuscular}%` : "—"} />
          <MetricCard label="Cambio" value={`${cambio} kg`} />
        </div>
        <Section title="Datos">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Edad"><Input value={ficha.edad ?? ""} onChange={e => onChange("edad", e.target.value)} /></Field>
            <Field label="Altura (cm)"><Input value={ficha.altura ?? ""} onChange={e => onChange("altura", e.target.value)} /></Field>
            <Field label="Peso inicial (kg)"><Input value={ficha.pesoInicial ?? ""} onChange={e => onChange("pesoInicial", e.target.value)} /></Field>
            <Field label="Peso actual (kg)"><Input value={ficha.pesoActual ?? ""} onChange={e => onChange("pesoActual", e.target.value)} /></Field>
            <Field label="% Grasa"><Input value={ficha.porcGrasa ?? ""} onChange={e => onChange("porcGrasa", e.target.value)} /></Field>
            <Field label="% Muscular"><Input value={ficha.porcMuscular ?? ""} onChange={e => onChange("porcMuscular", e.target.value)} /></Field>
            <div className="sm:col-span-2"><Field label="Objetivo"><Textarea rows={2} value={ficha.objetivoTexto ?? ""} onChange={e => onChange("objetivoTexto", e.target.value)} /></Field></div>
          </div>
        </Section>
      </TabsContent>

      <TabsContent value="progreso" className="mt-4 space-y-4">
        <Section title="Evolución" action={
          <ProgresoDialog onSave={(p) => {
            const created = addProgreso({ ...p, user_id: userId, clientKey });
            setProgreso([...progreso, created].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()));
            toast({ title: "Medición guardada" });
          }} />
        }>
          {progreso.length === 0 ? <EmptyState /> : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progreso.map((p: ProgresoEntry) => ({ fecha: formatDate(p.fecha), peso: p.peso, grasa: p.porcGrasa, muscular: p.porcMuscular }))}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="fecha" className="text-[10px]" />
                  <YAxis className="text-[10px]" />
                  <Tooltip />
                  <Line type="monotone" dataKey="peso" stroke="hsl(var(--primary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="grasa" stroke="hsl(var(--warning))" strokeWidth={2} />
                  <Line type="monotone" dataKey="muscular" stroke="hsl(var(--success))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Section>
        {progreso.length > 0 && (
          <div className="surface-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-4 py-2.5">Fecha</th>
                  <th className="text-left font-medium px-4 py-2.5">Peso</th>
                  <th className="text-left font-medium px-4 py-2.5">% Grasa</th>
                  <th className="text-left font-medium px-4 py-2.5">% Muscular</th>
                  <th className="text-left font-medium px-4 py-2.5">Notas</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {[...progreso].reverse().map((p: ProgresoEntry) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-4 py-3 mono text-xs">{formatDate(p.fecha)}</td>
                    <td className="px-4 py-3">{p.peso ?? "—"}</td>
                    <td className="px-4 py-3">{p.porcGrasa ?? "—"}</td>
                    <td className="px-4 py-3">{p.porcMuscular ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{p.notas ?? "—"}</td>
                    <td className="px-4 py-3"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { deleteProgreso(p.id); setProgreso(progreso.filter((x: ProgresoEntry) => x.id !== p.id)); }}><Trash2 className="h-3.5 w-3.5" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </TabsContent>

      <TabsContent value="planes" className="mt-4">
        <RegistrosLista registros={registros} />
      </TabsContent>

      <TabsContent value="historial" className="mt-4"><HistorialTab reservas={reservas} /></TabsContent>
      <TabsContent value="notas" className="mt-4"><NotasTab notas={notas} setNotas={setNotas} userId={userId} clientKey={clientKey} /></TabsContent>
    </Tabs>
  );
}

/* ---------------- PSICOLOGA ---------------- */

function PsicologaView({ ficha, onChange, notas, setNotas, reservas, userId, clientKey, registros }: any) {
  return (
    <Tabs defaultValue="resumen">
      <TabsList>
        <TabsTrigger value="resumen">Resumen</TabsTrigger>
        <TabsTrigger value="sesiones">Sesiones ({registros.length})</TabsTrigger>
        <TabsTrigger value="proceso">Proceso</TabsTrigger>
        <TabsTrigger value="notas">Notas privadas ({notas.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="resumen" className="mt-4 space-y-4">
        <Section title="Datos del proceso">
          <div className="grid gap-4">
            <Field label="Estado">
              <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={ficha.estado ?? "activo"} onChange={e => onChange("estado", e.target.value)}>
                <option value="activo">Activo</option><option value="pausa">En pausa</option><option value="alta">Alta</option>
              </select>
            </Field>
            <Field label="Motivo de consulta"><Textarea rows={3} value={ficha.motivoConsulta ?? ""} onChange={e => onChange("motivoConsulta", e.target.value)} /></Field>
            <Field label="Objetivos terapéuticos"><Textarea rows={3} value={ficha.objetivos ?? ""} onChange={e => onChange("objetivos", e.target.value)} /></Field>
          </div>
        </Section>
      </TabsContent>

      <TabsContent value="sesiones" className="mt-4">
        {registros.length === 0 ? <div className="surface-card"><EmptyState msg="Aún no tienes sesiones registradas" /></div> : (
          <ol className="relative border-l border-border ml-2 space-y-4 pl-4">
            {registros.map((r: any) => (
              <li key={r.id} className="surface-card p-4">
                <div className="text-xs mono text-muted-foreground">{formatDate(r.fecha)}</div>
                <div className="text-sm font-medium mt-0.5">{r.titulo}</div>
                {r.notas && <p className="text-sm text-muted-foreground mt-1">{r.notas}</p>}
              </li>
            ))}
          </ol>
        )}
      </TabsContent>

      <TabsContent value="proceso" className="mt-4 space-y-4">
        <Section title="Evaluación del proceso">
          <div className="grid gap-4">
            <Field label="Nivel de avance">
              <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={ficha.evaluacionNivel ?? "medio"} onChange={e => onChange("evaluacionNivel", e.target.value)}>
                <option value="bajo">Bajo</option><option value="medio">Medio</option><option value="alto">Alto</option>
              </select>
            </Field>
            <Field label="Progreso"><Textarea rows={4} value={ficha.progresoTexto ?? ""} onChange={e => onChange("progresoTexto", e.target.value)} /></Field>
            <Field label="Alertas / observaciones críticas">
              <div className="flex gap-2">
                <AlertCircle className="h-4 w-4 text-warning mt-2.5 shrink-0" />
                <Textarea rows={2} value={ficha.alertas ?? ""} onChange={e => onChange("alertas", e.target.value)} />
              </div>
            </Field>
          </div>
        </Section>
      </TabsContent>

      <TabsContent value="notas" className="mt-4"><NotasTab notas={notas} setNotas={setNotas} userId={userId} clientKey={clientKey} privado /></TabsContent>
    </Tabs>
  );
}

/* ---------------- COSMETOLOGA ---------------- */

function CosmetologaView({ ficha, setFicha, onChange, notas, setNotas, reservas, pagos, userId, clientKey, registros, submodulos }: any) {
  const [recoNew, setRecoNew] = useState("");
  const recos = ficha.recomendaciones ?? [];

  return (
    <Tabs defaultValue="resumen">
      <TabsList className="flex-wrap h-auto">
        <TabsTrigger value="resumen">Resumen</TabsTrigger>
        <TabsTrigger value="tratamientos">Tratamientos ({registros.length})</TabsTrigger>
        <TabsTrigger value="historial">Historial</TabsTrigger>
        <TabsTrigger value="recomendaciones">Recomendaciones</TabsTrigger>
        {submodulos.includes("piel") && <TabsTrigger value="piel">Piel</TabsTrigger>}
        {submodulos.includes("unas") && <TabsTrigger value="unas">Uñas</TabsTrigger>}
        {submodulos.includes("pestanas") && <TabsTrigger value="pestanas">Pestañas</TabsTrigger>}
        <TabsTrigger value="notas">Notas</TabsTrigger>
      </TabsList>

      <TabsContent value="resumen" className="mt-4 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard label="Tipo de piel" value={ficha.tipoPiel || "—"} />
          <MetricCard label="Sensibilidad" value={ficha.sensibilidad || "—"} />
          <MetricCard label="Frecuencia" value={ficha.frecuencia || "—"} />
          <MetricCard label="Último tratamiento" value={registros[0] ? formatDate(registros[0].fecha) : "—"} />
        </div>
        <Section title="Datos generales">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Tipo de piel"><Input value={ficha.tipoPiel ?? ""} onChange={e => onChange("tipoPiel", e.target.value)} /></Field>
            <Field label="Sensibilidad"><Input value={ficha.sensibilidad ?? ""} onChange={e => onChange("sensibilidad", e.target.value)} /></Field>
            <Field label="Frecuencia ideal"><Input value={ficha.frecuencia ?? ""} onChange={e => onChange("frecuencia", e.target.value)} /></Field>
            <Field label="Rutina actual"><Input value={ficha.rutinaActual ?? ""} onChange={e => onChange("rutinaActual", e.target.value)} /></Field>
          </div>
        </Section>
      </TabsContent>

      <TabsContent value="tratamientos" className="mt-4">
        {registros.length === 0 ? <div className="surface-card"><EmptyState /></div> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {registros.map((r: any) => (
              <div key={r.id} className="surface-card p-4">
                <div className="text-xs mono text-muted-foreground">{formatDate(r.fecha)}</div>
                <div className="text-sm font-semibold mt-1">{r.titulo}</div>
                {r.notas && <p className="text-xs text-muted-foreground mt-2 line-clamp-3">{r.notas}</p>}
              </div>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="historial" className="mt-4"><HistorialTab reservas={reservas} /></TabsContent>

      <TabsContent value="recomendaciones" className="mt-4">
        <Section title="Recomendaciones">
          <div className="space-y-2 mb-3">
            {recos.length === 0 ? <EmptyState /> : recos.map((r: string, i: number) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-md border">
                <span className="text-sm">{r}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                  const next = recos.filter((_: string, idx: number) => idx !== i);
                  setFicha((f: ClienteFicha | null) => f ? { ...f, recomendaciones: next } : f);
                }}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input placeholder="Agregar recomendación…" value={recoNew} onChange={e => setRecoNew(e.target.value)} />
            <Button onClick={() => { if (!recoNew.trim()) return; setFicha((f: ClienteFicha | null) => f ? { ...f, recomendaciones: [...recos, recoNew.trim()] } : f); setRecoNew(""); }}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </Section>
      </TabsContent>

      {submodulos.includes("piel") && (
        <TabsContent value="piel" className="mt-4 space-y-4">
          <Section title="Diagnóstico de piel">
            <Textarea rows={4} placeholder="Diagnóstico, observaciones, evolución…" value={ficha.evaluacionInicial ?? ""} onChange={e => onChange("evaluacionInicial", e.target.value)} />
          </Section>
          <Section title="Rutina recomendada">
            <Textarea rows={4} placeholder="Mañana / Noche / Productos…" value={ficha.planTratamiento ?? ""} onChange={e => onChange("planTratamiento", e.target.value)} />
          </Section>
        </TabsContent>
      )}

      {submodulos.includes("unas") && (
        <TabsContent value="unas" className="mt-4 space-y-4">
          <Section title="Uñas">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Tipo de uña"><Input value={ficha.notasGenerales ?? ""} onChange={e => onChange("notasGenerales", e.target.value)} /></Field>
              <Field label="Preferencias"><Input value={ficha.objetivos ?? ""} onChange={e => onChange("objetivos", e.target.value)} /></Field>
            </div>
            <p className="text-xs text-muted-foreground mt-3">Galería de fotos próximamente.</p>
          </Section>
        </TabsContent>
      )}

      {submodulos.includes("pestanas") && (
        <TabsContent value="pestanas" className="mt-4 space-y-4">
          <Section title="Pestañas">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Tipo de vello"><Input value={ficha.antecedentesMedicos ?? ""} onChange={e => onChange("antecedentesMedicos", e.target.value)} /></Field>
              <Field label="Estilo preferido"><Input value={ficha.objetivos ?? ""} onChange={e => onChange("objetivos", e.target.value)} /></Field>
            </div>
          </Section>
        </TabsContent>
      )}

      <TabsContent value="notas" className="mt-4"><NotasTab notas={notas} setNotas={setNotas} userId={userId} clientKey={clientKey} /></TabsContent>
    </Tabs>
  );
}


/* ---------------- ODONTOLOGA ---------------- */

const PIEZAS = [11,12,13,14,15,16,17,18, 21,22,23,24,25,26,27,28, 31,32,33,34,35,36,37,38, 41,42,43,44,45,46,47,48];

function OdontologaView({ ficha, onChange, setFicha, notas, setNotas, reservas, userId, clientKey, registros }: any) {
  const dental: Record<string, "sano" | "caries" | "tratado"> = ficha.dental ?? {};
  const cycle = (current?: string) => current === "sano" || !current ? "caries" : current === "caries" ? "tratado" : "sano";
  const togglePieza = (n: number) => {
    const next = { ...dental, [n]: cycle(dental[n]) };
    setFicha((f: ClienteFicha | null) => f ? { ...f, dental: next } : f);
  };
  const colorFor = (s?: string) => s === "caries" ? "bg-destructive text-destructive-foreground" : s === "tratado" ? "bg-success text-success-foreground" : "bg-muted text-foreground";

  return (
    <Tabs defaultValue="resumen">
      <TabsList>
        <TabsTrigger value="resumen">Resumen</TabsTrigger>
        <TabsTrigger value="dental">Ficha dental</TabsTrigger>
        <TabsTrigger value="tratamientos">Tratamientos ({registros.length})</TabsTrigger>
        <TabsTrigger value="historial">Historial</TabsTrigger>
        <TabsTrigger value="notas">Notas</TabsTrigger>
      </TabsList>

      <TabsContent value="resumen" className="mt-4 space-y-4">
        <Section title="Resumen clínico">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Edad"><Input value={ficha.edad ?? ""} onChange={e => onChange("edad", e.target.value)} /></Field>
            <Field label="Próxima acción"><Input value={ficha.proximaAccion ?? ""} onChange={e => onChange("proximaAccion", e.target.value)} /></Field>
            <div className="sm:col-span-2"><Field label="Diagnóstico general"><Textarea rows={3} value={ficha.diagnostico ?? ""} onChange={e => onChange("diagnostico", e.target.value)} /></Field></div>
          </div>
        </Section>
      </TabsContent>

      <TabsContent value="dental" className="mt-4">
        <Section title="Ficha dental">
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Click en una pieza para alternar: sano → caries → tratado.</p>
            {[ [11,12,13,14,15,16,17,18], [21,22,23,24,25,26,27,28], [41,42,43,44,45,46,47,48], [31,32,33,34,35,36,37,38] ].map((row, ri) => (
              <div key={ri} className="flex gap-1.5 justify-center">
                {row.map(n => (
                  <button key={n} onClick={() => togglePieza(n)}
                    className={cn("size-9 rounded-md text-xs mono font-semibold transition-colors", colorFor(dental[n]))}>
                    {n}
                  </button>
                ))}
              </div>
            ))}
            <div className="flex items-center gap-3 pt-3 text-[11px] text-muted-foreground justify-center">
              <span className="inline-flex items-center gap-1.5"><span className="size-3 rounded-sm bg-muted" />Sano</span>
              <span className="inline-flex items-center gap-1.5"><span className="size-3 rounded-sm bg-destructive" />Caries</span>
              <span className="inline-flex items-center gap-1.5"><span className="size-3 rounded-sm bg-success" />Tratado</span>
            </div>
          </div>
        </Section>
      </TabsContent>

      <TabsContent value="tratamientos" className="mt-4"><RegistrosLista registros={registros} /></TabsContent>
      <TabsContent value="historial" className="mt-4"><HistorialTab reservas={reservas} /></TabsContent>
      <TabsContent value="notas" className="mt-4"><NotasTab notas={notas} setNotas={setNotas} userId={userId} clientKey={clientKey} /></TabsContent>
    </Tabs>
  );
}

/* ---------------- Lista genérica de registros ---------------- */

function RegistrosLista({ registros }: { registros: any[] }) {
  if (registros.length === 0) return <div className="surface-card"><EmptyState /></div>;
  return (
    <div className="surface-card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="text-left font-medium px-4 py-2.5">Fecha</th>
            <th className="text-left font-medium px-4 py-2.5">Título</th>
            <th className="text-left font-medium px-4 py-2.5">Notas</th>
          </tr>
        </thead>
        <tbody>
          {registros.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="px-4 py-3 mono text-xs">{formatDate(r.fecha)}</td>
              <td className="px-4 py-3 font-medium">{r.titulo}</td>
              <td className="px-4 py-3 text-muted-foreground text-xs">{r.notas ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------- Dialogs ---------------- */

function NotaDialog({ onSave }: { onSave: (n: { date: string; title: string; content: string }) => void }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1.5" />Nueva nota</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Nueva nota</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <Field label="Fecha"><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></Field>
          <Field label="Título"><Input value={title} onChange={e => setTitle(e.target.value)} /></Field>
          <Field label="Contenido"><Textarea rows={6} value={content} onChange={e => setContent(e.target.value)} /></Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={() => {
            if (!title.trim()) return;
            onSave({ date: new Date(date).toISOString(), title: title.trim(), content: content.trim() });
            setOpen(false); setTitle(""); setContent("");
          }}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProgresoDialog({ onSave }: { onSave: (p: { fecha: string; peso?: number; porcGrasa?: number; porcMuscular?: number; notas?: string }) => void }) {
  const [open, setOpen] = useState(false);
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [peso, setPeso] = useState("");
  const [grasa, setGrasa] = useState("");
  const [muscular, setMuscular] = useState("");
  const [notas, setNotas] = useState("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1.5" />Medición</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Nueva medición</DialogTitle></DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Fecha"><Input type="date" value={fecha} onChange={e => setFecha(e.target.value)} /></Field>
          <Field label="Peso (kg)"><Input type="number" step="0.1" value={peso} onChange={e => setPeso(e.target.value)} /></Field>
          <Field label="% Grasa"><Input type="number" step="0.1" value={grasa} onChange={e => setGrasa(e.target.value)} /></Field>
          <Field label="% Muscular"><Input type="number" step="0.1" value={muscular} onChange={e => setMuscular(e.target.value)} /></Field>
          <div className="sm:col-span-2"><Field label="Notas"><Textarea rows={2} value={notas} onChange={e => setNotas(e.target.value)} /></Field></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={() => {
            onSave({
              fecha: new Date(fecha).toISOString(),
              peso: peso ? parseFloat(peso) : undefined,
              porcGrasa: grasa ? parseFloat(grasa) : undefined,
              porcMuscular: muscular ? parseFloat(muscular) : undefined,
              notas: notas || undefined,
            });
            setOpen(false); setPeso(""); setGrasa(""); setMuscular(""); setNotas("");
          }}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
