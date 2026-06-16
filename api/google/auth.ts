import type { VercelRequest, VercelResponse } from "@vercel/node";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const APP_URL = process.env.APP_URL || "https://www.somaos.cl";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.readonly",
  "openid",
  "email",
].join(" ");

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { userId } = req.query;
  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "Missing userId" });
  }

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: `${APP_URL}/app/google-callback`,
    response_type: "code",
    scope: SCOPES,
    access_type: "offline",   // needed for refresh_token
    prompt: "consent",         // force consent to get refresh_token every time
    state: userId,
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}
