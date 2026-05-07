import type { VercelRequest, VercelResponse } from "@vercel/node";

const SUPABASE_URL = "https://fwxutchyumopwvertisd.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.access_token || null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const userId = Array.isArray(req.query.userId) ? req.query.userId[0] : req.query.userId;
  const weekStart = Array.isArray(req.query.weekStart) ? req.query.weekStart[0] : req.query.weekStart;

  if (!userId) return res.status(400).json({ error: "Missing userId" });

  // 1. Get integration record
  const intRes = await fetch(
    `${SUPABASE_URL}/rest/v1/client_integrations?user_id=eq.${userId}&select=*`,
    { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } },
  );
  const integrations = await intRes.json();
  const integration = integrations[0];

  const accessTokenRaw = integration?.google_access_token || integration?.google_calendar_token;
  if (!accessTokenRaw) {
    return res.status(200).json({ events: [] });
  }

  // 2. Refresh token if needed
  let accessToken = accessTokenRaw;
  if (integration?.google_token_expiry) {
    const expiry = new Date(integration.google_token_expiry);
    if (expiry < new Date(Date.now() + 60_000) && integration.google_refresh_token) {
      const newToken = await refreshAccessToken(integration.google_refresh_token);
      if (newToken) {
        accessToken = newToken;
        // Save refreshed token
        await fetch(`${SUPABASE_URL}/rest/v1/client_integrations?user_id=eq.${userId}`, {
          method: "PATCH",
          headers: {
            apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            google_access_token: newToken,
            google_calendar_token: newToken,
            google_token_expiry: new Date(Date.now() + 3600_000).toISOString(),
          }),
        });
      }
    }
  }

  // 3. Calculate time range (current week or requested week)
  const start = weekStart ? new Date(weekStart) : (() => {
    const d = new Date(); d.setDate(d.getDate() - d.getDay()); d.setHours(0,0,0,0); return d;
  })();
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  // 4. Fetch events from Google Calendar
  const params = new URLSearchParams({
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "100",
  });

  const gcalRes = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!gcalRes.ok) {
    const err = await gcalRes.json();
    console.error("Google Calendar events fetch failed:", err);
    return res.status(200).json({ events: [] });
  }

  const gcalData = await gcalRes.json();
  const items = gcalData.items || [];

  // 5. Filter out events created by SomaOS to avoid duplicates
  const externalEvents = items
    .filter((e: any) => {
      const props = e.extendedProperties?.private || {};
      return !props.somaos_sync; // exclude SomaOS-created events
    })
    .filter((e: any) => e.status !== "cancelled")
    .map((e: any) => ({
      id: e.id,
      title: e.summary || "(sin título)",
      start: e.start?.dateTime || e.start?.date,
      end: e.end?.dateTime || e.end?.date,
      allDay: !e.start?.dateTime,
      color: e.colorId,
    }));

  return res.status(200).json({ events: externalEvents });
}
