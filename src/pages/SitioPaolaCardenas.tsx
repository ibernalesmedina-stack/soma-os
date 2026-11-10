import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Check, ExternalLink, Eye, ScanFace } from "lucide-react";
import { TRATAMIENTOS, CATEGORIAS } from "./paola/datos";
import { SITE_STYLES, Footer, WhatsAppButton, WHATSAPP_NUMBER, useMeta, waLink, tc } from "./paola/comun";
import TratamientoPagina from "./paola/TratamientoPagina";
import PrivacidadPaola from "./paola/PrivacidadPaola";

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

function useScrollToHash() {
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView(), 80);
    return () => clearTimeout(t);
  }, [hash]);
}

function Inicio() {
  useMeta({
    title: "Dra. Paola Cárdenas Fica · Implantología, Odontología y Estética Facial",
    description: "Cirujana Dentista especialista en Implantología Bucomaxilofacial. Implantes, odontología general y estética facial en Edificio Soho, Concón. Agenda tu evaluación.",
    path: "/",
    image: heroImg,
  });
  useScrollToHash();
  return (
    <>
      <style>{SITE_STYLES}</style>
      <main className="pc-site min-h-screen overflow-x-hidden">
        <Nav />
        <Hero />
        <SobreMi />
        <Tratamientos />
        <AntesDespues />
        <CitaDiagnostico />
        <BookingSection />
        <Cierre />
        <Testimonios />
        <FAQ />
        <Footer />
        <WhatsAppButton />
      </main>
    </>
  );
}

