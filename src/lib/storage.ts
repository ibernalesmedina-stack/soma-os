// Local mock store. Schema mirrors a Supabase-ready backend (user_id scoping).
import type { Automation, Bloqueo, ClienteFicha, Pago, Plan, ProgresoEntry, Registro, Reserva, Servicio, SesionNota, SubmoduloCosmetologa, TipoNegocio, User } from "./types";
import { slugify } from "./format";

const K = {
  users: "soma.users",
  session: "soma.session",
  reservas: "soma.reservas",
  pagos: "soma.pagos",
  servicios: "soma.servicios",
  automations: "soma.automations",
  fichas: "soma.fichas",
  notas: "soma.notas",
  registros: "soma.registros",
  bloqueos: "soma.bloqueos",
  progreso: "soma.progreso",
};

const read = <T,>(k: string, def: T): T => {
  try { return JSON.parse(localStorage.getItem(k) || "") as T; } catch { return def; }
};
const write = (k: string, v: unknown) => localStorage.setItem(k, JSON.stringify(v));

export const uid = () => Math.random().toString(36).slice(2, 10);

// --- Auth ---
export const getUsers = () => {
  const all = read<User[]>(K.users, []);
  // Migración progresiva
  let migrated = false;
  const out = all.map((u) => {
    let next = u;
    if (!next.tipoNegocio) { migrated = true; next = { ...next, tipoNegocio: "psicologa" as TipoNegocio }; }
    if (!next.role) { migrated = true; next = { ...next, role: "user" }; }
    if (!next.phone) { migrated = true; next = { ...next, phone: "" }; }
    if (!next.paymentMethods) { migrated = true; next = { ...next, paymentMethods: { webpay: true, transferencia: true } }; }
    if (next.active === undefined) { migrated = true; next = { ...next, active: true }; }
    return next;
  });
  if (migrated) write(K.users, out);
  return out;
};
export const saveUsers = (u: User[]) => write(K.users, u);
export const getSession = () => read<string | null>(K.session, null);
export const setSession = (id: string | null) => write(K.session, id);
export const currentUser = (): User | null => {
  const id = getSession();
  if (!id) return null;
  return getUsers().find((u) => u.id === id) ?? null;
};
export const updateUser = (patch: Partial<User>) => {
  const id = getSession();
  if (!id) return;
  const users = getUsers().map((u) => (u.id === id ? { ...u, ...patch } : u));
  saveUsers(users);
};
export const updateUserById = (id: string, patch: Partial<User>) => {
  const users = getUsers().map((u) => (u.id === id ? { ...u, ...patch } : u));
  saveUsers(users);
};

export const signIn = (email: string, password: string): User | null => {
  const u = getUsers().find((x) => x.email.toLowerCase() === email.toLowerCase());
  if (!u) return null;
  if ((u as User & { _pw?: string })._pw !== password) return null;
  setSession(u.id);
  return u;
};
export const signUp = (data: { email: string; password: string; name: string; businessName: string; phone: string; plan: Plan; tipoNegocio: TipoNegocio; submodulos?: SubmoduloCosmetologa[] }) => {
  const users = getUsers();
  if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
    return { error: "Este email ya está registrado" };
  }
  // El primer usuario creado es admin (útil para acceder a /admin en demo)
  const role: User["role"] = users.length === 0 ? "admin" : "user";
  const user: User = {
    id: uid(),
    email: data.email,
    name: data.name,
    businessName: data.businessName,
    phone: data.phone,
    role,
    plan: data.plan,
    tipoNegocio: data.tipoNegocio,
    submodulos: data.submodulos,
    paymentMethods: { webpay: true, transferencia: true },
    active: true,
    createdAt: new Date().toISOString(),
  };
  (user as User & { _pw?: string })._pw = data.password;
  saveUsers([...users, user]);
  setSession(user.id);
  seedForUser(user.id);
  return { user };
};
export const signOut = () => setSession(null);
export const impersonate = (userId: string) => setSession(userId);

// --- Scoped CRUD ---
const scoped = <T extends { user_id: string }>(key: string, userId: string) =>
  read<T[]>(key, []).filter((r) => r.user_id === userId);

