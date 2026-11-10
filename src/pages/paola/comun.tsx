import { useEffect } from "react";
import { Instagram as InstagramIcon } from "lucide-react";

export const WHATSAPP_NUMBER = "56971252179";
export const DOMINIO = "https://drapaolacardenasfica.com";

export const waLink = (texto: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(texto)}`;

export const UBICACION = {
  titulo: "Edificio Soho",
  direccion: "Av. Bosques de Montemar 30, Concón",
  busqueda: "Edificio Soho, Av. Bosques de Montemar 30, Concón, Chile",
};

/** "tratamiento de ojeras" -> "Tratamiento de Ojeras" (conectores en minúscula). */
const MENORES = new Set(["de", "del", "la", "las", "el", "los", "y", "o", "sobre", "en", "con", "a", "por", "para"]);
export function tc(texto: string) {
  return texto
    .split(" ")
    .map((w, i) => (i > 0 && MENORES.has(w.toLowerCase()) ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

export const SITE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Instrument+Sans:wght@400;500;600;700&display=swap');

  .pc-site {
    --pc-bg: #f0ebe5;
    --pc-bg-alt: #f0ebe5;
    --pc-text: #322C28;
    --pc-text-muted: #5A5148;
    --pc-text-subtle: #8C8378;
    --pc-text-alt: #8C7B62;
    --pc-dark: #727f89;
    --pc-on-dark: #F4F2EE;
    --pc-accent: #B89B6A;
    --pc-accent-hover: #A6884F;
    --pc-accent-light: #E3D3B4;
    background-color: var(--pc-bg);
    color: var(--pc-text);
    font-family: 'Instrument Sans', system-ui, sans-serif;
  }
  .pc-site h1, .pc-site h2, .pc-site h3, .pc-serif { font-family: 'Cormorant Garamond', serif; }
  @keyframes pc-ctaPulse {
    0%, 100% { transform: translateY(0); box-shadow: 0 14px 32px rgba(184,155,106,0.32); }
    50% { transform: translateY(-5px); box-shadow: 0 24px 48px rgba(184,155,106,0.46); }
  }
  @keyframes pc-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  @keyframes pc-waRipple {
    0%   { box-shadow: 0 10px 28px rgba(37,211,102,0.5), 0 0 0 0 rgba(37,211,102,0.55); }
    70%  { box-shadow: 0 10px 28px rgba(37,211,102,0.5), 0 0 0 16px rgba(37,211,102,0); }
    100% { box-shadow: 0 10px 28px rgba(37,211,102,0.5), 0 0 0 0 rgba(37,211,102,0); }
  }
  @keyframes pc-waBounce {
    0%, 82%, 100% { transform: translateY(0); }
    88% { transform: translateY(-7px); }
    94% { transform: translateY(0); }
    97% { transform: translateY(-3px); }
  }
  .pc-wa-btn { animation: pc-waRipple 2.4s ease-out infinite, pc-waBounce 3.2s ease-in-out infinite; }
  .pc-wa-btn:hover { animation-play-state: paused; }
  .pc-cta-pulse { animation: pc-ctaPulse 3.4s ease-in-out infinite; }
  .pc-marquee { animation: pc-marquee 42s linear infinite; }
  .pc-treat-marquee { animation: pc-marquee 32s linear infinite; }
  .pc-treat-marquee:hover { animation-play-state: paused; }
  .pc-marquee:hover { animation-play-state: paused; }
  .pc-title-marquee { animation: pc-marquee 60s linear infinite; }
  .pc-title-marquee:hover { animation-play-state: paused; }
  @media (prefers-reduced-motion: reduce) { .pc-title-marquee, .pc-treat-marquee, .pc-marquee { animation: none; } }
  .pc-reveal { opacity: 0; transform: translateY(30px); transition: opacity 1s cubic-bezier(.16,1,.3,1), transform 1s cubic-bezier(.16,1,.3,1); }
  .pc-reveal.pc-in { opacity: 1; transform: translateY(0); }
`;

