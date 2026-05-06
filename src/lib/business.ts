import type { TipoNegocio } from "./types";
import { Apple, Sparkles, Stethoscope, Brain, type LucideIcon } from "lucide-react";

export interface BusinessConfig {
  label: string;
  clientLabel: string; // "Paciente" | "Cliente"
  clientLabelPlural: string;
  registrosLabel: string; // e.g. "Planes alimenticios"
  registrosLabelSingular: string;
  registroTipo: string; // key stored in registros.tipo
  icon: LucideIcon;
  // Campos del registro flexible
  registroFields: { key: string; label: string; type?: "text" | "number" | "textarea" | "date" }[];
  // Campos extra para la ficha del cliente
  fichaExtraFields?: { key: string; label: string; type?: "text" | "textarea" }[];
}

export const BUSINESS_CONFIG: Record<TipoNegocio, BusinessConfig> = {
  nutricionista: {
    label: "Nutricionista",
    clientLabel: "Paciente",
    clientLabelPlural: "Pacientes",
    registrosLabel: "Planes alimenticios",
    registrosLabelSingular: "Plan alimenticio",
    registroTipo: "plan_alimenticio",
    icon: Apple,
    registroFields: [
      { key: "peso", label: "Peso (kg)", type: "number" },
      { key: "objetivo", label: "Objetivo", type: "text" },
      { key: "calorias", label: "Calorías diarias", type: "number" },
      { key: "duracion", label: "Duración (semanas)", type: "number" },
      { key: "plan", label: "Plan detallado", type: "textarea" },
    ],
    fichaExtraFields: [
      { key: "pesoInicial", label: "Peso inicial (kg)" },
      { key: "altura", label: "Altura (cm)" },
    ],
  },
  cosmetologa: {
    label: "Cosmetóloga",
    clientLabel: "Cliente",
    clientLabelPlural: "Clientes",
    registrosLabel: "Tratamientos",
    registrosLabelSingular: "Tratamiento",
    registroTipo: "tratamiento",
    icon: Sparkles,
    registroFields: [
      { key: "tipoPiel", label: "Tipo de piel", type: "text" },
      { key: "tratamiento", label: "Tipo de tratamiento", type: "text" },
      { key: "productos", label: "Productos utilizados", type: "textarea" },
      { key: "recomendaciones", label: "Recomendaciones", type: "textarea" },
    ],
    fichaExtraFields: [
      { key: "tipoPielGeneral", label: "Tipo de piel general" },
      { key: "rutinaActual", label: "Rutina actual" },
    ],
  },
  odontologa: {
    label: "Odontóloga",
    clientLabel: "Paciente",
    clientLabelPlural: "Pacientes",
    registrosLabel: "Procedimientos",
    registrosLabelSingular: "Procedimiento",
    registroTipo: "procedimiento",
    icon: Stethoscope,
    registroFields: [
      { key: "pieza", label: "Pieza dental", type: "text" },
      { key: "procedimiento", label: "Procedimiento", type: "text" },
      { key: "diagnostico", label: "Diagnóstico", type: "textarea" },
      { key: "tratamiento", label: "Tratamiento aplicado", type: "textarea" },
      { key: "proximoControl", label: "Próximo control", type: "date" },
    ],
    fichaExtraFields: [
      { key: "historialDental", label: "Historial dental" },
    ],
  },
  psicologa: {
    label: "Psicóloga",
    clientLabel: "Paciente",
    clientLabelPlural: "Pacientes",
    registrosLabel: "Sesiones",
    registrosLabelSingular: "Sesión",
    registroTipo: "sesion",
    icon: Brain,
    registroFields: [
      { key: "tema", label: "Tema central", type: "text" },
      { key: "estadoEmocional", label: "Estado emocional", type: "text" },
      { key: "intervencion", label: "Intervención", type: "textarea" },
      { key: "notasPrivadas", label: "Notas privadas", type: "textarea" },
      { key: "tareas", label: "Tareas / acuerdos", type: "textarea" },
    ],
  },
};

export const DEFAULT_TIPO: TipoNegocio = "psicologa";
