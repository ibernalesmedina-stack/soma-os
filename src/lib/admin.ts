import type { Pago, Reserva, User } from "./types";

// Admin.ts reads from Supabase via the hooks; these helpers accept pre-loaded data as params.

export const allReservas = (): Reserva[] => [];
export const allPagos = (): Pago[] => [];

export interface ClientaMetrics {
  pacientes: number;
  reservasMes: number;
  ingresosMes: number;
  ingresosTotal: number;
  ultimaActividad?: string;
}

export const metricsForUser = (userId: string): ClientaMetrics => {
  return { pacientes: 0, reservasMes: 0, ingresosMes: 0, ingresosTotal: 0 };
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

export const globalMetrics = (users: User[] = []): GlobalMetrics => {
  const clientes = users.filter(u => u.role !== "admin");
  const now = new Date();
  const startMes = new Date(now.getFullYear(), now.getMonth(), 1);
  const nuevasMes = clientes.filter(u => new Date(u.createdAt) >= startMes).length;
  const usuariosActivos = clientes.filter(u => u.active !== false).length;
  return {
    totalClientas: clientes.length,
    nuevasMes,
    mrr: 0,
    reservasTotales: 0,
    usuariosActivos,
    ingresosTotales: 0,
    promedioPorClienta: 0,
    pagosFallidos: 0,
  };
};

export interface ActivityEvent {
  ts: string;
  kind: "signup" | "reserva" | "pago";
  text: string;
}

export const recentActivity = (users: User[] = [], limit = 12): ActivityEvent[] => {
  const evts: ActivityEvent[] = users.map(u => ({
    ts: u.createdAt,
    kind: "signup" as const,
    text: `Nueva clienta: ${u.businessName} (${u.tipoNegocio})`,
  }));
  return evts.sort((a, b) => b.ts.localeCompare(a.ts)).slice(0, limit);
};
