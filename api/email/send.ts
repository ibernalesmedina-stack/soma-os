import type { VercelRequest, VercelResponse } from "@vercel/node";

const SUPABASE_URL = "https://fwxutchyumopwvertisd.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GLOBAL_RESEND_KEY = process.env.RESEND_API_KEY!;
const SOMAOS_FROM = "SomaOS <noreply@somaos.app>";

// ── Email templates ────────────────────────────────────────────────

interface ReservaData {
  clientName: string;
  serviceName: string;
  date: string;       // ISO string
  tipoAtencion: string;
  amount: number;
  businessName?: string;
  phone?: string;
}

function formatDateES(iso: string) {
  return new Date(iso).toLocaleString("es-CL", {
    weekday: "long", day: "numeric", month: "long",
    year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function formatCLP(n: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);
}

function baseLayout(content: string, accentColor = "#7C3AED") {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body { margin:0; padding:0; background:#f4f4f5; font-family:'Helvetica Neue',Arial,sans-serif; }
  .wrap { max-width:560px; margin:32px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,.08); }
  .header { background:${accentColor}; padding:28px 32px; }
  .header h1 { margin:0; color:#fff; font-size:22px; font-weight:700; letter-spacing:-.3px; }
  .header p { margin:4px 0 0; color:rgba(255,255,255,.75); font-size:13px; }
  .body { padding:28px 32px; }
  .card { background:#f9f9fb; border:1px solid #ececef; border-radius:8px; padding:18px 20px; margin:18px 0; }
  .row { display:flex; justify-content:space-between; padding:7px 0; border-bottom:1px solid #ececef; font-size:14px; }
  .row:last-child { border-bottom:none; }
  .label { color:#6b7280; }
  .value { font-weight:600; color:#111827; }
  .badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:12px; font-weight:600; }
  .badge-presencial { background:#dcfce7; color:#166534; }
  .badge-online     { background:#dbeafe; color:#1d4ed8; }
  .btn { display:inline-block; margin-top:20px; padding:12px 24px; background:${accentColor}; color:#fff; border-radius:8px; font-weight:600; font-size:14px; text-decoration:none; }
  .footer { padding:18px 32px; border-top:1px solid #ececef; font-size:12px; color:#9ca3af; text-align:center; }
</style>
</head>
<body><div class="wrap">${content}</div></body>
</html>`;
}

function templateConfirmacion(r: ReservaData): { subject: string; html: string } {
  const badgeClass = r.tipoAtencion === "online" ? "badge-online" : "badge-presencial";
  const subject = `✅ Tu cita está confirmada — ${r.serviceName}`;
  const html = baseLayout(`
  <div class="header">
    <h1>¡Tu cita está confirmada!</h1>
    <p>${r.businessName ?? "Tu profesional"} te espera</p>
  </div>
  <div class="body">
    <p style="font-size:15px;color:#374151;margin-top:0">Hola <strong>${r.clientName}</strong>, tu reserva ha sido confirmada con todos los detalles a continuación.</p>
    <div class="card">
      <div class="row"><span class="label">Servicio</span><span class="value">${r.serviceName}</span></div>
      <div class="row"><span class="label">Fecha y hora</span><span class="value">${formatDateES(r.date)}</span></div>
      <div class="row"><span class="label">Modalidad</span><span class="value"><span class="badge ${badgeClass}">${r.tipoAtencion === "online" ? "🖥 Online" : "📍 Presencial"}</span></span></div>
      <div class="row"><span class="label">Monto</span><span class="value">${formatCLP(r.amount)}</span></div>
    </div>
    ${r.phone ? `<p style="font-size:13px;color:#6b7280;margin:0">¿Necesitas reagendar? Contáctanos al <strong>${r.phone}</strong></p>` : ""}
  </div>
  <div class="footer">Este email fue enviado por SomaOS • No responder a este correo</div>
  `);
  return { subject, html };
}

function templateRecordatorio(r: ReservaData): { subject: string; html: string } {
  const subject = `⏰ Recordatorio: tu cita es mañana — ${r.serviceName}`;
  const badgeClass = r.tipoAtencion === "online" ? "badge-online" : "badge-presencial";
  const html = baseLayout(`
  <div class="header" style="background:#0ea5e9;">
    <h1>Recordatorio de cita</h1>
    <p>Tu sesión es mañana — ¡no lo olvides!</p>
  </div>
  <div class="body">
    <p style="font-size:15px;color:#374151;margin-top:0">Hola <strong>${r.clientName}</strong>, este es un recordatorio de tu cita programada para mañana.</p>
    <div class="card">
      <div class="row"><span class="label">Servicio</span><span class="value">${r.serviceName}</span></div>
      <div class="row"><span class="label">Fecha y hora</span><span class="value">${formatDateES(r.date)}</span></div>
      <div class="row"><span class="label">Modalidad</span><span class="value"><span class="badge ${badgeClass}">${r.tipoAtencion === "online" ? "🖥 Online" : "📍 Presencial"}</span></span></div>
    </div>
    ${r.phone ? `<p style="font-size:13px;color:#6b7280">¿Necesitas cancelar o reagendar? Contáctanos al <strong>${r.phone}</strong></p>` : ""}
  </div>
  <div class="footer">Este email fue enviado por SomaOS • No responder a este correo</div>
  `, "#0ea5e9");
  return { subject, html };
}

function templatePrueba(businessName: string, email: string): { subject: string; html: string } {
  const subject = "✅ Conexión de email verificada — SomaOS";
  const html = baseLayout(`
  <div class="header">
    <h1>¡Email configurado correctamente!</h1>
    <p>${businessName}</p>
  </div>
  <div class="body">
    <p style="font-size:15px;color:#374151;margin-top:0">Tu configuración de email en SomaOS está funcionando. Tus clientes recibirán notificaciones en <strong>${email}</strong>.</p>
    <div class="card">
      <div class="row"><span class="label">Estado</span><span class="value" style="color:#16a34a">✓ Conectado</span></div>
      <div class="row"><span class="label">Dirección</span><span class="value">${email}</span></div>
    </div>
  </div>
  <div class="footer">SomaOS — Plataforma de gestión para profesionales de salud</div>
  `);
  return { subject, html };
}

// ── Handler ────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const {
    userId, to, subject, html, text,
    template, reserva, businessName,
  } = req.body as {
    userId: string;
    to: string;
    subject?: string;
    html?: string;
    text?: string;
    // Template-based sending
    template?: "confirmacion" | "recordatorio" | "prueba";
    reserva?: ReservaData;
    businessName?: string;
  };

  if (!userId || !to) return res.status(400).json({ error: "Missing userId or to" });

  // 1. Load client's integration settings
  const intRes = await fetch(
    `${SUPABASE_URL}/rest/v1/client_integrations?user_id=eq.${userId}&select=resend_api_key,resend_email,resend_status`,
    { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } },
  );
  const integrations = await intRes.json();
  const integration = integrations[0];

  const clientEmail = integration?.resend_email || "";
  const clientApiKey = integration?.resend_api_key || "";
  const apiKey = clientApiKey || GLOBAL_RESEND_KEY;
  if (!apiKey) return res.status(500).json({ error: "No Resend API key configured. Add RESEND_API_KEY to Vercel env vars." });

  const from = clientApiKey && clientEmail ? `Notificaciones <${clientEmail}>` : SOMAOS_FROM;
  const replyTo = clientEmail || undefined;

  // 2. Resolve subject + html from template or raw params
  let finalSubject = subject || "";
  let finalHtml = html || "";

  if (template === "confirmacion" && reserva) {
    const t = templateConfirmacion({ ...reserva, businessName });
    finalSubject = t.subject;
    finalHtml = t.html;
  } else if (template === "recordatorio" && reserva) {
    const t = templateRecordatorio({ ...reserva, businessName });
    finalSubject = t.subject;
    finalHtml = t.html;
  } else if (template === "prueba") {
    const t = templatePrueba(businessName || "Tu negocio", clientEmail || to);
    finalSubject = t.subject;
    finalHtml = t.html;
  } else if (!finalSubject) {
    return res.status(400).json({ error: "Missing subject or template" });
  }

  if (!finalHtml) finalHtml = `<p>${text || finalSubject}</p>`;

  // 3. Send via Resend
  const emailRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      subject: finalSubject,
      html: finalHtml,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });

  const result = await emailRes.json();
  if (!emailRes.ok) {
    console.error("Resend error:", result);
    return res.status(500).json({ error: result.message || "Failed to send email" });
  }

  return res.status(200).json({ ok: true, id: result.id });
}
