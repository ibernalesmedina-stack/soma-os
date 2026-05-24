export const config = {
  matcher: "/",
};

const DOMAIN_META: Record<string, { title: string; description: string; image: string }> = {
  "elliotnutrition.com": {
    title: "Elliot Nutrition — Nutricionista",
    description: "Atención nutricional personalizada. Reserva tu consulta en línea.",
    image: "https://www.elliotnutrition.com/logo-elliot-nutri.svg",
  },
  "www.elliotnutrition.com": {
    title: "Elliot Nutrition — Nutricionista",
    description: "Atención nutricional personalizada. Reserva tu consulta en línea.",
    image: "https://www.elliotnutrition.com/logo-elliot-nutri.svg",
  },
};

export default async function middleware(request: Request): Promise<Response | undefined> {
  const hostname = new URL(request.url).hostname;
  const meta = DOMAIN_META[hostname];

  if (!meta) return undefined;

  // Fetch from canonical Vercel URL to avoid loop
  const canonicalUrl = new URL(request.url);
  canonicalUrl.hostname = "somaos-react.vercel.app";

  const response = await fetch(canonicalUrl.toString());
  if (!response.ok) return undefined;

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) return response as unknown as Response;

  let html = await response.text();

  html = html
    .replace(/<title>[^<]*<\/title>/, `<title>${meta.title}</title>`)
    .replace(/property="og:title" content="[^"]*"/, `property="og:title" content="${meta.title}"`)
    .replace(/property="og:description" content="[^"]*"/, `property="og:description" content="${meta.description}"`)
    .replace(/property="og:image" content="[^"]*"/, `property="og:image" content="${meta.image}"`)
    .replace(/name="twitter:title" content="[^"]*"/, `name="twitter:title" content="${meta.title}"`)
    .replace(/name="twitter:description" content="[^"]*"/, `name="twitter:description" content="${meta.description}"`)
    .replace(/name="twitter:image" content="[^"]*"/, `name="twitter:image" content="${meta.image}"`)
    .replace(/name="description" content="[^"]*"/, `name="description" content="${meta.description}"`);

  return new Response(html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
}