/** Título, descripción, canónica e imagen para compartir (Google renderiza JS; WhatsApp usa el middleware). */
export function useMeta(m: { title: string; description: string; path: string; image?: string }) {
  useEffect(() => {
    document.title = m.title;
    const set = (attr: string, val: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${val}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, val); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    const url = DOMINIO + m.path;
    set("name", "description", m.description);
    set("name", "robots", "index, follow");
    set("property", "og:title", m.title);
    set("property", "og:description", m.description);
    set("property", "og:url", url);
    set("property", "og:type", "website");
    set("property", "og:site_name", "Dra. Paola Cárdenas Fica");
    if (m.image) set("property", "og:image", DOMINIO + m.image);
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement("link") as HTMLLinkElement; canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = url;
  }, [m.title, m.description, m.path, m.image]);
}

/* ───────────────────── Texto con formato (tipo Markdown simple) ───────────────────── */

function inline(s: string, oscuro = false): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push(s.slice(last, m.index));
    out.push(<strong key={k++} style={{ fontWeight: 600, color: oscuro ? "#F4F2EE" : "#322C28" }}>{m[1]}</strong>);
    last = m.index + m[0].length;
  }
  if (last < s.length) out.push(s.slice(last));
  return out;
}

const reg = (s: string) =>
  s.split("®").flatMap((p, i, a) => (i < a.length - 1 ? [p, <sup key={i} style={{ fontSize: ".45em", verticalAlign: "1.1em", lineHeight: 0 }}>®</sup>] : [p]));

type Bloque =
  | { t: "h3"; v: string } | { t: "h4"; v: string } | { t: "p"; v: string } | { t: "alerta"; v: string }
  | { t: "ul"; v: string[] } | { t: "tabla"; v: string[][] } | { t: "opciones"; v: string[][] };

function parse(md: string): Bloque[] {
  const out: Bloque[] = [];
  const lines = md.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    if (!l) continue;
    if (l === ":::opciones") {
      const rows: string[][] = [];
      while (++i < lines.length && lines[i].trim() !== ":::") if (lines[i].trim()) rows.push(lines[i].split("|").map((c) => c.trim()));
      out.push({ t: "opciones", v: rows });
    } else if (l.startsWith("#### ")) out.push({ t: "h4", v: l.slice(5) });
    else if (l.startsWith("### ")) out.push({ t: "h3", v: l.slice(4) });
    else if (l.startsWith("- ")) {
      const prev = out[out.length - 1];
      if (prev && prev.t === "ul") prev.v.push(l.slice(2)); else out.push({ t: "ul", v: [l.slice(2)] });
    } else if (l.startsWith("|")) {
      if (/^\|[\s:|-]+\|?$/.test(l)) continue;
      const cells = l.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      const prev = out[out.length - 1];
      if (prev && prev.t === "tabla") prev.v.push(cells); else out.push({ t: "tabla", v: [cells] });
    } else if (l.startsWith("**Importante")) out.push({ t: "alerta", v: l });
    else out.push({ t: "p", v: l });
  }
  return out;
}

