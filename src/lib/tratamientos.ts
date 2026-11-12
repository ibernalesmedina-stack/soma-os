// Datos de "tratamiento" para el sitio web, guardados dentro de servicios.description
// (sin cambiar la base de datos). Formato:
//   <descripción corta visible>
//
//   <!--soma:{"cat":"Estética facial","precios":[...],...}-->
// Los servicios sin este bloque (ej. "Evaluación online") no se muestran como tratamiento en el sitio.

export type PrecioTratamiento = { label: string; price: string; desde?: boolean; antes?: string };

export interface MetaTratamiento {
  cat: string;            // categoría del sitio (Estética facial, Odontología general, Implantología)
  slug?: string;          // vínculo con la página propia del tratamiento (/tratamientos/<slug>)
  sub?: string;           // frase corta bajo el nombre en la tarjeta
  precios: PrecioTratamiento[];
  nota?: string;
  orden?: number;
}

const MARCA = "<!--soma:";
const CIERRE = "-->";

export function leerTratamiento(description: string | null | undefined): { texto: string; meta: MetaTratamiento | null } {
  const d = description ?? "";
  const i = d.indexOf(MARCA);
  if (i < 0) return { texto: d.trim(), meta: null };
  const j = d.indexOf(CIERRE, i);
  const texto = d.slice(0, i).trim();
  try {
    const meta = JSON.parse(d.slice(i + MARCA.length, j < 0 ? undefined : j)) as MetaTratamiento;
    if (!meta || typeof meta.cat !== "string" || !Array.isArray(meta.precios)) return { texto, meta: null };
    return { texto, meta };
  } catch {
    return { texto, meta: null };
  }
}

export function escribirTratamiento(texto: string, meta: MetaTratamiento): string {
  // "-->" dentro del JSON cerraría el comentario antes de tiempo
  const json = JSON.stringify(meta).replace(/-->/g, "--\\u003e");
  return `${texto.trim()}\n\n${MARCA}${json}${CIERRE}`;
}

/** "$90.000" / "90000" / "Desde $90.000" -> 90000 (0 si no hay número) */
export function precioANumero(p: string): number {
  const n = Number(String(p).replace(/[^\d]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/** 90000 -> "$90.000" */
export function numeroAPrecio(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-CL");
}

/** Resumen para la tarjeta: "Desde $90.000", "$500.000" o "Consultar" */
export function resumenPrecios(precios: PrecioTratamiento[]): string {
  if (!precios.length) return "Consultar";
  if (precios.length === 1) return (precios[0].desde ? "Desde " : "") + precios[0].price;
  const min = Math.min(...precios.map((p) => precioANumero(p.price)).filter((n) => n > 0));
  return Number.isFinite(min) ? `Desde ${numeroAPrecio(min)}` : "Consultar";
}

export const CATEGORIAS_SITIO = ["Estética facial", "Odontología general", "Implantología"];
