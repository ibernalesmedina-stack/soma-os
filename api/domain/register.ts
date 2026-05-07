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

  // 1. Add domain to Vercel project
  const vercelRes = await fetch(
    `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/domains`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: clean }),
    },
  );

  const vercelData = await vercelRes.json();

  if (!vercelRes.ok && vercelData.error?.code !== "domain_already_in_use") {
    console.error("Vercel domain add failed:", vercelData);
    return res.status(500).json({ error: vercelData.error?.message || "Could not register domain" });
  }

  // 2. Save domain to Supabase
  await fetch(`${SUPABASE_URL}/rest/v1/client_integrations?user_id=eq.${userId}`, {
    method: "PATCH",
    headers: {
      apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ dominio: clean, domain_status: "pending" }),
  });

  return res.status(200).json({
    ok: true,
    domain: clean,
    dns: [
      { type: "A",     name: "@",   value: "76.76.21.21" },
      { type: "CNAME", name: "www", value: "cname.vercel-dns.com" },
    ],
  });
}
