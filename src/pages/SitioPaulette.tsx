import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCLP } from "@/lib/format";

interface Servicio {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_min: number;
}

const USER_ID = "e84c4f11-50c2-4b6e-8c4b-055bb635edcd";
const WA = "https://wa.me/56942156610";
const WA_TEXT = (msg: string) => `${WA}?text=${encodeURIComponent(msg)}`;

const STATIC_SERVICES: Servicio[] = [
  { id: "ctrl", name: "Control Nutricional", description: "Para pacientes en seguimiento", price: 40000, duration_min: 30 },
  { id: "1m", name: "Consulta Inicial", description: "Evaluación completa + plan personalizado", price: 42000, duration_min: 60 },
  { id: "3m", name: "Plan 3 Meses", description: "2 consultas + seguimiento mensual", price: 110000, duration_min: 60 },
  { id: "6m", name: "Plan 6 Meses", description: "5 consultas + proceso completo", price: 200000, duration_min: 60 },
];

function Wave({ from, to }: { from: string; to: string }) {
  return (
    <svg viewBox="0 0 1440 70" preserveAspectRatio="none"
      style={{ display: "block", width: "100%", height: 56, background: from, marginTop: -1, marginBottom: -1 }}>
      <path d="M0,35 C180,70 360,0 540,35 C720,70 900,0 1080,35 C1260,70 1380,18 1440,35 L1440,70 L0,70 Z" fill={to} />
    </svg>
  );
}