export const listReservas = (uid: string) => scoped<Reserva>(K.reservas, uid);
export const listPagos = (uid: string) => scoped<Pago>(K.pagos, uid);
export const listServicios = (uid: string) => scoped<Servicio>(K.servicios, uid);
export const listAutomations = (userId: string) => {
  const all = read<Automation[]>(K.automations, []);
  // Mantener solo las automatizaciones permitidas
  const allowedNames = ["Confirmación por email", "Recordatorio 24h antes", "Recordatorio 2h antes", "Seguimiento post sesión", "Recordatorio 30 días después"];
  const cleaned = all.filter((a) => !(a.user_id === userId && !allowedNames.includes(a.name)));
  // Migrar canales existentes a whatsapp_email
  const migrated = cleaned.map((a) => a.user_id === userId ? { ...a, channel: "whatsapp_email" as const } : a);
  const mine = migrated.filter((a) => a.user_id === userId);
  const required: Omit<Automation, "id" | "user_id">[] = [
    { name: "Confirmación por email", description: "Al crearse una reserva, por WhatsApp y email", channel: "whatsapp_email", enabled: true },
    { name: "Recordatorio 24h antes", description: "Envío 24h antes de la cita por WhatsApp y email", channel: "whatsapp_email", enabled: true },
    { name: "Recordatorio 2h antes", description: "Envío 2h antes de la cita por WhatsApp y email", channel: "whatsapp_email", enabled: true },
    { name: "Seguimiento post sesión", description: "Envío 15 días después: seguimiento + review, por WhatsApp y email", channel: "whatsapp_email", enabled: false },
    { name: "Recordatorio 30 días después", description: "Recordatorio para que vuelvan a agendar, por WhatsApp y email", channel: "whatsapp_email", enabled: false },
  ];
  const missing = required.filter((r) => !mine.some((m) => m.name === r.name));
  let next = migrated;
  if (missing.length) {
    const added: Automation[] = missing.map((r) => ({ ...r, id: uid(), user_id: userId }));
    next = [...migrated, ...added];
  }
  if (JSON.stringify(next) !== JSON.stringify(all)) write(K.automations, next);
  return next.filter((a) => a.user_id === userId);
};

export const importFichasCSV = (userId: string, rows: Array<Record<string, string>>) => {
  const all = read<ClienteFicha[]>(K.fichas, []);
  let added = 0; let updated = 0;
  for (const row of rows) {
    const name = (row.clientName || row.nombre || row.name || "").trim();
    if (!name) continue;
    const key = slugify(name);
    const existing = all.find((f) => f.user_id === userId && f.clientKey === key);
    const patch: Partial<ClienteFicha> = {
      email: row.email || undefined,
      phone: row.phone || row.telefono || undefined,
      birthDate: row.birthDate || row.fechaNacimiento || undefined,
      address: row.address || row.direccion || undefined,
      notasGenerales: row.notas || row.notasGenerales || undefined,
    };
    if (existing) {
      Object.assign(existing, patch, { updatedAt: new Date().toISOString() });
      updated++;
    } else {
      const now = new Date().toISOString();
      all.push({ id: uid(), user_id: userId, clientKey: key, clientName: name, createdAt: now, updatedAt: now, ...patch });
      added++;
    }
  }
  write(K.fichas, all);
  return { added, updated };
};
export const listFichas = (uid: string) => scoped<ClienteFicha>(K.fichas, uid);
export const listNotas = (uid: string) => scoped<SesionNota>(K.notas, uid);
export const listRegistros = (uid: string) => scoped<Registro>(K.registros, uid);
export const listBloqueos = (uid: string) => scoped<Bloqueo>(K.bloqueos, uid);
export const listProgreso = (uid: string) => scoped<ProgresoEntry>(K.progreso, uid);

export const addProgreso = (p: Omit<ProgresoEntry, "id" | "createdAt">) => {
  const entry: ProgresoEntry = { ...p, id: uid(), createdAt: new Date().toISOString() };
  write(K.progreso, [...read<ProgresoEntry[]>(K.progreso, []), entry]);
  return entry;
};
export const deleteProgreso = (id: string) => {
  write(K.progreso, read<ProgresoEntry[]>(K.progreso, []).filter((p) => p.id !== id));
};

export const getOrCreateFicha = (userId: string, clientName: string): ClienteFicha => {
  const clientKey = slugify(clientName);
  const all = read<ClienteFicha[]>(K.fichas, []);
  const found = all.find((f) => f.user_id === userId && f.clientKey === clientKey);
  if (found) return found;
  const now = new Date().toISOString();
  const ficha: ClienteFicha = {
    id: uid(),
    user_id: userId,
    clientKey,
    clientName,
    createdAt: now,
    updatedAt: now,
  };
  write(K.fichas, [...all, ficha]);
  return ficha;
};

export const updateFicha = (id: string, patch: Partial<ClienteFicha>) => {
  const all = read<ClienteFicha[]>(K.fichas, []);
  write(K.fichas, all.map((f) => (f.id === id ? { ...f, ...patch, updatedAt: new Date().toISOString() } : f)));
};

