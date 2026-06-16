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

    // Fetch existing reservas that day
    const reservas = await sbGet(
      `reservas?user_id=eq.${USER_ID}&date=gte.${date}T00:00:00&date=lt.${date}T23:59:59&status=neq.cancelada&select=date,esControl`,
    );

    // Fetch bloqueos overlapping that day
    const bloqueos = await sbGet(
      `bloqueos?user_id=eq.${USER_ID}&start=lte.${date}T23:59:59&end=gte.${date}T00:00:00&select=start,end`,
    );

    // Build occupied windows
    const occupied: { start: Date; end: Date }[] = [];
    if (Array.isArray(reservas)) {
      for (const r of reservas) {
        const s = new Date(r.date);
        const durR = r.esControl ? 30 : 60;
        occupied.push({ start: s, end: new Date(s.getTime() + durR * 60_000) });
      }
    }
    if (Array.isArray(bloqueos)) {
      for (const b of bloqueos) {
        occupied.push({ start: new Date(b.start), end: new Date(b.end) });
      }
    }

    const available = candidates.filter(slot => {
      const slotStart = new Date(`${date}T${slot}:00`);
      const slotEnd = new Date(slotStart.getTime() + dur * 60_000);
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
    if (!name || !date || !hour) return res.status(400).json({ error: "Missing required fields" });

    const isoDate = `${date}T${hour}:00`;
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
        clientName: name,
        date: isoDate,
        serviceId: planId || (esControl ? "ctrl" : "consulta"),
        serviceName: serviceName || (esControl ? "Control Nutricional" : "Consulta"),
        status: "confirmada",
        amount: amount || 0,
        tipoAtencion: modo || "presencial",
        esControl: !!esControl,
      }),
    });

    if (!insertRes.ok) {
      const err = await insertRes.text();
      return res.status(500).json({ error: err });
    }

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
        const startDt = new Date(isoDate);
        const endDt = new Date(startDt.getTime() + durMin * 60_000);
        await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            summary: `${esControl ? "Control" : "Consulta"} · ${name}`,
            description: `Paciente: ${name}\nRUT: ${rut || "-"}\nEmail: ${email || "-"}\nTeléfono: ${phone || "-"}\nModalidad: ${modo}\nPlan: ${serviceName}`,
            start: { dateTime: startDt.toISOString(), timeZone: "America/Santiago" },
            end:   { dateTime: endDt.toISOString(),   timeZone: "America/Santiago" },
          }),
        });
      }
    } catch (e) {
      console.error("Calendar event failed (reservation saved):", e);
    }

    // Send emails non-blocking
    if (RESEND_API_KEY && email) {
      const clp = "$" + Number(amount).toLocaleString("es-CL");
      const clientHtml = `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto">
        <div style="background:oklch(0.28 0.06 165);padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="margin:0;color:#fff;font-size:20px">¡Reserva confirmada! ✓</h1>
          <p style="margin:4px 0 0;color:rgba(255,255,255,.75);font-size:13px">Elliot Nutrition · Paulette Elliot, Nutricionista</p>
        </div>
        <div style="padding:24px 32px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <p style="color:#374151">Hola <strong>${name}</strong>, tu pago y reserva fueron confirmados.</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px">
            <tr><td style="padding:8px;border-bottom:1px solid #f3f4f6;color:#6b7280">Plan</td><td style="padding:8px;border-bottom:1px solid #f3f4f6;font-weight:600">${serviceName}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #f3f4f6;color:#6b7280">Fecha</td><td style="padding:8px;border-bottom:1px solid #f3f4f6;font-weight:600">${date} · ${hour}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #f3f4f6;color:#6b7280">Modalidad</td><td style="padding:8px;border-bottom:1px solid #f3f4f6;font-weight:600">${modo}</td></tr>
            <tr><td style="padding:8px;color:#6b7280">Total pagado</td><td style="padding:8px;font-weight:600;color:#166534">${clp} CLP</td></tr>
          </table>
          <p style="font-size:13px;color:#6b7280">¿Necesitas reagendar? Escríbeme por <a href="https://wa.me/56942156610" style="color:oklch(0.45 0.10 165)">WhatsApp</a>.</p>
        </div>
      </div>`;
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: "Elliot Nutrition <noreply@somaos.app>", to: [email], subject: `✓ Reserva confirmada — ${serviceName} el ${date}`, html: clientHtml }),
      }).catch(() => {});
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: "Elliot Nutrition <noreply@somaos.app>", to: [PAULETTE_EMAIL], subject: `Nueva reserva: ${name} — ${serviceName} el ${date}`, html: `<p><b>Paciente:</b> ${name} | <b>Plan:</b> ${serviceName} | <b>Fecha:</b> ${date} ${hour} | <b>Monto:</b> ${clp} CLP | <b>Email:</b> ${email} | <b>Tel:</b> ${phone || "-"}</p>` }),
      }).catch(() => {});
    }

    return res.json({ ok: true, reservaId });
  }

  return res.status(405).end();
}
