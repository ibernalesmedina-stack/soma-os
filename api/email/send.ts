import type { VercelRequest, VercelResponse } from "@vercel/node";

const SUPABASE_URL = "https://fwxutchyumopwvertisd.supabase.co";
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GLOBAL_RESEND_KEY = process.env.RESEND_API_KEY!;
const SOMAOS_FROM  = "SomaOS <noreply@somaos.cl>";
const APP_URL      = process.env.APP_URL || "https://www.somaos.cl";

// ── Helpers ────────────────────────────────────────────────────────

async function sb(path: string, opts?: RequestInit) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=minimal",
      ...(opts?.headers ?? {}),
    },
  });
  if (!r.ok && r.status !== 404) {
    const t = await r.text();
    console.error(`Supabase ${path}:`, r.status, t.slice(0, 200));
  }
  if (r.status === 204 || r.headers.get("content-length") === "0") return null;
  try { return await r.json(); } catch { return null; }
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

// ── Base layout ─────────────────────────────────────────────────────

function baseLayout(content: string, accentColor = "#7C3AED") {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Arial,sans-serif;}
  .wrap{max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);}
  .header{background:${accentColor};padding:28px 32px;}
  .header h1{margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:-.3px;}
  .header p{margin:4px 0 0;color:rgba(255,255,255,.75);font-size:13px;}
  .body{padding:28px 32px;}
  .card{background:#f9f9fb;border:1px solid #ececef;border-radius:8px;padding:18px 20px;margin:18px 0;}
  .row{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #ececef;font-size:14px;}
  .row:last-child{border-bottom:none;}
  .label{color:#6b7280;}
  .value{font-weight:600;color:#111827;}
  .badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;}
  .badge-p{background:#dcfce7;color:#166534;}
  .badge-o{background:#dbeafe;color:#1d4ed8;}
  .btn{display:inline-block;margin-top:20px;padding:12px 28px;background:${accentColor};color:#fff !important;border-radius:8px;font-weight:600;font-size:14px;text-decoration:none;}
  .footer{padding:18px 32px;border-top:1px solid #ececef;font-size:12px;color:#9ca3af;text-align:center;}
</style>
</head>
<body><div class="wrap">${content}</div></body>
</html>`;
}

// ── Templates ───────────────────────────────────────────────────────

interface ReservaData {
  clientName: string; serviceName: string; date: string;
  tipoAtencion: string; amount: number; businessName?: string; phone?: string;
}

function templateConfirmacion(r: ReservaData) {
  const bc = r.tipoAtencion === "online" ? "badge-o" : "badge-p";
  return {
    subject: `✅ Tu cita está confirmada — ${r.serviceName}`,
    html: baseLayout(`
  <div class="header"><h1>¡Tu cita está confirmada!</h1><p>${r.businessName ?? "Tu profesional"} te espera</p></div>
  <div class="body">
    <p style="font-size:15px;color:#374151;margin-top:0">Hola <strong>${r.clientName}</strong>, tu reserva ha sido confirmada.</p>
    <div class="card">
      <div class="row"><span class="label">Servicio</span><span class="value">${r.serviceName}</span></div>
      <div class="row"><span class="label">Fecha y hora</span><span class="value">${formatDateES(r.date)}</span></div>
      <div class="row"><span class="label">Modalidad</span><span class="value"><span class="badge ${bc}">${r.tipoAtencion === "online" ? "🖥 Online" : "📍 Presencial"}</span></span></div>
      <div class="row"><span class="label">Monto</span><span class="value">${formatCLP(r.amount)}</span></div>
    </div>
    ${r.phone ? `<p style="font-size:13px;color:#6b7280">¿Necesitas reagendar? Escríbenos al <strong>${r.phone}</strong></p>` : ""}
  </div>
  <div class="footer">Enviado por ${r.businessName ?? "SomaOS"} · Para cancelar o reagendar contáctanos directamente</div>
  `),
  };
}

function templateRecordatorio(r: ReservaData) {
  const bc = r.tipoAtencion === "online" ? "badge-o" : "badge-p";
  return {
    subject: `⏰ Recordatorio: tu cita es mañana — ${r.serviceName}`,
    html: baseLayout(`
  <div class="header" style="background:#0ea5e9;"><h1>Recordatorio de cita</h1><p>Tu sesión es mañana — ¡te esperamos!</p></div>
  <div class="body">
    <p style="font-size:15px;color:#374151;margin-top:0">Hola <strong>${r.clientName}</strong>, este es tu recordatorio para mañana.</p>
    <div class="card">
      <div class="row"><span class="label">Servicio</span><span class="value">${r.serviceName}</span></div>
      <div class="row"><span class="label">Fecha y hora</span><span class="value">${formatDateES(r.date)}</span></div>
      <div class="row"><span class="label">Modalidad</span><span class="value"><span class="badge ${bc}">${r.tipoAtencion === "online" ? "🖥 Online" : "📍 Presencial"}</span></span></div>
    </div>
    ${r.phone ? `<p style="font-size:13px;color:#6b7280">¿Necesitas cancelar? Contáctanos al <strong>${r.phone}</strong> con anticipación.</p>` : ""}
  </div>
  <div class="footer">Enviado por ${r.businessName ?? "SomaOS"}</div>
  `, "#0ea5e9"),
  };
}

function templateReview(r: { clientName: string; businessName: string; serviceName: string; googleReviewUrl?: string; phone?: string }) {
  const reviewUrl = r.googleReviewUrl || `https://www.google.com/search?q=${encodeURIComponent((r.businessName || "SomaOS") + " reseñas")}`;
  const waPhone = (r.phone || "").replace(/\D/g, "");
  const waMsg = encodeURIComponent(`Hola ${r.businessName}, te escribo porque recibí tu email de seguimiento. Tengo una consulta sobre mi sesión de ${r.serviceName}.`);
  const waUrl = waPhone ? `https://wa.me/${waPhone}?text=${waMsg}` : null;
  return {
    subject: `💚 ¿Cómo te has sentido, ${r.clientName.split(" ")[0]}? — ${r.businessName}`,
    html: baseLayout(`
  <div class="header" style="background:#f59e0b;"><h1>¿Cómo te has sentido?</h1><p>${r.businessName} — seguimiento de tu sesión</p></div>
  <div class="body">
    <p style="font-size:15px;color:#374151;margin-top:0">Hola <strong>${r.clientName}</strong> 👋</p>
    <p style="font-size:14px;color:#6b7280;line-height:1.6;">Han pasado 15 días desde tu sesión de <strong style="color:#111827">${r.serviceName}</strong> y quería saber cómo te has sentido. ¿Has notado cambios? ¿Tienes alguna duda o algo que quieras consultar?</p>
    ${waUrl ? `
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;margin:20px 0;text-align:center;">
      <p style="margin:0 0 12px;font-size:14px;color:#166534;font-weight:600;">¿Tienes alguna duda? Escríbeme directamente</p>
      <a href="${waUrl}" style="display:inline-flex;align-items:center;gap:8px;background:#25d366;color:#fff;padding:10px 22px;border-radius:8px;font-weight:600;font-size:14px;text-decoration:none;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
        Escribir por WhatsApp
      </a>
    </div>` : ""}
    <div style="border-top:1px solid #ececef;margin:24px 0;padding-top:20px;">
      <p style="font-size:14px;color:#374151;font-weight:600;margin:0 0 8px;">¿Te gustó tu experiencia?</p>
      <p style="font-size:14px;color:#6b7280;line-height:1.6;margin:0 0 16px;">Tu opinión ayuda a que otras personas puedan encontrarme. ¿Te tomás 1 minuto para dejar una reseña en Google?</p>
      <div style="text-align:center;">
        <a href="${reviewUrl}" class="btn">⭐ Dejar reseña en Google</a>
      </div>
      <p style="font-size:12px;color:#9ca3af;text-align:center;margin-top:12px;">¡Tu reseña hace una gran diferencia! 🙏</p>
    </div>
  </div>
  <div class="footer">Enviado por ${r.businessName} · Si no deseas recibir más emails, contáctanos</div>
  `, "#f59e0b"),
  };
}

function templatePrueba(businessName: string, email: string) {
  return {
    subject: "✅ Conexión de email verificada — SomaOS",
    html: baseLayout(`
  <div class="header"><h1>¡Email configurado correctamente!</h1><p>${businessName}</p></div>
  <div class="body">
    <p style="font-size:15px;color:#374151;margin-top:0">Tu configuración de email en SomaOS está funcionando. Tus pacientes recibirán notificaciones desde <strong>${email}</strong>.</p>
    <div class="card">
      <div class="row"><span class="label">Estado</span><span class="value" style="color:#16a34a">✓ Conectado</span></div>
      <div class="row"><span class="label">Dirección</span><span class="value">${email}</span></div>
      <div class="row"><span class="label">Automáticos activos</span><span class="value">Confirmación · Recordatorio 24h · Review 15d</span></div>
    </div>
  </div>
  <div class="footer">SomaOS — Plataforma de gestión para profesionales de salud</div>
  `),
  };
}

// ── Send via Resend ─────────────────────────────────────────────────

async function sendViaResend(opts: {
  apiKey: string; from: string; to: string;
  subject: string; html: string; replyTo?: string;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${opts.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: opts.from, to: [opts.to], subject: opts.subject, html: opts.html,
      ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
    }),
  });
  const d = await r.json();
  if (!r.ok) { console.error("Resend error:", d); return { ok: false, error: d.message }; }
  return { ok: true, id: d.id };
}

// ── Email log (stored in registros table, tipo="email_log") ────────

async function logEmail(opts: {
  userId: string; reservaId?: string; toEmail: string;
  templateId: string; status: "sent" | "failed"; resendId?: string; error?: string;
}) {
  const id = crypto.randomUUID();
  await sb("registros", {
    method: "POST",
    body: JSON.stringify({
      id,
      user_id: opts.userId,
      client_id: opts.reservaId ?? "email_log",
      client_name: opts.toEmail,
      tipo: "email_log",
      titulo: opts.templateId,
      fecha: new Date().toISOString(),
      data: { status: opts.status, resend_id: opts.resendId, template: opts.templateId, reserva_id: opts.reservaId, to_email: opts.toEmail },
      notas: opts.status === "sent" ? `OK — resend_id: ${opts.resendId}` : `FAILED — ${opts.error ?? "unknown"}`,
    }),
    headers: { "Prefer": "return=minimal" },
  });
}

async function wasAlreadySent(userId: string, reservaId: string, templateId: string): Promise<boolean> {
  const rows = await sb(
    `registros?user_id=eq.${userId}&tipo=eq.email_log&titulo=eq.${templateId}&client_id=eq.${reservaId}&limit=1`,
    { headers: { "Prefer": "return=representation" } },
  );
  return Array.isArray(rows) && rows.length > 0;
}

// ── Get client integration settings ────────────────────────────────

async function getClientIntegration(userId: string) {
  const rows = await sb(
    `client_integrations?user_id=eq.${userId}&select=resend_api_key,resend_email,resend_status`,
    { headers: { "Prefer": "return=representation" } },
  );
  return Array.isArray(rows) ? rows[0] : null;
}

async function getClientProfile(userId: string) {
  const rows = await sb(
    `perfiles?id=eq.${userId}&select=name,business_name,phone,whatsapp_number`,
    { headers: { "Prefer": "return=representation" } },
  );
  return Array.isArray(rows) ? rows[0] : null;
}

async function getPatientEmail(userId: string, clientId: string): Promise<string | null> {
  const rows = await sb(
    `fichas_clientes?user_id=eq.${userId}&client_key=eq.${clientId}&select=email&limit=1`,
    { headers: { "Prefer": "return=representation" } },
  );
  return Array.isArray(rows) && rows.length > 0 ? (rows[0].email || null) : null;
}

// ── Cron: send pending reminders and reviews ────────────────────────

async function runCron(): Promise<{ processed: number; sent: number; errors: number }> {
  let processed = 0; let sent = 0; let errors = 0;
  const now = new Date();

  // 1. Get all users with email configured
  const integrations = await sb(
    `client_integrations?resend_email=neq.&select=user_id,resend_api_key,resend_email`,
    { headers: { "Prefer": "return=representation" } },
  );
  if (!Array.isArray(integrations)) return { processed, sent, errors };

  for (const integration of integrations) {
    const { user_id, resend_api_key, resend_email } = integration;
    if (!resend_email) continue;

    const apiKey = resend_api_key || GLOBAL_RESEND_KEY;
    if (!apiKey) continue;

    const profile = await getClientProfile(user_id);
    const businessName = profile?.business_name || profile?.name || "Tu profesional";
    const phone = profile?.phone || profile?.whatsapp_number || "";

    const from = resend_email
      ? `${businessName} <${resend_email}>`
      : SOMAOS_FROM;
    const replyTo = resend_email || undefined;

    // ── A. Recordatorio 24h ─────────────────────────────────────────
    const in20h = new Date(now.getTime() + 20 * 3600000).toISOString();
    const in28h = new Date(now.getTime() + 28 * 3600000).toISOString();

    const upcomingReservas = await sb(
      `reservas?user_id=eq.${user_id}&status=eq.confirmada&date=gte.${in20h}&date=lte.${in28h}&select=id,client_id,client_name,service_name,date,tipo_atencion,amount`,
      { headers: { "Prefer": "return=representation" } },
    );

    if (Array.isArray(upcomingReservas)) {
      for (const reserva of upcomingReservas) {
        processed++;
        if (await wasAlreadySent(user_id, reserva.id, "recordatorio_24h")) continue;

        const toEmail = await getPatientEmail(user_id, reserva.client_id);
        if (!toEmail) continue;

        const t = templateRecordatorio({
          clientName: reserva.client_name, serviceName: reserva.service_name,
          date: reserva.date, tipoAtencion: reserva.tipo_atencion,
          amount: reserva.amount, businessName, phone,
        });

        const result = await sendViaResend({ apiKey, from, to: toEmail, subject: t.subject, html: t.html, replyTo });
        await logEmail({ userId: user_id, reservaId: reserva.id, toEmail, templateId: "recordatorio_24h", status: result.ok ? "sent" : "failed", resendId: result.id, error: result.error });
        if (result.ok) sent++; else errors++;
      }
    }

    // ── B. Review 15 días (solo nuevos pacientes) ───────────────────
    const d14ago = new Date(now.getTime() - 14 * 86400000).toISOString();
    const d16ago = new Date(now.getTime() - 16 * 86400000).toISOString();

    const pastReservas = await sb(
      `reservas?user_id=eq.${user_id}&status=eq.completada&date=gte.${d16ago}&date=lte.${d14ago}&select=id,client_id,client_name,service_name,date`,
      { headers: { "Prefer": "return=representation" } },
    );

    if (Array.isArray(pastReservas)) {
      for (const reserva of pastReservas) {
        processed++;
        if (await wasAlreadySent(user_id, reserva.id, "review_15d")) continue;

        // Only send review to NEW patients (first session only)
        const allPatientSessions = await sb(
          `reservas?user_id=eq.${user_id}&client_id=eq.${reserva.client_id}&status=eq.completada&select=id`,
          { headers: { "Prefer": "return=representation" } },
        );
        const sessionCount = Array.isArray(allPatientSessions) ? allPatientSessions.length : 0;
        if (sessionCount > 1) continue; // Not a new patient

        const toEmail = await getPatientEmail(user_id, reserva.client_id);
        if (!toEmail) continue;

        // Get Google Review URL from integration settings if available
        const integExtra = await sb(
          `client_integrations?user_id=eq.${user_id}&select=google_review_url`,
          { headers: { "Prefer": "return=representation" } },
        );
        const googleReviewUrl = Array.isArray(integExtra) ? integExtra[0]?.google_review_url : undefined;

        const t = templateReview({ clientName: reserva.client_name, businessName, serviceName: reserva.service_name, googleReviewUrl, phone });
        const result = await sendViaResend({ apiKey, from, to: toEmail, subject: t.subject, html: t.html, replyTo });
        await logEmail({ userId: user_id, reservaId: reserva.id, toEmail, templateId: "review_15d", status: result.ok ? "sent" : "failed", resendId: result.id, error: result.error });
        if (result.ok) sent++; else errors++;
      }
    }
  }

  return { processed, sent, errors };
}

// ── Main handler ────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  // ── GET: Vercel cron job ────────────────────────────────────────
  if (req.method === "GET") {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.authorization;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const result = await runCron();
      console.log("Cron completed:", result);
      return res.status(200).json({ ok: true, ...result });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("Cron error:", msg);
      return res.status(500).json({ error: msg });
    }
  }

  // ── POST: manual send ───────────────────────────────────────────
  if (req.method !== "POST") return res.status(405).end();

  const {
    userId, to, subject, html, text,
    template, reserva, businessName,
  } = req.body as {
    userId: string; to: string; subject?: string; html?: string; text?: string;
    template?: "confirmacion" | "recordatorio" | "prueba" | "review";
    reserva?: ReservaData & { googleReviewUrl?: string };
    businessName?: string;
  };

  if (!userId || !to) return res.status(400).json({ error: "Missing userId or to" });

  const integration = await getClientIntegration(userId);
  const clientEmail = integration?.resend_email || "";
  const clientApiKey = integration?.resend_api_key || "";
  const apiKey = clientApiKey || GLOBAL_RESEND_KEY;
  if (!apiKey) return res.status(500).json({ error: "No Resend API key configured." });

  const from = clientApiKey && clientEmail ? `Notificaciones <${clientEmail}>` : SOMAOS_FROM;
  const replyTo = clientEmail || undefined;

  let finalSubject = subject || "";
  let finalHtml = html || "";

  if (template === "confirmacion" && reserva) {
    const t = templateConfirmacion({ ...reserva, businessName });
    finalSubject = t.subject; finalHtml = t.html;
  } else if (template === "recordatorio" && reserva) {
    const t = templateRecordatorio({ ...reserva, businessName });
    finalSubject = t.subject; finalHtml = t.html;
  } else if (template === "review" && reserva) {
    const t = templateReview({ clientName: reserva.clientName, businessName: businessName || reserva.businessName || "SomaOS", serviceName: reserva.serviceName, googleReviewUrl: reserva.googleReviewUrl });
    finalSubject = t.subject; finalHtml = t.html;
  } else if (template === "prueba") {
    const t = templatePrueba(businessName || "Tu negocio", clientEmail || to);
    finalSubject = t.subject; finalHtml = t.html;
  } else if (!finalSubject) {
    return res.status(400).json({ error: "Missing subject or template" });
  }

  if (!finalHtml) finalHtml = `<p>${text || finalSubject}</p>`;

  const result = await sendViaResend({ apiKey, from, to, subject: finalSubject, html: finalHtml, replyTo });
  if (!result.ok) return res.status(500).json({ error: result.error || "Failed to send email" });
  return res.status(200).json({ ok: true, id: result.id });
}
