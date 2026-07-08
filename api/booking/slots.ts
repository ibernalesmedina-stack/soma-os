import type { VercelRequest, VercelResponse } from "@vercel/node";

const SUPABASE_URL = "https://fwxutchyumopwvertisd.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN!;
const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const SITE_URL = "https://www.elliotnutrition.com";
const PAULETTE_EMAIL = "pelliotbanados@gmail.com";

// Paulette's working hours (minutes from midnight)
const SCHEDULE: Record<number, { start: number; end: number; break?: number }> = {
  1: { start: 540, end: 1200, break: 14 }, // Mon 09:00–20:00, skip 14:xx
  2: { start: 540, end: 1200, break: 14 },
  3: { start: 540, end: 1200, break: 14 },
  4: { start: 540, end: 1200, break: 14 },
  5: { start: 540, end: 1200, break: 14 },
  6: { start: 540, end: 720 },             // Sat 09:00–12:00
  // 0 = Sunday: closed
};

function allSlots(date: string, durMin: number): string[] {
  const dow = new Date(date + "T12:00:00").getDay();
  const sched = SCHEDULE[dow];
  if (!sched) return [];
  const result: string[] = [];
  for (let m = sched.start; m + durMin <= sched.end; m += durMin) {
    if (sched.break !== undefined && Math.floor(m / 60) === sched.break) continue;
    result.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
  }
  return result;
}

