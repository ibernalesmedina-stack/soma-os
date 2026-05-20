import { CheckCircle2, Clock, MapPin, Star, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Reveal from "./Reveal";
import wellnessRoom from "@/assets/wellness-room.jpg";

const services = [
  { name: "Masaje Relajante", duration: "60 min", price: "$45.000", tag: "Más reservado" },
  { name: "Facial Rejuvenecedor", duration: "45 min", price: "$38.000" },
  { name: "Masaje Descontracturante", duration: "75 min", price: "$55.000" },
];

const slots = ["10:00", "11:30", "14:00", "15:30", "17:00", "18:30"];

/**
 * Visual mockup of the landing site we deliver to the client.
 * Wellness brand: Aurora Wellness Studio.
 */
export const MockupClienta = () => {
  return (
    <section id="mockup" className="relative overflow-hidden bg-brand-soft/60 py-28 sm:py-32">
      <div className="pointer-events-none absolute -left-32 top-1/3 h-[500px] w-[500px] rounded-full bg-brand/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-[400px] w-[400px] rounded-full bg-white/50 blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-6">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-soft">No es un template</p>
          <h2 className="mt-4 text-balance text-4xl font-bold leading-[1.05] text-ink sm:text-5xl lg:text-[56px]">
            Configuramos todo <span className="text-brand">para tu negocio.</span>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-ink-soft">
            Tu marca, tus servicios, tus horarios, tus flujos. Implementamos el sistema completo y lo dejamos funcionando para ti.
          </p>
        </Reveal>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto mt-14 max-w-6xl"
        >
          {/* Glow */}
          <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-r from-brand/30 via-brand-glow/30 to-brand-2/30 blur-3xl" aria-hidden />

          <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-product">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 border-b border-ink/10 bg-cream/70 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
              <div className="ml-3 flex-1">
                <div className="mx-auto w-fit rounded-md border border-ink/10 bg-white px-3 py-1 text-[11px] font-medium text-ink-soft">
                  aurorawellness.cl
                </div>
              </div>
            </div>

            {/* Site nav */}
            <div className="flex items-center justify-between border-b border-ink/10 bg-white px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-md gradient-brand text-white text-xs font-bold">A</span>
                <span className="text-sm font-bold text-ink">Aurora Wellness Studio</span>
              </div>
              <div className="hidden items-center gap-6 text-xs text-ink-soft md:flex">
                <span>Servicios</span>
                <span>Sobre mí</span>
                <span>Testimonios</span>
                <span>Contacto</span>
              </div>
              <span className="rounded-full gradient-brand px-3 py-1.5 text-xs font-semibold text-white shadow-glow">Reservar</span>
            </div>

            {/* Hero with photo */}
            <div className="grid gap-0 md:grid-cols-2">
              <div className="relative order-2 md:order-1 px-6 py-10 md:px-10 md:py-14">
                <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-brand-soft/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-brand">
                  <Sparkles className="h-3 w-3" />
                  Promo de bienvenida, 20% off
                </span>
                <h3 className="mt-4 text-3xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-4xl">
                  Tu pausa <span className="hero-gradient-text">empieza aquí.</span>
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                  Masajes y faciales en un espacio diseñado para que respires. Reserva online en menos de un minuto, recibe confirmación al instante.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full gradient-brand px-4 py-2 text-xs font-bold text-white shadow-glow">Reservar mi sesión</span>
                  <span className="rounded-full border border-ink/15 bg-white px-4 py-2 text-xs font-bold text-ink">Ver servicios</span>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-4 text-[11px] text-ink-soft">
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-brand text-brand" />
                    <span className="font-semibold text-ink">4.9</span> · 217 reseñas
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-brand" /> Providencia, Santiago
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-brand" /> Pago seguro
                  </span>
                </div>
              </div>
              <div className="relative order-1 md:order-2 min-h-[280px] overflow-hidden md:min-h-full">
                <img
                  src={wellnessRoom}
                  alt="Sala de masaje de Aurora Wellness Studio con luz natural"
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-brand/30 via-transparent to-transparent" />
                {/* Floating service card */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="glass anim-float absolute bottom-4 left-4 right-4 rounded-xl p-3 text-ink shadow-product md:bottom-6 md:left-6 md:right-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg gradient-brand text-white">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[11px] text-ink-soft">Próxima disponibilidad</div>
                      <div className="text-sm font-bold">Hoy, 17:00 · Masaje Relajante</div>
                    </div>
                    <span className="rounded-full bg-ink px-2.5 py-1 text-[10px] font-bold text-cream">2 cupos</span>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Services + booking */}
            <div className="grid gap-0 border-t border-ink/10 md:grid-cols-2">
              {/* Services list */}
              <div className="border-b border-ink/10 px-6 py-8 md:border-b-0 md:border-r md:px-10">
                <div className="text-xs font-semibold uppercase tracking-wide text-brand">Servicios destacados</div>
                <ul className="mt-5 space-y-3">
                  {services.map((s) => (
                    <li
                      key={s.name}
                      className="group flex items-center justify-between rounded-xl border border-ink/10 bg-white p-4 transition hover:border-brand/40 hover:shadow-soft"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-ink">{s.name}</span>
                          {s.tag && (
                            <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-brand">
                              {s.tag}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-[11px] text-ink-soft">{s.duration}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-extrabold text-ink">{s.price}</div>
                        <div className="text-[10px] text-brand">Reservar →</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Booking widget */}
              <div className="px-6 py-8 md:px-10">
                <div className="text-xs font-semibold uppercase tracking-wide text-brand">Agenda tu sesión</div>
                <div className="mt-5 rounded-xl border border-ink/10 bg-cream/40 p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-ink">Mayo 2026</span>
                    <div className="flex gap-1">
                      <span className="grid h-6 w-6 place-items-center rounded border border-ink/10 bg-white text-ink-soft">‹</span>
                      <span className="grid h-6 w-6 place-items-center rounded border border-ink/10 bg-white text-ink-soft">›</span>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[9px] uppercase text-ink-soft">
                    {["L","M","M","J","V","S","D"].map((d, i) => <div key={i}>{d}</div>)}
                  </div>
                  <div className="mt-1 grid grid-cols-7 gap-1">
                    {Array.from({length: 28}).map((_, i) => {
                      const isAvailable = [2,5,8,11,12,15,18,19,22,25].includes(i);
                      const isSelected = i === 12;
                      return (
                        <div
                          key={i}
                          className={`aspect-square rounded text-[10px] grid place-items-center font-medium transition ${
                            isSelected
                              ? "gradient-brand text-white shadow-glow"
                              : isAvailable
                              ? "bg-white text-ink border border-ink/10 hover:border-brand"
                              : "text-ink-soft/40"
                          }`}
                        >
                          {i + 1}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-[11px] font-semibold text-ink-soft">Horarios disponibles, martes 13</div>
                  <div className="mt-2 grid grid-cols-3 gap-1.5">
                    {slots.map((t, i) => (
                      <span
                        key={t}
                        className={`rounded-md border py-1.5 text-center text-[11px] font-semibold ${
                          i === 4
                            ? "border-brand bg-brand-soft text-brand"
                            : "border-ink/10 bg-white text-ink"
                        }`}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <button className="mt-5 w-full rounded-full gradient-brand py-3 text-xs font-bold text-white shadow-glow transition hover:opacity-95">
                  Confirmar reserva, 17:00
                </button>
                <div className="mt-2 text-center text-[10px] text-ink-soft">
                  Recibirás confirmación por email y recordatorio por WhatsApp.
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MockupClienta;