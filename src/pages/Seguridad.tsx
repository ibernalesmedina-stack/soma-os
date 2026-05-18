import { Link } from "react-router-dom";
import { Printer, ShieldCheck, Lock, Server, Eye, Clock } from "lucide-react";

export default function Seguridad() {
  return (
    <div className="min-h-screen bg-background">
      <style>{`@media print { .no-print { display: none !important; } }`}</style>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-8 flex items-center justify-between no-print">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Volver a SomaOS</Link>
          <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border rounded-md px-3 py-1.5">
            <Printer className="h-3.5 w-3.5" /> Imprimir
          </button>
        </div>

        <h1 className="text-3xl font-semibold tracking-tight mb-2">Aviso de Seguridad</h1>
        <p className="text-sm text-muted-foreground mb-10">Última actualización: 18 de mayo de 2026 · SomaOS SpA</p>

        <div className="space-y-8 text-sm leading-relaxed">

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Lock, title: "Cifrado en tránsito", desc: "TLS 1.3 en todas las comunicaciones. No existen endpoints HTTP sin cifrar." },
              { icon: ShieldCheck, title: "Cifrado en reposo", desc: "AES-256 gestionado por AWS/Supabase. Tokens de integraciones adicionalm. cifrados a nivel de aplicación." },
              { icon: Server, title: "Aislamiento de datos", desc: "Row Level Security (RLS) en PostgreSQL. Cada cuenta solo puede acceder a sus propios datos — verificado a nivel de base de datos." },
              { icon: Eye, title: "Control de acceso", desc: "Autenticación JWT firmada. Mínimo privilegio. Solo personal autorizado de SomaOS con acceso administrativo." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border p-4 space-y-2">
                <div className="flex items-center gap-2"><Icon className="h-4 w-4 text-primary" /><span className="font-semibold text-sm">{title}</span></div>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>

          <section>
            <h2 className="text-base font-semibold mb-3">Infraestructura y ubicación de datos</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">Base de datos:</strong> Supabase (PostgreSQL 15) en AWS us-east-1 (Virginia, EE.UU.).</li>
              <li><strong className="text-foreground">Almacenamiento de archivos:</strong> Supabase Storage (S3-compatible) en AWS us-east-1.</li>
              <li><strong className="text-foreground">Funciones serverless / API:</strong> Vercel Edge Network — desplegado globalmente con nodos en Chile y EE.UU.</li>
              <li><strong className="text-foreground">Backups:</strong> copias de seguridad automáticas diarias retenidas por 7 días (Supabase Pro). Pruebas de restauración mensuales.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3">Quién tiene acceso a tus datos</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">Tú (el Cliente):</strong> acceso completo a tus datos y los de tus pacientes, solo a través de tu cuenta autenticada.</li>
              <li><strong className="text-foreground">Equipo SomaOS:</strong> acceso de solo lectura a registros técnicos para soporte. Nunca accedemos a fichas clínicas sin solicitud expresa del Cliente. Todo acceso queda registrado en logs de auditoría.</li>
              <li><strong className="text-foreground">Infraestructura (Supabase/AWS):</strong> acceso físico a almacenamiento cifrado. No pueden leer datos sin clave de cifrado.</li>
              <li><strong className="text-foreground">Nadie más.</strong> No compartimos datos con terceros salvo los encargados del tratamiento listados en la <Link to="/privacidad" className="text-primary hover:underline">Política de Privacidad</Link>.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3">Autenticación y contraseñas</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>Contraseñas almacenadas con hash bcrypt (factor 10). Nunca almacenamos contraseñas en texto plano.</li>
              <li>Sesiones gestionadas con JWT firmados con clave RS256 rotada periódicamente.</li>
              <li>Tokens de sesión con expiración automática y renovación segura.</li>
              <li>Restablecimiento de contraseña mediante email con enlace de un solo uso (TTL: 1 hora).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3">Auditoría de accesos</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>Registramos todos los eventos de acceso administrativo con timestamp, IP y usuario responsable.</li>
              <li>Los logs se conservan durante <strong className="text-foreground">90 días</strong>.</li>
              <li>El consentimiento de registro (fecha, IP, versión de términos) queda registrado permanentemente como evidencia legal.</li>
              <li>Las operaciones de borrado de datos de pacientes generan registro inmutable en el sistema de auditoría.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3">Notificación de brechas de seguridad</h2>
            <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/5 p-4">
              <Clock className="h-4 w-4 text-warning mt-0.5 shrink-0" />
              <div className="text-muted-foreground text-xs space-y-1">
                <p>En caso de brecha de seguridad que afecte datos personales:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Notificaremos a los Clientes afectados en un plazo máximo de <strong className="text-foreground">72 horas</strong> desde la detección.</li>
                  <li>La notificación incluirá: naturaleza de la brecha, categorías de datos afectados, medidas tomadas y pasos recomendados.</li>
                  <li>En caso de que la brecha afecte datos sensibles de salud, notificaremos también a las autoridades competentes chilenas conforme a la Ley 19.628 y normativa aplicable.</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3">Reporte de vulnerabilidades</h2>
            <p className="text-muted-foreground">Si descubres una vulnerabilidad de seguridad en SomaOS, repórtala responsablemente a <a href="mailto:seguridad@somaos.app" className="text-primary hover:underline">seguridad@somaos.app</a>. Nos comprometemos a responder en 48 horas y a no tomar acciones legales contra investigadores de buena fe.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-3">Recomendaciones para el Cliente</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>Usa una contraseña única y fuerte para tu cuenta SomaOS (mínimo 12 caracteres).</li>
              <li>No compartas tu contraseña ni tu sesión con terceros.</li>
              <li>Cierra sesión en dispositivos compartidos.</li>
              <li>Mantén actualizado el dispositivo y navegador que usas para acceder a SomaOS.</li>
              <li>Reporta cualquier actividad sospechosa en tu cuenta a <a href="mailto:hola@somaos.app" className="text-primary hover:underline">hola@somaos.app</a>.</li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  );
}
