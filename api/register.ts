import type { VercelRequest, VercelResponse } from "@vercel/node";

const SUPABASE_URL = "https://fwxutchyumopwvertisd.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY!;

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

  return res.status(200).json({
    userId,
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });
}
