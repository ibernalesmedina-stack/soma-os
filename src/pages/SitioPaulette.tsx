import { useState, useEffect, useCallback } from "react";
import { ArrowRight, MessageCircle, Sparkles, Heart, Activity, Stethoscope, Star, ExternalLink, Check, Sprout, Apple, Dumbbell, Instagram as InstagramIcon } from "lucide-react";

const heroImg = "/paulette-consulta.jpg";
const consultaImg = "/paulette-laptop.jpg";
const runningImg = "/paulette-running.jpg";
const mayneLogo = "/mayne-performance-logo.png";

const GOOGLE_REVIEWS_URL = "https://www.google.com/search?q=elliot+nutrition+google#lrd=0x9689c39f59a34a27:0x9f6d29dd3dcbc2ca,1,,,,";

const SITE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600;1,700&family=Roboto:wght@300;400;500;700&display=swap');

  .paulette-site {
    --en-emerald-deep: oklch(0.28 0.06 165);
    --en-emerald: oklch(0.45 0.10 165);
    --en-gold: oklch(0.75 0.12 85);
    --en-gold-soft: oklch(0.92 0.06 90);
    --en-cream: oklch(0.97 0.02 90);
    --en-card: oklch(0.99 0.01 90);
    --en-border: oklch(0.88 0.02 90);
    --en-muted: oklch(0.45 0.03 165);
    --en-secondary: oklch(0.93 0.03 90);
    --en-fg: oklch(0.20 0.04 165);
    background-color: var(--en-cream);
    color: var(--en-fg);
    font-family: 'Roboto', system-ui, sans-serif;
  }
  .paulette-site h1, .paulette-site h2, .paulette-site h3,
  .paulette-site .en-serif {
    font-family: 'Barlow', sans-serif !important;
  }
  @keyframes en-scroll { from { transform: translateX(0) } to { transform: translateX(-50%) } }
  @keyframes en-reviews-scroll { from { transform: translateX(0) } to { transform: translateX(-50%) } }
  .en-marquee { animation: en-scroll 22s linear infinite; }
  .en-reviews { animation: en-reviews-scroll 60s linear infinite; }
  .en-reviews:hover { animation-play-state: paused; }
