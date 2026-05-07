import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { formatCLP } from "@/lib/format";
import { Clock, Instagram, MessageCircle } from "lucide-react";
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

const FONTS: Record<string, string> = {
  inter:       "'Inter', sans-serif",
  playfair:    "'Playfair Display', serif",
  montserrat:  "'Montserrat', sans-serif",
  lato:        "'Lato', sans-serif",
};

const FONT_URLS: Record<string, string> = {
  playfair:   "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap",
  montserrat: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap",
  lato:       "https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap",
};

const RADII: Record<string, string> = {
  none: "0px", sm: "4px", md: "8px", lg: "16px", full: "9999px",
};

const TIPO_LABEL: Record<string, string> = {
  nutricionista: "Nutricionista", cosmetologa: "Cosmetóloga",
  odontologa: "Odontóloga", psicologa: "Psicóloga",
};

function injectTheme(t: SiteTheme) {
  let el = document.getElementById("soma-theme") as HTMLStyleElement | null;
  if (!el) { el = document.createElement("style"); el.id = "soma-theme"; document.head.appendChild(el); }
  el.textContent = `
    :root {
      --site-primary: ${t.primaryColor};
      --site-bg: ${t.bgColor};
      --site-card: ${t.cardBg};
      --site-text: ${t.textColor};
      --site-accent: ${t.accentColor};
      --site-radius: ${RADII[t.borderRadius]};
      --site-font: ${FONTS[t.font]};
    }
  `;
  // Load custom font if needed
  if (t.font !== "inter" && FONT_URLS[t.font]) {
    const existing = document.querySelector(`link[data-soma-font="${t.font}"]`);
    if (!existing) {
      const link = document.createElement("link");
      link.rel = "stylesheet"; link.href = FONT_URLS[t.font];
      link.setAttribute("data-soma-font", t.font);
      document.head.appendChild(link);
    }
  }
}

