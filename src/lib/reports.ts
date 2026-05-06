// Programación mock de reportes automáticos por clienta (localStorage).
import { getUsers } from "./storage";
import { metricsForUser } from "./admin";

export type ReportFrequency = "mensual_28" | "trimestral" | "anual_28dic";
export type ReportFormat = "csv" | "pdf";

export interface ScheduledReport {
  id: string;
  user_id: string;
  enabled: boolean;
  frequency: ReportFrequency;
  format: ReportFormat;
  recipientEmail: string;
  lastSentAt?: string;
  nextRunAt: string;
  createdAt: string;
}

const K = "soma.scheduled_reports";

const read = (): ScheduledReport[] => {
  try { return JSON.parse(localStorage.getItem(K) || "[]"); } catch { return []; }
};
const write = (v: ScheduledReport[]) => localStorage.setItem(K, JSON.stringify(v));

export const FREQUENCY_LABEL: Record<ReportFrequency, string> = {
  mensual_28: "Mensual (día 28)",
  trimestral: "Trimestral",
  anual_28dic: "Anual (28 de diciembre)",
};

export const computeNextRun = (freq: ReportFrequency, from = new Date()): string => {
  const d = new Date(from);
  if (freq === "mensual_28") {
    const target = new Date(d.getFullYear(), d.getMonth(), 28);
    if (d > target) target.setMonth(target.getMonth() + 1);
    return target.toISOString();
  }
  if (freq === "trimestral") {
    const months = [0, 3, 6, 9];
    for (const m of months) {
      const t = new Date(d.getFullYear(), m, 28);
      if (t > d) return t.toISOString();
    }
    return new Date(d.getFullYear() + 1, 0, 28).toISOString();
  }
  // anual_28dic
  const t = new Date(d.getFullYear(), 11, 28);
  if (d > t) t.setFullYear(t.getFullYear() + 1);
  return t.toISOString();
};

export const listReports = (): ScheduledReport[] => read();
export const reportsForUser = (userId: string) => read().filter(r => r.user_id === userId);

export const upsertReport = (r: Omit<ScheduledReport, "id" | "createdAt" | "nextRunAt"> & { id?: string }): ScheduledReport => {
  const list = read();
  const nextRunAt = computeNextRun(r.frequency);
  if (r.id) {
    const next = list.map(x => x.id === r.id ? { ...x, ...r, nextRunAt } : x);
    write(next);
    return next.find(x => x.id === r.id)!;
  }
  const created: ScheduledReport = {
    ...r, id: Math.random().toString(36).slice(2, 10),
    createdAt: new Date().toISOString(), nextRunAt,
  };
  write([...list, created]);
  return created;
};

export const deleteReport = (id: string) => write(read().filter(r => r.id !== id));

export const markSent = (id: string) => {
  const list = read();
  const next = list.map(r => r.id === id
    ? { ...r, lastSentAt: new Date().toISOString(), nextRunAt: computeNextRun(r.frequency, new Date(Date.now() + 86400000)) }
    : r);
  write(next);
};

// Genera un CSV resumen por clienta (mock del envío).
export const generateReportCSV = (userId: string, periodLabel: string): string => {
  const u = getUsers().find(x => x.id === userId);
  if (!u) return "";
  const m = metricsForUser(userId);
  const lines = [
    `Reporte ${periodLabel}`,
    `Negocio,${u.businessName}`,
    `Email,${u.email}`,
    `Tipo,${u.tipoNegocio}`,
    "",
    "Métrica,Valor",
    `Pacientes totales,${m.pacientes}`,
    `Reservas mes,${m.reservasMes}`,
    `Ingresos mes,${m.ingresosMes}`,
    `Ingresos totales,${m.ingresosTotal}`,
    `Última actividad,${m.ultimaActividad || ""}`,
  ];
  return lines.join("\n");
};
