import { motion, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const steps = [
  { n: "01", title: "El cliente agenda", desc: "Tu cliente entra al sitio, elige un servicio y reserva una hora disponible." },
  { n: "02", title: "El sistema procesa todo", desc: "La hora se bloquea automáticamente, se registra el pago y se sincroniza con tu agenda." },
  { n: "03", title: "Se envían confirmaciones", desc: "Cliente y profesional reciben emails y recordatorios automáticos." },
  { n: "04", title: "El seguimiento ocurre solo", desc: "Soma continúa el contacto después de la cita para mejorar asistencia, fidelización y retorno." },
];

export const Proceso = () => {
  const reduce = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-step]");
    const w = card ? card.offsetWidth + 24 : 320;
    el.scrollBy({ left: dir * w, behavior: "smooth" });
  };
  return (
    <section id="como-funciona" className="relative bg-[hsl(var(--brand-soft))]/40 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-soft">Cómo funciona</p>
          <h2 className="mt-4 text-balance text-4xl font-bold leading-[1.1] text-ink sm:text-5xl lg:text-[48px]">
            Automatización real, <span className="text-brand">no solo una página web.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-ink/80 sm:text-xl">
            Cuando alguien agenda, el sistema hace todo el trabajo. Tú solo atiendes.
          </p>
        </motion.div>

        <div className="relative mt-12">
          <div className="absolute right-0 -top-14 hidden gap-2 sm:flex">
            <button
              onClick={() => scrollBy(-1)}
              aria-label="Anterior"
              className="grid h-11 w-11 place-items-center rounded-full border border-line bg-white text-ink transition hover:bg-ink hover:text-cream"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scrollBy(1)}
              aria-label="Siguiente"
              className="grid h-11 w-11 place-items-center rounded-full border border-line bg-white text-ink transition hover:bg-ink hover:text-cream"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <div
            ref={trackRef}
            className="-mx-6 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-6 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                data-step
                initial={reduce ? { opacity: 0 } : { opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-[85%] shrink-0 snap-start rounded-[24px] border border-line bg-white p-8 shadow-[0_2px_20px_rgba(11,7,38,0.04)] sm:w-[420px]"
              >
                <div className="grid h-[72px] w-[72px] place-items-center rounded-2xl bg-brand-soft text-2xl font-bold tracking-tight text-brand">
                  {s.n}
                </div>
                <h3 className="mt-5 text-xl font-semibold text-ink">{s.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Proceso;
