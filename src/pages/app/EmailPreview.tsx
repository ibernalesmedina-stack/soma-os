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
  const waPhone = data.phone.replace(/\D/g, "");
  const waMsg = encodeURIComponent(`Hola ${data.businessName}, te escribo porque recibí tu email de seguimiento. Tengo una consulta sobre mi sesión de ${data.serviceName}.`);
  const waUrl = waPhone ? `https://wa.me/${waPhone}?text=${waMsg}` : null;
  return baseLayout(`
  <div class="header" style="background:#f59e0b;"><h1>¿Cómo te has sentido?</h1><p>${data.businessName} — seguimiento de tu sesión</p></div>
  <div class="body">
    <p style="font-size:15px;color:#374151;margin-top:0">Hola <strong>${data.clientName}</strong> 👋</p>
    <p style="font-size:14px;color:#6b7280;line-height:1.6;">Han pasado 15 días desde tu sesión de <strong style="color:#111827">${data.serviceName}</strong> y quería saber cómo te has sentido. ¿Has notado cambios? ¿Tienes alguna duda o algo que quieras consultar?</p>
    ${waUrl ? `
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;margin:20px 0;text-align:center;">
      <p style="margin:0 0 12px;font-size:14px;color:#166534;font-weight:600;">¿Tienes alguna duda? Escríbeme directamente</p>
      <a href="${waUrl}" style="display:inline-flex;align-items:center;gap:8px;background:#25d366;color:#fff;padding:10px 22px;border-radius:8px;font-weight:600;font-size:14px;text-decoration:none;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
        Escribir por WhatsApp
      </a>
    </div>` : ""}
    <div style="border-top:1px solid #ececef;margin:24px 0;padding-top:20px;">
      <p style="font-size:14px;color:#374151;font-weight:600;margin:0 0 8px;">¿Te gustó tu experiencia?</p>
      <p style="font-size:14px;color:#6b7280;line-height:1.6;margin:0 0 16px;">Tu opinión ayuda a que otras personas puedan encontrarme. ¿Te tomás 1 minuto para dejar una reseña en Google?</p>
      <div style="text-align:center;">
        <a href="#" class="btn">⭐ Dejar reseña en Google</a>
      </div>
      <p style="font-size:12px;color:#9ca3af;text-align:center;margin-top:12px;">¡Tu reseña hace una gran diferencia! 🙏</p>
    </div>
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
          `💚 ¿Cómo te has sentido, ${shared.clientName.split(" ")[0]}? — ${businessName}`
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
