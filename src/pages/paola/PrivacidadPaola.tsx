import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PRIVACIDAD_MD } from "./privacidad";
import { SITE_STYLES, CONTENIDO_STYLES, Contenido, Footer, WhatsAppButton, useMeta, waLink } from "./comun";

export default function PrivacidadPaola() {
  useMeta({
    title: "Política de privacidad | Dra. Paola Cárdenas Fica",
    description: "Cómo recopilamos, usamos y protegemos tus datos personales en el sitio de la Dra. Paola Cárdenas Fica.",
    path: "/politica-de-privacidad",
  });
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <>
      <style>{SITE_STYLES + CONTENIDO_STYLES}</style>
      <main className="pc-site min-h-screen overflow-x-hidden">
        <header className="sticky top-0 z-50 flex items-center justify-between gap-4" style={{ padding: "16px clamp(20px,5vw,72px)", background: "rgba(240,235,229,.94)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(50,44,40,.1)" }}>
          <Link to="/" className="inline-flex items-center gap-2" style={{ fontSize: 12, fontWeight: 500, letterSpacing: ".18em", textTransform: "uppercase", color: "#322C28" }}>
            <ArrowLeft className="h-3.5 w-3.5" /> Volver
          </Link>
          <Link to="/" className="pc-serif hidden md:block whitespace-nowrap" style={{ color: "#322C28", fontWeight: 700, fontSize: 17, letterSpacing: "0.14em", textTransform: "uppercase" }}>Dra. Paola Cárdenas Fica</Link>
          <a href={waLink("Hola Dra. Paola, tengo una consulta.")} target="_blank" rel="noreferrer" className="rounded-full" style={{ padding: "11px 20px", background: "#B89B6A", color: "#fff", fontSize: 11, fontWeight: 500, letterSpacing: ".18em", textTransform: "uppercase" }}>Contacto</a>
        </header>
        <section style={{ background: "#727f89", color: "#F4F2EE", padding: "clamp(56px,11vh,120px) clamp(20px,5vw,72px) clamp(48px,8vh,96px)" }}>
          <div className="mx-auto" style={{ maxWidth: 1180 }}>
            <p style={{ fontSize: "clamp(12px,.95vw,14px)", fontWeight: 700, letterSpacing: ".26em", textTransform: "uppercase", color: "#E3D3B4", marginBottom: 22 }}>Inicio · Legal</p>
            <h1 className="pc-serif" style={{ margin: 0, fontWeight: 300, fontSize: "clamp(42px,6vw,92px)", lineHeight: 1, letterSpacing: "-.025em" }}>Política de privacidad</h1>
            <p className="pc-serif" style={{ margin: "20px 0 0", fontStyle: "italic", fontWeight: 300, fontSize: "clamp(20px,1.8vw,28px)", color: "#E3D3B4" }}>Última actualización: noviembre de 2026</p>
          </div>
        </section>
        <section style={{ padding: "clamp(48px,8vh,96px) clamp(20px,5vw,72px)" }}>
          <div className="mx-auto" style={{ maxWidth: 760 }}>
            <p className="pc-serif" style={{ margin: "0 0 8px", fontSize: "clamp(22px,2vw,30px)", lineHeight: 1.3 }}>
              Tu privacidad es importante para nosotros. Aquí te explicamos qué datos recopilamos, para qué los usamos y cuáles son tus derechos.
            </p>
            <Contenido md={PRIVACIDAD_MD} />
          </div>
        </section>
        <Footer base="/" />
        <WhatsAppButton />
      </main>
    </>
  );
}
