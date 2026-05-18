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
  priceOnline: r.price_online ?? 0,
  durationMin: r.duration_min, active: r.active,
  modality: r.modality ?? "ambos",
  featured: r.featured ?? false,
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
    price_online: s.priceOnline, duration_min: s.durationMin,
    active: s.active, modality: s.modality, featured: s.featured,
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
  webpay_merchant_code: r.webpay_merchant_code ?? "", webpay_api_key: r.webpay_api_key ?? "", webpay_status: r.webpay_status ?? "inactive",
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
  const { error } = await supabase.from("client_integrations").upsert(
    {
      user_id: userId,
      // Domain
      ...(patch.dominio              !== undefined && { dominio:              patch.dominio }),
      ...(patch.domain_status        !== undefined && { domain_status:        patch.domain_status }),
      // Resend / Email
      ...(patch.resend_api_key       !== undefined && { resend_api_key:       patch.resend_api_key }),
      ...(patch.resend_email         !== undefined && { resend_email:         patch.resend_email }),
      ...(patch.resend_status        !== undefined && { resend_status:        patch.resend_status }),
      // WhatsApp
      ...(patch.whatsapp_number      !== undefined && { whatsapp_number:      patch.whatsapp_number }),
      ...(patch.whatsapp_token       !== undefined && { whatsapp_token:       patch.whatsapp_token }),
      ...(patch.whatsapp_status      !== undefined && { whatsapp_status:      patch.whatsapp_status }),
      // Google Calendar
      ...(patch.google_calendar_token !== undefined && { google_calendar_token: patch.google_calendar_token }),
      ...(patch.calendar_status       !== undefined && { calendar_status:       patch.calendar_status }),
      // WebPay
      ...(patch.webpay_merchant_code !== undefined && { webpay_merchant_code: patch.webpay_merchant_code }),
      ...(patch.webpay_api_key       !== undefined && { webpay_api_key:       patch.webpay_api_key }),
      ...(patch.webpay_status        !== undefined && { webpay_status:        patch.webpay_status }),
      // Transferencia
      ...(patch.transfer_banco       !== undefined && { transfer_banco:       patch.transfer_banco }),
      ...(patch.transfer_cuenta      !== undefined && { transfer_cuenta:      patch.transfer_cuenta }),
      ...(patch.transfer_rut         !== undefined && { transfer_rut:         patch.transfer_rut }),
      ...(patch.transfer_status      !== undefined && { transfer_status:      patch.transfer_status }),
    },
    { onConflict: "user_id" },
  );
  if (error) throw error;
};

export const saveWebPayConfig = async (userId: string, merchantCode: string, apiKey: string) => {
  const { error } = await supabase.from("client_integrations").upsert(
    {
      user_id: userId,
      webpay_merchant_code: merchantCode,
      webpay_api_key: apiKey,
      webpay_status: "active",
    },
    { onConflict: "user_id" },
  );
  if (error) throw error;
};

export const saveClientEmail = async (userId: string, email: string) => {
  const { error } = await supabase.from("client_integrations").upsert(
    { user_id: userId, resend_email: email, resend_status: "connected" },
    { onConflict: "user_id" },
  );
  if (error) throw error;
};

// ── Consentimiento de registro (signup) ───────────────────────────

export const storeSignupConsent = async (
  userId: string,
  userName: string,
  consent: { privacy: boolean; terms: boolean; retention: boolean },
  ip?: string,
): Promise<void> => {
  await supabase.from("registros").insert({
    id: uid(),
    user_id: userId,
    client_id: userId,
    client_name: userName || "Usuario",
    tipo: "consentimiento",
    titulo: "Consentimiento de alta en SomaOS v1.0",
    fecha: new Date().toISOString(),
    data: {
      privacy: consent.privacy,
      terms: consent.terms,
      retention: consent.retention,
      ip: ip ?? "desconocida",
      version: "1.0",
      privacyVersion: "1.1",
      termsVersion: "1.1",
      timestamp: new Date().toISOString(),
    },
    notas: `Privacidad v1.1: ${consent.privacy} · Términos v1.1: ${consent.terms} · Retención 30d: ${consent.retention} · IP: ${ip ?? "desconocida"}`,
  });
};

// ── Client Files (Supabase Storage) ───────────────────────────────

export interface ClientFile {
  name: string;
  path: string;
  size: number;
  mimeType: string;
  createdAt: string;
  url: string;
}

export const uploadClientFile = async (userId: string, clientKey: string, file: File): Promise<ClientFile> => {
  const path = `${userId}/${clientKey}/${Date.now()}_${file.name}`;
  const { error } = await supabase.storage.from("client-files").upload(path, file, { upsert: false });
  if (error) throw error;
  const { data: urlData } = await supabase.storage.from("client-files").createSignedUrl(path, 3600);
  return { name: file.name, path, size: file.size, mimeType: file.type, createdAt: new Date().toISOString(), url: urlData?.signedUrl ?? "" };
};

