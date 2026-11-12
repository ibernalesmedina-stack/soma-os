// Tratamientos "en vivo": se leen de los servicios que la doctora edita en el panel de SomaOS.
// Si aún no hay tratamientos configurados (o falla la consulta), el sitio usa los datos fijos de datos.ts.
import { useEffect, useState } from "react";
import { CATEGORIAS, TRATAMIENTOS, type Categoria, type Tratamiento } from "./datos";
import { leerTratamiento, resumenPrecios } from "@/lib/tratamientos";

export type DatosTratamientos = { tratamientos: Record<string, Tratamiento>; categorias: Categoria[]; vivos: boolean };

const ESTATICOS: DatosTratamientos = { tratamientos: TRATAMIENTOS, categorias: CATEGORIAS, vivos: false };

type ServicioApi = { id: string; name: string; description: string | null; active: boolean };

const slugify = (s: string) =>
  s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function construir(servicios: ServicioApi[]): DatosTratamientos | null {
  const lista = servicios
    .filter((s) => s.active !== false)
    .map((s) => ({ s, ...leerTratamiento(s.description) }))
    .filter((x) => x.meta && x.meta.cat)
    .sort((a, b) => (a.meta!.orden ?? 999) - (b.meta!.orden ?? 999));
  if (!lista.length) return null;

  const tratamientos: Record<string, Tratamiento> = {};
  const porCat: Record<string, string[]> = {};
  for (const { s, texto, meta } of lista) {
    const m = meta!;
    const slug = m.slug && TRATAMIENTOS[m.slug] ? m.slug : `t-${slugify(s.name) || s.id.slice(0, 8)}`;
    const base = TRATAMIENTOS[slug];
    tratamientos[slug] = {
      ...(base ?? {
        slug, seoTitle: s.name, seoDesc: texto, boton: "Agendar cita", notaValor: [], lead: texto,
        contenido: "", relacionados: [], enPortada: true,
      }),
      slug,
      name: s.name,
      sub: m.sub ?? base?.sub ?? "",
      desc: texto || base?.desc || "",
      cat: m.cat,
      precios: m.precios,
      nota: m.nota ?? "",
      resumen: resumenPrecios(m.precios),
      // Los textos de "Valor" de la página siguen la nota del panel
      notaValor: m.nota ? [m.nota] : base?.notaValor ?? [],
    } as Tratamiento;
    (porCat[m.cat] ??= []).push(slug);
  }
  const categorias: Categoria[] = CATEGORIAS
    .map((c) => ({ ...c, slugs: porCat[c.title] ?? [] }))
    .filter((c) => c.slugs.length > 0);
  return { tratamientos, categorias, vivos: true };
}

let cache: Promise<DatosTratamientos> | null = null;

function cargar(): Promise<DatosTratamientos> {
  if (!cache) {
    cache = fetch("/api/booking/slots-paola?action=services")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => construir(Array.isArray(d?.services) ? d.services : []) ?? ESTATICOS)
      .catch(() => ESTATICOS);
  }
  return cache;
}

/** Datos de tratamientos para el sitio. Devuelve los fijos mientras carga. */
export function useTratamientos(): DatosTratamientos {
  const [datos, setDatos] = useState<DatosTratamientos>(ESTATICOS);
  useEffect(() => {
    let vivo = true;
    cargar().then((d) => { if (vivo) setDatos(d); });
    return () => { vivo = false; };
  }, []);
  return datos;
}