export function Contenido({ md, boton, nombre }: { md: string; boton?: string; nombre?: string }) {
  const bloques = parse(md);
  return (
    <div className="pc-md">
      {bloques.map((b, i) => {
        switch (b.t) {
          case "h3": return <h2 key={i} className="pc-md-h2">{reg(b.v)}</h2>;
          case "h4": return <h3 key={i} className="pc-md-h3">{reg(b.v)}</h3>;
          case "p": return <p key={i}>{inline(b.v)}</p>;
          case "alerta": return <p key={i} className="pc-md-alerta">{inline(b.v)}</p>;
          case "ul": return <ul key={i}>{b.v.map((x, j) => <li key={j}>{inline(x)}</li>)}</ul>;
          case "tabla": return (
            <div key={i} className="pc-md-tabla"><table>
              <thead><tr>{b.v[0].map((c, j) => <th key={j}>{reg(c)}</th>)}</tr></thead>
              <tbody>{b.v.slice(1).map((r, j) => <tr key={j}>{r.map((c, k) => (k === 0 ? <th key={k} scope="row">{inline(c)}</th> : <td key={k}>{inline(c)}</td>))}</tr>)}</tbody>
            </table></div>
          );
          case "opciones": return (
            <div key={i} className="pc-md-opciones" id="opciones">
              {b.v.map(([n, precio, desc], j) => (
                <article key={j} className="pc-md-opt">
                  <h3>{n}</h3>
                  <p>{inline(desc || "")}</p>
                  <div className="pc-md-opt-foot">
                    <span className={precio.toLowerCase().startsWith("consultar") ? "c" : ""}>{precio}</span>
                    <a href={waLink(`Hola Dra. Paola, quiero agendar ${nombre ?? ""} · ${n}.`)} target="_blank" rel="noreferrer">{boton ? "Agendar →" : "Agendar →"}</a>
                  </div>
                </article>
              ))}
            </div>
          );
        }
      })}
    </div>
  );
}

export const CONTENIDO_STYLES = `
  .pc-md p { margin: 0 0 16px; font-size: 15.5px; line-height: 1.8; color: #5A5148; text-wrap: pretty; }
  .pc-md-h2 { margin: clamp(40px,6vh,60px) 0 16px; padding-top: clamp(28px,4vh,40px); border-top: 1px solid rgba(50,44,40,.1); font-weight: 400; font-size: clamp(28px,2.6vw,40px); line-height: 1.1; letter-spacing: -.015em; color: #322C28; }
  .pc-md-h3 { margin: 26px 0 8px; font-family: 'Instrument Sans', sans-serif !important; font-size: 12px; font-weight: 700; letter-spacing: .22em; text-transform: uppercase; color: #B89B6A; }
  .pc-md ul { margin: 0 0 18px; padding: 0; list-style: none; }
  .pc-md li { position: relative; padding: 6px 0 6px 22px; font-size: 15.5px; line-height: 1.7; color: #5A5148; }
  .pc-md li::before { content: '—'; position: absolute; left: 0; color: #B89B6A; }
  .pc-md .pc-md-alerta { margin: 22px 0; padding: 18px 22px; border-left: 2px solid #B89B6A; border-radius: 0 12px 12px 0; background: rgba(184,155,106,.1); font-size: 14.5px; }
  .pc-md-tabla { margin: 8px 0 22px; overflow-x: auto; border: 1px solid rgba(50,44,40,.1); border-radius: 14px; background: #fff; }
  .pc-md-tabla table { width: 100%; min-width: 520px; border-collapse: collapse; font-size: 14px; line-height: 1.5; }
  .pc-md-tabla th, .pc-md-tabla td { padding: 13px 16px; text-align: left; vertical-align: top; border-top: 1px solid rgba(50,44,40,.1); }
  .pc-md-tabla thead th { border-top: 0; background: #727f89; color: #F4F2EE; font-family: 'Cormorant Garamond', serif; font-weight: 400; font-size: 20px; }
  .pc-md-tabla thead th:first-child { font-family: 'Instrument Sans', sans-serif; font-size: 10px; letter-spacing: .22em; text-transform: uppercase; color: #E3D3B4; vertical-align: middle; }
  .pc-md-tabla tbody th { font-weight: 600; color: #322C28; width: 28%; }
  .pc-md-tabla td { color: #5A5148; }
  .pc-md-tabla tbody tr:nth-child(even) { background: rgba(240,235,229,.6); }
  .pc-md-opciones { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 14px; margin: 10px 0 20px; scroll-margin-top: 100px; }
  .pc-md-opt { display: flex; flex-direction: column; gap: 6px; background: #fff; border: 1px solid rgba(50,44,40,.1); border-radius: 16px; padding: 20px 22px 16px; }
  .pc-md-opt h3 { margin: 0; font-weight: 400; font-size: 25px; line-height: 1.1; color: #322C28; font-variant-numeric: lining-nums; }
  .pc-md .pc-md-opt p { margin: 0; font-size: 13.5px; line-height: 1.55; }
  .pc-md-opt-foot { margin-top: auto; padding-top: 14px; border-top: 1px solid rgba(50,44,40,.1); display: flex; justify-content: space-between; align-items: center; gap: 10px; }
  .pc-md-opt-foot span { font-weight: 600; font-size: 19px; color: #322C28; }
  .pc-md-opt-foot span.c { font-size: 13px; letter-spacing: .14em; text-transform: uppercase; color: #8C7B62; }
  .pc-md-opt-foot a { font-size: 10.5px; font-weight: 600; letter-spacing: .18em; text-transform: uppercase; color: #B89B6A; white-space: nowrap; }
  @media (max-width: 560px) { .pc-md-opciones { gap: 10px; } .pc-md-opt { padding: 14px; } .pc-md-opt h3 { font-size: 21px; } .pc-md-opt-foot { flex-direction: column; align-items: flex-start; gap: 6px; } }
`;