export const listClientFiles = async (userId: string, clientKey: string): Promise<ClientFile[]> => {
  const folder = `${userId}/${clientKey}`;
  const { data, error } = await supabase.storage.from("client-files").list(folder, { sortBy: { column: "created_at", order: "desc" } });
  if (error || !data) return [];
  const items = data.filter((f) => f.name !== ".emptyFolderPlaceholder" && f.name);
  return Promise.all(items.map(async (f) => {
    const path = `${folder}/${f.name}`;
    const { data: urlData } = await supabase.storage.from("client-files").createSignedUrl(path, 3600);
    return {
      name: f.name.replace(/^\d+_/, ""),
      path,
      size: f.metadata?.size ?? 0,
      mimeType: f.metadata?.mimetype ?? "",
      createdAt: f.created_at ?? new Date().toISOString(),
      url: urlData?.signedUrl ?? "",
    };
  }));
};

export const deleteClientFile = async (path: string): Promise<void> => {
  const { error } = await supabase.storage.from("client-files").remove([path]);
  if (error) throw error;
};

// ── GDPR: Consentimiento, Derecho al olvido, Portabilidad ─────────

/** Registra el consentimiento informado del paciente (almacenado en registros) */
export const registerConsent = async (userId: string, clientKey: string, clientName: string): Promise<void> => {
  await supabase.from("registros").insert({
    id: uid(), user_id: userId, client_id: clientKey, client_name: clientName,
    tipo: "consentimiento",
    titulo: "Consentimiento informado registrado",
    fecha: new Date().toISOString(),
    data: { given: true },
    notas: "El/la paciente otorgó consentimiento informado para el tratamiento y almacenamiento de sus datos personales y clínicos conforme a la normativa vigente.",
  });
};

/** Devuelve la fecha del último consentimiento, o null si no existe */
export const getConsent = async (userId: string, clientKey: string): Promise<string | null> => {
  const { data } = await supabase.from("registros")
    .select("fecha")
    .eq("user_id", userId).eq("client_id", clientKey).eq("tipo", "consentimiento")
    .order("fecha", { ascending: false }).limit(1).maybeSingle();
  return data?.fecha ?? null;
};

/** Exporta todos los datos del paciente como objeto JSON (portabilidad GDPR) */
export const exportClientData = async (userId: string, clientKey: string): Promise<object> => {
  const [fichaRes, reservasRes, pagosRes, notasRes, progresoRes, registrosRes] = await Promise.all([
    supabase.from("fichas_clientes").select("*").eq("user_id", userId).eq("client_key", clientKey),
    supabase.from("reservas").select("*").eq("user_id", userId).eq("client_id", clientKey),
    supabase.from("pagos").select("*").eq("user_id", userId).eq("client_id", clientKey),
    supabase.from("notas_sesion").select("*").eq("user_id", userId).eq("client_key", clientKey),
    supabase.from("progreso").select("*").eq("user_id", userId).eq("client_key", clientKey),
    supabase.from("registros").select("*").eq("user_id", userId).eq("client_id", clientKey),
  ]);
  return {
    exported_at: new Date().toISOString(),
    platform: "SomaOS",
    ficha: fichaRes.data?.[0] ?? null,
    reservas: reservasRes.data ?? [],
    pagos: pagosRes.data ?? [],
    notas_sesion: notasRes.data ?? [],
    progreso: progresoRes.data ?? [],
    registros: registrosRes.data ?? [],
  };
};

/** Elimina todos los datos clínicos del paciente y anonimiza registros financieros (GDPR derecho al olvido) */
export const deleteClientData = async (userId: string, clientKey: string): Promise<void> => {
  // Eliminar datos clínicos
  await Promise.all([
    supabase.from("fichas_clientes").delete().eq("user_id", userId).eq("client_key", clientKey),
    supabase.from("notas_sesion").delete().eq("user_id", userId).eq("client_key", clientKey),
    supabase.from("progreso").delete().eq("user_id", userId).eq("client_key", clientKey),
    supabase.from("registros").delete().eq("user_id", userId).eq("client_id", clientKey),
  ]);
  // Anonimizar registros financieros (obligación contable — no se borran)
  await Promise.all([
    supabase.from("reservas").update({ client_name: "Datos eliminados", client_id: "deleted" })
      .eq("user_id", userId).eq("client_id", clientKey),
    supabase.from("pagos").update({ client_name: "Datos eliminados", client_id: "deleted" })
      .eq("user_id", userId).eq("client_id", clientKey),
  ]);
  // Eliminar archivos de Storage
  const { data: files } = await supabase.storage.from("client-files")
    .list(`${userId}/${clientKey}`);
  if (files?.length) {
    await supabase.storage.from("client-files")
      .remove(files.map((f) => `${userId}/${clientKey}/${f.name}`));
  }
};

// ── Seed demo clients (safe to call on existing accounts) ─────────

