import type { VercelRequest, VercelResponse } from "@vercel/node";

const SUPABASE_URL = "https://fwxutchyumopwvertisd.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const RESEND_API_KEY = process.env.RESEND_API_KEY!;
// Access token de Mercado Pago de la Dra. Paola (Vercel → Environment Variables).
// Si no está configurado, la reserva funciona como antes (sin cobro del abono en línea).
const MP_TOKEN = process.env.MP_ACCESS_TOKEN_PAOLA;
const SITE_URL = "https://www.drapaolacardenasfica.com";
const DRA_EMAIL = "p.cardenasfica@gmail.com";
const USER_ID = "758b6456-4b1d-48cd-8325-8ee3f20869f0";

// Abono para reservar: se descuenta del total si el tratamiento se realiza el mismo día
const ABONO = 20000;
// Una hora queda "retenida" mientras la clienta paga; si no paga, se libera.
const MARCA_ESPERA = " · esperando abono";
const MINUTOS_PARA_PAGAR = 30;

// Dra. Paola's booking hours: martes y jueves, bloques de 30 min entre 10:00 y 16:00
const SCHEDULE: Record<number, { start: number; end: number }> = {
  2: { start: 600, end: 960 }, // Tue 10:00–16:00
  4: { start: 600, end: 960 }, // Thu 10:00–16:00
};
const SLOT_DURATION = 30;

function allSlots(date: string): string[] {
  const dow = new Date(date + "T12:00:00").getDay();
  const sched = SCHEDULE[dow];
  if (!sched) return [];
  const result: string[] = [];
  for (let m = sched.start; m + SLOT_DURATION <= sched.end; m += SLOT_DURATION) {
    result.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
  }
  return result;
}

/** Minutos de diferencia entre Santiago y UTC para ese día (ej. -180) */
function offsetSantiago(date: string): number {
  const noonUTC = new Date(`${date}T12:00:00Z`);
  const h = parseInt(new Intl.DateTimeFormat("en", { timeZone: "America/Santiago", hour: "numeric", hour12: false }).format(noonUTC));
  return (h - 12) * 60;
}

/** "2026-11-26" + "10:30" (hora de Santiago) → Date en UTC */
function aUTC(date: string, hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  return new Date(new Date(`${date}T00:00:00Z`).getTime() + (h * 60 + m - offsetSantiago(date)) * 60_000);
}

const sbHeaders = () => ({ apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json" });

async function sbGet(path: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: sbHeaders() });
  return res.json();
}

async function sbPatch(path: string, body: unknown): Promise<Record<string, unknown>[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: "PATCH",
    headers: { ...sbHeaders(), Prefer: "return=representation" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => []);
  return Array.isArray(data) ? data : [];
}

/** Libera las horas retenidas cuyo abono no se pagó a tiempo */
async function liberarRetenciones() {
  const limite = new Date(Date.now() - (MINUTOS_PARA_PAGAR + 10) * 60_000).toISOString();
  await sbPatch(
    `reservas?user_id=eq.${USER_ID}&status=eq.pendiente&service_name=like.*${encodeURIComponent("esperando abono")}*&created_at=lt.${limite}`,
    { status: "cancelada" },
  ).catch(() => []);
}

async function horaOcupada(isoDate: string, exceptoId?: string): Promise<boolean> {
  const rows = await sbGet(`reservas?user_id=eq.${USER_ID}&date=eq.${encodeURIComponent(isoDate)}&status=neq.cancelada&select=id`);
  return Array.isArray(rows) && rows.some((r: { id: string }) => r.id !== exceptoId);
}

async function getAccessToken(token: { access_token: string; refresh_token: string; expiry_date?: number }) {
  if (!token.expiry_date || Date.now() < token.expiry_date - 60_000) return token.access_token;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: token.refresh_token,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  return data.access_token as string;
}

type DatosReserva = {
  reservaId: string; name: string; email?: string; phone?: string; rut?: string;
  date: string; hour: string; serviceName: string;
};