export const addNota = (n: Omit<SesionNota, "id" | "createdAt">) => {
  const nota: SesionNota = { ...n, id: uid(), createdAt: new Date().toISOString() };
  write(K.notas, [...read<SesionNota[]>(K.notas, []), nota]);
  return nota;
};

export const deleteNota = (id: string) => {
  write(K.notas, read<SesionNota[]>(K.notas, []).filter((n) => n.id !== id));
};

export const addRegistro = (r: Omit<Registro, "id" | "createdAt">) => {
  const reg: Registro = { ...r, id: uid(), createdAt: new Date().toISOString() };
  write(K.registros, [...read<Registro[]>(K.registros, []), reg]);
  return reg;
};
export const deleteRegistro = (id: string) => {
  write(K.registros, read<Registro[]>(K.registros, []).filter((r) => r.id !== id));
};

export const addBloqueo = (b: Omit<Bloqueo, "id" | "createdAt">) => {
  const bl: Bloqueo = { ...b, id: uid(), createdAt: new Date().toISOString() };
  write(K.bloqueos, [...read<Bloqueo[]>(K.bloqueos, []), bl]);
  return bl;
};
export const deleteBloqueo = (id: string) => {
  write(K.bloqueos, read<Bloqueo[]>(K.bloqueos, []).filter((b) => b.id !== id));
};

export const upsertServicio = (s: Servicio) => {
  const all = read<Servicio[]>(K.servicios, []);
  const i = all.findIndex((x) => x.id === s.id);
  if (i >= 0) all[i] = s; else all.push(s);
  write(K.servicios, all);
};
export const deleteServicio = (id: string) => {
  write(K.servicios, read<Servicio[]>(K.servicios, []).filter((s) => s.id !== id));
};
export const toggleAutomation = (id: string) => {
  const all = read<Automation[]>(K.automations, []);
  write(K.automations, all.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)));
};

// First-visit detection: a client is "nuevo" if they have only one (or zero past) reservas
export const isClienteNuevo = (userId: string, clientKey: string): boolean => {
  const reservas = listReservas(userId).filter((r) => slugify(r.clientName) === clientKey);
  if (reservas.length === 0) return true;
  const completedOrPast = reservas.filter((r) => r.status === "completada" || new Date(r.date) < new Date());
  return completedOrPast.length <= 1;
};

// --- Seed demo data per user ---
export const seedForUser = (userId: string) => {
  const services: Servicio[] = [
    { id: uid(), user_id: userId, name: "Sesión inicial", description: "Consulta de diagnóstico 1:1", price: 35000, durationMin: 60, active: true },
    { id: uid(), user_id: userId, name: "Sesión de seguimiento", description: "Continuidad del plan", price: 28000, durationMin: 45, active: true },
    { id: uid(), user_id: userId, name: "Plan mensual", description: "4 sesiones al mes", price: 110000, durationMin: 60, active: true },
  ];
  write(K.servicios, [...read<Servicio[]>(K.servicios, []), ...services]);

  const names = ["María Fernández", "Sofía López", "Camila Ruiz", "Isabel Martínez", "Valeria Pérez", "Andrea Soto", "Diego Torres", "Lucía Rojas"];
  const statuses: Reserva["status"][] = ["confirmada", "pendiente", "completada", "confirmada", "cancelada"];
  const reservas: Reserva[] = Array.from({ length: 14 }).map((_, i) => {
    const s = services[i % services.length];
    const d = new Date();
    d.setDate(d.getDate() + (i - 6));
    d.setHours(9 + (i % 8), 0, 0, 0);
    return {
      id: uid(),
      user_id: userId,
      client_id: uid(),
      clientName: names[i % names.length],
      date: d.toISOString(),
      serviceId: s.id,
      serviceName: s.name,
      status: statuses[i % statuses.length],
      amount: s.price,
      tipoAtencion: i % 2 === 0 ? "presencial" : "online",
      esControl: i % 3 === 0,
    };
  });
  write(K.reservas, [...read<Reserva[]>(K.reservas, []), ...reservas]);

  const pagos: Pago[] = reservas
    .filter((r) => r.status === "completada" || r.status === "confirmada")
    .map((r, i) => ({
      id: uid(),
      user_id: userId,
      client_id: r.client_id,
      clientName: r.clientName,
      date: r.date,
      amount: r.amount,
      method: (["WebPay", "Transferencia", "Efectivo"] as const)[i % 3],
      status: i % 4 === 0 ? "pendiente" : "pagado",
      reservaId: r.id,
    }));
  write(K.pagos, [...read<Pago[]>(K.pagos, []), ...pagos]);

  // Automations are auto-seeded on first listAutomations() call.
};

