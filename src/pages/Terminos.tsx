export default function Terminos() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-8">
          <a href="/" className="text-sm text-muted-foreground hover:text-foreground">← Volver a SomaOS</a>
        </div>

        <h1 className="text-3xl font-semibold tracking-tight mb-2">Términos de Servicio</h1>
        <p className="text-sm text-muted-foreground mb-10">Última actualización: Mayo 2026</p>

        <div className="space-y-8 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold mb-3">1. Aceptación de los términos</h2>
            <p className="text-muted-foreground">
              Al crear una cuenta en SomaOS y usar nuestros servicios, aceptas estos Términos de Servicio. Si no estás de acuerdo, no utilices la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">2. Descripción del servicio</h2>
            <p className="text-muted-foreground">
              SomaOS es una plataforma de gestión para profesionales de salud y bienestar que incluye: gestión de reservas, clientes, pagos, automatizaciones y sitio web público. El servicio se ofrece como SaaS (Software as a Service).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">3. Cuenta de usuario</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>Debes proporcionar información verdadera al registrarte.</li>
              <li>Eres responsable de mantener la seguridad de tu contraseña.</li>
              <li>Una cuenta es para uso de un negocio individual. No puedes compartirla.</li>
              <li>El acceso requiere un código de invitación válido.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">4. Planes y pagos</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>SomaOS ofrece planes de suscripción mensual (Basic, Pro, Premium).</li>
              <li>Los pagos se procesan de forma segura a través de los métodos habilitados.</li>
              <li>Puedes cancelar tu suscripción en cualquier momento.</li>
              <li>No realizamos reembolsos por períodos parciales.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">5. Uso aceptable</h2>
            <p className="text-muted-foreground mb-2">Queda prohibido:</p>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>Usar la plataforma para actividades ilegales.</li>
              <li>Intentar acceder a cuentas de otros usuarios.</li>
              <li>Realizar ingeniería inversa o copiar el software.</li>
              <li>Usar SomaOS para enviar spam o comunicaciones no solicitadas.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">6. Datos e integraciones</h2>
            <p className="text-muted-foreground">
              Eres propietario de los datos que ingresas en SomaOS (clientes, reservas, pagos). Al conectar integraciones de terceros (Google Calendar, WhatsApp, WebPay), aceptas también los términos de esos servicios. SomaOS actúa como intermediario técnico.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">7. Disponibilidad del servicio</h2>
            <p className="text-muted-foreground">
              Nos esforzamos por mantener SomaOS disponible 24/7, pero no garantizamos un uptime del 100%. Podemos realizar mantenimientos programados con aviso previo.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">8. Limitación de responsabilidad</h2>
            <p className="text-muted-foreground">
              SomaOS no es responsable por pérdidas de datos causadas por el usuario, interrupciones de servicios de terceros (Google, WhatsApp, etc.) o eventos fuera de nuestro control.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">9. Cancelación</h2>
            <p className="text-muted-foreground">
              Puedes cancelar tu cuenta en cualquier momento desde Configuración. Nos reservamos el derecho de suspender cuentas que violen estos términos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">10. Modificaciones</h2>
            <p className="text-muted-foreground">
              Podemos actualizar estos términos. Te notificaremos por email ante cambios significativos. El uso continuado de SomaOS implica aceptación de los nuevos términos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">11. Ley aplicable</h2>
            <p className="text-muted-foreground">
              Estos términos se rigen por las leyes de Chile. Cualquier disputa se resolverá en los tribunales competentes de Santiago de Chile.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">12. Contacto</h2>
            <p className="text-muted-foreground">
              Para consultas sobre estos términos: <a href="mailto:hola@somaos.app" className="text-primary hover:underline">hola@somaos.app</a>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
