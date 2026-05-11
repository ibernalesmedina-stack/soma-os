/**
 * notifications.ts — helpers para email (Resend) y WhatsApp (wa.me)
 */

import type { Reserva } from "./types";

interface NotifContext {
  userId: string;
  businessName?: string;
  phone?: string;         // teléfono del profesional (para el cliente)
  clientEmail?: string;   // email del cliente (para enviarle notificaciones)
}

// ── Email ──────────────────────────────────────────────────────────

async function callEmailAPI(body: object): Promise<boolean> {
  try {
    const res = await fetch("/api/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Envía email de confirmación al cliente cuando se crea una reserva */
export async function sendConfirmationEmail(
  reserva: Pick<Reserva, "clientName" | "serviceName" | "date" | "tipoAtencion" | "amount">,
  clientEmail: string,
  ctx: NotifContext,
): Promise<boolean> {
  if (!clientEmail) return false;
  return callEmailAPI({
    userId: ctx.userId,
    to: clientEmail,
    template: "confirmacion",
    businessName: ctx.businessName,
    reserva: {
      clientName:   reserva.clientName,
      serviceName:  reserva.serviceName,
      date:         reserva.date,
      tipoAtencion: reserva.tipoAtencion,
      amount:       reserva.amount,
      phone:        ctx.phone,
    },
  });
}

/** Envía recordatorio 24h antes al cliente */
export async function sendReminderEmail(
  reserva: Pick<Reserva, "clientName" | "serviceName" | "date" | "tipoAtencion" | "amount">,
  clientEmail: string,
  ctx: NotifContext,
): Promise<boolean> {
  if (!clientEmail) return false;
  return callEmailAPI({
    userId: ctx.userId,
    to: clientEmail,
    template: "recordatorio",
    businessName: ctx.businessName,
    reserva: {
      clientName:   reserva.clientName,
      serviceName:  reserva.serviceName,
      date:         reserva.date,
      tipoAtencion: reserva.tipoAtencion,
      amount:       reserva.amount,
      phone:        ctx.phone,
    },
  });
}

/** Envía email de prueba al profesional (Integraciones → Probar) */
export async function sendTestEmail(
  userId: string,
  toEmail: string,
  businessName: string,
): Promise<boolean> {
  return callEmailAPI({ userId, to: toEmail, template: "prueba", businessName });
}

// ── WhatsApp ───────────────────────────────────────────────────────

function formatDateES(iso: string) {
  return new Date(iso).toLocaleString("es-CL", {
    weekday: "long", day: "numeric", month: "long",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatCLP(n: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);
}

/**
 * Genera link wa.me con mensaje de confirmación pre-armado.
 * `whatsappNumber` es el número del cliente (sin +, ej: 56912345678)
 */
export function whatsappConfirmacionURL(
  reserva: Pick<Reserva, "clientName" | "serviceName" | "date" | "tipoAtencion" | "amount">,
  whatsappNumber: string,
  businessName = "Tu profesional",
): string {
  const msg = [
    `Hola ${reserva.clientName} 👋`,
    ``,
    `Tu cita en *${businessName}* ha sido confirmada:`,
    `📅 *${formatDateES(reserva.date)}*`,
    `💆 *${reserva.serviceName}*`,
    `${reserva.tipoAtencion === "online" ? "🖥️ Online" : "📍 Presencial"}`,
    `💰 ${formatCLP(reserva.amount)}`,
    ``,
    `¡Te esperamos! 🙌`,
  ].join("\n");

  const number = whatsappNumber.replace(/\D/g, "");
  return `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
}

/**
 * Genera link wa.me con recordatorio 24h pre-armado.
 */
export function whatsappRecordatorioURL(
  reserva: Pick<Reserva, "clientName" | "serviceName" | "date" | "tipoAtencion">,
  whatsappNumber: string,
  businessName = "Tu profesional",
): string {
  const msg = [
    `Hola ${reserva.clientName} 👋`,
    ``,
    `Te recordamos tu cita de mañana en *${businessName}*:`,
    `📅 *${formatDateES(reserva.date)}*`,
    `💆 *${reserva.serviceName}* — ${reserva.tipoAtencion === "online" ? "Online 🖥️" : "Presencial 📍"}`,
    ``,
    `Si necesitas reagendar, avísanos con anticipación. ¡Nos vemos pronto! 😊`,
  ].join("\n");

  const number = whatsappNumber.replace(/\D/g, "");
  return `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
}

/**
 * Detecta reservas que son en ~24h y que aún no tienen recordatorio enviado.
 * Devuelve la lista para que el caller decida qué hacer.
 */
export function reservasParaRecordar(reservas: Reserva[]): Reserva[] {
  const now = Date.now();
  const in24h  = now + 24 * 60 * 60 * 1000;
  const in25h  = now + 25 * 60 * 60 * 1000;
  return reservas.filter(r => {
    const ts = new Date(r.date).getTime();
    return r.status === "confirmada" && ts >= in24h && ts <= in25h;
  });
}
