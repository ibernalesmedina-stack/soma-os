import { motion, useReducedMotion } from "framer-motion";
import { CalendarDays, Users, MessageCircle, LineChart, Settings, FileText } from "lucide-react";

const features = [
  { icon: CalendarDays, title: "Agenda inteligente", desc: "Visualiza reservas, bloquea horarios y administra disponibilidad en tiempo real." },
  { icon: Users, title: "Gestión de clientes", desc: "Accede a historial, notas, pagos y seguimiento desde un solo panel." },
  { icon: MessageCircle, title: "Automatización de mensajes", desc: "WhatsApp y emails automáticos antes y después de cada cita." },
  { icon: LineChart, title: "Control financiero", desc: "Visualiza ingresos, pagos pendientes y rendimiento semanal o mensual." },
  { icon: Settings, title: "Administración de servicios", desc: "Agrega, edita o elimina servicios y actualiza automáticamente tu sitio." },
  { icon: FileText, title: "Integración tributaria", desc: "Conecta pagos y emisión automática de boletas mediante SII." },
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
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-soft">Lo que puedes hacer con Soma</p>
          <h2 className="mt-4 text-balance text-4xl font-bold leading-[1.1] text-ink sm:text-5xl lg:text-[48px]">
            Un sistema que trabaja <span className="text-brand">en segundo plano.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-ink/80 sm:text-xl">
            Soma conecta todo lo que hoy haces manualmente en un solo flujo automatizado. Tus clientes reservan, pagan y reciben recordatorios mientras tú recuperas tu tiempo. Todo desde un solo lugar.
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