export default function SitioPaulette() {
  const [servicios, setServicios] = useState<Servicio[]>(STATIC_SERVICES);
  const [modo, setModo] = useState<"presencial" | "online">("presencial");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("servicios")
        .select("id, name, description, price, duration_min")
        .eq("user_id", USER_ID)
        .eq("active", true)
        .order("created_at");
      if (data && data.length > 0) setServicios(data as Servicio[]);
    };
    load();
    const ch = supabase.channel("paulette-servicios")
      .on("postgres_changes", { event: "*", schema: "public", table: "servicios", filter: `user_id=eq.${USER_ID}` }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  return (
    <div style={{ fontFamily: "'Geist', ui-sans-serif, system-ui, sans-serif", background: "#f6f6ea", color: "#474511", overflowX: "hidden" }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600&display=swap" />

      {/* NAV */}
      <header style={{ position: "sticky", top: 0, zIndex: 40, background: "#f6f6ea", backdropFilter: "blur(12px)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "10px clamp(20px,4vw,56px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
          <img src="/logo-elliot-nutri.svg" alt="Elliot Nutri" style={{ height: 72, width: "auto" }} />
          <nav style={{ display: "flex", gap: 28 }}>
            {[["#sobre", "Sobre mí"], ["#servicios", "Servicios"], ["#programas", "Programas"], ["#reseñas", "Reseñas"]].map(([href, label]) => (
              <a key={href} href={href} style={{ color: "rgba(71,69,17,0.75)", fontSize: 15, fontWeight: 600, textDecoration: "none" }}>{label}</a>
            ))}
          </nav>
          <a href="#agenda" style={{ padding: "10px 20px", borderRadius: 999, background: "#d49930", color: "#f6f6ea", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Reserva hora →</a>
        </div>
      </header>

      <Wave from="#f6f6ea" to="#474511" />

      {/* HERO */}
      <section style={{ background: "#474511", padding: "clamp(48px,7vw,96px) clamp(20px,4vw,56px) clamp(48px,6vw,80px)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: "clamp(32px,5vw,80px)", alignItems: "end" }}>
          <div>
            <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(52px,7.5vw,84px)", lineHeight: 0.95, letterSpacing: "-0.035em", color: "#f6f6ea", fontWeight: 400, margin: "0 0 28px" }}>
              Transforma tu<br />salud desde<br /><em style={{ fontStyle: "italic", color: "rgba(246,246,234,0.85)" }}>hábitos reales</em><br />y sostenibles.
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.55, color: "rgba(246,246,234,0.88)", maxWidth: "46ch", margin: "0 0 32px" }}>
              Nutrición cercana, profesional y adaptada a tu vida. Sin extremos, sin culpa, con resultados que sí puedes mantener.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="#agenda" style={{ padding: "14px 24px", borderRadius: 999, background: "#deeca0", color: "#3b5345", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Reserva hora</a>
              <a href="#programas" style={{ padding: "14px 24px", borderRadius: 999, border: "1px solid #deeca0", color: "#deeca0", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Ver programa</a>
            </div>
            <div style={{ marginTop: 36, display: "flex", gap: 18, fontSize: 12, color: "rgba(246,246,234,0.7)", fontFamily: "monospace", letterSpacing: "0.04em", flexWrap: "wrap" }}>
              {["Atención personalizada", "Enfoque realista", "Acompañamiento cercano"].map((t, i) => (
                <span key={t} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {i > 0 && <span style={{ width: 20, height: 1, background: "currentColor", opacity: 0.5, display: "inline-block" }} />}
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div style={{ position: "relative", aspectRatio: "4/5", background: "rgba(222,236,160,0.25)", borderRadius: "180px 180px 24px 24px", overflow: "hidden", maxWidth: 520, marginLeft: "auto", width: "100%" }}>
            <img src="/paulette-perfil.jpg" alt="Paulette Elliot" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "52% 30%" }} />
          </div>
        </div>
      </section>

      <Wave from="#474511" to="#f6f6ea" />

      {/* ABOUT */}
      <section id="sobre" style={{ background: "#f6f6ea", padding: "clamp(80px,10vw,140px) clamp(20px,4vw,56px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "clamp(40px,6vw,100px)", alignItems: "start" }}>
          <div style={{ aspectRatio: "4/5", borderRadius: 24, overflow: "hidden", background: "#deeca0" }}>
            <img src="/paulette-hero.jpg" alt="Paulette en consulta" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 35%" }} />
          </div>
          <div>
            <span style={{ color: "#dba22d", fontSize: 15, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 28 }}>Sobre mí</span>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(38px,4.5vw,56px)", lineHeight: 1.02, letterSpacing: "-0.03em", margin: "0 0 28px" }}>
              Nutrición que<br />se <em style={{ fontStyle: "italic", opacity: 0.75 }}>adapta</em> a ti.
            </h2>
            <p style={{ fontSize: 17, lineHeight: 1.65, opacity: 0.85, maxWidth: "52ch", margin: "0 0 18px" }}>
              Soy <strong>Paulette Elliot</strong>, nutricionista, y acompaño a personas que quieren mejorar su alimentación sin caer en extremos ni frustraciones.
            </p>
            <p style={{ fontSize: 17, lineHeight: 1.65, opacity: 0.85, maxWidth: "52ch", margin: "0 0 18px" }}>
              Mi enfoque combina ciencia, educación y hábitos sostenibles, entendiendo que cada proceso es distinto.
            </p>
            <blockquote style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: 22, lineHeight: 1.35, margin: "24px 0 8px", padding: 0, border: 0 }}>
              Aquí no se trata de hacerlo perfecto. Se trata de construir algo que sí puedas mantener.
            </blockquote>
            <p style={{ fontSize: 15, fontWeight: 500, opacity: 0.7, marginBottom: 28 }}>— Paulette Elliot B.</p>
            <a href="#agenda" style={{ display: "inline-block", padding: "14px 24px", borderRadius: 999, background: "#d49930", color: "#f8f3e7", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Agenda tu consulta</a>
          </div>
        </div>
      </section>

      <Wave from="#f6f6ea" to="#deeca0" />

      {/* STATS */}
      <div style={{ background: "#deeca0", padding: "clamp(24px,3vw,40px) clamp(20px,4vw,56px)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, textAlign: "center" }}>
          {[{ v: "+6", l: "años de experiencia" }, { v: "+3.000", l: "atenciones realizadas" }].map((s) => (
            <div key={s.v}>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(48px,6vw,84px)", lineHeight: 1, letterSpacing: "-0.035em" }}>{s.v}</div>
              <div style={{ fontFamily: "monospace", fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.8, fontWeight: 600, marginTop: 8 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <Wave from="#deeca0" to="#f6f6ea" />

      {/* TRES CAMINOS */}
      <section id="servicios" style={{ background: "#f6f6ea", padding: "clamp(60px,8vw,120px) clamp(20px,4vw,56px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(32px,4vw,50px)", lineHeight: 1.1, letterSpacing: "-0.02em", margin: "0 0 14px", fontWeight: 400 }}>
              Tres caminos, un solo <em style={{ fontStyle: "italic", opacity: 0.75 }}>propósito</em>
            </h2>
            <p style={{ color: "rgba(71,69,17,0.75)", maxWidth: "60ch", margin: "0 auto", fontSize: 15 }}>
              Cada persona llega con un motivo distinto. Estos son los tres grandes enfoques desde donde armamos tu plan.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, paddingTop: 40 }}>
            {[
              { icon: "🌱", title: "Hábitos y bienestar", text: "Para quienes quieren mejorar su relación con la comida y construir hábitos sostenibles sin obsesionarse.", tag: "Cambio sostenible", bg: "#deeca0", color: "#474511" },
              { icon: "🏋️", title: "Rendimiento deportivo", text: "Nutrición orientada a optimizar tu rendimiento, recuperación y composición corporal si practicas deporte.", tag: "Performance", bg: "#dba22d", color: "#f6f6ea" },
              { icon: "🩺", title: "Clínico y de salud", text: "Para condiciones como resistencia a la insulina, hipotiroidismo, dislipidemias, embarazo y más.", tag: "Acompañamiento médico", bg: "#474511", color: "#f6f6ea" },
            ].map((c, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 20, padding: "22px 22px 22px", display: "flex", flexDirection: "column", minHeight: 320, border: "1px solid rgba(71,69,17,0.12)", position: "relative", paddingTop: 56, marginTop: 34 }}>
                <div style={{ position: "absolute", top: -34, left: "50%", transform: "translateX(-50%)", width: 68, height: 90, borderRadius: 999, background: c.bg, color: c.color, display: "grid", placeItems: "center", fontSize: 28, boxShadow: "0 8px 24px -12px rgba(71,69,17,0.4)" }}>
                  {c.icon}
                </div>
                <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, lineHeight: 1.05, margin: "6px 0 12px", textAlign: "center" }}>{c.title}</h3>
                <p style={{ fontSize: 15, opacity: 0.8, lineHeight: 1.55, margin: 0, textAlign: "center", flex: 1 }}>{c.text}</p>
                <div style={{ marginTop: "auto", paddingTop: 20, borderTop: "1px dashed rgba(71,69,17,0.18)", fontSize: 12, fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.7 }}>{c.tag}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Wave from="#f6f6ea" to="#cedc8f" />

      {/* PROGRAMAS */}
      <section id="programas" style={{ background: "#cedc8f", color: "#403c01", padding: "clamp(60px,8vw,100px) clamp(20px,4vw,56px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(32px,4vw,52px)", lineHeight: 1.1, letterSpacing: "-0.02em", margin: "0 0 16px", fontWeight: 400 }}>
              Elige el plan que mejor se <em style={{ fontStyle: "italic", opacity: 0.75 }}>adapta</em> a ti
            </h2>
            <p style={{ color: "rgba(64,60,1,0.75)", maxWidth: "60ch", margin: "0 auto 24px", fontSize: 15 }}>
              Cada plan se adapta a tu contexto, tu ritmo y tus objetivos. Boleta electrónica válida para Isapre.
            </p>
            <div style={{ display: "inline-flex", background: "#474511", borderRadius: 999, padding: 6 }}>
              {(["presencial", "online"] as const).map((m) => (
                <button key={m} onClick={() => setModo(m)}
                  style={{ padding: "10px 22px", borderRadius: 999, background: modo === m ? "#deeca0" : "transparent", color: modo === m ? "#474511" : "rgba(246,246,234,0.7)", border: 0, cursor: "pointer", fontFamily: "monospace", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 500, transition: "all 0.2s" }}>
                  {m === "presencial" ? "Presencial" : "Online"}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 48 }}>
            {servicios.filter(s => s.id !== "ctrl").map((s, i) => {
              const featured = i === 1;
              const onlineDiscount = 0.9;
              const price = modo === "online" ? Math.round(s.price * onlineDiscount) : s.price;
              return (
                <div key={s.id} style={{
                  background: featured ? "#6f8c2a" : "#f6f6ea", color: featured ? "#f6f6ea" : "#403c01",
                  border: featured ? "none" : "1px solid rgba(64,60,1,0.15)", borderRadius: 28,
                  padding: "32px 28px", display: "flex", flexDirection: "column",
                  transform: featured ? "translateY(-8px)" : undefined,
                  boxShadow: featured ? "0 20px 60px -20px rgba(0,0,0,0.25)" : undefined,
                }}>
                  {featured && <span style={{ alignSelf: "flex-start", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", padding: "6px 12px", borderRadius: 999, background: "#deeca0", color: "#403c01", marginBottom: 20 }}>Más elegido</span>}
                  <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 34, lineHeight: 1, margin: "0 0 8px" }}>{s.name}</h3>
                  <p style={{ fontSize: 14, margin: "0 0 24px", opacity: 0.75, maxWidth: "28ch" }}>{s.description}</p>
                  <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 48, letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 4 }}>{formatCLP(price)}</div>
                  <div style={{ fontFamily: "monospace", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.6, marginBottom: 28 }}>{s.duration_min} min · {modo}</div>
                  <a href={WA_TEXT(`Hola! Me gustaría agendar: ${s.name}`)} target="_blank" rel="noopener noreferrer"
                    style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderRadius: 14, background: featured ? "#f6f6ea" : "#403c01", color: featured ? "#403c01" : "#f6f6ea", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>
                    <span>Agenda tu consulta</span><span>→</span>
                  </a>
                </div>
              );
            })}
          </div>

          <div style={{ maxWidth: 560, margin: "0 auto", padding: "36px 32px", borderRadius: 24, background: "#474511", color: "#f6f6ea", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(24px,3vw,34px)", lineHeight: 1.1, margin: "0 0 8px", fontWeight: 400 }}>¿No sabes cuál elegir?</h3>
            <p style={{ opacity: 0.85, margin: "0 0 22px", fontSize: 15 }}>Escríbeme por WhatsApp y te oriento sin compromiso.</p>
            <a href={WA_TEXT("Hola! Quiero saber qué plan me conviene.")} target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "14px 26px", borderRadius: 999, background: "#25D366", color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
              Hablar por WhatsApp
            </a>
          </div>
        </div>
      </section>

      <Wave from="#cedc8f" to="#f6f6ea" />

      {/* RESEÑAS */}
      <section id="reseñas" style={{ background: "#f6f6ea", padding: "clamp(40px,5vw,64px) clamp(20px,4vw,56px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(28px,3.2vw,40px)", lineHeight: 1.05, margin: "0 0 10px", fontWeight: 400 }}>
              Lo que dicen <em style={{ fontStyle: "italic", opacity: 0.7 }}>mis pacientes</em>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {[
              { q: "En primer lugar la recepción fue muy cordial. El programa está dando muy buenos resultados en cada control. Muy motivadora.", n: "Eugenio Thomas", i: "ET" },
              { q: "Llegar a las manos de Paulette ha sido una excelente decisión. Me ha ayudado a entender y escuchar mi cuerpo y generar cambios reales.", n: "Francisca Pino", i: "FP" },
              { q: "He notado cambios, no solo físicos, sino también en mis niveles de energía. Las pautas se adaptan a lo que me gusta comer.", n: "Doni Fernández", i: "DF" },
              { q: "Una tremenda profesional, llevo 3 meses con ella y ya voy viendo resultados, su plan es basado 100% en mis necesidades.", n: "Lorena Olivares", i: "LO" },
            ].map((r) => (
              <div key={r.n} style={{ background: "#fff", border: "1px solid rgba(64,60,1,0.12)", borderRadius: 18, padding: "18px 16px", display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 16, color: "#f7cb96", letterSpacing: "0.15em", marginBottom: 10 }}>★ ★ ★ ★ ★</div>
                <p style={{ fontFamily: "'Instrument Serif', serif", fontSize: 13.5, lineHeight: 1.55, color: "#403c01", margin: 0, flex: 1 }}>"{r.q}"</p>
                <div style={{ marginTop: "auto", paddingTop: 14, borderTop: "1px solid rgba(64,60,1,0.15)", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 999, background: "#f7cb96", color: "#403c01", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 600, flexShrink: 0 }}>{r.i}</div>
                  <span style={{ fontSize: 12.5, fontWeight: 500, color: "#403c01" }}>{r.n}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Wave from="#f6f6ea" to="#474511" />

      {/* CLOSING CTA */}
      <section style={{ background: "#474511", color: "#f6f6ea", padding: "clamp(48px,6vw,80px) clamp(20px,4vw,56px)", textAlign: "center" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(24px,3vw,38px)", lineHeight: 1.25, letterSpacing: "-0.015em", margin: "0 auto 28px", maxWidth: "48ch", fontWeight: 400 }}>
            Tu bienestar no empieza cuando todo esté perfecto,<br />
            empieza cuando <em style={{ fontStyle: "italic", color: "#dba22d" }}>decides hacer las cosas distinto</em>.
          </h2>
          <a href="#agenda" style={{ display: "inline-block", padding: "14px 28px", borderRadius: 999, background: "#dba22d", color: "#474511", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Reserva ahora</a>
        </div>
      </section>

      <Wave from="#474511" to="#f6f6ea" />

      {/* AGENDA */}
      <section id="agenda" style={{ background: "#f6f6ea", padding: "clamp(64px,8vw,100px) clamp(20px,4vw,56px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 48, lineHeight: 1.1, letterSpacing: "-0.02em", margin: "0 0 10px", fontWeight: 600 }}>
              Agenda tu <em style={{ fontStyle: "italic", color: "#dba22d" }}>consulta</em>
            </h2>
            <p style={{ color: "rgba(71,69,17,0.7)", fontSize: 15 }}>Elige el horario que mejor se adapte a ti.</p>
          </div>
          <div style={{ maxWidth: 480, margin: "0 auto", padding: "40px 32px", borderRadius: 24, background: "#e6decd", textAlign: "center" }}>
            <p style={{ fontSize: 16, lineHeight: 1.6, opacity: 0.85, margin: "0 0 24px" }}>
              Para agendar tu consulta, escríbeme directamente por WhatsApp y coordinamos fecha y horario.
            </p>
            <a href={WA_TEXT("Hola Paulette! Me gustaría agendar una consulta nutricional.")} target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "16px 28px", borderRadius: 999, background: "#25D366", color: "#fff", fontSize: 15, fontWeight: 600, textDecoration: "none" }}>
              <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
              Agendar por WhatsApp
            </a>
            <p style={{ fontSize: 12, opacity: 0.55, marginTop: 14 }}>Atención presencial en Concón · Online a todo Chile</p>
          </div>
        </div>
      </section>

      <Wave from="#f6f6ea" to="#dba22d" />

      {/* FOOTER */}
      <footer style={{ background: "#dba22d", color: "#f6f6ea", padding: "48px clamp(20px,4vw,56px) 28px" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 40, marginBottom: 48 }}>
            <div>
              <img src="/logo-elliot.svg" alt="Elliot Nutri" style={{ width: 155, height: "auto", filter: "brightness(0) invert(1)", marginBottom: 16 }} />
              <p style={{ fontSize: 14, lineHeight: 1.55, opacity: 0.9, maxWidth: "32ch", margin: "0 0 20px" }}>
                Consulta nutricional con enfoque integral, deportiva y realista.<br />Presencial en Concón · Online a todo el mundo.
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <a href="https://www.instagram.com/elliotnutrition/" target="_blank" rel="noopener noreferrer"
                  style={{ padding: "10px 16px", borderRadius: 999, border: "1px solid rgba(246,246,234,0.6)", color: "#f6f6ea", fontSize: 12, textDecoration: "none" }}>Instagram ↗</a>
                <a href={WA} target="_blank" rel="noopener noreferrer"
                  style={{ padding: "10px 16px", borderRadius: 999, border: "1px solid rgba(246,246,234,0.6)", color: "#f6f6ea", fontSize: 12, textDecoration: "none" }}>WhatsApp ↗</a>
              </div>
            </div>
            <div>
              <h4 style={{ fontFamily: "monospace", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", margin: "0 0 16px", fontWeight: 600 }}>Servicios</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {["Hábitos y bienestar", "Rendimiento deportivo", "Clínico y de salud"].map(l => (
                  <li key={l}><a href="#servicios" style={{ color: "#f6f6ea", textDecoration: "none", fontSize: 14, opacity: 0.85 }}>{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 style={{ fontFamily: "monospace", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", margin: "0 0 16px", fontWeight: 600 }}>Programas</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {["Consulta Inicial", "Plan 3 Meses", "Plan 6 Meses"].map(l => (
                  <li key={l}><a href="#programas" style={{ color: "#f6f6ea", textDecoration: "none", fontSize: 14, opacity: 0.85 }}>{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 style={{ fontFamily: "monospace", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", margin: "0 0 16px", fontWeight: 600 }}>Contacto</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10, fontSize: 14, opacity: 0.85 }}>
                <li><a href="mailto:pelliotbanados@gmail.com" style={{ color: "#f6f6ea", textDecoration: "none" }}>pelliotbanados@gmail.com</a></li>
                <li><a href={WA} style={{ color: "#f6f6ea", textDecoration: "none" }}>+56 9 4215 6610</a></li>
                <li>Avenida Reñaca Norte 25, Concón</li>
              </ul>
            </div>
          </div>
          <div style={{ paddingTop: 24, borderTop: "1px solid rgba(246,246,234,0.3)", display: "flex", justifyContent: "space-between", fontFamily: "monospace", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>
            <span>© 2026 Paulette Elliot · Nutricionista</span>
            <span>Powered by SomaOS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
