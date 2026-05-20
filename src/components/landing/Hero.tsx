import HeroVideo from "./HeroVideo";
import { ArrowRight, PlayCircle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const WHATSAPP_URL = "https://wa.me/56990797847?text=Hola%20SomaOS%2C%20quiero%20mi%20sistema";

export const Hero = () => {
  const reduce = useReducedMotion();
  const stagger = (i: number) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  });

  return (
    <section id="top" className="relative overflow-hidden bg-cream">
      {/* Subtle warm aurora */}
      <div className="pointer-events-none absolute -left-40 top-0 h-[520px] w-[520px] rounded-full bg-brand-soft/70 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-32 top-40 h-[420px] w-[420px] rounded-full bg-brand/15 blur-3xl" aria-hidden />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 pb-14 pt-12 sm:pt-16 lg:grid-cols-12 lg:gap-8 lg:pb-20 lg:pt-20">
        {/* Centered copy */}
        <div className="lg:col-span-12 flex flex-col items-center text-center mx-auto max-w-4xl">
          <motion.div {...stagger(0)} className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink shadow-[0_2px_10px_rgba(11,7,38,0.04)]">
            <span className="text-base leading-none">🇨🇱</span> Operamos en Chile
          </motion.div>
          <motion.p {...stagger(1)} className="mt-3 text-xs font-semibold uppercase tracking-[0.22em] text-ink-soft">
            Para profesionales independientes
          </motion.p>

          <motion.h1
            {...stagger(2)}
            className="mt-4 text-balance text-4xl font-bold leading-[1.1] text-ink sm:text-5xl lg:text-6xl"
          >
            Tu negocio debería funcionar{" "}
            <span className="text-brand">aunque tú no estés.</span>
          </motion.h1>

          <motion.p {...stagger(3)} className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed font-bold text-ink sm:text-xl">
            <span className="text-brand">Lo dejamos operando solo en 7 días.</span> Soma automatiza reservas, pagos, recordatorios y seguimiento para que dejes de administrar tu negocio manualmente y vuelvas a enfocarte en <span className="underline decoration-brand decoration-2 underline-offset-4">atender.</span>
          </motion.p>
        </div>

        {/* Mockup */}
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, x: 40, rotate: 6 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative lg:col-span-12 mx-auto w-full max-w-5xl"
        >
          <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-brand-soft blur-2xl" aria-hidden />
          <div className="relative">
            <HeroVideo />
            {/* Floating notification card */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="absolute -left-4 top-6 hidden rounded-2xl border border-line bg-white px-4 py-3 shadow-soft sm:left-2 md:block"
              style={{ animation: "floatY 5s ease-in-out infinite" }}
            >
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-soft text-base">📅</div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Nueva reserva</div>
                  <div className="text-sm font-semibold text-ink">María agendó · Mañana 11:00</div>
                </div>
              </div>
            </motion.div>
            {/* Floating payment card */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 0.6 }}
              className="absolute -right-2 -bottom-4 hidden rounded-2xl border border-line bg-white px-4 py-3 shadow-soft sm:-right-6 md:block"
              style={{ animation: "floatY 5s ease-in-out infinite", animationDelay: "1.5s" }}
            >
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white text-base">💳</div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Pago recibido</div>
                  <div className="text-sm font-semibold text-ink">$35.000 · WebPay</div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Below video: CTAs + audience line */}
        <div className="lg:col-span-12 flex flex-col items-center text-center">
          <motion.div {...stagger(4)} className="flex flex-col gap-3 sm:flex-row">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-7 text-sm font-semibold text-white transition hover:bg-brand/90"
            >
              Quiero mi sistema
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#como-funciona"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border-[1.5px] border-ink/85 bg-transparent px-7 text-sm font-semibold text-ink transition hover:bg-ink hover:text-cream"
            >
              <PlayCircle className="h-4 w-4" /> Ver cómo funciona
            </a>
          </motion.div>
          <motion.p {...stagger(5)} className="mt-6 max-w-2xl text-base text-ink/70 sm:text-lg">
            Implementación en 7 días · Sin contratos · Soporte continuo
          </motion.p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
