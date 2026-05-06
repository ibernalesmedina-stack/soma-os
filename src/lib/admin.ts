// Helpers para agregar métricas globales (admin) usando localStorage de todos los users.
import type { Pago, Reserva, User } from "./types";
import { getUsers } from "./storage";

const read = <T,>(k: string, def: T): T => {
  try { return JSON.parse(localStorage.getItem(k) || "") as T; } catch { return def; }
};

export const allReservas = (): Reserva[] => read<Reserva[]>("soma.reservas", []);
export const allPagos = (): Pago[] => read<Pago[]>("soma.pagos", []);

export interface ClientaMetrics {
  pacientes: number;
  reservasMes: number;
  ingresosMes: number;
  ingresosTotal: number;
  ultimaActividad?: string;
}

export const metricsForUser = (userId: string): ClientaMetrics => {
  const reservas = allReservas().filter(r => r.user_id === userId);
  const pagos = allPagos().filter(p => p.user_id === userId);
  const now = new Date();
  const startMes = new Date(now.getFullYear(), now.getMonth(), 1);
  const reservasMes = reservas.filter(r => new Date(r.date) >= startMes).length;
  const ingresosMes = pagos.filter(p => p.status === "pagado" && new Date(p.date) >= startMes).reduce((a, b) => a + b.amount, 0);
  const ingresosTotal = pagos.filter(p => p.status === "pagado").reduce((a, b) => a + b.amount, 0);
  const pacientes = new Set(reservas.map(r => r.clientName)).size;
  const ultimaActividad = reservas.map(r => r.date).sort().pop();
  return { pacientes, reservasMes, ingresosMes, ingresosTotal, ultimaActividad };
};

export interface GlobalMetrics {
  totalClientas: number;
  nuevasMes: number;
  mrr: number;
  reservasTotales: number;
  usuariosActivos: number;
  ingresosTotales: number;
  promedioPorClienta: number;
  pagosFallidos: number;
}

export const globalMetrics = (): GlobalMetrics => {
  const users = getUsers().filter((u: User) => u.role !== "admin");
  const reservas = allReservas();
  const pagos = allPagos();
  const now = new Date();
  const startMes = new Date(now.getFullYear(), now.getMonth(), 1);
  const startMesAnterior = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const nuevasMes = users.filter(u => new Date(u.createdAt) >= startMes).length;
  const ingresosMes = pagos.filter(p => p.status === "pagado" && new Date(p.date) >= startMes).reduce((a, b) => a + b.amount, 0);
  const ingresosTotales = pagos.filter(p => p.status === "pagado").reduce((a, b) => a + b.amount, 0);
  const pagosFallidos = pagos.filter(p => p.status === "fallido" || p.status === "pendiente").length;
  const usuariosActivos = users.filter(u => u.active !== false).length;
  const promedioPorClienta = users.length > 0 ? Math.round(ingresosTotales / users.length) : 0;

  return {
    totalClientas: users.length,
    nuevasMes,
    mrr: ingresosMes,
    reservasTotales: reservas.length,
    usuariosActivos,
    ingresosTotales,
    promedioPorClienta,
    pagosFallidos,
  };
};

export interface ActivityEvent {
  ts: string;
  kind: "signup" | "reserva" | "pago";
  text: string;
}

export const recentActivity = (limit = 12): ActivityEvent[] => {
  const users = getUsers();
  const evts: ActivityEvent[] = [];
  users.forEach(u => evts.push({ ts: u.createdAt, kind: "signup", text: `Nueva clienta: ${u.businessName} (${u.tipoNegocio})` }));
  allReservas().slice(-30).forEach(r => evts.push({ ts: r.date, kind: "reserva", text: `Reserva: ${r.clientName} · ${r.serviceName}` }));
  allPagos().slice(-30).forEach(p => evts.push({ ts: p.date, kind: "pago", text: `Pago ${p.status}: ${p.clientName} · ${p.method}` }));
  return evts.sort((a, b) => b.ts.localeCompare(a.ts)).slice(0, limit);
};