async function sbGet(path: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  });
  return res.json();
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const USER_ID = "e84c4f11-50c2-4b6e-8c4b-055bb635edcd";

  // ── GET: services list ──────────────────────────────────────────────────
  if (req.method === "GET" && req.query.action === "services") {
    const data = await sbGet(
      `servicios?user_id=eq.${USER_ID}&active=eq.true&order=price.asc`
    );
    return res.json({ services: Array.isArray(data) ? data : [] });
  }

  // ── GET: available slots ─────────────────────────────────────────────────
  if (req.method === "GET") {
    const date = req.query.date as string;
    const dur = parseInt(req.query.duration as string) || 60;
    if (!date) return res.status(400).json({ error: "Missing date" });

    const candidates = allSlots(date, dur);
    if (candidates.length === 0) return res.json({ slots: [] });

    // Compute Santiago UTC offset for this date (handles DST)
    const noonUTC = new Date(`${date}T12:00:00Z`);
    const santiagoNoonHour = parseInt(
      new Intl.DateTimeFormat("en", { timeZone: "America/Santiago", hour: "numeric", hour12: false }).format(noonUTC),
    );
    const offsetMin = (santiagoNoonHour - 12) * 60; // e.g. -240 = UTC-4

    // Helper: convert Santiago local HH:MM on `date` → UTC Date
    const toUTC = (hhmm: string) => {
      const [h, m] = hhmm.split(":").map(Number);
      const ms = new Date(`${date}T00:00:00Z`).getTime() + (h * 60 + m - offsetMin) * 60_000;
      return new Date(ms);
    };

    // Query reservas for a wider window to catch UTC offsets crossing midnight
    const prevDate = new Date(new Date(`${date}T00:00:00Z`).getTime() - 12 * 3600_000).toISOString().slice(0, 10);
    const nextDate = new Date(new Date(`${date}T00:00:00Z`).getTime() + 36 * 3600_000).toISOString().slice(0, 10);

    const [reservas, bloqueos] = await Promise.all([
      sbGet(`reservas?user_id=eq.${USER_ID}&date=gte.${prevDate}T00:00:00Z&date=lt.${nextDate}T00:00:00Z&status=neq.cancelada&select=date,es_control`),
      sbGet(`bloqueos?user_id=eq.${USER_ID}&start=lte.${date}T23:59:59&end=gte.${date}T00:00:00&select=start,end`),
    ]);

    // Build occupied windows (all in UTC)
    const occupied: { start: Date; end: Date }[] = [];
    if (Array.isArray(reservas)) {
      for (const r of reservas) {
        const s = new Date(r.date);
        const durR = r.es_control ? 30 : 60;
        occupied.push({ start: s, end: new Date(s.getTime() + durR * 60_000) });
      }
    }
    if (Array.isArray(bloqueos)) {
      for (const b of bloqueos) {
        occupied.push({ start: new Date(b.start), end: new Date(b.end) });
      }
    }

    const now = Date.now();
    const available = candidates.filter(slot => {
      const slotStart = toUTC(slot);
      const slotEnd = new Date(slotStart.getTime() + dur * 60_000);
      // Require at least 24h in advance per slot
      if (slotStart.getTime() - now < 24 * 60 * 60 * 1000) return false;
      return !occupied.some(o => slotStart < o.end && slotEnd > o.start);
    });

    return res.json({ slots: available });
  }

  // ── POST: create MP preference ──────────────────────────────────────────
  if (req.method === "POST" && req.body?.action === "preference") {
    const { name, rut, email, phone, date, hour, esControl, serviceName, amount, modo } = req.body;
    if (!name || !date || !hour || !amount) return res.status(400).json({ error: "Datos incompletos" });

    const ref = JSON.stringify({ name, rut, email, phone, date, hour, esControl, serviceName, amount, modo });

    const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [{ title: serviceName, quantity: 1, unit_price: Number(amount), currency_id: "CLP" }],
        external_reference: ref,
        back_urls: {
          success: `${SITE_URL}/pago-exitoso`,
          failure: `${SITE_URL}/#agenda`,
          pending: `${SITE_URL}/pago-exitoso`,
        },
        auto_return: "approved",
      }),
    });

    if (!mpRes.ok) {
      const err = await mpRes.json();
      console.error("MP error:", err);
      return res.status(500).json({ error: "Error al crear preferencia de pago" });
    }

    const mpData = await mpRes.json();
    return res.json({ init_point: mpData.init_point, sandbox_init_point: mpData.sandbox_init_point });
  }

  // ── POST: create booking ─────────────────────────────────────────────────
  if (req.method === "POST") {
    const { name, email, phone, rut, date, hour, esControl, planId, serviceName, amount, modo } = req.body;

    // Validate at least 24h in advance
    if (date && hour) {
      const noonUTC2 = new Date(`${date}T12:00:00Z`);
      const snHour = parseInt(new Intl.DateTimeFormat("en", { timeZone: "America/Santiago", hour: "numeric", hour12: false }).format(noonUTC2));
      const off = (snHour - 12) * 60;
      const [bh, bm] = (hour as string).split(":").map(Number);
      const bookingUTC = new Date(`${date}T00:00:00Z`).getTime() + (bh * 60 + bm - off) * 60_000;
      if (bookingUTC - Date.now() < 24 * 60 * 60 * 1000) {
        return res.status(400).json({ error: "Las reservas deben realizarse con al menos 24 horas de anticipación." });
      }
    }
    if (!name || !date || !hour) return res.status(400).json({ error: "Missing required fields" });

    // Convert Santiago local time to UTC before storing
    // (Supabase timestamptz treats bare datetime strings as UTC)
    const noonUTC = new Date(`${date}T12:00:00Z`);
    const santiagoNoonHour = parseInt(
      new Intl.DateTimeFormat("en", { timeZone: "America/Santiago", hour: "numeric", hour12: false }).format(noonUTC)
    );
    const offsetMin = (santiagoNoonHour - 12) * 60; // e.g. -240 in winter (UTC-4)
    const localDt = new Date(`${date}T${hour}:00Z`);
    localDt.setMinutes(localDt.getMinutes() - offsetMin);
    const isoDate = localDt.toISOString(); // correct UTC
    const reservaId = crypto.randomUUID();
    const clientKey = (rut || name).toLowerCase().replace(/[^a-z0-9]/g, "-");

    // Insert reserva
    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/reservas`, {
      method: "POST",
      headers: {
        apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json", Prefer: "return=minimal",
      },
      body: JSON.stringify({
        id: reservaId,
        user_id: USER_ID,
        client_id: clientKey,
        client_name: name,
        date: isoDate,
        service_id: planId || (esControl ? "ctrl" : "consulta"),
        service_name: serviceName || (esControl ? "Control Nutricional" : "Consulta"),
        status: "pendiente",
        amount: amount || 0,
        tipo_atencion: modo || "presencial",
        es_control: !!esControl,
      }),
    });

    if (!insertRes.ok) {
      const err = await insertRes.text();
      return res.status(500).json({ error: err });
    }

    // Upsert patient record in fichas_clientes so data shows in the dashboard
    await fetch(`${SUPABASE_URL}/rest/v1/fichas_clientes`, {
      method: "POST",
      headers: {
        apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify({
        user_id: USER_ID,
        client_key: clientKey,
        client_name: name,
        email: email || null,
        phone: phone || null,
        rut: rut || null,
      }),
    }).catch(() => {});

    // Create pago with status "pendiente" (paid at consultation)
    await fetch(`${SUPABASE_URL}/rest/v1/pagos`, {
      method: "POST",
      headers: {
        apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json", Prefer: "return=minimal",
      },
      body: JSON.stringify({
        user_id: USER_ID,
        client_id: clientKey,
        client_name: name,
        date: isoDate,
        amount: amount || 0,
        method: null,
        status: "pendiente",
        reserva_id: reservaId,
      }),
    }).catch(() => {});

    // Create Google Calendar event (non-blocking on failure)
    try {
      const [integration] = await sbGet(
        `client_integrations?user_id=eq.${USER_ID}&select=google_access_token,google_refresh_token,google_token_expiry`,
      );
      if (integration?.google_access_token) {
        const accessToken = await getAccessToken({
          access_token: integration.google_access_token,
          refresh_token: integration.google_refresh_token,
          expiry_date: integration.google_token_expiry ? new Date(integration.google_token_expiry).getTime() : undefined,
        });
        const durMin = esControl ? 30 : 60;
        const [h, m] = hour.split(":").map(Number);
        const endH = String(Math.floor((h * 60 + m + durMin) / 60)).padStart(2, "0");
        const endM = String((h * 60 + m + durMin) % 60).padStart(2, "0");
        // Send local datetime without Z so Google Calendar uses timeZone: America/Santiago
        await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            summary: `${esControl ? "Control" : "Consulta"} · ${name}`,
            description: `Paciente: ${name}\nRUT: ${rut || "-"}\nEmail: ${email || "-"}\nTeléfono: ${phone || "-"}\nModalidad: ${modo}\nPlan: ${serviceName}`,
            start: { dateTime: `${date}T${hour}:00`, timeZone: "America/Santiago" },
            end:   { dateTime: `${date}T${endH}:${endM}:00`, timeZone: "America/Santiago" },
          }),
        });
      }
    } catch (e) {
      console.error("Calendar event failed (reservation saved):", e);
    }

    // Send confirmation emails
    const emailStatus: { client?: string; admin?: string; error?: string } = {};

    if (!RESEND_API_KEY) {
      emailStatus.error = "RESEND_API_KEY not set";
      console.error("Email skipped: RESEND_API_KEY env var is not configured");
    } else if (!email) {
      emailStatus.error = "no client email provided";
    } else {
      const clp = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(Number(amount));
      const confirmUrl = `https://www.elliotnutrition.com/api/booking/confirm?id=${reservaId}`;
      const fechaFormateada = new Date(`${date}T${hour}:00`).toLocaleString("es-CL", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
      const esPresencial = (modo || "presencial") !== "online";
      const direccion = esPresencial
        ? `<div style="margin-top:12px;padding:12px 16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;font-size:13px;color:#166534;">
            📍 <strong>Dirección:</strong> Reñaca Norte #25, piso 2, oficina 202, Viña del Mar<br>
            <a href="https://maps.app.goo.gl/YhBUtEkynEhdAKid9?g_st=ipc" style="color:#166534;font-size:12px;">Ver en Google Maps →</a>
           </div>`
        : `<div style="margin-top:12px;padding:12px 16px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;font-size:13px;color:#1e40af;">
            🖥️ <strong>Modalidad online</strong> — Recibirás el enlace de videollamada antes de la sesión.
           </div>`;
      const clientHtml = `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{margin:0;padding:0;background:#f4f4f2;font-family:'Helvetica Neue',Arial,sans-serif;}
  .wrap{max-width:560px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);}
  .header{background:#1a3a2a;padding:28px 32px 24px;}
  .header h1{margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:-.3px;}
  .header p{margin:5px 0 0;color:rgba(255,255,255,.65);font-size:13px;}
  .body{padding:28px 32px;}
  .card{background:#f9f9f7;border:1px solid #e5e5e0;border-radius:10px;overflow:hidden;margin:18px 0;}
  .row{display:flex;justify-content:space-between;align-items:center;padding:11px 16px;border-bottom:1px solid #e5e5e0;font-size:14px;}
  .row:last-child{border-bottom:none;}
  .label{color:#6b7280;}
  .value{font-weight:600;color:#111827;text-align:right;}
  .btn{display:inline-block;background:#1a3a2a;color:#fff;padding:15px 36px;border-radius:100px;font-weight:700;font-size:15px;text-decoration:none;letter-spacing:-.2px;}
  .footer{padding:18px 32px;border-top:1px solid #ececec;font-size:12px;color:#9ca3af;text-align:center;}
</style>
</head>
<body><div class="wrap">
  <div class="header">
    <h1>Solicitud de reserva recibida</h1>
    <p>Elliot Nutrition · Paulette Elliot, Nutricionista</p>
  </div>
  <div class="body">
    <p style="font-size:15px;color:#374151;margin-top:0;line-height:1.6;">
      Hola <strong>${name}</strong> 👋<br>
      Recibimos tu solicitud. <strong>Confirma tu hora haciendo click en el botón de abajo</strong> — hasta que confirmes, el horario no quedará reservado.
    </p>
    <div class="card">
      <div class="row"><span class="label">Plan</span><span class="value">${serviceName}</span></div>
      <div class="row"><span class="label">Fecha y hora</span><span class="value" style="text-transform:capitalize;">${fechaFormateada}</span></div>
      <div class="row"><span class="label">Modalidad</span><span class="value">${esPresencial ? "📍 Presencial" : "🖥️ Online"}</span></div>
      <div class="row"><span class="label">Pago</span><span class="value">${clp} — en consulta</span></div>
    </div>
    ${direccion}
    <div style="text-align:center;margin:28px 0 20px;">
      <a href="${confirmUrl}" class="btn">Confirmar mi reserva ✓</a>
    </div>
    <p style="font-size:12px;color:#9ca3af;text-align:center;margin:0;">
      Si no realizaste esta solicitud, ignora este email.<br>La hora quedará liberada automáticamente.
    </p>
    <p style="font-size:13px;color:#6b7280;margin-top:20px;border-top:1px solid #f0f0ee;padding-top:16px;">
      ¿Necesitas cambiar la hora? Escríbeme por <a href="https://wa.me/56942156610" style="color:#1a3a2a;font-weight:600;">WhatsApp</a>.
    </p>
  </div>
  <div class="footer">Elliot Nutrition · noreply@elliotnutrition.com · <a href="https://www.elliotnutrition.com" style="color:#9ca3af;">elliotnutrition.com</a></div>
</div></body></html>`;
      const FROM = "Elliot Nutrition <noreply@elliotnutrition.com>";

      try {
        const r1 = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ from: FROM, to: [email], subject: `Confirma tu reserva — ${serviceName} el ${date}`, html: clientHtml }),
        });
        if (r1.ok) {
          emailStatus.client = "sent";
        } else {
          const err = await r1.text();
          emailStatus.client = `failed: ${err}`;
          console.error("Resend client email failed:", err);
        }
      } catch (e) {
        emailStatus.client = `error: ${String(e)}`;
        console.error("Resend client email error:", e);
      }

      try {
        const r2 = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ from: FROM, to: [PAULETTE_EMAIL], subject: `Nueva reserva: ${name} — ${serviceName} el ${date}`, html: `<p><b>Paciente:</b> ${name} | <b>Plan:</b> ${serviceName} | <b>Fecha:</b> ${date} ${hour} | <b>Monto:</b> ${clp} CLP | <b>Email:</b> ${email} | <b>Tel:</b> ${phone || "-"}</p>` }),
        });
        if (r2.ok) {
          emailStatus.admin = "sent";
        } else {
          const err = await r2.text();
          emailStatus.admin = `failed: ${err}`;
          console.error("Resend admin email failed:", err);
        }
      } catch (e) {
        emailStatus.admin = `error: ${String(e)}`;
        console.error("Resend admin email error:", e);
      }
    }

    return res.json({ ok: true, reservaId, emailStatus });
  }

  return res.status(405).end();
}
