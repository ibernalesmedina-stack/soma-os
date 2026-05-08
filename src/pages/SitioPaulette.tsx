import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Servicio {
  id: string;
  name: string;
  description: string;
  price: number;
  price_online: number;
  duration_min: number;
  modality: "presencial" | "online" | "ambos";
  featured: boolean;
}

const USER_ID = "e84c4f11-50c2-4b6e-8c4b-055bb635edcd";
const WA_BASE = "https://wa.me/56942156610";
const wa = (msg: string) => `${WA_BASE}?text=${encodeURIComponent(msg)}`;
const fmtCLP = (n: number) => "$" + n.toLocaleString("es-CL");

// Static plan data with features
const PLANS_DATA = [
  {
    id: "1m", tag: "Primer paso", name: "Consulta Inicial",
    desc: "Ideal si quieres empezar y dejar de improvisar.",
    prices: { presencial: 42000, online: 38000 },
    meta: "60 minutos · pago único", featured: false,
    feat: ["Evaluación inicial completa", "Plan personalizado", "Seguimiento incluido", "Recomendaciones prácticas", "Seguimiento vía WhatsApp (1 mes)"],
  },
  {
    id: "3m", tag: "Más elegido", name: "Plan 3 Meses",
    desc: "Para generar cambios reales y empezar a sostenerlos.",
    prices: { presencial: 110000, online: 100000 },
    meta: "2 consultas · seguimiento mensual", featured: true,
    feat: ["Evaluación inicial + plan personalizado", "Seguimientos continuos", "Ajustes según tu progreso", "Acompañamiento cercano", "Material educativo incluido"],
  },
  {
    id: "6m", tag: "Transformación", name: "Plan 6 Meses",
    desc: "Para una transformación profunda y sostenible.",
    prices: { presencial: 200000, online: 180000 },
    meta: "5 consultas · proceso completo", featured: false,
    feat: ["Evaluación inicial completa", "Plan + ajustes estratégicos", "Seguimiento constante", "Acompañamiento completo", "Parámetros bioquímicos"],
  },
];

function Wave({ from, to, h = 70 }: { from: string; to: string; h?: number }) {
  return (
    <svg viewBox="0 0 1440 80" preserveAspectRatio="none"
      style={{ display: "block", width: "100%", height: h, background: from, marginTop: -1, marginBottom: -1, position: "relative", zIndex: 5 }}>
      <path d="M0,40 C180,80 360,0 540,40 C720,80 900,0 1080,40 C1260,80 1380,20 1440,40 L1440,80 L0,80 Z" fill={to} />
    </svg>
  );
}

