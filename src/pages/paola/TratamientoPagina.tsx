import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { TRATAMIENTOS, CATEGORIAS, type Tratamiento } from "./datos";
import { SITE_STYLES, CONTENIDO_STYLES, Contenido, Footer, WhatsAppButton, useMeta, waLink, tc } from "./comun";

const PAGE_STYLES = `
  .pc-tx-grid { display: grid; grid-template-columns: minmax(0,7fr) minmax(0,5fr); column-gap: clamp(32px,5vw,88px); align-items: start; }
  .pc-tx-lead { grid-column: 1; grid-row: 1; }
  .pc-tx-rest { grid-column: 1; grid-row: 2; }
  .pc-tx-box { grid-column: 2; grid-row: 1 / span 2; position: sticky; top: 96px; }
  @media (max-width: 880px) {
    .pc-tx-grid { grid-template-columns: minmax(0,1fr); row-gap: 32px; }
    .pc-tx-lead, .pc-tx-rest, .pc-tx-box { grid-column: auto; grid-row: auto; }
    .pc-tx-box { position: static; }
  }
`;

function Precios({ t }: { t: Tratamiento }) {
  if (!t.precios.length) return <div style={{ fontWeight: 600, fontSize: 26, color: "#322C28" }}>Consultar</div>;
  return (
    <div>
      {t.precios.map((p, i) => (
        <div key={i} className="flex justify-between items-baseline gap-3" style={{ padding: "12px 0", borderTop: i ? "1px solid rgba(50,44,40,.1)" : undefined }}>
          <span style={{ fontSize: 14.5, lineHeight: 1.4, color: "#5A5148" }}>
            {p.label}
            {p.antes && (
              <span className="block mt-1">
                <span className="inline-block mr-2 rounded-full" style={{ padding: "2px 8px", background: "rgba(184,155,106,.18)", color: "#8C7B62", fontWeight: 600, fontSize: 9, letterSpacing: ".16em", textTransform: "uppercase" }}>Oferta</span>
                <span style={{ fontSize: 12, color: "#8C8378", textDecoration: "line-through" }}>{p.antes}</span>
              </span>
            )}
          </span>
          <span className="whitespace-nowrap" style={{ fontWeight: 600, fontSize: 17, color: "#322C28" }}>
            {p.desde && <span style={{ marginRight: 6, fontWeight: 400, fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "#8C8378" }}>desde</span>}
            {p.price}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function TratamientoPagina({ slug }: { slug: string }) {
  const t = TRATAMIENTOS[slug];
  useMeta({
    title: t ? `${t.seoTitle} | Dra. Paola Cárdenas Fica` : "Tratamiento no encontrado | Dra. Paola Cárdenas Fica",
    description: t?.seoDesc ?? "",
    path: `/tratamientos/${slug}`,
    image: t?.img,
  });
  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  if (!t) {
    return (
      <main className="pc-site min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
        <style>{SITE_STYLES}</style>
        <h1 className="pc-serif" style={{ fontWeight: 300, fontSize: 48 }}>Tratamiento no encontrado</h1>
        <Link to="/#tratamientos" style={{ color: "#B89B6A", fontWeight: 600, letterSpacing: ".18em", textTransform: "uppercase", fontSize: 12 }}>Ver todos los tratamientos</Link>
      </main>
    );
  }

  const wa = waLink(`Hola Dra. Paola, quiero agendar una cita para ${tc(t.name)}.`);
  const lbl = t.precios.length > 1 ? "Valores" : "Valor";
  const notas = t.notaValor.length ? t.notaValor : t.nota ? [t.nota] : !t.precios.length ? ["Valor según evaluación clínica."] : [];
  const cat = CATEGORIAS.find((c) => c.title === t.cat);
  const rel = t.relacionados.filter((s) => TRATAMIENTOS[s]);
  const otros = [...rel, ...(cat?.slugs ?? []).filter((s) => s !== t.slug && !rel.includes(s))];
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "MedicalWebPage", name: t.seoTitle, description: t.seoDesc, url: `https://drapaolacardenasfica.com/tratamientos/${t.slug}`, inLanguage: "es-CL",
        about: { "@type": "MedicalProcedure", name: t.name },
        author: { "@type": "Dentist", name: "Dra. Paola Cárdenas Fica", telephone: "+56971252179",
          address: { "@type": "PostalAddress", streetAddress: "Edificio Soho, Av. Bosques de Montemar 30", addressLocality: "Concón", addressRegion: "Valparaíso", addressCountry: "CL" } } },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: "https://drapaolacardenasfica.com/" },
        { "@type": "ListItem", position: 2, name: "Tratamientos", item: "https://drapaolacardenasfica.com/#tratamientos" },
        { "@type": "ListItem", position: 3, name: t.name, item: `https://drapaolacardenasfica.com/tratamientos/${t.slug}` } ] },
    ],
  };

  return (
    <>
      <style>{SITE_STYLES + CONTENIDO_STYLES + PAGE_STYLES}</style>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <main className="pc-site min-h-screen overflow-x-hidden">
        <header className="sticky top-0 z-50 flex items-center justify-between gap-4" style={{ padding: "16px clamp(20px,5vw,72px)", background: "rgba(240,235,229,.94)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(50,44,40,.1)" }}>
          <Link to="/#tratamientos" className="inline-flex items-center gap-2" style={{ fontSize: 12, fontWeight: 500, letterSpacing: ".18em", textTransform: "uppercase", color: "#322C28" }}>
            <ArrowLeft className="h-3.5 w-3.5" /> Volver
          </Link>
          <Link to="/" aria-label="Dra. Paola Cárdenas Fica, inicio" className="hidden md:block"><img src="/paola-logo.svg" alt="Dra. Paola Cárdenas Fica" style={{ height: 38, width: "auto", display: "block" }} /></Link>
          <a href={wa} target="_blank" rel="noreferrer" className="rounded-full whitespace-nowrap" style={{ padding: "11px 20px", background: "#B89B6A", color: "#fff", fontSize: 11, fontWeight: 500, letterSpacing: ".18em", textTransform: "uppercase" }}>{t.boton}</a>
        </header>

        <section className="relative overflow-hidden" style={{ background: "#727f89", color: "#F4F2EE", padding: "clamp(56px,11vh,120px) clamp(20px,5vw,72px) clamp(48px,8vh,96px)" }}>
          {t.img && (
            <>
              <img src={t.img} alt="" className="absolute inset-y-0 right-0 h-full object-cover" style={{ width: "min(55%, 760px)", objectPosition: "center 30%" }} />
              <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, #727f89 0%, #727f89 45%, rgba(114,127,137,.6) 70%, rgba(114,127,137,.25) 100%)" }} />
            </>
          )}
          <div className="relative mx-auto" style={{ maxWidth: 1180 }}>
            <p style={{ fontSize: "clamp(12px,.95vw,14px)", fontWeight: 700, letterSpacing: ".26em", textTransform: "uppercase", color: "#E3D3B4", marginBottom: 22 }}>
              <Link to="/#tratamientos">Tratamientos</Link> · {tc(t.cat)}
            </p>
            <h1 className="pc-serif" style={{ margin: 0, fontWeight: 300, fontSize: "clamp(42px,6vw,92px)", lineHeight: 1, letterSpacing: "-.025em", maxWidth: "14ch" }}>{tc(t.name)}</h1>
            <p className="pc-serif" style={{ margin: "20px 0 0", fontStyle: "italic", fontWeight: 300, fontSize: "clamp(20px,1.8vw,28px)", color: "#E3D3B4" }}>{t.sub}</p>
          </div>
        </section>

        <section style={{ padding: "clamp(48px,8vh,96px) clamp(20px,5vw,72px)" }}>
          <div className="pc-tx-grid mx-auto" style={{ maxWidth: 1180 }}>
            <p className="pc-tx-lead pc-serif" style={{ margin: 0, fontWeight: 400, fontSize: "clamp(24px,2.1vw,32px)", lineHeight: 1.3, color: "#322C28" }}>{t.lead}</p>
            <aside className="pc-tx-box" style={{ background: "#fff", border: "1px solid rgba(50,44,40,.1)", borderRadius: 18, padding: "clamp(24px,2.4vw,36px)", boxShadow: "0 20px 50px rgba(50,44,40,.06)" }}>
              <div style={{ fontSize: 10, letterSpacing: ".24em", textTransform: "uppercase", color: "#8C8378", marginBottom: 6 }}>{lbl}</div>
              <Precios t={t} />
              {notas.map((n, i) => <p key={i} style={{ marginTop: 12, fontSize: 12.5, lineHeight: 1.6, color: "#8C8378" }}>{n}</p>)}
              {t.contenido.includes(":::opciones") && (
                <a href="#opciones" className="block mt-3" style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".18em", textTransform: "uppercase", color: "#8C7B62" }}>Ver todas las opciones ↓</a>
              )}
              <a href={wa} target="_blank" rel="noreferrer" className="block text-center rounded-full" style={{ marginTop: 24, padding: "16px 22px", background: "#B89B6A", color: "#fff", fontSize: 11, fontWeight: 500, letterSpacing: ".2em", textTransform: "uppercase" }}>{t.boton}</a>
              <p style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid rgba(50,44,40,.1)", fontSize: 12.5, lineHeight: 1.65, color: "#5A5148" }}>
                <strong style={{ color: "#322C28", fontWeight: 600 }}>¿Primera vez?</strong> Comienza con una cita diagnóstico presencial de $20.000, que se descuenta si te realizas el tratamiento el mismo día.
              </p>
            </aside>
            <div className="pc-tx-rest">
              {t.contenido ? <Contenido md={t.contenido} nombre={tc(t.name)} boton={t.boton} /> : <p style={{ marginTop: 18, fontSize: 16, lineHeight: 1.8, color: "#5A5148" }}>{t.desc}</p>}
            </div>
          </div>
        </section>

        {otros.length > 0 && (
          <section style={{ borderTop: "1px solid rgba(50,44,40,.1)", padding: "clamp(44px,7vh,80px) clamp(20px,5vw,72px) clamp(60px,10vh,110px)" }}>
            <div className="mx-auto" style={{ maxWidth: 1180 }}>
              <p style={{ fontSize: 10, letterSpacing: ".24em", textTransform: "uppercase", color: "#8C8378", marginBottom: 18 }}>
                {rel.length ? "Conoce también" : `Otros tratamientos de ${tc(t.cat)}`}
              </p>
              <div className="flex flex-wrap gap-2.5">
                {otros.map((s, i) => (
                  <Link key={s} to={`/tratamientos/${s}`} className="rounded-full transition-colors hover:bg-[#322C28] hover:text-[#f0ebe5]"
                    style={{ padding: "12px 20px", border: `1px solid ${i < rel.length ? "#B89B6A" : "rgba(50,44,40,.22)"}`, fontSize: 13, color: i < rel.length ? "#8C7B62" : "#322C28", fontWeight: i < rel.length ? 500 : 400 }}>
                    {tc(TRATAMIENTOS[s].name)}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <Footer base="/" />
        <WhatsAppButton />
      </main>
    </>
  );
}
