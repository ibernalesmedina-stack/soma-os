import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, Check, MessageSquare, CalendarX, CreditCard, BellOff, BarChart3, CalendarCheck, CreditCard as CreditCardOk, Bell, BarChart } from "lucide-react";

const rows: { iconHoy: any; hoy: string; iconSoma: any; soma: string }[] = [
  { iconHoy: MessageSquare, hoy: "WhatsApp infinito respondiendo horarios", iconSoma: CalendarCheck, soma: "Tus clientes agendan solos 24/7" },
  { iconHoy: CalendarX, hoy: "Agenda en la cabeza, en notas y en Excel", iconSoma: CalendarCheck, soma: "Una sola agenda sincronizada con Google Calendar" },
  { iconHoy: CreditCard, hoy: "Pagos que olvidas cobrar o cobras a destiempo", iconSoma: CreditCardOk, soma: "Pagan al reservar, automático" },
  { iconHoy: BellOff, hoy: "Cancelaciones de último minuto sin aviso", iconSoma: Bell, soma: "Recordatorios automáticos por WhatsApp y mail" },
  { iconHoy: BarChart3, hoy: "«¿Cuánto facturé este mes?» sin idea", iconSoma: BarChart, soma: "Dashboard con ingresos, clientes y sesiones en tiempo real" },
];

export const Problema = () => {
  const reduce = useReducedMotion();

  return (
    <section
      id="problema"
      className="relative overflow-hidden py-16 text-ink sm:py-24"
      style={{
        background:
          "linear-gradient(180deg, #FFFFFF 0%, #F5F1FB 18%, #DFD8F5 38%, #B6B8EC 60%, #7E8AD8 80%, #2B5BC4 100%)",
      }}
    >
      <div className="relative mx-auto max-w-6xl px-6">
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="text-balance text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-[48px]">
            Trabajas más de lo necesario.{" "}
            <span className="text-brand">Y lo sabes.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-ink/80 sm:text-xl">
            Cada hora respondiendo WhatsApp es una hora que no estás atendiendo. Cada cliente nuevo, más tareas que no te pagan.
          </p>
        </motion.div>

        <div className="relative mt-12">
          {/* Vertical divider line — animated */}
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "top" }}
            className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-ink/15 md:block"
            aria-hidden
          />

          {/* Headers */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-[#C2410C] md:pr-8">
              <AlertTriangle className="h-4 w-4" /> Hoy
            </div>
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-[#0F766E] md:pl-8">
              <Check className="h-4 w-4" /> Con SomaOS
            </div>
          </div>

          <ul className="divide-y divide-ink/10">
            {rows.map((r, i) => {
              const IH = r.iconHoy;
              const IS = r.iconSoma;
              return (
                  <li key={r.hoy} className="grid grid-cols-1 gap-5 py-5 md:grid-cols-2 md:gap-0">
                  <motion.div
                    initial={reduce ? { opacity: 0 } : { opacity: 0, x: -24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-start gap-4 text-ink/80 md:pr-8"
                  >
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/70 text-[#C2410C] shadow-[0_4px_18px_rgba(11,7,38,0.08)]">
                      <IH className="h-6 w-6" strokeWidth={1.8} />
                    </span>
                    <span className="pt-2 text-base leading-snug sm:text-lg">{r.hoy}</span>
                  </motion.div>
                  <motion.div
                    initial={reduce ? { opacity: 0 } : { opacity: 0, x: 24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, delay: i * 0.08 + 0.05, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-start gap-4 text-ink md:pl-8"
                  >
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-[#0F766E] shadow-[0_4px_18px_rgba(11,7,38,0.10)]">
                      <IS className="h-6 w-6" strokeWidth={1.8} />
                    </span>
                    <span className="pt-2 text-base font-semibold leading-snug sm:text-lg">{r.soma}</span>
                  </motion.div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Problema;
