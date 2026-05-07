import { supabase } from "./supabase";
import { slugify } from "./format";
import type {
  Automation, Bloqueo, ClienteFicha, ClientIntegration, Pago, Plan,
  ProgresoEntry, Registro, Reserva, Servicio, SesionNota,
  SubmoduloCosmetologa, TipoNegocio, User,
} from "./types";

export const uid = () => crypto.randomUUID();

// ── Helpers: DB row → TS type ──────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toReserva = (r: any): Reserva => ({
  id: r.id, user_id: r.user_id, client_id: r.client_id,
  clientName: r.client_name, date: r.date, serviceId: r.service_id,
  serviceName: r.service_name, status: r.status, amount: r.amount,
  tipoAtencion: r.tipo_atencion, esControl: r.es_control,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toPago = (r: any): Pago => ({
  id: r.id, user_id: r.user_id, client_id: r.client_id,
  clientName: r.client_name, date: r.date, amount: r.amount,
  method: r.method, status: r.status, reservaId: r.reserva_id,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toServicio = (r: any): Servicio => ({
  id: r.id, user_id: r.user_id, name: r.name,
  description: r.description, price: r.price,
  durationMin: r.duration_min, active: r.active,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toFicha = (r: any): ClienteFicha => ({
  id: r.id, user_id: r.user_id, clientKey: r.client_key,
  clientName: r.client_name, email: r.email, phone: r.phone,
  birthDate: r.birth_date, address: r.address, occupation: r.occupation,
  emergencyContact: r.emergency_contact, motivoConsulta: r.motivo_consulta,
  tipoAtencion: r.tipo_atencion, antecedentesMedicos: r.antecedentes_medicos,
  alergias: r.alergias, medicacion: r.medicacion,
  antecedentesFamiliares: r.antecedentes_familiares,
  evaluacionInicial: r.evaluacion_inicial, planTratamiento: r.plan_tratamiento,
  objetivos: r.objetivos, notasGenerales: r.notas_generales, edad: r.edad,
  estado: r.estado, altura: r.altura, pesoInicial: r.peso_inicial,
  pesoActual: r.peso_actual, porcGrasa: r.porc_grasa, porcMuscular: r.porc_muscular,
  objetivoTexto: r.objetivo_texto, evaluacionNivel: r.evaluacion_nivel,
  progresoTexto: r.progreso_texto, alertas: r.alertas, tipoPiel: r.tipo_piel,
  sensibilidad: r.sensibilidad, frecuencia: r.frecuencia,
  rutinaActual: r.rutina_actual, diagnostico: r.diagnostico,
  proximaAccion: r.proxima_accion, dental: r.dental,
  recomendaciones: r.recomendaciones,
  createdAt: r.created_at, updatedAt: r.updated_at,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toNota = (r: any): SesionNota => ({
  id: r.id, user_id: r.user_id, clientKey: r.client_key,
  reservaId: r.reserva_id, date: r.date, title: r.title,
  content: r.content, createdAt: r.created_at,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toRegistro = (r: any): Registro => ({
  id: r.id, user_id: r.user_id, client_id: r.client_id,
  clientName: r.client_name, tipo: r.tipo, titulo: r.titulo,
  fecha: r.fecha, data: r.data ?? {}, notas: r.notas,
  createdAt: r.created_at,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toBloqueo = (r: any): Bloqueo => ({
  id: r.id, user_id: r.user_id, start: r.start_at,
  end: r.end_at, motivo: r.motivo, createdAt: r.created_at,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toProgreso = (r: any): ProgresoEntry => ({
  id: r.id, user_id: r.user_id, clientKey: r.client_key,
  fecha: r.fecha, peso: r.peso, porcGrasa: r.porc_grasa,
  porcMuscular: r.porc_muscular, notas: r.notas, createdAt: r.created_at,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toAutomation = (r: any): Automation => ({
  id: r.id, user_id: r.user_id, name: r.name,
  description: r.description, channel: r.channel, enabled: r.enabled,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const toUser = (perfil: any, email: string): User => ({
  id: perfil.id, email, name: perfil.name,
  businessName: perfil.business_name, phone: perfil.phone,
  role: perfil.role, plan: perfil.plan, tipoNegocio: perfil.tipo_negocio,
  submodulos: perfil.submodulos, paymentMethods: perfil.payment_methods,
  whatsappNumber: perfil.whatsapp_number,
  googleCalendarConnected: perfil.google_calendar_connected,
  domain: perfil.domain,
  active: perfil.active, createdAt: perfil.created_at,
});

// ── Reservas ───────────────────────────────────────────────────────
export const listReservas = async (userId: string): Promise<Reserva[]> => {
  const { data } = await supabase.from("reservas").select("*").eq("user_id", userId).order("date", { ascending: false });
  return (data ?? []).map(toReserva);
};

export const addReserva = async (r: Omit<Reserva, "id">): Promise<Reserva> => {
  const { data, error } = await supabase.from("reservas").insert({
    user_id: r.user_id, client_id: r.client_id, client_name: r.clientName,
    date: r.date, service_id: r.serviceId, service_name: r.serviceName,
    status: r.status, amount: r.amount, tipo_atencion: r.tipoAtencion,
    es_control: r.esControl ?? false,
  }).select().single();
  if (error) throw error;
  return toReserva(data);
};

export const updateReserva = async (id: string, patch: Partial<Reserva>) => {
  await supabase.from("reservas").update({
    client_name: patch.clientName, date: patch.date,
    service_id: patch.serviceId, service_name: patch.serviceName,
    status: patch.status, amount: patch.amount,
    tipo_atencion: patch.tipoAtencion, es_control: patch.esControl,
  }).eq("id", id);
};

// ── Pagos ──────────────────────────────────────────────────────────
export const listPagos = async (userId: string): Promise<Pago[]> => {
  const { data } = await supabase.from("pagos").select("*").eq("user_id", userId).order("date", { ascending: false });
  return (data ?? []).map(toPago);
};

export const addPago = async (p: Omit<Pago, "id">): Promise<Pago> => {
  const { data, error } = await supabase.from("pagos").insert({
    user_id: p.user_id, client_id: p.client_id, client_name: p.clientName,
    date: p.date, amount: p.amount, method: p.method,
    status: p.status, reserva_id: p.reservaId,
  }).select().single();
  if (error) throw error;
  return toPago(data);
};

// ── Servicios ──────────────────────────────────────────────────────
export const listServicios = async (userId: string): Promise<Servicio[]> => {
  const { data } = await supabase.from("servicios").select("*").eq("user_id", userId).order("created_at");
  return (data ?? []).map(toServicio);
};

export const upsertServicio = async (s: Servicio) => {
  const { error } = await supabase.from("servicios").upsert({
    id: s.id, user_id: s.user_id, name: s.name,
    description: s.description, price: s.price,
    duration_min: s.durationMin, active: s.active,
  });
  if (error) throw error;
};

export const deleteServicio = async (id: string) => {
  await supabase.from("servicios").delete().eq("id", id);
};

// ── Fichas ─────────────────────────────────────────────────────────
export const listFichas = async (userId: string): Promise<ClienteFicha[]> => {
  const { data } = await supabase.from("fichas_clientes").select("*").eq("user_id", userId).order("client_name");
  return (data ?? []).map(toFicha);
};

export const getOrCreateFicha = async (userId: string, clientName: string): Promise<ClienteFicha> => {
  const clientKey = slugify(clientName);
  const { data: existing } = await supabase
    .from("fichas_clientes").select("*")
    .eq("user_id", userId).eq("client_key", clientKey).single();
  if (existing) return toFicha(existing);
  const now = new Date().toISOString();
  const { data, error } = await supabase.from("fichas_clientes").insert({
    user_id: userId, client_key: clientKey, client_name: clientName,
    created_at: now, updated_at: now,
  }).select().single();
  if (error) throw error;
  return toFicha(data);
};

export const updateFicha = async (id: string, patch: Partial<ClienteFicha>) => {
  await supabase.from("fichas_clientes").update({
    client_name: patch.clientName, email: patch.email, phone: patch.phone,
    birth_date: patch.birthDate, address: patch.address, occupation: patch.occupation,
    emergency_contact: patch.emergencyContact, motivo_consulta: patch.motivoConsulta,
    tipo_atencion: patch.tipoAtencion, antecedentes_medicos: patch.antecedentesMedicos,
    alergias: patch.alergias, medicacion: patch.medicacion,
    antecedentes_familiares: patch.antecedentesFamiliares,
    evaluacion_inicial: patch.evaluacionInicial, plan_tratamiento: patch.planTratamiento,
    objetivos: patch.objetivos, notas_generales: patch.notasGenerales, edad: patch.edad,
    estado: patch.estado, altura: patch.altura, peso_inicial: patch.pesoInicial,
    peso_actual: patch.pesoActual, porc_grasa: patch.porcGrasa,
    porc_muscular: patch.porcMuscular, objetivo_texto: patch.objetivoTexto,
    evaluacion_nivel: patch.evaluacionNivel, progreso_texto: patch.progresoTexto,
    alertas: patch.alertas, tipo_piel: patch.tipoPiel, sensibilidad: patch.sensibilidad,
    frecuencia: patch.frecuencia, rutina_actual: patch.rutinaActual,
    diagnostico: patch.diagnostico, proxima_accion: patch.proximaAccion,
    dental: patch.dental, recomendaciones: patch.recomendaciones,
    updated_at: new Date().toISOString(),
  }).eq("id", id);
};

export const importFichasCSV = async (userId: string, rows: Array<Record<string, string>>) => {
  let added = 0; let updated = 0;
  for (const row of rows) {
    const name = (row.clientName || row.nombre || row.name || "").trim();
    if (!name) continue;
    const key = slugify(name);
    const patch = {
      email: row.email || null, phone: row.phone || row.telefono || null,
      birth_date: row.birthDate || row.fechaNacimiento || null,
      address: row.address || row.direccion || null,
      notas_generales: row.notas || row.notasGenerales || null,
    };
    const { data: existing } = await supabase
      .from("fichas_clientes").select("id")
      .eq("user_id", userId).eq("client_key", key).single();
    if (existing) {
      await supabase.from("fichas_clientes").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", existing.id);
      updated++;
    } else {
      const now = new Date().toISOString();
      await supabase.from("fichas_clientes").insert({
        user_id: userId, client_key: key, client_name: name,
        ...patch, created_at: now, updated_at: now,
      });
      added++;
    }
  }
  return { added, updated };
};

// ── Notas ──────────────────────────────────────────────────────────
export const listNotas = async (userId: string): Promise<SesionNota[]> => {
  const { data } = await supabase.from("notas_sesion").select("*").eq("user_id", userId).order("date", { ascending: false });
  return (data ?? []).map(toNota);
};

export const addNota = async (n: Omit<SesionNota, "id" | "createdAt">): Promise<SesionNota> => {
  const { data, error } = await supabase.from("notas_sesion").insert({
    user_id: n.user_id, client_key: n.clientKey, reserva_id: n.reservaId,
    date: n.date, title: n.title, content: n.content,
  }).select().single();
  if (error) throw error;
  return toNota(data);
};

export const deleteNota = async (id: string) => {
  await supabase.from("notas_sesion").delete().eq("id", id);
};

// ── Registros ──────────────────────────────────────────────────────
export const listRegistros = async (userId: string): Promise<Registro[]> => {
  const { data } = await supabase.from("registros").select("*").eq("user_id", userId).order("fecha", { ascending: false });
  return (data ?? []).map(toRegistro);
};

export const addRegistro = async (r: Omit<Registro, "id" | "createdAt">): Promise<Registro> => {
  const { data, error } = await supabase.from("registros").insert({
    user_id: r.user_id, client_id: r.client_id, client_name: r.clientName,
    tipo: r.tipo, titulo: r.titulo, fecha: r.fecha, data: r.data, notas: r.notas,
  }).select().single();
  if (error) throw error;
  return toRegistro(data);
};

export const deleteRegistro = async (id: string) => {
  await supabase.from("registros").delete().eq("id", id);
};

// ── Bloqueos ───────────────────────────────────────────────────────
export const listBloqueos = async (userId: string): Promise<Bloqueo[]> => {
  const { data } = await supabase.from("bloqueos").select("*").eq("user_id", userId).order("start_at");
  return (data ?? []).map(toBloqueo);
};

export const addBloqueo = async (b: Omit<Bloqueo, "id" | "createdAt">): Promise<Bloqueo> => {
  const { data, error } = await supabase.from("bloqueos").insert({
    user_id: b.user_id, start_at: b.start, end_at: b.end, motivo: b.motivo,
  }).select().single();
  if (error) throw error;
  return toBloqueo(data);
};

export const deleteBloqueo = async (id: string) => {
  await supabase.from("bloqueos").delete().eq("id", id);
};

// ── Progreso ───────────────────────────────────────────────────────
export const listProgreso = async (userId: string): Promise<ProgresoEntry[]> => {
  const { data } = await supabase.from("progreso").select("*").eq("user_id", userId).order("fecha");
  return (data ?? []).map(toProgreso);
};

export const addProgreso = async (p: Omit<ProgresoEntry, "id" | "createdAt">): Promise<ProgresoEntry> => {
  const { data, error } = await supabase.from("progreso").insert({
    user_id: p.user_id, client_key: p.clientKey, fecha: p.fecha,
    peso: p.peso, porc_grasa: p.porcGrasa, porc_muscular: p.porcMuscular, notas: p.notas,
  }).select().single();
  if (error) throw error;
  return toProgreso(data);
};

export const deleteProgreso = async (id: string) => {
  await supabase.from("progreso").delete().eq("id", id);
};

// ── Automatizaciones ───────────────────────────────────────────────
const REQUIRED_AUTOMATIONS: Omit<Automation, "id" | "user_id">[] = [
  { name: "Confirmación por email", description: "Al crearse una reserva, por WhatsApp y email", channel: "whatsapp_email", enabled: true },
  { name: "Recordatorio 24h antes", description: "Envío 24h antes de la cita por WhatsApp y email", channel: "whatsapp_email", enabled: true },
  { name: "Recordatorio 2h antes", description: "Envío 2h antes de la cita por WhatsApp y email", channel: "whatsapp_email", enabled: true },
  { name: "Seguimiento post sesión", description: "Envío 15 días después: seguimiento + review, por WhatsApp y email", channel: "whatsapp_email", enabled: false },
  { name: "Recordatorio 30 días después", description: "Recordatorio para que vuelvan a agendar, por WhatsApp y email", channel: "whatsapp_email", enabled: false },
];

export const listAutomations = async (userId: string): Promise<Automation[]> => {
  const { data: existing } = await supabase.from("automatizaciones").select("*").eq("user_id", userId);
  const existingNames = new Set((existing ?? []).map((a) => a.name));
  const missing = REQUIRED_AUTOMATIONS.filter((r) => !existingNames.has(r.name));
  if (missing.length) {
    await supabase.from("automatizaciones").insert(
      missing.map((m) => ({ ...m, user_id: userId }))
    );
    const { data: all } = await supabase.from("automatizaciones").select("*").eq("user_id", userId);
    return (all ?? []).map(toAutomation);
  }
  return (existing ?? []).map(toAutomation);
};

export const toggleAutomation = async (id: string) => {
  const { data } = await supabase.from("automatizaciones").select("enabled").eq("id", id).single();
  if (data) {
    await supabase.from("automatizaciones").update({ enabled: !data.enabled }).eq("id", id);
  }
};

// ── Cliente nuevo ──────────────────────────────────────────────────
export const isClienteNuevo = async (userId: string, clientKey: string): Promise<boolean> => {
  const { data } = await supabase.from("reservas").select("date, status").eq("user_id", userId);
  const reservas = (data ?? []).filter((r) => slugify(r.client_name ?? "") === clientKey);
  if (reservas.length === 0) return true;
  const completedOrPast = reservas.filter((r) => r.status === "completada" || new Date(r.date) < new Date());
  return completedOrPast.length <= 1;
};

// ── Admin: usuarios ────────────────────────────────────────────────
export const getUsers = async (): Promise<User[]> => {
  const { data: perfiles } = await supabase.from("perfiles").select("*");
  if (!perfiles) return [];
  const { data: { users: authUsers } } = await supabase.auth.admin.listUsers().catch(() => ({ data: { users: [] } }));
  const emailMap = new Map((authUsers ?? []).map((u) => [u.id, u.email ?? ""]));
  return perfiles.map((p) => toUser(p, emailMap.get(p.id) ?? ""));
};

// Legacy compat — admin pages call this synchronously; no-op until admin is migrated to async
export const saveUsers = (_users: User[]) => {};

export const updateUserById = async (id: string, patch: Partial<User>) => {
  await supabase.from("perfiles").update({
    name: patch.name, business_name: patch.businessName, phone: patch.phone,
    role: patch.role, plan: patch.plan, tipo_negocio: patch.tipoNegocio,
    submodulos: patch.submodulos, payment_methods: patch.paymentMethods,
    whatsapp_number: patch.whatsappNumber,
    google_calendar_connected: patch.googleCalendarConnected,
    domain: patch.domain,
    active: patch.active,
  }).eq("id", id);
};

export const impersonate = (userId: string) => {
  localStorage.setItem("soma.impersonate", userId);
};

// ── Client Integrations ────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toIntegration = (r: any): ClientIntegration => ({
  id: r.id, user_id: r.user_id,
  dominio: r.dominio ?? "", domain_status: r.domain_status ?? "pending",
  resend_api_key: r.resend_api_key ?? "", resend_email: r.resend_email ?? "", resend_status: r.resend_status ?? "disconnected",
  whatsapp_number: r.whatsapp_number ?? "", whatsapp_token: r.whatsapp_token ?? "", whatsapp_status: r.whatsapp_status ?? "disconnected",
  google_calendar_token: r.google_access_token ?? r.google_calendar_token ?? "",
  calendar_status: r.calendar_status ?? (r.google_access_token || r.google_calendar_token ? "synced" : "disconnected"),
  webpay_merchant_code: r.webpay_merchant_code ?? "", webpay_status: r.webpay_status ?? "inactive",
  transfer_banco: r.transfer_banco ?? "", transfer_cuenta: r.transfer_cuenta ?? "", transfer_rut: r.transfer_rut ?? "", transfer_status: r.transfer_status ?? "unverified",
  created_at: r.created_at, updated_at: r.updated_at,
});

export const getIntegration = async (userId: string): Promise<ClientIntegration | null> => {
  const { data } = await supabase.from("client_integrations").select("*").eq("user_id", userId).single();
  return data ? toIntegration(data) : null;
};

export const upsertIntegration = async (
  userId: string,
  patch: Partial<Omit<ClientIntegration, "id" | "user_id" | "created_at" | "updated_at">>,
) => {
  // Los tokens se cifran en el servidor vía encrypt_value() — los enviamos en texto plano
  // y la DB los cifra al guardar a través de un trigger o función RPC
  // Para este flujo simple: usamos upsert directo (la cifrado ocurre en la migración SQL)
  const { error } = await supabase.from("client_integrations").upsert(
    {
      user_id: userId,
      whatsapp_number: patch.whatsapp_number,
      dominio: patch.dominio,
      // Tokens: el cliente los envía; en producción deberías cifrarlos aquí
      // con una Edge Function o RPC que llame a encrypt_value()
      whatsapp_token: patch.whatsapp_token,
      google_calendar_token: patch.google_calendar_token,
      webpay_merchant_code: patch.webpay_merchant_code,
    },
    { onConflict: "user_id" },
  );
  if (error) throw error;
};

// ── Seed demo data ─────────────────────────────────────────────────
export const seedForUser = async (userId: string) => {
  const services = [
    { id: uid(), user_id: userId, name: "Sesión inicial", description: "Consulta de diagnóstico 1:1", price: 35000, duration_min: 60, active: true },
    { id: uid(), user_id: userId, name: "Sesión de seguimiento", description: "Continuidad del plan", price: 28000, duration_min: 45, active: true },
    { id: uid(), user_id: userId, name: "Plan mensual", description: "4 sesiones al mes", price: 110000, duration_min: 60, active: true },
  ];
  await supabase.from("servicios").insert(services);

  const names = ["María Fernández", "Sofía López", "Camila Ruiz", "Isabel Martínez", "Valeria Pérez", "Andrea Soto", "Diego Torres", "Lucía Rojas"];
  const statuses: Reserva["status"][] = ["confirmada", "pendiente", "completada", "confirmada", "cancelada"];
  const reservasData = Array.from({ length: 14 }).map((_, i) => {
    const s = services[i % services.length];
    const d = new Date();
    d.setDate(d.getDate() + (i - 6));
    d.setHours(9 + (i % 8), 0, 0, 0);
    return {
      id: uid(), user_id: userId, client_id: uid(),
      client_name: names[i % names.length], date: d.toISOString(),
      service_id: s.id, service_name: s.name,
      status: statuses[i % statuses.length], amount: s.price,
      tipo_atencion: i % 2 === 0 ? "presencial" : "online",
      es_control: i % 3 === 0,
    };
  });
  await supabase.from("reservas").insert(reservasData);

  const pagosData = reservasData
    .filter((r) => r.status === "completada" || r.status === "confirmada")
    .map((r, i) => ({
      id: uid(), user_id: userId, client_id: r.client_id, client_name: r.client_name,
      date: r.date, amount: r.amount,
      method: (["WebPay", "Transferencia", "Efectivo"] as const)[i % 3],
      status: i % 4 === 0 ? "pendiente" : "pagado",
      reserva_id: r.id,
    }));
  await supabase.from("pagos").insert(pagosData);
};