export default function SitioPaulette() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [modo, setModo] = useState<"presencial" | "online">("presencial");
  const [plans, setPlans] = useState(PLANS_DATA);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("servicios")
        .select("id, name, description, price, price_online, duration_min, modality, featured")
        .eq("user_id", USER_ID).eq("active", true).order("created_at");
      if (data && data.length > 0) {
        setServicios(data as Servicio[]);
        const filtered = data.filter(s => !s.name.toLowerCase().includes("control"));
        const tags = ["Primer paso", "Más elegido", "Transformación"];
        const mapped = filtered.map((s, i) => {
          const onlinePrice = s.price_online > 0 ? s.price_online : Math.round(s.price * 0.92);
          const showPresencial = s.modality === "presencial" || s.modality === "ambos";
          const showOnline = s.modality === "online" || s.modality === "ambos";
          return {
            id: s.id,
            tag: tags[Math.min(i, 2)],
            name: s.name,
            desc: s.description || "",
            prices: {
              presencial: showPresencial ? s.price : 0,
              online: showOnline ? onlinePrice : 0,
            },
            modality: s.modality,
            meta: `${s.duration_min} minutos`,
            featured: s.featured ?? (i === 1),
            feat: PLANS_DATA[Math.min(i, 2)]?.feat ?? [],
          };
        });
        if (mapped.length > 0) setPlans(mapped as typeof PLANS_DATA);
      }
    };
    load();
    const ch = supabase.channel("paulette-s")
      .on("postgres_changes", { event: "*", schema: "public", table: "servicios", filter: `user_id=eq.${USER_ID}` }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@400;500;600&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { overflow-x: hidden; }
    .pe { font-family: 'Geist', ui-sans-serif, system-ui, sans-serif; background: #f6f6ea; color: #474511; }
    .pe a { color: inherit; text-decoration: none; }
    .pe button { font: inherit; cursor: pointer; border: none; background: none; color: inherit; }
    .pe img { display: block; max-width: 100%; }
    .pe-serif { font-family: 'Instrument Serif', 'Times New Roman', serif; }
    .pe-mono { font-family: 'Geist Mono', ui-monospace, monospace; }
    .pe-shell { width: min(100% - clamp(20px,4vw,56px) * 2, 1320px); margin: 0 auto; }
    .pe-shell-md { width: min(100% - clamp(20px,4vw,56px) * 2, 1100px); margin: 0 auto; }

    /* NAV */
    .pe-nav { position: sticky; top: 0; z-index: 40; backdrop-filter: blur(12px); background: #f6f6ea; }
    .pe-nav-inner { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 14px 0; }
    .pe-nav-logo { height: 82px; width: auto; }
    .pe-nav-links { display: flex; gap: 28px; }
    .pe-nav-links a { position: relative; padding: 6px 0; color: rgba(71,69,17,0.75); font-size: 16px; font-weight: 600; transition: color .2s; }
    .pe-nav-links a:hover { color: #474511; }
    .pe-nav-btn { display: inline-flex; align-items: center; gap: 10px; padding: 11px 22px; border-radius: 999px; background: #d49930; color: #f6f6ea; font-size: 14px; font-weight: 500; transition: background .2s; }
    .pe-nav-btn:hover { background: #333209; }
    @media (max-width: 760px) { .pe-nav-links { display: none; } }

    /* HERO */
    .pe-hero { background: #474511; padding: clamp(48px,7vw,96px) 0 clamp(48px,6vw,80px); overflow: hidden; }
    .pe-hero-grid { display: grid; grid-template-columns: 1.15fr 1fr; gap: clamp(32px,5vw,80px); align-items: end; }
    .pe-hero-title { font-family: 'Instrument Serif', serif; font-size: clamp(52px,8.5vw,88px); line-height: 0.94; letter-spacing: -0.035em; color: #f6f6ea; font-weight: 400; margin: 0 0 28px; }
    .pe-hero-title em { font-style: italic; color: rgba(246,246,234,0.85); }
    .pe-hero-sub { font-size: 17px; line-height: 1.55; max-width: 46ch; color: rgba(246,246,234,0.88); margin: 0 0 32px; }
    .pe-hero-ctas { display: flex; gap: 12px; flex-wrap: wrap; }
    .pe-btn-lime { display: inline-flex; align-items: center; gap: 10px; padding: 14px 22px; border-radius: 999px; background: #deeca0; color: #3b5345; font-size: 14px; font-weight: 500; transition: background .2s; }
    .pe-btn-lime:hover { background: #e8f4b2; }
    .pe-btn-ghost-lime { display: inline-flex; align-items: center; gap: 10px; padding: 14px 22px; border-radius: 999px; border: 1px solid #deeca0; color: #deeca0; font-size: 14px; font-weight: 500; transition: all .2s; }
    .pe-btn-ghost-lime:hover { background: #deeca0; color: #3b5345; }
    .pe-hero-meta { margin-top: 36px; display: flex; align-items: center; gap: 18px; font-family: 'Geist Mono', monospace; font-size: 12px; color: rgba(246,246,234,0.7); letter-spacing: 0.04em; font-weight: 600; flex-wrap: wrap; }
    .pe-hero-sep { width: 20px; height: 1px; background: currentColor; opacity: .5; flex-shrink: 0; }
    .pe-hero-frame { position: relative; aspect-ratio: 4/5; background: rgba(222,236,160,0.25); border-radius: 180px 180px 24px 24px; overflow: hidden; max-width: 520px; margin-left: auto; width: 100%; }
    .pe-hero-frame img { width: 100%; height: 100%; object-fit: cover; object-position: 52% 30%; }
    .pe-hero-frame::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 55%, rgba(71,69,17,0.18)); pointer-events: none; }
    @media (max-width: 960px) { .pe-hero-grid { grid-template-columns: 1fr; } .pe-hero-frame { max-width: 420px; margin: 0 auto; } }

    /* ABOUT */
    .pe-about { background: #f6f6ea; padding: clamp(80px,10vw,140px) 0; }
    .pe-about-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: clamp(40px,6vw,100px); align-items: start; }
    .pe-about-img { aspect-ratio: 4/5; border-radius: 24px; overflow: hidden; background: #deeca0; }
    .pe-about-img img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 35%; }
    .pe-about-eyebrow { color: #dba22d; font-size: 15px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; display: block; margin-bottom: 28px; }
    .pe-about h2 { font-family: 'Instrument Serif', serif; font-size: clamp(42px,5.2vw,60px); line-height: 1.02; letter-spacing: -0.03em; margin: 0 0 32px; }
    .pe-about h2 em { font-style: italic; opacity: .75; }
    .pe-about p { font-size: 17px; line-height: 1.65; opacity: .85; max-width: 52ch; margin: 0 0 18px; }
    .pe-quote { font-family: 'Instrument Serif', serif; font-style: italic; font-size: 22px; line-height: 1.35; padding: 16px 0 0; }
    .pe-author { margin-top: 10px; font-size: 15px; font-weight: 500; opacity: .7; }
    .pe-cta-gold { display: inline-flex; margin-top: 28px; background: #d49930; color: #f8f3e7; padding: 14px 24px; border-radius: 999px; font-size: 14px; font-weight: 500; transition: background .2s; }
    .pe-cta-gold:hover { background: #c08a26; }
    @media (max-width: 960px) { .pe-about-grid { grid-template-columns: 1fr; } }

    /* STATS */
    .pe-stats { background: #deeca0; padding: 8px 0 clamp(24px,3vw,40px); }
    .pe-stats-intro { text-align: center; margin: 0 auto clamp(20px,2.5vw,32px); display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .pe-stats-lead { font-family: 'Instrument Serif', serif; font-size: clamp(22px,2.4vw,38px); line-height: 1.15; letter-spacing: -0.02em; max-width: 22ch; font-weight: 400; }
    .pe-stats-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; text-align: center; align-items: center; justify-items: center; max-width: 700px; margin: 0 auto; }
    .pe-stat-num { font-family: 'Instrument Serif', serif; font-size: clamp(48px,6vw,84px); line-height: 1; letter-spacing: -0.035em; font-weight: 400; }
    .pe-stat-sub { font-family: 'Geist Mono', monospace; font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; opacity: .8; font-weight: 600; }

    /* GOALS */
    .pe-goals { background: #f6f6ea; padding: clamp(60px,8vw,120px) 0; }
    .pe-goals-title { font-family: 'Instrument Serif', serif; font-size: clamp(32px,4vw,50px); line-height: 1.1; letter-spacing: -0.02em; margin: 0 auto 14px; white-space: nowrap; }
    .pe-goals-title em { font-style: italic; opacity: .75; }
    .pe-goals-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; padding-top: 40px; }
    .pe-goal-card { background: #fff; border-radius: 20px; padding: 22px; display: flex; flex-direction: column; min-height: 360px; border: 1px solid rgba(71,69,17,0.12); position: relative; overflow: visible; transition: transform .25s ease; padding-top: 56px; margin-top: 34px; }
    .pe-goal-card:hover { transform: translateY(-4px); }
    .pe-goal-icon { position: absolute; top: -34px; left: 50%; transform: translateX(-50%); width: 68px; height: 90px; border-radius: 999px; display: grid; place-items: center; box-shadow: 0 8px 24px -12px rgba(71,69,17,0.4); }
    .pe-goal-icon svg { width: 32px; height: 32px; }
    .pe-goal-title { font-family: 'Instrument Serif', serif; font-size: 30px; line-height: 1.05; margin: 6px 0 12px; text-align: center; }
    .pe-goal-text { font-size: 16px; color: rgba(71,69,17,0.8); line-height: 1.55; text-align: center; }
    .pe-goal-foot { margin-top: auto; padding-top: 24px; border-top: 1px dashed rgba(71,69,17,0.18); font-family: 'Geist Mono', monospace; font-size: 13px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(71,69,17,0.7); }
    @media (max-width: 640px) { .pe-goals-grid { grid-template-columns: 1fr; } .pe-goals-title { white-space: normal; } }

    /* PLANS */
    .pe-plans { background: #cedc8f; color: #403c01; padding: clamp(60px,8vw,100px) 0; }
    .pe-plans-title { font-family: 'Instrument Serif', serif; font-size: clamp(32px,4vw,52px); line-height: 1.1; letter-spacing: -0.02em; margin: 0 auto 16px; font-weight: 400; }
    .pe-plans-title em { font-style: italic; font-size: 50px; opacity: .75; }
    .pe-toggle { display: inline-flex; background: #474511; border-radius: 999px; padding: 6px; }
    .pe-toggle button { padding: 10px 22px; border-radius: 999px; font-family: 'Geist Mono', monospace; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(246,246,234,0.7); transition: background .2s, color .2s; font-weight: 500; }
    .pe-toggle button.active { background: #deeca0; color: #474511; }
    .pe-plans-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 48px; }
    .pe-plan { background: #f6f6ea; color: #403c01; border: 1px solid rgba(64,60,1,0.15); border-radius: 28px; padding: 32px 28px; display: flex; flex-direction: column; transition: transform .2s ease, box-shadow .2s ease; }
    .pe-plan:hover { transform: translateY(-4px); box-shadow: 0 30px 60px -40px rgba(0,0,0,.2); }
    .pe-plan.featured { background: #6f8c2a; color: #f6f6ea; border-color: transparent; transform: translateY(-8px); }
    .pe-plan.featured:hover { transform: translateY(-10px); }
    .pe-plan-tag { align-self: flex-start; font-family: 'Geist Mono', monospace; font-size: 10.5px; letter-spacing: 0.16em; text-transform: uppercase; padding: 6px 12px; border-radius: 999px; background: rgba(64,60,1,0.12); color: #403c01; margin-bottom: 24px; }
    .pe-plan.featured .pe-plan-tag { background: #deeca0; color: #403c01; }
    .pe-plan-name { font-family: 'Instrument Serif', serif; font-size: 38px; line-height: 1; letter-spacing: -0.02em; margin: 0; }
    .pe-plan-desc { font-size: 14px; margin: 12px 0 24px; max-width: 28ch; line-height: 1.5; opacity: .85; }
    .pe-plan-price { font-family: 'Instrument Serif', serif; font-size: 52px; letter-spacing: -0.03em; line-height: 1; margin-bottom: 4px; display: flex; align-items: baseline; gap: 6px; }
    .pe-plan-price small { font-family: 'Geist Mono', monospace; font-size: 12px; opacity: .6; letter-spacing: 0.06em; }
    .pe-plan-meta { font-family: 'Geist Mono', monospace; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 24px; opacity: .7; }
    .pe-plan-feat { list-style: none; padding: 0; margin: 0 0 28px; display: flex; flex-direction: column; gap: 8px; font-size: 14px; line-height: 1.4; }
    .pe-plan-feat li { display: grid; grid-template-columns: 16px 1fr; gap: 10px; align-items: start; }
    .pe-plan-feat li::before { content: "✓"; font-family: 'Geist Mono', monospace; font-size: 12px; color: #6f8c2a; padding-top: 1px; }
    .pe-plan.featured .pe-plan-feat li::before { color: #deeca0; }
    .pe-plan-btn { margin-top: 24px; display: inline-flex; align-items: center; justify-content: space-between; background: #403c01; color: #f6f6ea; padding: 14px 18px; border-radius: 14px; font-size: 14px; font-weight: 500; gap: 10px; transition: transform .15s; width: 100%; flex-shrink: 0; }
    .pe-plan.featured .pe-plan-btn { background: #f6f6ea; color: #403c01; }
    .pe-plan-btn:hover { transform: translateX(2px); }
    .pe-plans-cta { margin: 0 auto; text-align: center; max-width: 560px; padding: 36px 32px; border-radius: 24px; background: #474511; color: #f6f6ea; position: relative; overflow: hidden; }
    .pe-wa-btn { display: inline-flex; align-items: center; gap: 10px; padding: 14px 26px; border-radius: 999px; background: #25D366; color: #fff; font-size: 14px; font-weight: 600; transition: transform .15s, background .2s; }
    .pe-wa-btn:hover { transform: translateY(-1px); background: #1fbe5a; }
    @media (max-width: 960px) { .pe-plans-grid { grid-template-columns: 1fr; } .pe-plan.featured { transform: none; } }

    /* REVIEWS */
    .pe-reviews { background: #f6f6ea; color: #403c01; padding: clamp(40px,5vw,64px) 0; }
    .pe-reviews-title { font-family: 'Instrument Serif', serif; font-size: clamp(28px,3.2vw,40px); line-height: 1.05; letter-spacing: -0.02em; margin: 0 0 10px; font-weight: 400; }
    .pe-reviews-title em { font-style: italic; opacity: .7; }
    .pe-reviews-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
    .pe-review { background: #fff; border: 1px solid rgba(64,60,1,0.12); border-radius: 18px; padding: 18px 16px; display: flex; flex-direction: column; }
    .pe-review-stars { font-size: 18px; margin-bottom: 10px; letter-spacing: 0.15em; color: #f7cb96; }
    .pe-review-quote { font-family: 'Instrument Serif', serif; font-size: 13.5px; line-height: 1.55; color: #403c01; flex: 1; }
    .pe-review-who { margin-top: auto; padding-top: 14px; display: flex; align-items: center; gap: 12px; border-top: 1px solid rgba(64,60,1,0.15); }
    .pe-review-avatar { width: 30px; height: 30px; border-radius: 999px; background: #f7cb96; color: #403c01; display: grid; place-items: center; font-size: 11px; font-weight: 600; flex-shrink: 0; }
    @media (max-width: 900px) { .pe-reviews-grid { grid-template-columns: repeat(2,1fr); } }
    @media (max-width: 560px) { .pe-reviews-grid { grid-template-columns: 1fr; } }

    /* CLOSING */
    .pe-closing { padding: clamp(48px,6vw,80px) 0; text-align: center; background: #474511; color: #f6f6ea; }
    .pe-closing h2 { font-family: 'Instrument Serif', serif; font-size: clamp(26px,3.2vw,40px); line-height: 1.25; letter-spacing: -0.015em; margin: 0 auto 28px; max-width: 48ch; font-weight: 400; }
    .pe-closing h2 em { font-style: italic; color: #dba22d; }
    .pe-closing-btn { display: inline-flex; align-items: center; background: #dba22d; color: #474511; padding: 14px 28px; border-radius: 999px; font-size: 14px; font-weight: 500; transition: background .2s; }
    .pe-closing-btn:hover { background: #e8b13f; }

    /* BOOKING */
    .pe-booking { background: #f6f6ea; color: #474511; padding: clamp(64px,8vw,100px) 0; }
    .pe-booking-title { font-family: 'Instrument Serif', serif; font-size: clamp(36px,4vw,50px); line-height: 1.1; letter-spacing: -0.02em; margin: 0 0 10px; font-weight: 600; }
    .pe-booking-title em { font-style: italic; color: #dba22d; }
    .pe-booking-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .pe-booking-card { background: #e6decd; border-radius: 22px; padding: 28px 28px 30px; border: 1px solid rgba(71,69,17,0.08); }
    .pe-booking-card-wide { grid-column: 1 / -1; }
    .pe-step { font-family: 'Geist Mono', monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #dba22d; font-weight: 600; display: block; margin-bottom: 4px; }
    .pe-booking-card-title { font-family: 'Instrument Serif', serif; font-size: 24px; margin: 0 0 22px; font-weight: 600; }
    .pe-label { display: block; font-family: 'Geist Mono', monospace; font-size: 10.5px; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(71,69,17,0.65); font-weight: 500; margin: 18px 0 8px; }
    .pe-field { background: #f6f6ea; border-radius: 10px; border: 1px solid rgba(71,69,17,0.1); }
    .pe-field input, .pe-field select { width: 100%; padding: 13px 16px; border: 0; background: transparent; font: inherit; color: #474511; font-size: 14px; outline: none; -webkit-appearance: none; appearance: none; }
    .pe-field input::placeholder { color: rgba(71,69,17,0.4); }
    .pe-field:focus-within { border-color: #474511; box-shadow: 0 0 0 3px rgba(71,69,17,0.08); }
    .pe-booking-total { margin-top: 28px; display: flex; align-items: center; justify-content: space-between; gap: 16px; background: #f6f6ea; border-radius: 14px; padding: 22px 26px; border: 1px solid rgba(71,69,17,0.08); }
    .pe-pay-btn { margin-top: 14px; display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; padding: 18px 24px; background: #474511; color: #f6f6ea; border-radius: 999px; font-family: 'Geist Mono', monospace; font-size: 13px; letter-spacing: 0.14em; font-weight: 600; cursor: pointer; border: 0; transition: background .15s; }
    .pe-pay-btn:hover { background: #5b5818; }
    .pe-tipo-wrap { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 4px; }
    .pe-tipo-btn { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 14px 10px; border-radius: 12px; border: 2px solid rgba(71,69,17,0.15); background: #fff; cursor: pointer; transition: all .2s; text-align: center; }
    .pe-tipo-btn.active { border-color: #474511; background: #deeca0; }
    .pe-booking-plans { display: grid; gap: 8px; }
    .pe-bplan { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-radius: 10px; background: #f6f6ea; border: 1px solid rgba(71,69,17,0.1); font-size: 14px; color: #474511; cursor: pointer; transition: border-color .15s, background .15s; text-align: left; }
    .pe-bplan.active { border-color: #474511; background: #deeca0; }
    .pe-bplan-price { color: #dba22d; font-weight: 600; }
    .pe-bplan.active .pe-bplan-price { color: #474511; }
    .pe-hours { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
    .pe-hour { padding: 12px 10px; background: #f6f6ea; border: 1px solid rgba(71,69,17,0.1); border-radius: 10px; font-size: 13px; color: #474511; cursor: pointer; font-family: 'Geist Mono', monospace; letter-spacing: 0.04em; transition: border-color .15s, background .15s; }
    .pe-hour.active { background: #474511; color: #deeca0; border-color: #474511; }
    @media (max-width: 760px) { .pe-booking-row { grid-template-columns: 1fr; } .pe-booking-total { flex-direction: column; align-items: flex-start; } .pe-hours { grid-template-columns: repeat(3,1fr); gap: 6px; } }

    /* INSTAGRAM */
    .pe-ig { background: #f6f6ea; padding: clamp(60px,8vw,100px) 0 clamp(48px,6vw,80px); }
    .pe-ig h2 { font-family: 'Instrument Serif', serif; font-size: clamp(32px,4vw,48px); color: #474511; margin-top: 12px; font-weight: 400; }
    .pe-ig h2 em { font-style: italic; }

    /* FOOTER */
    .pe-footer { background: #dba22d; color: #f6f6ea; padding: 48px 0 28px; }
    .pe-footer-grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr; gap: 40px; margin-bottom: 48px; }
    .pe-footer h4 { font-family: 'Geist Mono', monospace; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; margin: 0 0 16px; font-weight: 600; }
    .pe-footer ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
    .pe-footer a { color: #f6f6ea; transition: opacity .2s; font-size: 14px; }
    .pe-footer a:hover { opacity: .7; }
    .pe-footer-logo { display: block; margin-bottom: 18px; filter: brightness(0) invert(1); width: 155px; }
    .pe-footer-social { display: flex; gap: 10px; margin-top: 16px; }
    .pe-btn-ghost-footer { display: inline-flex; align-items: center; gap: 10px; padding: 10px 16px; border-radius: 999px; border: 1px solid rgba(246,246,234,0.6); color: #f6f6ea; font-size: 12px; font-weight: 500; transition: all .2s; }
    .pe-btn-ghost-footer:hover { background: #f6f6ea; color: #dba22d; }
    .pe-footer-bottom { display: flex; justify-content: space-between; padding-top: 24px; border-top: 1px solid rgba(246,246,234,0.3); font-family: 'Geist Mono', monospace; font-size: 11px; letter-spacing: 0.08em; font-weight: 600; text-transform: uppercase; }
    @media (max-width: 960px) { .pe-footer-grid { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 560px) { .pe-footer-grid { grid-template-columns: 1fr; } }

    @media (max-width: 700px) { .pe-hero-meta { flex-direction: column; align-items: flex-start; gap: 10px; } .pe-hero-sep { display: none; } }
  `;

  // Booking state
  const [bModo, setBModo] = useState<"presencial" | "online">("presencial");
  const [bPlan, setBPlan] = useState("1m");
  const [bTipo, setBTipo] = useState<"nuevo" | "control">("nuevo");
  const [bDate, setBDate] = useState(() => { const d = new Date(); return d.toISOString().slice(0, 10); });
  const [bHour, setBHour] = useState("");
  const [bName, setBName] = useState(""); const [bRut, setBRut] = useState("");
  const [bEmail, setBEmail] = useState(""); const [bPhone, setBPhone] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const allPlans = [
    { id: "ctrl", name: "Control Nutricional", prices: { presencial: 40000, online: 40000 } },
    ...plans.map(p => ({ id: p.id, name: p.name, prices: p.prices })),
  ];
  const visiblePlans = allPlans.filter(p => bTipo === "control" ? p.id === "ctrl" : p.id !== "ctrl");
  const selPlan = allPlans.find(p => p.id === bPlan) ?? allPlans[1];
  const totalAmount = fmtCLP(selPlan.prices[bModo]);

  // Fetch available slots whenever date or tipo changes
  useEffect(() => {
    if (!bDate) return;
    setLoadingSlots(true);
    setBHour("");
    const dur = bTipo === "control" ? 30 : 60;
    fetch(`/api/booking/slots?date=${bDate}&duration=${dur}`)
      .then(r => r.json())
      .then(d => { setAvailableSlots(d.slots ?? []); })
      .catch(() => setAvailableSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [bDate, bTipo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bHour) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/booking/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: bName, email: bEmail, phone: bPhone, rut: bRut,
          date: bDate, hour: bHour,
          esControl: bTipo === "control",
          planId: selPlan.id, serviceName: selPlan.name,
          amount: selPlan.prices[bModo], modo: bModo,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al agendar");
      setSubmitted(true);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Error al agendar");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pe">
      <style>{css}</style>

      {/* NAV */}
      <header className="pe-nav" id="top">
        <div className="pe-shell pe-nav-inner">
          <a href="#top"><img src="/logo-elliot-nutri.svg" alt="Elliot Nutri" className="pe-nav-logo" /></a>
          <nav className="pe-nav-links">
            <a href="#sobre">Sobre mí</a>
            <a href="#servicios">Servicios</a>
            <a href="#programas">Programas</a>
            <a href="#reseñas">Reseñas</a>
          </nav>
          <a href="#agenda" className="pe-nav-btn">Reserva hora →</a>
        </div>
      </header>

      <Wave from="#f6f6ea" to="#474511" />

      {/* HERO */}
      <section className="pe-hero" id="hero">
        <div className="pe-shell hero-grid" style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: "clamp(32px,5vw,80px)", alignItems: "end" }}>
          <div style={{ position: "relative", zIndex: 1 }}>
            <h1 className="pe-hero-title">
              Transforma tu<br />salud desde<br /><em>hábitos reales</em><br />y sostenibles.
            </h1>
            <p className="pe-hero-sub">Nutrición cercana, profesional y adaptada a tu vida. Sin extremos, sin culpa, con resultados que sí puedes mantener.</p>
            <div className="pe-hero-ctas">
              <a href="#agenda" className="pe-btn-lime">Reserva hora</a>
              <a href="#programas" className="pe-btn-ghost-lime">Ver programa</a>
            </div>
            <div className="pe-hero-meta">
              <span>Atención personalizada</span><span className="pe-hero-sep" />
              <span>Enfoque realista</span><span className="pe-hero-sep" />
              <span>Acompañamiento cercano</span>
            </div>
          </div>
          <div>
            <div className="pe-hero-frame">
              <img src="/paulette-perfil.jpg" alt="Paulette Elliot, nutricionista" />
            </div>
          </div>
        </div>
      </section>

      <Wave from="#474511" to="#f6f6ea" />

      {/* ABOUT */}
      <section className="pe-about" id="sobre">
        <div className="pe-shell-md pe-about-grid">
          <div className="pe-about-img">
            <img src="/paulette-hero.jpg" alt="Paulette en consulta" />
          </div>
          <div>
            <span className="pe-about-eyebrow">Sobre mí</span>
            <h2>Nutrición que<br />se <em>adapta</em> a ti.</h2>
            <p>Soy <strong>Paulette Elliot</strong>, nutricionista, y acompaño a personas que quieren mejorar su alimentación sin caer en extremos ni frustraciones.</p>
            <p>Mi enfoque combina ciencia, educación y hábitos sostenibles, entendiendo que cada proceso es distinto, y que cada cuerpo, cada rutina y cada historia merecen una mirada propia.</p>
            <div className="pe-quote">Aquí no se trata de hacerlo perfecto. Se trata de construir algo que <em>sí</em> puedas mantener.</div>
            <div className="pe-author">— Paulette Elliot B.</div>
            <a href="#agenda" className="pe-cta-gold">Agenda tu consulta</a>
          </div>
        </div>
      </section>

      <Wave from="#f6f6ea" to="#deeca0" />

      {/* STATS */}
      <div className="pe-stats">
        <div className="pe-shell">
          <div className="pe-stats-intro">
            <span className="pe-mono" style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", opacity: .7, fontWeight: 600 }}>Impacto</span>
            <p className="pe-stats-lead">Pacientes acompañados en procesos <em style={{ fontStyle: "italic", opacity: .8 }}>reales</em>.</p>
          </div>
          <div className="pe-stats-row">
            {[{ v: "+6", l: "años de experiencia" }, { v: "+3.000", l: "atenciones realizadas" }].map(s => (
              <div key={s.v} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <div className="pe-stat-num">{s.v}</div>
                <div className="pe-stat-sub">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Wave from="#deeca0" to="#f6f6ea" />

      {/* GOALS */}
      <section className="pe-goals" id="servicios">
        <div className="pe-shell-md">
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <h2 className="pe-goals-title">Tres caminos, un solo <em>propósito</em></h2>
            <p style={{ color: "rgba(71,69,17,0.75)", maxWidth: "60ch", margin: "0 auto", fontSize: 15 }}>
              Cada persona llega con un motivo distinto. Estos son los tres grandes enfoques en los que acompaño procesos, y desde donde armamos tu plan.
            </p>
          </div>
          <div className="pe-goals-grid">
            {[
              { bg: "#deeca0", color: "#474511", title: "Hábitos y bienestar", text: "Para quienes quieren mejorar su relación con la comida y construir hábitos sostenibles sin obsesionarse.", tag: "Cambio sostenible",
                icon: <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="16" cy="16" r="10"/><circle cx="16" cy="16" r="6"/><path d="M6 6 L6 14 M4 6 L8 6 M6 6 L6 3"/><path d="M26 6 L26 26"/><path d="M24 6 C24 10, 28 10, 28 6 C28 4, 26 3, 26 3 C26 3, 24 4, 24 6 Z"/></svg> },
              { bg: "#dba22d", color: "#f6f6ea", title: "Rendimiento deportivo", text: "Nutrición orientada a optimizar tu rendimiento, recuperación y composición corporal si practicas deporte.", tag: "Performance",
                icon: <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="12" width="4" height="8" rx="1"/><rect x="7" y="14" width="2" height="4"/><rect x="25" y="12" width="4" height="8" rx="1"/><rect x="23" y="14" width="2" height="4"/><rect x="9" y="15" width="14" height="2"/></svg> },
              { bg: "#474511", color: "#f6f6ea", title: "Clínico y de salud", text: "Para condiciones como resistencia a la insulina, hipotiroidismo, dislipidemias, embarazo y más.", tag: "Acompañamiento médico",
                icon: <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M16 27 C 8 21, 3 16, 3 11 C 3 7, 6 4, 9.5 4 C 12 4, 14.5 5.5, 16 8 C 17.5 5.5, 20 4, 22.5 4 C 26 4, 29 7, 29 11 C 29 13, 28 15, 26.5 17"/><path d="M3 19 L10 19 L12 15 L15 23 L18 17 L20 19 L29 19"/></svg> },
            ].map((c) => (
              <article key={c.title} className="pe-goal-card">
                <div className="pe-goal-icon" style={{ background: c.bg, color: c.color }}>{c.icon}</div>
                <h3 className="pe-goal-title">{c.title}</h3>
                <p className="pe-goal-text">{c.text}</p>
                <div className="pe-goal-foot"><span>{c.tag}</span></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Wave from="#f6f6ea" to="#cedc8f" />

      {/* PLANS */}
      <section className="pe-plans" id="programas">
        <div className="pe-shell-md">
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <h2 className="pe-plans-title">Elige el plan que mejor se <em>adapta</em> a ti</h2>
            <p style={{ color: "rgba(64,60,1,0.75)", maxWidth: "60ch", margin: "0 auto 24px", fontSize: 15, lineHeight: 1.5 }}>
              Cada plan se adapta a tu contexto, tu ritmo y tus objetivos. Las consultas iniciales duran 60 minutos y los controles 30 minutos. Boleta electrónica válida para Isapre.
            </p>
            <div className="pe-toggle">
              {(["presencial", "online"] as const).map(m => (
                <button key={m} className={modo === m ? "active" : ""} onClick={() => setModo(m)}>
                  {m === "presencial" ? "Presencial" : "Online"}
                </button>
              ))}
            </div>
          </div>
          <div className="pe-plans-grid">
            {plans.map((p) => (
              <article key={p.id} className={`pe-plan${p.featured ? " featured" : ""}`}>
                <span className="pe-plan-tag">{p.tag}</span>
                <h3 className="pe-plan-name">{p.name}</h3>
                <p className="pe-plan-desc">{p.desc}</p>
                <div className="pe-plan-price">
                  {p.prices[modo] > 0 ? <>{fmtCLP(p.prices[modo])}<small>CLP</small></> : <span style={{fontSize:"0.55em",opacity:0.6}}>No disponible {modo}</span>}
                </div>
                <div className="pe-plan-meta">{p.meta} · {modo}</div>
                <ul className="pe-plan-feat">{p.feat.map(f => <li key={f}>{f}</li>)}</ul>
                <a href={wa(`Hola! Me gustaría agendar: ${p.name}`)} target="_blank" rel="noopener noreferrer" className="pe-plan-btn">
                  <span>Agenda tu consulta</span><span>→</span>
                </a>
              </article>
            ))}
          </div>
          <div className="pe-plans-cta">
            <p style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(26px,3vw,36px)", lineHeight: 1.1, letterSpacing: "-0.02em", margin: "0 0 8px", position: "relative" }}>¿No sabes cuál elegir?</p>
            <p style={{ color: "rgba(246,246,234,0.85)", margin: "0 0 22px", fontSize: 15, position: "relative" }}>Escríbeme por WhatsApp y te oriento sin compromiso.</p>
            <a href={wa("Hola! Quiero saber qué plan me conviene.")} target="_blank" rel="noopener noreferrer" className="pe-wa-btn">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M20.52 3.48A11.8 11.8 0 0 0 12 0C5.37 0 0 5.37 0 12a11.9 11.9 0 0 0 1.64 6.03L0 24l6.18-1.62A11.9 11.9 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.52ZM12 21.82a9.8 9.8 0 0 1-5-1.37l-.36-.21-3.67.96.98-3.58-.23-.37A9.8 9.8 0 1 1 21.82 12 9.84 9.84 0 0 1 12 21.82Z" /></svg>
              Hablar por WhatsApp
            </a>
          </div>
        </div>
      </section>

      <Wave from="#cedc8f" to="#f6f6ea" />

      {/* REVIEWS */}
      <section className="pe-reviews" id="reseñas">
        <div className="pe-shell" style={{ maxWidth: 1200 }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <h2 className="pe-reviews-title">Lo que dicen <em>mis pacientes</em></h2>
            <p style={{ color: "rgba(64,60,1,0.75)", fontSize: 13.5 }}>Procesos reales, con altos y bajos. Reseñas verificadas en Google.</p>
          </div>
          <div className="pe-reviews-grid">
            {[
              { q: "En primer lugar la recepción fue muy cordial y amable, el programa está dando muy buenos resultados en cada control. Muy motivadora a seguir mejorando.", n: "Eugenio Thomas", i: "ET" },
              { q: "Llegar a las manos de Paulette ha sido una excelente decisión. No solo me ha ayudado a mejorar mi alimentación, sino a entender y escuchar mi cuerpo.", n: "Francisca Pino", i: "FP" },
              { q: "Desde que empecé con la Poli he notado cambios, no solo físicos, sino también en mis niveles de energía. Las pautas se adaptan a lo que me gusta comer.", n: "Doni Fernández", i: "DF" },
              { q: "Una tremenda profesional, llevo 3 meses con ella y ya voy viendo resultados, su plan nutricional es basado 100% en mis necesidades y lo que quiero lograr.", n: "Lorena Olivares", i: "LO" },
            ].map(r => (
              <article key={r.n} className="pe-review">
                <div className="pe-review-stars">★ ★ ★ ★ ★</div>
                <p className="pe-review-quote">"{r.q}"</p>
                <div className="pe-review-who">
                  <div className="pe-review-avatar">{r.i}</div>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 500 }}>{r.n}</div>
                    <div style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(64,60,1,0.55)" }}>Reseña Google · verificada</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginTop: 20, fontFamily: "monospace", fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(64,60,1,0.6)" }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: "#f7cb96", flexShrink: 0, display: "inline-block" }} /> Google · Reseñas verificadas
          </div>
        </div>
      </section>

      <Wave from="#f6f6ea" to="#474511" />

      {/* CLOSING */}
      <section className="pe-closing" id="reserva">
        <div className="pe-shell">
          <h2>Tu bienestar no empieza cuando todo esté perfecto,<br />empieza cuando <em>decides hacer las cosas distinto</em>.</h2>
          <a href="#agenda" className="pe-closing-btn">Reserva ahora</a>
        </div>
      </section>

      <Wave from="#474511" to="#f6f6ea" />

      {/* BOOKING */}
      <section className="pe-booking" id="agenda">
        <div className="pe-shell-md">
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <h2 className="pe-booking-title">Agenda tu <em>consulta</em></h2>
            <p style={{ color: "rgba(71,69,17,0.7)", fontSize: 15 }}>Elige el horario que mejor se adapte a ti y asegura tu espacio.</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="pe-booking-row">
              {/* PASO 01 */}
              <div className="pe-booking-card">
                <span className="pe-step">PASO 01</span>
                <h3 className="pe-booking-card-title">Modalidad y plan</h3>
                <label className="pe-label">Modalidad</label>
                <div className="pe-field">
                  <select value={bModo} onChange={e => setBModo(e.target.value as "presencial" | "online")}>
                    <option value="presencial">Presencial</option>
                    <option value="online">Online</option>
                  </select>
                </div>
                <label className="pe-label">Plan</label>
                <div className="pe-booking-plans">
                  {visiblePlans.map(p => (
                    <button key={p.id} type="button" className={`pe-bplan${bPlan === p.id ? " active" : ""}`} onClick={() => setBPlan(p.id)}>
                      <span>{p.name}</span>
                      <span className="pe-bplan-price">{fmtCLP(p.prices[bModo])}</span>
                    </button>
                  ))}
                </div>
              </div>
              {/* PASO 02 */}
              <div className="pe-booking-card">
                <span className="pe-step">PASO 02</span>
                <h3 className="pe-booking-card-title">Tipo de consulta y horario</h3>
                <label className="pe-label">¿Eres paciente nuevo o de control?</label>
                <div className="pe-tipo-wrap">
                  {[{ id: "nuevo", icon: "🌱", name: "Paciente nuevo", dur: "60 minutos" }, { id: "control", icon: "🔄", name: "Control", dur: "30 minutos" }].map(t => (
                    <button key={t.id} type="button" className={`pe-tipo-btn${bTipo === t.id ? " active" : ""}`} onClick={() => { setBTipo(t.id as "nuevo" | "control"); setBPlan(t.id === "control" ? "ctrl" : "1m"); }}>
                      <span style={{ fontSize: 22 }}>{t.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</span>
                      <span style={{ fontSize: 11, opacity: .6, fontFamily: "monospace" }}>{t.dur}</span>
                    </button>
                  ))}
                </div>
                <label className="pe-label" style={{ marginTop: 20 }}>Fecha</label>
                <div className="pe-field"><input type="date" value={bDate} onChange={e => setBDate(e.target.value)} /></div>
                <label className="pe-label">Hora disponible</label>
                {loadingSlots
                  ? <p style={{ padding: "14px 16px", borderRadius: 10, background: "#f6f6ea", fontSize: 13, color: "rgba(71,69,17,0.5)" }}>Cargando horarios...</p>
                  : availableSlots.length === 0
                    ? <p style={{ padding: "14px 16px", borderRadius: 10, background: "#f6f6ea", border: "1px dashed rgba(71,69,17,0.2)", fontSize: 13, color: "rgba(71,69,17,0.65)" }}>Sin horarios disponibles para este día.</p>
                    : <div className="pe-hours">{availableSlots.map(h => <button key={h} type="button" className={`pe-hour${bHour === h ? " active" : ""}`} onClick={() => setBHour(h)}>{h}</button>)}</div>
                }
              </div>
            </div>
            {/* PASO 03 */}
            <div className="pe-booking-card pe-booking-card-wide">
              <span className="pe-step">PASO 03</span>
              <h3 className="pe-booking-card-title">Tus datos</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 20px", marginBottom: 18 }}>
                {[
                  { label: "Nombre completo", ph: "Tu nombre completo", val: bName, set: setBName },
                  { label: "RUT", ph: "12.345.678-9", val: bRut, set: setBRut },
                  { label: "Correo electrónico", ph: "tu@correo.com", val: bEmail, set: setBEmail },
                  { label: "Teléfono", ph: "+56 9 1234 5678", val: bPhone, set: setBPhone },
                ].map(f => (
                  <div key={f.label}>
                    <label className="pe-label">{f.label}</label>
                    <div className="pe-field"><input type="text" placeholder={f.ph} value={f.val} onChange={e => f.set(e.target.value)} /></div>
                  </div>
                ))}
              </div>
              <div className="pe-booking-total">
                <div>
                  <div style={{ fontFamily: "monospace", fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(71,69,17,0.6)", fontWeight: 500 }}>Total a pagar</div>
                  <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 36, fontWeight: 600, lineHeight: 1 }}>{totalAmount}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", fontSize: 12.5, color: "rgba(71,69,17,0.7)", lineHeight: 1.5, textAlign: "right" }}>
                  <span>Boleta válida para Isapre</span>
                  <span>El pago confirma tu reserva</span>
                </div>
              </div>
              {submitted ? (
                <div style={{ textAlign: "center", padding: "32px 20px", background: "#deeca0", borderRadius: 16 }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>✅</div>
                  <p style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, fontWeight: 600, marginBottom: 6 }}>¡Hora agendada!</p>
                  <p style={{ fontSize: 14, color: "rgba(71,69,17,0.75)" }}>Tu reserva quedó confirmada para el {bDate} a las {bHour}. Te contactaremos pronto.</p>
                </div>
              ) : (
                <>
                  {submitError && <p style={{ color: "#c0392b", fontSize: 13, marginBottom: 10, textAlign: "center" }}>{submitError}</p>}
                  <button type="submit" className="pe-pay-btn" disabled={submitting || !bHour}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="14" rx="2" /><path d="M2 10h20" /><path d="M6 16h4" /></svg>
                    {submitting ? "AGENDANDO..." : "CONFIRMAR Y AGENDAR"}
                  </button>
                  <p style={{ textAlign: "center", fontSize: 12, color: "rgba(71,69,17,0.55)", marginTop: 14 }}>Recibirás confirmación · Pago en consulta · Boleta válida para Isapre</p>
                </>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* INSTAGRAM */}
      <section className="pe-ig">
        <div className="pe-shell" style={{ textAlign: "center" }}>
          <div style={{ marginBottom: 36 }}>
            <span className="pe-mono" style={{ color: "#dba22d", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600 }}>Instagram</span>
            <h2>Sígueme en <em>@elliotnutrition</em></h2>
          </div>
          <div style={{ textAlign: "center", marginTop: 28 }}>
            <a href="https://www.instagram.com/elliotnutrition/" target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 999, border: "1.5px solid #474511", fontSize: 14, fontWeight: 500, color: "#474511" }}>
              Ver perfil completo →
            </a>
          </div>
        </div>
      </section>

      <Wave from="#f6f6ea" to="#dba22d" />

      {/* FOOTER */}
      <footer className="pe-footer">
        <div className="pe-shell">
          <div className="pe-footer-grid">
            <div>
              <img src="/logo-elliot.svg" alt="Elliot Nutri" className="pe-footer-logo" />
              <p style={{ maxWidth: "32ch", lineHeight: 1.55, fontSize: 14, opacity: .9 }}>Consulta nutricional con enfoque integral, deportiva y realista.<br />Presencial en Concón, Región de Valparaíso · Online a todo el mundo.</p>
              <div className="pe-footer-social">
                <a href="https://www.instagram.com/elliotnutrition/" target="_blank" rel="noopener noreferrer" className="pe-btn-ghost-footer">Instagram ↗</a>
                <a href={WA_BASE} target="_blank" rel="noopener noreferrer" className="pe-btn-ghost-footer">WhatsApp ↗</a>
              </div>
            </div>
            <div>
              <h4>Servicios</h4>
              <ul>
                <li><a href="#servicios">Hábitos y bienestar</a></li>
                <li><a href="#servicios">Rendimiento deportivo</a></li>
                <li><a href="#servicios">Clínico y de salud</a></li>
              </ul>
            </div>
            <div>
              <h4>Programas</h4>
              <ul>
                <li><a href="#programas">Consulta Inicial</a></li>
                <li><a href="#programas">Plan 3 Meses</a></li>
                <li><a href="#programas">Plan 6 Meses</a></li>
              </ul>
            </div>
            <div>
              <h4>Contacto</h4>
              <ul>
                <li><a href="mailto:pelliotbanados@gmail.com">pelliotbanados@gmail.com</a></li>
                <li><a href={WA_BASE}>+56 9 4215 6610</a></li>
                <li>Avenida Reñaca Norte 25, Concón, Chile.</li>
              </ul>
            </div>
          </div>
          <div className="pe-footer-bottom">
            <span>© 2026 Paulette Elliot · Nutricionista</span>
            <span>Powered by SomaOS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
