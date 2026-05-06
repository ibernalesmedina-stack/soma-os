export type Plan = "basic" | "pro" | "premium" | "clinic";
export type TipoNegocio = "nutricionista" | "cosmetologa" | "odontologa" | "psicologa";
export type SubmoduloCosmetologa = "piel" | "unas" | "pestanas";
export type UserRole = "user" | "admin";
export type TipoAtencion = "online" | "presencial";

export interface PaymentMethods {
  webpay: boolean;
  transferencia: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  businessName: string;
  phone: string;
  role: UserRole;
  plan: Plan;
  tipoNegocio: TipoNegocio;
  submodulos?: SubmoduloCosmetologa[];
  googleCalendarConnected?: boolean;
  paymentMethods?: PaymentMethods;
  whatsappNumber?: string;
  domain?: string;
  active?: boolean;
  createdAt: string;
}

export interface Reserva {
  id: string;
  user_id: string;
  client_id: string;
  clientName: string;
  date: string; // ISO
  serviceId: string;
  serviceName: string;
  status: "confirmada" | "pendiente" | "cancelada" | "completada";
  amount: number;
  tipoAtencion?: TipoAtencion;
  esControl?: boolean;
}

export interface Pago {
  id: string;
  user_id: string;
  client_id: string;
  clientName: string;
  date: string;
  amount: number;
  method: "WebPay" | "Transferencia" | "Efectivo";
  status: "pagado" | "pendiente" | "fallido";
  reservaId?: string;
}

export interface Servicio {
  id: string;
  user_id: string;
  name: string;
  description: string;
  price: number;
  durationMin: number;
  active: boolean;
}

export interface ClienteFicha {
  id: string;
  user_id: string;
  clientKey: string;
  clientName: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  address?: string;
  occupation?: string;
  emergencyContact?: string;
  motivoConsulta?: string;
  tipoAtencion?: TipoAtencion;
  antecedentesMedicos?: string;
  alergias?: string;
  medicacion?: string;
  antecedentesFamiliares?: string;
  evaluacionInicial?: string;
  planTratamiento?: string;
  objetivos?: string;
  notasGenerales?: string;
  // Comunes
  edad?: string;
  estado?: "activo" | "pausa" | "alta";
  // Nutricionista
  altura?: string;
  pesoInicial?: string;
  pesoActual?: string;
  porcGrasa?: string;
  porcMuscular?: string;
  objetivoTexto?: string;
  // Psicóloga
  evaluacionNivel?: "bajo" | "medio" | "alto";
  progresoTexto?: string;
  alertas?: string;
  // Cosmetóloga
  tipoPiel?: string;
  sensibilidad?: string;
  frecuencia?: string;
  rutinaActual?: string;
  // Odontóloga
  diagnostico?: string;
  proximaAccion?: string;
  dental?: Record<string, "sano" | "caries" | "tratado">;
  // Recomendaciones (cosmetóloga)
  recomendaciones?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProgresoEntry {
  id: string;
  user_id: string;
  clientKey: string;
  fecha: string;
  peso?: number;
  porcGrasa?: number;
  porcMuscular?: number;
  notas?: string;
  createdAt: string;
}

export interface SesionNota {
  id: string;
  user_id: string;
  clientKey: string;
  reservaId?: string;
  date: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface Automation {
  id: string;
  user_id: string;
  name: string;
  description: string;
  channel: "whatsapp" | "email" | "whatsapp_email";
  enabled: boolean;
}

// Tabla flexible de registros por tipo de negocio
// (planes alimenticios, tratamientos, procedimientos, sesiones, etc.)
export interface Registro {
  id: string;
  user_id: string;
  client_id: string; // clientKey (slug)
  clientName: string;
  tipo: string; // "plan_alimenticio" | "tratamiento" | "procedimiento" | "sesion" | etc
  titulo: string;
  fecha: string;
  // Campos flexibles dependientes del tipo de negocio
  data: Record<string, string | number | undefined>;
  notas?: string;
  createdAt: string;
}

export interface ClientIntegration {
  id: string;
  user_id: string;
  whatsapp_number: string;
  whatsapp_token: string;
  google_calendar_token: string;
  webpay_merchant_code: string;
  dominio: string;
  created_at: string;
  updated_at: string;
}

export interface Bloqueo {
  id: string;
  user_id: string;
  start: string; // ISO
  end: string; // ISO
  motivo: string;
  createdAt: string;
}
