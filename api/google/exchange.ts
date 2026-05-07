import type { VercelRequest, VercelResponse } from "@vercel/node";

const SUPABASE_URL = "https://fwxutchyumopwvertisd.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const APP_URL = process.env.APP_URL || "https://somaos-react.vercel.app";
const REDIRECT_URI = `${APP_URL}/app/google-callback`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { code, userId } = req.body as { code: string; userId: string };
  if (!code || !userId) return res.status(400).json({ error: "Missing code or userId" });

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });

  const tokens = await tokenRes.json();
  if (!tokenRes.ok) {
    console.error("Token exchange failed:", tokens);
    return res.status(400).json({ error: tokens.error_description || tokens.error });
  }

  const expiry = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

  // Save tokens to Supabase
  await fetch(`${SUPABASE_URL}/rest/v1/client_integrations`, {
    method: "POST",
    headers: {
      apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json", Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({
      user_id: userId,
      google_access_token: tokens.access_token,
      google_refresh_token: tokens.refresh_token || "",
      google_token_expiry: expiry,
      google_calendar_id: "primary",
      calendar_status: "synced",
      google_connected_at: new Date().toISOString(),
    }),
  });

  // Initial sync (non-blocking)
  fetch(`${APP_URL}/api/google/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  }).catch(() => {});

  return res.status(200).json({ ok: true });
}
