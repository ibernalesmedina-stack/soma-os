import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";
import { AppLayout } from "@/components/AppLayout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
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
import Privacidad from "./pages/Privacidad";
import Terminos from "./pages/Terminos";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
