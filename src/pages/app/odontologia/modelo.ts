// Modelo de la ficha odontológica (se guarda en fichas_clientes.dental, jsonb).
// Compatible con el formato antiguo: { "16": "caries" | "tratado" | "sano" }.

export type EstadoPieza =
  | "sano" | "caries" | "obturacion" | "corona" | "endodoncia"
  | "implante" | "ausente" | "extraccion" | "protesis" | "sellante";

export type Cara = "V" | "L" | "M" | "D" | "O"; // vestibular, lingual/palatino, mesial, distal, oclusal/incisal
export type EstadoCara = "caries" | "obturacion";

export interface Pieza {
  estado?: EstadoPieza;
  caras?: Partial<Record<Cara, EstadoCara>>;
  nota?: string;
}

export type EstadoPlan = "pendiente" | "en_curso" | "realizado";
export interface ItemPlan {
  id: string;
  pieza?: string;
  procedimiento: string;
  valor: number;
  estado: EstadoPlan;
}

export interface DentalV2 {
  v: 2;
  denticion: "permanente" | "temporal";
  piezas: Record<string, Pieza>;
  anamnesis: Record<string, boolean>;
  anamnesisActualizada?: string; // ISO
  plan: ItemPlan[];
}

export function normalizarDental(raw: unknown): DentalV2 {
  const base: DentalV2 = { v: 2, denticion: "permanente", piezas: {}, anamnesis: {}, plan: [] };
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Record<string, unknown>;
  if (r.v === 2) {
    return {
      ...base,
      ...(r as Partial<DentalV2>),
      piezas: (r.piezas as DentalV2["piezas"]) ?? {},
      anamnesis: (r.anamnesis as DentalV2["anamnesis"]) ?? {},
      plan: (r.plan as DentalV2["plan"]) ?? [],
    } as DentalV2;
  }
  // formato antiguo: pieza -> "sano" | "caries" | "tratado"
  for (const [k, v] of Object.entries(r)) {
    if (v === "caries") base.piezas[k] = { estado: "caries" };
    else if (v === "tratado") base.piezas[k] = { estado: "obturacion" };
  }
  return base;
}

// Numeración FDI. Orden visual: derecha del paciente a la izquierda de la pantalla.
export const ARCADAS = {
  permanente: {
    superior: [[18, 17, 16, 15, 14, 13, 12, 11], [21, 22, 23, 24, 25, 26, 27, 28]],
    inferior: [[48, 47, 46, 45, 44, 43, 42, 41], [31, 32, 33, 34, 35, 36, 37, 38]],
  },
  temporal: {
    superior: [[55, 54, 53, 52, 51], [61, 62, 63, 64, 65]],
    inferior: [[85, 84, 83, 82, 81], [71, 72, 73, 74, 75]],
  },
} as const;

export const ESTADOS_PIEZA: { id: EstadoPieza; label: string; color: string }[] = [
  { id: "corona", label: "Corona", color: "#2563eb" },
  { id: "endodoncia", label: "Endodoncia", color: "#9333ea" },
  { id: "implante", label: "Implante", color: "#0d9488" },
  { id: "protesis", label: "Prótesis", color: "#0891b2" },
  { id: "sellante", label: "Sellante", color: "#16a34a" },
  { id: "extraccion", label: "Extracción indicada", color: "#dc2626" },
  { id: "ausente", label: "Ausente", color: "#64748b" },
];

export const ESTADOS_CARA: { id: EstadoCara; label: string; color: string }[] = [
  { id: "caries", label: "Caries", color: "#dc2626" },
  { id: "obturacion", label: "Obturación", color: "#2563eb" },
];

export const CARAS: { id: Cara; label: string }[] = [
  { id: "V", label: "Vestibular" },
  { id: "L", label: "Lingual / palatino" },
  { id: "M", label: "Mesial" },
  { id: "D", label: "Distal" },
  { id: "O", label: "Oclusal / incisal" },
];

// Anamnesis: condiciones con impacto en la atención odontológica / estética
export const CONDICIONES: { id: string; label: string; alerta?: boolean }[] = [
  { id: "diabetes", label: "Diabetes", alerta: true },
  { id: "hipertension", label: "Hipertensión arterial", alerta: true },
  { id: "cardiopatia", label: "Cardiopatía / marcapasos", alerta: true },
  { id: "anticoagulantes", label: "Anticoagulantes / trastorno de coagulación", alerta: true },
  { id: "bifosfonatos", label: "Bifosfonatos / antirresortivos (osteoporosis, cáncer)", alerta: true },
  { id: "embarazo", label: "Embarazo", alerta: true },
  { id: "lactancia", label: "Lactancia", alerta: true },
  { id: "asma", label: "Asma / enfermedad respiratoria" },
  { id: "epilepsia", label: "Epilepsia", alerta: true },
  { id: "inmunosupresion", label: "Inmunosupresión / enfermedad autoinmune", alerta: true },
  { id: "infecciosa", label: "Hepatitis / VIH / otra enfermedad infecciosa", alerta: true },
  { id: "queloides", label: "Tendencia a queloides", alerta: true },
  { id: "tabaquismo", label: "Tabaquismo" },
  { id: "bruxismo", label: "Bruxismo" },
  { id: "radioterapia", label: "Radioterapia de cabeza y cuello", alerta: true },
];

export const PROCEDIMIENTOS_SUGERIDOS = [
  "Examen y diagnóstico", "Limpieza / destartraje", "Blanqueamiento", "Restauración de resina",
  "Endodoncia", "Extracción simple", "Extracción quirúrgica", "Corona", "Prótesis removible",
  "Implante", "Corona sobre implante", "Sobredentadura sobre implantes", "Prótesis total fija sobre implantes",
  "Injerto óseo", "Radiografía", "Control",
];

export const TRATAMIENTOS_ESTETICOS = [
  "Toxina botulínica", "Ácido hialurónico", "Profhilo®", "Sculptra®", "Mesoterapia",
  "Polinucleótidos", "BCN Oculare", "Mesoplastia de papada", "Otro",
];

export const ZONAS_FACIALES = [
  "Frente", "Entrecejo", "Patas de gallo", "Ojeras", "Nariz", "Pómulos", "Surco nasogeniano",
  "Labios", "Comisuras", "Mentón", "Mandíbula", "Masetero", "Papada", "Cuello",
];

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