export const seedDemoClients = async (userId: string): Promise<void> => {
  // Guard: skip if already seeded
  const { data: guard } = await supabase
    .from("fichas_clientes").select("id").eq("user_id", userId).eq("client_key", "maria-gonzalez").maybeSingle();
  if (guard) return;

  // Use existing services or create minimal ones
  const { data: svcs } = await supabase.from("servicios").select("id,name,price").eq("user_id", userId).limit(3);
  let s0: { id: string; name: string; price: number };
  let s1: { id: string; name: string; price: number };
  if (svcs && svcs.length >= 2) {
    s0 = svcs[0]; s1 = svcs[1];
  } else {
    const newSvcs = [
      { id: uid(), user_id: userId, name: "Sesión inicial", description: "Consulta diagnóstico", price: 35000, duration_min: 60, active: true },
      { id: uid(), user_id: userId, name: "Sesión de seguimiento", description: "Continuidad del plan", price: 28000, duration_min: 45, active: true },
    ];
    await supabase.from("servicios").insert(newSvcs);
    s0 = newSvcs[0]; s1 = newSvcs[1];
  }
  const now = new Date().toISOString();
  const ago = (days: number) => new Date(Date.now() - days * 86400000).toISOString();
  const in_ = (days: number) => new Date(Date.now() + days * 86400000).toISOString();

  // ── Nutricionista: María González ─────────────────────────────────
  const mgKey = "maria-gonzalez"; const mgName = "María González";
  await supabase.from("reservas").insert([
    { id: uid(), user_id: userId, client_id: mgKey, client_name: mgName, service_id: s0.id, service_name: s0.name, status: "completada", amount: s0.price, tipo_atencion: "presencial", es_control: false, date: ago(90) },
    { id: uid(), user_id: userId, client_id: mgKey, client_name: mgName, service_id: s1.id, service_name: s1.name, status: "completada", amount: s1.price, tipo_atencion: "presencial", es_control: false, date: ago(60) },
    { id: uid(), user_id: userId, client_id: mgKey, client_name: mgName, service_id: s1.id, service_name: s1.name, status: "completada", amount: s1.price, tipo_atencion: "online",     es_control: true,  date: ago(30) },
    { id: uid(), user_id: userId, client_id: mgKey, client_name: mgName, service_id: s1.id, service_name: s1.name, status: "confirmada", amount: s1.price, tipo_atencion: "presencial", es_control: false, date: in_(7) },
  ]);
  await supabase.from("fichas_clientes").insert({
    id: uid(), user_id: userId, client_key: mgKey, client_name: mgName,
    email: "maria.gonzalez@gmail.com", phone: "+56 9 8765 4321",
    birth_date: "1990-03-15", occupation: "Profesora", estado: "activo", tipo_atencion: "presencial",
    motivo_consulta: "Mejorar alimentación y bajar de peso. Dificultades para mantener una dieta equilibrada por su trabajo.",
    altura: "163", peso_inicial: "72", peso_actual: "68.5", porc_grasa: "28", porc_muscular: "34",
    objetivo_texto: "Llegar a 65 kg con composición corporal saludable. Aumentar masa muscular y reducir % grasa a menos de 25%.",
    evaluacion_inicial: "Sobrepeso leve, hábitos irregulares. Actividad física baja (2 veces/semana).",
    plan_tratamiento: "Plan con déficit moderado (300 kcal). 5 comidas al día, énfasis en proteínas y verduras.",
    alergias: "Intolerancia a la lactosa", medicacion: "Ninguna",
    notas_generales: "Muy motivada y constante. Asiste puntual. Prefiere sesiones de tarde.",
    created_at: now, updated_at: now,
  });
  await supabase.from("progreso").insert([
    { id: uid(), user_id: userId, client_key: mgKey, fecha: ago(90), peso: 72,   porc_grasa: 30.5, porc_muscular: 32,   notas: "Consulta inicial" },
    { id: uid(), user_id: userId, client_key: mgKey, fecha: ago(60), peso: 70.2, porc_grasa: 29.1, porc_muscular: 32.8, notas: "Buena adherencia al plan" },
    { id: uid(), user_id: userId, client_key: mgKey, fecha: ago(30), peso: 68.5, porc_grasa: 28.0, porc_muscular: 34.0, notas: "Incorporó ejercicio 3 veces/semana" },
  ]);
  await supabase.from("notas_sesion").insert([
    { id: uid(), user_id: userId, client_key: mgKey, date: ago(60), title: "Seguimiento semana 5", content: "Excelente adherencia. Bajó 1.8 kg. Refuerzo en colaciones." },
    { id: uid(), user_id: userId, client_key: mgKey, date: ago(30), title: "Ajuste de plan — sesión 8", content: "Más proteína en el desayuno. Comenzó ejercicio regularmente." },
  ]);

  // ── Psicóloga: Laura Morales ───────────────────────────────────────
  const lmKey = "laura-morales"; const lmName = "Laura Morales";
  await supabase.from("reservas").insert([
    { id: uid(), user_id: userId, client_id: lmKey, client_name: lmName, service_id: s0.id, service_name: s0.name, status: "completada", amount: s0.price, tipo_atencion: "presencial", es_control: false, date: ago(84) },
    { id: uid(), user_id: userId, client_id: lmKey, client_name: lmName, service_id: s1.id, service_name: s1.name, status: "completada", amount: s1.price, tipo_atencion: "presencial", es_control: false, date: ago(56) },
    { id: uid(), user_id: userId, client_id: lmKey, client_name: lmName, service_id: s1.id, service_name: s1.name, status: "completada", amount: s1.price, tipo_atencion: "online",     es_control: false, date: ago(28) },
    { id: uid(), user_id: userId, client_id: lmKey, client_name: lmName, service_id: s1.id, service_name: s1.name, status: "confirmada", amount: s1.price, tipo_atencion: "presencial", es_control: false, date: in_(5) },
  ]);
  await supabase.from("fichas_clientes").insert({
    id: uid(), user_id: userId, client_key: lmKey, client_name: lmName,
    email: "laura.morales@gmail.com", phone: "+56 9 7654 3210",
    birth_date: "1987-07-22", occupation: "Diseñadora gráfica", estado: "activo", tipo_atencion: "presencial",
    motivo_consulta: "Ansiedad generalizada y crisis de pánico recurrentes desde hace 2 años. Dificultades para dormir y concentrarse.",
    objetivos: "Reducir frecuencia e intensidad de las crisis. Desarrollar herramientas de regulación emocional.",
    evaluacion_nivel: "medio",
    progreso_texto: "Avance significativo en técnicas de respiración y mindfulness. Redujo crisis de 3 a 1 por semana.",
    alertas: "Historial de crisis nocturnas. Avisar ante cambios en medicación (clonazepam 0.5mg s/n).",
    notas_generales: "Comprometida con el proceso. Hace tareas entre sesiones. Le cuesta hablar de su familia de origen.",
    created_at: now, updated_at: now,
  });
  await supabase.from("registros").insert([
    { id: uid(), user_id: userId, client_id: lmKey, client_name: lmName, tipo: "sesion", titulo: "Sesión 1 — Evaluación inicial", fecha: ago(84), data: {}, notas: "Entrevista inicial. Relata episodios de pánico en el trabajo. Alta motivación al cambio." },
    { id: uid(), user_id: userId, client_id: lmKey, client_name: lmName, tipo: "sesion", titulo: "Sesión 3 — Técnicas de respiración", fecha: ago(56), data: {}, notas: "Respiración 4-7-8 y grounding 5-4-3-2-1. Reporta haberlas usado con buen resultado." },
    { id: uid(), user_id: userId, client_id: lmKey, client_name: lmName, tipo: "sesion", titulo: "Sesión 6 — Reestructuración cognitiva", fecha: ago(28), data: {}, notas: "Identifica distorsiones: catastrofización y lectura del pensamiento. Logra cuestionar pensamientos automáticos." },
  ]);
  await supabase.from("notas_sesion").insert([
    { id: uid(), user_id: userId, client_key: lmKey, date: ago(56), title: "Nota privada — sesión 3", content: "Menciona conflicto con su pareja que no quiere profundizar aún. Queda pendiente." },
    { id: uid(), user_id: userId, client_key: lmKey, date: ago(28), title: "Nota privada — sesión 6", content: "Su madre también tuvo ataques de pánico. Posible componente hereditario/aprendido. Explorar próxima sesión." },
  ]);

  // ── Cosmetóloga: Valentina Cruz ────────────────────────────────────
  const vcKey = "valentina-cruz"; const vcName = "Valentina Cruz";
  await supabase.from("reservas").insert([
    { id: uid(), user_id: userId, client_id: vcKey, client_name: vcName, service_id: s0.id, service_name: s0.name, status: "completada", amount: s0.price, tipo_atencion: "presencial", es_control: false, date: ago(75) },
    { id: uid(), user_id: userId, client_id: vcKey, client_name: vcName, service_id: s1.id, service_name: s1.name, status: "completada", amount: s1.price, tipo_atencion: "presencial", es_control: false, date: ago(54) },
    { id: uid(), user_id: userId, client_id: vcKey, client_name: vcName, service_id: s1.id, service_name: s1.name, status: "completada", amount: s1.price, tipo_atencion: "presencial", es_control: false, date: ago(33) },
    { id: uid(), user_id: userId, client_id: vcKey, client_name: vcName, service_id: s1.id, service_name: s1.name, status: "confirmada", amount: s1.price, tipo_atencion: "presencial", es_control: false, date: in_(10) },
  ]);
  await supabase.from("fichas_clientes").insert({
    id: uid(), user_id: userId, client_key: vcKey, client_name: vcName,
    email: "valentina.cruz@gmail.com", phone: "+56 9 6543 2109",
    birth_date: "1995-01-10", occupation: "Ejecutiva comercial", estado: "activo", tipo_atencion: "presencial",
    tipo_piel: "Mixta", sensibilidad: "Moderada", frecuencia: "Cada 3 semanas",
    rutina_actual: "Cetaphil mañana/noche, Vitamina C sérum AM, SPF 50 diario.",
    diagnostico: "Poros dilatados en zona T, manchas post-acné leves en mejillas, deshidratación superficial.",
    proxima_accion: "Peeling enzimático suave + hidratación profunda. Evaluar retinol en rutina nocturna.",
    recomendaciones: ["Usar SPF 50 todos los días sin excepción", "Evitar tocar el rostro durante el día", "Peeling enzimático en casa 1 vez/semana", "Agua micelar para desmaquillar antes del limpiador"],
    notas_generales: "Ordenada con su rutina. Viene puntual. Le interesa mucho entender el por qué de cada producto.",
    created_at: now, updated_at: now,
  });
  await supabase.from("registros").insert([
    { id: uid(), user_id: userId, client_id: vcKey, client_name: vcName, tipo: "tratamiento", titulo: "Limpieza facial profunda + extracción", fecha: ago(75), data: {}, notas: "Comedones abiertos en nariz y mentón. Vapor, extracción y mascarilla caolín. Alta tolerancia." },
    { id: uid(), user_id: userId, client_id: vcKey, client_name: vcName, tipo: "tratamiento", titulo: "Peeling enzimático + vitamina C", fecha: ago(54), data: {}, notas: "Peeling papaya 10 min. Sérum vitamina C 20% con microagujas. Rojez post-tratamiento normal." },
    { id: uid(), user_id: userId, client_id: vcKey, client_name: vcName, tipo: "tratamiento", titulo: "Hidratación profunda + LED", fecha: ago(33), data: {}, notas: "LED luz roja 15 min anti-inflamatoria. Mascarilla ácido hialurónico. Piel notoriamente luminosa." },
  ]);
  await supabase.from("notas_sesion").insert([
    { id: uid(), user_id: userId, client_key: vcKey, date: ago(54), title: "Nota — segunda sesión", content: "Piel menos brillosa desde que cambió el limpiador. Las manchas del acné aclararon un tono." },
    { id: uid(), user_id: userId, client_key: vcKey, date: ago(33), title: "Nota — tercera sesión", content: "Piel en excelente estado. Considerar retinol 0.025% en rutina nocturna próximo mes." },
  ]);

  // ── Odontóloga: Sofía Vargas ───────────────────────────────────────
  const svKey = "sofia-vargas"; const svName = "Sofía Vargas";
  await supabase.from("reservas").insert([
    { id: uid(), user_id: userId, client_id: svKey, client_name: svName, service_id: s0.id, service_name: s0.name, status: "completada", amount: s0.price, tipo_atencion: "presencial", es_control: false, date: ago(60) },
    { id: uid(), user_id: userId, client_id: svKey, client_name: svName, service_id: s1.id, service_name: s1.name, status: "completada", amount: 45000,   tipo_atencion: "presencial", es_control: false, date: ago(30) },
    { id: uid(), user_id: userId, client_id: svKey, client_name: svName, service_id: s1.id, service_name: s1.name, status: "confirmada", amount: 45000,   tipo_atencion: "presencial", es_control: false, date: in_(14) },
  ]);
  await supabase.from("fichas_clientes").insert({
    id: uid(), user_id: userId, client_key: svKey, client_name: svName,
    email: "sofia.vargas@gmail.com", phone: "+56 9 5432 1098",
    birth_date: "1993-11-05", occupation: "Enfermera", estado: "activo", tipo_atencion: "presencial",
    diagnostico: "Caries incipiente pza 16. Pza 26 con restauración previa en buen estado. Pza 36 caries media. Acumulación de sarro lingual.",
    proxima_accion: "Restauración pza 16 y 36 con resina fotopolimerizable. Profilaxis completa.",
    antecedentes_medicos: "Sin enfermedades sistémicas relevantes.",
    alergias: "Alergia a la penicilina",
    dental: { "16": "caries", "26": "tratado", "36": "caries", "46": "tratado", "11": "tratado" },
    notas_generales: "Paciente ansiosa. Prefiere anestesia tópica antes de la infiltración. Trabaja en turnos nocturnos.",
    created_at: now, updated_at: now,
  });
  await supabase.from("registros").insert([
    { id: uid(), user_id: userId, client_id: svKey, client_name: svName, tipo: "tratamiento", titulo: "Examen clínico + radiografías", fecha: ago(60), data: {}, notas: "4 radiografías periapicales. Caries en pzas 16 y 36. Pza 26 restauración antigua en buen estado." },
    { id: uid(), user_id: userId, client_id: svKey, client_name: svName, tipo: "tratamiento", titulo: "Profilaxis + instrucción de higiene", fecha: ago(30), data: {}, notas: "Detartraje supragingival completo. Técnica de Bass modificada. Cepillo interdental entregado." },
  ]);
  await supabase.from("notas_sesion").insert([
    { id: uid(), user_id: userId, client_key: svKey, date: ago(60), title: "Primera consulta", content: "Dolor leve molar superior derecho. Sensible a fríos. Caries pza 16 confirmada. Se explica plan." },
    { id: uid(), user_id: userId, client_key: svKey, date: ago(30), title: "Post-profilaxis", content: "Muy conforme con la limpieza. Se comprometió a usar hilo dental diariamente." },
  ]);
};