/* ───────────────────── Pie de página (patrón PCF + panel + mapa) ───────────────────── */

export function Footer({ base = "" }: { base?: string }) {
  const q = encodeURIComponent(UBICACION.busqueda);
  const gmaps = `https://www.google.com/maps/search/?api=1&query=${q}`;
  const waze = `https://waze.com/ul?q=${q}&navigate=yes`;
  const label = { fontWeight: 600, letterSpacing: "0.26em", color: "#B89B6A", fontSize: 10, textTransform: "uppercase" as const };
  return (
    <footer style={{ background: "#f0ebe5 url('/footer-patron.jpg') repeat", backgroundSize: "1000px auto", borderTop: "1px solid rgba(50,44,40,0.12)", padding: "clamp(28px,5vh,60px) clamp(14px,4.5vw,80px)" }}>
      <div className="mx-auto" style={{ maxWidth: 1320, background: "#f0ebe5", border: "1px solid rgba(50,44,40,0.10)", borderRadius: 24, boxShadow: "0 24px 60px rgba(50,44,40,0.08)", padding: "clamp(26px,4vh,44px) clamp(22px,3.5vw,52px) 20px" }}>
        <div className="flex flex-wrap justify-between" style={{ gap: "clamp(24px,3vw,48px)" }}>
          <div style={{ maxWidth: 420 }}>
            <img src="/logo-firma.png" alt="Dra. Paola Cárdenas Fica" style={{ height: "clamp(90px,10vw,130px)", width: "auto", marginLeft: "-12px", mixBlendMode: "multiply" }} />
            <p className="mt-1 text-[13px]" style={{ color: "#8C8378" }}>Cirujana Dentista · Especialista en Implantología Bucomaxilofacial</p>
            <div className="mt-4 flex gap-3">
              <a href="https://www.instagram.com/dra.cardenasfica/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full text-[11px] uppercase" style={{ padding: "11px 20px", border: "1px solid rgba(50,44,40,0.18)", letterSpacing: "0.18em" }}>
                <InstagramIcon className="h-3.5 w-3.5" /> Instagram
              </a>
            </div>
          </div>
          <div>
            <h4 style={label}>Navegación</h4>
            <ul className="mt-4 space-y-2 text-sm" style={{ color: "#5A5148" }}>
              <li><a href={`${base}#filosofia`}>Filosofía</a></li>
              <li><a href={`${base}#tratamientos`}>Tratamientos</a></li>
              <li><a href={`${base}#resultados`}>Antes y después</a></li>
              <li><a href={`${base}#dra`}>Quién soy</a></li>
              <li><a href={`${base}#testimonios`}>Reseñas</a></li>
            </ul>
          </div>
          <div>
            <h4 style={label}>Consulta</h4>
            <ul className="mt-4 space-y-2 text-sm" style={{ color: "#5A5148" }}>
              <li>Lunes a viernes · 09:00 – 19:00</li>
              <li><a href={`${base}#agenda`}>Agenda online</a></li>
              <li><a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer">+56 9 7125 2179</a></li>
            </ul>
          </div>
          <div className="flex flex-col" style={{ gap: 10, flex: "1 1 260px", maxWidth: 340 }}>
            <h4 style={label}>Ubicación</h4>
            <a href={gmaps} target="_blank" rel="noreferrer" aria-label="Ver en Google Maps" className="block relative overflow-hidden" style={{ aspectRatio: "16/7", borderRadius: 12, background: "#E5DFD6", border: "1px solid rgba(50,44,40,0.12)" }}>
              <iframe src={`https://www.google.com/maps?q=${q}&z=16&output=embed`} title={`Mapa: ${UBICACION.titulo}, ${UBICACION.direccion}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 w-full h-full" style={{ border: 0, filter: "grayscale(0.55) sepia(0.12) contrast(1.02)" }} />
            </a>
            <p className="text-sm" style={{ color: "#5A5148", lineHeight: 1.6 }}><span style={{ color: "#322C28", fontWeight: 500 }}>{UBICACION.titulo}</span><br />{UBICACION.direccion}</p>
            <div className="flex flex-wrap" style={{ gap: 20 }}>
              <a href={gmaps} target="_blank" rel="noreferrer" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#8C7B62" }}>Cómo llegar →</a>
              <a href={waze} target="_blank" rel="noreferrer" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#8C7B62" }}>Waze →</a>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between text-[11px] uppercase" style={{ marginTop: "clamp(22px,3vh,32px)", paddingTop: 16, borderTop: "1px solid rgba(50,44,40,0.12)", letterSpacing: "0.16em", color: "#8C8378" }}>
          <p>© {new Date().getFullYear()} Dra. Paola Cárdenas Fica</p>
          <div className="flex gap-6 items-center">
            <a href="/politica-de-privacidad">Política de privacidad</a>
            <p style={{ opacity: 0.7 }}>Powered by Somaos</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function WhatsAppButton() {
  return (
    <a
      href={waLink("Hola Dra. Paola, tengo una consulta.")}
      target="_blank" rel="noreferrer"
      className="pc-wa-btn fixed z-[70] inline-flex items-center gap-2 rounded-full transition-transform hover:-translate-y-1 hover:scale-105"
      style={{ right: "clamp(16px,2.4vw,34px)", bottom: "clamp(20px,4vh,40px)", background: "#25D366", color: "#fff", padding: "15px 22px" }}
    >
      <svg viewBox="0 0 24 24" className="h-[19px] w-[19px]" fill="currentColor">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.2h.01c5.46 0 9.9-4.45 9.9-9.91S17.5 2 12.04 2Zm5.8 14.16c-.24.68-1.4 1.32-1.93 1.4-.5.08-1.11.11-1.79-.11a16 16 0 0 1-1.63-.6c-2.87-1.24-4.74-4.15-4.88-4.35-.14-.19-1.17-1.56-1.17-2.98s.72-2.1 1-2.4c.24-.24.53-.3.71-.3l.5.01c.16 0 .38-.06.6.46.24.57.79 1.98.86 2.12.07.14.12.31.02.5-.09.19-.14.31-.28.47-.14.17-.29.37-.42.5-.14.14-.29.29-.12.57.16.28.72 1.19 1.55 1.93 1.07.95 1.97 1.25 2.25 1.39.28.14.44.12.6-.07.16-.19.69-.8.88-1.08.19-.28.37-.23.62-.14.26.09 1.63.77 1.91.91.28.14.47.21.54.33.07.12.07.68-.17 1.35Z" />
      </svg>
      <span className="text-xs font-bold uppercase" style={{ letterSpacing: "0.14em" }}>WhatsApp</span>
    </a>
  );
}
