export default function Privacidad() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-8">
          <a href="/" className="text-sm text-muted-foreground hover:text-foreground">← Volver a SomaOS</a>
        </div>

        <h1 className="text-3xl font-semibold tracking-tight mb-2">Política de Privacidad</h1>
        <p className="text-sm text-muted-foreground mb-10">Última actualización: Mayo 2026</p>

        <div className="prose prose-sm max-w-none space-y-8 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold mb-3">1. Quiénes somos</h2>
            <p className="text-muted-foreground">
              SomaOS es una plataforma de gestión de negocios para profesionales de la salud y bienestar (nutricionistas, cosmetólogas, odontólogas, psicólogas). Operamos en Chile y nos comprometemos a proteger la privacidad de nuestros usuarios.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">2. Información que recopilamos</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">Datos de cuenta:</strong> nombre, email, nombre del negocio, teléfono.</li>
              <li><strong className="text-foreground">Datos de negocio:</strong> reservas, clientes, pagos y servicios que registras en la plataforma.</li>
              <li><strong className="text-foreground">Google Calendar:</strong> si conectas tu Google Calendar, almacenamos un token de acceso cifrado para sincronizar tus reservas. Solo accedemos a los eventos de tu calendario para crear, actualizar o eliminar eventos relacionados con SomaOS.</li>
              <li><strong className="text-foreground">Datos de uso:</strong> logs técnicos para mantener el funcionamiento del servicio.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">3. Cómo usamos tu información</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>Proveer y mejorar los servicios de SomaOS.</li>
              <li>Sincronizar reservas con Google Calendar (solo si autorizas la integración).</li>
              <li>Enviar notificaciones relacionadas con tu cuenta.</li>
              <li>Cumplir obligaciones legales.</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              <strong className="text-foreground">No vendemos ni compartimos</strong> tu información personal con terceros con fines comerciales.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">4. Google Calendar — uso de datos</h2>
            <p className="text-muted-foreground">
              El uso que SomaOS hace de la información recibida de las APIs de Google se ajusta a la{" "}
              <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Política de datos de usuario de los servicios de la API de Google
              </a>
              , incluidos los requisitos de uso limitado.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground mt-3">
              <li>Solo leemos y escribimos eventos del calendario relacionados con reservas creadas en SomaOS.</li>
              <li>No accedemos a otros datos de Google (Gmail, Drive, contactos, etc.).</li>
              <li>Los tokens de Google se almacenan cifrados en nuestra base de datos.</li>
              <li>Puedes revocar el acceso en cualquier momento desde <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">myaccount.google.com/permissions</a> o desde el Calendario en SomaOS.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">5. Almacenamiento y seguridad</h2>
            <p className="text-muted-foreground">
              Tus datos se almacenan en Supabase (infraestructura PostgreSQL en AWS). Los tokens de integraciones (Google, WhatsApp, WebPay) se guardan cifrados. Utilizamos HTTPS para todas las comunicaciones.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">6. Retención de datos</h2>
            <p className="text-muted-foreground">
              Conservamos tus datos mientras tu cuenta esté activa. Al eliminar tu cuenta, eliminamos tus datos personales en un plazo de 30 días, salvo obligación legal de conservarlos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">7. Tus derechos</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>Acceder a tus datos personales.</li>
              <li>Corregir información incorrecta.</li>
              <li>Solicitar la eliminación de tu cuenta y datos.</li>
              <li>Exportar tus datos en formato CSV.</li>
            </ul>
            <p className="text-muted-foreground mt-3">Para ejercer estos derechos escríbenos a <a href="mailto:hola@somaos.app" className="text-primary hover:underline">hola@somaos.app</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">8. Cookies</h2>
            <p className="text-muted-foreground">
              Usamos cookies de sesión estrictamente necesarias para el funcionamiento de la plataforma. No utilizamos cookies de rastreo ni publicidad.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">9. Contacto</h2>
            <p className="text-muted-foreground">
              Para consultas sobre privacidad: <a href="mailto:hola@somaos.app" className="text-primary hover:underline">hola@somaos.app</a>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
