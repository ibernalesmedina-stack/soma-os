import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";
import { AppLayout } from "@/components/AppLayout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/app/Dashboard";
import Reservas from "./pages/app/Reservas";
import Calendario from "./pages/app/Calendario";
import Clientes from "./pages/app/Clientes";
import ClienteDetalle from "./pages/app/ClienteDetalle";
import Registros from "./pages/app/Registros";
import Pagos from "./pages/app/Pagos";
import Servicios from "./pages/app/Servicios";
import Automatizaciones from "./pages/app/Automatizaciones";
import Analitica from "./pages/app/Analitica";
import Configuracion from "./pages/app/Configuracion";
import Integraciones from "./pages/app/Integraciones";
import GoogleCallback from "./pages/app/GoogleCallback";
import { AdminLayout } from "@/components/AdminLayout";
import AdminLogin from "./pages/admin/Login";
import AdminOverview from "./pages/admin/Overview";
import AdminClientes from "./pages/admin/Clientes";
import AdminClienteDetalle from "./pages/admin/ClienteDetalle";
import AdminFacturacion from "./pages/admin/Facturacion";
import AdminConfiguracion from "./pages/admin/Configuracion";
import AdminFinanzas from "./pages/admin/Finanzas";
import AdminActividad from "./pages/admin/Actividad";
import AdminReportes from "./pages/admin/Reportes";
import AdminIntegraciones from "./pages/admin/Integraciones";
import AdminSitioEditor from "./pages/admin/SitioEditor";
import Sitio from "./pages/Sitio";
import SitioPaulette from "./pages/SitioPaulette";
import Privacidad from "./pages/Privacidad";
import Terminos from "./pages/Terminos";
import Seguridad from "./pages/Seguridad";
import Dpo from "./pages/Dpo";
import ConsentCertificate from "./pages/app/ConsentCertificate";
import EmailPreview from "./pages/app/EmailPreview";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const hostname = window.location.hostname;

// Dominios que pertenecen a la PLATAFORMA SomaOS (nunca son sitios de clientes)
const PLATFORM_DOMAINS = new Set([
  "localhost",
  "somaos.app",
  "www.somaos.app",
  "app.somaos.app",
]);
const isPlatformDomain =
  PLATFORM_DOMAINS.has(hostname) ||
  hostname.includes("vercel.app") ||
  hostname.includes("somaos");

// Si no es dominio de la plataforma → es el sitio personalizado de una clienta
const isCustomDomain = !isPlatformDomain;

// Mapa: dominio personalizado → componente del sitio de la clienta
// Cada clienta con sitio propio se agrega aquí + configura su DNS en Vercel
const DOMAIN_ROUTES: Record<string, React.ReactElement> = {
  "www.elliotnutrition.com": <SitioPaulette />,
  "elliotnutrition.com":     <SitioPaulette />,
  // Próximas clientas:
  // "www.nombrecliente.com": <SitioNombreCliente />,
};

const App = () => {
  if (isCustomDomain) {
    const siteElement = DOMAIN_ROUTES[hostname] ?? <Sitio />;
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="*" element={siteElement} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    );
  }

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/app" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="reservas" element={<Reservas />} />
              <Route path="calendario" element={<Calendario />} />
              <Route path="clientes" element={<Clientes />} />
              <Route path="clientes/:clientKey" element={<ClienteDetalle />} />
              <Route path="registros" element={<Registros />} />
              <Route path="pagos" element={<Pagos />} />
              <Route path="servicios" element={<Servicios />} />
              <Route path="automatizaciones" element={<Automatizaciones />} />
              <Route path="analitica" element={<Analitica />} />
              <Route path="configuracion" element={<Configuracion />} />
              <Route path="integraciones" element={<Integraciones />} />
              <Route path="google-callback" element={<GoogleCallback />} />
              <Route path="consentimiento" element={<ConsentCertificate />} />
              <Route path="email-preview" element={<EmailPreview />} />
            </Route>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminOverview />} />
              <Route path="clientes" element={<AdminClientes />} />
              <Route path="clientes/:id" element={<AdminClienteDetalle />} />
              <Route path="clientas" element={<Navigate to="/admin/clientes" replace />} />
              <Route path="clientas/:id" element={<AdminClienteDetalle />} />
              <Route path="facturacion" element={<AdminFacturacion />} />
              <Route path="configuracion" element={<AdminConfiguracion />} />
              <Route path="finanzas" element={<AdminFinanzas />} />
              <Route path="actividad" element={<AdminActividad />} />
              <Route path="reportes" element={<AdminReportes />} />
              <Route path="integraciones" element={<AdminIntegraciones />} />
              <Route path="sitios" element={<AdminSitioEditor />} />
            </Route>
            <Route path="/s/:userId" element={<Sitio />} />
            <Route path="/privacidad" element={<Privacidad />} />
            <Route path="/terminos" element={<Terminos />} />
            <Route path="/seguridad" element={<Seguridad />} />
            <Route path="/dpo" element={<Dpo />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