async function crearEventoCalendario(d: DatosReserva, pagado: boolean) {
  try {
    const [integration] = await sbGet(`client_integrations?user_id=eq.${USER_ID}&select=google_access_token,google_refresh_token,google_token_expiry`);
    if (!integration?.google_access_token) return;
    const accessToken = await getAccessToken({
      access_token: integration.google_access_token,
      refresh_token: integration.google_refresh_token,
      expiry_date: integration.google_token_expiry ? new Date(integration.google_token_expiry).getTime() : undefined,
    });
    const [h, m] = d.hour.split(":").map(Number);
    const endH = String(Math.floor((h * 60 + m + SLOT_DURATION) / 60)).padStart(2, "0");
    const endM = String((h * 60 + m + SLOT_DURATION) % 60).padStart(2, "0");
    await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        summary: `${d.serviceName} · ${d.name}`,
        description: `Paciente: ${d.name}\nRUT: ${d.rut || "-"}\nEmail: ${d.email || "-"}\nTeléfono: ${d.phone || "-"}${pagado ? `\nAbono pagado: $${ABONO.toLocaleString("es-CL")} (Mercado Pago)` : ""}`,
        start: { dateTime: `${d.date}T${d.hour}:00`, timeZone: "America/Santiago" },
        end: { dateTime: `${d.date}T${endH}:${endM}:00`, timeZone: "America/Santiago" },
      }),
    });
  } catch (e) {
    console.error("Calendar event failed (reservation saved):", e);
  }
}

const ESTILOS_EMAIL = `
  body{margin:0;padding:0;background:#EAE5DE;font-family:'Helvetica Neue',Arial,sans-serif;}
  .wrap{max-width:560px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);}
  .header{background:#2E3135;padding:28px 32px 24px;}
  .header h1{margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:-.3px;}
  .header p{margin:5px 0 0;color:rgba(255,255,255,.65);font-size:13px;}
  .body{padding:28px 32px;}
  .card{background:#F8F6F2;border:1px solid #EAE5DE;border-radius:10px;overflow:hidden;margin:18px 0;}
  .row{padding:13px 16px;border-bottom:1px solid #EAE5DE;}
  .row:last-child{border-bottom:none;}
  .label{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#8C8378;margin-bottom:3px;}
  .value{display:block;font-size:15px;font-weight:600;color:#322C28;}
  .btn{display:inline-block;background:#B89B6A;color:#fff;padding:15px 36px;border-radius:100px;font-weight:700;font-size:15px;text-decoration:none;letter-spacing:-.2px;}
  .footer{padding:18px 32px;border-top:1px solid #ececec;font-size:12px;color:#8C8378;text-align:center;}`;

