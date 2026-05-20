import { useEffect, useState } from "react";
import { MessageCircle, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const WHATSAPP_URL = "https://wa.me/56990797847?text=Hola%20SomaOS%2C%20quiero%20saber%20m%C3%A1s";

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`sticky top-0 z-50 w-full border-b transition-colors ${
        scrolled ? "border-line bg-cream/85 backdrop-blur-xl" : "border-transparent bg-cream/60 backdrop-blur-md"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <a href="#top" className="group flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink text-cream text-sm font-bold transition group-hover:scale-105">S</span>
          <span className="text-lg font-bold tracking-tight text-ink">SomaOS</span>
        </a>
        <div className="hidden items-center gap-8 md:flex">
          <a href="#como-funciona" className="text-sm font-medium text-ink-soft transition hover:text-ink">Cómo funciona</a>
          <a href="#planes" className="text-sm font-medium text-ink-soft transition hover:text-ink">Planes</a>
          <a href="#faq" className="text-sm font-medium text-ink-soft transition hover:text-ink">FAQ</a>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <motion.a
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand/90"
          >
            <MessageCircle className="h-4 w-4" /> Hablar por WhatsApp
          </motion.a>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-xl border border-ink/15 bg-white/70 text-ink md:hidden"
          aria-label="Menú"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-line bg-cream/95 backdrop-blur-xl md:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-4">
              <a href="#como-funciona" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-ink hover:bg-brand-soft">Cómo funciona</a>
              <a href="#planes" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-ink hover:bg-brand-soft">Planes</a>
              <a href="#faq" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-ink hover:bg-brand-soft">FAQ</a>
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand text-sm font-semibold text-white">
                <MessageCircle className="h-4 w-4" /> Hablar por WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;