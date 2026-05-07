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

async function getValidToken(integration: Record<string, string>): Promise<string | null> {
  const expiry = new Date(integration.google_token_expiry);
  const isExpired = expiry < new Date(Date.now() + 60_000); // 1min buffer

  if (!isExpired) return integration.google_access_token;
  if (!integration.google_refresh_token) return null;

  const newToken = await refreshAccessToken(integration.google_refresh_token);
  if (!newToken) return null;

  // Save refreshed token to Supabase
  await fetch(`${SUPABASE_URL}/rest/v1/client_integrations?user_id=eq.${integration.user_id}`, {
    method: "PATCH",
    headers: {
      apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      google_access_token: newToken,
      google_token_expiry: new Date(Date.now() + 3600_000).toISOString(),
    }),
  });

  return newToken;
}

function reservaToGoogleEvent(reserva: Record<string, string | number>) {
  const start = new Date(reserva.date as string);
  const end = new Date(start.getTime() + 60 * 60 * 1000); // default 1h
  return {
    summary: `${reserva.clientName} — ${reserva.serviceName}`,
    description: [
      `Servicio: ${reserva.serviceName}`,
      `Tipo: ${reserva.tipoAtencion || "presencial"}`,
      `Estado: ${reserva.status}`,
      `Monto: $${Number(reserva.amount).toLocaleString("es-CL")}`,
      `ID SomaOS: ${reserva.id}`,
    ].join("\n"),
    start: { dateTime: start.toISOString(), timeZone: "America/Santiago" },
    end:   { dateTime: end.toISOString(),   timeZone: "America/Santiago" },
    extendedProperties: {
      private: { somaos_id: String(reserva.id), somaos_sync: "true" },
    },
    status: reserva.status === "cancelada" ? "cancelled" : "confirmed",
  };
}

async function createCalendarEvent(accessToken: string, event: object): Promise<string | null> {
  const res = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });
  const data = await res.json();
  return data.id || null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { userId, reservaId } = req.body as { userId: string; reservaId?: string };
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  // 1. Get integration record
  const intRes = await fetch(`${SUPABASE_URL}/rest/v1/client_integrations?user_id=eq.${userId}&select=*`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  });
  const integrations = await intRes.json();
  const integration = integrations[0];

  // Support both column names (google_access_token from new schema, google_calendar_token from base schema)
  const storedToken = integration?.google_access_token || integration?.google_calendar_token;
  if (!storedToken) {
    return res.status(200).json({ skipped: "No Google Calendar connected" });
  }
  if (!integration.google_access_token) {
    integration.google_access_token = storedToken;
  }

  // 2. Get valid access token
  const accessToken = await getValidToken(integration);
  if (!accessToken) {
    return res.status(401).json({ error: "Could not refresh Google token" });
  }

  let synced = 0;
  const errors: string[] = [];

  // 3. Sync bloqueos (blocked time slots)
  if (!reservaId) {
    const bloqueoRes = await fetch(
      `${SUPABASE_URL}/rest/v1/bloqueos?user_id=eq.${userId}&end_at=gte.${new Date().toISOString()}&select=*`,
      { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } },
    );
    const bloqueos = await bloqueoRes.json();

    for (const b of bloqueos) {
      try {
        const event = {
          summary: `🔒 ${b.motivo || "Horario bloqueado"}`,
          description: "Bloqueado desde SomaOS",
          start: { dateTime: b.start_at, timeZone: "America/Santiago" },
          end:   { dateTime: b.end_at,   timeZone: "America/Santiago" },
          status: "tentative",
          extendedProperties: { private: { somaos_bloqueo: b.id, somaos_sync: "true" } },
        };
        await createCalendarEvent(accessToken, event);
        synced++;
      } catch (e) {
        errors.push(`Bloqueo ${b.id}: ${e}`);
      }
    }
  }

  // 4. Get reservas from Supabase
  const filter = reservaId
    ? `id=eq.${reservaId}&user_id=eq.${userId}`
    : `user_id=eq.${userId}&status=in.(confirmada,pendiente)`;

  const resRes = await fetch(`${SUPABASE_URL}/rest/v1/reservas?${filter}&select=*`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  });
  const reservas = await resRes.json();

  for (const reserva of reservas) {
    // Only sync future reservas (or the specific one)
    if (!reservaId && new Date(reserva.date) < new Date()) continue;

    const event = reservaToGoogleEvent(reserva);
    const googleEventId = reserva.google_event_id;

    try {
      if (googleEventId) {
        // Update existing event
        await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events/${googleEventId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(event),
          },
        );
      } else {
        // Create new event
        const createRes = await fetch(
          "https://www.googleapis.com/calendar/v3/calendars/primary/events",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(event),
          },
        );
        const created = await createRes.json();

        // Save Google event ID back to reserva
        if (created.id) {
          await fetch(`${SUPABASE_URL}/rest/v1/reservas?id=eq.${reserva.id}`, {
            method: "PATCH",
            headers: {
              apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ google_event_id: created.id }),
          });
        }
      }
      synced++;
    } catch (e) {
      errors.push(`Reserva ${reserva.id}: ${e}`);
    }
  }

  return res.status(200).json({ synced, errors });
}
