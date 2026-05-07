import type { VercelRequest, VercelResponse } from "@vercel/node";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const APP_URL = process.env.APP_URL || "https://somaos-react.vercel.app";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Quick diagnosis endpoint — remove after fixing
  const redirectUri = `${APP_URL}/api/google/callback`;

  // Test token exchange with a dummy code to see the exact Google error
  const testRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: "dummy_code_for_test",
      client_id: GOOGLE_CLIENT_ID || "MISSING",
      client_secret: GOOGLE_CLIENT_SECRET || "MISSING",
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const testBody = await testRes.json();

  return res.status(200).json({
    config: {
      client_id_set: !!GOOGLE_CLIENT_ID,
      client_secret_set: !!GOOGLE_CLIENT_SECRET,
      app_url: APP_URL,
      redirect_uri: redirectUri,
    },
    google_response: testBody,
  });
}
