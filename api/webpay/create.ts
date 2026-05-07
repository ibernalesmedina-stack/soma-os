import type { VercelRequest, VercelResponse } from "@vercel/node";

const SUPABASE_URL = "https://fwxutchyumopwvertisd.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const APP_URL = process.env.APP_URL || "https://somaos-react.vercel.app";

// Transbank endpoints
const TBK_BASE_PROD = "https://webpay3g.transbank.cl";
const TBK_BASE_INT  = "https://webpay3gint.transbank.cl";
const TBK_PATH = "/rswebpaytransaction/api/webpay/v1.2/transactions";

// Transbank integration test credentials (shared)
const TBK_TEST_COMMERCE = "597055555532";
const TBK_TEST_API_KEY  = "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { userId, pagoId, amount, description } = req.body as {
    userId: string;
    pagoId: string;
    amount: number;
    description?: string;
  };

  if (!userId || !pagoId || !amount) {
    return res.status(400).json({ error: "Missing userId, pagoId or amount" });
  }

  // 1. Load client's WebPay credentials
  const intRes = await fetch(
    `${SUPABASE_URL}/rest/v1/client_integrations?user_id=eq.${userId}&select=webpay_merchant_code,webpay_api_key,webpay_status`,
    { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } },
  );
  const integrations = await intRes.json();
  const integration = integrations[0];

  const commerceCode = integration?.webpay_merchant_code || TBK_TEST_COMMERCE;
  const apiKey       = integration?.webpay_api_key       || TBK_TEST_API_KEY;
  const isProduction = !!(integration?.webpay_merchant_code && integration?.webpay_api_key);
  const tbkBase      = isProduction ? TBK_BASE_PROD : TBK_BASE_INT;

  // 2. Create transaction
  const buyOrder  = `soma-${pagoId.slice(0, 20)}`;
  const sessionId = `sess-${userId.slice(0, 20)}`;
  const returnUrl = `${APP_URL}/app/pagos/webpay-return`;

  const tbkRes = await fetch(`${tbkBase}${TBK_PATH}`, {
    method: "POST",
    headers: {
      "Tbk-Api-Key-Id":     commerceCode,
      "Tbk-Api-Key-Secret": apiKey,
      "Content-Type":       "application/json",
    },
    body: JSON.stringify({ buy_order: buyOrder, session_id: sessionId, amount, return_url: returnUrl }),
  });

  const tbkData = await tbkRes.json();

  if (!tbkRes.ok || !tbkData.token) {
    console.error("WebPay create failed:", tbkData);
    return res.status(500).json({ error: tbkData.error_message || "WebPay error" });
  }

  // 3. Store token → pagoId mapping in Supabase for the confirm step
  await fetch(`${SUPABASE_URL}/rest/v1/pagos?id=eq.${pagoId}`, {
    method: "PATCH",
    headers: {
      apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ webpay_token: tbkData.token }),
  });

  return res.status(200).json({
    token: tbkData.token,
    url: tbkData.url,
    redirect: `${tbkData.url}?token_ws=${tbkData.token}`,
  });
}
