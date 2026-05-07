import type { VercelRequest, VercelResponse } from "@vercel/node";

const SUPABASE_URL = "https://fwxutchyumopwvertisd.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Google sends a POST here when Calendar changes
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Always respond 200 quickly — Google retries if we don't
  res.status(200).end();

  if (req.method !== "POST") return;

  const channelId = req.headers["x-goog-channel-id"] as string;
  const resourceState = req.headers["x-goog-resource-state"] as string;

  // Ignore sync/verification messages
  if (!channelId || resourceState === "sync") return;

  // Find which user this channel belongs to
  const intRes = await fetch(
    `${SUPABASE_URL}/rest/v1/client_integrations?google_webhook_channel=eq.${channelId}&select=*`,
    { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } },
  );
  const integrations = await intRes.json();
  const integration = integrations[0];
  if (!integration) return;

  const userId = integration.user_id;
  const accessToken = integration.google_access_token;
  if (!accessToken) return;

  // Fetch recent events from Google Calendar (last 7 days to now)
  const timeMin = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const eventsRes = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&singleEvents=true&orderBy=startTime`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!eventsRes.ok) return;
  const { items: events } = await eventsRes.json();

  // Process only SomaOS-created events to update their status
  for (const event of (events || [])) {
    const somaId = event.extendedProperties?.private?.somaos_id;
    if (!somaId) continue;

    // Map Google status → SomaOS status
    let status: string | null = null;
    if (event.status === "cancelled") status = "cancelada";
    else if (event.summary?.toLowerCase().includes("cancelad")) status = "cancelada";

    if (status) {
      await fetch(`${SUPABASE_URL}/rest/v1/reservas?id=eq.${somaId}&user_id=eq.${userId}`, {
        method: "PATCH",
        headers: {
          apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
    }
  }
}
