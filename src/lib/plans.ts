import type { Plan } from "./types";

// All features available to every user (no plan-gated restrictions).
export const PLAN_FEATURES: Record<Plan, { reservas: boolean; pagos: boolean; servicios: boolean; automations: boolean; analytics: boolean }> = {
  basic: { reservas: true, pagos: true, servicios: true, automations: true, analytics: true },
  pro: { reservas: true, pagos: true, servicios: true, automations: true, analytics: true },
  premium: { reservas: true, pagos: true, servicios: true, automations: true, analytics: true },
  clinic: { reservas: true, pagos: true, servicios: true, automations: true, analytics: true },
};

export const PLAN_LABEL: Record<Plan, string> = {
  basic: "Basic",
  pro: "Pro",
  premium: "Premium",
  clinic: "Clinic",
};