export default function Sitio() {
  const { userId } = useParams<{ userId: string }>();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const loadData = async (uid: string) => {
    const [{ data: p }, { data: s }] = await Promise.all([
      supabase.from("perfiles").select("name, business_name, tipo_negocio, whatsapp_number, theme, landing_config").eq("id", uid).single(),
      supabase.from("servicios").select("id, name, description, price, duration_min, active").eq("user_id", uid).eq("active", true).order("created_at"),
    ]);
    if (!p) { setNotFound(true); setLoading(false); return; }
    setPerfil(p as Perfil);
    setServicios((s ?? []) as Servicio[]);
    setLoading(false);
    const theme = { ...DEFAULT_THEME, ...(p.theme ?? {}) };
    injectTheme(theme);
  };

  // Detect custom domain — find userId by domain if not in URL
  const [resolvedId, setResolvedId] = useState<string | null>(userId ?? null);

  useEffect(() => {
    const hostname = window.location.hostname;
    const isMainApp = hostname.includes("vercel.app") || hostname === "localhost" || hostname.includes("somaos");

    if (!isMainApp && !userId) {
      // Custom domain — look up user by dominio
      supabase
        .from("client_integrations")
        .select("user_id")
        .eq("dominio", hostname)
        .single()
        .then(({ data }) => {
          if (data?.user_id) setResolvedId(data.user_id);
          else setNotFound(true);
        });
    }
  }, []);

  useEffect(() => {
    if (!resolvedId) return;
    loadData(resolvedId);

    const channel = supabase
      .channel(`sitio-${resolvedId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "servicios", filter: `user_id=eq.${resolvedId}` }, () => loadData(resolvedId))
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      document.getElementById("soma-theme")?.remove();
    };
  }, [resolvedId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--site-bg, #fff)" }}>
      <div className="h-6 w-6 rounded-full border-2 border-[var(--site-primary,#5B3EFF)] border-t-transparent animate-spin" />
    </div>
  );

  if (notFound || !perfil) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center p-6">
      <div className="text-4xl">🔍</div>
      <h1 className="text-xl font-semibold">Negocio no encontrado</h1>
      <p className="text-sm text-gray-500">El link que seguiste no corresponde a ningún negocio activo.</p>
    </div>
  );

  const theme   = { ...DEFAULT_THEME,   ...(perfil.theme          ?? {}) };
  const landing = { ...DEFAULT_LANDING, ...(perfil.landing_config ?? {}) };

  const heroTitle    = landing.heroTitle    || perfil.business_name;
  const heroSubtitle = landing.heroSubtitle || perfil.name;
  const ctaText      = landing.ctaText      || "Agendar consulta";

  const whatsappBase = perfil.whatsapp_number
    ? `https://wa.me/${perfil.whatsapp_number.replace(/\D/g, "")}`
    : null;
  const whatsappUrl = whatsappBase
    ? `${whatsappBase}?text=${encodeURIComponent("Hola! Me gustaría agendar una consulta.")}`
    : null;

  const heroGradient = `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.primaryColor}CC 100%)`;

  return (
    <div style={{ fontFamily: FONTS[theme.font], background: `var(--site-bg, ${theme.bgColor})`, color: theme.textColor, minHeight: "100vh" }}>

      {/* ── Hero ── */}
      <header
        className="relative overflow-hidden py-20 px-6 text-center"
        style={
          theme.heroStyle === "image" && landing.heroImageUrl
            ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)), url(${landing.heroImageUrl})`, backgroundSize: "cover", backgroundPosition: "center", color: "#fff" }
            : theme.heroStyle === "minimal"
            ? { background: theme.bgColor, color: theme.textColor, borderBottom: `1px solid ${theme.accentColor}` }
            : { background: heroGradient, color: "#fff" }
        }
      >
        {theme.heroStyle !== "minimal" && (
          <>
            <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          </>
        )}
        <div className="relative z-10 max-w-2xl mx-auto">
          <div
            className="inline-flex items-center text-[11px] px-3 py-1 rounded-full mb-4"
            style={{ background: theme.heroStyle === "minimal" ? theme.accentColor : "rgba(255,255,255,0.15)", color: theme.heroStyle === "minimal" ? theme.primaryColor : "#fff", border: "1px solid rgba(255,255,255,0.2)" }}
          >
            {TIPO_LABEL[perfil.tipo_negocio] ?? perfil.tipo_negocio}
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">{heroTitle}</h1>
          {heroSubtitle && <p className="mt-3 text-base opacity-80 max-w-md mx-auto">{heroSubtitle}</p>}
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-full text-sm font-semibold transition-opacity hover:opacity-90"
              style={
                theme.heroStyle === "minimal"
                  ? { background: theme.primaryColor, color: "#fff" }
                  : { background: "#fff", color: theme.primaryColor }
              }
            >
              <MessageCircle className="h-4 w-4" /> {ctaText}
            </a>
          )}
        </div>
      </header>

      {/* ── About ── */}
      {landing.showAbout && landing.aboutText && (
        <section className="max-w-2xl mx-auto px-4 py-14 text-center">
          <p className="text-base leading-relaxed" style={{ color: theme.textColor }}>{landing.aboutText}</p>
        </section>
      )}

      {/* ── Custom sections ── */}
      {landing.customSections?.map((sec) => (
        <section key={sec.id} className="max-w-2xl mx-auto px-4 py-10">
          <h2 className="text-xl font-semibold mb-3" style={{ color: theme.primaryColor }}>{sec.title}</h2>
          <p className="text-sm leading-relaxed opacity-80">{sec.body}</p>
        </section>
      ))}

      {/* ── Servicios ── */}
      <main className="max-w-3xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-bold tracking-tight mb-2" style={{ color: theme.primaryColor }}>Servicios</h2>
        <p className="text-sm mb-8" style={{ opacity: 0.6 }}>
          {servicios.length === 0 ? "Pronto habrá servicios disponibles." : `${servicios.length} servicio${servicios.length !== 1 ? "s" : ""} disponible${servicios.length !== 1 ? "s" : ""}`}
        </p>
        {servicios.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed p-16 text-center text-sm" style={{ borderColor: theme.accentColor, color: theme.textColor, opacity: 0.5 }}>
            Aún no hay servicios publicados.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {servicios.map((s) => (
              <div
                key={s.id}
                className="flex flex-col gap-3 p-5 transition-shadow hover:shadow-md"
                style={{ background: theme.cardBg, borderRadius: RADII[theme.borderRadius], border: `1px solid ${theme.accentColor}` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold">{s.name}</h3>
                  <span className="text-xs shrink-0 flex items-center gap-1" style={{ opacity: 0.5 }}>
                    <Clock className="h-3 w-3" /> {s.duration_min} min
                  </span>
                </div>
                {s.description && <p className="text-sm flex-1" style={{ opacity: 0.7 }}>{s.description}</p>}
                <div className="flex items-center justify-between pt-3" style={{ borderTop: `1px solid ${theme.accentColor}` }}>
                  <span className="text-lg font-bold font-mono">{formatCLP(s.price)}</span>
                  {whatsappBase && (
                    <a
                      href={`${whatsappBase}?text=${encodeURIComponent(`Hola! Me gustaría agendar: ${s.name}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-4 py-1.5 font-semibold transition-opacity hover:opacity-90"
                      style={{ background: theme.primaryColor, color: "#fff", borderRadius: RADII[theme.borderRadius] }}
                    >
                      Agendar
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Instagram ── */}
      {landing.showInstagram && landing.instagram && (
        <div className="text-center py-6">
          <a
            href={`https://instagram.com/${landing.instagram.replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ color: theme.primaryColor }}
          >
            <Instagram className="h-4 w-4" /> {landing.instagram}
          </a>
        </div>
      )}

      {/* ── Footer ── */}
      <footer className="py-6 text-center text-xs" style={{ borderTop: `1px solid ${theme.accentColor}`, opacity: 0.5 }}>
        Powered by <span className="font-semibold">SomaOS</span>
      </footer>
    </div>
  );
}
