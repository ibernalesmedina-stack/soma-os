import { useEffect, useRef, useState } from "react";
import {
  ArrowRight, Sparkles, Star, ExternalLink, Check,
  Syringe, Droplet, Sun, Gem, Zap, SmilePlus, ShieldCheck, Scissors, Wrench,
  Instagram as InstagramIcon,
} from "lucide-react";

type IconProps = { className?: string; style?: React.CSSProperties; strokeWidth?: number | string };

function ToothImplantIcon({ className, style, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M12 2.2c-2.6 0-4.7 1.7-5.5 4.1-.7 2-.5 4.1.1 6.5.6 2.2 1.2 4.5 1.9 6.5.3.9 1.6.9 1.9 0l.9-2.7c.2-.6 1-.6 1.2 0l.9 2.7c.3.9 1.6.9 1.9 0 .7-2 1.3-4.3 1.9-6.5.6-2.4.8-4.5.1-6.5C16.7 3.9 14.6 2.2 12 2.2Z" />
      <line x1="12" y1="17.5" x2="12" y2="21.6" />
      <line x1="10.4" y1="18.6" x2="13.6" y2="18.6" />
      <line x1="10.4" y1="20.2" x2="13.6" y2="20.2" />
    </svg>
  );
}

const heroImg = "/paola-hero.png";
const ctaImg = "/paola-cta.png";
const portraitImg = "/paola-portrait.jpg";

const GOOGLE_REVIEWS_URL = "https://www.google.com/search?q=dra+paola+cardenas+fica";
const WHATSAPP_NUMBER = "56971252179";

const SITE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Instrument+Sans:wght@400;500;600;700&display=swap');

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
  .pc-marquee:hover { animation-play-state: paused; }
  .pc-reveal { opacity: 0; transform: translateY(30px); transition: opacity 1s cubic-bezier(.16,1,.3,1), transform 1s cubic-bezier(.16,1,.3,1); }
  .pc-reveal.pc-in { opacity: 1; transform: translateY(0); }
