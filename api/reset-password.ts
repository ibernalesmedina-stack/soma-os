import type { VercelRequest, VercelResponse } from "@vercel/node";

const SUPABASE_URL = "https://fwxutchyumopwvertisd.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const APP_URL = "https://www.somaos.cl";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email requerido" });

  // Generate reset link via Supabase admin
  const linkRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/generate_link`, {
    method: "POST",
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "recovery",
      email,
      options: { redirect_to: `${APP_URL}/reset-password` },
    }),
  });

  if (!linkRes.ok) {
    // Don't reveal if email exists
    return res.status(200).json({ ok: true });
  }

  const linkData = await linkRes.json();
  const resetLink = linkData.action_link;
  if (!resetLink) return res.status(200).json({ ok: true });

  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Arial,sans-serif;}
  .wrap{max-width:520px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);}
  .header{background:#7C3AED;padding:28px 32px;}
  .header h1{margin:0;color:#fff;font-size:22px;font-weight:700;}
  .header p{margin:6px 0 0;color:rgba(255,255,255,.8);font-size:14px;}
  .body{padding:32px;}
  .btn{display:inline-block;padding:14px 32px;background:#7C3AED;color:#fff;border-radius:8px;font-weight:600;font-size:15px;text-decoration:none;}
  .footer{padding:16px 32px;border-top:1px solid #ececef;font-size:12px;color:#9ca3af;text-align:center;}
  .note{font-size:12px;color:#9ca3af;margin-top:20px;}
</style>
</head>
<body><div class="wrap">
  <div class="header">
    <h1>Recuperar contraseña</h1>
    <p>SomaOS — Plataforma para profesionales de salud</p>
  </div>
  <div class="body">
    <p style="font-size:15px;color:#374151;margin-top:0">Recibimos una solicitud para restablecer la contraseña de tu cuenta en SomaOS.</p>
    <p style="font-size:14px;color:#6b7280;">Haz clic en el botón de abajo para elegir una nueva contraseña. El enlace es válido por 1 hora.</p>
    <div style="text-align:center;margin:28px 0;">
      <a href="${resetLink}" class="btn">Restablecer contraseña →</a>
    </div>
    <p class="note">Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña seguirá siendo la misma.</p>
    <p class="note">Si el botón no funciona, copia este enlace en tu navegador:<br>
      <span style="word-break:break-all;color:#7C3AED;">${resetLink}</span>
    </p>
  </div>
  <div class="footer">SomaOS · <a href="${APP_URL}/privacidad" style="color:#9ca3af;">Privacidad</a></div>
</div></body></html>`;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "SomaOS <noreply@somaos.app>",
      to: [email],
      subject: "Recupera tu contraseña de SomaOS",
      html,
    }),
  });

  return res.status(200).json({ ok: true });
}
