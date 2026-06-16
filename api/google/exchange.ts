import type { VercelRequest, VercelResponse } from "@vercel/node";

const SUPABASE_URL = "https://fwxutchyumopwvertisd.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const APP_URL = process.env.APP_URL || "https://www.somaos.cl";
const REDIRECT_URI = `${APP_URL}/app/google-callback`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { code, userId } = req.body as { code: string; userId: string };
  if (!code || !userId) return res.status(400).json({ error: "Missing code or userId" });

  // 1. Exchange code for tokens
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
    console.error("Google token exchange failed:", tokens);
    return res.status(400).json({ error: tokens.error_description || tokens.error || "Google auth failed" });
  }

  if (!tokens.access_token) {
    return res.status(400).json({ error: "No access token returned by Google" });
  }

  const expiry = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

  // 2. Check if row exists
  const checkRes = await fetch(
    `${SUPABASE_URL}/rest/v1/client_integrations?user_id=eq.${userId}&select=id`,
    { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } },
  );
  const existing = await checkRes.json();
  const rowExists = Array.isArray(existing) && existing.length > 0;

  // 3. Save tokens — update if row exists, insert if not
  // Stores access token in google_calendar_token (base column) AND google_access_token if available
  const payload: Record<string, string> = {
    google_calendar_token: tokens.access_token,
    google_access_token: tokens.access_token,
    google_refresh_token: tokens.refresh_token || "",
    google_token_expiry: expiry,
    google_calendar_id: "primary",
    calendar_status: "synced",
    google_connected_at: new Date().toISOString(),
  };

  let saveRes: Response;
  if (rowExists) {
    saveRes = await fetch(
      `${SUPABASE_URL}/rest/v1/client_integrations?user_id=eq.${userId}`,
      {
        method: "PATCH",
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify(payload),
      },
    );
  } else {
    saveRes = await fetch(`${SUPABASE_URL}/rest/v1/client_integrations`, {
      method: "POST",
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ user_id: userId, ...payload }),
    });
  }

  if (!saveRes.ok) {
    const saveErr = await saveRes.text();
    console.error("Supabase save failed:", saveErr);

    // Columns may not exist yet — try saving only base columns
    const basePayload = {
      google_calendar_token: tokens.access_token,
    };
    const fallbackRes = rowExists
      ? await fetch(`${SUPABASE_URL}/rest/v1/client_integrations?user_id=eq.${userId}`, {
          method: "PATCH",
          headers: {
            apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`,
            "Content-Type": "application/json", Prefer: "return=minimal",
          },
          body: JSON.stringify(basePayload),
        })
      : await fetch(`${SUPABASE_URL}/rest/v1/client_integrations`, {
          method: "POST",
          headers: {
            apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`,
            "Content-Type": "application/json", Prefer: "return=minimal",
          },
          body: JSON.stringify({ user_id: userId, ...basePayload }),
        });

    if (!fallbackRes.ok) {
      const fallbackErr = await fallbackRes.text();
      console.error("Fallback save also failed:", fallbackErr);
      return res.status(500).json({ error: `Could not save Google tokens: ${fallbackErr}` });
    }

    // Fallback succeeded — token saved but missing columns for full sync
    console.warn("Saved using base columns only — run migration_google_oauth.sql to enable full sync");
  }

  // 4. Trigger initial sync (non-blocking)
  fetch(`${APP_URL}/api/google/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  }).catch(() => {});

  return res.status(200).json({ ok: true });
}
