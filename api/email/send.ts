import type { VercelRequest, VercelResponse } from "@vercel/node";

const SUPABASE_URL = "https://fwxutchyumopwvertisd.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GLOBAL_RESEND_KEY = process.env.RESEND_API_KEY!;
const SOMAOS_FROM = "SomaOS <noreply@somaos.app>";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { userId, to, subject, html, text } = req.body as {
    userId: string;
    to: string;
    subject: string;
    html?: string;
    text?: string;
  };

  if (!userId || !to || !subject) {
    return res.status(400).json({ error: "Missing userId, to, or subject" });
  }

  // 1. Load client's integration settings
  const intRes = await fetch(
    `${SUPABASE_URL}/rest/v1/client_integrations?user_id=eq.${userId}&select=resend_api_key,resend_email,resend_status`,
    { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } },
  );
  const integrations = await intRes.json();
  const integration = integrations[0];

  const clientEmail = integration?.resend_email || "";
  const clientApiKey = integration?.resend_api_key || "";

  // 2. Choose API key and from address
  const apiKey = clientApiKey || GLOBAL_RESEND_KEY;
  if (!apiKey) return res.status(500).json({ error: "No Resend API key configured" });

  // If client has their own verified Resend key + email → send from their email
  // Otherwise use SomaOS domain with client email as Reply-To
  const from = clientApiKey && clientEmail ? `Notificaciones <${clientEmail}>` : SOMAOS_FROM;
  const replyTo = clientEmail || undefined;

  // 3. Send via Resend
  const emailRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html: html || `<p>${text || subject}</p>`,
      text: text || subject,
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