`;

type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  price_online: number;
  duration_min: number;
  modality: string;
};

type BookingPlan = { name: string; price: number; id: string; duration_min: number };

function buildPrices(services: Service[]): {
  Presencial: { nuevo: BookingPlan[]; control: BookingPlan[] };
  Online: { nuevo: BookingPlan[]; control: BookingPlan[] };
} {
  const toBooking = (s: Service, online: boolean): BookingPlan => ({
    name: s.name,
    price: online ? s.price_online : s.price,
    id: s.id,
    duration_min: s.duration_min,
  });
  const isControl = (s: Service) => s.duration_min <= 30 || s.name.toLowerCase().includes("control");
  const consultations = services.filter((s) => !isControl(s));
  const controls = services.filter(isControl);
  return {
    Presencial: {
      nuevo: consultations.map((s) => toBooking(s, false)),
      control: controls.map((s) => toBooking(s, false)),
    },
    Online: {
      nuevo: consultations.map((s) => toBooking(s, true)),
      control: controls.map((s) => toBooking(s, true)),
    },
  };
}

const FALLBACK_SERVICES: Service[] = [
  { id: "1", name: "Consulta Inicial", description: "Evaluación inicial completa con plan personalizado.", price: 42000, price_online: 38000, duration_min: 60, modality: "ambos" },
  { id: "2", name: "Plan 3 Meses", description: "Para generar cambios reales.", price: 110000, price_online: 100000, duration_min: 60, modality: "ambos" },
  { id: "3", name: "Plan 6 Meses", description: "Para una transformación profunda.", price: 200000, price_online: 180000, duration_min: 60, modality: "ambos" },
  { id: "4", name: "Control Nutricional", description: "Seguimiento de tu proceso.", price: 40000, price_online: 40000, duration_min: 30, modality: "ambos" },
];

const formatCLP = (n: number) => "$" + n.toLocaleString("es-CL");

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "behold-widget": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { "feed-id"?: string }, HTMLElement>;
    }
  }
}

function useSEO() {
  useEffect(() => {
    document.title = "Paulette Elliot · Nutricionista | elliotnutrition.com";

    const setMeta = (attr: string, val: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${val}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, val); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };

    const desc = "Soy Paulette Elliot, nutricionista. Acompaño a personas que quieren mejorar su alimentación sin caer en extremos ni frustraciones. Mi enfoque combina ciencia, hábitos y bienestar real.";
    setMeta("name", "description", desc);
    setMeta("name", "robots", "index, follow");
    setMeta("property", "og:title", "Paulette Elliot · Nutricionista");
    setMeta("property", "og:description", "Nutricionista integrativa en Chile. Consultas presenciales y online. Reserva tu hora directamente.");
    setMeta("property", "og:url", "https://www.elliotnutrition.com");
    setMeta("property", "og:image", "https://www.elliotnutrition.com/paulette-consulta.jpg");
    setMeta("property", "og:type", "website");
    setMeta("property", "og:site_name", "Elliot Nutrition");
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", "Paulette Elliot · Nutricionista");
    setMeta("name", "twitter:description", "Nutricionista integrativa en Chile. Consultas presenciales y online.");
    setMeta("name", "twitter:image", "https://www.elliotnutrition.com/paulette-consulta.jpg");

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement("link") as HTMLLinkElement; canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = "https://www.elliotnutrition.com";
  }, []);
}

export default function SitioPaulette() {
  useSEO();
  const [services, setServices] = useState<Service[]>(FALLBACK_SERVICES);

  useEffect(() => {
    fetch("/api/booking/slots?action=services")
      .then((r) => r.json())
      .then((d) => { if (d.services?.length) setServices(d.services); })
      .catch(() => {});
  }, []);

  return (
    <>
      <style>{SITE_STYLES}</style>
      <main className="paulette-site min-h-screen overflow-x-hidden">
        <Nav />
        <Hero />
        <Marquee />
        <About />
        <Impact />
        <Services services={services} />
        <Approach />
        <Pricing services={services} />
        <Testimonials />
        <Partner />
        <CTA services={services} />
        <InstagramFeed />
        <Footer />
      </main>
    </>
  );
}

function Nav() {
  return (
    <header className="absolute top-0 left-0 right-0 z-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-5 sm:py-6 flex items-center justify-between gap-3">
        <a href="https://www.instagram.com/elliotnutrition/" target="_blank" rel="noreferrer" style={{ color: "var(--en-emerald-deep)" }} className="min-w-0">
          <span className="font-sans text-[13px] sm:text-lg lg:text-xl font-bold tracking-[0.14em] sm:tracking-[0.18em] whitespace-nowrap">ELLIOT NUTRITION</span>
        </a>
        <nav className="hidden md:flex items-center gap-8">
          {["#sobre|Sobre mí", "#servicios|Servicios", "#enfoque|Enfoque", "#resenas|Reseñas"].map((item) => {
            const [href, label] = item.split("|");
            return <a key={href} href={href} style={{ color: "var(--en-emerald-deep)", fontSize: "1rem", fontWeight: 700, letterSpacing: "0.02em" }} className="hover:opacity-70 transition-opacity">{label}</a>;
          })}
        </nav>
        <a href="#agenda" className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-3.5 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 transition-colors" style={{ background: "var(--en-gold)", color: "var(--en-emerald-deep)" }}>
          Reservar <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 sm:pt-32 pb-14 sm:pb-16 lg:pt-40 lg:pb-20" style={{ background: "linear-gradient(180deg, oklch(0.68 0.10 85) 0%, oklch(0.28 0.06 165) 55%)", color: "var(--en-cream)" }}>
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, var(--en-gold) 1px, transparent 1px), radial-gradient(circle at 80% 70%, var(--en-gold) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-10 grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7">
          <span className="inline-flex items-center gap-2 rounded-full px-3 sm:px-4 py-1.5 text-[10px] sm:text-sm font-semibold uppercase tracking-[0.18em]" style={{ background: "var(--en-gold)", color: "var(--en-emerald-deep)" }}>
            <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Nutricionista · Presencial y Online
          </span>
          <h1 className="mt-5 sm:mt-6 text-[2.5rem] leading-[1] sm:text-6xl lg:text-7xl xl:text-8xl sm:leading-[0.95] text-balance font-bold" style={{ fontFamily: "'Barlow', sans-serif" }}>
            Transforma tu salud con <em style={{ color: "var(--en-gold)" }}>hábitos reales</em> y sostenibles.
          </h1>
          <p className="mt-6 sm:mt-8 max-w-xl text-base sm:text-lg leading-relaxed" style={{ color: "oklch(0.97 0.02 90 / 0.75)" }}>
            Consulta nutricional presencial u online con Paulette Elliot. Planes de nutrición personalizados para rendimiento deportivo, composición corporal y salud clínica. Boleta válida para Isapre.
          </p>
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <a href="#agenda" className="inline-flex items-center justify-center gap-2 rounded-full px-6 sm:px-7 py-3.5 text-sm font-medium transition-all hover:scale-[1.02]" style={{ background: "var(--en-gold)", color: "var(--en-emerald-deep)" }}>
              Reserva tu hora <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#servicios" className="inline-flex items-center justify-center gap-2 rounded-full px-6 sm:px-7 py-3.5 text-sm font-medium transition-colors" style={{ border: "1px solid oklch(0.97 0.02 90 / 0.3)", color: "var(--en-cream)" }}>
              Ver programas
            </a>
          </div>
          <ul className="mt-10 sm:mt-14 flex flex-col gap-3 text-[11px] sm:text-xs uppercase tracking-[0.16em]" style={{ color: "oklch(0.97 0.02 90 / 0.7)" }}>
            {["Atención personalizada", "Enfoque científico", "Acompañamiento cercano"].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full shrink-0" style={{ background: "var(--en-gold)", color: "var(--en-emerald-deep)" }}>
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-5">
          <div className="relative overflow-hidden rounded-t-[120px] sm:rounded-t-[180px] rounded-b-3xl shadow-2xl" style={{ border: "1px solid oklch(0.75 0.12 85 / 0.2)", background: "var(--en-cream)" }}>
            <img src={heroImg} alt="Paulette Elliot, nutricionista" className="w-full h-auto block" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const items = [
    { t: "Nutrición deportiva", i: Dumbbell }, { t: "Hábitos sostenibles", i: Sprout },
    { t: "Rendimiento", i: Dumbbell }, { t: "Composición corporal", i: Apple },
    { t: "Salud integral", i: Sprout }, { t: "Acompañamiento real", i: Apple },
  ];
  return (
    <div className="py-4 sm:py-5 overflow-hidden" style={{ background: "var(--en-gold)", borderTop: "1px solid oklch(0.75 0.12 85 / 0.4)" }}>
      <div className="flex gap-8 sm:gap-12 whitespace-nowrap en-marquee">
        {[...items, ...items, ...items].map((it, i) => {
          const Icon = it.i;
          return (
            <span key={i} className="text-base sm:text-xl inline-flex items-center italic font-bold" style={{ color: "var(--en-emerald-deep)", fontFamily: "'Barlow', sans-serif" }}>
              {it.t} <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-8 sm:ml-12" strokeWidth={1.8} style={{ color: "oklch(0.28 0.06 165 / 0.5)" }} />
            </span>
          );
        })}
      </div>
    </div>
  );
}

function About() {
  return (
    <section id="sobre" className="py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10 grid lg:grid-cols-12 gap-10 lg:gap-20 items-center">
        <div className="lg:col-span-5 order-2 lg:order-1">
          <div className="overflow-hidden rounded-2xl" style={{ background: "var(--en-cream)" }}>
            <img src={runningImg} alt="Paulette corriendo" className="w-full h-auto block" loading="lazy" />
          </div>
        </div>
        <div className="lg:col-span-7 order-1 lg:order-2">
          <h2 className="text-[2.25rem] sm:text-4xl lg:text-6xl leading-[1.05] text-balance font-bold" style={{ fontFamily: "'Barlow', sans-serif" }}>
            Sobre <em style={{ color: "var(--en-emerald)" }}>mí</em>.
          </h2>
          <div className="mt-8 space-y-5 leading-relaxed" style={{ color: "oklch(0.20 0.04 165 / 0.8)" }}>
            <p>Soy <strong style={{ color: "var(--en-emerald-deep)" }}>Paulette Elliot</strong>, nutricionista <strong style={{ color: "var(--en-emerald-deep)" }}>titulada de la Universidad Andrés Bello</strong>, con <strong style={{ color: "var(--en-emerald-deep)" }}>Diplomado en Nutrición Aplicada a la Actividad Física y el Deporte</strong> y <strong style={{ color: "var(--en-emerald-deep)" }}>+6 años de experiencia clínica</strong>.</p>
            <p>La nutrición deportiva ha sido una de mis mayores pasiones desde muy joven. Como atleta y con más de <strong style={{ color: "var(--en-emerald-deep)" }}>15 años en el mundo del running</strong>, viví en primera persona los desafíos que enfrenta quien busca rendir más y transformar sus hábitos.</p>
            <p>Por eso mi enfoque combina <strong style={{ color: "var(--en-emerald-deep)", fontWeight: 700 }}>ciencia, educación y hábitos sostenibles</strong>, entendiendo que cada proceso es distinto.</p>
            <p className="text-xl lg:text-2xl leading-snug pt-2 italic" style={{ color: "var(--en-emerald-deep)", fontFamily: "'Barlow', sans-serif" }}>
              «Aquí no se trata de hacerlo perfecto. Se trata de construir algo que sí puedas mantener.»
            </p>
          </div>
          <p className="mt-8 text-2xl italic" style={{ color: "var(--en-emerald-deep)", fontFamily: "'Barlow', sans-serif" }}>— Paulette Elliot B.</p>
        </div>
      </div>
    </section>
  );
}

function Impact() {
  const stats = [
    { n: "+3.000", l: "Atenciones realizadas" }, { n: "+15", l: "Años en el deporte" },
    { n: "+6", l: "Años de experiencia clínica" }, { n: "100%", l: "Enfoque personalizado" },
  ];
  return (
    <section className="py-14" style={{ background: "var(--en-emerald-deep)", color: "var(--en-cream)" }}>
      <div className="mx-auto max-w-7xl px-6 lg:px-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-6 text-center">
        {stats.map((s) => (
          <div key={s.l}>
            <div className="text-5xl lg:text-6xl font-bold" style={{ fontFamily: "'Barlow', sans-serif", color: "var(--en-gold)" }}>{s.n}</div>
            <p className="mt-2 text-sm uppercase tracking-wider" style={{ color: "oklch(0.97 0.02 90 / 0.7)" }}>{s.l}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const SERVICE_ICONS = [Heart, Activity, Stethoscope, Star];

function Services({ services }: { services: Service[] }) {
  const displayServices = services.filter(s => s.duration_min > 30).slice(0, 4);
  return (
    <section id="servicios" className="py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-sm uppercase tracking-[0.25em] font-semibold" style={{ color: "var(--en-emerald)" }}>Servicios de nutrición</span>
          <h2 className="mt-4 text-[2.25rem] sm:text-4xl lg:text-6xl leading-[1.05] text-balance font-bold" style={{ fontFamily: "'Barlow', sans-serif" }}>
            Tres caminos, un solo <em style={{ color: "var(--en-emerald)" }}>propósito</em>.
          </h2>
          <p className="mt-5 text-base sm:text-lg max-w-xl mx-auto" style={{ color: "var(--en-muted)" }}>Nutrición deportiva, hábitos sostenibles y salud clínica. Cada plan se adapta a tu objetivo y estilo de vida.</p>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {displayServices.map((s, i) => {
            const Icon = SERVICE_ICONS[i % SERVICE_ICONS.length];
            return (
            <article key={s.id} className="rounded-2xl p-8 transition-all hover:-translate-y-1 hover:shadow-xl" style={{ background: "var(--en-card)", border: "1px solid var(--en-border)" }}>
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ background: "var(--en-emerald-deep)", color: "var(--en-gold)" }}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs tabular-nums" style={{ color: "var(--en-muted)" }}>0{i + 1}</span>
              </div>
              <h3 className="mt-8 text-3xl" style={{ fontFamily: "'Barlow', sans-serif", color: "var(--en-emerald-deep)" }}>{s.name}</h3>
              <p className="mt-5 leading-relaxed" style={{ color: "oklch(0.20 0.04 165 / 0.7)" }}>{s.description}</p>
            </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Approach() {
  const steps = [
    { n: "01", t: "Evaluación inicial", d: "Conversamos sobre tu historia, hábitos, contexto y objetivos. Sin juicios." },
    { n: "02", t: "Plan a tu medida", d: "Diseño una estrategia realista que se ajusta a tu rutina, no al revés." },
    { n: "03", t: "Acompañamiento", d: "Seguimiento cercano, ajustes y educación para que los cambios sean tuyos." },
  ];
  return (
    <section id="enfoque" className="py-14 lg:py-20" style={{ background: "var(--en-secondary)" }}>
      <div className="mx-auto max-w-7xl px-6 lg:px-10 grid lg:grid-cols-2 gap-16 items-center">
        <div className="overflow-hidden rounded-2xl" style={{ background: "var(--en-cream)" }}>
          <img src={consultaImg} alt="Paulette en consulta" className="w-full h-auto block" loading="lazy" />
        </div>
        <div>
          <span className="text-sm uppercase tracking-[0.25em] font-semibold" style={{ color: "var(--en-emerald)" }}>Cómo trabajamos</span>
          <h2 className="mt-4 text-4xl lg:text-5xl leading-[1.1] text-balance font-bold" style={{ fontFamily: "'Barlow', sans-serif" }}>
            Un plan que <em style={{ color: "var(--en-emerald)" }}>funciona</em> en tu vida real.
          </h2>
          <div className="mt-10 space-y-8">
            {steps.map((s) => (
              <div key={s.n} className="flex gap-6 pb-8 last:border-0" style={{ borderBottom: "1px solid var(--en-border)" }}>
                <span className="text-3xl shrink-0 font-bold" style={{ fontFamily: "'Barlow', sans-serif", color: "var(--en-gold)" }}>{s.n}</span>
                <div>
                  <h3 className="text-2xl" style={{ fontFamily: "'Barlow', sans-serif", color: "var(--en-emerald-deep)" }}>{s.t}</h3>
                  <p className="mt-2" style={{ color: "oklch(0.20 0.04 165 / 0.7)" }}>{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Pricing({ services }: { services: Service[] }) {
  const [mode, setMode] = useState<"presencial" | "online">("presencial");
  const plans = services
    .filter(s => s.duration_min > 30)
    .map(s => ({
      id: s.id,
      title: s.name,
      desc: s.description,
      price: { presencial: formatCLP(s.price), online: formatCLP(s.price_online) },
      duration: `${s.duration_min} minutos`,
    }));
  return (
    <section id="planes" className="py-14 lg:py-20" style={{ background: "oklch(0.88 0.07 130)" }}>
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <div className="text-center">
          <h2 className="text-[2.5rem] sm:text-5xl lg:text-7xl leading-[1.02] text-balance font-bold" style={{ fontFamily: "'Barlow', sans-serif" }}>
            Planes de <em style={{ color: "var(--en-emerald)" }}>nutrición</em>
          </h2>
          <p className="mt-5 sm:mt-6 max-w-2xl mx-auto text-base sm:text-lg" style={{ color: "oklch(0.20 0.04 165 / 0.7)" }}>
            Presencial o online. Boleta electrónica válida para Isapre.
          </p>
          <div className="mt-10 inline-flex items-center rounded-full p-1.5" style={{ background: "var(--en-emerald-deep)" }}>
            {(["presencial", "online"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)} className="px-7 py-2.5 rounded-full text-xs uppercase tracking-[0.2em] font-medium transition-all" style={mode === m ? { background: "var(--en-gold)", color: "var(--en-emerald-deep)" } : { color: "oklch(0.97 0.02 90 / 0.7)" }}>
                {m === "presencial" ? "Presencial" : "Online"}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <article key={p.id} className="rounded-3xl p-6 sm:p-8 flex flex-col shadow-sm" style={{ background: "var(--en-cream)" }}>
              <h3 className="mt-2 text-3xl sm:text-4xl" style={{ fontFamily: "'Barlow', sans-serif", color: "var(--en-emerald-deep)" }}>{p.title}</h3>
              <p className="mt-3 text-sm sm:text-base leading-relaxed" style={{ color: "oklch(0.20 0.04 165 / 0.7)" }}>{p.desc}</p>
              <div className="mt-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl lg:text-6xl font-bold" style={{ fontFamily: "'Barlow', sans-serif", color: "var(--en-emerald-deep)" }}>{p.price[mode]}</span>
                  <span className="text-xs uppercase tracking-wider" style={{ color: "oklch(0.20 0.04 165 / 0.6)" }}>CLP</span>
                </div>
                <p className="mt-2 text-xs uppercase tracking-[0.16em] leading-relaxed" style={{ color: "oklch(0.20 0.04 165 / 0.6)" }}>{p.duration}</p>
              </div>
              <div className="flex-1" />
              <a href="#agenda" className="mt-8 inline-flex items-center justify-between gap-2 rounded-full px-6 py-3.5 text-sm font-medium transition-colors" style={{ background: "var(--en-emerald-deep)", color: "var(--en-cream)" }}>
                Agenda tu consulta <ArrowRight className="h-4 w-4" />
              </a>
            </article>
          ))}
        </div>
        <div className="mt-16 text-center">
          <h3 className="text-3xl lg:text-4xl font-bold" style={{ fontFamily: "'Barlow', sans-serif", color: "var(--en-emerald-deep)" }}>¿No sabes cuál elegir?</h3>
          <p className="mt-3" style={{ color: "oklch(0.20 0.04 165 / 0.7)" }}>Escríbeme por WhatsApp y te oriento sin compromiso.</p>
          <a href="https://wa.me/56942156610" target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium" style={{ background: "var(--en-emerald-deep)", color: "var(--en-cream)" }}>
            <MessageCircle className="h-4 w-4" /> Hablar por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const reviews = [
    { q: "Por fin entendí que no necesitaba dietas extremas. Paulette me dio herramientas que sigo usando dos años después.", a: "Camila R.", t: "Hábitos", r: 5 },
    { q: "Mejoré mis tiempos en maratón sin sentir que vivía contando calorías. Su enfoque deportivo es real.", a: "Diego M.", t: "Running", r: 5 },
    { q: "Cercana, profesional y empática. Me sentí escuchada desde la primera consulta.", a: "Francisca P.", t: "Bienestar", r: 5 },
    { q: "Excelente atención. Logré bajar de peso de manera saludable y mantenerlo en el tiempo.", a: "María José L.", t: "Composición", r: 5 },
    { q: "Como deportista amateur, me cambió la forma de comer y de rendir. 100% recomendada.", a: "Sebastián V.", t: "Rendimiento", r: 5 },
    { q: "Súper profesional y empática. Las pautas son realistas y se adaptan a la vida diaria.", a: "Javiera A.", t: "Hábitos", r: 5 },
    { q: "Me ayudó muchísimo con mi proceso post embarazo. Sin restricciones absurdas, todo con base científica.", a: "Antonia S.", t: "Salud", r: 5 },
    { q: "El mejor acompañamiento que he tenido. Recomendada 100%.", a: "Cristóbal R.", t: "Rendimiento", r: 5 },
  ];
  const avg = (reviews.reduce((a, r) => a + r.r, 0) / reviews.length).toFixed(1);
  const GoogleIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34.5 6.1 29.5 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.4 0 10.3-2.1 14-5.4l-6.5-5.5c-2 1.5-4.6 2.4-7.5 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.5 5.5C40.9 36 44 30.5 44 24c0-1.3-.1-2.3-.4-3.5z"/>
    </svg>
  );
  return (
    <section id="resenas" className="py-12 lg:py-16" style={{ background: "var(--en-cream)" }}>
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col items-center text-center gap-4">
          <h2 className="text-3xl lg:text-4xl leading-[1.1] max-w-2xl text-balance font-bold" style={{ fontFamily: "'Barlow', sans-serif" }}>
            Reseñas reales de pacientes de <em style={{ color: "var(--en-emerald)" }}>Elliot Nutrition</em>.
          </h2>
          <a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 rounded-full px-4 py-2 shadow-sm" style={{ background: "var(--en-card)", border: "1px solid var(--en-border)" }}>
            <GoogleIcon />
            <span className="text-lg leading-none font-bold" style={{ fontFamily: "'Barlow', sans-serif", color: "var(--en-emerald-deep)" }}>{avg}</span>
            <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5" style={{ fill: "var(--en-gold)", color: "var(--en-gold)" }} />)}</div>
            <span className="text-xs inline-flex items-center gap-1 pl-3" style={{ borderLeft: "1px solid var(--en-border)", color: "var(--en-muted)" }}>
              Ver en Google <ExternalLink className="h-3 w-3" />
            </span>
          </a>
        </div>
        <div className="mt-8 -mx-6 lg:-mx-10 overflow-hidden" style={{ maskImage: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)" }}>
          <div className="flex gap-4 w-max en-reviews">
            {[...reviews, ...reviews].map((r, i) => (
              <figure key={i} className="shrink-0 w-[75vw] sm:w-[320px] rounded-2xl p-5 flex flex-col text-sm" style={{ background: "var(--en-card)", border: "1px solid var(--en-border)" }}>
                <div className="flex items-center justify-between">
                  <div className="flex">{[...Array(r.r)].map((_, k) => <Star key={k} className="h-4 w-4" style={{ fill: "var(--en-gold)", color: "var(--en-gold)" }} />)}</div>
                  <GoogleIcon />
                </div>
                <blockquote className="mt-3 leading-relaxed italic flex-1 text-base" style={{ color: "oklch(0.20 0.04 165 / 0.8)", fontFamily: "'Barlow', sans-serif" }}>"{r.q}"</blockquote>
                <figcaption className="mt-4 pt-3 flex items-center justify-between" style={{ borderTop: "1px solid var(--en-border)" }}>
                  <span className="font-medium text-sm" style={{ color: "var(--en-emerald-deep)" }}>{r.a}</span>
                  <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--en-muted)" }}>{r.t}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Partner() {
  return (
    <section id="partner" className="py-16 lg:py-24" style={{ background: "var(--en-emerald-deep)", color: "var(--en-cream)" }}>
      <div className="mx-auto max-w-6xl px-6 lg:px-10 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="order-2 lg:order-1">
          <span className="inline-block text-sm uppercase tracking-[0.3em] font-semibold" style={{ color: "var(--en-gold)" }}>Alianza</span>
          <h2 className="mt-4 text-4xl sm:text-5xl lg:text-6xl leading-[1.05] font-bold" style={{ fontFamily: "'Barlow', sans-serif" }}>
            Official Partner <br /><em style={{ color: "var(--en-gold)" }}>Nutrition &amp; Performance</em>
          </h2>
          <p className="mt-6 leading-relaxed text-lg" style={{ color: "oklch(0.97 0.02 90 / 0.8)" }}>
            Junto a <strong style={{ color: "var(--en-gold)" }}>Mayne Performance</strong>, mis pacientes acceden a un <strong style={{ color: "var(--en-gold)" }}>20% de descuento exclusivo</strong> en sus servicios.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm" style={{ border: "1px solid oklch(0.97 0.02 90 / 0.25)" }}>
              <Sparkles className="h-4 w-4" /> 20% descuento exclusivo
            </span>
            <span className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm" style={{ border: "1px solid oklch(0.97 0.02 90 / 0.25)" }}>
              <Dumbbell className="h-4 w-4" /> Entrenamiento profesional
            </span>
          </div>
          <a href="https://wa.me/56982202717" target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold transition-colors" style={{ background: "var(--en-gold)", color: "var(--en-emerald-deep)" }}>
            <MessageCircle className="h-4 w-4" /> Contactar Mayne Performance
          </a>
        </div>
        <div className="order-1 lg:order-2">
          <div className="rounded-3xl p-10 lg:p-14 flex items-center justify-center shadow-xl" style={{ background: "var(--en-cream)" }}>
            <img src={mayneLogo} alt="Mayne Performance" className="w-full max-w-sm h-auto" loading="lazy" />
          </div>
        </div>
      </div>
    </section>
  );
}

function CTA({ services }: { services: Service[] }) {
  const [modality, setModality] = useState<"Presencial" | "Online">("Presencial");
  const [patient, setPatient] = useState<"nuevo" | "control">("nuevo");
  const [planIdx, setPlanIdx] = useState(0);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [rut, setRut] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"form" | "success" | "error">("form");
  const [submitting, setSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  const PRICES = buildPrices(services);
  const plans = PRICES[modality][patient];
  const currentPlan = plans[Math.min(planIdx, plans.length - 1)];

  const isSunday = (d: string) => d ? new Date(d + "T12:00:00").getDay() === 0 : false;

  // Load available slots when date changes
  useEffect(() => {
    if (!date || !currentPlan || isSunday(date)) { setAvailableSlots([]); return; }
    fetch(`/api/booking/slots?date=${date}&duration=${currentPlan.duration_min}`)
      .then(r => r.json())
      .then(d => setAvailableSlots(d.slots || []))
      .catch(() => setAvailableSlots([]));
  }, [date, currentPlan?.duration_min]);

  const slots = isSunday(date) ? [] : (
    availableSlots.length > 0 ? availableSlots : (
      patient === "nuevo"
        ? ["09:00","10:00","11:00","12:00","13:00","15:00","16:00","17:00","18:00","19:00"]
        : ["09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30"]
    )
  );

  const handleConfirm = async () => {
    if (!name || !date || !time) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/booking/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, rut, email, phone, date,
          hour: time,
          esControl: patient === "control",
          serviceName: currentPlan.name,
          amount: currentPlan.price,
          modo: modality.toLowerCase(),
        }),
      });
      if (res.ok) {
        setStep("success");
      } else {
        setStep("error");
      }
    } catch {
      setStep("error");
    }
    setSubmitting(false);
  };

  const inputStyle = { border: "1px solid oklch(0.28 0.06 165 / 0.15)", background: "var(--en-card)" };

  return (
    <section id="agenda" className="py-14 sm:py-16 lg:py-24" style={{ background: "oklch(0.94 0.06 90)", color: "var(--en-emerald-deep)" }}>
      <div className="mx-auto max-w-3xl px-5 sm:px-6 lg:px-10">
        <div className="text-center">
          <span className="inline-block text-sm uppercase tracking-[0.3em] font-semibold" style={{ color: "var(--en-emerald)" }}>Reserva</span>
          <h2 className="mt-3 text-[2rem] sm:text-5xl lg:text-6xl leading-none font-bold" style={{ fontFamily: "'Barlow', sans-serif" }}>
            Agenda tu <em style={{ color: "var(--en-emerald)" }}>consulta</em>
          </h2>
        </div>
        <div className="mt-10 space-y-7 rounded-3xl p-5 sm:p-10 shadow-sm" style={{ background: "var(--en-card)", border: "1px solid oklch(0.28 0.06 165 / 0.1)" }}>
          <div>
            <EnLabel>Modalidad</EnLabel>
            <div className="mt-3 grid grid-cols-2 gap-2 p-1.5 rounded-full" style={{ background: "oklch(0.28 0.06 165 / 0.05)" }}>
              {(["Presencial", "Online"] as const).map((m) => (
                <button key={m} onClick={() => { setModality(m); setPlanIdx(0); }} className="py-2.5 rounded-full text-sm font-medium transition-all" style={modality === m ? { background: "var(--en-emerald-deep)", color: "var(--en-cream)" } : { color: "oklch(0.28 0.06 165 / 0.6)" }}>
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <EnLabel>Tipo de consulta</EnLabel>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {([{ id: "nuevo", label: "Paciente nuevo", meta: "60 min" }, { id: "control", label: "Control", meta: "30 min" }] as const).map((opt) => (
                <button key={opt.id} onClick={() => { setPatient(opt.id); setPlanIdx(0); setTime(""); }} className="rounded-xl p-4 text-left transition-all" style={{ border: patient === opt.id ? "1px solid var(--en-emerald)" : "1px solid oklch(0.28 0.06 165 / 0.1)", background: patient === opt.id ? "oklch(0.45 0.10 165 / 0.05)" : "transparent" }}>
                  <span className="block text-sm font-medium">{opt.label}</span>
                  <span className="block text-xs mt-0.5" style={{ color: "oklch(0.28 0.06 165 / 0.6)" }}>{opt.meta}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <EnLabel>Plan</EnLabel>
            <div className="mt-3 space-y-2">
              {plans.map((p, i) => (
                <button key={p.name} onClick={() => setPlanIdx(i)} className="w-full flex items-center justify-between gap-4 rounded-xl px-4 py-3.5 transition-all" style={{ border: i === planIdx ? "1px solid var(--en-emerald)" : "1px solid oklch(0.28 0.06 165 / 0.1)", background: i === planIdx ? "oklch(0.45 0.10 165 / 0.05)" : "transparent" }}>
                  <span className="text-sm font-medium">{p.name}</span>
                  <span className="text-sm font-mono">{formatCLP(p.price)}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <EnLabel>Fecha</EnLabel>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-3 w-full rounded-xl px-4 py-3 text-sm outline-none" style={inputStyle} />
            </div>
            <div>
              <EnLabel>Hora</EnLabel>
              {isSunday(date) ? (
                <p className="mt-3 rounded-xl px-4 py-3 text-sm" style={{ background: "oklch(0.28 0.06 165 / 0.05)", border: "1px solid oklch(0.28 0.06 165 / 0.15)", color: "oklch(0.28 0.06 165 / 0.6)" }}>
                  No hay atención los domingos
                </p>
              ) : (
                <select value={time} onChange={(e) => setTime(e.target.value)} className="mt-3 w-full rounded-xl px-4 py-3 text-sm outline-none" style={inputStyle}>
                  <option value="">Seleccionar</option>
                  {slots.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              )}
            </div>
          </div>
          <div>
            <EnLabel>Tus datos</EnLabel>
            <div className="mt-3 grid sm:grid-cols-2 gap-3">
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre completo" className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={inputStyle} />
              <input type="text" value={rut} onChange={(e) => setRut(e.target.value)} placeholder="RUT" className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={inputStyle} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo electrónico" className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={inputStyle} />
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Teléfono" className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={inputStyle} />
            </div>
          </div>
          {step === "form" && (
            <div className="pt-6" style={{ borderTop: "1px solid oklch(0.28 0.06 165 / 0.1)" }}>
              <div className="flex items-baseline justify-between">
                <span className="text-xs uppercase tracking-[0.2em]" style={{ color: "oklch(0.28 0.06 165 / 0.6)" }}>Total</span>
                <span className="text-3xl font-bold" style={{ fontFamily: "'Barlow', sans-serif" }}>{formatCLP(currentPlan.price)}</span>
              </div>
              <button
                onClick={handleConfirm}
                disabled={submitting || !name || !date || !time}
                className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-full py-4 text-sm font-semibold transition-colors"
                style={{ background: (submitting || !name || !date || !time) ? "oklch(0.45 0.10 165 / 0.4)" : "var(--en-emerald-deep)", color: "var(--en-cream)" }}
              >
                {submitting ? "Confirmando reserva…" : <>Confirmar reserva <ArrowRight className="h-4 w-4" /></>}
              </button>
              <p className="mt-2 text-[11px] text-center" style={{ color: "oklch(0.28 0.06 165 / 0.5)" }}>
                El pago se realiza en consulta — tu hora queda reservada al confirmar
              </p>
            </div>
          )}

          {step === "success" && (
            <div className="pt-6 text-center space-y-4" style={{ borderTop: "1px solid oklch(0.28 0.06 165 / 0.1)" }}>
              <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "oklch(0.45 0.10 165 / 0.1)" }}>
                <Check className="h-7 w-7" style={{ color: "var(--en-emerald)" }} />
              </div>
              <div>
                <p className="text-lg font-semibold" style={{ fontFamily: "'Barlow', sans-serif" }}>¡Reserva confirmada!</p>
                <p className="mt-1 text-sm" style={{ color: "oklch(0.28 0.06 165 / 0.7)" }}>
                  Tu hora para el <strong>{date}</strong> a las <strong>{time}</strong> está reservada.
                </p>
                <p className="mt-1 text-sm" style={{ color: "oklch(0.28 0.06 165 / 0.7)" }}>
                  El pago de <strong>{currentPlan && formatCLP(currentPlan.price)}</strong> se realiza el día de la consulta.
                </p>
              </div>
              {email && (
                <p className="text-xs" style={{ color: "oklch(0.28 0.06 165 / 0.5)" }}>
                  Te enviamos los detalles a <strong>{email}</strong>
                </p>
              )}
              <button onClick={() => { setStep("form"); setName(""); setRut(""); setEmail(""); setPhone(""); setDate(""); setTime(""); }}
                className="text-xs underline" style={{ color: "oklch(0.28 0.06 165 / 0.5)" }}>
                Hacer otra reserva
              </button>
            </div>
          )}

          {step === "error" && (
            <div className="pt-6" style={{ borderTop: "1px solid oklch(0.28 0.06 165 / 0.1)" }}>
              <p className="text-sm text-center mb-4" style={{ color: "oklch(0.28 0.06 165 / 0.7)" }}>Hubo un problema al confirmar la reserva. Inténtalo de nuevo.</p>
              <button onClick={handleConfirm} disabled={submitting} className="w-full inline-flex items-center justify-center gap-2 rounded-full py-4 text-sm font-semibold" style={{ background: "var(--en-emerald-deep)", color: "var(--en-cream)" }}>
                {submitting ? "Reintentando…" : "Reintentar"}
              </button>
              <button onClick={() => setStep("form")} className="mt-3 w-full text-xs underline text-center" style={{ color: "oklch(0.28 0.06 165 / 0.5)" }}>
                ← Volver al formulario
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function EnLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-[11px] uppercase tracking-[0.25em] font-medium" style={{ color: "oklch(0.28 0.06 165 / 0.6)" }}>{children}</span>;
}

function InstagramFeed() {
  const handle = "elliotnutrition";
  useEffect(() => {
    if (document.querySelector('script[data-behold]')) return;
    const s = document.createElement("script");
    s.type = "module";
    s.src = "https://w.behold.so/widget.js";
    s.setAttribute("data-behold", "true");
    document.head.appendChild(s);
  }, []);
  return (
    <section id="instagram" className="py-14 lg:py-20" style={{ background: "var(--en-cream)" }}>
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col items-center text-center gap-3">
          <span className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.25em] font-semibold" style={{ color: "var(--en-emerald)" }}>
            <InstagramIcon className="h-4 w-4" /> Instagram
          </span>
          <h2 className="text-3xl lg:text-5xl leading-[1.1] text-balance max-w-2xl font-bold" style={{ fontFamily: "'Barlow', sans-serif" }}>
            sígueme en <em style={{ color: "var(--en-emerald)" }}>@{handle}</em>
          </h2>
        </div>
        <div className="mt-10">
          <behold-widget feed-id="x8PAUKU3v1tfORMVsBTv"></behold-widget>
        </div>
        <div className="mt-10 text-center">
          <a href={`https://www.instagram.com/${handle}/`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium" style={{ background: "var(--en-emerald-deep)", color: "var(--en-cream)" }}>
            <InstagramIcon className="h-4 w-4" /> Ver perfil completo
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ background: "var(--en-gold)", color: "var(--en-emerald-deep)" }}>
      <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-16 pb-8">
        <div className="grid lg:grid-cols-4 gap-12">
          <div>
            <span className="text-2xl font-bold tracking-[0.12em]">ELLIOT<br />NUTRITION</span>
            <p className="mt-6 text-sm leading-relaxed" style={{ color: "oklch(0.28 0.06 165 / 0.8)" }}>
              Consulta nutricional con enfoque integral, deportivo y realista.<br />
              Presencial en Concón · Online a todo Chile.
            </p>
            <div className="mt-6 flex gap-3">
              <a href="https://www.instagram.com/elliotnutrition/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm" style={{ border: "1px solid oklch(0.28 0.06 165 / 0.4)" }}>
                Instagram <ArrowRight className="h-3.5 w-3.5 -rotate-45" />
              </a>
              <a href="https://wa.me/56942156610" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm" style={{ border: "1px solid oklch(0.28 0.06 165 / 0.4)" }}>
                WhatsApp <ArrowRight className="h-3.5 w-3.5 -rotate-45" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold">Servicios</h4>
            <ul className="mt-5 space-y-3 text-sm">
              <li><a href="#servicios" className="hover:underline">Hábitos y bienestar</a></li>
              <li><a href="#servicios" className="hover:underline">Rendimiento deportivo</a></li>
              <li><a href="#servicios" className="hover:underline">Clínico y de salud</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold">Programas</h4>
            <ul className="mt-5 space-y-3 text-sm">
              <li><a href="#planes" className="hover:underline">Consulta Inicial</a></li>
              <li><a href="#planes" className="hover:underline">Plan 3 Meses</a></li>
              <li><a href="#planes" className="hover:underline">Plan 6 Meses</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold">Contacto</h4>
            <ul className="mt-5 space-y-3 text-sm">
              <li><a href="mailto:pelliotbanados@gmail.com" className="hover:underline">pelliotbanados@gmail.com</a></li>
              <li><a href="https://wa.me/56942156610" target="_blank" rel="noopener noreferrer" className="hover:underline">+56 9 4215 6610</a></li>
              <li>Avenida Reñaca Norte 25, Concón, Chile.</li>
            </ul>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Avenida+Re%C3%B1aca+Norte+25,+Conc%C3%B3n,+Chile"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 block overflow-hidden rounded-2xl hover:shadow-md transition-shadow"
              style={{ border: "1px solid oklch(0.28 0.06 165 / 0.2)" }}
            >
              <iframe
                title="Ubicación Elliot Nutrition — Avenida Reñaca Norte 25, Concón"
                src="https://www.google.com/maps?q=Avenida%20Re%C3%B1aca%20Norte%2025%2C%20Conc%C3%B3n%2C%20Chile&output=embed"
                width="100%"
                height="180"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                style={{ border: 0, display: "block", pointerEvents: "none" }}
              />
            </a>
          </div>
        </div>
        <div className="mt-16 pt-6 flex flex-col sm:flex-row gap-3 items-center justify-between text-xs uppercase tracking-[0.18em]" style={{ borderTop: "1px solid oklch(0.28 0.06 165 / 0.2)" }}>
          <p>© {new Date().getFullYear()} Paulette Elliot · Nutricionista</p>
          <p style={{ opacity: 0.7 }}>Powered by Somaos</p>
        </div>
      </div>
    </footer>
  );
}
