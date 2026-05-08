import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { formatCLP } from "@/lib/format";
import { Clock } from "lucide-react";
import type { SiteTheme, LandingConfig } from "@/lib/types";
import { DEFAULT_THEME, DEFAULT_LANDING } from "@/lib/types";

interface Perfil {
  name: string;
  business_name: string;
  tipo_negocio: string;
  whatsapp_number: string;
  theme: Partial<SiteTheme> | null;
  landing_config: Partial<LandingConfig> | null;
}

interface Servicio {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_min: number;
  active: boolean;
}

const FONT_URLS: Record<string, string> = {
  instrument: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600&display=swap",
  playfair:   "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap",
  montserrat: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap",
  lato:       "https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap",
};

const FONT_STACK: Record<string, string> = {
  instrument: "'Geist', ui-sans-serif, system-ui, sans-serif",
  inter:      "'Inter', sans-serif",
  playfair:   "'Playfair Display', serif",
  montserrat: "'Montserrat', sans-serif",
  lato:       "'Lato', sans-serif",
};

const SERIF_STACK: Record<string, string> = {
  instrument: "'Instrument Serif', 'Times New Roman', serif",
  playfair:   "'Playfair Display', serif",
  inter:      "inherit",
  montserrat: "inherit",
  lato:       "inherit",
};

const RADII: Record<string, string> = {
  none: "0px", sm: "4px", md: "8px", lg: "16px", full: "9999px",
};

const TIPO_LABEL: Record<string, string> = {
  nutricionista: "Nutricionista", cosmetologa: "Cosmetóloga",
  odontologa: "Odontóloga", psicologa: "Psicóloga",
};

function Wave({ fromColor, toColor }: { fromColor: string; toColor: string }) {
  return (
    <svg viewBox="0 0 1440 70" preserveAspectRatio="none"
      style={{ display: "block", width: "100%", height: 56, marginTop: -1, marginBottom: -1, background: fromColor }}>
      <path d="M0,35 C180,70 360,0 540,35 C720,70 900,0 1080,35 C1260,70 1380,18 1440,35 L1440,70 L0,70 Z" fill={toColor} />
    </svg>
  );
}

function loadFont(font: string) {
  if (!FONT_URLS[font]) return;
  const existing = document.querySelector(`link[data-soma-font="${font}"]`);
  if (existing) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = FONT_URLS[font];
  link.setAttribute("data-soma-font", font);
  document.head.appendChild(link);
}

