import { motion, useReducedMotion } from "framer-motion";
import { Check, ArrowRight, MessageCircle, Plus } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/56990797847?text=Hola%20SomaOS%2C%20quiero%20mi%20sistema";

const configuracion = [
  "Sitio web personalizado",
  "Sistema de reservas",
  "Integración WebPay",
  "Automatizaciones",
  "Google Calendar",
  "Base de datos",
  "Capacitación inicial",
];

const mantencion = [
  "Hosting",
  "Dominio",
  "WhatsApp API (hasta 500/mes)",
  "Emails automáticos ilimitados",
  "Soporte técnico",
  "Monitoreo",
  "Actualizaciones",
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
            Un solo precio. <span className="text-brand">Sin sorpresas.</span>
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink/80 sm:text-xl">
            Una configuración inicial y una mensualidad simple. No hay planes confusos, no hay letra chica, no hay upselling.
          </p>
        </motion.div>

        <div className="relative mt-12 grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
          {/* CONFIGURACIÓN INICIAL */}
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -6 }}
            className="relative rounded-[20px] border border-line bg-white p-8 shadow-[0_2px_20px_rgba(11,7,38,0.04)] transition-shadow hover:shadow-[0_14px_50px_rgba(11,7,38,0.10)]"
          >
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft">Configuración inicial</div>
            <p className="mt-2 text-[15px] text-ink-soft">Lo armamos completo en 7 días.</p>
            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-5xl font-bold tracking-tight text-ink">$249.000</span>
              <span className="text-sm text-ink-soft">+ IVA</span>
            </div>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-brand-soft/60 px-3 py-1 text-xs font-semibold text-brand">
              Pago único
            </div>

            <ul className="mt-7 space-y-3">
              {configuracion.map((f) => (
                <li key={f} className="flex items-start gap-3 text-[15px] text-ink">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-brand" strokeWidth={2.5} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* PLUS SIGN, sólo desktop */}
          <div className="hidden self-center lg:flex">
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid h-14 w-14 place-items-center rounded-full bg-ink text-cream shadow-[0_8px_24px_rgba(11,7,38,0.18)]"
              aria-hidden
            >
              <Plus className="h-7 w-7" strokeWidth={2.5} />
            </motion.div>
          </div>

          {/* MANTENCIÓN MENSUAL */}
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -8 }}
            className="relative rounded-[20px] bg-ink p-8 text-cream shadow-[0_20px_60px_rgba(73,87,166,0.35)]"
            style={{ animation: "pulseGlow 6s ease-in-out infinite" }}
          >
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-soft px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-ink">
              Sistema vivo
            </span>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-soft">Mantención mensual</div>
            <p className="mt-2 text-[15px] text-cream/70">Para que funcione sin que pienses.</p>
            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-5xl font-bold tracking-tight">$12.990</span>
              <span className="text-sm text-cream/60">/ mes</span>
            </div>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-brand-soft/15 px-3 py-1 text-xs font-semibold text-brand-soft">
              Cancela cuando quieras
            </div>

            <ul className="mt-7 space-y-3">
              {mantencion.map((f) => (
                <li key={f} className="flex items-start gap-3 text-[15px] text-cream/90">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-brand-soft" strokeWidth={2.5} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* CTA principal debajo */}
        <div className="mt-10 flex flex-col items-center gap-4">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-7 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(73,87,166,0.25)] transition hover:bg-brand/90"
          >
            Quiero mi sistema
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
          <p className="text-center text-sm text-ink-soft">
            Sin permanencia mínima. Sin multas por cancelar.
          </p>
        </div>

        <div className="mt-8 text-center text-sm text-ink-soft">
          ¿Tienes dudas?{" "}
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-brand hover:underline">
            <MessageCircle className="h-3.5 w-3.5" /> Conversemos por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
};

export default Planes;