`;

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({ children, delay = 0, className = "", style }: { children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties }) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} className={`pc-reveal ${visible ? "pc-in" : ""} ${className}`} style={{ transitionDelay: `${delay}ms`, ...style }}>
      {children}
    </div>
  );
}

function useSEO() {
  useEffect(() => {
    document.title = "Dra. Paola Cárdenas Fica · Implantología y Odontología | Viña del Mar";
    const setMeta = (attr: string, val: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${val}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, val); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    const desc = "Dra. Paola Cárdenas Fica, Cirujana Dentista especialista en Implantología Bucomaxilofacial en Viña del Mar. Agenda tu evaluación online.";
    setMeta("name", "description", desc);
    setMeta("name", "robots", "index, follow");
    setMeta("property", "og:title", "Dra. Paola Cárdenas Fica · Implantología Bucomaxilofacial");
    setMeta("property", "og:description", desc);
    setMeta("property", "og:url", "https://drapaolacardenasfica.com");
    setMeta("property", "og:type", "website");
    setMeta("property", "og:site_name", "Dra. Paola Cárdenas Fica");
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement("link") as HTMLLinkElement; canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = "https://drapaolacardenasfica.com";
  }, []);
}

export default function SitioPaolaCardenas() {
  useSEO();

  return (
    <>
      <style>{SITE_STYLES}</style>
      <main className="pc-site min-h-screen overflow-x-hidden">
        <Nav />
        <Hero />
        <Filosofia />
        <Tratamientos />
        <AntesDespues />
        <QuienSoy />
        <Testimonios />
        <Cierre />
        <FAQ />
        <Footer />
        <WhatsAppButton />
      </main>
    </>
  );
}

function Nav() {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > 260 && y > lastY);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-transform duration-700"
      style={{ background: "#f0ebe5", borderBottom: "1px solid rgba(50,44,40,0.1)", color: "#322C28", transform: hidden ? "translateY(-115%)" : "translateY(0)" }}
    >
      <div className="flex items-center justify-between gap-3" style={{ padding: "18px clamp(20px,5vw,72px)" }}>
        <a href="#top" className="pc-serif whitespace-nowrap" style={{ color: "#322C28", fontWeight: 700, fontSize: "clamp(13px,1.3vw,20px)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
          Dra. Paola Cárdenas Fica
        </a>
        <nav className="hidden md:flex items-center" style={{ gap: "clamp(6px,1.1vw,20px)", fontSize: "clamp(10px,0.85vw,12px)", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase" }}>
          {[["#filosofia", "Filosofía"], ["#tratamientos", "Tratamientos"], ["#dra", "Quién soy"]].map(([href, label]) => (
            <a key={href} href={href} className="rounded-full transition-all hover:bg-[#322C28] hover:text-[#f0ebe5]"
              style={{ padding: "11px clamp(13px,1.3vw,20px)", border: "1px solid rgba(50,44,40,0.3)", background: "transparent", color: "#322C28", whiteSpace: "nowrap" }}>
              {label}
            </a>
          ))}
          <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" className="pc-cta-pulse rounded-full whitespace-nowrap"
            style={{ padding: "13px clamp(18px,2vw,30px)", border: "1px solid #B89B6A", background: "#B89B6A", color: "#fff", fontWeight: 500 }}>
            Agendar hora
          </a>
        </nav>
        <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" className="md:hidden rounded-full whitespace-nowrap" style={{ background: "#B89B6A", color: "#fff", padding: "10px 18px", fontSize: "11px", fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          Agendar
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden" style={{ minHeight: "640px", height: "100vh", background: "#727f89" }}>
      <img src={heroImg} alt="Dra. Paola Cárdenas Fica" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: "62% 34%", filter: "grayscale(0.2) brightness(0.82) sepia(0.08)" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(114,127,137,0.88) 0%, rgba(50,44,40,0.45) 44%, rgba(50,44,40,0.14) 72%, rgba(114,127,137,0.34) 100%)" }} />
      <div className="absolute" style={{ left: "clamp(20px,5vw,72px)", right: "clamp(20px,5vw,72px)", bottom: "clamp(48px,9vh,104px)" }}>
        <p style={{ color: "#E3D3B4", fontSize: "clamp(11px,0.95vw,14px)", letterSpacing: "0.32em", textTransform: "uppercase" }}>Implantología · Estética · Rehabilitación oral</p>
        <h1 className="pc-serif mt-3" style={{ color: "#F4F2EE", fontWeight: 300, fontSize: "clamp(44px,8vw,132px)", lineHeight: 0.94, letterSpacing: "-0.03em", textShadow: "0 2px 40px rgba(114,127,137,0.4)" }}>
          No solo<br />restauramos sonrisas.<br /><em style={{ color: "#E3D3B4", fontStyle: "italic" }}>Devolvemos confianza.</em>
        </h1>
        <div className="mt-8 flex flex-wrap gap-4">
          <a href="#tratamientos" className="rounded-full transition-all hover:-translate-y-1" style={{ padding: "21px 40px", border: "1px solid rgba(244,242,238,0.6)", background: "rgba(244,242,238,0.08)", color: "#F4F2EE", fontSize: "13px", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase" }}>
            Ver tratamientos
          </a>
          <a href="#agenda" className="pc-cta-pulse rounded-full" style={{ padding: "21px 40px", background: "#B89B6A", color: "#fff", fontSize: "13px", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase" }}>
            Agenda online
          </a>
        </div>
      </div>
    </section>
  );
}

function Filosofia() {
  return (
    <section id="filosofia" style={{ background: "#f0ebe5", padding: "clamp(100px,15vh,200px) clamp(20px,5vw,72px) clamp(110px,16vh,220px)" }}>
      <div className="grid lg:grid-cols-12 items-center" style={{ gap: "clamp(24px,4vw,64px)" }}>
        <Reveal className="lg:col-span-6 flex flex-col" style={{ gap: "clamp(22px,3vh,32px)" }}>
          <div>
            <p style={{ color: "#B89B6A", fontSize: "clamp(14px,1.15vw,18px)", fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase", marginBottom: "clamp(16px,2vh,24px)" }}>Mi filosofía</p>
            <h2 className="pc-serif" style={{ fontWeight: 300, fontSize: "clamp(32px,4.4vw,72px)", lineHeight: 1.04, letterSpacing: "-0.025em" }}>
              Una odontología centrada en las <em style={{ color: "#8C7B62", fontStyle: "italic" }}>personas</em>
            </h2>
          </div>
          <p style={{ maxWidth: "52ch", color: "#5A5148", lineHeight: 1.8 }}>
            Creo que la odontología va mucho más allá de un diagnóstico o un procedimiento. Para mí, cada paciente tiene una historia, necesidades y expectativas distintas, por eso creo en una atención cercana, donde escuchar es tan importante como tratar.
          </p>
          <p style={{ maxWidth: "52ch", color: "#5A5148", lineHeight: 1.8 }}>
            Mi compromiso es ofrecer una experiencia basada en la confianza, la honestidad y el respeto, combinando ciencia, precisión y una mirada estética para encontrar soluciones que realmente mejoren la calidad de vida de quienes confían en mí.
          </p>
          <div className="flex flex-wrap gap-3.5">
            {["Confianza", "Excelencia", "Armonía"].map((t) => (
              <span key={t} className="rounded-full transition-colors" style={{ padding: "12px 26px", border: "1px solid #B89B6A", fontSize: "clamp(11px,0.95vw,13px)", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase" }}>
                {t}
              </span>
            ))}
          </div>
        </Reveal>
        <Reveal delay={120} className="lg:col-span-6">
          <div className="rounded-2xl overflow-hidden" style={{ aspectRatio: "3/4", background: "linear-gradient(135deg, #727f89, #5A5148)" }} />
        </Reveal>
      </div>
    </section>
  );
}

type Categoria = { title: string; desc: string; items: { name: string; sub: string; desc: string; icon: React.ComponentType<IconProps>; img?: string }[] };

const CATEGORIAS: Categoria[] = [
  {
    title: "Medicina estética",
    desc: "Tratamientos diseñados para armonizar el rostro, revitalizar la piel y potenciar la belleza natural mediante procedimientos seguros, personalizados y mínimamente invasivos.",
    items: [
      { name: "Peeling químico", sub: "Renovación y luminosidad de la piel", desc: "Exfoliación controlada que renueva las capas superficiales de la piel, mejora la textura, atenúa manchas y devuelve luminosidad de forma progresiva y natural.", icon: Sun, img: "/tratamiento-peeling.jpg" },
      { name: "Mesoterapia", sub: "Hidratación profunda y firmeza", desc: "Microinyecciones de activos, vitaminas y ácido hialurónico que hidratan en profundidad, mejoran la firmeza y revitalizan el aspecto general del rostro.", icon: Droplet, img: "/tratamiento-mesoterapia.jpg" },
      { name: "Bioestimuladores faciales", sub: "Colágeno propio, resultado progresivo", desc: "Estimulan la producción natural de colágeno, mejorando densidad, firmeza y calidad de la piel con un resultado gradual que se ve genuinamente tuyo.", icon: Sparkles, img: "/tratamiento-bioestimuladores.jpg" },
      { name: "Ácido hialurónico", sub: "Volumen y armonía facial", desc: "Relleno de alta calidad para restaurar volúmenes, definir contornos y armonizar proporciones del rostro, siempre respetando tus rasgos.", icon: Gem, img: "/tratamiento-acido-hialuronico.jpg" },
      { name: "Toxina botulínica", sub: "Expresión relajada y natural", desc: "Suaviza líneas de expresión y previene su profundización, manteniendo un rostro descansado, con movimiento y expresión natural.", icon: Syringe, img: "/tratamiento-botox.jpg" },
    ],
  },
  {
    title: "Odontología general",
    desc: "Cuidamos la salud de tu sonrisa con tratamientos preventivos y restauradores que combinan funcionalidad, estética y bienestar.",
    items: [
      { name: "Limpieza dental", sub: "Salud que se ve y se siente", desc: "Remoción profesional de placa y sarro, pulido y revisión completa para mantener encías sanas y prevenir problemas mayores.", icon: ShieldCheck, img: "/tratamiento-limpieza.jpg" },
      { name: "Blanqueamiento", sub: "Tonos más claros, sin dañar", desc: "Protocolo profesional que aclara varios tonos el esmalte de forma segura y controlada, con seguimiento personalizado.", icon: Zap, img: "/tratamiento-blanqueamiento.jpg" },
      { name: "Restauraciones", sub: "Estética y función devueltas", desc: "Reparación de piezas dañadas con materiales estéticos de alta resistencia que replican el color y la anatomía natural del diente.", icon: SmilePlus, img: "/tratamiento-restauraciones.jpg" },
      { name: "Extracciones", sub: "Procedimiento seguro y cuidado", desc: "Extracción realizada con técnica atraumática, anestesia adecuada y acompañamiento en todo el proceso de recuperación.", icon: Scissors, img: "/tratamiento-extracciones.jpg" },
      { name: "Prótesis dentales", sub: "Recuperar la mordida y la sonrisa", desc: "Prótesis fijas o removibles diseñadas a medida para devolver función masticatoria, soporte facial y estética.", icon: Wrench, img: "/tratamiento-protesis.jpg" },
    ],
  },
  {
    title: "Implantología",
    desc: "Recuperamos la funcionalidad y la estética de tu sonrisa mediante implantes dentales de alta precisión, devolviendo seguridad y calidad de vida.",
    items: [
      { name: "Implante unitario", sub: "Una pieza, resultado natural", desc: "Reposición de una pieza perdida mediante un implante de titanio y corona personalizada, indistinguible de tus dientes naturales.", icon: ToothImplantIcon },
      { name: "Implantes múltiples", sub: "Rehabilitación por sectores", desc: "Solución para varias piezas ausentes, planificada digitalmente para devolver función masticatoria y estética de forma integral.", icon: ToothImplantIcon },
      { name: "Rehabilitación completa", sub: "Toda la sonrisa, en un plan", desc: "Tratamiento integral que restaura la arcada completa, recuperando mordida, soporte facial y confianza al hablar y sonreír.", icon: ToothImplantIcon },
    ],
  },
];

function Tratamientos() {
  return (
    <section id="tratamientos" style={{ background: "#f0ebe5", padding: "clamp(100px,15vh,200px) 0 clamp(110px,16vh,220px)" }}>
      <h2 className="text-center" style={{ fontFamily: "'Instrument Sans',sans-serif", fontWeight: 600, fontSize: "clamp(26px,3.4vw,54px)", textTransform: "uppercase", letterSpacing: "-0.01em", color: "#322C28" }}>
        Nuestros tratamientos
      </h2>
      {CATEGORIAS.map((cat, ci) => (
        <div key={cat.title} style={{ marginTop: "clamp(60px,9vh,110px)" }}>
          <div className="mx-auto text-center px-6" style={{ maxWidth: "1100px" }}>
            <h3 className="pc-serif" style={{ fontWeight: 300, fontSize: "clamp(30px,3.6vw,60px)" }}>{cat.title}</h3>
            <p className="mx-auto mt-4" style={{ maxWidth: "58ch", color: "#5A5148", fontSize: "clamp(16px,1.2vw,19px)", lineHeight: 1.6 }}>{cat.desc}</p>
          </div>
          <div className="mt-10 flex justify-center overflow-x-auto px-6" style={{ gap: "clamp(16px,1.6vw,26px)", scrollbarWidth: "none" }}>
            {cat.items.map((it, i) => {
              if (!it.img) {
                return (
                  <article key={it.name} className="relative shrink-0 rounded-2xl overflow-hidden flex flex-col" style={{ width: "clamp(260px,24vw,380px)", aspectRatio: "3/4", background: "#727f89", padding: "clamp(20px,2.2vw,28px)" }}>
                    <span style={{ fontSize: 13, letterSpacing: "0.22em", color: "rgba(244,242,238,0.7)" }}>{String(i + 1).padStart(2, "0")}</span>
                    <div className="flex-1 flex items-center justify-center">
                      <img src="/icono-implante.png" alt="" className="w-full h-auto opacity-80" style={{ maxWidth: "58%" }} />
                    </div>
                    <div>
                      <h4 style={{ color: "#F4F2EE", fontWeight: 600, fontSize: "clamp(22px,1.9vw,28px)" }}>{it.name}</h4>
                      <p className="mt-3 leading-relaxed" style={{ color: "rgba(244,242,238,0.8)", fontSize: "clamp(15px,1.25vw,17px)" }}>{it.desc}</p>
                      <div className="mt-5 flex items-center justify-between">
                        <div>
                          <span className="block" style={{ fontSize: 12, letterSpacing: "0.24em", color: "rgba(244,242,238,0.6)" }}>PRECIO</span>
                          <span className="block font-semibold" style={{ color: "#E3D3B4", fontSize: 22 }}>Consultar</span>
                        </div>
                        <a href="#agenda" className="rounded-full font-medium uppercase" style={{ padding: "11px 20px", background: "#B89B6A", color: "#fff", letterSpacing: "0.2em", fontSize: 13 }}>
                          Agendar
                        </a>
                      </div>
                    </div>
                  </article>
                );
              }
              return (
                <article key={it.name} className="group relative shrink-0 rounded-2xl overflow-hidden cursor-pointer" style={{ width: "clamp(260px,24vw,380px)", aspectRatio: "3/4", background: "#727f89" }}>
                  <img src={it.img} alt={it.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <span className="absolute top-4 left-4" style={{ fontSize: 13, letterSpacing: "0.22em", color: "rgba(244,242,238,0.7)" }}>{String(i + 1).padStart(2, "0")}</span>
                  <div className="absolute inset-0 flex flex-col justify-end p-6" style={{ background: "linear-gradient(to top, rgba(114,127,137,0.88) 0%, rgba(114,127,137,0.15) 52%, rgba(114,127,137,0.05) 100%)" }}>
                    <h4 style={{ color: "#F4F2EE", fontWeight: 600, fontSize: "clamp(22px,1.9vw,28px)" }}>{it.name}</h4>
                    <p className="mt-1.5" style={{ color: "rgba(244,242,238,0.75)", fontSize: "clamp(14px,1.15vw,16px)" }}>{it.sub}</p>
                  </div>
                  <div className="absolute inset-0 flex flex-col justify-end p-7 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(114,127,137,0.93)", backdropFilter: "blur(6px)" }}>
                    <h4 style={{ color: "#F4F2EE", fontWeight: 600, fontSize: "clamp(22px,1.9vw,28px)" }}>{it.name}</h4>
                    <p className="mt-3 leading-relaxed" style={{ color: "rgba(244,242,238,0.8)", fontSize: "clamp(15px,1.25vw,17px)" }}>{it.desc}</p>
                    <div className="mt-5 flex items-center justify-between">
                      <div>
                        <span className="block" style={{ fontSize: 12, letterSpacing: "0.24em", color: "rgba(244,242,238,0.6)" }}>PRECIO</span>
                        <span className="block font-semibold" style={{ color: "#E3D3B4", fontSize: 22 }}>Consultar</span>
                      </div>
                      <a href="#agenda" className="rounded-full font-medium uppercase" style={{ padding: "11px 20px", background: "#B89B6A", color: "#fff", letterSpacing: "0.2em", fontSize: 13 }}>
                        Agendar
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}

const testimonioImgs = ["/paola-testimonio-1.jpg", "/paola-testimonio-2.jpg", "/paola-testimonio-3.jpg"];
const testimonioVideo = "/paola-testimonio.mp4";

function AntesDespues() {
  return (
    <section id="resultados" style={{ background: "#f0ebe5", padding: "clamp(60px,9vh,110px) clamp(20px,5vw,72px) clamp(90px,13vh,170px)" }}>
      <div className="text-center py-10">
        <h2 style={{ fontFamily: "'Instrument Sans',sans-serif", fontWeight: 600, fontSize: "clamp(22px,2.6vw,42px)", textTransform: "uppercase", color: "#322C28" }}>Antes y después</h2>
        <p className="mt-2" style={{ color: "#8C8378", fontSize: "clamp(13px,1.05vw,16px)" }}>de nuestros pacientes</p>
      </div>
      <div className="mx-auto grid md:grid-cols-2 items-stretch" style={{ maxWidth: 1200, gap: "clamp(14px,1.6vw,22px)", height: "clamp(520px,78vh,820px)" }}>
        <div className="relative grid grid-rows-3 h-full" style={{ gap: "clamp(10px,1.2vw,16px)", minHeight: 0 }}>
          {testimonioImgs.map((src, i) => (
            <div key={src} className="relative rounded-2xl overflow-hidden" style={{ minHeight: 0 }}>
              <img src={src} alt={`Antes ${i + 1}`} className="w-full h-full object-cover block" />
            </div>
          ))}
          <span className="absolute top-4 left-4 rounded-full z-10" style={{ padding: "6px 16px", background: "rgba(114,127,137,0.75)", backdropFilter: "blur(4px)", color: "#F4F2EE", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase" }}>Antes</span>
        </div>
        <div className="relative rounded-2xl overflow-hidden h-full" style={{ minHeight: 0 }}>
          <video src={testimonioVideo} className="w-full h-full object-cover block" autoPlay muted loop playsInline controls />
          <span className="absolute top-4 left-4 rounded-full" style={{ padding: "6px 16px", background: "rgba(184,155,106,0.9)", color: "#fff", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase" }}>Después</span>
        </div>
      </div>
    </section>
  );
}

function QuienSoy() {
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);
  const { ref, visible } = useReveal();

  useEffect(() => {
    if (!visible) return;
    const dur = 1800;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount1(Math.round(eased * 6));
      setCount2(Math.round(eased * 3000));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [visible]);

  return (
    <section id="dra" ref={ref} style={{ background: "#727f89", color: "#F4F2EE", padding: "clamp(100px,15vh,200px) clamp(20px,5vw,72px)" }}>
      <div className="grid lg:grid-cols-12 items-start gap-10">
        <div className="lg:col-span-5 rounded-2xl overflow-hidden" style={{ aspectRatio: "4/5" }}>
          <img src={portraitImg} alt="Dra. Paola Cárdenas Fica" className="w-full h-full object-cover" loading="lazy" />
        </div>
        <div className="lg:col-span-7">
          <p style={{ color: "#B89B6A", fontSize: "clamp(14px,1.15vw,18px)", fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase", marginBottom: 30 }}>Quién soy</p>
          <h2 className="pc-serif" style={{ fontWeight: 300, fontSize: "clamp(38px,4.6vw,76px)" }}>Dra. Paola<br /><em style={{ fontStyle: "italic" }}>Cárdenas Fica</em></h2>
          <p className="mt-6" style={{ color: "rgba(244,242,238,0.72)", fontSize: 15, lineHeight: 1.8 }}>
            Soy Cirujana Dentista y Especialista en Implantología Bucomaxilofacial. Con más de 6 años de experiencia y más de 3.000 pacientes atendidos, he complementado mi formación con perfeccionamientos en implantología y estética en Chile y el extranjero, integrando ciencia, precisión y una mirada estética para crear tratamientos personalizados con resultados naturales y duraderos.
          </p>
          <p className="mt-4" style={{ color: "rgba(244,242,238,0.72)", fontSize: 15, lineHeight: 1.8 }}>
            Mi enfoque combina rehabilitación oral y armonización estética, entendiendo que una sonrisa no solo debe recuperar su función, sino también potenciar la confianza y el bienestar de cada persona.
          </p>
          <div className="mt-10 pt-8 flex flex-wrap" style={{ borderTop: "1px solid rgba(244,242,238,0.18)", gap: "clamp(30px,5vw,70px)" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: "clamp(38px,3.8vw,60px)", color: "#E3D3B4" }}>{count1}+</div>
              <p className="text-[11px] mt-1" style={{ letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(244,242,238,0.55)" }}>Años de experiencia</p>
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: "clamp(38px,3.8vw,60px)", color: "#E3D3B4" }}>{count2.toLocaleString("es-CL")}+</div>
              <p className="text-[11px] mt-1" style={{ letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(244,242,238,0.55)" }}>Pacientes atendidos</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const REVIEWS = [
  { q: "Llegué escondiendo mi sonrisa en cada foto. Hoy no me acuerdo de hacerlo.", a: "Camila R.", t: "Implantología" },
  { q: "Todo se sintió pensado para mí. Nada exagerado, nada evidente.", a: "Andrea S.", t: "Armonización" },
  { q: "Volví a masticar tranquilo. Y volví a reírme fuerte.", a: "Jorge M.", t: "Rehabilitación" },
  { q: "Me explicó cada paso sin apuro. Salí sabiendo exactamente qué iba a pasar.", a: "Valentina P.", t: "Odontología" },
  { q: "El resultado se ve mío. Nadie notó el tratamiento, todos notaron el cambio.", a: "Francisca M.", t: "Medicina estética" },
  { q: "Vine por un implante y me fui con la seguridad de volver a hablar sin taparme.", a: "Rodrigo T.", t: "Implantología" },
];

function Testimonios() {
  return (
    <section id="testimonios" style={{ position: "relative", background: "#f0ebe5", padding: "clamp(110px,17vh,220px) clamp(20px,5vw,72px)", overflow: "hidden" }}>
      <div style={{ position: "relative", zIndex: 2 }}>
        <h2 className="text-center" style={{ fontFamily: "'Instrument Sans',sans-serif", fontWeight: 600, fontSize: "clamp(26px,3.4vw,54px)", letterSpacing: "-0.01em", color: "#322C28" }}>Reseñas reales de pacientes</h2>
        <div className="mt-8 flex justify-center">
          <a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-4 rounded-full" style={{ background: "#fff", border: "1px solid rgba(50,44,40,0.18)", padding: "13px 26px" }}>
            <span style={{ fontWeight: 600, fontSize: 22 }}>5,0</span>
            <span style={{ color: "#B89B6A", letterSpacing: "0.18em", fontSize: 15 }}>★★★★★</span>
            <span className="pl-4 inline-flex items-center gap-1" style={{ borderLeft: "1px solid rgba(50,44,40,0.18)", color: "#5A5148", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase" }}>
              Ver en Google <ExternalLink className="h-3 w-3" />
            </span>
          </a>
        </div>
      </div>
      <div className="mt-10" style={{ margin: "40px calc(-1 * clamp(20px,5vw,72px)) 0" }}>
        <div className="overflow-hidden" style={{ cursor: "grab", padding: "10px 0 16px" }}>
          <div className="flex pc-marquee" style={{ gap: "clamp(20px,1.8vw,30px)", padding: "0 clamp(20px,5vw,72px)", width: "max-content" }}>
            {[...REVIEWS, ...REVIEWS].map((r, i) => (
              <figure key={i} className="shrink-0 rounded-[20px] flex flex-col" style={{ width: "clamp(280px,26vw,400px)", background: "#fff", border: "1px solid rgba(50,44,40,0.1)", padding: "clamp(24px,2vw,34px)", gap: 22 }}>
                <div className="flex items-center justify-between">
                  <span style={{ color: "#B89B6A", letterSpacing: "0.18em", fontSize: 15 }}>★★★★★</span>
                  <span className="h-[26px] w-[26px] rounded-full flex items-center justify-center text-xs" style={{ border: "1px solid rgba(50,44,40,0.16)", color: "#8C8378" }}>G</span>
                </div>
                <blockquote className="flex-1" style={{ color: "#322C28", fontWeight: 400, fontSize: "clamp(15px,1.2vw,18px)", lineHeight: 1.6 }}>&ldquo;{r.q}&rdquo;</blockquote>
                <figcaption className="pt-5 flex items-baseline justify-between" style={{ borderTop: "1px solid rgba(50,44,40,0.12)" }}>
                  <span style={{ fontWeight: 500, fontSize: 14 }}>{r.a}</span>
                  <span className="text-[10px]" style={{ letterSpacing: "0.22em", textTransform: "uppercase", color: "#8C8378" }}>{r.t}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
      <div style={{ position: "relative", zIndex: 2 }}>
        <BookingSection />
      </div>
    </section>
  );
}

function bookingDays(): { id: string; label: string }[] {
  const out: { id: string; label: string }[] = [];
  const names = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const d = new Date();
  d.setDate(d.getDate() + 1);
  while (out.length < 6) {
    if (d.getDay() === 2 || d.getDay() === 4) {
      out.push({
        id: d.toISOString().slice(0, 10),
        label: names[d.getDay()].replace(/^./, (c) => c.toUpperCase()) + " " + d.getDate() + " " + months[d.getMonth()],
      });
    }
    d.setDate(d.getDate() + 1);
  }
  return out;
}

function AccordionStep({
  num, title, valueLabel, open, onToggle, children,
}: { num: string; title: string; valueLabel?: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div style={{ borderBottom: "1px solid rgba(50,44,40,0.12)" }}>
      <button onClick={onToggle} className="w-full flex items-center justify-between gap-4" style={{ padding: "22px 4px" }}>
        <span className="flex items-center gap-4">
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.22em", color: "#B89B6A" }}>{num}</span>
          <span style={{ fontSize: "clamp(15px,1.3vw,19px)", fontWeight: 400, letterSpacing: "0.14em", color: "#322C28", textTransform: "uppercase" }}>{title}</span>
        </span>
        <span className="flex items-center gap-4">
          {valueLabel && <span style={{ fontSize: "clamp(14px,1.2vw,17px)", fontWeight: 500, color: "#B89B6A" }}>{valueLabel}</span>}
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.18em", color: "#B89B6A", textTransform: "uppercase" }}>
            {open ? "Ocultar" : "Desplegar"}
          </span>
          <span className="rounded-full flex items-center justify-center shrink-0 transition-transform" style={{ width: 30, height: 30, border: "1px solid rgba(50,44,40,0.25)", fontSize: 14, color: "#322C28", transform: open ? "rotate(180deg)" : "none" }}>↓</span>
        </span>
      </button>
      <div style={{ overflow: "hidden", maxHeight: open ? 400 : 0, opacity: open ? 1 : 0, transition: "max-height .55s cubic-bezier(.16,1,.3,1), opacity .4s" }}>
        <div style={{ padding: "4px 4px 24px" }}>{children}</div>
      </div>
    </div>
  );
}

function BookingSection() {
  const days = bookingDays();
  const [openStep, setOpenStep] = useState<"day" | "hour" | "contact" | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [rut, setRut] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState("Medicina estética");
  const [step, setStep] = useState<"form" | "success" | "error">("form");
  const [submitting, setSubmitting] = useState(false);
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoaded, setSlotsLoaded] = useState(false);

  useEffect(() => {
    if (!date) { setSlots([]); setSlotsLoaded(false); return; }
    setSlotsLoaded(false);
    fetch(`/api/booking/slots-paola?date=${date}`)
      .then((r) => r.json())
      .then((d) => { setSlots(d.slots || []); setSlotsLoaded(true); })
      .catch(() => { setSlots([]); setSlotsLoaded(true); });
  }, [date]);

  const handleConfirm = async () => {
    if (!name || !rut || !phone || !email || !date || !time) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/booking/slots-paola", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, rut, email, phone, date, hour: time, topic }),
      });
      setStep(res.ok ? "success" : "error");
    } catch {
      setStep("error");
    }
    setSubmitting(false);
  };

  const selectStyle = { border: "1px solid rgba(50,44,40,0.2)", borderRadius: 12, background: "#f0ebe5", color: "#322C28", padding: "16px 18px", fontSize: 15, width: "100%" };
  const ready = !!(name && rut && phone && email && date && time);
  const dayLabel = days.find((d) => d.id === date)?.label;

  return (
    <section id="agenda" className="mt-24" style={{ background: "#f0ebe5", padding: "clamp(100px,15vh,200px) clamp(20px,5vw,72px) clamp(110px,16vh,210px)" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div className="text-center">
          <p style={{ color: "#B89B6A", fontSize: "clamp(14px,1.15vw,18px)", fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase" }}>Reserva</p>
          <h2 className="mt-3" style={{ fontFamily: "'Instrument Sans',sans-serif", fontWeight: 600, fontSize: "clamp(26px,3.4vw,54px)", lineHeight: 1.06, letterSpacing: "-0.015em" }}>
            Agenda tu evaluación <span style={{ color: "#B89B6A" }}>100% online</span>
          </h2>
          <p className="mx-auto mt-4" style={{ maxWidth: "46ch", color: "#5A5148", fontFamily: "'Instrument Sans',sans-serif", fontSize: "clamp(14px,1.05vw,16px)", lineHeight: 1.75 }}>Martes y jueves · bloques de 40 minutos entre 10:00 y 16:00.</p>
        </div>

        <div className="mt-11 rounded-3xl" style={{ background: "#fff", border: "1px solid rgba(50,44,40,0.14)", padding: "clamp(18px,2.2vw,32px) clamp(20px,2.6vw,40px)" }}>
          <AccordionStep num="01" title="Día de la evaluación" valueLabel={dayLabel} open={openStep === "day"} onToggle={() => setOpenStep(openStep === "day" ? null : "day")}>
            <select value={date} onChange={(e) => { setDate(e.target.value); setTime(""); }} style={selectStyle}>
              <option value="">Selecciona un día · martes y jueves</option>
              {days.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
            </select>
          </AccordionStep>

          <AccordionStep num="02" title="Hora" valueLabel={time ? `${time} h` : undefined} open={openStep === "hour"} onToggle={() => setOpenStep(openStep === "hour" ? null : "hour")}>
            {!date ? (
              <p style={{ color: "#8C8378", fontSize: 14 }}>Elige primero un día.</p>
            ) : slotsLoaded && slots.length === 0 ? (
              <p style={{ color: "#8C8378", fontSize: 14 }}>No hay horas disponibles para este día.</p>
            ) : (
              <select value={time} onChange={(e) => setTime(e.target.value)} style={selectStyle}>
                <option value="">Bloques de 40 min · 10:00 a 16:00</option>
                {slots.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            )}
          </AccordionStep>

          <AccordionStep num="03" title="Datos de contacto" valueLabel={name || undefined} open={openStep === "contact"} onToggle={() => setOpenStep(openStep === "contact" ? null : "contact")}>
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre y apellido" style={selectStyle} />
              <input value={rut} onChange={(e) => setRut(e.target.value)} placeholder="RUT" style={selectStyle} />
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Teléfono / WhatsApp" style={selectStyle} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={selectStyle} />
              <select value={topic} onChange={(e) => setTopic(e.target.value)} style={selectStyle}>
                <option>Medicina estética</option>
                <option>Odontología general</option>
                <option>Implantología</option>
                <option>Aún no lo sé</option>
              </select>
            </div>
          </AccordionStep>

          {step === "form" && (
            <div className="pt-7 flex justify-center">
              <button onClick={handleConfirm} disabled={!ready || submitting} className="rounded-full transition-all pc-cta-pulse"
                style={{ padding: "22px 54px", background: "#B89B6A", color: "#fff", boxShadow: "0 16px 36px rgba(184,155,106,0.4)", fontSize: 14, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", cursor: ready ? "pointer" : "not-allowed" }}>
                {submitting ? "Confirmando…" : "Confirmar reserva"}
              </button>
            </div>
          )}

          {step === "success" && (
            <div className="pt-7 text-center space-y-3">
              <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(184,155,106,0.15)" }}>
                <Check className="h-7 w-7" style={{ color: "#B89B6A" }} />
              </div>
              <p className="font-semibold pc-serif text-xl">¡Reserva enviada!</p>
              <p className="text-sm" style={{ color: "#5A5148" }}>Te enviamos los detalles a <strong>{email}</strong>. Confirma tu hora desde el correo.</p>
            </div>
          )}

          {step === "error" && (
            <div className="pt-7 text-center space-y-3">
              <p className="text-sm" style={{ color: "#5A5148" }}>Hubo un problema al confirmar la reserva. Inténtalo de nuevo o escríbenos por WhatsApp.</p>
              <button onClick={handleConfirm} className="rounded-full text-sm" style={{ padding: "12px 28px", background: "#727f89", color: "#fff" }}>Reintentar</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Cierre() {
  return (
    <section id="cierre" className="relative overflow-hidden" style={{ height: "clamp(560px,96vh,980px)", background: "#727f89" }}>
      <img src={ctaImg} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: "52% 40%", filter: "grayscale(0.18) brightness(0.86)" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(114,127,137,0.55), rgba(114,127,137,0.8))" }} />
      <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
        <h2 className="pc-serif" style={{ fontWeight: 300, fontSize: "clamp(38px,6.4vw,110px)", maxWidth: "16ch", color: "#F4F2EE" }}>
          La confianza comienza con una <em style={{ fontStyle: "italic", color: "#E3D3B4" }}>conversación.</em>
        </h2>
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola Dra. Paola, me gustaría agendar una evaluación presencial.")}`} target="_blank" rel="noreferrer"
            className="rounded-full transition-all hover:-translate-y-1" style={{ padding: "20px 38px", border: "1px solid rgba(244,242,238,0.6)", background: "rgba(244,242,238,0.08)", color: "#F4F2EE", fontSize: 12, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase" }}>
            Agenda presencial
          </a>
          <a href="#agenda" className="pc-cta-pulse rounded-full" style={{ padding: "20px 38px", background: "#B89B6A", color: "#fff", fontSize: 12, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase" }}>
            Agenda online
          </a>
        </div>
      </div>
    </section>
  );
}

const FAQS = [
  { q: "¿Cómo agendo mi primera evaluación?", a: "Puedes reservar directamente desde el botón \"Agenda online\" o escribirme por WhatsApp. En la primera cita conversamos, evalúo tu caso y te explico las alternativas con sus tiempos y valores." },
  { q: "¿Cuánto dura una consulta inicial?", a: "Entre 40 y 60 minutos. Es un espacio para revisar tu salud oral, entender qué te preocupa y armar juntos un plan realista, sin apuros ni presión." },
  { q: "¿Los tratamientos duelen?", a: "Trabajo con anestesia y protocolos pensados para que estés cómoda o cómodo en todo momento. La mayoría de los pacientes describe los procedimientos como mucho más llevaderos de lo que imaginaban." },
  { q: "¿Los resultados se ven naturales?", a: "Ese es el objetivo. Tanto en implantología como en medicina estética diseño cada tratamiento respetando tus rasgos: la idea es que se note el cambio, no el procedimiento." },
  { q: "¿Cuánto demora un implante dental?", a: "Depende de cada caso. En general el proceso completo toma entre 3 y 6 meses, considerando la integración del implante al hueso antes de instalar la corona definitiva." },
  { q: "¿Qué formas de pago aceptan?", a: "Efectivo, transferencia y tarjetas de débito y crédito. También trabajamos con planes en cuotas para tratamientos de mayor extensión." },
];

function FAQ() {
  const [listOpen, setListOpen] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="faq" style={{ background: "#f0ebe5", padding: "clamp(100px,15vh,200px) clamp(20px,5vw,72px)" }}>
      <div className="mx-auto text-center" style={{ maxWidth: 1000 }}>
        <p style={{ color: "#B89B6A", fontSize: "clamp(14px,1.15vw,18px)", fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase" }}>Preguntas frecuentes</p>
        <h2 className="pc-serif mt-4" style={{ fontWeight: 300, fontSize: "clamp(30px,4.4vw,68px)" }}>Todo lo que necesitas saber antes de tu cita</h2>
        <div className="mt-10 flex justify-center">
          <button onClick={() => setListOpen((v) => !v)} className="inline-flex items-center rounded-full transition-colors hover:bg-[#322C28] hover:text-[#f0ebe5]"
            style={{ gap: 14, padding: "16px 32px", border: "1px solid rgba(50,44,40,0.3)", fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#322C28" }}>
            <span>{listOpen ? "Ocultar preguntas" : "Ver preguntas"}</span>
            <span style={{ fontSize: 15, lineHeight: 1, transition: "transform .6s cubic-bezier(.16,1,.3,1)", transform: listOpen ? "rotate(180deg)" : "none" }}>↓</span>
          </button>
        </div>
        <div style={{ overflow: "hidden", maxHeight: listOpen ? 3000 : 0, opacity: listOpen ? 1 : 0, transition: "max-height .7s cubic-bezier(.16,1,.3,1), opacity .5s" }}>
          <div className="mt-14 text-left">
            {FAQS.map((f, i) => (
              <div key={f.q} style={{ borderBottom: "1px solid rgba(50,44,40,0.16)" }}>
                <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-center gap-4 text-center" style={{ padding: "clamp(22px,3vh,30px) 0", fontWeight: 500, fontSize: "clamp(16px,1.4vw,21px)", color: "#322C28" }}>
                  {f.q}
                  <span className="rounded-full flex items-center justify-center shrink-0 transition-transform" style={{ width: 34, height: 34, border: "1px solid rgba(50,44,40,0.25)", color: "#B89B6A", transform: open === i ? "rotate(135deg)" : "none" }}>+</span>
                </button>
                {open === i && (
                  <p className="text-center mx-auto pb-8" style={{ maxWidth: "70ch", color: "#5A5148", lineHeight: 1.8 }}>{f.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ background: "#f0ebe5", borderTop: "1px solid rgba(50,44,40,0.12)", padding: "clamp(60px,9vh,110px) clamp(20px,5vw,72px) 36px" }}>
      <div className="flex flex-wrap justify-between" style={{ gap: "clamp(36px,6vw,90px)" }}>
        <div>
          <p className="pc-serif" style={{ fontWeight: 300, fontSize: "clamp(28px,3.4vw,52px)" }}>Dra. Paola<br />Cárdenas Fica</p>
          <p className="mt-2 text-[13px]" style={{ color: "#8C8378" }}>Cirujana Dentista · Especialista en Implantología Bucomaxilofacial</p>
          <div className="mt-6 flex gap-3">
            <a href="https://www.instagram.com/dra.cardenasfica/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full text-[11px] uppercase" style={{ padding: "11px 20px", border: "1px solid rgba(50,44,40,0.18)", letterSpacing: "0.18em" }}>
              <InstagramIcon className="h-3.5 w-3.5" /> Instagram
            </a>
          </div>
        </div>
        <div>
          <h4 className="text-[10px] uppercase" style={{ fontWeight: 600, letterSpacing: "0.26em", color: "#B89B6A" }}>Navegación</h4>
          <ul className="mt-5 space-y-3 text-sm" style={{ color: "#5A5148" }}>
            <li><a href="#filosofia">Filosofía</a></li>
            <li><a href="#tratamientos">Tratamientos</a></li>
            <li><a href="#resultados">Antes y después</a></li>
            <li><a href="#dra">Quién soy</a></li>
            <li><a href="#testimonios">Reseñas</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[10px] uppercase" style={{ fontWeight: 600, letterSpacing: "0.26em", color: "#B89B6A" }}>Consulta</h4>
          <ul className="mt-5 space-y-3 text-sm" style={{ color: "#5A5148" }}>
            <li>Viña del Mar, Chile</li>
            <li>Lunes a viernes · 09:00 – 19:00</li>
            <li><a href="#agenda">Agenda online</a></li>
            <li><a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer">+56 9 7125 2179</a></li>
          </ul>
        </div>
      </div>
      <div className="mt-16 pt-6 flex flex-col sm:flex-row gap-3 items-center justify-between text-[11px] uppercase" style={{ borderTop: "1px solid rgba(50,44,40,0.12)", letterSpacing: "0.16em", color: "#8C8378" }}>
        <p>© {new Date().getFullYear()} Dra. Paola Cárdenas Fica</p>
        <p style={{ opacity: 0.7 }}>Powered by Somaos</p>
      </div>
    </footer>
  );
}

function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola Dra. Paola, tengo una consulta.")}`}
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