export default function Sitio() {
  const { userId } = useParams<{ userId: string }>();
  const [perfil, setPerfil]     = useState<Perfil | null>(null);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [resolvedId, setResolvedId] = useState<string | null>(userId ?? null);

  // Custom domain detection
  useEffect(() => {
    const hostname = window.location.hostname;
    const isMain = hostname.includes("vercel.app") || hostname === "localhost" || hostname.includes("somaos");
    if (!isMain && !userId) {
      supabase.from("client_integrations").select("user_id").eq("dominio", hostname).single()
        .then(({ data }) => { if (data?.user_id) setResolvedId(data.user_id); else setNotFound(true); });
    }
  }, []);

  const loadData = async (uid: string) => {
    const [{ data: p }, { data: s }] = await Promise.all([
      supabase.from("perfiles").select("name, business_name, tipo_negocio, whatsapp_number, theme, landing_config").eq("id", uid).single(),
      supabase.from("servicios").select("id, name, description, price, duration_min, active").eq("user_id", uid).eq("active", true).order("created_at"),
    ]);
    if (!p) { setNotFound(true); setLoading(false); return; }
    setPerfil(p as Perfil);
    setServicios((s ?? []) as Servicio[]);
    setLoading(false);
    const font = (p.theme as any)?.font || "inter";
    loadFont(font);
  };

  useEffect(() => {
    if (!resolvedId) return;
    loadData(resolvedId);
    const ch = supabase.channel(`sitio-${resolvedId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "servicios", filter: `user_id=eq.${resolvedId}` }, () => loadData(resolvedId))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [resolvedId]);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 24, height: 24, borderRadius: "50%", border: "2px solid #474511", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (notFound || !perfil) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, textAlign: "center", padding: 24 }}>
      <div style={{ fontSize: 48 }}>🔍</div>
      <h1 style={{ fontSize: 20, fontWeight: 600 }}>Negocio no encontrado</h1>
      <p style={{ fontSize: 14, opacity: 0.6 }}>El link que seguiste no corresponde a ningún negocio activo.</p>
    </div>
  );

  const theme   = { ...DEFAULT_THEME,   ...(perfil.theme          ?? {}) } as SiteTheme & { font: string };
  const landing = { ...DEFAULT_LANDING, ...(perfil.landing_config ?? {}) } as LandingConfig;

  const serif  = SERIF_STACK[theme.font]  || SERIF_STACK.inter;
  const sans   = FONT_STACK[theme.font]   || FONT_STACK.inter;
  const radius = RADII[theme.borderRadius] || "16px";

  const heroTitle    = landing.heroTitle    || perfil.business_name;
  const heroSubtitle = landing.heroSubtitle || perfil.name;
  const ctaText      = landing.ctaText      || "Agendar consulta";
  const waNumber     = landing.whatsapp || perfil.whatsapp_number || "";
  const waBase       = waNumber ? `https://wa.me/${waNumber.replace(/\D/g, "")}` : null;
  const waUrl        = waBase ? `${waBase}?text=${encodeURIComponent("Hola! Me gustaría agendar una consulta.")}` : null;

  const p  = theme.primaryColor;   // #474511
  const bg = theme.bgColor;        // #f6f6ea
  const ac = theme.accentColor;    // #deeca0
  const gold = "#dba22d";

  return (
    <div style={{ fontFamily: sans, background: bg, color: p, minHeight: "100vh", overflowX: "hidden" }}>

      {/* ── NAV ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 40, background: bg, backdropFilter: "blur(12px)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "12px clamp(20px,4vw,56px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
          <span style={{ fontFamily: serif, fontSize: "clamp(22px,2vw,28px)", fontWeight: 400, letterSpacing: "-0.02em" }}>{perfil.business_name}</span>
          <nav style={{ display: "flex", gap: 24, fontSize: 15, fontWeight: 600 }}>
            {landing.showAbout && <a href="#sobre" style={{ color: p, opacity: 0.75, textDecoration: "none" }}>Sobre mí</a>}
            {servicios.length > 0 && <a href="#servicios" style={{ color: p, opacity: 0.75, textDecoration: "none" }}>Servicios</a>}
            {landing.testimonials?.length > 0 && <a href="#reseñas" style={{ color: p, opacity: 0.75, textDecoration: "none" }}>Reseñas</a>}
          </nav>
          {waUrl && (
            <a href={waUrl} target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 999, background: gold, color: bg, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>
              {ctaText}
            </a>
          )}
        </div>
      </header>

      <Wave fromColor={bg} toColor={p} />

      {/* ── HERO ── */}
      <section id="hero" style={{ background: p, padding: "clamp(48px,7vw,96px) clamp(20px,4vw,56px) clamp(48px,6vw,80px)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: "clamp(32px,5vw,80px)", alignItems: "end" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", padding: "6px 14px", borderRadius: 999, background: "rgba(246,246,234,0.15)", border: "1px solid rgba(246,246,234,0.2)", color: ac, marginBottom: 24, fontFamily: "monospace" }}>
              {TIPO_LABEL[perfil.tipo_negocio] ?? perfil.tipo_negocio}
            </div>
            <h1 style={{ fontFamily: serif, fontSize: "clamp(48px,7vw,84px)", lineHeight: 0.95, letterSpacing: "-0.035em", color: bg, fontWeight: 400, margin: "0 0 28px" }}>
              {heroTitle}
            </h1>
            {heroSubtitle && <p style={{ fontSize: 17, lineHeight: 1.55, color: "rgba(246,246,234,0.88)", maxWidth: "46ch", margin: "0 0 32px" }}>{heroSubtitle}</p>}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {waUrl && (
                <a href={waUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 24px", borderRadius: 999, background: ac, color: "#3b5345", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>
                  {ctaText}
                </a>
              )}
            </div>
          </div>
          {landing.heroImageUrl ? (
            <div style={{ position: "relative", aspectRatio: "4/5", borderRadius: "180px 180px 24px 24px", overflow: "hidden", maxWidth: 480, marginLeft: "auto", width: "100%" }}>
              <img src={landing.heroImageUrl} alt={perfil.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 20%" }} />
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "32px 0" }}>
              {["Atención personalizada", "Enfoque realista", "Acompañamiento cercano"].map(t => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 12, color: "rgba(246,246,234,0.7)", fontSize: 14, fontFamily: "monospace", letterSpacing: "0.04em" }}>
                  <span style={{ width: 20, height: 1, background: "currentColor", opacity: 0.5, flexShrink: 0, display: "inline-block" }} />
                  {t}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── ABOUT ── */}
      {landing.showAbout && landing.aboutText && (
        <>
          <Wave fromColor={p} toColor={bg} />
          <section id="sobre" style={{ background: bg, padding: "clamp(60px,8vw,120px) clamp(20px,4vw,56px)" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "clamp(40px,6vw,100px)", alignItems: "start" }}>
              <div style={{ aspectRatio: "4/5", borderRadius: 24, overflow: "hidden", background: ac }}>
                {landing.heroImageUrl
                  ? <img src={landing.heroImageUrl} alt={perfil.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 35%" }} />
                  : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.3, fontSize: 48 }}>🌿</div>
                }
              </div>
              <div>
                <span style={{ color: gold, fontSize: 15, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 28 }}>Sobre mí</span>
                <h2 style={{ fontFamily: serif, fontSize: "clamp(36px,4.5vw,56px)", lineHeight: 1.02, letterSpacing: "-0.03em", margin: "0 0 28px" }}>
                  Nutrición que se <em style={{ fontStyle: "italic", opacity: 0.75 }}>adapta</em> a ti.
                </h2>
                <p style={{ fontSize: 17, lineHeight: 1.65, opacity: 0.85, maxWidth: "52ch", margin: "0 0 18px" }}>{landing.aboutText}</p>
                {landing.aboutQuote && (
                  <>
                    <p style={{ fontFamily: serif, fontStyle: "italic", fontSize: 22, lineHeight: 1.35, margin: "24px 0 8px" }}>"{landing.aboutQuote}"</p>
                    <p style={{ fontSize: 15, fontWeight: 500, opacity: 0.7 }}>— {perfil.name}</p>
                  </>
                )}
                {waUrl && (
                  <a href={waUrl} target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-flex", marginTop: 28, padding: "14px 24px", borderRadius: 999, background: gold, color: bg, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>
                    Agenda tu consulta
                  </a>
                )}
              </div>
            </div>
          </section>
        </>
      )}

      {/* ── STATS ── */}
      {landing.stats?.length > 0 && (
        <>
          <Wave fromColor={landing.showAbout ? bg : p} toColor={ac} />
          <div style={{ background: ac, padding: "clamp(24px,3vw,40px) clamp(20px,4vw,56px)" }}>
            <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: `repeat(${landing.stats.length}, 1fr)`, gap: 24, textAlign: "center", justifyItems: "center" }}>
              {landing.stats.map((st, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                  <div style={{ fontFamily: serif, fontSize: "clamp(48px,6vw,80px)", lineHeight: 1, letterSpacing: "-0.035em", fontWeight: 400 }}>{st.value}</div>
                  <div style={{ fontFamily: "monospace", fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.8, fontWeight: 600 }}>{st.label}</div>
                </div>
              ))}
            </div>
          </div>
          <Wave fromColor={ac} toColor={bg} />
        </>
      )}

      {/* ── SERVICIOS ── */}
      {servicios.length > 0 && (
        <section id="servicios" style={{ background: bg, padding: "clamp(60px,8vw,120px) clamp(20px,4vw,56px)" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <h2 style={{ fontFamily: serif, fontSize: "clamp(32px,4vw,50px)", lineHeight: 1.1, letterSpacing: "-0.02em", fontWeight: 400, margin: "0 0 14px" }}>
                Servicios <em style={{ fontStyle: "italic", opacity: 0.75 }}>disponibles</em>
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
              {servicios.map((s) => (
                <div key={s.id} style={{ background: "#fff", borderRadius: 20, padding: "28px 24px", display: "flex", flexDirection: "column", minHeight: 280, border: `1px solid rgba(71,69,17,0.12)`, position: "relative", overflow: "visible", paddingTop: 48 }}>
                  <div style={{ position: "absolute", top: -28, left: "50%", transform: "translateX(-50%)", width: 56, height: 72, borderRadius: 999, background: ac, display: "grid", placeItems: "center", boxShadow: "0 8px 24px -12px rgba(71,69,17,0.4)" }}>
                    <Clock style={{ width: 24, height: 24, color: p }} />
                  </div>
                  <h3 style={{ fontFamily: serif, fontSize: 26, lineHeight: 1.05, letterSpacing: "-0.02em", margin: "6px 0 10px", textAlign: "center" }}>{s.name}</h3>
                  {s.description && <p style={{ fontSize: 15, opacity: 0.8, lineHeight: 1.55, margin: 0, textAlign: "center", flex: 1 }}>{s.description}</p>}
                  <div style={{ marginTop: "auto", paddingTop: 20, borderTop: `1px dashed rgba(71,69,17,0.18)`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: serif, fontSize: 28, fontWeight: 600 }}>{formatCLP(s.price)}</span>
                    <span style={{ fontFamily: "monospace", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.6 }}>{s.duration_min} min</span>
                  </div>
                  {waBase && (
                    <a href={`${waBase}?text=${encodeURIComponent(`Hola! Me gustaría agendar: ${s.name}`)}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, padding: "12px 16px", background: p, color: bg, borderRadius: 12, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>
                      <span>Agenda tu consulta</span><span>→</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── TESTIMONIOS ── */}
      {landing.testimonials?.length > 0 && (
        <>
          <Wave fromColor={bg} toColor={p} />
          <section id="reseñas" style={{ background: p, padding: "clamp(48px,6vw,80px) clamp(20px,4vw,56px)" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: 40 }}>
                <h2 style={{ fontFamily: serif, fontSize: "clamp(28px,3.2vw,42px)", color: bg, fontWeight: 400, margin: "0 0 10px", letterSpacing: "-0.02em" }}>
                  Lo que dicen <em style={{ fontStyle: "italic", opacity: 0.8 }}>mis pacientes</em>
                </h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
                {landing.testimonials.map((t, i) => (
                  <div key={i} style={{ background: "#fff", borderRadius: 18, padding: "18px 16px", display: "flex", flexDirection: "column" }}>
                    <div style={{ fontSize: 18, marginBottom: 10, color: "#f7cb96", letterSpacing: "0.15em" }}>★ ★ ★ ★ ★</div>
                    <p style={{ fontFamily: serif, fontSize: 14, lineHeight: 1.55, color: "#403c01", margin: 0, flex: 1 }}>"{t.text}"</p>
                    <div style={{ marginTop: "auto", paddingTop: 14, borderTop: "1px solid rgba(64,60,1,0.15)", display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 999, background: "#f7cb96", color: "#403c01", display: "grid", placeItems: "center", fontFamily: serif, fontSize: 12, flexShrink: 0 }}>
                        {t.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div style={{ fontSize: 12.5, fontWeight: 500, color: "#403c01" }}>{t.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <Wave fromColor={p} toColor={bg} />
        </>
      )}

      {/* ── CTA FINAL ── */}
      {waUrl && (
        <section style={{ background: bg, padding: "clamp(48px,6vw,80px) clamp(20px,4vw,56px)", textAlign: "center" }}>
          <div style={{ maxWidth: 560, margin: "0 auto", padding: "36px 32px", borderRadius: 24, background: p, color: bg, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 80% at 20% 20%, rgba(222,236,160,0.18) 0%, transparent 60%), radial-gradient(50% 70% at 80% 80%, rgba(219,162,45,0.15) 0%, transparent 60%)`, pointerEvents: "none" }} />
            <h2 style={{ fontFamily: serif, fontSize: "clamp(24px,3vw,36px)", lineHeight: 1.1, letterSpacing: "-0.02em", margin: "0 0 8px", fontWeight: 400, position: "relative" }}>
              ¿Lista para empezar?
            </h2>
            <p style={{ color: "rgba(246,246,234,0.85)", margin: "0 0 22px", fontSize: 15, position: "relative" }}>
              Escríbeme por WhatsApp y te oriento sin compromiso.
            </p>
            <a href={waUrl} target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "14px 26px", borderRadius: 999, background: "#25D366", color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none", position: "relative" }}>
              <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Hablar por WhatsApp
            </a>
          </div>
        </section>
      )}

      {/* ── INSTAGRAM ── */}
      {landing.showInstagram && landing.instagram && (
        <section style={{ background: bg, padding: "clamp(40px,5vw,64px) clamp(20px,4vw,56px)", textAlign: "center" }}>
          <span style={{ fontFamily: "monospace", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: gold, fontWeight: 600 }}>Instagram</span>
          <h2 style={{ fontFamily: serif, fontSize: "clamp(28px,3.5vw,44px)", margin: "12px 0 28px", fontWeight: 400 }}>
            Sígueme en <em style={{ fontStyle: "italic" }}>{landing.instagram}</em>
          </h2>
          <a href={`https://instagram.com/${landing.instagram.replace("@", "")}`}
            target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 999, border: `1.5px solid ${p}`, fontSize: 14, fontWeight: 500, color: p, textDecoration: "none" }}>
            Ver perfil completo →
          </a>
        </section>
      )}

      <Wave fromColor={bg} toColor={gold} />

      {/* ── FOOTER ── */}
      <footer style={{ background: gold, color: bg, padding: "48px clamp(20px,4vw,56px) 28px" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 40, marginBottom: 40 }}>
            <div>
              <h3 style={{ fontFamily: serif, fontSize: 32, lineHeight: 1, letterSpacing: "-0.02em", margin: "0 0 12px", fontWeight: 400 }}>{perfil.business_name}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.55, opacity: 0.9, maxWidth: "32ch", margin: "0 0 20px" }}>{perfil.name} · {TIPO_LABEL[perfil.tipo_negocio]}</p>
              {waUrl && <a href={waUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", padding: "10px 16px", borderRadius: 999, border: "1px solid rgba(246,246,234,0.6)", color: bg, fontSize: 12, textDecoration: "none" }}>WhatsApp ↗</a>}
            </div>
            <div>
              <h4 style={{ fontFamily: "monospace", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", margin: "0 0 16px", fontWeight: 600 }}>Servicios</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {servicios.slice(0, 4).map(s => (
                  <li key={s.id}><a href="#servicios" style={{ color: bg, opacity: 0.85, textDecoration: "none", fontSize: 14 }}>{s.name}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 style={{ fontFamily: "monospace", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", margin: "0 0 16px", fontWeight: 600 }}>Contacto</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10, fontSize: 14, opacity: 0.85 }}>
                {waNumber && <li><a href={waUrl ?? "#"} style={{ color: bg, textDecoration: "none" }}>{waNumber}</a></li>}
                {landing.instagram && <li><a href={`https://instagram.com/${landing.instagram.replace("@","")}`} target="_blank" rel="noopener noreferrer" style={{ color: bg, textDecoration: "none" }}>{landing.instagram}</a></li>}
              </ul>
            </div>
          </div>
          <div style={{ paddingTop: 24, borderTop: "1px solid rgba(246,246,234,0.3)", display: "flex", justifyContent: "space-between", fontFamily: "monospace", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>
            <span>© 2026 {perfil.business_name}</span>
            <span>Powered by SomaOS</span>
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 960px) {
          #hero > div { grid-template-columns: 1fr !important; }
          #sobre > div { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 700px) {
          nav { display: none !important; }
        }
        a { transition: opacity 0.2s; }
        a:hover { opacity: 0.8; }
      `}</style>
    </div>
  );
}
