import { motion, useReducedMotion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MessageCircle } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/56990797847?text=Hola%20SomaOS%2C%20quiero%20conversar";

const faqs = [
  { q: "¿Necesito saber de tecnología?", a: "No. Nosotros configuramos todo. Tú solo aprendes a usarlo en una sesión 1-a-1 de 45 minutos que dejamos grabada para que la veas cuando quieras." },
  { q: "¿Hay mensualidad o costos ocultos?", a: "No. Pagas una sola vez $590.000 + IVA y el sistema es tuyo para siempre. Los únicos costos externos son el dominio web (~$12.000/año que pagas a Nic.cl) y las comisiones de WebPay (2.95% por transacción que cobra Transbank). Esos no van a nosotros, los pagas directo a esos servicios." },
  { q: "¿Cómo se paga?", a: "50% al iniciar (al confirmar el proyecto) y 50% contra entrega (cuando recibes el sistema funcionando). Aceptamos transferencia bancaria, WebPay y Mercado Pago. Los $590.000 + IVA se pagan en pesos chilenos." },
  { q: "¿Cuánto demora la implementación?", a: "7 días hábiles desde que recibimos los accesos y la información que necesitamos. Algunos casos toman 10 días si esperas integraciones de terceros (ej. activación de WhatsApp Business API)." },
  { q: "¿Qué pasa si quiero cambios después?", a: "Tienes 30 días de soporte post-entrega incluidos: ajustes de copy, precios, servicios o horarios sin costo. Cambios mayores (rediseño, nuevas funcionalidades) se cotizan aparte." },
  { q: "¿El sistema queda a mi nombre?", a: "Sí. El sitio queda alojado a tu nombre con tu dominio. La base de datos es tuya. Si en algún momento quieres migrarlo a otro proveedor, te entregamos todo en un respaldo. No estás amarrado a nosotros." },
  { q: "¿Atienden fuera de Chile?", a: "Por ahora trabajamos solo con profesionales en Chile, porque las integraciones con WebPay y boletas SII son específicas para Chile. Estamos preparando expansión a otros países." },
  { q: "¿Tienen garantía?", a: "Sí. 30 días después de la entrega. Si el sistema no funciona como prometemos, te devolvemos el 100% del pago. Sin formularios ni excusas." },
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
