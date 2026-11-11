import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { AlertTriangle, Plus, Printer, Trash2, FileSignature, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { addRegistro } from "@/lib/storage";
import { formatCLP, formatDate, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ClienteFicha, Registro, Reserva, SesionNota } from "@/lib/types";
import {
  ARCADAS, CARAS, CONDICIONES, ESTADOS_CARA, ESTADOS_PIEZA, PROCEDIMIENTOS_SUGERIDOS,
  TRATAMIENTOS_ESTETICOS, ZONAS_FACIALES, normalizarDental, uid,
  type Cara, type DentalV2, type EstadoCara, type EstadoPieza, type EstadoPlan, type ItemPlan, type Pieza,
} from "./modelo";

type Props = {
  ficha: ClienteFicha;
  onChange: (k: keyof ClienteFicha, v: string) => void;
  setFicha: (fn: (f: ClienteFicha | null) => ClienteFicha | null) => void;
  notas: SesionNota[];
  setNotas: (n: SesionNota[]) => void;
  reservas: Reserva[];
  registros: Registro[];
  setRegistros: (fn: (r: Registro[]) => Registro[]) => void;
  userId: string;
  clientKey: string;
  profesional: string;
  // Componentes compartidos de la ficha (vienen de ClienteDetalle)
  Section: React.ComponentType<{ title: string; action?: React.ReactNode; children: React.ReactNode }>;
  Field: React.ComponentType<{ label: string; children: React.ReactNode }>;
  HistorialTab: React.ComponentType<{ reservas: Reserva[] }>;
  NotasTab: React.ComponentType<{ notas: SesionNota[]; setNotas: (n: SesionNota[]) => void; userId: string; clientKey: string }>;
  ArchivosTab: React.ComponentType<{ userId: string; clientKey: string }>;
};

const selectCls = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function OdontologaView(p: Props) {
  const { ficha, onChange, setFicha, registros, Section, Field } = p;
  const dental = useMemo(() => normalizarDental(ficha.dental), [ficha.dental]);
  const setDental = (fn: (d: DentalV2) => DentalV2) =>
    setFicha((f) => (f ? { ...f, dental: fn(normalizarDental(f.dental)) as unknown as ClienteFicha["dental"] } : f));

  const alertas = CONDICIONES.filter((c) => c.alerta && dental.anamnesis[c.id]).map((c) => c.label);
  if (ficha.alergias?.trim()) alertas.unshift(`Alergias: ${ficha.alergias.trim()}`);

  const evoluciones = registros.filter((r) => r.tipo === "evolucion");
  const esteticas = registros.filter((r) => r.tipo === "estetica");
  const otros = registros.filter((r) => r.tipo !== "evolucion" && r.tipo !== "estetica");

  return (
    <div className="space-y-4">
      {alertas.length > 0 && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-destructive">Alertas médicas</p>
            <p className="text-sm text-destructive/90">{alertas.join(" · ")}</p>
          </div>
        </div>
      )}

      <Tabs defaultValue="resumen">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="anamnesis">Anamnesis</TabsTrigger>
          <TabsTrigger value="odontograma">Odontograma</TabsTrigger>
          <TabsTrigger value="plan">Plan y presupuesto ({dental.plan.length})</TabsTrigger>
          <TabsTrigger value="evoluciones">Evoluciones ({evoluciones.length})</TabsTrigger>
          <TabsTrigger value="estetica">Estética facial ({esteticas.length})</TabsTrigger>
          <TabsTrigger value="historial">Citas</TabsTrigger>
          <TabsTrigger value="notas">Notas</TabsTrigger>
          <TabsTrigger value="archivos">Archivos</TabsTrigger>
        </TabsList>

        {/* ───────── Resumen ───────── */}
        <TabsContent value="resumen" className="mt-4 space-y-4">
          <ResumenNumeros dental={dental} evoluciones={evoluciones} />
          <Section title="Datos del paciente">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="RUT"><Input value={ficha.rut ?? ""} onChange={(e) => onChange("rut", e.target.value)} /></Field>
              <Field label="Fecha de nacimiento"><Input type="date" value={ficha.birthDate ?? ""} onChange={(e) => onChange("birthDate", e.target.value)} /></Field>
              <Field label="Teléfono"><Input value={ficha.phone ?? ""} onChange={(e) => onChange("phone", e.target.value)} /></Field>
              <Field label="Email"><Input type="email" value={ficha.email ?? ""} onChange={(e) => onChange("email", e.target.value)} /></Field>
              <Field label="Dirección"><Input value={ficha.address ?? ""} onChange={(e) => onChange("address", e.target.value)} /></Field>
              <Field label="Ocupación"><Input value={ficha.occupation ?? ""} onChange={(e) => onChange("occupation", e.target.value)} /></Field>
              <div className="sm:col-span-2"><Field label="Contacto de emergencia"><Input value={ficha.emergencyContact ?? ""} onChange={(e) => onChange("emergencyContact", e.target.value)} /></Field></div>
            </div>
          </Section>
          <Section title="Diagnóstico">
            <div className="grid gap-4">
              <Field label="Motivo de consulta"><Textarea rows={2} value={ficha.motivoConsulta ?? ""} onChange={(e) => onChange("motivoConsulta", e.target.value)} /></Field>
              <Field label="Diagnóstico general"><Textarea rows={3} value={ficha.diagnostico ?? ""} onChange={(e) => onChange("diagnostico", e.target.value)} /></Field>
              <Field label="Próxima acción"><Input value={ficha.proximaAccion ?? ""} onChange={(e) => onChange("proximaAccion", e.target.value)} /></Field>
            </div>
          </Section>
        </TabsContent>

        {/* ───────── Anamnesis ───────── */}
        <TabsContent value="anamnesis" className="mt-4 space-y-4">
          <Section title="Condiciones médicas" action={dental.anamnesisActualizada ? <span className="text-xs text-muted-foreground">Actualizada {formatDate(dental.anamnesisActualizada)}</span> : undefined}>
            <p className="text-xs text-muted-foreground mb-3">Marca las que apliquen. Las marcadas con impacto clínico aparecen como alerta arriba de la ficha.</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {CONDICIONES.map((c) => {
                const on = !!dental.anamnesis[c.id];
                const marcado = c.alerta ? "border-destructive/40 bg-destructive/5" : "border-primary/40 bg-primary/5";
                return (
                  <label key={c.id} className={cn("flex items-center gap-2.5 rounded-md border px-3 py-2 text-sm cursor-pointer transition-colors", on ? marcado : "hover:bg-muted/50")}>
                    <input type="checkbox" className={cn("size-4", c.alerta ? "accent-[hsl(var(--destructive))]" : "accent-[hsl(var(--primary))]")} checked={on}
                      onChange={(e) => setDental((d) => ({ ...d, anamnesis: { ...d.anamnesis, [c.id]: e.target.checked }, anamnesisActualizada: new Date().toISOString() }))} />
                    {c.label}
                  </label>
                );
              })}
            </div>
          </Section>
          <Section title="Antecedentes">
            <div className="grid gap-4">
              <Field label="Alergias (medicamentos, látex, anestésicos…)"><Textarea rows={2} value={ficha.alergias ?? ""} onChange={(e) => onChange("alergias", e.target.value)} /></Field>
              <Field label="Medicamentos actuales"><Textarea rows={2} value={ficha.medicacion ?? ""} onChange={(e) => onChange("medicacion", e.target.value)} /></Field>
              <Field label="Otros antecedentes médicos y cirugías"><Textarea rows={3} value={ficha.antecedentesMedicos ?? ""} onChange={(e) => onChange("antecedentesMedicos", e.target.value)} /></Field>
              <Field label="Antecedentes odontológicos (tratamientos previos, experiencias, hábitos de higiene)"><Textarea rows={3} value={ficha.antecedentesFamiliares ?? ""} onChange={(e) => onChange("antecedentesFamiliares", e.target.value)} /></Field>
            </div>
          </Section>
        </TabsContent>

        {/* ───────── Odontograma ───────── */}
        <TabsContent value="odontograma" className="mt-4">
          <Odontograma dental={dental} setDental={setDental} Section={Section} />
        </TabsContent>

        {/* ───────── Plan y presupuesto ───────── */}
        <TabsContent value="plan" className="mt-4">
          <PlanTratamiento dental={dental} setDental={setDental} ficha={ficha} profesional={p.profesional} Section={Section} />
        </TabsContent>

        {/* ───────── Evoluciones ───────── */}
        <TabsContent value="evoluciones" className="mt-4 space-y-4">
          <Section title="Evoluciones clínicas" action={<EvolucionDialog {...p} />}>
            <p className="text-xs text-muted-foreground mb-3">Cada evolución queda registrada con fecha, hora y profesional, y no se puede modificar (respaldo clínico).</p>
            {evoluciones.length === 0 ? <Vacio msg="Aún no hay evoluciones registradas." /> : (
              <ol className="space-y-3">
                {evoluciones.map((r) => <EvolucionItem key={r.id} r={r} />)}
              </ol>
            )}
          </Section>
          {otros.length > 0 && (
            <Section title="Procedimientos registrados anteriormente">
              <ul className="space-y-2">
                {otros.map((r) => (
                  <li key={r.id} className="rounded-md border px-3 py-2 text-sm">
                    <div className="flex justify-between gap-2"><span className="font-medium">{r.titulo}</span><span className="text-xs text-muted-foreground">{formatDate(r.fecha)}</span></div>
                    {r.notas && <p className="text-muted-foreground mt-1">{r.notas}</p>}
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </TabsContent>

        {/* ───────── Estética facial ───────── */}
        <TabsContent value="estetica" className="mt-4">
          <Section title="Tratamientos de estética facial" action={<EsteticaDialog {...p} />}>
            <p className="text-xs text-muted-foreground mb-3">Registra producto, lote y vencimiento para la trazabilidad. Las fotos de antes y después se suben en la pestaña Archivos.</p>
            {esteticas.length === 0 ? <Vacio msg="Aún no hay tratamientos estéticos registrados." /> : (
              <div className="grid md:grid-cols-2 gap-3">
                {esteticas.map((r) => <EsteticaItem key={r.id} r={r} />)}
              </div>
            )}
          </Section>
        </TabsContent>

        <TabsContent value="historial" className="mt-4"><p.HistorialTab reservas={p.reservas} /></TabsContent>
        <TabsContent value="notas" className="mt-4"><p.NotasTab notas={p.notas} setNotas={p.setNotas} userId={p.userId} clientKey={p.clientKey} /></TabsContent>
        <TabsContent value="archivos" className="mt-4"><p.ArchivosTab userId={p.userId} clientKey={p.clientKey} /></TabsContent>
      </Tabs>
      <p className="text-xs text-muted-foreground">Los cambios de datos, anamnesis, odontograma y plan se guardan con el botón <strong>Guardar</strong>. Las evoluciones y tratamientos estéticos se guardan al registrarlos.</p>
    </div>
  );
}

function Vacio({ msg }: { msg: string }) {
  return <p className="text-sm text-muted-foreground text-center py-8">{msg}</p>;
}

function ResumenNumeros({ dental, evoluciones }: { dental: DentalV2; evoluciones: Registro[] }) {
  const piezas = Object.values(dental.piezas);
  const caries = piezas.filter((x) => x.estado === "caries" || Object.values(x.caras ?? {}).includes("caries")).length;
  const pendiente = dental.plan.filter((i) => i.estado !== "realizado").reduce((s, i) => s + (i.valor || 0), 0);
  const ultima = evoluciones[0]?.fecha;
  const cards = [
    { l: "Piezas con caries", v: String(caries) },
    { l: "Plan pendiente", v: formatCLP(pendiente) },
    { l: "Procedimientos en plan", v: `${dental.plan.filter((i) => i.estado === "realizado").length}/${dental.plan.length}` },
    { l: "Última evolución", v: ultima ? formatDate(ultima) : "—" },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((c) => (
        <div key={c.l} className="rounded-lg border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">{c.l}</p>
          <p className="text-lg font-semibold mt-0.5">{c.v}</p>
        </div>
      ))}
    </div>
  );
}

/* ───────────────────────── Odontograma ───────────────────────── */

type Herramienta = { tipo: "cara"; valor: EstadoCara } | { tipo: "pieza"; valor: EstadoPieza } | { tipo: "borrar" };

function colorEstado(e?: EstadoPieza) { return ESTADOS_PIEZA.find((x) => x.id === e)?.color; }
function colorCara(e?: EstadoCara) { return ESTADOS_CARA.find((x) => x.id === e)?.color; }

function Diente({ n, pieza, seleccionada, onCara, onPieza }: {
  n: number; pieza?: Pieza; seleccionada: boolean;
  onCara: (c: Cara) => void; onPieza: () => void;
}) {
  const superior = [1, 2, 5, 6].includes(Math.floor(n / 10)); // cuadrantes superiores
  const izquierdaPaciente = [2, 3, 6, 7].includes(Math.floor(n / 10));
  // En pantalla: la cara mesial mira a la línea media
  const ladoMedio: Cara = "M", ladoExterno: Cara = "D";
  const izq = izquierdaPaciente ? ladoMedio : ladoExterno;
  const der = izquierdaPaciente ? ladoExterno : ladoMedio;
  const arriba: Cara = superior ? "V" : "L";
  const abajo: Cara = superior ? "L" : "V";
  const caras = pieza?.caras ?? {};
  const fill = (c: Cara) => colorCara(caras[c]) ?? "#fff";
  const est = pieza?.estado;
  const col = colorEstado(est);
  return (
    <div className="flex flex-col items-center gap-1">
      {superior && <span className={cn("text-[10px] font-mono", seleccionada ? "text-primary font-bold" : "text-muted-foreground")}>{n}</span>}
      <svg viewBox="0 0 40 40" className={cn("w-9 h-9 sm:w-10 sm:h-10 cursor-pointer rounded-sm", seleccionada && "ring-2 ring-primary ring-offset-1")} onClick={(e) => { if ((e.target as Element).tagName === "svg") onPieza(); }}>
        <g stroke="#94a3b8" strokeWidth="1">
          <polygon points="2,2 38,2 28,12 12,12" fill={fill(arriba)} onClick={() => onCara(arriba)} />
          <polygon points="12,28 28,28 38,38 2,38" fill={fill(abajo)} onClick={() => onCara(abajo)} />
          <polygon points="2,2 12,12 12,28 2,38" fill={fill(izq)} onClick={() => onCara(izq)} />
          <polygon points="38,2 38,38 28,28 28,12" fill={fill(der)} onClick={() => onCara(der)} />
          <rect x="12" y="12" width="16" height="16" fill={fill("O")} onClick={() => onCara("O")} />
        </g>
        {est === "ausente" && <g stroke={col} strokeWidth="3" pointerEvents="none"><line x1="4" y1="4" x2="36" y2="36" /><line x1="36" y1="4" x2="4" y2="36" /></g>}
        {est === "extraccion" && <g stroke={col} strokeWidth="3" pointerEvents="none"><line x1="4" y1="4" x2="36" y2="36" /><line x1="36" y1="4" x2="4" y2="36" /></g>}
        {est === "corona" && <circle cx="20" cy="20" r="17" fill="none" stroke={col} strokeWidth="3" pointerEvents="none" />}
        {est === "endodoncia" && <line x1="20" y1="3" x2="20" y2="37" stroke={col} strokeWidth="3" pointerEvents="none" />}
        {est === "implante" && <text x="20" y="27" textAnchor="middle" fontSize="20" fontWeight="800" fill={col} pointerEvents="none">I</text>}
        {est === "protesis" && <line x1="2" y1="20" x2="38" y2="20" stroke={col} strokeWidth="3" pointerEvents="none" />}
        {est === "sellante" && <text x="20" y="26" textAnchor="middle" fontSize="16" fontWeight="700" fill={col} pointerEvents="none">S</text>}
        {est === "caries" && <rect x="12" y="12" width="16" height="16" fill="#dc2626" pointerEvents="none" />}
      </svg>
      {!superior && <span className={cn("text-[10px] font-mono", seleccionada ? "text-primary font-bold" : "text-muted-foreground")}>{n}</span>}
    </div>
  );
}

function Odontograma({ dental, setDental, Section }: { dental: DentalV2; setDental: (fn: (d: DentalV2) => DentalV2) => void; Section: Props["Section"] }) {
  const [tool, setTool] = useState<Herramienta>({ tipo: "cara", valor: "caries" });
  const [sel, setSel] = useState<number | null>(null);
  const arc = ARCADAS[dental.denticion];

  const setPieza = (n: number, fn: (p: Pieza) => Pieza | undefined) =>
    setDental((d) => {
      const piezas = { ...d.piezas };
      const next = fn({ ...(piezas[n] ?? {}) });
      if (!next || (!next.estado && !next.nota && !Object.keys(next.caras ?? {}).length)) delete piezas[n];
      else piezas[n] = next;
      return { ...d, piezas };
    });

  const onCara = (n: number, c: Cara) => {
    setSel(n);
    if (tool.tipo === "cara") {
      setPieza(n, (p) => {
        const caras = { ...(p.caras ?? {}) };
        if (caras[c] === tool.valor) delete caras[c]; else caras[c] = tool.valor;
        return { ...p, caras, estado: p.estado === "caries" ? undefined : p.estado };
      });
    } else onPieza(n);
  };
  const onPieza = (n: number) => {
    setSel(n);
    if (tool.tipo === "pieza") setPieza(n, (p) => ({ ...p, estado: p.estado === tool.valor ? undefined : tool.valor }));
    if (tool.tipo === "borrar") setPieza(n, (p) => (p.nota ? { nota: p.nota } : undefined));
  };

  const btn = (activo: boolean) => cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors", activo ? "border-primary bg-primary/10 text-primary font-medium" : "hover:bg-muted");
  const fila = (lado: readonly (readonly number[])[]) => (
    <div className="flex justify-center gap-3 sm:gap-6">
      {lado.map((grupo, gi) => (
        <div key={gi} className="flex gap-0.5 sm:gap-1">
          {grupo.map((n) => <Diente key={n} n={n} pieza={dental.piezas[n]} seleccionada={sel === n} onCara={(c) => onCara(n, c)} onPieza={() => onPieza(n)} />)}
        </div>
      ))}
    </div>
  );
  const pz = sel ? dental.piezas[sel] : undefined;

  return (
    <Section title="Odontograma" action={
      <div className="inline-flex rounded-md border p-0.5 text-xs">
        {(["permanente", "temporal"] as const).map((d) => (
          <button key={d} onClick={() => setDental((x) => ({ ...x, denticion: d }))} className={cn("px-3 py-1 rounded", dental.denticion === d ? "bg-primary text-primary-foreground" : "")}>{d === "permanente" ? "Permanente" : "Temporal"}</button>
        ))}
      </div>
    }>
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">1. Elige una herramienta · 2. Toca una cara del diente (caries u obturación) o el diente completo (borde) para el resto.</p>
          <div className="flex flex-wrap gap-1.5">
            {ESTADOS_CARA.map((e) => (
              <button key={e.id} className={btn(tool.tipo === "cara" && tool.valor === e.id)} onClick={() => setTool({ tipo: "cara", valor: e.id })}>
                <span className="size-2.5 rounded-sm" style={{ background: e.color }} />{e.label} (cara)
              </button>
            ))}
            {ESTADOS_PIEZA.map((e) => (
              <button key={e.id} className={btn(tool.tipo === "pieza" && tool.valor === e.id)} onClick={() => setTool({ tipo: "pieza", valor: e.id })}>
                <span className="size-2.5 rounded-full" style={{ background: e.color }} />{e.label}
              </button>
            ))}
            <button className={btn(tool.tipo === "borrar")} onClick={() => setTool({ tipo: "borrar" })}><Trash2 className="h-3 w-3" />Borrar pieza</button>
          </div>
        </div>

        <div className="overflow-x-auto py-2">
          <div className="min-w-max mx-auto space-y-3">
            {fila(arc.superior)}
            <div className="border-t border-dashed" />
            {fila(arc.inferior)}
          </div>
        </div>

        {sel && (
          <div className="rounded-lg border bg-muted/30 p-3 grid sm:grid-cols-[auto_1fr] gap-3 items-start">
            <div>
              <p className="text-sm font-semibold">Pieza {sel}</p>
              <p className="text-xs text-muted-foreground">
                {pz?.estado ? ESTADOS_PIEZA.find((e) => e.id === pz.estado)?.label ?? (pz.estado === "caries" ? "Caries" : pz.estado) : "Sin estado general"}
                {Object.entries(pz?.caras ?? {}).map(([c, v]) => ` · ${CARAS.find((x) => x.id === c)?.label}: ${v === "caries" ? "caries" : "obturación"}`).join("")}
              </p>
            </div>
            <Input placeholder="Nota de la pieza (opcional)" value={pz?.nota ?? ""} onChange={(e) => setPieza(sel, (p) => ({ ...p, nota: e.target.value || undefined }))} />
          </div>
        )}
      </div>
    </Section>
  );
}

/* ───────────────────────── Plan y presupuesto ───────────────────────── */

const ESTADOS_PLAN: { id: EstadoPlan; label: string; cls: string }[] = [
  { id: "pendiente", label: "Pendiente", cls: "bg-warning/10 text-warning" },
  { id: "en_curso", label: "En curso", cls: "bg-primary/10 text-primary" },
  { id: "realizado", label: "Realizado", cls: "bg-success/10 text-success" },
];

function PlanTratamiento({ dental, setDental, ficha, profesional, Section }: { dental: DentalV2; setDental: (fn: (d: DentalV2) => DentalV2) => void; ficha: ClienteFicha; profesional: string; Section: Props["Section"] }) {
  const plan = dental.plan;
  const upd = (id: string, patch: Partial<ItemPlan>) => setDental((d) => ({ ...d, plan: d.plan.map((i) => (i.id === id ? { ...i, ...patch } : i)) }));
  const add = () => setDental((d) => ({ ...d, plan: [...d.plan, { id: uid(), procedimiento: "", valor: 0, estado: "pendiente" }] }));
  const del = (id: string) => setDental((d) => ({ ...d, plan: d.plan.filter((i) => i.id !== id) }));
  const total = plan.reduce((s, i) => s + (i.valor || 0), 0);
  const realizado = plan.filter((i) => i.estado === "realizado").reduce((s, i) => s + (i.valor || 0), 0);

  return (
    <Section title="Plan de tratamiento y presupuesto" action={
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => imprimirPresupuesto(ficha, plan, profesional)} disabled={!plan.length}><Printer className="h-4 w-4 mr-1.5" />Imprimir</Button>
        <Button size="sm" onClick={add}><Plus className="h-4 w-4 mr-1.5" />Agregar</Button>
      </div>
    }>
      <datalist id="procedimientos-dentales">{PROCEDIMIENTOS_SUGERIDOS.map((x) => <option key={x} value={x} />)}</datalist>
      {plan.length === 0 ? <Vacio msg="Agrega los procedimientos del plan para armar el presupuesto." /> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b">
                <th className="py-2 pr-2 w-20">Pieza</th><th className="py-2 pr-2">Procedimiento</th><th className="py-2 pr-2 w-36">Valor</th><th className="py-2 pr-2 w-36">Estado</th><th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {plan.map((i) => (
                <tr key={i.id} className="border-b last:border-0">
                  <td className="py-2 pr-2"><Input value={i.pieza ?? ""} placeholder="—" onChange={(e) => upd(i.id, { pieza: e.target.value })} /></td>
                  <td className="py-2 pr-2"><Input list="procedimientos-dentales" value={i.procedimiento} placeholder="Ej: Restauración de resina" onChange={(e) => upd(i.id, { procedimiento: e.target.value })} /></td>
                  <td className="py-2 pr-2"><Input type="number" min={0} step={1000} value={i.valor || ""} placeholder="0" onChange={(e) => upd(i.id, { valor: Number(e.target.value) || 0 })} /></td>
                  <td className="py-2 pr-2">
                    <select className={cn(selectCls, ESTADOS_PLAN.find((s) => s.id === i.estado)?.cls)} value={i.estado} onChange={(e) => upd(i.id, { estado: e.target.value as EstadoPlan })}>
                      {ESTADOS_PLAN.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                  </td>
                  <td className="py-2"><button onClick={() => del(i.id)} className="text-muted-foreground hover:text-destructive" title="Quitar"><Trash2 className="h-4 w-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex flex-wrap justify-end gap-x-8 gap-y-1 pt-4 text-sm">
            <span className="text-muted-foreground">Realizado: <strong className="text-foreground">{formatCLP(realizado)}</strong></span>
            <span className="text-muted-foreground">Pendiente: <strong className="text-foreground">{formatCLP(total - realizado)}</strong></span>
            <span>Total: <strong className="text-base">{formatCLP(total)}</strong></span>
          </div>
        </div>
      )}
    </Section>
  );
}

function esc(s: string) {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
}

function imprimirPresupuesto(ficha: ClienteFicha, plan: ItemPlan[], profesional: string) {
  const total = plan.reduce((s, i) => s + (i.valor || 0), 0);
  const filas = plan.map((i) => `<tr><td>${esc(i.pieza || "—")}</td><td>${esc(i.procedimiento || "")}</td><td style="text-align:right">${esc(formatCLP(i.valor || 0))}</td></tr>`).join("");
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Presupuesto · ${esc(ficha.clientName)}</title>
<style>body{font:14px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;color:#222;max-width:760px;margin:40px auto;padding:0 24px}
h1{font-size:22px;margin:0 0 4px}.muted{color:#666;font-size:13px}table{width:100%;border-collapse:collapse;margin-top:24px}
th,td{padding:9px 8px;border-bottom:1px solid #ddd;text-align:left}th{font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:#666}
tfoot td{font-weight:700;font-size:16px;border-bottom:0}.nota{margin-top:28px;font-size:12px;color:#666}</style></head><body>
<h1>Presupuesto de tratamiento</h1>
<p class="muted">${esc(profesional)} · ${esc(formatDate(new Date().toISOString()))}</p>
<p><strong>Paciente:</strong> ${esc(ficha.clientName)}${ficha.rut ? ` · RUT ${esc(ficha.rut)}` : ""}</p>
<table><thead><tr><th style="width:80px">Pieza</th><th>Procedimiento</th><th style="text-align:right;width:140px">Valor</th></tr></thead>
<tbody>${filas}</tbody><tfoot><tr><td></td><td style="text-align:right">Total</td><td style="text-align:right">${esc(formatCLP(total))}</td></tr></tfoot></table>
<p class="nota">Valores referenciales sujetos a la evolución clínica del tratamiento. Presupuesto válido por 30 días.</p>
<script>window.onload=function(){window.print()}</script></body></html>`;
  const w = window.open("", "_blank");
  if (!w) { toast({ title: "Permite las ventanas emergentes para imprimir" }); return; }
  w.document.write(html);
  w.document.close();
}

/* ───────────────────────── Evoluciones ───────────────────────── */

function hoyLocal() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function EvolucionDialog(p: Props) {
  const [open, setOpen] = useState(false);
  const vacio = { fecha: hoyLocal(), piezas: "", procedimiento: "", anestesia: "", materiales: "", descripcion: "", indicaciones: "", proximoControl: "" };
  const [f, setF] = useState(vacio);
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof vacio) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((x) => ({ ...x, [k]: e.target.value }));

  const guardar = async () => {
    if (!f.procedimiento.trim() || !f.descripcion.trim()) { toast({ title: "Completa el procedimiento y la descripción" }); return; }
    setSaving(true);
    try {
      const r = await addRegistro({
        user_id: p.userId, client_id: p.clientKey, clientName: p.ficha.clientName,
        tipo: "evolucion", titulo: f.procedimiento.trim(), fecha: new Date(`${f.fecha}T12:00:00`).toISOString(),
        data: {
          piezas: f.piezas, anestesia: f.anestesia, materiales: f.materiales, indicaciones: f.indicaciones,
          proximoControl: f.proximoControl, profesional: p.profesional, firmadoEn: new Date().toISOString(),
        },
        notas: f.descripcion.trim(),
      });
      p.setRegistros((rs) => [r, ...rs]);
      toast({ title: "Evolución registrada" });
      setF(vacio); setOpen(false);
    } catch {
      toast({ title: "No se pudo guardar la evolución", variant: "destructive" });
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1.5" />Nueva evolución</Button></DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Nueva evolución clínica</DialogTitle></DialogHeader>
        <datalist id="procedimientos-dentales-ev">{PROCEDIMIENTOS_SUGERIDOS.map((x) => <option key={x} value={x} />)}</datalist>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="grid gap-1.5"><Label className="text-xs">Fecha</Label><Input type="date" value={f.fecha} onChange={set("fecha")} /></div>
          <div className="grid gap-1.5"><Label className="text-xs">Pieza(s)</Label><Input placeholder="Ej: 16, 26" value={f.piezas} onChange={set("piezas")} /></div>
          <div className="grid gap-1.5 sm:col-span-2"><Label className="text-xs">Procedimiento *</Label><Input list="procedimientos-dentales-ev" value={f.procedimiento} onChange={set("procedimiento")} /></div>
          <div className="grid gap-1.5"><Label className="text-xs">Anestesia (tipo y cantidad)</Label><Input placeholder="Ej: Lidocaína 2% · 1 tubo" value={f.anestesia} onChange={set("anestesia")} /></div>
          <div className="grid gap-1.5"><Label className="text-xs">Materiales</Label><Input placeholder="Ej: Resina A2" value={f.materiales} onChange={set("materiales")} /></div>
          <div className="grid gap-1.5 sm:col-span-2"><Label className="text-xs">Descripción de lo realizado *</Label><Textarea rows={4} value={f.descripcion} onChange={set("descripcion")} /></div>
          <div className="grid gap-1.5 sm:col-span-2"><Label className="text-xs">Indicaciones al paciente</Label><Textarea rows={2} value={f.indicaciones} onChange={set("indicaciones")} /></div>
          <div className="grid gap-1.5"><Label className="text-xs">Próximo control</Label><Input type="date" value={f.proximoControl} onChange={set("proximoControl")} /></div>
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1.5"><FileSignature className="h-3.5 w-3.5" />Se registrará a nombre de {p.profesional}. Una vez guardada no se puede editar.</p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={guardar} disabled={saving}>{saving ? "Guardando…" : "Registrar evolución"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Dato({ l, v }: { l: string; v?: string | number }) {
  if (v === undefined || v === "") return null;
  return <p className="text-sm"><span className="text-muted-foreground">{l}: </span>{v}</p>;
}

function EvolucionItem({ r }: { r: Registro }) {
  const d = r.data ?? {};
  return (
    <li className="rounded-lg border p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-medium">{r.titulo}{d.piezas ? <span className="text-muted-foreground font-normal"> · pieza {d.piezas}</span> : null}</p>
        <span className="text-xs text-muted-foreground">{formatDate(r.fecha)}</span>
      </div>
      {r.notas && <p className="text-sm mt-2 whitespace-pre-wrap">{r.notas}</p>}
      <div className="mt-2 space-y-0.5">
        <Dato l="Anestesia" v={d.anestesia as string} />
        <Dato l="Materiales" v={d.materiales as string} />
        <Dato l="Indicaciones" v={d.indicaciones as string} />
        <Dato l="Próximo control" v={d.proximoControl ? formatDate(`${d.proximoControl}T12:00:00`) : undefined} />
      </div>
      {d.profesional && (
        <p className="text-[11px] text-muted-foreground mt-3 flex items-center gap-1.5">
          <FileSignature className="h-3 w-3" />Registrado por {d.profesional}{d.firmadoEn ? ` · ${formatDateTime(String(d.firmadoEn))}` : ""}
        </p>
      )}
    </li>
  );
}

/* ───────────────────────── Estética facial ───────────────────────── */

function EsteticaDialog(p: Props) {
  const [open, setOpen] = useState(false);
  const vacio = { fecha: hoyLocal(), tratamiento: TRATAMIENTOS_ESTETICOS[0], producto: "", lote: "", vencimiento: "", cantidad: "", unidad: "U", tecnica: "Aguja", observaciones: "", proximoControl: "" };
  const [f, setF] = useState(vacio);
  const [zonas, setZonas] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof vacio) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF((x) => ({ ...x, [k]: e.target.value }));
  const toggleZona = (z: string) => setZonas((zs) => (zs.includes(z) ? zs.filter((x) => x !== z) : [...zs, z]));

  const guardar = async () => {
    if (!f.tratamiento) return;
    setSaving(true);
    try {
      const r = await addRegistro({
        user_id: p.userId, client_id: p.clientKey, clientName: p.ficha.clientName,
        tipo: "estetica", titulo: f.tratamiento, fecha: new Date(`${f.fecha}T12:00:00`).toISOString(),
        data: {
          producto: f.producto, lote: f.lote, vencimiento: f.vencimiento,
          cantidad: f.cantidad ? `${f.cantidad} ${f.unidad}` : "", zonas: zonas.join(", "), tecnica: f.tecnica,
          proximoControl: f.proximoControl, profesional: p.profesional, firmadoEn: new Date().toISOString(),
        },
        notas: f.observaciones.trim(),
      });
      p.setRegistros((rs) => [r, ...rs]);
      toast({ title: "Tratamiento registrado" });
      setF(vacio); setZonas([]); setOpen(false);
    } catch {
      toast({ title: "No se pudo guardar el tratamiento", variant: "destructive" });
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm"><Sparkles className="h-4 w-4 mr-1.5" />Nuevo tratamiento</Button></DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Registrar tratamiento estético</DialogTitle></DialogHeader>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="grid gap-1.5"><Label className="text-xs">Fecha</Label><Input type="date" value={f.fecha} onChange={set("fecha")} /></div>
          <div className="grid gap-1.5"><Label className="text-xs">Tratamiento</Label>
            <select className={selectCls} value={f.tratamiento} onChange={set("tratamiento")}>{TRATAMIENTOS_ESTETICOS.map((t) => <option key={t}>{t}</option>)}</select>
          </div>
          <div className="grid gap-1.5"><Label className="text-xs">Producto / marca</Label><Input placeholder="Ej: Dysport 300U" value={f.producto} onChange={set("producto")} /></div>
          <div className="grid gap-1.5"><Label className="text-xs">Lote</Label><Input value={f.lote} onChange={set("lote")} /></div>
          <div className="grid gap-1.5"><Label className="text-xs">Vencimiento</Label><Input type="month" value={f.vencimiento} onChange={set("vencimiento")} /></div>
          <div className="grid gap-1.5"><Label className="text-xs">Cantidad</Label>
            <div className="flex gap-2">
              <Input type="number" min={0} step="0.1" value={f.cantidad} onChange={set("cantidad")} />
              <select className={cn(selectCls, "w-28")} value={f.unidad} onChange={set("unidad")}>{["U", "ml", "jeringa(s)", "vial(es)", "sesión"].map((u) => <option key={u}>{u}</option>)}</select>
            </div>
          </div>
          <div className="grid gap-1.5 sm:col-span-2"><Label className="text-xs">Zonas tratadas</Label>
            <div className="flex flex-wrap gap-1.5">
              {ZONAS_FACIALES.map((z) => (
                <button type="button" key={z} onClick={() => toggleZona(z)}
                  className={cn("rounded-full border px-3 py-1 text-xs", zonas.includes(z) ? "border-primary bg-primary/10 text-primary font-medium" : "hover:bg-muted")}>{z}</button>
              ))}
            </div>
          </div>
          <div className="grid gap-1.5"><Label className="text-xs">Técnica</Label>
            <select className={selectCls} value={f.tecnica} onChange={set("tecnica")}>{["Aguja", "Cánula", "Aguja y cánula", "Mesoterapia"].map((t) => <option key={t}>{t}</option>)}</select>
          </div>
          <div className="grid gap-1.5"><Label className="text-xs">Próximo control</Label><Input type="date" value={f.proximoControl} onChange={set("proximoControl")} /></div>
          <div className="grid gap-1.5 sm:col-span-2"><Label className="text-xs">Observaciones</Label><Textarea rows={3} value={f.observaciones} onChange={set("observaciones")} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={guardar} disabled={saving}>{saving ? "Guardando…" : "Registrar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EsteticaItem({ r }: { r: Registro }) {
  const d = r.data ?? {};
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-medium">{r.titulo}</p>
        <span className="text-xs text-muted-foreground">{formatDate(r.fecha)}</span>
      </div>
      <div className="mt-2 space-y-0.5">
        <Dato l="Producto" v={d.producto as string} />
        <Dato l="Lote" v={[d.lote, d.vencimiento ? `vence ${d.vencimiento}` : ""].filter(Boolean).join(" · ")} />
        <Dato l="Cantidad" v={d.cantidad as string} />
        <Dato l="Zonas" v={d.zonas as string} />
        <Dato l="Técnica" v={d.tecnica as string} />
        <Dato l="Próximo control" v={d.proximoControl ? formatDate(`${d.proximoControl}T12:00:00`) : undefined} />
      </div>
      {r.notas && <p className="text-sm mt-2 whitespace-pre-wrap">{r.notas}</p>}
      {d.profesional && <p className="text-[11px] text-muted-foreground mt-3">Registrado por {d.profesional}{d.firmadoEn ? ` · ${formatDateTime(String(d.firmadoEn))}` : ""}</p>}
    </div>
  );
}
