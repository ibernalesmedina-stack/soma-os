import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { formatCLP } from "@/lib/format";
import { Clock } from "lucide-react";

interface Perfil {
  name: string;
  business_name: string;
  tipo_negocio: string;
  whatsapp_number: string;
  domain: string;
}

interface Servicio {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_min: number;
  active: boolean;
}

export default function Sitio() {
  const { userId } = useParams<{ userId: string }>();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const loadData = async () => {
    if (!userId) return;
    const [{ data: p }, { data: s }] = await Promise.all([
      supabase.from("perfiles").select("name, business_name, tipo_negocio, whatsapp_number, domain").eq("id", userId).single(),
      supabase.from("servicios").select("id, name, description, price, duration_min, active").eq("user_id", userId).eq("active", true).order("created_at"),
    ]);
    if (!p) { setNotFound(true); setLoading(false); return; }
    setPerfil(p as Perfil);
    setServicios((s ?? []) as Servicio[]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel(`sitio-servicios-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "servicios", filter: `user_id=eq.${userId}` }, loadData)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (notFound || !perfil) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background text-center p-6">
        <div className="text-4xl">🔍</div>
        <h1 className="text-xl font-semibold">Negocio no encontrado</h1>
        <p className="text-sm text-muted-foreground">El link que seguiste no corresponde a ningún negocio activo.</p>
      </div>
    );
  }

  const tipoLabel: Record<string, string> = {
    nutricionista: "Nutricionista",
    cosmetologa: "Cosmetóloga",
    odontologa: "Odontóloga",
    psicologa: "Psicóloga",
  };

  const whatsappUrl = perfil.whatsapp_number
    ? `https://wa.me/${perfil.whatsapp_number.replace(/\D/g, "")}?text=${encodeURIComponent("Hola! Me gustaría agendar una consulta.")}`
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header
        className="relative overflow-hidden py-16 px-6 text-white text-center"
        style={{ background: "linear-gradient(135deg, #5B3EFF 0%, #7B61FF 60%, #9F8CFF 100%)" }}
      >
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative z-10 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full bg-white/15 border border-white/20 mb-4">
            {tipoLabel[perfil.tipo_negocio] ?? perfil.tipo_negocio}
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">{perfil.business_name}</h1>
          <p className="mt-2 text-white/70 text-sm">{perfil.name}</p>
          {perfil.domain && (
            <p className="mt-1 text-white/50 text-xs mono">{perfil.domain}</p>
          )}
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-full bg-white text-[#5B3EFF] text-sm font-semibold hover:bg-white/90 transition-colors"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Agendar por WhatsApp
            </a>
          )}
        </div>
      </header>

      {/* Servicios */}
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-xl font-semibold tracking-tight mb-2">Servicios</h2>
        <p className="text-sm text-muted-foreground mb-8">
          {servicios.length === 0
            ? "Pronto habrá servicios disponibles."
            : `${servicios.length} servicio${servicios.length !== 1 ? "s" : ""} disponible${servicios.length !== 1 ? "s" : ""}`}
        </p>

        {servicios.length === 0 ? (
          <div className="rounded-xl border border-dashed p-16 text-center text-muted-foreground text-sm">
            Aún no hay servicios publicados.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {servicios.map((s) => (
              <div key={s.id} className="rounded-xl border bg-card p-5 flex flex-col gap-3 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold tracking-tight">{s.name}</h3>
                  <span className="text-xs inline-flex items-center gap-1 text-muted-foreground shrink-0">
                    <Clock className="h-3 w-3" /> {s.duration_min} min
                  </span>
                </div>
                {s.description && (
                  <p className="text-sm text-muted-foreground flex-1">{s.description}</p>
                )}
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-lg font-semibold mono tracking-tight">{formatCLP(s.price)}</span>
                  {whatsappUrl && (
                    <a
                      href={`${whatsappUrl.split("?text=")[0]}?text=${encodeURIComponent(`Hola! Me gustaría agendar: ${s.name}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-3 py-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
                    >
                      Agendar
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        Powered by <span className="font-semibold text-foreground">SomaOS</span>
      </footer>
    </div>
  );
}
