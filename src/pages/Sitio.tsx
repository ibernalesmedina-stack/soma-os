import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { formatCLP } from "@/lib/format";
import { Clock } from "lucide-react";

interface Theme {
  primaryColor?: string;
  bgColor?: string;
  cardBg?: string;
  textColor?: string;
  accentColor?: string;
  font?: string;
}

interface Landing {
  heroTitle?: string;
  heroSubtitle?: string;
  heroImageUrl?: string;
  ctaText?: string;
  aboutText?: string;
  aboutQuote?: string;
  showAbout?: boolean;
  instagram?: string;
  showInstagram?: boolean;
  whatsapp?: string;
  stats?: { value: string; label: string }[];
  testimonials?: { text: string; name: string }[];
}

interface Perfil {
  name: string;
  business_name: string;
  tipo_negocio: string;
  whatsapp_number: string;
  theme: Theme | null;
  landing_config: Landing | null;
}

interface Servicio {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_min: number;
}

const TIPO: Record<string, string> = {
  nutricionista: "Nutricionista",
  cosmetologa: "Cosmetóloga",
  odontologa: "Odontóloga",
  psicologa: "Psicóloga",
};

const FONTS: Record<string, string> = {
  instrument: "'Instrument Serif', serif",
  playfair: "'Playfair Display', serif",
  montserrat: "'Montserrat', sans-serif",
  lato: "'Lato', sans-serif",
  inter: "'Inter', sans-serif",
};

