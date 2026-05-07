import type { VercelRequest, VercelResponse } from "@vercel/node";

const SUPABASE_URL = "https://fwxutchyumopwvertisd.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const APP_URL = process.env.APP_URL || "https://somaos-react.vercel.app";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { code, state: userId, error } = req.query;

  if (error) {
    return res.redirect(`${APP_URL}/app/calendario?google=denied`);
  }
  if (!code || !userId || typeof code !== "string" || typeof userId !== "string") {
    return res.redirect(`${APP_URL}/app/calendario?google=error`);
  }

  // 1. Exchange auth code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: `${APP_URL}/api/google/callback`,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    console.error("Token exchange failed:", await tokenRes.text());
    return res.redirect(`${APP_URL}/app/calendario?google=error`);
  }

  const tokens = await tokenRes.json() as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
  };

  const expiry = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

  // 2. Save tokens to Supabase (encrypted via service role, bypasses RLS)
  const upsertRes = await fetch(`${SUPABASE_URL}/rest/v1/client_integrations`, {
    method: "POST",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
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

  if (!upsertRes.ok) {
    console.error("Supabase upsert failed:", await upsertRes.text());
    return res.redirect(`${APP_URL}/app/calendario?google=error`);
  }

  // 3. Register Google Calendar webhook for push notifications
  try {
    const channelId = `soma-${userId}-${Date.now()}`;
    await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/watch`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: channelId,
        type: "web_hook",
        address: `${APP_URL}/api/google/webhook`,
        expiration: String(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      }),
    });

    await fetch(`${SUPABASE_URL}/rest/v1/client_integrations?user_id=eq.${userId}`, {
      method: "PATCH",
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        google_webhook_channel: channelId,
        google_webhook_expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }),
    });
  } catch (e) {
    console.warn("Webhook registration failed (non-blocking):", e);
  }

  // 4. Initial sync: push upcoming reservas to Google Calendar
  try {
    await fetch(`${APP_URL}/api/google/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
  } catch (e) {
    console.warn("Initial sync failed (non-blocking):", e);
  }

  res.redirect(`${APP_URL}/app/calendario?google=connected`);
}
