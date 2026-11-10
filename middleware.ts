import { TRATAMIENTOS } from "./src/pages/paola/datos";

export const config = {
  matcher: ["/", "/tratamientos/:path*", "/politica-de-privacidad"],
};

type Meta = { title: string; description: string; image: string };

const PAOLA = "https://drapaolacardenasfica.com";
const PAOLA_HOSTS = new Set(["drapaolacardenasfica.com", "www.drapaolacardenasfica.com"]);

/** Título/descripción/imagen por página del sitio de la Dra. Paola (vista previa en WhatsApp, Google, etc.). */
function paolaMeta(pathname: string): Meta | undefined {
  if (pathname === "/" || pathname === "") {
    return {
      title: "Dra. Paola Cárdenas Fica · Implantología, Odontología y Estética Facial",
      description: "Cirujana Dentista especialista en Implantología Bucomaxilofacial. Implantes, odontología general y estética facial en Edificio Soho, Concón. Agenda tu evaluación.",
      image: `${PAOLA}/paola-hero.png`,
    };
  }
  if (/^\/politica-de-privacidad\/?$/.test(pathname)) {
    return {
      title: "Política de privacidad | Dra. Paola Cárdenas Fica",
      description: "Cómo recopilamos, usamos y protegemos tus datos personales en el sitio de la Dra. Paola Cárdenas Fica.",
      image: `${PAOLA}/paola-hero.png`,
    };
  }
  const m = pathname.match(/^\/tratamientos\/([a-z0-9-]+)\/?$/);
  const t = m ? TRATAMIENTOS[m[1]] : undefined;
  if (!t) return undefined;
  return {
    title: `${t.seoTitle} | Dra. Paola Cárdenas Fica`,
    description: t.seoDesc,
    image: `${PAOLA}${t.img ?? "/paola-hero.png"}`,
  };
}

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
  // Si algo falla aquí, se sirve la página normal (nunca bloquear el sitio por la vista previa)
  try {
    return await conMeta(request);
  } catch {
    return undefined;
  }
}

async function conMeta(request: Request): Promise<Response | undefined> {
  const url = new URL(request.url);
  const hostname = url.hostname;
  const meta: Meta | undefined = PAOLA_HOSTS.has(hostname)
    ? paolaMeta(url.pathname)
    : url.pathname === "/" ? DOMAIN_META[hostname] : undefined;

  if (!meta) return undefined;

  // Fetch from canonical Vercel URL to avoid loop
  const canonicalUrl = new URL(request.url);
  canonicalUrl.hostname = "somaos-react.vercel.app";

  const response = await fetch(canonicalUrl.toString());
  if (!response.ok) return undefined;

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) return response as unknown as Response;

  let html = await response.text();

  const esc = (v: string) => v.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  const t = esc(meta.title), d = esc(meta.description), img = esc(meta.image);
  html = html
    .replace(/<title>[^<]*<\/title>/, () => `<title>${t}</title>`)
    .replace(/property="og:title" content="[^"]*"/, () => `property="og:title" content="${t}"`)
    .replace(/property="og:description" content="[^"]*"/, () => `property="og:description" content="${d}"`)
    .replace(/property="og:image" content="[^"]*"/, () => `property="og:image" content="${img}"`)
    .replace(/name="twitter:title" content="[^"]*"/, () => `name="twitter:title" content="${t}"`)
    .replace(/name="twitter:description" content="[^"]*"/, () => `name="twitter:description" content="${d}"`)
    .replace(/name="twitter:image" content="[^"]*"/, () => `name="twitter:image" content="${img}"`)
    .replace(/name="description" content="[^"]*"/, () => `name="description" content="${d}"`);

  return new Response(html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
}
