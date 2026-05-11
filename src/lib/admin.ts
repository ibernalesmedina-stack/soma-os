import type { Pago, Reserva, User } from "./types";

export const allReservas = (): Reserva[] => [];
export const allPagos = (): Pago[] => [];

// Precio mensual por plan (en CLP)
export const PLAN_PRICE: Record<string, number> = {
  basic:   19990,
  pro:     34990,
  premium: 49990,
  clinic:  49990,
};

export interface ClientaMetrics {
  pacientes: number;
  reservasMes: number;
  ingresosMes: number;
  ingresosTotal: number;
  ultimaActividad?: string;
}

export const metricsForUser = (_userId: string): ClientaMetrics => ({
  pacientes: 0, reservasMes: 0, ingresosMes: 0, ingresosTotal: 0,
});

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
  const activos = clientes.filter(u => u.active !== false);
  const mrr = activos.reduce((acc, u) => acc + (PLAN_PRICE[u.plan] ?? PLAN_PRICE.basic), 0);
  return {
    totalClientas: clientes.length,
    nuevasMes,
    mrr,
    reservasTotales: 0,
    usuariosActivos: activos.length,
    ingresosTotales: mrr,
    promedioPorClienta: activos.length > 0 ? Math.round(mrr / activos.length) : 0,
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
