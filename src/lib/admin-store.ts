// Persistencia local para entidades que solo administra el panel admin.
import { uid } from "./storage";

export interface Factura {
  id: string;
  clientUserId: string;
  clientName: string;
  amount: number;
  description: string;
  date: string; // ISO
  status: "pagada" | "pendiente" | "vencida";
}

export interface NotaInterna {
  id: string;
  clientUserId: string;
  text: string;
  createdAt: string;
}

export interface PlanPricing {
  basic: number;
  clinic: number;
}

export interface AdminSettings {
  webpayApiKey: string;
  webpayCommerceCode: string;
  transferenciaBanco: string;
  transferenciaCuenta: string;
  transferenciaRut: string;
  whatsappApiKey: string;
  whatsappPhoneId: string;
  metaAppId: string;
  metaAppSecret: string;
  pricing: PlanPricing;
}

const K = {
  facturas: "soma.admin.facturas",
  notas: "soma.admin.notas",
  settings: "soma.admin.settings",
};

const read = <T,>(k: string, def: T): T => {
  try { return JSON.parse(localStorage.getItem(k) || "") as T; } catch { return def; }
};
const write = (k: string, v: unknown) => localStorage.setItem(k, JSON.stringify(v));

// --- Facturas ---
export const listFacturas = (): Factura[] => read<Factura[]>(K.facturas, []);
export const addFactura = (f: Omit<Factura, "id">): Factura => {
  const out: Factura = { ...f, id: uid() };
  write(K.facturas, [...listFacturas(), out]);
  return out;
};
export const updateFactura = (id: string, patch: Partial<Factura>) => {
  write(K.facturas, listFacturas().map(f => f.id === id ? { ...f, ...patch } : f));
};
export const deleteFactura = (id: string) => {
  write(K.facturas, listFacturas().filter(f => f.id !== id));
};

// --- Notas internas (por cliente) ---
export const listNotasInternas = (clientUserId: string): NotaInterna[] =>
  read<NotaInterna[]>(K.notas, []).filter(n => n.clientUserId === clientUserId);
export const addNotaInterna = (clientUserId: string, text: string): NotaInterna => {
  const all = read<NotaInterna[]>(K.notas, []);
  const n: NotaInterna = { id: uid(), clientUserId, text, createdAt: new Date().toISOString() };
  write(K.notas, [...all, n]);
  return n;
};
export const deleteNotaInterna = (id: string) => {
  write(K.notas, read<NotaInterna[]>(K.notas, []).filter(n => n.id !== id));
};

// --- Settings ---
const DEFAULT_SETTINGS: AdminSettings = {
  webpayApiKey: "",
  webpayCommerceCode: "",
  transferenciaBanco: "",
  transferenciaCuenta: "",
  transferenciaRut: "",
  whatsappApiKey: "",
  whatsappPhoneId: "",
  metaAppId: "",
  metaAppSecret: "",
  pricing: { basic: 19990, clinic: 49990 },
};

export const getSettings = (): AdminSettings => {
  const s = read<Partial<AdminSettings>>(K.settings, {});
  return { ...DEFAULT_SETTINGS, ...s, pricing: { ...DEFAULT_SETTINGS.pricing, ...(s.pricing || {}) } };
};
export const saveSettings = (s: AdminSettings) => write(K.settings, s);

// --- Helpers ---
export interface IngresoMensual { mes: string; total: number; }

export const ingresosUltimos12Meses = (pagos: { date: string; amount: number; status: string }[]): IngresoMensual[] => {
  const now = new Date();
  const out: IngresoMensual[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const total = pagos
      .filter(p => p.status === "pagado" && new Date(p.date) >= d && new Date(p.date) < next)
      .reduce((a, b) => a + b.amount, 0);
    out.push({ mes: d.toLocaleDateString("es-CL", { month: "short" }), total });
  }
  return out;
};

export const tasaRetencion = (users: { id: string; createdAt: string; active?: boolean }[]): number => {
  const now = new Date();
  const hace30 = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  const cohorte = users.filter(u => new Date(u.createdAt) <= hace30);
  if (cohorte.length === 0) return 100;
  const activos = cohorte.filter(u => u.active !== false).length;
  return Math.round((activos / cohorte.length) * 100);
};

// Estado de pago de una clienta (basado en facturas)
export const estadoPagoClienta = (clientUserId: string): "pagado" | "pendiente" => {
  const fs = listFacturas().filter(f => f.clientUserId === clientUserId);
  if (fs.some(f => f.status === "pendiente" || f.status === "vencida")) return "pendiente";
  return "pagado";
};
