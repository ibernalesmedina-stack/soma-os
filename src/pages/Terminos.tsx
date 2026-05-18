import { Link } from "react-router-dom";
import { Printer } from "lucide-react";

export const TERMS_VERSION = "1.1";
export const TERMS_DATE = "18 de mayo de 2026";

function DocLayout({ title, version, date, children }: { title: string; version: string; date: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <style>{`@media print { .no-print { display: none !important; } body { font-size: 12px; } }`}</style>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-8 flex items-center justify-between no-print">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Volver a SomaOS</Link>
          <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border rounded-md px-3 py-1.5">
            <Printer className="h-3.5 w-3.5" /> Descargar / Imprimir
          </button>
        </div>
        <div className="mb-3 inline-block bg-primary/10 text-primary text-xs font-mono px-2 py-0.5 rounded">v{version}</div>
        <h1 className="text-3xl font-semibold tracking-tight mb-2">{title}</h1>
        <p className="text-sm text-muted-foreground mb-10">Última actualización: {date} · SomaOS SpA · Chile</p>
        <div className="space-y-8 text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

function S({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-semibold mb-3 text-foreground">{n}. {title}</h2>
      <div className="text-muted-foreground space-y-2">{children}</div>
    </section>
  );
}

export default function Terminos() {
  return (
    <DocLayout title="Términos de Servicio" version={TERMS_VERSION} date={TERMS_DATE}>

      <S n="1" title="Definiciones">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-foreground">"SomaOS"</strong>: SomaOS SpA, empresa desarrolladora y operadora de la plataforma somaos.app.</li>
          <li><strong className="text-foreground">"Cliente" / "Profesional"</strong>: persona natural o jurídica que contrata SomaOS para gestionar su negocio (nutricionista, psicóloga, cosmetóloga, odontóloga, u otro profesional de salud o bienestar).</li>
          <li><strong className="text-foreground">"Paciente" / "Usuario final"</strong>: persona cuyos datos el Cliente ingresa en la plataforma como parte de su práctica profesional.</li>
          <li><strong className="text-foreground">"Plataforma"</strong>: el software SomaOS accesible en somaos.app y sus subdominios.</li>
          <li><strong className="text-foreground">"Contenido del Cliente"</strong>: datos, fichas clínicas, reservas, pagos y cualquier información que el Cliente introduce en la plataforma.</li>
        </ul>
      </S>

      <S n="2" title="Objeto del servicio">
        <p>SomaOS provee al Cliente una plataforma SaaS (Software as a Service) para la gestión de su práctica profesional, que incluye: agenda y reservas, ficha de pacientes, gestión de pagos, automatizaciones de comunicación, sitio web público y analítica. El servicio se ofrece bajo suscripción mensual.</p>
      </S>

      <S n="3" title="Aceptación de los términos">
        <p>Al crear una cuenta en SomaOS o usar la plataforma, el Cliente declara haber leído, comprendido y aceptado estos Términos de Servicio, la <Link to="/privacidad" className="text-primary hover:underline">Política de Privacidad</Link> y la Política de Retención de Datos. Si actúa en representación de una organización, declara tener autoridad para obligarla.</p>
      </S>

      <S n="4" title="Cuenta de usuario">
        <ul className="list-disc pl-5 space-y-1">
          <li>El Cliente debe proporcionar información verídica y actualizada.</li>
          <li>El Cliente es responsable de la seguridad de su contraseña y todas las actividades bajo su cuenta.</li>
          <li>Una cuenta corresponde a un negocio individual. La cesión o uso compartido no está permitido sin autorización escrita de SomaOS.</li>
          <li>SomaOS se reserva el derecho de suspender cuentas con información falsa o que infrinjan estos términos.</li>
        </ul>
      </S>

      <S n="5" title="Obligaciones del Cliente respecto a sus pacientes">
        <p><strong className="text-foreground">Esta sección es especialmente relevante para profesionales de salud.</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li>El Cliente es el <strong className="text-foreground">único responsable</strong> de obtener el consentimiento informado de sus pacientes para el almacenamiento digital de sus datos clínicos, conforme a la <strong className="text-foreground">Ley N° 20.584</strong> (Derechos y Deberes de los Pacientes) y la normativa de su colegio profesional.</li>
          <li>El Cliente debe contar con su propia <strong className="text-foreground">política de privacidad</strong> para sus pacientes, compatible con la legislación vigente.</li>
          <li>El Cliente garantiza que los datos de pacientes que introduce en SomaOS han sido recolectados con las autorizaciones legales correspondientes.</li>
          <li>SomaOS actúa como encargado del tratamiento de los datos de pacientes bajo instrucción del Cliente. SomaOS no toma decisiones autónomas sobre esos datos.</li>
          <li><strong className="text-foreground">SomaOS no es responsable</strong> por el incumplimiento del Cliente de sus obligaciones legales respecto a sus pacientes.</li>
        </ul>
      </S>

      <S n="6" title="Planes, precios y pagos">
        <ul className="list-disc pl-5 space-y-1">
          <li>SomaOS ofrece planes de suscripción mensual (Basic, Pro, Premium). Los precios vigentes se publican en somaos.app.</li>
          <li>El pago se realiza mensualmente de forma anticipada. La falta de pago puede resultar en la suspensión del acceso.</li>
          <li>SomaOS puede modificar los precios con 30 días de aviso previo por email.</li>
          <li><strong className="text-foreground">Política de reembolsos:</strong> no se realizan reembolsos por períodos parciales ya iniciados. En caso de fallo técnico imputable a SomaOS durante más de 72 horas consecutivas, el Cliente tiene derecho a un crédito proporcional.</li>
        </ul>
      </S>

      <S n="7" title="Uso aceptable">
        <p>Queda expresamente prohibido:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Usar la plataforma para actividades ilegales, fraudulentas o que infrinjan derechos de terceros.</li>
          <li>Introducir datos de pacientes sin contar con su consentimiento.</li>
          <li>Intentar acceder a cuentas de otros usuarios o sistemas de SomaOS.</li>
          <li>Realizar ingeniería inversa, descompilar o copiar el software.</li>
          <li>Usar SomaOS para enviar comunicaciones no solicitadas (spam).</li>
          <li>Sobrecargar deliberadamente la infraestructura mediante ataques de denegación de servicio.</li>
          <li>Revender o sub-licenciar el acceso a SomaOS sin autorización escrita.</li>
        </ul>
      </S>

      <S n="8" title="Disponibilidad del servicio y SLA">
        <p>SomaOS se compromete a mantener una disponibilidad objetivo del <strong className="text-foreground">99% mensual</strong>, excluyendo mantenimientos programados con aviso previo de 48 horas. <strong className="text-foreground">No garantizamos</strong> un uptime del 100%. Interrupciones causadas por terceros (Supabase, Vercel, Google, operadores de telecomunicaciones) no son imputables a SomaOS.</p>
        <p>Publicamos el estado del servicio en somaos.app/status.</p>
      </S>

      <S n="9" title="Propiedad intelectual y datos del Cliente">
        <ul className="list-disc pl-5 space-y-1">
          <li>SomaOS conserva todos los derechos de propiedad intelectual sobre la plataforma, código, diseño y marca.</li>
          <li>El Cliente conserva la propiedad de todo el Contenido del Cliente (fichas, reservas, pagos, datos de pacientes).</li>
          <li>El Cliente otorga a SomaOS una licencia limitada para procesar el Contenido del Cliente únicamente con el fin de proveer el servicio.</li>
          <li>SomaOS no utilizará el Contenido del Cliente para fines propios distintos a la prestación del servicio.</li>
        </ul>
      </S>

      <S n="10" title="Limitación de responsabilidad">
        <ul className="list-disc pl-5 space-y-1">
          <li>SomaOS no será responsable por <strong className="text-foreground">pérdida de datos</strong> causada por el Usuario, errores de terceros o eventos de fuerza mayor.</li>
          <li>SomaOS no será responsable por daños indirectos, lucro cesante o pérdidas consecuentes.</li>
          <li>La responsabilidad total de SomaOS frente al Cliente estará limitada al <strong className="text-foreground">monto pagado en los últimos 3 meses</strong> de suscripción.</li>
          <li>SomaOS no asume responsabilidad por el contenido de las comunicaciones enviadas por el Cliente a sus pacientes a través de la plataforma.</li>
          <li>SomaOS no es responsable por el cumplimiento regulatorio del Cliente en el ejercicio de su profesión.</li>
        </ul>
      </S>

      <S n="11" title="Cancelación y retención de datos">
        <ul className="list-disc pl-5 space-y-1">
          <li>El Cliente puede cancelar su suscripción en cualquier momento desde Configuración.</li>
          <li>Tras la cancelación, la cuenta permanece activa hasta el fin del período pagado.</li>
          <li>Tras el vencimiento, los datos se conservan por <strong className="text-foreground">30 días calendario</strong> en modo de solo lectura para recuperación.</li>
          <li>Transcurridos los 30 días, todos los datos personales y clínicos serán eliminados de forma permanente e irreversible.</li>
          <li>Los registros contables anonimizados se conservan 6 años conforme a la ley chilena.</li>
          <li>SomaOS puede cancelar cuentas que infrinjan estos términos con 48 horas de aviso, o de inmediato ante violaciones graves.</li>
        </ul>
      </S>

      <S n="12" title="Integraciones con terceros">
        <p>Al activar integraciones (Google Calendar, WhatsApp, Transbank/WebPay, Resend), el Cliente acepta también los términos y políticas de esos servicios. SomaOS actúa como intermediario técnico y no es responsable por el funcionamiento o cambios en servicios de terceros.</p>
      </S>

      <S n="13" title="Modificaciones a los términos">
        <p>SomaOS puede actualizar estos Términos. Notificaremos cambios significativos por email con al menos <strong className="text-foreground">15 días de anticipación</strong>. El uso continuado de la plataforma tras la fecha de vigencia de los nuevos términos implica su aceptación. Si el Cliente no acepta los nuevos términos, puede cancelar su cuenta antes de la fecha de vigencia.</p>
      </S>

      <S n="14" title="Ley aplicable y jurisdicción">
        <p>Estos Términos se rigen exclusivamente por las leyes de la <strong className="text-foreground">República de Chile</strong>. Cualquier controversia que no pueda resolverse amistosamente será sometida a la jurisdicción de los tribunales ordinarios de justicia de <strong className="text-foreground">Santiago de Chile</strong>, renunciando expresamente a cualquier otro fuero.</p>
      </S>

      <S n="15" title="Contacto">
        <ul className="list-disc pl-5 space-y-1">
          <li>Consultas generales: <a href="mailto:hola@somaos.app" className="text-primary hover:underline">hola@somaos.app</a></li>
          <li>Privacidad y datos: <a href="mailto:privacidad@somaos.app" className="text-primary hover:underline">privacidad@somaos.app</a></li>
          <li>DPO / Solicitudes de datos: <Link to="/dpo" className="text-primary hover:underline">somaos.app/dpo</Link></li>
        </ul>
      </S>

    </DocLayout>
  );
}
