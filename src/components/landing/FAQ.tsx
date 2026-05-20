import { motion, useReducedMotion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MessageCircle } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/56990797847?text=Hola%20SomaOS%2C%20quiero%20conversar";

const faqs = [
  { q: "¿Necesito saber de tecnología?", a: "No. Nosotros configuramos todo. Tú solo aprendes a usarlo —se aprende en 20 minutos." },
  { q: "¿Por qué se paga una mensualidad?", a: "El pago inicial cubre la implementación completa: diseño, sitio web, integraciones y capacitación. La mensualidad de $12.990 cubre lo que mantiene tu sistema funcionando todos los días: hosting, dominio, WhatsApp API, respaldos, actualizaciones y soporte técnico. Son costos que cualquier negocio digital tiene —la diferencia es que nosotros los manejamos por ti." },
  { q: "¿Qué pasa si dejo de pagar la mensualidad?", a: "Te enviamos un respaldo completo de tu base de datos (clientes, reservas, historial). El sitio queda inactivo, pero guardado. Si más adelante quieres reactivarlo, lo hacemos por $29.000 y todos tus datos siguen ahí esperando." },
  { q: "¿Cuánto demora la implementación?", a: "7 días hábiles desde que recibimos los accesos y la información que necesitamos." },
  { q: "¿Hay permanencia mínima o contrato?", a: "No. Cancelas cuando quieras, sin multas ni letra chica. Solo te pedimos avisarnos con 7 días para procesar el cierre." },
  { q: "¿El precio de la mensualidad puede subir?", a: "Si subimos el precio, te avisamos con 60 días de anticipación. Si no estás de acuerdo, puedes cancelar sin costo. Nunca subimos precios sin avisar." },
  { q: "¿Qué incluye el soporte mensual?", a: "Hasta 3 consultas técnicas al mes por WhatsApp o email, con respuesta en 24-48 horas hábiles. Resolvemos problemas, actualizaciones e integraciones que dejen de funcionar. Para rediseños grandes o nuevas funcionalidades, las cotizamos aparte." },
  { q: "¿Atienden fuera de Chile?", a: "Por ahora trabajamos solo con profesionales en Chile (por integración con WebPay y SII). Estamos preparando expansión." },
];

export const FAQ = () => {
  const reduce = useReducedMotion();
  return (
    <section id="faq" className="relative bg-cream py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-6">
        <motion.h2
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center text-3xl font-bold leading-[1.1] text-ink sm:text-4xl"
        >
          Preguntas <span className="text-brand">comunes</span>
        </motion.h2>

        <Accordion type="single" collapsible className="mt-8 space-y-3">
          {faqs.map((f, i) => (
            <AccordionItem
              key={f.q}
              value={`item-${i}`}
              className="rounded-2xl border border-line bg-white px-5 data-[state=open]:shadow-[0_8px_30px_rgba(11,7,38,0.06)]"
            >
              <AccordionTrigger className="text-left text-base font-semibold text-ink hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-[15px] leading-relaxed text-ink-soft">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* CTA final */}
      <div id="cta" className="mx-auto mt-20 max-w-3xl px-6 text-center">
        <motion.h2
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl font-bold leading-[1.05] text-ink sm:text-5xl"
        >
          Deja de gestionar <span className="text-brand">manualmente.</span>
        </motion.h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ink-soft">
          Empieza a operar como un negocio real. Te respondemos por WhatsApp y armamos tu sistema esta misma semana.
        </p>
        <motion.a
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          href={WHATSAPP_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-10 inline-flex h-16 items-center gap-3 rounded-2xl bg-brand px-9 text-lg font-semibold text-white shadow-[0_10px_40px_rgba(73,87,166,0.4)] transition hover:bg-brand/90"
        >
          <MessageCircle className="h-5 w-5" /> Hablar por WhatsApp →
        </motion.a>
      </div>
    </section>
  );
};

export default FAQ;
