import type { VercelRequest, VercelResponse } from "@vercel/node";

const SUPABASE_URL = "https://fwxutchyumopwvertisd.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const SITE_URL = "https://drapaolacardenasfica.com";
const DRA_EMAIL = "i.bernalesmedina+paolacardenas@gmail.com";
const USER_ID = "758b6456-4b1d-48cd-8325-8ee3f20869f0";

// Dra. Paola's booking hours: martes y jueves, bloques de 40 min entre 10:00 y 16:00
const SCHEDULE: Record<number, { start: number; end: number }> = {
  2: { start: 600, end: 960 }, // Tue 10:00–16:00
  4: { start: 600, end: 960 }, // Thu 10:00–16:00
};
const SLOT_DURATION = 40;

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

    const noonUTC = new Date(`${date}T12:00:00Z`);
    const santiagoNoonHour = parseInt(
      new Intl.DateTimeFormat("en", { timeZone: "America/Santiago", hour: "numeric", hour12: false }).format(noonUTC),
    );
    const offsetMin = (santiagoNoonHour - 12) * 60;

    const toUTC = (hhmm: string) => {
      const [h, m] = hhmm.split(":").map(Number);
      const ms = new Date(`${date}T00:00:00Z`).getTime() + (h * 60 + m - offsetMin) * 60_000;
      return new Date(ms);
    };

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
      const slotStart = toUTC(slot);
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

    const noonUTC2 = new Date(`${date}T12:00:00Z`);
    const snHour = parseInt(new Intl.DateTimeFormat("en", { timeZone: "America/Santiago", hour: "numeric", hour12: false }).format(noonUTC2));
    const off = (snHour - 12) * 60;
    const [bh, bm] = (hour as string).split(":").map(Number);
    const bookingUTC = new Date(`${date}T00:00:00Z`).getTime() + (bh * 60 + bm - off) * 60_000;
    if (bookingUTC - Date.now() < 24 * 60 * 60 * 1000) {
      return res.status(400).json({ error: "Las reservas deben realizarse con al menos 24 horas de anticipación." });
    }

    const localDt = new Date(`${date}T${hour}:00Z`);
    localDt.setMinutes(localDt.getMinutes() - off);
    const isoDate = localDt.toISOString();
    const reservaId = crypto.randomUUID();
    const clientKey = (rut || name).toLowerCase().replace(/[^a-z0-9]/g, "-");
    const serviceName = `Evaluación online${topic ? " — " + topic : ""}`;

    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/reservas`, {
      method: "POST",
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        id: reservaId, user_id: USER_ID, client_id: clientKey, client_name: name,
        date: isoDate, service_id: "evaluacion", service_name: serviceName,
        status: "pendiente", amount: 0, tipo_atencion: "online", es_control: false,
      }),
    });

    if (!insertRes.ok) {
      const err = await insertRes.text();
      return res.status(500).json({ error: err });
    }

    await fetch(`${SUPABASE_URL}/rest/v1/fichas_clientes`, {
      method: "POST",
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ user_id: USER_ID, client_key: clientKey, client_name: name, email: email || null, phone: phone || null, rut: rut || null }),
    }).catch(() => {});

    try {
      const [integration] = await sbGet(`client_integrations?user_id=eq.${USER_ID}&select=google_access_token,google_refresh_token,google_token_expiry`);
      if (integration?.google_access_token) {
        const accessToken = await getAccessToken({
          access_token: integration.google_access_token,
          refresh_token: integration.google_refresh_token,
          expiry_date: integration.google_token_expiry ? new Date(integration.google_token_expiry).getTime() : undefined,
        });
        const [h, m] = hour.split(":").map(Number);
        const endH = String(Math.floor((h * 60 + m + SLOT_DURATION) / 60)).padStart(2, "0");
        const endM = String((h * 60 + m + SLOT_DURATION) % 60).padStart(2, "0");
        await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            summary: `${serviceName} · ${name}`,
            description: `Paciente: ${name}\nRUT: ${rut || "-"}\nEmail: ${email || "-"}\nTeléfono: ${phone || "-"}`,
            start: { dateTime: `${date}T${hour}:00`, timeZone: "America/Santiago" },
            end: { dateTime: `${date}T${endH}:${endM}:00`, timeZone: "America/Santiago" },
          }),
        });
      }
    } catch (e) {
      console.error("Calendar event failed (reservation saved):", e);
    }

    const emailStatus: { client?: string; admin?: string; error?: string } = {};

    if (!RESEND_API_KEY) {
      emailStatus.error = "RESEND_API_KEY not set";
    } else if (!email) {
      emailStatus.error = "no client email provided";
    } else {
      const confirmUrl = `${SITE_URL}/api/booking/confirm-paola?id=${reservaId}`;
      const cancelUrl = `${SITE_URL}/api/booking/cancel-paola?id=${reservaId}`;
      const fechaFormateada = new Date(`${date}T${hour}:00`).toLocaleString("es-CL", {
        weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
      });
      const clientHtml = `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
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
  .footer{padding:18px 32px;border-top:1px solid #ececec;font-size:12px;color:#8C8378;text-align:center;}
</style>
</head>
<body><div class="wrap">
  <div class="header">
    <h1>Solicitud de reserva recibida</h1>
    <p>Dra. Paola Cárdenas Fica · Implantología Bucomaxilofacial</p>
  </div>
  <div class="body">
    <p style="font-size:15px;color:#5A5148;margin-top:0;line-height:1.6;">
      Hola <strong>${name}</strong> 👋<br>
      Recibimos tu solicitud. <strong>Confirma tu hora haciendo click en el botón de abajo</strong> — hasta que confirmes, el horario no quedará reservado.
    </p>
    <div class="card">
      <div class="row"><span class="label">Motivo</span><span class="value">${serviceName}</span></div>
      <div class="row"><span class="label">Fecha y hora</span><span class="value" style="text-transform:capitalize;">${fechaFormateada}</span></div>
      <div class="row"><span class="label">Modalidad</span><span class="value">🖥️ Online</span></div>
    </div>
    <div style="text-align:center;margin:28px 0 20px;">
      <a href="${confirmUrl}" class="btn">Confirmar mi reserva ✓</a>
    </div>
    <p style="font-size:12px;color:#8C8378;text-align:center;margin:0;">
      Si no realizaste esta solicitud, ignora este email.<br>La hora quedará liberada automáticamente.
    </p>
    <p style="text-align:center;margin:14px 0 0;">
      <a href="${cancelUrl}" style="color:#b91c1c;font-size:13px;text-decoration:underline;">Cancelar esta hora</a>
    </p>
    <p style="font-size:13px;color:#5A5148;margin-top:20px;border-top:1px solid #f0f0ee;padding-top:16px;">
      ¿Necesitas cambiar la hora? Escríbeme por <a href="https://wa.me/56971252179" style="color:#2E3135;font-weight:600;">WhatsApp</a>.
    </p>
  </div>
  <div class="footer">Dra. Paola Cárdenas Fica · Viña del Mar, Chile</div>
</div></body></html>`;
      const FROM = "Dra. Paola Cárdenas Fica <noreply@somaos.app>";

      try {
        const r1 = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ from: FROM, to: [email], subject: `Confirma tu evaluación — ${date}`, html: clientHtml }),
        });
        emailStatus.client = r1.ok ? "sent" : `failed: ${await r1.text()}`;
      } catch (e) {
        emailStatus.client = `error: ${String(e)}`;
      }

      try {
        const r2 = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ from: FROM, to: [DRA_EMAIL], subject: `Nueva reserva: ${name} — ${date} ${hour}`, html: `<p><b>Paciente:</b> ${name} | <b>Motivo:</b> ${serviceName} | <b>Fecha:</b> ${date} ${hour} | <b>Email:</b> ${email} | <b>Tel:</b> ${phone || "-"}</p>` }),
        });
        emailStatus.admin = r2.ok ? "sent" : `failed: ${await r2.text()}`;
      } catch (e) {
        emailStatus.admin = `error: ${String(e)}`;
      }
    }

    return res.json({ ok: true, reservaId, emailStatus });
  }

  return res.status(405).end();
}
