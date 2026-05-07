import type { VercelRequest, VercelResponse } from "@vercel/node";

const VERCEL_TOKEN      = process.env.VERCEL_TOKEN!;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID!;
const SUPABASE_URL      = "https://fwxutchyumopwvertisd.supabase.co";
const SERVICE_KEY       = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { domain, userId } = req.body as { domain: string; userId: string };
  if (!domain || !userId) return res.status(400).json({ error: "Missing domain or userId" });

  const clean = domain.toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "").trim();

  // Check DNS via Vercel API
  const vercelRes = await fetch(
    `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/domains/${clean}`,
    { headers: { Authorization: `Bearer ${VERCEL_TOKEN}` } },
  );

  const vercelData = await vercelRes.json();
  const verified = vercelData.verified === true;

  // Update status in Supabase
  await fetch(`${SUPABASE_URL}/rest/v1/client_integrations?user_id=eq.${userId}`, {
    method: "PATCH",
    headers: {
      apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ domain_status: verified ? "connected" : "pending" }),
  });

  return res.status(200).json({
    verified,
    domain: clean,
    verificationRecords: vercelData.verification || [],
  });
}
