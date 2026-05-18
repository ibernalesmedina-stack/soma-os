import { useState } from "react";
import { Link } from "react-router-dom";
import { Printer } from "lucide-react";

export const PRIVACY_VERSION = "1.1";
export const PRIVACY_DATE = "18 de mayo de 2026";

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

export default function Privacidad() {
  return (
    <DocLayout title="Política de Privacidad" version={PRIVACY_VERSION} date={PRIVACY_DATE}>

      <S n="1" title="Identificación del responsable del tratamiento">
        <p><strong className="text-foreground">SomaOS SpA</strong> (en adelante "SomaOS", "nosotros") es responsable del tratamiento de los datos personales recopilados a través de la plataforma somaos.app. Domicilio: Chile. Contacto del Delegado de Protección de Datos (DPO): <a href="mailto:privacidad@somaos.app" className="text-primary hover:underline">privacidad@somaos.app</a></p>
        <p>Esta política se rige por la <strong className="text-foreground">Ley N° 19.628</strong> sobre Protección de la Vida Privada (Chile), la <strong className="text-foreground">Ley N° 20.584</strong> sobre Derechos y Deberes de los Pacientes, y el <strong className="text-foreground">Reglamento General de Protección de Datos (GDPR)</strong> de la UE en la medida que aplique.</p>
      </S>

      <S n="2" title="Categorías de datos que recolectamos">
        <p>Recopilamos los siguientes datos según el tipo de usuario:</p>
        <p><strong className="text-foreground">Profesionales de salud (Clientes de SomaOS):</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Datos de identidad: nombre completo, nombre del negocio.</li>
          <li>Datos de contacto: email, teléfono.</li>
          <li>Datos de autenticación: contraseña cifrada (bcrypt), tokens de sesión.</li>
          <li>Datos de integración: token cifrado de Google Calendar, número WhatsApp, credenciales Resend.</li>
          <li>Datos de facturación: código de comercio Transbank (no almacenamos datos de tarjetas).</li>
          <li>Datos de uso: logs técnicos, horario de acceso, dirección IP.</li>
          <li>Consentimiento: fecha/hora de aceptación de términos, IP de registro, versión de términos aceptada.</li>
        </ul>
        <p><strong className="text-foreground">Pacientes / Usuarios finales (datos ingresados por el profesional):</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Datos de identidad y contacto: nombre, email, teléfono, fecha de nacimiento, ocupación, dirección.</li>
          <li>Datos de salud (categoría especial): ficha clínica, diagnóstico, medicación, antecedentes, progreso, notas de sesión.</li>
          <li>Registros de reservas y pagos asociados.</li>
        </ul>
        <p>⚠️ <strong className="text-foreground">Datos de salud:</strong> Los datos clínicos de pacientes son datos sensibles de categoría especial. Su tratamiento se realiza exclusivamente bajo responsabilidad del profesional de salud (Cliente de SomaOS), quien es el responsable directo del tratamiento frente a sus pacientes conforme a la Ley 20.584.</p>
      </S>

      <S n="3" title="Base legal para el tratamiento">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-foreground">Ejecución de contrato:</strong> tratamiento necesario para proveer el servicio SomaOS al profesional (Art. 4 Ley 19.628).</li>
          <li><strong className="text-foreground">Consentimiento:</strong> datos de integraciones opcionales (Google Calendar, WhatsApp) y comunicaciones de marketing.</li>
          <li><strong className="text-foreground">Interés legítimo:</strong> seguridad de la plataforma, prevención de fraude, mejora del servicio.</li>
          <li><strong className="text-foreground">Obligación legal:</strong> registros contables y transacciones (Ley 18.010, SII).</li>
          <li><strong className="text-foreground">Datos de pacientes:</strong> el profesional actúa como responsable primario del tratamiento; SomaOS es encargado del tratamiento según acuerdo de servicio.</li>
        </ul>
      </S>

      <S n="4" title="Finalidad del tratamiento">
        <ul className="list-disc pl-5 space-y-1">
          <li>Proveer y mejorar los servicios de SomaOS.</li>
          <li>Autenticar usuarios y mantener la seguridad de las cuentas.</li>
          <li>Sincronizar reservas con Google Calendar (solo si el usuario autoriza la integración).</li>
          <li>Enviar notificaciones de reservas y recordatorios a pacientes (solo si el profesional activa esta función).</li>
          <li>Procesar pagos a través de Transbank/WebPay.</li>
          <li>Cumplir obligaciones legales y contables.</li>
          <li>Responder consultas de soporte técnico.</li>
        </ul>
        <p><strong className="text-foreground">No vendemos</strong> datos personales a terceros. <strong className="text-foreground">No usamos</strong> datos de pacientes para fines propios de SomaOS.</p>
      </S>

      <S n="5" title="Terceros y encargados del tratamiento">
        <p>SomaOS utiliza los siguientes proveedores como encargados del tratamiento:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-foreground">Supabase Inc.</strong> (EE.UU.) — base de datos, autenticación y almacenamiento de archivos. Infraestructura en AWS us-east-1. <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Política de privacidad</a></li>
          <li><strong className="text-foreground">Vercel Inc.</strong> (EE.UU.) — hosting y funciones serverless. <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Política de privacidad</a></li>
          <li><strong className="text-foreground">Transbank S.A.</strong> (Chile) — procesamiento de pagos WebPay. Sujeto a regulación del Banco Central de Chile.</li>
          <li><strong className="text-foreground">Resend Inc.</strong> (EE.UU.) — envío de emails transaccionales. Solo recibe email del destinatario y contenido del mensaje. <a href="https://resend.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Política de privacidad</a></li>
          <li><strong className="text-foreground">Google LLC</strong> (EE.UU.) — integración Google Calendar. Solo si el usuario activa esta integración. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Política de privacidad de Google</a></li>
        </ul>
        <p>Todos los proveedores están sujetos a acuerdos de tratamiento de datos (DPA) y mantienen certificaciones de seguridad (SOC 2, ISO 27001).</p>
        <p><strong className="text-foreground">Transferencias internacionales:</strong> Algunos proveedores operan en EE.UU. Las transferencias se realizan bajo mecanismos adecuados (Cláusulas Contractuales Estándar de la UE, Privacy Shield Framework o equivalente).</p>
      </S>

      <S n="6" title="Google Calendar — política de uso limitado">
        <p>El uso de SomaOS de la información recibida de las APIs de Google cumple la <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Política de Datos de Usuario de los Servicios API de Google</a>, incluidos los requisitos de uso limitado.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Solo leemos y escribimos eventos del calendario directamente relacionados con reservas de SomaOS.</li>
          <li>No accedemos a Gmail, Drive, Contactos ni ningún otro dato de Google.</li>
          <li>Los tokens OAuth se almacenan cifrados y nunca se comparten con terceros.</li>
          <li>Puedes revocar el acceso en <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">myaccount.google.com/permissions</a> o desde Integraciones en SomaOS.</li>
        </ul>
      </S>

      <S n="7" title="Seguridad y protección de datos">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-foreground">Cifrado en tránsito:</strong> TLS 1.3 en todas las comunicaciones.</li>
          <li><strong className="text-foreground">Cifrado en reposo:</strong> AES-256 gestionado por Supabase/AWS.</li>
          <li><strong className="text-foreground">Control de acceso:</strong> Row Level Security (RLS) de PostgreSQL — cada profesional solo puede acceder a sus propios datos.</li>
          <li><strong className="text-foreground">Autenticación:</strong> contraseñas cifradas con bcrypt, sesiones con JWT firmados.</li>
          <li><strong className="text-foreground">Acceso al sistema:</strong> solo personal autorizado de SomaOS y los propios Clientes tienen acceso a los datos.</li>
          <li><strong className="text-foreground">Backups:</strong> copias de seguridad diarias automatizadas (Supabase Pro).</li>
        </ul>
        <p>Para más detalles visita nuestra <Link to="/seguridad" className="text-primary hover:underline">Política de Seguridad</Link>.</p>
      </S>

      <S n="8" title="Retención de datos">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-foreground">Cuenta activa:</strong> los datos se conservan mientras la cuenta esté activa.</li>
          <li><strong className="text-foreground">Tras cancelación:</strong> 30 días calendario para recuperación. Transcurrido ese plazo, los datos personales y clínicos se eliminan definitivamente.</li>
          <li><strong className="text-foreground">Registros contables:</strong> conservamos los registros de transacciones anonimizados durante 6 años conforme a la legislación tributaria chilena (Ley 18.010, Código Tributario Art. 200).</li>
          <li><strong className="text-foreground">Logs técnicos:</strong> máximo 90 días.</li>
          <li><strong className="text-foreground">Registros de consentimiento:</strong> conservados durante toda la relación contractual más 3 años como evidencia legal.</li>
        </ul>
      </S>

      <S n="9" title="Derechos del titular de los datos">
        <p>De acuerdo con la Ley 19.628 y el GDPR (en lo aplicable), tienes derecho a:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-foreground">Acceso:</strong> conocer qué datos personales tenemos sobre ti.</li>
          <li><strong className="text-foreground">Rectificación:</strong> corregir datos inexactos o incompletos.</li>
          <li><strong className="text-foreground">Cancelación / Olvido:</strong> solicitar la eliminación de tus datos. Puedes hacerlo directamente desde tu cuenta o via <Link to="/dpo" className="text-primary hover:underline">formulario de solicitud</Link>.</li>
          <li><strong className="text-foreground">Portabilidad:</strong> exportar tus datos en formato JSON o CSV desde la plataforma.</li>
          <li><strong className="text-foreground">Oposición:</strong> oponerte al tratamiento para fines de marketing directo.</li>
          <li><strong className="text-foreground">Limitación:</strong> solicitar la restricción del tratamiento en determinadas circunstancias.</li>
        </ul>
        <p>Para ejercer estos derechos: <Link to="/dpo" className="text-primary hover:underline">formulario DPO</Link> o email a <a href="mailto:privacidad@somaos.app" className="text-primary hover:underline">privacidad@somaos.app</a>. Respondemos en un plazo máximo de <strong className="text-foreground">30 días hábiles</strong>.</p>
        <p>Si eres residente en la UE y consideras que el tratamiento vulnera el GDPR, puedes presentar una reclamación ante la autoridad supervisora de tu país.</p>
      </S>

      <S n="10" title="Datos de salud y responsabilidad del profesional">
        <p>SomaOS almacena datos clínicos de pacientes que el profesional de salud introduce en la plataforma. En este contexto:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>El <strong className="text-foreground">profesional de salud (Cliente de SomaOS) es el responsable primario del tratamiento</strong> de los datos de sus pacientes conforme a la Ley 20.584.</li>
          <li>SomaOS actúa como <strong className="text-foreground">encargado del tratamiento</strong> (procesador de datos) bajo instrucción del profesional.</li>
          <li>El profesional es responsable de obtener el consentimiento informado de sus pacientes para el almacenamiento digital de sus fichas clínicas.</li>
          <li>El profesional debe contar con su propia política de privacidad para sus pacientes.</li>
        </ul>
      </S>

      <S n="11" title="Cookies y tecnologías de seguimiento">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-foreground">Cookies de sesión (estrictamente necesarias):</strong> usadas para mantener la sesión autenticada. No requieren consentimiento.</li>
          <li><strong className="text-foreground">localStorage:</strong> preferencias de interfaz (sidebar colapsado, banner descartado).</li>
          <li><strong className="text-foreground">Sin cookies de rastreo:</strong> no usamos Google Analytics, Facebook Pixel ni tecnologías publicitarias.</li>
        </ul>
      </S>

      <S n="12" title="Menores de edad">
        <p>SomaOS no está dirigido a menores de 18 años. No recopilamos intencionalmente datos de menores. Si detectamos que un menor ha creado una cuenta, la eliminaremos.</p>
      </S>

      <S n="13" title="Cambios a esta política">
        <p>Podemos actualizar esta política. Ante cambios significativos, notificaremos por email con al menos 15 días de anticipación. El uso continuado de SomaOS tras la fecha de vigencia implica aceptación de la nueva versión.</p>
      </S>

      <S n="14" title="Contacto y Delegado de Protección de Datos (DPO)">
        <p>Para cualquier consulta sobre privacidad, ejercicio de derechos o notificación de incidentes:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Email DPO: <a href="mailto:privacidad@somaos.app" className="text-primary hover:underline">privacidad@somaos.app</a></li>
          <li>Formulario: <Link to="/dpo" className="text-primary hover:underline">somaos.app/dpo</Link></li>
          <li>Tiempo de respuesta máximo: 30 días hábiles.</li>
        </ul>
      </S>

    </DocLayout>
  );
}
