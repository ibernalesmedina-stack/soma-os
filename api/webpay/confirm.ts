import type { VercelRequest, VercelResponse } from "@vercel/node";

const SUPABASE_URL = "https://fwxutchyumopwvertisd.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const TBK_BASE_PROD = "https://webpay3g.transbank.cl";
const TBK_BASE_INT  = "https://webpay3gint.transbank.cl";
const TBK_PATH = "/rswebpaytransaction/api/webpay/v1.2/transactions";

const TBK_MASTER_API_KEY = process.env.TRANSBANK_API_KEY || "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C";
const TBK_TEST_COMMERCE  = "597055555532";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  // token_ws comes from WebPay redirect (POST body) or our frontend
  const tokenWs = (req.body?.token_ws || req.body?.token) as string;
  const userId  = req.body?.userId as string;

  if (!tokenWs) return res.status(400).json({ error: "Missing token_ws" });

  // 1. Find the pago by webpay_token to get userId if not provided
  let resolvedUserId = userId;
  let pagoId: string | null = null;

  if (tokenWs) {
    const pagoRes = await fetch(
      `${SUPABASE_URL}/rest/v1/pagos?webpay_token=eq.${tokenWs}&select=id,user_id`,
      { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } },
    );
    const pagos = await pagoRes.json();
    if (pagos[0]) { resolvedUserId = pagos[0].user_id; pagoId = pagos[0].id; }
  }

  // 2. Load client's WebPay credentials
  const intRes = await fetch(
    `${SUPABASE_URL}/rest/v1/client_integrations?user_id=eq.${resolvedUserId}&select=webpay_merchant_code,webpay_api_key`,
    { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } },
  );
  const integrations = await intRes.json();
  const integration  = integrations[0];

  const commerceCode = integration?.webpay_merchant_code || TBK_TEST_COMMERCE;
  const apiKey       = TBK_MASTER_API_KEY;
  const isProduction = !!integration?.webpay_merchant_code;
  const tbkBase      = isProduction ? TBK_BASE_PROD : TBK_BASE_INT;

  // 3. Confirm transaction with Transbank
  const tbkRes = await fetch(`${tbkBase}${TBK_PATH}/${tokenWs}`, {
    method: "PUT",
    headers: {
      "Tbk-Api-Key-Id":     commerceCode,
      "Tbk-Api-Key-Secret": apiKey,
      "Content-Type":       "application/json",
    },
  });

  const tbkData = await tbkRes.json();

  // 4. Check result
  const approved = tbkData.response_code === 0;

  // 5. Update pago status in Supabase
  if (pagoId) {
    await fetch(`${SUPABASE_URL}/rest/v1/pagos?id=eq.${pagoId}`, {
      method: "PATCH",
      headers: {
        apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: approved ? "pagado" : "fallido",
        webpay_authorization_code: tbkData.authorization_code || "",
        webpay_transaction_date: tbkData.transaction_date || null,
      }),
    });
  }

  return res.status(200).json({
    approved,
    response_code:       tbkData.response_code,
    authorization_code:  tbkData.authorization_code,
    amount:              tbkData.amount,
    buy_order:           tbkData.buy_order,
    card_last_digits:    tbkData.card_detail?.card_number,
    pagoId,
  });
}