async function enviarCorreos(d: DatosReserva, pagado: boolean) {
  const emailStatus: { client?: string; admin?: string; error?: string } = {};
  if (!RESEND_API_KEY) { emailStatus.error = "RESEND_API_KEY not set"; return emailStatus; }

  const confirmUrl = `${SITE_URL}/api/booking/confirm-paola?id=${d.reservaId}`;
  const cancelUrl = `${SITE_URL}/api/booking/cancel-paola?id=${d.reservaId}`;
  const fechaFormateada = new Date(`${d.date}T${d.hour}:00`).toLocaleString("es-CL", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
  const abonoTxt = `$${ABONO.toLocaleString("es-CL")}`;

  const intro = pagado
    ? `Hola <strong>${d.name}</strong> 👋<br>Recibimos tu abono de <strong>${abonoTxt}</strong> y tu hora quedó <strong>reservada</strong>. El abono se descuenta del valor total del tratamiento si lo realizas el mismo día.`
    : `Hola <strong>${d.name}</strong> 👋<br>Recibimos tu solicitud. <strong>Confirma tu hora haciendo click en el botón de abajo</strong> — hasta que confirmes, el horario no quedará reservado.`;
  const boton = pagado ? "" : `<div style="text-align:center;margin:28px 0 20px;"><a href="${confirmUrl}" class="btn">Confirmar mi reserva ✓</a></div>`;

  const clientHtml = `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>${ESTILOS_EMAIL}</style>
</head>
<body><div class="wrap">
  <div class="header">
    <h1>${pagado ? "Tu hora está reservada" : "Solicitud de reserva recibida"}</h1>
    <p>Dra. Paola Cárdenas Fica · Implantología Bucomaxilofacial</p>
  </div>
  <div class="body">
    <p style="font-size:15px;color:#5A5148;margin-top:0;line-height:1.6;">${intro}</p>
    <div class="card">
      <div class="row"><span class="label">Motivo</span><span class="value">${d.serviceName}</span></div>
      <div class="row"><span class="label">Fecha y hora</span><span class="value" style="text-transform:capitalize;">${fechaFormateada}</span></div>
      <div class="row"><span class="label">Modalidad</span><span class="value">🖥️ Online</span></div>
      ${pagado ? `<div class="row"><span class="label">Abono pagado</span><span class="value">${abonoTxt} · Mercado Pago</span></div>` : ""}
    </div>
    ${boton}
    <p style="text-align:center;margin:14px 0 0;">
      <a href="${cancelUrl}" style="color:#b91c1c;font-size:13px;text-decoration:underline;">Cancelar esta hora</a>
    </p>
    <p style="font-size:13px;color:#5A5148;margin-top:20px;border-top:1px solid #f0f0ee;padding-top:16px;">
      ¿Necesitas cambiar la hora? Escríbeme por <a href="https://wa.me/56971252179" style="color:#2E3135;font-weight:600;">WhatsApp</a>.
    </p>
  </div>
  <div class="footer">Dra. Paola Cárdenas Fica · Concón, Chile</div>
</div></body></html>`;
  const FROM = "Dra. Paola Cárdenas Fica <noreply@somaos.app>";

  if (d.email) {
    try {
      const r1 = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: FROM, to: [d.email], subject: pagado ? `Hora reservada — ${d.date} ${d.hour}` : `Confirma tu evaluación — ${d.date}`, html: clientHtml }),
      });
      emailStatus.client = r1.ok ? "sent" : `failed: ${await r1.text()}`;
    } catch (e) {
      emailStatus.client = `error: ${String(e)}`;
    }
  }

  try {
    const r2 = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM, to: [DRA_EMAIL],
        subject: `Nueva reserva${pagado ? " (abono pagado)" : ""}: ${d.name} — ${d.date} ${d.hour}`,
        html: `<p><b>Paciente:</b> ${d.name} | <b>Motivo:</b> ${d.serviceName} | <b>Fecha:</b> ${d.date} ${d.hour} | <b>Email:</b> ${d.email || "-"} | <b>Tel:</b> ${d.phone || "-"}${pagado ? ` | <b>Abono:</b> ${abonoTxt} pagado por Mercado Pago` : ""}</p>`,
      }),
    });
    emailStatus.admin = r2.ok ? "sent" : `failed: ${await r2.text()}`;
  } catch (e) {
    emailStatus.admin = `error: ${String(e)}`;
  }
  return emailStatus;
}

/**
 * Verifica un pago en Mercado Pago y, si está aprobado, confirma la reserva asociada.
 * Es idempotente: el webhook y la vuelta de la clienta al sitio pueden llamarla ambas.
 */
