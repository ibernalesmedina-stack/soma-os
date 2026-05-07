import type { VercelRequest, VercelResponse } from "@vercel/node";

const SUPABASE_URL = "https://fwxutchyumopwvertisd.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const APP_URL = process.env.APP_URL || "https://somaos-react.vercel.app";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Vercel req.query values can be string | string[] — normalize to string
  const code = Array.isArray(req.query.code) ? req.query.code[0] : req.query.code;
  const userId = Array.isArray(req.query.state) ? req.query.state[0] : req.query.state;
  const error = Array.isArray(req.query.error) ? req.query.error[0] : req.query.error;

  if (error) {
    return res.redirect(`${APP_URL}/app/calendario?google=denied`);
  }
  if (!code || !userId) {
    return res.redirect(`${APP_URL}/app/calendario?google=error&reason=missing_params`);
  }

  console.log("[callback] code length:", code.length, "prefix:", code.substring(0, 15), "type:", typeof code);
  console.log("[callback] raw query:", JSON.stringify(req.query));

  // 1. Exchange auth code for tokens
  const redirectUri = `${APP_URL}/api/google/callback`;
  console.log("[callback] exchanging code, redirect_uri:", redirectUri);
  console.log("[callback] client_id:", GOOGLE_CLIENT_ID ? "set" : "MISSING");
  console.log("[callback] client_secret:", GOOGLE_CLIENT_SECRET ? "set" : "MISSING");

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const tokenBody = await tokenRes.text();
  if (!tokenRes.ok) {
    console.error("[callback] Token exchange failed:", tokenRes.status, tokenBody);
    // Show error details in redirect for debugging
    const errData = JSON.parse(tokenBody);
    return res.redirect(`${APP_URL}/app/calendario?google=error&reason=${encodeURIComponent(errData.error || tokenBody)}`);
  }

  const tokens = JSON.parse(tokenBody) as {
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