// ── Seed demo data ─────────────────────────────────────────────────
export const seedForUser = async (userId: string) => {
  // Guard: skip if user already has services (prevents duplicates on re-register)
  const { data: existing } = await supabase.from("servicios").select("id").eq("user_id", userId).limit(1);
  if (existing && existing.length > 0) return;

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

  // Demo client: María González — ficha completa para previsualizar la UI
  const demoName = "María González";
  const demoKey = "maria-gonzalez";
  const demoReservas = [
    { id: uid(), user_id: userId, client_id: demoKey, client_name: demoName, service_id: services[0].id, service_name: services[0].name, status: "completada", amount: 35000, tipo_atencion: "presencial", es_control: false, date: new Date(Date.now() - 90 * 86400000).toISOString() },
    { id: uid(), user_id: userId, client_id: demoKey, client_name: demoName, service_id: services[1].id, service_name: services[1].name, status: "completada", amount: 28000, tipo_atencion: "presencial", es_control: false, date: new Date(Date.now() - 60 * 86400000).toISOString() },
    { id: uid(), user_id: userId, client_id: demoKey, client_name: demoName, service_id: services[1].id, service_name: services[1].name, status: "completada", amount: 28000, tipo_atencion: "online", es_control: true, date: new Date(Date.now() - 30 * 86400000).toISOString() },
    { id: uid(), user_id: userId, client_id: demoKey, client_name: demoName, service_id: services[1].id, service_name: services[1].name, status: "confirmada", amount: 28000, tipo_atencion: "presencial", es_control: false, date: new Date(Date.now() + 7 * 86400000).toISOString() },
  ];
  await supabase.from("reservas").insert(demoReservas);

  const now = new Date().toISOString();
  await supabase.from("fichas_clientes").insert({
    id: uid(), user_id: userId, client_key: demoKey, client_name: demoName,
    email: "maria.gonzalez@gmail.com", phone: "+56 9 8765 4321",
    birth_date: "1990-03-15", occupation: "Profesora", estado: "activo",
    tipo_atencion: "presencial", motivo_consulta: "Mejorar alimentación y bajar de peso. Ha tenido dificultades para mantener una dieta equilibrada por su trabajo.",
    altura: "163", peso_inicial: "72", peso_actual: "68.5",
    porc_grasa: "28", porc_muscular: "34",
    objetivo_texto: "Llegar a 65 kg con composición corporal saludable. Aumentar masa muscular y reducir % grasa a menos de 25%.",
    evaluacion_inicial: "Paciente con sobrepeso leve, hábitos alimentarios irregulares. Come principalmente fuera del hogar. Actividad física baja (2 veces/semana).",
    plan_tratamiento: "Plan de alimentación saludable con déficit moderado (300 kcal). Incluye 5 comidas al día, énfasis en proteínas y verduras.",
    alergias: "Intolerancia a la lactosa", medicacion: "Ninguna",
    notas_generales: "Muy motivada y constante. Asiste puntual a todas las sesiones. Prefiere sesiones de tarde.",
    created_at: now, updated_at: now,
  });

  await supabase.from("progreso").insert([
    { id: uid(), user_id: userId, client_key: demoKey, fecha: new Date(Date.now() - 90 * 86400000).toISOString(), peso: 72, porc_grasa: 30.5, porc_muscular: 32, notas: "Consulta inicial" },
    { id: uid(), user_id: userId, client_key: demoKey, fecha: new Date(Date.now() - 60 * 86400000).toISOString(), peso: 70.2, porc_grasa: 29.1, porc_muscular: 32.8, notas: "Buena adherencia al plan" },
    { id: uid(), user_id: userId, client_key: demoKey, fecha: new Date(Date.now() - 30 * 86400000).toISOString(), peso: 68.5, porc_grasa: 28.0, porc_muscular: 34.0, notas: "Incorporó ejercicio 3 veces/semana" },
  ]);

  await supabase.from("notas_sesion").insert([
    { id: uid(), user_id: userId, client_key: demoKey, date: new Date(Date.now() - 60 * 86400000).toISOString(), title: "Seguimiento semana 5", content: "Excelente adherencia. Bajó 1.8 kg. Refuerzo en colaciones saludables para el trabajo. Buena actitud hacia el proceso." },
    { id: uid(), user_id: userId, client_key: demoKey, date: new Date(Date.now() - 30 * 86400000).toISOString(), title: "Ajuste de plan — sesión 8", content: "Se ajusta el plan para incorporar más proteína en el desayuno. La paciente comenzó a hacer ejercicio regularmente. Se actualiza objetivo calórico." },
  ]);

  // Demo psicóloga: Laura Morales
  const psiNombre = "Laura Morales";
  const psiKey = "laura-morales";
  const psiReservas = [
    { id: uid(), user_id: userId, client_id: psiKey, client_name: psiNombre, service_id: services[0].id, service_name: services[0].name, status: "completada", amount: 35000, tipo_atencion: "presencial", es_control: false, date: new Date(Date.now() - 84 * 86400000).toISOString() },
    { id: uid(), user_id: userId, client_id: psiKey, client_name: psiNombre, service_id: services[1].id, service_name: services[1].name, status: "completada", amount: 28000, tipo_atencion: "presencial", es_control: false, date: new Date(Date.now() - 56 * 86400000).toISOString() },
    { id: uid(), user_id: userId, client_id: psiKey, client_name: psiNombre, service_id: services[1].id, service_name: services[1].name, status: "completada", amount: 28000, tipo_atencion: "online", es_control: false, date: new Date(Date.now() - 28 * 86400000).toISOString() },
    { id: uid(), user_id: userId, client_id: psiKey, client_name: psiNombre, service_id: services[1].id, service_name: services[1].name, status: "confirmada", amount: 28000, tipo_atencion: "presencial", es_control: false, date: new Date(Date.now() + 5 * 86400000).toISOString() },
  ];
  await supabase.from("reservas").insert(psiReservas);
  await supabase.from("fichas_clientes").insert({
    id: uid(), user_id: userId, client_key: psiKey, client_name: psiNombre,
    email: "laura.morales@gmail.com", phone: "+56 9 7654 3210",
    birth_date: "1987-07-22", occupation: "Diseñadora gráfica", estado: "activo",
    tipo_atencion: "presencial",
    motivo_consulta: "Ansiedad generalizada y crisis de pánico recurrentes desde hace 2 años. Dificultades para dormir y concentrarse en el trabajo.",
    objetivos: "Reducir frecuencia e intensidad de las crisis. Desarrollar herramientas de regulación emocional. Mejorar calidad del sueño.",
    evaluacion_nivel: "medio",
    progreso_texto: "La paciente muestra avance significativo en técnicas de respiración y mindfulness. Ha logrado reducir las crisis de pánico de 3 a 1 por semana.",
    alertas: "Historial de crisis nocturnas. Avisar ante cualquier cambio en medicación (clonazepam 0.5mg según necesidad).",
    notas_generales: "Muy comprometida con el proceso. Hace las tareas entre sesiones. Le cuesta hablar de su familia de origen.",
    created_at: now, updated_at: now,
  });
  await supabase.from("registros").insert([
    { id: uid(), user_id: userId, client_id: psiKey, client_name: psiNombre, tipo: "sesion", titulo: "Sesión 1 — Evaluación inicial", fecha: new Date(Date.now() - 84 * 86400000).toISOString(), data: {}, notas: "Se aplica entrevista inicial. Paciente relata episodios de pánico en el trabajo. Alta motivación al cambio." },
    { id: uid(), user_id: userId, client_id: psiKey, client_name: psiNombre, tipo: "sesion", titulo: "Sesión 3 — Técnicas de respiración", fecha: new Date(Date.now() - 56 * 86400000).toISOString(), data: {}, notas: "Se trabaja respiración 4-7-8 y grounding 5-4-3-2-1. Reporta haber usado la técnica dos veces durante la semana con buen resultado." },
    { id: uid(), user_id: userId, client_id: psiKey, client_name: psiNombre, tipo: "sesion", titulo: "Sesión 6 — Reestructuración cognitiva", fecha: new Date(Date.now() - 28 * 86400000).toISOString(), data: {}, notas: "Se identifican distorsiones cognitivas principales: catastrofización y lectura del pensamiento. La paciente logra cuestionar pensamientos automáticos." },
  ]);
  await supabase.from("notas_sesion").insert([
    { id: uid(), user_id: userId, client_key: psiKey, date: new Date(Date.now() - 56 * 86400000).toISOString(), title: "Nota privada — sesión 3", content: "Paciente menciona conflicto con su pareja que no quiere profundizar aún. Quedó pendiente para próxima sesión si ella lo trae." },
    { id: uid(), user_id: userId, client_key: psiKey, date: new Date(Date.now() - 28 * 86400000).toISOString(), title: "Nota privada — sesión 6", content: "Menciona que su madre también tuvo ataques de pánico. Posible componente hereditario/aprendido. Explorar en próxima sesión." },
  ]);

  // Demo cosmetóloga: Valentina Cruz
  const cosNombre = "Valentina Cruz";
  const cosKey = "valentina-cruz";
  const cosReservas = [
    { id: uid(), user_id: userId, client_id: cosKey, client_name: cosNombre, service_id: services[0].id, service_name: services[0].name, status: "completada", amount: 35000, tipo_atencion: "presencial", es_control: false, date: new Date(Date.now() - 75 * 86400000).toISOString() },
    { id: uid(), user_id: userId, client_id: cosKey, client_name: cosNombre, service_id: services[1].id, service_name: services[1].name, status: "completada", amount: 28000, tipo_atencion: "presencial", es_control: false, date: new Date(Date.now() - 54 * 86400000).toISOString() },
    { id: uid(), user_id: userId, client_id: cosKey, client_name: cosNombre, service_id: services[1].id, service_name: services[1].name, status: "completada", amount: 28000, tipo_atencion: "presencial", es_control: false, date: new Date(Date.now() - 33 * 86400000).toISOString() },
    { id: uid(), user_id: userId, client_id: cosKey, client_name: cosNombre, service_id: services[1].id, service_name: services[1].name, status: "confirmada", amount: 28000, tipo_atencion: "presencial", es_control: false, date: new Date(Date.now() + 10 * 86400000).toISOString() },
  ];
  await supabase.from("reservas").insert(cosReservas);
  await supabase.from("fichas_clientes").insert({
    id: uid(), user_id: userId, client_key: cosKey, client_name: cosNombre,
    email: "valentina.cruz@gmail.com", phone: "+56 9 6543 2109",
    birth_date: "1995-01-10", occupation: "Ejecutiva comercial", estado: "activo",
    tipo_atencion: "presencial",
    tipo_piel: "Mixta", sensibilidad: "Moderada", frecuencia: "Cada 3 semanas",
    rutina_actual: "Limpiadora Cetaphil mañana y noche, Vitamina C sérum en la mañana, SPF 50 diario.",
    diagnostico: "Poros dilatados en zona T, manchas post-acné leves en mejillas, deshidratación superficial.",
    proxima_accion: "Peeling enzimático suave + hidratación profunda. Evaluar si incorporar retinol en rutina nocturna.",
    recomendaciones: ["Usar SPF 50 todos los días sin excepción", "Evitar tocar el rostro durante el día", "Peeling enzimático en casa 1 vez/semana", "Micellar water para desmaquillar antes del limpiador"],
    notas_generales: "Muy ordenada con su rutina. Viene puntual. Le interesa mucho entender el por qué de cada producto.",
    created_at: now, updated_at: now,
  });
  await supabase.from("registros").insert([
    { id: uid(), user_id: userId, client_id: cosKey, client_name: cosNombre, tipo: "tratamiento", titulo: "Limpieza facial profunda + extracción", fecha: new Date(Date.now() - 75 * 86400000).toISOString(), data: {}, notas: "Piel con comedones abiertos en nariz y mentón. Se realiza vapor, extracción manual y mascarilla de caolín. Alta tolerancia al dolor." },
    { id: uid(), user_id: userId, client_id: cosKey, client_name: cosNombre, tipo: "tratamiento", titulo: "Peeling enzimático + vitamina C", fecha: new Date(Date.now() - 54 * 86400000).toISOString(), data: {}, notas: "Se aplica peeling enzimático de papaya 10 min. Luego sérum vitamina C 20% con microagujas. Piel rojiza post-tratamiento normal." },
    { id: uid(), user_id: userId, client_id: cosKey, client_name: cosNombre, tipo: "tratamiento", titulo: "Hidratación profunda + LED", fecha: new Date(Date.now() - 33 * 86400000).toISOString(), data: {}, notas: "Terapia LED luz roja 15 min anti-inflamatoria. Mascarilla de ácido hialurónico. Piel notoriamente más luminosa al finalizar." },
  ]);
  await supabase.from("notas_sesion").insert([
    { id: uid(), user_id: userId, client_key: cosKey, date: new Date(Date.now() - 54 * 86400000).toISOString(), title: "Nota — segunda sesión", content: "La paciente reporta que su piel está mucho menos brillosa desde que cambió el limpiador. Las manchas del acné han aclarado un tono. Continuar con el plan actual." },
    { id: uid(), user_id: userId, client_key: cosKey, date: new Date(Date.now() - 33 * 86400000).toISOString(), title: "Nota — tercera sesión", content: "Piel en excelente estado. Considerar agregar retinol 0.025% en rutina nocturna a partir del próximo mes. Avisar en caso de irritación." },
  ]);

  // Demo odontóloga: Sofía Vargas
  const odonNombre = "Sofía Vargas";
  const odonKey = "sofia-vargas";
  const odonReservas = [
    { id: uid(), user_id: userId, client_id: odonKey, client_name: odonNombre, service_id: services[0].id, service_name: services[0].name, status: "completada", amount: 35000, tipo_atencion: "presencial", es_control: false, date: new Date(Date.now() - 60 * 86400000).toISOString() },
    { id: uid(), user_id: userId, client_id: odonKey, client_name: odonNombre, service_id: services[1].id, service_name: services[1].name, status: "completada", amount: 45000, tipo_atencion: "presencial", es_control: false, date: new Date(Date.now() - 30 * 86400000).toISOString() },
    { id: uid(), user_id: userId, client_id: odonKey, client_name: odonNombre, service_id: services[1].id, service_name: services[1].name, status: "confirmada", amount: 45000, tipo_atencion: "presencial", es_control: false, date: new Date(Date.now() + 14 * 86400000).toISOString() },
  ];
  await supabase.from("reservas").insert(odonReservas);
  await supabase.from("fichas_clientes").insert({
    id: uid(), user_id: userId, client_key: odonKey, client_name: odonNombre,
    email: "sofia.vargas@gmail.com", phone: "+56 9 5432 1098",
    birth_date: "1993-11-05", occupation: "Enfermera", estado: "activo",
    tipo_atencion: "presencial",
    diagnostico: "Caries incipiente pza 16. Pza 26 con restauración previa en buen estado. Pza 36 caries media. Higiene oral mejorable, acumulación de sarro lingual.",
    proxima_accion: "Restauración pza 16 y 36 con resina fotopolimerizable. Profilaxis completa + instrucción de higiene oral.",
    antecedentes_medicos: "Sin enfermedades sistémicas relevantes. No anticoagulantes ni bifosfonatos.",
    alergias: "Alergia a la penicilina (reportada)",
    dental: { "16": "caries", "26": "tratado", "36": "caries", "46": "tratado", "11": "tratado", "21": "sano" },
    notas_generales: "Paciente ansiosa ante los procedimientos. Prefiere anestesia tópica antes de la infiltración. Trabaja en turnos nocturnos.",
    created_at: now, updated_at: now,
  });
  await supabase.from("registros").insert([
    { id: uid(), user_id: userId, client_id: odonKey, client_name: odonNombre, tipo: "tratamiento", titulo: "Examen clínico + radiografías", fecha: new Date(Date.now() - 60 * 86400000).toISOString(), data: {}, notas: "Se toman 4 radiografías periapicales. Se detectan caries en pzas 16 y 36. Pza 26 con restauración antigua en buen estado. Se planifica tratamiento." },
    { id: uid(), user_id: userId, client_id: odonKey, client_name: odonNombre, tipo: "tratamiento", titulo: "Profilaxis + instrucción de higiene", fecha: new Date(Date.now() - 30 * 86400000).toISOString(), data: {}, notas: "Detartraje supragingival completo. Se instruye en técnica de Bass modificada. Se entrega cepillo interdental. Paciente colaboradora." },
  ]);
  await supabase.from("notas_sesion").insert([
    { id: uid(), user_id: userId, client_key: odonKey, date: new Date(Date.now() - 60 * 86400000).toISOString(), title: "Primera consulta", content: "Paciente llega con dolor leve en sector molar superior derecho. Sensible a fríos. Se confirma caries pza 16. Se tranquiliza y explica el plan de tratamiento." },
    { id: uid(), user_id: userId, client_key: odonKey, date: new Date(Date.now() - 30 * 86400000).toISOString(), title: "Post-profilaxis", content: "Paciente muy conforme con la limpieza. Refiere que no se limpiaba con hilo dental. Se comprometió a hacerlo diariamente. Control próximo: restauraciones pzas 16 y 36." },
  ]);
};
