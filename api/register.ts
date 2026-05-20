import type { VercelRequest, VercelResponse } from "@vercel/node";

const SUPABASE_URL = "https://fwxutchyumopwvertisd.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY!;
const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const APP_URL = "https://somaos-react.vercel.app";

async function sendWelcomeEmail(to: string, name: string, businessName: string) {
  if (!RESEND_API_KEY) return;
  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Arial,sans-serif;}
  .wrap{max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);}
  .header{background:#7C3AED;padding:32px;}
  .header h1{margin:0;color:#fff;font-size:24px;font-weight:700;}
  .header p{margin:6px 0 0;color:rgba(255,255,255,.8);font-size:14px;}
  .body{padding:32px;}
  .card{background:#f9f9fb;border:1px solid #ececef;border-radius:8px;padding:18px 20px;margin:20px 0;}
  .row{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #ececef;font-size:14px;}
  .row:last-child{border-bottom:none;}
  .label{color:#6b7280;}
  .value{font-weight:600;color:#111827;}
  .step{display:flex;gap:12px;padding:10px 0;border-bottom:1px solid #f3f4f6;align-items:flex-start;}
  .step:last-child{border-bottom:none;}
  .num{width:24px;height:24px;border-radius:50%;background:#7C3AED;color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;}
  .btn{display:inline-block;padding:14px 32px;background:#7C3AED;color:#fff;border-radius:8px;font-weight:600;font-size:15px;text-decoration:none;margin-top:8px;}
  .footer{padding:20px 32px;border-top:1px solid #ececef;font-size:12px;color:#9ca3af;text-align:center;}
</style>
</head>
<body><div class="wrap">
  <div class="header">
    <h1>¡Tu cuenta está lista! 🎉</h1>
    <p>Bienvenida a SomaOS, ${name.split(" ")[0]}</p>
  </div>
  <div class="body">
    <p style="font-size:15px;color:#374151;margin-top:0">Tu workspace de <strong>${businessName}</strong> ya está activo. Aquí están los datos de tu cuenta:</p>
    <div class="card">
      <div class="row"><span class="label">Email</span><span class="value">${to}</span></div>
      <div class="row"><span class="label">Negocio</span><span class="value">${businessName}</span></div>
      <div class="row"><span class="label">Estado</span><span class="value" style="color:#16a34a">✓ Activa</span></div>
    </div>
    <p style="font-size:14px;font-weight:600;color:#111827;margin-bottom:12px;">Para empezar:</p>
    <div class="card" style="padding:12px 16px;">
      <div class="step"><div class="num">1</div><div><strong style="font-size:14px;">Agrega tus servicios</strong><br><span style="font-size:13px;color:#6b7280;">Ve a Servicios y crea los que ofreces con su precio y duración</span></div></div>
      <div class="step"><div class="num">2</div><div><strong style="font-size:14px;">Configura tu email</strong><br><span style="font-size:13px;color:#6b7280;">En Integraciones → Email para enviar confirmaciones a tus pacientes</span></div></div>
      <div class="step"><div class="num">3</div><div><strong style="font-size:14px;">Crea tu primera reserva</strong><br><span style="font-size:13px;color:#6b7280;">Ve a Reservas → Nueva reserva</span></div></div>
    </div>
    <div style="text-align:center;margin-top:24px;">
      <a href="${APP_URL}/login" class="btn">Ir a mi dashboard →</a>
    </div>
    <p style="font-size:13px;color:#6b7280;text-align:center;margin-top:20px;">¿Tienes dudas? Escríbenos a <a href="mailto:hola@somaos.app" style="color:#7C3AED;">hola@somaos.app</a></p>
  </div>
  <div class="footer">SomaOS · Plataforma para profesionales de salud · <a href="${APP_URL}/privacidad" style="color:#9ca3af;">Privacidad</a></div>
</div></body></html>`;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "SomaOS <noreply@somaos.app>",
      to: [to],
      subject: `¡Bienvenida a SomaOS, ${name.split(" ")[0]}! Tu cuenta está lista`,
      html,
    }),
  }).catch(e => console.error("Welcome email failed:", e));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, password, name, businessName, phone, plan, tipoNegocio, submodulos } = req.body;

  if (!email || !password || !name || !businessName) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  // 1. Create auth user with service role key — no email sent, no rate limit
  const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      "apikey": SERVICE_ROLE_KEY,
      "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true, // confirm immediately, no email needed
    }),
  });

  const userData = await createRes.json();
  if (!createRes.ok) {
    return res.status(400).json({ error: userData.msg || userData.message || "Error al crear usuario" });
  }

  const userId = userData.id;

  // 2. Create profile in perfiles
  const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/perfiles`, {
    method: "POST",
    headers: {
      "apikey": SERVICE_ROLE_KEY,
      "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "resolution=merge-duplicates",
    },
    body: JSON.stringify({
      id: userId,
      name,
      business_name: businessName,
      phone: phone || "",
      plan: plan || "basic",
      tipo_negocio: tipoNegocio || "psicologa",
      submodulos: submodulos || [],
      role: "user",
      active: true,
    }),
  });

  if (!profileRes.ok) {
    const profileErr = await profileRes.json();
    console.error("Profile error:", profileErr);
    // Don't fail — user was created, profile can be fixed later
  }

  // 3. Sign in to get session for the client
  const signInRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "apikey": ANON_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const session = await signInRes.json();
  if (!signInRes.ok) {
    return res.status(400).json({ error: "Usuario creado. Inicia sesión manualmente." });
  }

  // 4. Send welcome email (non-blocking)
  sendWelcomeEmail(email, name, businessName);

  return res.status(200).json({
    userId,
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });
}
