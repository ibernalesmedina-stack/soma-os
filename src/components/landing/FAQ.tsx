import { motion, useReducedMotion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MessageCircle } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/56990797847?text=Hola%20SomaOS%2C%20quiero%20conversar";

const faqs = [
  { q: "¿Necesito saber de tecnología?", a: "No. Configuramos todo nosotros. Tú aprendes a usarlo en 20 minutos." },
  { q: "¿Hay mensualidad o costos ocultos?", a: "No. Pagas una vez y el sistema es tuyo. Sin suscripciones, sin sorpresas." },
  { q: "¿Cómo se paga?", a: "50% al iniciar y 50% contra entrega. Aceptamos transferencia, WebPay y Mercado Pago." },
  { q: "¿Cuánto demora la implementación?", a: "7 días hábiles desde que recibimos los accesos y la información." },
  { q: "¿Qué pasa si quiero cambios después?", a: "Tienes 30 días de soporte post-entrega para ajustes. Cambios mayores se cotizan aparte." },
  { q: "¿El sistema queda a mi nombre?", a: "Sí. Todo queda a tu nombre. Si quieres migrar a otro proveedor, te entregamos todo en respaldo." },
  { q: "¿Atienden fuera de Chile?", a: "Por ahora solo Chile, por integraciones con WebPay y SII. Estamos preparando expansión." },
  { q: "¿Tienen garantía?", a: "Sí. 30 días post-entrega. Si no funciona como prometemos, devolvemos el 100%." },
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
          Preguntas <span className="text-brand">frecuentes</span>
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
          Deja de gestionar a mano.<br/><span className="text-brand">Empieza esta semana.</span>
        </motion.h2>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-ink/80">
          Cuéntame por WhatsApp qué tipo de negocio tienes. Te respondo personalmente, sin formularios.
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
