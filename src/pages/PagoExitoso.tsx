import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

export default function PagoExitoso() {
  const [status, setStatus] = useState<"loading" | "success" | "pending" | "error">("loading");
  const [booking, setBooking] = useState<{ name: string; serviceName: string; date: string; hour: string; amount: number } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const collectionStatus = params.get("collection_status") ?? params.get("status");
    const externalRef = params.get("external_reference");

    if (!collectionStatus || !externalRef) {
      setStatus("error");
      return;
    }

    if (collectionStatus === "approved") {
      try {
        const data = JSON.parse(externalRef);
        setBooking(data);

        // Create booking automatically
        fetch("/api/booking/slots", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name,
            rut: data.rut,
            email: data.email,
            phone: data.phone,
            date: data.date,
            hour: data.hour,
            esControl: data.esControl,
            serviceName: data.serviceName,
            amount: data.amount,
            modo: data.modo,
          }),
        }).catch(console.error);

        setStatus("success");
      } catch {
        setStatus("error");
      }
    } else if (collectionStatus === "pending" || collectionStatus === "in_process") {
      setStatus("pending");
    } else {
      setStatus("error");
    }
  }, []);

  const formatCLP = (n: number) => "$" + n.toLocaleString("es-CL");

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "oklch(0.97 0.02 90)",
      fontFamily: "'Roboto', system-ui, sans-serif",
      padding: "24px",
    }}>
      <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>

        {status === "loading" && (
          <div>
            <div style={{ width: 56, height: 56, borderRadius: "50%", border: "4px solid oklch(0.75 0.12 85)", borderTopColor: "transparent", margin: "0 auto 24px", animation: "spin 1s linear infinite" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            <p style={{ color: "oklch(0.28 0.06 165)", fontSize: 16 }}>Confirmando tu pago…</p>
          </div>
        )}

        {status === "success" && (
          <div>
            <CheckCircle2 style={{ width: 72, height: 72, color: "#16a34a", margin: "0 auto 20px" }} />
            <h1 style={{ fontFamily: "'Barlow', sans-serif", fontSize: 32, fontWeight: 700, color: "oklch(0.28 0.06 165)", margin: "0 0 8px" }}>
              ¡Pago confirmado!
            </h1>
            <p style={{ color: "oklch(0.45 0.03 165)", fontSize: 15, margin: "0 0 24px" }}>
              Tu reserva quedó registrada. Te enviamos un email con los detalles.
            </p>

            {booking && (
              <div style={{ background: "#fff", border: "1px solid oklch(0.88 0.02 90)", borderRadius: 16, padding: "20px 24px", marginBottom: 24, textAlign: "left" }}>
                <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.2em", color: "oklch(0.45 0.10 165)", fontWeight: 600, margin: "0 0 12px" }}>Tu reserva</p>
                {[
                  ["Paciente", booking.name],
                  ["Plan", booking.serviceName],
                  ["Fecha", booking.date],
                  ["Hora", booking.hour],
                  ["Total pagado", formatCLP(booking.amount) + " CLP"],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid oklch(0.88 0.02 90)", fontSize: 14 }}>
                    <span style={{ color: "oklch(0.45 0.03 165)" }}>{label}</span>
                    <span style={{ fontWeight: 600, color: "oklch(0.28 0.06 165)" }}>{value}</span>
                  </div>
                ))}
              </div>
            )}

            <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "oklch(0.28 0.06 165)", color: "#fff", padding: "12px 28px", borderRadius: 99, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
              Volver al inicio
            </a>
          </div>
        )}

        {status === "pending" && (
          <div>
            <Clock style={{ width: 72, height: 72, color: "oklch(0.75 0.12 85)", margin: "0 auto 20px" }} />
            <h1 style={{ fontFamily: "'Barlow', sans-serif", fontSize: 28, fontWeight: 700, color: "oklch(0.28 0.06 165)", margin: "0 0 8px" }}>
              Pago en proceso
            </h1>
            <p style={{ color: "oklch(0.45 0.03 165)", fontSize: 15, margin: "0 0 24px" }}>
              Tu pago está siendo procesado. Recibirás un email cuando se confirme.
            </p>
            <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "oklch(0.75 0.12 85)", color: "oklch(0.28 0.06 165)", padding: "12px 28px", borderRadius: 99, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
              Volver al inicio
            </a>
          </div>
        )}

        {status === "error" && (
          <div>
            <XCircle style={{ width: 72, height: 72, color: "#dc2626", margin: "0 auto 20px" }} />
            <h1 style={{ fontFamily: "'Barlow', sans-serif", fontSize: 28, fontWeight: 700, color: "oklch(0.28 0.06 165)", margin: "0 0 8px" }}>
              Pago no completado
            </h1>
            <p style={{ color: "oklch(0.45 0.03 165)", fontSize: 15, margin: "0 0 24px" }}>
              El pago no fue procesado. Puedes intentarlo de nuevo.
            </p>
            <a href="/#agenda" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "oklch(0.28 0.06 165)", color: "#fff", padding: "12px 28px", borderRadius: 99, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
              Intentar de nuevo
            </a>
          </div>
        )}

        <p style={{ marginTop: 32, fontSize: 12, color: "oklch(0.45 0.03 165)" }}>
          ¿Tienes dudas? <a href="https://wa.me/56942156610" style={{ color: "oklch(0.45 0.10 165)" }}>Escríbenos por WhatsApp</a>
        </p>
      </div>
    </div>
  );
}
