import type { VercelRequest, VercelResponse } from "@vercel/node";

const SUPABASE_URL = "https://fwxutchyumopwvertisd.supabase.co";
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).send(page("Link inválido", "El enlace de cancelación no es válido.", false));
  }

  const fetchRes = await fetch(
    `${SUPABASE_URL}/rest/v1/reservas?id=eq.${id}&select=id,status,client_name,service_name,date`,
    { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } },
  );
  const rows = await fetchRes.json();
  const reserva = Array.isArray(rows) ? rows[0] : null;

  if (!reserva) {
    return res.status(404).send(page("No encontrada", "No encontramos una reserva con este enlace.", false));
  }

  if (reserva.status === "cancelada") {
    return res.status(200).send(page("Reserva cancelada", `Tu reserva de <strong>${reserva.service_name}</strong> ya estaba cancelada.`, true));
  }

  await fetch(`${SUPABASE_URL}/rest/v1/reservas?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json", Prefer: "return=minimal",
    },
    body: JSON.stringify({ status: "cancelada" }),
  });

  return res.status(200).send(
    page("Reserva cancelada", `Tu hora de <strong>${reserva.service_name}</strong> fue cancelada correctamente. El horario ya quedó disponible para otras personas.`, true),
  );
}

function page(title: string, message: string, success: boolean) {
  const color = success ? "#1a3a2a" : "#7f1d1d";
  const icon  = success ? "✓" : "✕";
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title} — Elliot Nutrition</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Helvetica Neue',Arial,sans-serif;background:#f4f4f0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
    .card{background:#fff;border-radius:20px;padding:48px 40px;max-width:460px;width:100%;text-align:center;box-shadow:0 2px 16px rgba(0,0,0,.08)}
    .icon{width:64px;height:64px;border-radius:50%;background:${color};color:#fff;font-size:28px;display:flex;align-items:center;justify-content:center;margin:0 auto 24px}
    h1{font-size:22px;font-weight:700;color:${color};margin-bottom:12px}
    p{font-size:15px;color:#4b5563;line-height:1.6}
    a{display:inline-block;margin-top:28px;background:${color};color:#fff;padding:12px 28px;border-radius:100px;font-size:14px;font-weight:600;text-decoration:none}
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${icon}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="https://www.elliotnutrition.com">Volver al inicio</a>
  </div>
</body>
</html>`;
}
