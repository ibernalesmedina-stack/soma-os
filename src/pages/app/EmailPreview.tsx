import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const ACCENT = "#7C3AED";

function baseLayout(content: string, accentColor = "#7C3AED") {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Arial,sans-serif;}
  .wrap{max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);}
  .header{background:${accentColor};padding:28px 32px;}
  .header h1{margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:-.3px;}
  .header p{margin:4px 0 0;color:rgba(255,255,255,.75);font-size:13px;}
  .body{padding:28px 32px;}
  .card{background:#f9f9fb;border:1px solid #ececef;border-radius:8px;padding:18px 20px;margin:18px 0;}
  .row{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #ececef;font-size:14px;}
  .row:last-child{border-bottom:none;}
  .label{color:#6b7280;}
  .value{font-weight:600;color:#111827;}
  .badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;}
  .badge-p{background:#dcfce7;color:#166534;}
  .badge-o{background:#dbeafe;color:#1d4ed8;}
  .btn{display:inline-block;margin-top:20px;padding:12px 28px;background:${accentColor};color:#fff !important;border-radius:8px;font-weight:600;font-size:14px;text-decoration:none;}
  .footer{padding:18px 32px;border-top:1px solid #ececef;font-size:12px;color:#9ca3af;text-align:center;}
</style>
</head>
<body><div class="wrap">${content}</div></body>
</html>`;
}

function makeConfirmacion(data: { clientName: string; serviceName: string; date: string; modalidad: string; amount: string; businessName: string; phone: string }) {
  const bc = data.modalidad === "online" ? "badge-o" : "badge-p";
  return baseLayout(`
  <div class="header"><h1>¡Tu cita está confirmada!</h1><p>${data.businessName} te espera</p></div>
  <div class="body">
    <p style="font-size:15px;color:#374151;margin-top:0">Hola <strong>${data.clientName}</strong>, tu reserva ha sido confirmada.</p>
    <div class="card">
      <div class="row"><span class="label">Servicio</span><span class="value">${data.serviceName}</span></div>
      <div class="row"><span class="label">Fecha y hora</span><span class="value">${data.date}</span></div>
      <div class="row"><span class="label">Modalidad</span><span class="value"><span class="badge ${bc}">${data.modalidad === "online" ? "🖥 Online" : "📍 Presencial"}</span></span></div>
      <div class="row"><span class="label">Monto</span><span class="value">${data.amount}</span></div>
    </div>
    <p style="font-size:13px;color:#6b7280">¿Necesitas reagendar? Escríbenos al <strong>${data.phone}</strong></p>
  </div>
  <div class="footer">Enviado por ${data.businessName} · Para cancelar o reagendar contáctanos directamente</div>
  `);
}

function makeRecordatorio(data: { clientName: string; serviceName: string; date: string; modalidad: string; businessName: string; phone: string }) {
  const bc = data.modalidad === "online" ? "badge-o" : "badge-p";
  return baseLayout(`
  <div class="header" style="background:#0ea5e9;"><h1>Recordatorio de cita</h1><p>Tu sesión es mañana — ¡te esperamos!</p></div>
  <div class="body">
    <p style="font-size:15px;color:#374151;margin-top:0">Hola <strong>${data.clientName}</strong>, este es tu recordatorio para mañana.</p>
    <div class="card">
      <div class="row"><span class="label">Servicio</span><span class="value">${data.serviceName}</span></div>
      <div class="row"><span class="label">Fecha y hora</span><span class="value">${data.date}</span></div>
      <div class="row"><span class="label">Modalidad</span><span class="value"><span class="badge ${bc}">${data.modalidad === "online" ? "🖥 Online" : "📍 Presencial"}</span></span></div>
    </div>
    <p style="font-size:13px;color:#6b7280">¿Necesitas cancelar? Contáctanos al <strong>${data.phone}</strong> con anticipación.</p>
  </div>
  <div class="footer">Enviado por ${data.businessName}</div>
  `, "#0ea5e9");
}

function makeReview(data: { clientName: string; serviceName: string; businessName: string; phone: string }) {
  return baseLayout(`
  <div class="header" style="background:#f59e0b;"><h1>¡Gracias por tu visita!</h1><p>${data.businessName}</p></div>
  <div class="body">
    <p style="font-size:15px;color:#374151;margin-top:0">Hola <strong>${data.clientName}</strong>, fue un placer atenderte.</p>
    <p style="font-size:14px;color:#6b7280;line-height:1.6;">Han pasado 15 días desde tu última sesión de <strong style="color:#111827">${data.serviceName}</strong>. Tu opinión es muy importante para nosotros y para que otras personas puedan encontrarnos.</p>
    <p style="font-size:14px;color:#6b7280;line-height:1.6;">¿Te tomás 1 minuto para dejar una reseña en Google?</p>
    <div style="text-align:center;margin:24px 0;">
      <a href="#" class="btn">⭐ Dejar reseña en Google</a>
    </div>
    <p style="font-size:13px;color:#6b7280;text-align:center">¡Tu reseña hace una gran diferencia! 🙏</p>
    <p style="font-size:13px;color:#6b7280;text-align:center">¿Listo para tu próxima sesión? Escríbenos al <strong>${data.phone}</strong></p>
  </div>
  <div class="footer">Enviado por ${data.businessName} · Si no deseas recibir más emails, contáctanos</div>
  `, "#f59e0b");
}

const TABS = [
  { id: "confirmacion", label: "✅ Confirmación", color: ACCENT },
  { id: "recordatorio", label: "⏰ Recordatorio 24h", color: "#0ea5e9" },
  { id: "review",       label: "⭐ Review 15 días",  color: "#f59e0b" },
] as const;

type TabId = typeof TABS[number]["id"];

export default function EmailPreview() {
  const { user } = useAuth();
  const [active, setActive] = useState<TabId>("confirmacion");

  const businessName = user?.businessName || "Mi Negocio";
  const phone = user?.phone || "+56 9 1234 5678";

  const shared = {
    clientName: "María González",
    serviceName: "Sesión de seguimiento",
    date: "miércoles 28 de mayo de 2026, 10:00",
    modalidad: "presencial",
    amount: "$28.000",
    businessName,
    phone,
  };

  const html = {
    confirmacion: makeConfirmacion(shared),
    recordatorio: makeRecordatorio(shared),
    review:       makeReview(shared),
  }[active];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Vista previa de emails</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Así verán tus pacientes los emails automáticos. Los datos de ejemplo usan tu nombre de negocio actual.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium border transition-all",
              active === t.id
                ? "border-transparent text-white shadow-sm"
                : "bg-background hover:bg-muted text-foreground",
            )}
            style={active === t.id ? { background: t.color } : {}}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Info bar */}
      <div className="rounded-lg border bg-muted/30 px-4 py-3 mb-4 text-xs text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1">
        <span><strong className="text-foreground">De:</strong> {user?.email || "noreply@somaos.app"}</span>
        <span><strong className="text-foreground">Para:</strong> maria.gonzalez@gmail.com</span>
        <span><strong className="text-foreground">Asunto:</strong> {
          active === "confirmacion" ? `✅ Tu cita está confirmada — ${shared.serviceName}` :
          active === "recordatorio" ? `⏰ Recordatorio: tu cita es mañana — ${shared.serviceName}` :
          `⭐ ¿Cómo fue tu experiencia con ${businessName}?`
        }</span>
      </div>

      {/* Email preview */}
      <div className="rounded-xl border overflow-hidden shadow-sm">
        <iframe
          srcDoc={html}
          title="Email preview"
          className="w-full"
          style={{ height: 620, border: "none" }}
          sandbox="allow-same-origin"
        />
      </div>

      <p className="text-xs text-muted-foreground mt-3 text-center">
        Vista de escritorio · Los emails se envían automáticamente — no requieren acción manual
      </p>
    </div>
  );
}