export default function SitioPaolaCardenas() {
  const { pathname } = useLocation();
  const m = pathname.match(/^\/tratamientos\/([a-z0-9-]+)\/?$/);
  if (m) return <TratamientoPagina slug={m[1]} />;
  if (/^\/politica-de-privacidad\/?$/.test(pathname)) return <PrivacidadPaola />;
  return <Inicio />;
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
    <section id="top" className="relative overflow-hidden" style={{ minHeight: "520px", height: "78vh", background: "#727f89" }}>
      <img src={heroImg} alt="Dra. Paola Cárdenas Fica" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: "62% 34%", filter: "grayscale(0.2) brightness(0.82) sepia(0.08)" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(114,127,137,0.88) 0%, rgba(50,44,40,0.45) 44%, rgba(50,44,40,0.14) 72%, rgba(114,127,137,0.34) 100%)" }} />
      <div className="absolute" style={{ left: "clamp(20px,5vw,72px)", right: "clamp(20px,5vw,72px)", bottom: "clamp(36px,7vh,80px)" }}>
        <p style={{ color: "#E3D3B4", fontSize: "clamp(11px,0.95vw,14px)", letterSpacing: "0.32em", textTransform: "uppercase" }}>Implantología · Odontología · Estética facial</p>
        <h1 className="pc-serif mt-3" style={{ color: "#F4F2EE", fontWeight: 300, fontSize: "clamp(44px,6.2vw,100px)", lineHeight: 0.96, letterSpacing: "-0.03em", textShadow: "0 2px 40px rgba(114,127,137,0.4)" }}>
          No solo<br />restauramos sonrisas.<br /><em style={{ color: "#E3D3B4", fontStyle: "italic" }}>Devolvemos confianza.</em>
        </h1>
        <div className="mt-7 flex flex-wrap gap-3.5">
          <a href="#tratamientos" className="rounded-full transition-all hover:-translate-y-1" style={{ padding: "17px 32px", border: "1px solid rgba(244,242,238,0.6)", background: "rgba(244,242,238,0.08)", color: "#F4F2EE", fontSize: "13px", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase" }}>
            Ver tratamientos
          </a>
          <a href="#agenda" className="pc-cta-pulse rounded-full" style={{ padding: "17px 32px", background: "#B89B6A", color: "#fff", fontSize: "13px", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase" }}>
            Agenda online
          </a>
        </div>
      </div>
    </section>
  );
}

function SobreMi() {
  const [tab, setTab] = useState(0);
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);
  const { ref, visible } = useReveal();
  const x0 = useRef<{ x: number; y: number } | null>(null);
  const { hash } = useLocation();

  useEffect(() => { if (hash === "#filosofia") setTab(1); else if (hash === "#dra") setTab(0); }, [hash]);
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

  const h2 = { margin: "0 0 clamp(22px,3vh,30px)", fontWeight: 300, fontSize: "clamp(36px,4.2vw,68px)", lineHeight: 1.02, letterSpacing: "-0.025em", color: "#322C28" } as const;
  const p_ = { margin: "0 0 18px", maxWidth: "54ch", fontSize: "clamp(15px,1.1vw,17px)", lineHeight: 1.8, color: "#5A5148" } as const;
  const panel = (i: number) => ({
    gridArea: "1 / 1",
    transition: "opacity .6s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1), visibility .7s",
    opacity: tab === i ? 1 : 0,
    visibility: (tab === i ? "visible" : "hidden") as "visible" | "hidden",
    pointerEvents: (tab === i ? "auto" : "none") as "auto" | "none",
    transform: tab === i ? "none" : `translateX(${i < tab ? -40 : 40}px)`,
  });
  const tabBtn = (i: number, label: string) => (
    <button role="tab" aria-selected={tab === i} onClick={() => setTab(i)} className="rounded-full transition-colors"
      style={{ padding: "11px 22px", fontSize: 11, fontWeight: 700, letterSpacing: ".22em", textTransform: "uppercase", background: tab === i ? "#727f89" : "transparent", color: tab === i ? "#F4F2EE" : "#8C8378" }}>
      {label}
    </button>
  );

  return (
    <section id="dra" ref={ref} className="relative" style={{ background: "#f0ebe5", padding: "clamp(90px,13vh,170px) clamp(20px,5vw,72px)" }}>
      <span id="filosofia" className="absolute top-0" />
      <div className="mx-auto grid lg:grid-cols-12 items-center" style={{ maxWidth: 1280, gap: "clamp(28px,4vw,72px)" }}>
        <Reveal className="lg:col-span-5">
          <div className="rounded-[18px] overflow-hidden" style={{ aspectRatio: "4/5", boxShadow: "0 30px 70px rgba(50,44,40,.12)" }}>
            <img src={portraitImg} alt="Dra. Paola Cárdenas Fica" className="w-full h-full object-cover" loading="lazy" />
          </div>
        </Reveal>
        <Reveal delay={120} className="lg:col-span-6 lg:col-start-7">
          <div role="tablist" aria-label="Sobre la doctora" className="inline-flex rounded-full" style={{ gap: 6, padding: 5, border: "1px solid rgba(50,44,40,.14)", background: "#fff", marginBottom: "clamp(30px,4.5vh,48px)" }}>
            {tabBtn(0, "Quién soy")}
            {tabBtn(1, "Mi enfoque")}
          </div>
          <div className="grid" style={{ touchAction: "pan-y" }}
            onPointerDown={(e) => { x0.current = { x: e.clientX, y: e.clientY }; }}
            onPointerUp={(e) => {
              if (!x0.current) return;
              const dx = e.clientX - x0.current.x, dy = e.clientY - x0.current.y;
              x0.current = null;
              if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) setTab(dx < 0 ? 1 : 0);
            }}>
            <div role="tabpanel" aria-hidden={tab !== 0} style={panel(0)}>
              <h2 className="pc-serif" style={h2}>Dra. Paola <em style={{ fontStyle: "italic", color: "#8C7B62" }}>Cárdenas Fica</em></h2>
              <p style={p_}>Soy Cirujana Dentista y Especialista en Implantología Bucomaxilofacial. Con más de 6 años de experiencia y más de 3.000 pacientes atendidos, he complementado mi formación con perfeccionamientos en implantología y estética en Chile y el extranjero.</p>
              <p style={p_}>Integro ciencia, precisión y una mirada estética para crear tratamientos personalizados, con resultados naturales y duraderos.</p>
              <div className="flex flex-wrap" style={{ gap: "clamp(30px,5vw,64px)", borderTop: "1px solid rgba(50,44,40,.14)", paddingTop: 28, marginTop: "clamp(14px,2vh,24px)" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "clamp(36px,3.4vw,54px)", lineHeight: 1, color: "#8C7B62" }}>{count1}+</div>
                  <p className="mt-2.5 text-[11px]" style={{ letterSpacing: "0.22em", textTransform: "uppercase", color: "#8C8378" }}>Años de experiencia</p>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "clamp(36px,3.4vw,54px)", lineHeight: 1, color: "#8C7B62" }}>{count2.toLocaleString("es-CL")}+</div>
                  <p className="mt-2.5 text-[11px]" style={{ letterSpacing: "0.22em", textTransform: "uppercase", color: "#8C8378" }}>Pacientes atendidos</p>
                </div>
              </div>
            </div>
            <div role="tabpanel" aria-hidden={tab !== 1} style={panel(1)}>
              <h2 className="pc-serif" style={h2}>Una odontología centrada en las <em style={{ fontStyle: "italic", color: "#8C7B62" }}>personas</em></h2>
              <p style={p_}>Creo que la odontología va mucho más allá de un diagnóstico o un procedimiento. Cada paciente tiene una historia, necesidades y expectativas distintas, por eso creo en una atención cercana, donde escuchar es tan importante como tratar.</p>
              <p style={p_}>Mi enfoque combina rehabilitación oral y armonización estética: una sonrisa no solo debe recuperar su función, sino también potenciar la confianza y el bienestar de cada persona.</p>
              <div className="flex flex-wrap gap-3" style={{ marginTop: "clamp(14px,2vh,24px)" }}>
                {["Confianza", "Excelencia", "Armonía"].map((v) => (
                  <span key={v} className="rounded-full" style={{ padding: "11px 22px", border: "1px solid #B89B6A", fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase" }}>{v}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center" style={{ gap: 18, marginTop: "clamp(28px,4vh,40px)" }}>
            {[0, 1].map((d) => (
              <button key={d} aria-label={d ? "Siguiente" : "Anterior"} disabled={tab === d} onClick={() => setTab(d)}
                className="rounded-full inline-flex items-center justify-center transition-colors hover:bg-[#322C28] hover:text-[#f0ebe5] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#322C28]"
                style={{ width: 44, height: 44, border: "1px solid rgba(50,44,40,.22)", color: "#322C28" }}>{d ? "→" : "←"}</button>
            ))}
            <span className="relative overflow-hidden" style={{ flex: 1, maxWidth: 120, height: 1, background: "rgba(50,44,40,.15)" }}>
              <i className="absolute inset-y-0 left-0" style={{ width: "50%", background: "#B89B6A", transform: `translateX(${tab * 100}%)`, transition: "transform .7s cubic-bezier(.16,1,.3,1)" }} />
            </span>
            <span style={{ fontSize: 11, letterSpacing: ".22em", color: "#8C8378" }}><b style={{ color: "#322C28", fontWeight: 600 }}>0{tab + 1}</b> / 02</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const ICONO_TARJETA: Record<string, React.ComponentType<IconProps>> = {
  "tratamiento-de-ojeras": Eye,
  "mesoplastia-de-papada": ScanFace,
};

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint]);
  return isMobile;
}

function Tratamientos() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const titulo = Array.from({ length: 6 }, (_, k) => (
    <span key={k} className="inline-flex items-center" style={{ gap: "clamp(28px,3.4vw,60px)", paddingRight: "clamp(28px,3.4vw,60px)" }}>
      <span className="pc-serif whitespace-nowrap" style={{ fontWeight: 300, fontSize: "clamp(34px,4.4vw,70px)", lineHeight: 1.1, letterSpacing: "-0.02em", color: "#F4F2EE" }}>
        Nuestros <em style={{ fontStyle: "italic", color: "#E3D3B4" }}>tratamientos</em>
      </span>
      <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: "clamp(10px,.9vw,14px)", height: "clamp(10px,.9vw,14px)", flex: "0 0 auto" }}>
        <path d="M12 2c.5 5.3 4.7 9.5 10 10-5.3.5-9.5 4.7-10 10-.5-5.3-4.7-9.5-10-10 5.3-.5 9.5-4.7 10-10z" fill="#E3D3B4" />
      </svg>
    </span>
  ));
  const precioYBotones = (slug: string, resumen: string) => (
    <div className="mt-5">
      <span className="block" style={{ fontSize: 12, letterSpacing: "0.24em", color: "rgba(244,242,238,0.6)" }}>PRECIO</span>
      <span className="block font-semibold" style={{ color: "#E3D3B4", fontSize: "clamp(16px,4.2vw,22px)" }}>{resumen}</span>
      <div className="mt-4 flex items-center justify-between gap-2">
        <a href="#agenda" onClick={(e) => e.stopPropagation()} className="rounded-full font-medium uppercase" style={{ padding: "9px clamp(12px,3.5vw,20px)", background: "#B89B6A", color: "#fff", letterSpacing: "0.14em", fontSize: "clamp(10px,2.6vw,13px)" }}>
          Agendar
        </a>
        <Link to={`/tratamientos/${slug}`} onClick={(e) => e.stopPropagation()} className="uppercase whitespace-nowrap" style={{ color: "#E3D3B4", letterSpacing: "0.16em", fontSize: "clamp(10px,2.6vw,12px)", fontWeight: 600 }}>
          Más información →
        </Link>
      </div>
    </div>
  );
  return (
    <section id="tratamientos" style={{ background: "#f0ebe5", padding: "0 0 clamp(90px,13vh,180px)" }}>
      <div style={{ background: "#727f89", padding: "clamp(18px,2.6vh,30px) 0" }}>
        <h2 aria-label="Nuestros tratamientos" className="overflow-hidden" style={{ margin: 0, WebkitMaskImage: "linear-gradient(90deg,transparent,#000 10%,#000 90%,transparent)", maskImage: "linear-gradient(90deg,transparent,#000 10%,#000 90%,transparent)" }}>
          <span aria-hidden="true" className="pc-title-marquee flex" style={{ width: "max-content" }}>{titulo}{titulo}</span>
        </h2>
      </div>
      {CATEGORIAS.map((cat, ci) => {
        const items = cat.slugs.map((s) => TRATAMIENTOS[s]);
        const moves = items.length > 3 || isMobile;
        return (
        <div key={cat.title} style={{ marginTop: "clamp(44px,6.5vh,84px)" }}>
          <div className="mx-auto text-center px-6" style={{ maxWidth: "1100px" }}>
            <h3 className="pc-serif" style={{ fontWeight: 600, fontSize: "clamp(30px,3.6vw,60px)", letterSpacing: "-0.02em" }}>{tc(cat.title)}</h3>
            <p className="mx-auto mt-4" style={{ maxWidth: "58ch", color: "#5A5148", fontSize: "clamp(16px,1.2vw,19px)", lineHeight: 1.6 }}>{cat.desc}</p>
          </div>
          <div className={`mt-10 px-6 ${moves ? "overflow-hidden" : "overflow-x-auto"}`}>
          <div className={`flex ${moves ? "pc-treat-marquee" : "justify-center"}`} style={{ gap: "clamp(16px,1.6vw,26px)", scrollbarWidth: "none", width: moves ? "max-content" : undefined }}>
            {(moves ? [...items, ...items] : items).map((it, i) => {
              const ir = () => navigate(`/tratamientos/${it.slug}`);
              const num = String((i % items.length) + 1).padStart(2, "0");
              if (!it.img) {
                const Icono = ICONO_TARJETA[it.slug];
                return (
                  <article key={`${it.slug}-${i}`} onClick={ir} className="relative shrink-0 rounded-2xl overflow-hidden flex flex-col cursor-pointer" style={{ width: "clamp(260px,24vw,380px)", aspectRatio: "3/4", background: "#727f89", padding: "clamp(20px,2.2vw,28px)" }}>
                    <span style={{ fontSize: 13, letterSpacing: "0.22em", color: "rgba(244,242,238,0.7)" }}>{num}</span>
                    <div className="flex-1 flex items-center justify-center" style={{ minHeight: 0 }}>
                      {Icono
                        ? <Icono strokeWidth={1} style={{ width: "30%", height: "auto", maxHeight: "100%", color: "rgba(244,242,238,0.8)" }} />
                        : <img src="/icono-implante.png" alt="" className="w-auto h-auto opacity-80" style={{ maxWidth: "38%", maxHeight: "100%" }} />}
                    </div>
                    <div>
                      <h4 style={{ color: "#F4F2EE", fontWeight: 600, fontSize: it.name.length > 26 ? "clamp(18px,1.55vw,23px)" : "clamp(20px,1.9vw,28px)", lineHeight: 1.2 }}>{tc(it.name)}</h4>
                      <p className="mt-3 leading-relaxed" style={{ color: "rgba(244,242,238,0.8)", fontSize: "clamp(14px,1.2vw,16px)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{it.desc}</p>
                      {precioYBotones(it.slug, it.resumen)}
                    </div>
                  </article>
                );
              }
              return (
                <article key={`${it.slug}-${i}`} onClick={ir} className="group relative shrink-0 rounded-2xl overflow-hidden cursor-pointer" style={{ width: "clamp(260px,24vw,380px)", aspectRatio: "3/4", background: "#727f89" }}>
                  <img src={it.img} alt={tc(it.name)} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <span className="absolute top-4 left-4" style={{ fontSize: 13, letterSpacing: "0.22em", color: "rgba(244,242,238,0.7)" }}>{num}</span>
                  <div className="absolute inset-0 flex flex-col justify-end p-6" style={{ background: "linear-gradient(to top, rgba(114,127,137,0.88) 0%, rgba(114,127,137,0.15) 52%, rgba(114,127,137,0.05) 100%)" }}>
                    <h4 style={{ color: "#F4F2EE", fontWeight: 600, fontSize: "clamp(22px,1.9vw,28px)" }}>{tc(it.name)}</h4>
                    <p className="mt-1.5" style={{ color: "rgba(244,242,238,0.75)", fontSize: "clamp(14px,1.15vw,16px)" }}>{it.sub}</p>
                  </div>
                  <div className="absolute inset-0 flex flex-col justify-end p-7 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(114,127,137,0.93)", backdropFilter: "blur(6px)" }}>
                    <h4 style={{ color: "#F4F2EE", fontWeight: 600, fontSize: "clamp(22px,1.9vw,28px)" }}>{tc(it.name)}</h4>
                    <p className="mt-3 leading-relaxed" style={{ color: "rgba(244,242,238,0.8)", fontSize: "clamp(15px,1.25vw,17px)", display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{it.desc}</p>
                    {precioYBotones(it.slug, it.resumen)}
                  </div>
                </article>
              );
            })}
          </div>
          </div>
        </div>
        );
      })}
    </section>
  );
}

function CitaDiagnostico() {
  return (
    <section id="diagnostico" style={{ background: "#f0ebe5", padding: "clamp(60px,9vh,120px) clamp(20px,5vw,72px) 0" }}>
      <Reveal>
        <div className="mx-auto grid lg:grid-cols-12 items-center" style={{ maxWidth: 1180, gap: "clamp(28px,4vw,64px)", background: "#727f89", color: "#F4F2EE", borderRadius: 20, padding: "clamp(36px,5vw,80px) clamp(26px,5vw,80px)" }}>
          <div className="lg:col-span-7">
            <p style={{ fontSize: "clamp(12px,0.95vw,14px)", fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase", color: "#E3D3B4", marginBottom: 22 }}>El primer paso</p>
            <h2 className="pc-serif" style={{ margin: "0 0 26px", fontWeight: 300, fontSize: "clamp(38px,4.6vw,72px)", lineHeight: 1, letterSpacing: "-0.025em" }}>
              Cita <em style={{ fontStyle: "italic", color: "#E3D3B4" }}>diagnóstico</em>
            </h2>
            <p style={{ margin: "0 0 18px", maxWidth: "52ch", fontSize: 15, lineHeight: 1.8, color: "rgba(244,242,238,0.85)" }}>Es el momento más importante de tu tratamiento. Evaluamos tu rostro y tu sonrisa, conversamos sobre lo que quieres lograr y lo que esperas del resultado.</p>
            <p style={{ margin: 0, maxWidth: "52ch", fontSize: 15, lineHeight: 1.8, color: "rgba(244,242,238,0.85)" }}>A partir de esa conversación planificamos cada paso a seguir, para que sepas con claridad cómo llegaremos a tu objetivo.</p>
          </div>
          <div className="lg:col-span-5">
            <div style={{ border: "1px solid rgba(244,242,238,0.25)", borderRadius: 16, padding: "clamp(24px,2.4vw,36px)" }}>
              <div className="flex justify-between items-baseline gap-4" style={{ paddingBottom: 16, borderBottom: "1px solid rgba(244,242,238,0.18)" }}>
                <span style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(244,242,238,0.7)" }}>Modalidad</span>
                <span style={{ fontSize: 15 }}>Presencial</span>
              </div>
              <div className="flex justify-between items-baseline gap-4" style={{ padding: "16px 0 20px" }}>
                <span style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(244,242,238,0.7)" }}>Valor</span>
                <span style={{ fontWeight: 600, fontSize: "clamp(26px,2.4vw,34px)", lineHeight: 1, color: "#E3D3B4" }}>$20.000</span>
              </div>
              <div className="flex gap-3 items-start" style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(240,235,229,0.14)", marginBottom: 24 }}>
                <span style={{ color: "#E3D3B4", fontSize: 14, lineHeight: 1.4 }}>✦</span>
                <span style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(244,242,238,0.92)" }}>Si te realizas el tratamiento <strong style={{ fontWeight: 600, color: "#fff" }}>el mismo día</strong>, el valor de la cita se descuenta del total.</span>
              </div>
              <a href="#agenda" className="block text-center rounded-full" style={{ padding: "16px 22px", background: "#B89B6A", color: "#fff", fontSize: 11, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase" }}>Agendar cita</a>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

const testimonioImgs = ["/paola-testimonio-1.jpg", "/paola-testimonio-2.jpg", "/paola-testimonio-3.jpg"];
const testimonioVideo = "/paola-testimonio.mp4";

function AntesDespues() {
  return (
    <section id="resultados" style={{ background: "#f0ebe5", padding: "clamp(24px,4vh,60px) clamp(20px,5vw,72px) clamp(70px,10vh,140px)" }}>
      <div className="text-center py-10">
        <h2 style={{ fontFamily: "'Instrument Sans',sans-serif", fontWeight: 600, fontSize: "clamp(30px,2.6vw,42px)", textTransform: "uppercase", color: "#322C28" }}>Antes y después</h2>
        <p className="mt-2" style={{ color: "#8C8378", fontSize: "clamp(13px,1.05vw,16px)" }}>de nuestros pacientes</p>
      </div>
      <div className="mx-auto grid md:grid-cols-2 items-start" style={{ maxWidth: 1200, gap: "clamp(14px,1.6vw,22px)" }}>
        <div className="relative grid grid-rows-3 gap-3">
          {testimonioImgs.map((src, i) => (
            <div key={src} className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: "7/3" }}>
              <img src={src} alt={`Antes ${i + 1}`} className="w-full h-full object-cover block" />
            </div>
          ))}
          <span className="absolute top-4 left-4 rounded-full z-10" style={{ padding: "6px 16px", background: "rgba(114,127,137,0.75)", backdropFilter: "blur(4px)", color: "#F4F2EE", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase" }}>Antes</span>
        </div>
        <div className="relative rounded-2xl overflow-hidden mt-4 md:mt-0" style={{ aspectRatio: "3/4" }}>
          <video src={testimonioVideo} className="w-full h-full object-cover block" autoPlay muted loop playsInline controls />
          <span className="absolute top-4 left-4 rounded-full" style={{ padding: "6px 16px", background: "rgba(184,155,106,0.9)", color: "#fff", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase" }}>Después</span>
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
  { q: "El resultado se ve mío. Nadie notó el tratamiento, todos notaron el cambio.", a: "Francisca M.", t: "Estética facial" },
  { q: "Vine por un implante y me fui con la seguridad de volver a hablar sin taparme.", a: "Rodrigo T.", t: "Implantología" },
];

function Testimonios() {
  return (
    <section id="testimonios" style={{ position: "relative", background: "#f0ebe5", padding: "clamp(110px,17vh,220px) clamp(20px,5vw,72px)", overflow: "hidden" }}>
      <div style={{ position: "relative", zIndex: 2 }}>
        <h2 className="text-center" style={{ fontFamily: "'Instrument Sans',sans-serif", fontWeight: 600, fontSize: "clamp(32px,3.4vw,54px)", letterSpacing: "-0.01em", color: "#322C28" }}>Reseñas reales de pacientes</h2>
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
      <button onClick={onToggle} className="w-full flex items-center justify-between gap-2 sm:gap-4" style={{ padding: "22px 4px" }}>
        <span className="flex items-center gap-2 sm:gap-4 min-w-0">
          <span className="shrink-0" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.22em", color: "#B89B6A" }}>{num}</span>
          <span className="truncate" style={{ fontSize: "clamp(14px,1.3vw,19px)", fontWeight: 400, letterSpacing: "0.06em", color: "#322C28", textTransform: "uppercase" }}>{title}</span>
        </span>
        <span className="flex items-center gap-2 sm:gap-4 shrink-0">
          {valueLabel && <span className="hidden sm:inline" style={{ fontSize: "clamp(14px,1.2vw,17px)", fontWeight: 500, color: "#B89B6A" }}>{valueLabel}</span>}
          <span className="hidden sm:inline" style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.18em", color: "#B89B6A", textTransform: "uppercase" }}>
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
  const [topic, setTopic] = useState("Estética facial");
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
    <section id="agenda" style={{ background: "#f0ebe5", padding: "clamp(60px,9vh,110px) clamp(20px,5vw,72px) clamp(80px,12vh,150px)" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div className="text-center">
          <p style={{ color: "#B89B6A", fontSize: "clamp(14px,1.15vw,18px)", fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase" }}>Reserva</p>
          <h2 className="mt-3" style={{ fontFamily: "'Instrument Sans',sans-serif", fontWeight: 600, fontSize: "clamp(34px,4.2vw,62px)", lineHeight: 1.06, letterSpacing: "-0.015em" }}>
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
                <option>Estética facial</option>
                <option>Odontología general</option>
                <option>Implantología</option>
                <option>Aún no lo sé</option>
              </select>
            </div>
          </AccordionStep>

          {step === "form" && (
            <div className="pt-7 flex justify-center">
              <button onClick={handleConfirm} disabled={!ready || submitting} className="rounded-full transition-all pc-cta-pulse whitespace-nowrap"
                style={{ padding: "18px clamp(28px,7vw,54px)", background: "#B89B6A", color: "#fff", boxShadow: "0 16px 36px rgba(184,155,106,0.4)", fontSize: "clamp(12px,3.2vw,14px)", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", cursor: ready ? "pointer" : "not-allowed" }}>
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
  { q: "¿Los resultados se ven naturales?", a: "Ese es el objetivo. Tanto en implantología como en estética facial diseño cada tratamiento respetando tus rasgos: la idea es que se note el cambio, no el procedimiento." },
  { q: "¿Cuánto demora un implante dental?", a: "Depende de cada caso. En general el proceso completo toma entre 3 y 6 meses, considerando la integración del implante al hueso antes de instalar la corona definitiva." },
  { q: "¿Qué formas de pago aceptan?", a: "Efectivo, transferencia y tarjetas de débito y crédito. También trabajamos con planes en cuotas para tratamientos de mayor extensión." },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="faq" style={{ background: "#727f89", padding: "clamp(70px,10vh,120px) clamp(20px,5vw,72px)" }}>
      <div className="mx-auto grid lg:grid-cols-12 items-start" style={{ maxWidth: 1180, gap: "clamp(28px,4vw,72px)" }}>
        <div className="lg:col-span-4">
          <p style={{ color: "#E3D3B4", fontSize: "clamp(12px,0.95vw,14px)", fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase", marginBottom: 18 }}>Preguntas frecuentes</p>
          <h2 className="pc-serif" style={{ margin: "0 0 20px", fontWeight: 300, fontSize: "clamp(30px,3.2vw,50px)", lineHeight: 1.05, letterSpacing: "-0.02em", color: "#F4F2EE" }}>
            Todo lo que necesitas saber antes de tu <em style={{ fontStyle: "italic", color: "#E3D3B4" }}>cita</em>
          </h2>
          <p style={{ margin: "0 0 22px", fontSize: 14, lineHeight: 1.7, color: "rgba(244,242,238,0.75)" }}>¿Tienes otra pregunta? Escríbenos y te respondemos personalmente.</p>
          <a href={waLink("Hola Dra. Paola, tengo una consulta.")} target="_blank" rel="noreferrer" className="inline-flex rounded-full transition-colors hover:bg-[#F4F2EE] hover:text-[#322C28]"
            style={{ padding: "13px 24px", border: "1px solid rgba(244,242,238,0.4)", color: "#F4F2EE", fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase" }}>
            Hacer una pregunta
          </a>
        </div>
        <div className="lg:col-span-7 lg:col-start-6" style={{ borderTop: "1px solid rgba(244,242,238,0.2)" }}>
          {FAQS.map((f, i) => (
            <div key={f.q} style={{ borderBottom: "1px solid rgba(244,242,238,0.2)" }}>
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between gap-4 text-left transition-colors hover:text-[#E3D3B4]"
                style={{ padding: "clamp(16px,2.2vh,22px) 0", fontWeight: 500, fontSize: "clamp(15px,1.2vw,18px)", lineHeight: 1.4, color: "#F4F2EE" }}>
                {f.q}
                <span className="rounded-full flex items-center justify-center shrink-0 transition-transform" style={{ width: 30, height: 30, border: "1px solid rgba(244,242,238,0.35)", color: "#E3D3B4", transform: open === i ? "rotate(135deg)" : "none" }}>+</span>
              </button>
              <div style={{ overflow: "hidden", maxHeight: open === i ? 400 : 0, opacity: open === i ? 1 : 0, transition: "max-height .6s cubic-bezier(.16,1,.3,1), opacity .5s" }}>
                <p style={{ margin: "0 0 18px", maxWidth: "62ch", fontSize: "clamp(14px,1vw,15.5px)", lineHeight: 1.75, color: "rgba(244,242,238,0.85)" }}>{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
