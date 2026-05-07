import type { VercelRequest, VercelResponse } from "@vercel/node";

const SUPABASE_URL = "https://fwxutchyumopwvertisd.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { userId } = req.body as { userId: string };
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  // Get current tokens to revoke them
  const intRes = await fetch(
    `${SUPABASE_URL}/rest/v1/client_integrations?user_id=eq.${userId}&select=google_access_token,google_refresh_token`,
    { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } },
  );
  const [integration] = await intRes.json();

  // Revoke token with Google
  if (integration?.google_access_token) {
    await fetch(
      `https://oauth2.googleapis.com/revoke?token=${integration.google_access_token}`,
      { method: "POST" },
    ).catch(() => {});
  }

  // Clear tokens in Supabase
  await fetch(`${SUPABASE_URL}/rest/v1/client_integrations?user_id=eq.${userId}`, {
    method: "PATCH",
    headers: {
      apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      google_access_token: "",
      google_refresh_token: "",
      google_token_expiry: null,
      google_webhook_channel: "",
      calendar_status: "disconnected",
      google_connected_at: null,
    }),
  });

  return res.status(200).json({ ok: true });
}
