import { motion, useReducedMotion } from "framer-motion";
import { Check, ArrowRight, MessageCircle, ShieldCheck } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/56990797847?text=Hola%20SomaOS%2C%20quiero%20mi%20sistema";

const incluye = [
  "Sitio web profesional diseñado a tu marca",
  "Catálogo de servicios con precios y descripciones",
  "Sistema de reservas online 24/7",
  "Cobro automático con WebPay y Mercado Pago",
  "Agenda sincronizada con Google Calendar",
  "Recordatorios automáticos por WhatsApp y email",
  "Reviews automáticos en tu Google Business",
  "Boletas SII electrónicas automáticas",
  "Panel de control con ingresos, clientes y métricas",
  "Base de datos completa de clientes",
  "Capacitación 1-a-1 grabada (45 min)",
  "30 días de soporte post-entrega",
  "Garantía 30 días: si no funciona, te devolvemos el 100%",
];

export const Planes = () => {
  const reduce = useReducedMotion();
  return (
    <section id="planes" className="relative bg-cream py-16 sm:py-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-line" aria-hidden />
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-soft">Inversión</p>
          <h2 className="mt-4 text-balance text-4xl font-bold leading-[1.1] text-ink sm:text-5xl lg:text-[48px]">
            Un solo pago. <span className="text-brand">Sin mensualidades.</span>
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink/80 sm:text-xl">
            El sistema completo es tuyo. Sin software que renovar, sin cuotas escondidas, sin sorpresas en el segundo mes.
          </p>
        </motion.div>

        {/* CARD PRINCIPAL */}
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto mt-12 max-w-3xl"
        >
          {/* Glow background */}
          <div className="pointer-events-none absolute -inset-4 -z-10 rounded-[28px] bg-brand-soft/40 blur-2xl" aria-hidden />

          <div className="relative overflow-hidden rounded-[24px] border border-line bg-white shadow-[0_24px_60px_rgba(11,7,38,0.10)]">
            {/* Header con pago */}
            <div className="border-b border-line bg-cream-soft px-8 pt-8 pb-7 sm:px-12">
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-soft">Sistema completo SomaOS</p>
                <div className="mt-4 flex items-baseline justify-center gap-2">
                  <span className="text-6xl font-bold tracking-tight text-ink sm:text-7xl">$590.000</span>
                  <span className="text-base text-ink-soft">+ IVA</span>
                </div>
                <p className="mt-3 text-base text-ink-soft sm:text-lg">
                  Pago único <span className="font-semibold text-ink">50% al iniciar · 50% contra entrega</span>
                </p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-soft px-4 py-1.5 text-sm font-semibold text-brand">
                  <ShieldCheck className="h-4 w-4" />
                  Garantía 30 días, 100% devolución
                </div>
              </div>
            </div>

            {/* Cuerpo: lista de features */}
            <div className="px-8 py-8 sm:px-12 sm:py-10">
              <p className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-ink-soft">Todo incluido</p>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {incluye.map((f, i) => (
                  <motion.li
                    key={f}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.4, delay: i * 0.03 }}
                    className="flex items-start gap-3 text-[15px] leading-relaxed text-ink"
                  >
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-brand" strokeWidth={2.5} />
                    <span>{f}</span>
                  </motion.li>
                ))}
              </ul>

              {/* CTA principal */}
              <div className="mt-10 flex flex-col items-center gap-3">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-brand px-10 text-base font-semibold text-white shadow-[0_12px_30px_rgba(73,87,166,0.30)] transition hover:bg-brand/90"
                >
                  Quiero mi sistema
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                </a>
                <p className="text-center text-sm text-ink-soft">
                  Empezamos con una llamada de 30 minutos. Sin compromiso.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Notas finales */}
        <div className="mx-auto mt-8 max-w-3xl text-center">
          <p className="text-sm text-ink-soft">
            * El dominio web (~$12.000 CLP/año) y comisiones de pasarela de pago (WebPay 2.95% por transacción)
            son costos externos que pagas directamente a esos proveedores.
          </p>
          <p className="mt-6 text-sm text-ink-soft">
            ¿Tienes dudas?{" "}
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-brand hover:underline">
              <MessageCircle className="h-3.5 w-3.5" /> Conversemos por WhatsApp
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Planes;
