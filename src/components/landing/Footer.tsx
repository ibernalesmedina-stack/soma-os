import { MessageCircle, Instagram, Mail } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-ink text-[hsl(var(--brand-soft))]">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-cream text-ink text-sm font-bold">S</span>
              <span className="text-lg font-bold tracking-tight text-cream">SomaOS</span>
            </div>
            <p className="mt-3 text-sm text-cream/60">El sistema completo de tu negocio. Tuyo para siempre.</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://wa.me/56990797847"
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="grid h-10 w-10 place-items-center rounded-xl border border-cream/15 text-cream/80 transition hover:bg-cream/10 hover:text-cream"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="grid h-10 w-10 place-items-center rounded-xl border border-cream/15 text-cream/80 transition hover:bg-cream/10 hover:text-cream"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="mailto:hola@somaos.com"
              aria-label="Email"
              className="grid h-10 w-10 place-items-center rounded-xl border border-cream/15 text-cream/80 transition hover:bg-cream/10 hover:text-cream"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>
        <div className="mt-10 border-t border-cream/10 pt-6 text-xs text-cream/50">
          © {new Date().getFullYear()} SomaOS · Viña del Mar, Chile · <a href="#" className="hover:text-cream">Términos</a> · <a href="#" className="hover:text-cream">Privacidad</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