export default function Sitio() {
  const { userId } = useParams<{ userId: string }>();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [resolvedId, setResolvedId] = useState<string | null>(userId ?? null);

  useEffect(() => {
    const host = window.location.hostname;
    const isMain = host.includes("vercel.app") || host === "localhost" || host.includes("somaos");
    if (!isMain && !userId) {
      supabase.from("client_integrations").select("user_id").eq("dominio", host).single()
        .then(({ data }) => { data?.user_id ? setResolvedId(data.user_id) : setNotFound(true); });
    }
  }, []);

  const load = async (uid: string) => {
    const [{ data: p }, { data: s }] = await Promise.all([
      supabase.from("perfiles")
        .select("name, business_name, tipo_negocio, whatsapp_number, theme, landing_config")
        .eq("id", uid).single(),
      supabase.from("servicios")
        .select("id, name, description, price, duration_min")
        .eq("user_id", uid).eq("active", true).order("created_at"),
    ]);
    if (!p) { setNotFound(true); setLoading(false); return; }
    setPerfil(p as Perfil);
    setServicios((s ?? []) as Servicio[]);
    setLoading(false);

    // Load font if needed
    const font = (p as any).theme?.font;
    if (font && font !== "inter") {
      const urls: Record<string, string> = {
        instrument: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600&display=swap",
        playfair: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap",
        montserrat: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap",
        lato: "https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap",
      };
      if (urls[font] && !document.querySelector(`link[data-font="${font}"]`)) {
        const l = document.createElement("link");
        l.rel = "stylesheet"; l.href = urls[font];
        l.setAttribute("data-font", font);
        document.head.appendChild(l);
      }
    }
  };

  useEffect(() => {
    if (!resolvedId) return;
    load(resolvedId);
    const ch = supabase.channel(`sitio-${resolvedId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "servicios", filter: `user_id=eq.${resolvedId}` }, () => load(resolvedId))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [resolvedId]);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );

  if (notFound || !perfil) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, textAlign: "center", padding: 24 }}>
      <p style={{ fontSize: 40 }}>🔍</p>
      <h1 style={{ fontSize: 20, fontWeight: 600 }}>Negocio no encontrado</h1>
      <p style={{ fontSize: 14, opacity: 0.6 }}>El link que seguiste no corresponde a ningún negocio activo.</p>
    </div>
  );

  const t = perfil.theme ?? {};
  const l = perfil.landing_config ?? {};

  const primary = t.primaryColor ?? "#474511";
  const bg      = t.bgColor      ?? "#f6f6ea";
  const card    = t.cardBg       ?? "#ffffff";
  const accent  = t.accentColor  ?? "#deeca0";
  const font    = FONTS[t.font ?? "inter"] ?? FONTS.inter;

  const heroTitle    = l.heroTitle    ?? perfil.business_name;
  const heroSubtitle = l.heroSubtitle ?? perfil.name;
  const ctaText      = l.ctaText      ?? "Agendar consulta";
  const waNum        = l.whatsapp     ?? perfil.whatsapp_number ?? "";
  const waBase       = waNum ? `https://wa.me/${waNum.replace(/\D/g, "")}` : null;
  const waUrl        = waBase ? `${waBase}?text=${encodeURIComponent("Hola! Me gustaría agendar una consulta.")}` : null;

  return (
    <div style={{ fontFamily: font, background: bg, color: primary, minHeight: "100vh" }}>

      {/* NAV */}
      <header style={{ position: "sticky", top: 0, zIndex: 40, background: bg, borderBottom: `1px solid ${accent}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "14px clamp(16px,4vw,48px)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "clamp(18px,2vw,24px)", fontWeight: 600, letterSpacing: "-0.02em" }}>{perfil.business_name}</span>
          {waUrl && (
            <a href={waUrl} target="_blank" rel="noopener noreferrer"
              style={{ padding: "10px 20px", borderRadius: 999, background: primary, color: bg, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>
              {ctaText}
            </a>
          )}
        </div>
      </header>

      {/* HERO */}
      <section style={{ background: primary, color: bg, padding: "clamp(48px,8vw,96px) clamp(16px,4vw,48px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: l.heroImageUrl ? "1fr 1fr" : "1fr", gap: 48, alignItems: "center" }}>
          <div>
            <span style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", padding: "5px 12px", borderRadius: 999, background: "rgba(255,255,255,0.15)", marginBottom: 24, display: "inline-block", fontFamily: "monospace" }}>
              {TIPO[perfil.tipo_negocio] ?? perfil.tipo_negocio}
            </span>
            <h1 style={{ fontSize: "clamp(36px,6vw,72px)", lineHeight: 1.0, letterSpacing: "-0.03em", fontWeight: 400, margin: "12px 0 24px" }}>
              {heroTitle}
            </h1>
            {heroSubtitle && <p style={{ fontSize: 17, lineHeight: 1.6, opacity: 0.85, maxWidth: "48ch", margin: "0 0 32px" }}>{heroSubtitle}</p>}
            {waUrl && (
              <a href={waUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-block", padding: "14px 28px", borderRadius: 999, background: accent, color: primary, fontSize: 15, fontWeight: 600, textDecoration: "none" }}>
                {ctaText}
              </a>
            )}
          </div>
          {l.heroImageUrl && (
            <div style={{ borderRadius: "180px 180px 24px 24px", overflow: "hidden", aspectRatio: "4/5", background: accent }}>
              <img src={l.heroImageUrl} alt={perfil.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 20%" }} />
            </div>
          )}
        </div>
      </section>

      {/* STATS */}
      {l.stats && l.stats.length > 0 && (
        <div style={{ background: accent, padding: "clamp(24px,4vw,48px) clamp(16px,4vw,48px)" }}>
          <div style={{ maxWidth: 800, margin: "0 auto", display: "grid", gridTemplateColumns: `repeat(${l.stats.length}, 1fr)`, gap: 24, textAlign: "center" }}>
            {l.stats.map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: "clamp(40px,5vw,72px)", fontWeight: 400, lineHeight: 1, letterSpacing: "-0.03em" }}>{s.value}</div>
                <div style={{ fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.7, marginTop: 8, fontFamily: "monospace" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABOUT */}
      {l.showAbout && l.aboutText && (
        <section style={{ background: bg, padding: "clamp(60px,8vw,120px) clamp(16px,4vw,48px)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "clamp(32px,5vw,80px)", alignItems: "start" }}>
            <div style={{ borderRadius: 24, overflow: "hidden", aspectRatio: "4/5", background: accent }}>
              {l.heroImageUrl
                ? <img src={l.heroImageUrl} alt={perfil.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 35%" }} />
                : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, opacity: 0.3 }}>🌿</div>
              }
            </div>
            <div>
              <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#dba22d", display: "block", marginBottom: 20 }}>Sobre mí</span>
              <h2 style={{ fontSize: "clamp(32px,4vw,52px)", lineHeight: 1.05, letterSpacing: "-0.025em", fontWeight: 400, margin: "0 0 24px" }}>
                {perfil.business_name}
              </h2>
              <p style={{ fontSize: 17, lineHeight: 1.7, opacity: 0.85, margin: "0 0 16px", maxWidth: "52ch" }}>{l.aboutText}</p>
              {l.aboutQuote && (
                <blockquote style={{ fontSize: 20, fontStyle: "italic", lineHeight: 1.4, margin: "24px 0 8px", opacity: 0.9 }}>"{l.aboutQuote}"</blockquote>
              )}
              {waUrl && (
                <a href={waUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-block", marginTop: 24, padding: "12px 24px", borderRadius: 999, background: primary, color: bg, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>
                  Agenda tu consulta
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* SERVICIOS */}
      {servicios.length > 0 && (
        <section style={{ background: bg, padding: "clamp(48px,7vw,96px) clamp(16px,4vw,48px)" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <h2 style={{ fontSize: "clamp(28px,3.5vw,44px)", fontWeight: 400, letterSpacing: "-0.02em", textAlign: "center", margin: "0 0 48px" }}>
              Servicios <em style={{ fontStyle: "italic", opacity: 0.7 }}>disponibles</em>
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
              {servicios.map((s) => (
                <div key={s.id} style={{ background: card, borderRadius: 20, padding: 24, display: "flex", flexDirection: "column", gap: 12, border: `1px solid ${accent}` }}>
                  <h3 style={{ fontSize: 22, fontWeight: 400, letterSpacing: "-0.01em", margin: 0 }}>{s.name}</h3>
                  {s.description && <p style={{ fontSize: 14, lineHeight: 1.6, opacity: 0.75, margin: 0, flex: 1 }}>{s.description}</p>}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 16, borderTop: `1px solid ${accent}` }}>
                    <span style={{ fontSize: 24, fontWeight: 600 }}>{formatCLP(s.price)}</span>
                    <span style={{ fontSize: 12, fontFamily: "monospace", opacity: 0.55, display: "flex", alignItems: "center", gap: 4 }}>
                      <Clock size={12} /> {s.duration_min} min
                    </span>
                  </div>
                  {waBase && (
                    <a href={`${waBase}?text=${encodeURIComponent(`Hola! Quiero agendar: ${s.name}`)}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 12, background: primary, color: bg, fontSize: 13, fontWeight: 500, textDecoration: "none" }}>
                      Agendar <span>→</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TESTIMONIOS */}
      {l.testimonials && l.testimonials.length > 0 && (
        <section style={{ background: primary, color: bg, padding: "clamp(48px,7vw,80px) clamp(16px,4vw,48px)" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <h2 style={{ fontSize: "clamp(24px,3vw,36px)", fontWeight: 400, textAlign: "center", margin: "0 0 40px", letterSpacing: "-0.02em" }}>
              Lo que dicen <em style={{ fontStyle: "italic", opacity: 0.75 }}>mis pacientes</em>
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
              {l.testimonials.map((t, i) => (
                <div key={i} style={{ background: bg, borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ color: "#f7cb96", fontSize: 16, letterSpacing: "0.1em" }}>★ ★ ★ ★ ★</div>
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: primary, margin: 0, flex: 1 }}>"{t.text}"</p>
                  <div style={{ fontSize: 13, fontWeight: 600, color: primary, opacity: 0.7, paddingTop: 12, borderTop: `1px solid ${accent}` }}>{t.name}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA WHATSAPP */}
      {waUrl && (
        <section style={{ background: bg, padding: "clamp(40px,6vw,64px) clamp(16px,4vw,48px)", textAlign: "center" }}>
          <div style={{ maxWidth: 480, margin: "0 auto", padding: "36px 28px", borderRadius: 20, background: primary, color: bg }}>
            <h3 style={{ fontSize: "clamp(22px,2.5vw,30px)", fontWeight: 400, margin: "0 0 8px", letterSpacing: "-0.02em" }}>¿Lista para empezar?</h3>
            <p style={{ fontSize: 15, opacity: 0.8, margin: "0 0 20px" }}>Escríbeme y te oriento sin compromiso.</p>
            <a href={waUrl} target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "13px 24px", borderRadius: 999, background: "#25D366", color: "#fff", fontSize: 15, fontWeight: 600, textDecoration: "none" }}>
              Hablar por WhatsApp
            </a>
          </div>
        </section>
      )}

      {/* INSTAGRAM */}
      {l.showInstagram && l.instagram && (
        <section style={{ background: bg, padding: "32px clamp(16px,4vw,48px)", textAlign: "center" }}>
          <a href={`https://instagram.com/${l.instagram.replace("@", "")}`}
            target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 999, border: `1.5px solid ${primary}`, color: primary, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>
            {l.instagram} · Instagram →
          </a>
        </section>
      )}

      {/* FOOTER */}
      <footer style={{ background: primary, color: bg, padding: "32px clamp(16px,4vw,48px)", textAlign: "center" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{perfil.business_name}</span>
          <span style={{ fontSize: 12, opacity: 0.5, fontFamily: "monospace", letterSpacing: "0.08em" }}>POWERED BY SOMAOS</span>
        </div>
      </footer>
    </div>
  );
}