async function confirmarPago(paymentId: string): Promise<{ estado: string; reservaId?: string; fecha?: string; hora?: string }> {
  const r = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: `Bearer ${MP_TOKEN}` },
  });
  if (!r.ok) return { estado: "desconocido" };
  const pago = await r.json();
  const reservaId: string | undefined = pago.external_reference;
  const meta = pago.metadata ?? {};
  if (!reservaId || !meta.date || !meta.hour) return { estado: "desconocido" };
  const base = { reservaId, fecha: meta.date as string, hora: meta.hour as string };

  if (pago.status !== "approved") {
    return { ...base, estado: pago.status === "pending" || pago.status === "in_process" ? "pendiente" : "rechazado" };
  }
  if (Number(pago.transaction_amount) < ABONO) return { ...base, estado: "monto-incorrecto" };

  const datos: DatosReserva = {
    reservaId, name: meta.name, email: meta.email, phone: meta.phone, rut: meta.rut,
    date: meta.date, hour: meta.hour, serviceName: meta.service_name,
  };
  const confirmar = { status: "confirmada", amount: ABONO, service_name: datos.serviceName };

  // Caso normal: la hora seguía retenida esperando el pago
  let filas = await sbPatch(`reservas?id=eq.${reservaId}&status=eq.pendiente`, confirmar);

  if (!filas.length) {
    const [actual] = await sbGet(`reservas?id=eq.${reservaId}&select=id,status,date`);
    if (actual?.status === "confirmada") return { ...base, estado: "confirmada" };
    // La retención venció antes de que llegara el pago: se recupera la hora si sigue libre
    if (actual?.status === "cancelada" && !(await horaOcupada(actual.date, reservaId))) {
      filas = await sbPatch(`reservas?id=eq.${reservaId}&status=eq.cancelada`, confirmar);
    }
    if (!filas.length) {
      // Pagó pero la hora ya no está disponible: se avisa a la doctora para reagendar o devolver
      if (RESEND_API_KEY) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "Dra. Paola Cárdenas Fica <noreply@somaos.app>", to: [DRA_EMAIL],
            subject: `Abono pagado sin hora disponible: ${datos.name}`,
            html: `<p>${datos.name} pagó el abono (${paymentId}) para el ${datos.date} ${datos.hour}, pero esa hora ya no estaba disponible. Contáctala para reagendar: ${datos.email || "-"} / ${datos.phone || "-"}.</p>`,
          }),
        }).catch(() => {});
      }
      return { ...base, estado: "sin-hora" };
    }
  }

  await crearEventoCalendario(datos, true);
  await enviarCorreos(datos, true);
  return { ...base, estado: "confirmada" };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  // ── Pago del abono: webhook de Mercado Pago y verificación al volver al sitio ──
  if (req.query.action === "pago") {
    if (!MP_TOKEN) return res.status(200).json({ estado: "desconocido" });
    const tipo = (req.body?.type ?? req.query.type ?? req.query.topic) as string | undefined;
    if (tipo && tipo !== "payment") return res.status(200).json({ ok: true });
    const id = String(req.query.payment_id ?? req.query["data.id"] ?? req.body?.data?.id ?? req.query.id ?? "");
    if (!/^\d+$/.test(id)) return res.status(200).json({ estado: "desconocido" });
    try {
      return res.status(200).json(await confirmarPago(id));
    } catch (e) {
      console.error("confirmarPago:", e);
      return res.status(500).json({ estado: "error" });
    }
  }

  // ── GET: services list ──────────────────────────────────────────────────
  if (req.method === "GET" && req.query.action === "services") {
    const data = await sbGet(`servicios?user_id=eq.${USER_ID}&active=eq.true&order=price.asc`);
    return res.json({ services: Array.isArray(data) ? data : [] });
  }

  // ── GET: available slots ─────────────────────────────────────────────────
  if (req.method === "GET") {
    const date = req.query.date as string;
    if (!date) return res.status(400).json({ error: "Missing date" });

    const candidates = allSlots(date);
    if (candidates.length === 0) return res.json({ slots: [] });

    if (MP_TOKEN) await liberarRetenciones();

    const prevDate = new Date(new Date(`${date}T00:00:00Z`).getTime() - 12 * 3600_000).toISOString().slice(0, 10);
    const nextDate = new Date(new Date(`${date}T00:00:00Z`).getTime() + 36 * 3600_000).toISOString().slice(0, 10);

    const [reservas, bloqueos] = await Promise.all([
      sbGet(`reservas?user_id=eq.${USER_ID}&date=gte.${prevDate}T00:00:00Z&date=lt.${nextDate}T00:00:00Z&status=neq.cancelada&select=date`),
      sbGet(`bloqueos?user_id=eq.${USER_ID}&start=lte.${date}T23:59:59&end=gte.${date}T00:00:00&select=start,end`),
    ]);

    const occupied: { start: Date; end: Date }[] = [];
    if (Array.isArray(reservas)) {
      for (const r of reservas) {
        const s = new Date(r.date);
        occupied.push({ start: s, end: new Date(s.getTime() + SLOT_DURATION * 60_000) });
      }
    }
    if (Array.isArray(bloqueos)) {
      for (const b of bloqueos) occupied.push({ start: new Date(b.start), end: new Date(b.end) });
    }

    const now = Date.now();
    const available = candidates.filter((slot) => {
      const slotStart = aUTC(date, slot);
      const slotEnd = new Date(slotStart.getTime() + SLOT_DURATION * 60_000);
      if (slotStart.getTime() - now < 24 * 60 * 60 * 1000) return false;
      return !occupied.some((o) => slotStart < o.end && slotEnd > o.start);
    });

    return res.json({ slots: available });
  }

  // ── POST: create booking ─────────────────────────────────────────────────
  if (req.method === "POST") {
    const { name, email, phone, rut, date, hour, topic } = req.body;

    if (!name || !date || !hour) return res.status(400).json({ error: "Datos incompletos" });
    if (!allSlots(date).includes(hour)) return res.status(400).json({ error: "Horario no válido" });

    const inicio = aUTC(date, hour);
    if (inicio.getTime() - Date.now() < 24 * 60 * 60 * 1000) {
      return res.status(400).json({ error: "Las reservas deben realizarse con al menos 24 horas de anticipación." });
    }

    const isoDate = inicio.toISOString();
    if (MP_TOKEN) await liberarRetenciones();
    if (await horaOcupada(isoDate)) {
      return res.status(409).json({ error: "ocupada", message: "Esa hora acaba de ser tomada. Elige otra, por favor." });
    }

    const reservaId = crypto.randomUUID();
    const clientKey = (rut || name).toLowerCase().replace(/[^a-z0-9]/g, "-");
    const serviceName = `Evaluación online${topic ? " — " + topic : ""}`;
    const conAbono = !!MP_TOKEN;

    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/reservas`, {
      method: "POST",
      headers: { ...sbHeaders(), Prefer: "return=minimal" },
      body: JSON.stringify({
        id: reservaId, user_id: USER_ID, client_id: clientKey, client_name: name,
        date: isoDate, service_id: "evaluacion", service_name: conAbono ? serviceName + MARCA_ESPERA : serviceName,
        status: "pendiente", amount: 0, tipo_atencion: "online", es_control: false,
      }),
    });

    if (!insertRes.ok) {
      const err = await insertRes.text();
      return res.status(500).json({ error: err });
    }

    await fetch(`${SUPABASE_URL}/rest/v1/fichas_clientes`, {
      method: "POST",
      headers: { ...sbHeaders(), Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ user_id: USER_ID, client_key: clientKey, client_name: name, email: email || null, phone: phone || null, rut: rut || null }),
    }).catch(() => {});

    const datos: DatosReserva = { reservaId, name, email, phone, rut, date, hour, serviceName };

    // Con Mercado Pago: la hora queda retenida y solo se confirma cuando el abono se aprueba
    if (conAbono) {
      const vence = new Date(Date.now() + MINUTOS_PARA_PAGAR * 60_000).toISOString().replace("Z", "+00:00");
      const prefRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: { Authorization: `Bearer ${MP_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{
            id: "abono-evaluacion", title: `Abono reserva · ${serviceName}`,
            description: "Se descuenta del valor total del tratamiento si se realiza el mismo día",
            quantity: 1, unit_price: ABONO, currency_id: "CLP",
          }],
          payer: { name, email: email || undefined },
          external_reference: reservaId,
          metadata: { reserva_id: reservaId, name, email, phone, rut, date, hour, service_name: serviceName },
          back_urls: {
            success: `${SITE_URL}/?pago=ok`,
            pending: `${SITE_URL}/?pago=pendiente`,
            failure: `${SITE_URL}/?pago=error`,
          },
          auto_return: "approved",
          notification_url: `${SITE_URL}/api/booking/slots-paola?action=pago`,
          statement_descriptor: "DRA PAOLA CARDENAS",
          expires: true,
          expiration_date_to: vence,
        }),
      });
      const pref = await prefRes.json().catch(() => ({}));
      if (!prefRes.ok || !pref.init_point) {
        console.error("Mercado Pago preference failed:", pref);
        await sbPatch(`reservas?id=eq.${reservaId}`, { status: "cancelada" });
        return res.status(502).json({ error: "pago", message: "No pudimos iniciar el pago. Inténtalo de nuevo o escríbenos por WhatsApp." });
      }
      return res.json({ ok: true, reservaId, pagoUrl: pref.init_point });
    }

    // Sin Mercado Pago configurado: flujo anterior (confirmación por email)
    await crearEventoCalendario(datos, false);
    const emailStatus = email ? await enviarCorreos(datos, false) : { error: "no client email provided" };
    return res.json({ ok: true, reservaId, emailStatus });
  }

  return res.status(405).end();
}
