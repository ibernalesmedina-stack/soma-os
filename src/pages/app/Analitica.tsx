import { useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { usePagos, useReservas } from "@/lib/hooks";
import type { Pago, Reserva } from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";
import { PLAN_FEATURES } from "@/lib/plans";
import { PlanLocked } from "@/components/PlanLocked";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCLP, slugify } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Receipt } from "lucide-react";

const TAX_RATE = 0.1525; // 15.25% boletas de honorarios Chile

type Period = "week" | "month" | "year";

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export default function Analitica() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<Period>("month");
  const now = new Date();
  const [year, setYear] = useState<number>(now.getFullYear());
  const [month, setMonth] = useState<number>(now.getMonth());

  const { data: reservas } = useReservas();
  const { data: pagos } = usePagos();

  if (user && !PLAN_FEATURES[user.plan].analytics) return <PlanLocked plan="Premium" feature="Analítica" />;

  const data = useMemo(() => buildSeries(period, year, month, reservas, pagos), [period, year, month, reservas, pagos]);

  const totalIngreso = data.reduce((a, b) => a + b.ingreso, 0);
  const totalReservas = data.reduce((a, b) => a + b.reservas, 0);
  const totalNuevos = data.reduce((a, b) => a + b.nuevos, 0);
  const totalAntiguos = data.reduce((a, b) => a + b.antiguos, 0);

  const years = Array.from({ length: 5 }).map((_, i) => now.getFullYear() - 4 + i);

  return (
    <>
      <PageHeader
        title="Analítica"
        description="Tendencias de ingresos, reservas y pacientes."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {period === "month" && (
              <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="h-8 text-xs border rounded-md bg-card px-2">
                {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
            )}
            {(period === "month" || period === "week" || period === "year") && (
              <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="h-8 text-xs border rounded-md bg-card px-2">
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            )}
            <div className="inline-flex border rounded-md p-0.5 bg-card">
              {(["week", "month", "year"] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "h-8 px-3 text-xs font-medium rounded transition-colors",
                    period === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {p === "week" ? "Semanal" : p === "month" ? "Mensual" : "Anual"}
                </button>
              ))}
            </div>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KPI label="Ingresos del período" value={formatCLP(totalIngreso)} />
        <KPI label="Reservas" value={String(totalReservas)} />
        <KPI label="Pacientes nuevos" value={String(totalNuevos)} />
        <KPI label="Pacientes antiguos" value={String(totalAntiguos)} />
      </div>

      {user?.tipo_negocio === "nutricionista" && totalIngreso > 0 && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900">
              <Receipt className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                Estimación de impuestos — Boleta de honorarios
              </p>
              <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400">
                Retención del 15,25% sobre ingresos brutos del período seleccionado (Art. 74 N°2 LIR).
              </p>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-white dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400">Ingreso bruto</p>
                  <p className="text-base font-semibold text-amber-900 dark:text-amber-100 mt-0.5">{formatCLP(totalIngreso)}</p>
                </div>
                <div className="rounded-lg bg-amber-100 dark:bg-amber-900/50 border border-amber-300 dark:border-amber-600 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-300">Impuesto estimado (15,25%)</p>
                  <p className="text-base font-semibold text-amber-900 dark:text-amber-100 mt-0.5">{formatCLP(Math.round(totalIngreso * TAX_RATE))}</p>
                </div>
                <div className="rounded-lg bg-white dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400">Ingreso neto estimado</p>
                  <p className="text-base font-semibold text-amber-900 dark:text-amber-100 mt-0.5">{formatCLP(Math.round(totalIngreso * (1 - TAX_RATE)))}</p>
                </div>
              </div>
              <p className="mt-2 text-[10px] text-amber-600 dark:text-amber-500">
                * Estimación referencial. Consulta a tu contador para el cálculo definitivo según tu situación tributaria.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="surface-card p-5">
          <h3 className="text-sm font-semibold mb-1">Ingresos en el tiempo</h3>
          <p className="text-xs text-muted-foreground mb-4">{describeRange(period, year, month)}</p>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} formatter={(v: number) => formatCLP(v)} />
                <Area type="monotone" dataKey="ingreso" stroke="hsl(var(--primary))" fill="url(#g)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card p-5">
          <h3 className="text-sm font-semibold mb-1">Volumen de reservas</h3>
          <p className="text-xs text-muted-foreground mb-4">Cantidad agrupada por período.</p>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Bar dataKey="reservas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold mb-1">Pacientes nuevos vs antiguos</h3>
          <p className="text-xs text-muted-foreground mb-4">Comparativa de captación y retención por período.</p>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="nuevos" name="Nuevos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="antiguos" name="Antiguos" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}

function KPI({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-card p-4">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground truncate">{label}</div>
      <div className="text-xl font-semibold tracking-tight mt-1">{value}</div>
    </div>
  );
}

function describeRange(period: Period, year: number, month: number) {
  if (period === "week") return `Semanas del año ${year}`;
  if (period === "month") return `Días de ${MONTHS[month]} ${year}`;
  return `Meses del año ${year}`;
}

interface Bucket { label: string; reservas: number; ingreso: number; nuevos: number; antiguos: number }

function buildSeries(
  period: Period,
  year: number,
  month: number,
  reservas: Reserva[],
  pagos: Pago[],
): Bucket[] {
  // Pre-compute first reservation date per client (to classify nuevo/antiguo)
  const firstByClient = new Map<string, number>();
  for (const r of reservas) {
    const key = slugify(r.clientName);
    const t = new Date(r.date).getTime();
    const prev = firstByClient.get(key);
    if (prev === undefined || t < prev) firstByClient.set(key, t);
  }

  const bucketsFor = (start: Date, end: Date): Pick<Bucket, "reservas" | "ingreso" | "nuevos" | "antiguos"> => {
    const inR = reservas.filter((x) => inRange(x.date, start, end));
    let nuevos = 0, antiguos = 0;
    const seen = new Set<string>();
    for (const r of inR) {
      const key = slugify(r.clientName);
      if (seen.has(key)) continue;
      seen.add(key);
      const first = firstByClient.get(key) ?? Infinity;
      if (first >= start.getTime() && first < end.getTime()) nuevos++;
      else antiguos++;
    }
    return {
      reservas: inR.length,
      ingreso: pagos.filter((p) => p.status === "pagado" && inRange(p.date, start, end)).reduce((a, b) => a + b.amount, 0),
      nuevos,
      antiguos,
    };
  };

  if (period === "week") {
    // 52 semanas del año seleccionado, mostrar todas las semanas con actividad o agrupadas
    return Array.from({ length: 52 }).map((_, i) => {
      const start = new Date(year, 0, 1 + i * 7);
      const end = new Date(start); end.setDate(end.getDate() + 7);
      return { label: `S${i + 1}`, ...bucketsFor(start, end) };
    });
  }
  if (period === "month") {
    // Días del mes seleccionado
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }).map((_, i) => {
      const start = new Date(year, month, i + 1);
      const end = new Date(year, month, i + 2);
      return { label: String(i + 1), ...bucketsFor(start, end) };
    });
  }
  // year: meses del año seleccionado
  return Array.from({ length: 12 }).map((_, i) => {
    const start = new Date(year, i, 1);
    const end = new Date(year, i + 1, 1);
    return { label: MONTHS[i], ...bucketsFor(start, end) };
  });
}

function inRange(iso: string, start: Date, end: Date) {
  const t = new Date(iso).getTime();
  return t >= start.getTime() && t < end.getTime();
}
