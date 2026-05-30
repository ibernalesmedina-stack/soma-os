import { motion, useReducedMotion } from "framer-motion";
import { CalendarDays, Users, MessageCircle, LineChart, CreditCard, FileText, Star, Globe, BookOpen } from "lucide-react";

const features = [
  { icon: Globe, title: "Sitio web profesional", desc: "Diseñado a tu marca, no un template. Tu negocio se ve serio desde el primer clic." },
  { icon: CalendarDays, title: "Agenda inteligente", desc: "Tus clientes reservan online 24/7 y se sincroniza automáticamente con Google Calendar." },
  { icon: CreditCard, title: "Cobros automáticos", desc: "WebPay y Mercado Pago integrados. Cobras al momento de la reserva, sin perseguir a nadie." },
  { icon: MessageCircle, title: "Recordatorios automáticos", desc: "WhatsApp y email antes de cada cita. Bajas ausencias y dejas de responder confirmaciones." },
  { icon: Star, title: "Reviews automáticos en Google", desc: "15 días después de la cita, pedimos review en tu perfil. Solo a clientes nuevos." },
  { icon: FileText, title: "Boletas SII automáticas", desc: "Emisión electrónica al confirmar pago. Cumples con tributario sin pensarlo." },
  { icon: Users, title: "Base de datos de clientes", desc: "Historial completo, notas, frecuencia. Para que sepas quién es quién y vuelvas a contactarlos." },
  { icon: LineChart, title: "Panel de control", desc: "Ingresos, sesiones, clientes y métricas en tiempo real. Sabes cómo va tu negocio." },
  { icon: BookOpen, title: "Capacitación incluida", desc: "Sesión 1-a-1 grabada para que aprendas en 20 minutos. Tu equipo también puede verla." },
];

export const QueEs = () => {
  const reduce = useReducedMotion();
  return (
    <section id="que-es" className="relative bg-cream py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-soft">Todo lo que incluye</p>
          <h2 className="mt-4 text-balance text-4xl font-bold leading-[1.1] text-ink sm:text-5xl lg:text-[48px]">
            Un sistema completo, <span className="text-brand">no una herramienta más.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-ink/80 sm:text-xl">
            No es un software con mensualidad ni una app que tienes que aprender. Es el sistema completo de tu negocio, configurado a tu medida y listo para usar.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4 }}
                className="group rounded-[20px] border border-line bg-white p-7 shadow-[0_2px_20px_rgba(11,7,38,0.04)] transition-shadow hover:shadow-[0_10px_40px_rgba(11,7,38,0.08)]"
              >
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-soft text-brand transition-colors group-hover:bg-ink group-hover:text-cream">
                  <Icon className="h-7 w-7" strokeWidth={1.6} />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-ink">{f.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default QueEs;
